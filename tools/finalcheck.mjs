import { chromium } from "playwright";
import http from "node:http"; import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs"; import { extname, join } from "node:path";
const ROOT=new URL("../_site/",import.meta.url).pathname;
const T={".html":"text/html",".css":"text/css",".js":"text/javascript",".svg":"image/svg+xml",".png":"image/png"};
const s=http.createServer(async(rq,rs)=>{try{let p=rq.url.split("?")[0];if(p.endsWith("/"))p+="index.html";let f=join(ROOT,p);if(!existsSync(f)&&existsSync(f+".html"))f+=".html";rs.writeHead(200,{"content-type":T[extname(f)]||"text/plain"});rs.end(await readFile(f));}catch{rs.writeHead(404);rs.end("x");}});
await new Promise(r=>s.listen(4569,r));
const EXE="/home/balnagowan/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell";
const SC="/tmp/claude-1000/-home-balnagowan-quickler-engine/7ba1eac7-26e9-49f0-a6d1-8dd163346506/scratchpad/";
const b=await chromium.launch({executablePath:EXE,args:["--no-sandbox","--disable-gpu"]});
// support 2nd card section screenshot
let pg=await b.newPage({viewport:{width:1280,height:860}});
await pg.goto("http://localhost:4569/pages/help/index.html",{waitUntil:"load"});
await pg.waitForTimeout(400);
await pg.evaluate(()=>{const c=[...document.querySelectorAll('.story-cards')][2];if(c)c.closest('.story').scrollIntoView();});
await pg.waitForTimeout(600);
await pg.screenshot({path:SC+"cards2.png"});
await pg.close();
// bottom reach test all reel pages
for (const path of ["/","/pages/services.html","/pages/pricing.html","/pages/about.html","/pages/help/index.html"]) {
  pg=await b.newPage({viewport:{width:1280,height:860}});
  await pg.goto("http://localhost:4569"+path,{waitUntil:"load"});
  await pg.waitForTimeout(300);
  const r=await pg.evaluate(async()=>{const sc=document.querySelector('.story-scroll');if(!sc)return'no';for(let i=0;i<50;i++){sc.scrollBy(0,300);await new Promise(r=>setTimeout(r,80));}await new Promise(r=>setTimeout(r,400));const max=sc.scrollHeight-sc.clientHeight;return {top:Math.round(sc.scrollTop),max:Math.round(max),ok:Math.abs(sc.scrollTop-max)<40};});
  console.log(path,r.ok?"✓ reaches bottom":"✗ "+JSON.stringify(r));
  await pg.close();
}
await b.close(); s.close();
