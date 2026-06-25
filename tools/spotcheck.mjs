import { chromium } from "playwright";
import http from "node:http"; import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs"; import { extname, join } from "node:path";
const ROOT=new URL("../_site/",import.meta.url).pathname;
const T={".html":"text/html",".css":"text/css",".js":"text/javascript",".svg":"image/svg+xml",".png":"image/png"};
const s=http.createServer(async(rq,rs)=>{try{let p=rq.url.split("?")[0];if(p.endsWith("/"))p+="index.html";let f=join(ROOT,p);if(!existsSync(f)&&existsSync(f+".html"))f+=".html";rs.writeHead(200,{"content-type":T[extname(f)]||"text/plain"});rs.end(await readFile(f));}catch{rs.writeHead(404);rs.end("x");}});
await new Promise(r=>s.listen(4591,r));
const EXE="/home/balnagowan/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell";
const b=await chromium.launch({executablePath:EXE,args:["--no-sandbox","--disable-gpu"]});
for (const path of ["/pages/eicr-software-uk.html","/pages/no-app-inspections-france.html","/pages/what-is-quickler.html","/pages/van-safety-checks.html"]) {
  const pg=await b.newPage({viewport:{width:1280,height:860}});
  await pg.goto("http://localhost:4591"+path,{waitUntil:"load"});
  await pg.waitForTimeout(400);
  const d=await pg.evaluate(()=>{
    const sc=document.querySelector('.story-scroll');
    const nav=document.querySelector('nav').getBoundingClientRect();
    const inner=document.querySelector('.story-hero .story-inner');
    const r=inner?inner.getBoundingClientRect():{top:0,bottom:0};
    const seo=document.querySelector('.story-seo');
    return {isReel:!!sc, topBand:Math.round(r.top-nav.bottom), hasSeoBody:!!seo, panels:document.querySelectorAll('.story').length};
  });
  console.log(path.replace('/pages/','').padEnd(38), d.isReel?"reel":"NOT REEL", "topBand="+d.topBand, "panels="+d.panels, d.hasSeoBody?"+seoBody":"");
  await pg.close();
}
await b.close(); s.close();
