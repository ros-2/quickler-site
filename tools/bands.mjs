import { chromium } from "playwright";
import http from "node:http"; import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs"; import { extname, join } from "node:path";
const ROOT=new URL("../_site/",import.meta.url).pathname;
const T={".html":"text/html",".css":"text/css",".js":"text/javascript",".svg":"image/svg+xml",".png":"image/png"};
const s=http.createServer(async(rq,rs)=>{try{let p=rq.url.split("?")[0];if(p.endsWith("/"))p+="index.html";let f=join(ROOT,p);if(!existsSync(f)&&existsSync(f+".html"))f+=".html";rs.writeHead(200,{"content-type":T[extname(f)]||"text/plain"});rs.end(await readFile(f));}catch{rs.writeHead(404);rs.end("x");}});
await new Promise(r=>s.listen(4590,r));
const EXE="/home/balnagowan/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell";
const SC="/tmp/claude-1000/-home-balnagowan-quickler-engine/7ba1eac7-26e9-49f0-a6d1-8dd163346506/scratchpad/";
const b=await chromium.launch({executablePath:EXE,args:["--no-sandbox","--disable-gpu"]});
for (const [path,h] of [["/pages/services.html",945],["/pages/services.html",760],["/",945]]) {
  const pg=await b.newPage({viewport:{width:1280,height:h}});
  await pg.goto("http://localhost:4590"+path,{waitUntil:"load"});
  await pg.waitForTimeout(400);
  const d=await pg.evaluate(()=>{
    const nav=document.querySelector('nav').getBoundingClientRect();
    const arrow=document.querySelector('.story-next');
    const ar=arrow?arrow.getBoundingClientRect():{top:window.innerHeight};
    const inner=document.querySelector('.story-hero .story-inner');
    const r=inner.getBoundingClientRect();
    return {topBand:Math.round(r.top-nav.bottom), bottomBand:Math.round(ar.top-r.bottom), contentH:Math.round(r.height), vh:window.innerHeight};
  });
  console.log(path,"@"+h, "TOP empty band="+d.topBand+"px", "BOTTOM empty band="+d.bottomBand+"px", "(content "+d.contentH+"px)");
  await pg.close();
}
const pg=await b.newPage({viewport:{width:1280,height:760}});
await pg.goto("http://localhost:4590/pages/services.html",{waitUntil:"load"});
await pg.waitForTimeout(400);
await pg.screenshot({path:SC+"bands.png"});
await b.close(); s.close();
