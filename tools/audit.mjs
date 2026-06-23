// Full-site visual auditor. Loads EVERY built page in a real browser and
// runs programmatic checks for the bug classes we care about:
//   1. invisible/low-contrast text (computed colour vs computed background)
//   2. horizontal overflow / edge bleed (element wider than viewport)
//   3. missing/zero-size logo (the nav wordmark must render)
//   4. tokens.css actually loaded (design system present)
//   5. console errors / failed requests
// Outputs a JSON report + a per-page PASS/FAIL line. Exit 1 if any FAIL.
import { chromium } from "playwright";
import http from "node:http";
import { readFile, readdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname, join, relative } from "node:path";

const SITE = new URL("../_site/", import.meta.url).pathname;
const TYPES = { ".html":"text/html",".css":"text/css",".js":"text/javascript",".svg":"image/svg+xml",".png":"image/png",".ico":"image/x-icon",".woff2":"font/woff2",".woff":"font/woff",".json":"application/json",".webmanifest":"application/json",".xml":"application/xml",".txt":"text/plain" };

const server = http.createServer(async (req,res)=>{
  try{ let p=decodeURIComponent(req.url.split("?")[0]); if(p.endsWith("/"))p+="index.html";
    let f=join(SITE,p); if(!existsSync(f)&&existsSync(f+".html"))f+=".html";
    const b=await readFile(f); res.writeHead(200,{"content-type":TYPES[extname(f)]||"application/octet-stream"}); res.end(b);
  }catch{res.writeHead(404);res.end("404");}
});
await new Promise(r=>server.listen(4323,r));
const base="http://localhost:4323";

// collect all html files under _site
async function walk(dir){ let out=[]; for(const e of await readdir(dir,{withFileTypes:true})){ const p=join(dir,e.name);
  if(e.isDirectory()) out=out.concat(await walk(p)); else if(e.name.endsWith(".html")) out.push(p);} return out; }
let files;
if (process.env.AUDIT_LIST && existsSync(process.env.AUDIT_LIST)) {
  files = (await readFile(process.env.AUDIT_LIST,"utf8")).split("\n").map(s=>s.trim()).filter(Boolean);
} else {
  files = (await walk(SITE)).map(f=>"/"+relative(SITE,f)).sort();
}
// skip redirect stubs (meta-refresh, intentionally bare)
files = files.filter(u=>!/\/(contact|custom|dpa)\.html$/.test(u));

// relative luminance + contrast (WCAG)
function lum(r,g,b){const c=[r,g,b].map(v=>{v/=255;return v<=0.03928?v/12.92:((v+0.055)/1.055)**2.4;});return 0.2126*c[0]+0.7152*c[1]+0.0722*c[2];}
function contrast(a,b){const l1=lum(...a),l2=lum(...b);const hi=Math.max(l1,l2),lo=Math.min(l1,l2);return (hi+0.05)/(lo+0.05);}

const browser = await chromium.launch();
const report = [];
let failCount = 0;

for (const url of files) {
  const ctx = await browser.newContext({ viewport:{width:1440,height:1000}, deviceScaleFactor:1 });
  const page = await ctx.newPage();
  const consoleErrors=[]; const failedReqs=[];
  page.on("console",m=>{ if(m.type()==="error") consoleErrors.push(m.text().slice(0,200)); });
  page.on("requestfailed",r=>{ const u=r.url(); if(!u.includes("fonts.gstatic")&&!u.includes("clarity")&&!u.includes("googletagmanager")&&!u.includes("google-analytics")) failedReqs.push(u.slice(0,120)); });
  let loadErr=null;
  try { await page.goto(base+url,{waitUntil:"networkidle",timeout:20000});
    await page.evaluate(()=>document.fonts?document.fonts.ready:null).catch(()=>{});
  }
  catch(e){ loadErr=String(e).slice(0,160); }
  await page.waitForTimeout(1200);

  const checks = await page.evaluate(() => {
    const out = { tokensLoaded:false, logoOk:false, overflow:null, invisibleText:[], hiddenLogoDetail:null };
    // tokens.css loaded? check a known token resolves
    const probe = getComputedStyle(document.documentElement).getPropertyValue("--grey-500").trim();
    out.tokensLoaded = probe.length > 0;
    // logo: nav wordmark img must have non-zero rendered size and be visible
    const logo = document.querySelector("nav .nav-name img, nav a[href='/'] img");
    if (logo) {
      const r = logo.getBoundingClientRect();
      const cs = getComputedStyle(logo);
      out.logoOk = r.width > 20 && r.height > 8 && cs.visibility!=="hidden" && cs.display!=="none" && parseFloat(cs.opacity||"1")>0.1;
      out.hiddenLogoDetail = out.logoOk?null:{w:Math.round(r.width),h:Math.round(r.height),vis:cs.visibility,disp:cs.display,op:cs.opacity};
    }
    // horizontal overflow: page wider than viewport by a real margin
    const de = document.documentElement;
    if (de.scrollWidth > window.innerWidth + 4) out.overflow = { scrollWidth: de.scrollWidth, viewport: window.innerWidth };
    // invisible / low-contrast text: sample visible text-bearing elements
    function bg(el){ // composite stacked backgrounds top-down over white
      // collect bg colours up the tree, then composite from the bottom up so
      // a low-alpha tint (e.g. rgba(15,23,42,0.04)) resolves to its real,
      // near-white rendered colour instead of being treated as opaque navy.
      const stack=[]; let n=el;
      while(n){ const c=getComputedStyle(n).backgroundColor;
        if(c&&c!=="rgba(0, 0, 0, 0)"&&c!=="transparent"){ const m=c.match(/[\d.]+/g);
          if(m) stack.push([+m[0],+m[1],+m[2], m[3]!==undefined?+m[3]:1]); }
        n=n.parentElement; }
      let out=[255,255,255]; // page base
      for(let i=stack.length-1;i>=0;i--){ const [r,g,b,a]=stack[i];
        out=[Math.round(r*a+out[0]*(1-a)),Math.round(g*a+out[1]*(1-a)),Math.round(b*a+out[2]*(1-a))]; }
      return [out[0],out[1],out[2],1];
    }
    const els = [...document.querySelectorAll("p,h1,h2,h3,h4,h5,h6,a,span,li,td,th,button,label,strong,em")];
    const seen = new Set();
    for (const el of els) {
      const txt = (el.textContent||"").trim();
      if (txt.length < 3) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility==="hidden"||cs.display==="none"||parseFloat(cs.opacity||"1")<0.05) continue;
      const r = el.getBoundingClientRect();
      if (r.width<2||r.height<2) continue;
      // Skip legit gradient effects the contrast model can't read:
      //  - gradient-clipped text (transparent fill, gradient shows through)
      //  - elements painted with a gradient background-image (buttons/pills)
      const selfBgImg = cs.backgroundImage && cs.backgroundImage!=="none";
      const clipText = (cs.webkitBackgroundClip==="text"||cs.backgroundClip==="text"||cs.webkitTextFillColor==="rgba(0, 0, 0, 0)");
      if (clipText) continue;
      if (selfBgImg && /gradient/.test(cs.backgroundImage)) continue;
      // Also skip if any ancestor (the button itself) paints a gradient bg
      let anc=el, gradAncestor=false;
      while(anc){ const a=getComputedStyle(anc); if(a.backgroundImage&&/gradient/.test(a.backgroundImage)){gradAncestor=true;break;} anc=anc.parentElement; }
      if (gradAncestor) continue;
      // only direct-text elements (avoid double counting containers)
      const hasDirectText = [...el.childNodes].some(n=>n.nodeType===3 && n.textContent.trim().length>2);
      if (!hasDirectText) continue;
      const fc = cs.color.match(/\d+(\.\d+)?/g); if(!fc) continue;
      const fa = fc[3]!==undefined?+fc[3]:1;
      if (fa < 0.05) { // fully transparent text
        const key = el.tagName+txt.slice(0,20); if(seen.has(key))continue; seen.add(key);
        out.invisibleText.push({tag:el.tagName, text:txt.slice(0,40), reason:"alpha~0"});
        continue;
      }
      const fg=[+fc[0],+fc[1],+fc[2]];
      const b=bg(el); // composite fg alpha over bg if needed handled roughly
      const ratio = (function(){ function L(r,g,bl){const c=[r,g,bl].map(v=>{v/=255;return v<=0.03928?v/12.92:((v+0.055)/1.055)**2.4;});return 0.2126*c[0]+0.7152*c[1]+0.0722*c[2];}
        const l1=L(...fg),l2=L(b[0],b[1],b[2]);const hi=Math.max(l1,l2),lo=Math.min(l1,l2);return (hi+0.05)/(lo+0.05);})();
      if (ratio < 2.0) { // genuinely near-invisible (far below even AA; flags bleached text)
        const key = el.tagName+txt.slice(0,20); if(seen.has(key))continue; seen.add(key);
        out.invisibleText.push({tag:el.tagName, text:txt.slice(0,40), ratio:+ratio.toFixed(2), fg, bg:b.slice(0,3)});
      }
    }
    out.invisibleText = out.invisibleText.slice(0,8);
    return out;
  }).catch(e=>({error:String(e).slice(0,160)}));

  const problems=[];
  if(loadErr) problems.push("load:"+loadErr);
  if(checks.error) problems.push("eval:"+checks.error);
  if(checks.tokensLoaded===false) problems.push("NO-TOKENS");
  if(checks.logoOk===false) problems.push("LOGO-HIDDEN "+JSON.stringify(checks.hiddenLogoDetail));
  if(checks.overflow) problems.push("OVERFLOW "+checks.overflow.scrollWidth+">"+checks.overflow.viewport);
  if(checks.invisibleText&&checks.invisibleText.length) problems.push("INVISIBLE-TEXT x"+checks.invisibleText.length+" "+JSON.stringify(checks.invisibleText.slice(0,3)));
  if(failedReqs.length) problems.push("REQ-FAIL "+failedReqs.slice(0,2).join(","));
  if(consoleErrors.length) problems.push("CONSOLE "+consoleErrors.slice(0,1).join(""));

  const status = problems.length?"FAIL":"PASS";
  if(problems.length) failCount++;
  report.push({url,status,problems});
  console.log(`${status}  ${url}${problems.length?"  -> "+problems.join(" | "):""}`);
  await ctx.close();
}
await browser.close(); server.close();
await writeFile(new URL("../tools/audit-report.json",import.meta.url), JSON.stringify(report,null,2));
console.log(`\n=== ${report.length} pages, ${failCount} with problems, ${report.length-failCount} clean ===`);
process.exit(failCount?1:0);
