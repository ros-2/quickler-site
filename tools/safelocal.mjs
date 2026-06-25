import { chromium } from "playwright";
import http from "node:http"; import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs"; import { extname, join } from "node:path";
const ROOT=new URL("../_site/",import.meta.url).pathname;
const T={".html":"text/html",".css":"text/css",".js":"text/javascript",".svg":"image/svg+xml",".png":"image/png"};
const s=http.createServer(async(rq,rs)=>{try{let p=rq.url.split("?")[0];if(p.endsWith("/"))p+="index.html";let f=join(ROOT,p);if(!existsSync(f)&&existsSync(f+".html"))f+=".html";rs.writeHead(200,{"content-type":T[extname(f)]||"text/plain"});rs.end(await readFile(f));}catch{rs.writeHead(404);rs.end("x");}});
await new Promise(r=>s.listen(4571,r));
const EXE="/home/balnagowan/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell";
const b=await chromium.launch({executablePath:EXE,args:["--no-sandbox","--disable-gpu"]});
for (const vp of [{w:1280,h:760},{w:390,h:740}]) {
 for (const path of ["/","/pages/services.html","/pages/pricing.html","/pages/about.html","/pages/help/index.html"]) {
  const pg=await b.newPage({viewport:{width:vp.w,height:vp.h}});
  await pg.goto("http://localhost:4571"+path,{waitUntil:"load"});
  await pg.waitForTimeout(400);
  const d=await pg.evaluate(()=>{
    const nav=document.querySelector('nav').getBoundingClientRect();
    const arrowTop=window.innerHeight-90;
    const inner=document.querySelector('.story-hero .story-inner')||document.querySelector('.story-hero');
    const r=inner.getBoundingClientRect();
    return {ct:Math.round(r.top),cb:Math.round(r.bottom),nb:Math.round(nav.bottom),az:Math.round(arrowTop),
      nav:r.top>nav.bottom, arrow:r.bottom<arrowTop};
  });
  console.log(vp.w+"px",path.padEnd(26), "nav:"+(d.nav?"CLEAR":"OVERLAP"), "arrow:"+(d.arrow?"CLEAR":"OVERLAP"), "(cb="+d.cb+" az="+d.az+")");
  await pg.close();
 }
}
await b.close(); s.close();
