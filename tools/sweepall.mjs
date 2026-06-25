import { chromium } from "playwright";
import http from "node:http"; import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs"; import { extname, join } from "node:path";
const ROOT=new URL("../_site/",import.meta.url).pathname;
const T={".html":"text/html",".css":"text/css",".js":"text/javascript",".svg":"image/svg+xml",".png":"image/png"};
const s=http.createServer(async(rq,rs)=>{try{let p=rq.url.split("?")[0];if(p.endsWith("/"))p+="index.html";let f=join(ROOT,p);if(!existsSync(f)&&existsSync(f+".html"))f+=".html";rs.writeHead(200,{"content-type":T[extname(f)]||"text/plain"});rs.end(await readFile(f));}catch{rs.writeHead(404);rs.end("x");}});
await new Promise(r=>s.listen(4577,r));
const EXE="/home/balnagowan/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell";
const b=await chromium.launch({executablePath:EXE,args:["--no-sandbox","--disable-gpu"]});
const pages=["/","/pages/services.html","/pages/pricing.html","/pages/about.html","/pages/help/index.html","/pages/demo.html"];
for (const h of [945, 760]) {
 for (const path of pages) {
  const pg=await b.newPage({viewport:{width:1900,height:h}});
  await pg.goto("http://localhost:4577"+path,{waitUntil:"load"});
  await pg.waitForTimeout(350);
  const bad=await pg.evaluate(()=>{
    const panels=[...document.querySelectorAll('.story:not(.story-footer)')];
    const probs=[];
    panels.forEach((p,i)=>{
      const inner=p.querySelector('.story-inner');
      if(!inner)return;
      const cs=getComputedStyle(p);
      const safeH=p.clientHeight-parseFloat(cs.paddingTop)-parseFloat(cs.paddingBottom);
      // does inner content visually exceed safe area (i.e. clipped/scrollable)?
      if(inner.scrollHeight > safeH+2) probs.push({i,over:Math.round(inner.scrollHeight-safeH)});
    });
    return probs;
  });
  console.log((path+" @"+h).padEnd(34), bad.length?("CLIPPED(scrolls): "+JSON.stringify(bad)):"all fit");
  await pg.close();
 }
}
await b.close(); s.close();
