import { chromium } from "playwright";
import http from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname, join } from "node:path";
const ROOT = new URL("../_site/", import.meta.url).pathname;
const T = { ".html":"text/html",".css":"text/css",".js":"text/javascript",".svg":"image/svg+xml",".png":"image/png",".ico":"image/x-icon",".woff2":"font/woff2",".json":"application/json" };
const s = http.createServer(async (rq,rs)=>{ try{ let p=rq.url.split("?")[0]; if(p.endsWith("/"))p+="index.html"; let f=join(ROOT,p); if(!existsSync(f)&&existsSync(f+".html"))f+=".html"; rs.writeHead(200,{"content-type":T[extname(f)]||"text/plain"}); rs.end(await readFile(f)); }catch{ rs.writeHead(404); rs.end("x"); } });
await new Promise(r=>s.listen(4400,r));
const b = await chromium.launch();
const targets = [
  ["/pages/construction-site-inspection-report-uk.html", ".callout-btn"],
  ["/pages/country-hub-italy.html", ".nav-cta-pill"],
  ["/pages/services.html", ".nav-cta-pill"],
  ["/pages/faq.html", "h1"],
];
for (const [url, sel] of targets) {
  const pg = await b.newPage({ viewport:{width:1440,height:1000} });
  await pg.goto("http://localhost:4400"+url, { waitUntil:"networkidle" });
  await pg.addStyleTag({ content:"*{transition:none!important;animation:none!important}" }).catch(()=>{});
  await pg.waitForTimeout(700);
  const r = await pg.evaluate((sel)=>{
    const el = document.querySelector(sel);
    if (!el) return "MISSING";
    const cs = getComputedStyle(el);
    return { color: cs.color, bg: cs.backgroundColor, bgImg: (cs.backgroundImage||"").slice(0,30), text: el.textContent.trim().slice(0,30) };
  }, sel);
  console.log(url, sel, "->", JSON.stringify(r));
  await pg.close();
}
await b.close(); s.close();
