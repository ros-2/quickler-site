import { chromium } from "playwright";
import http from "node:http"; import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs"; import { extname, join } from "node:path";
const ROOT=new URL("../_site/",import.meta.url).pathname;
const T={".html":"text/html",".css":"text/css",".js":"text/javascript",".svg":"image/svg+xml",".png":"image/png"};
const s=http.createServer(async(rq,rs)=>{try{let p=rq.url.split("?")[0];if(p.endsWith("/"))p+="index.html";let f=join(ROOT,p);if(!existsSync(f)&&existsSync(f+".html"))f+=".html";rs.writeHead(200,{"content-type":T[extname(f)]||"text/plain"});rs.end(await readFile(f));}catch{rs.writeHead(404);rs.end("x");}});
await new Promise(r=>s.listen(4567,r));
const EXE="/home/balnagowan/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell";
const b=await chromium.launch({executablePath:EXE,args:["--no-sandbox","--disable-gpu"]});
for (const path of ["/pages/pricing.html","/pages/services.html","/"]) {
  const pg=await b.newPage({viewport:{width:1280,height:860}});
  await pg.goto("http://localhost:4567"+path,{waitUntil:"load"});
  await pg.waitForTimeout(300);
  const r=await pg.evaluate(async()=>{const sc=document.querySelector('.story-scroll');if(!sc)return'no scroller';for(let i=0;i<40;i++){sc.scrollBy(0,400);await new Promise(r=>setTimeout(r,60));}await new Promise(r=>setTimeout(r,300));const max=sc.scrollHeight-sc.clientHeight;return {top:Math.round(sc.scrollTop),max:Math.round(max),reachedBottom:Math.abs(sc.scrollTop-max)<30};});
  console.log(path,"->",JSON.stringify(r),r.reachedBottom?"✓ reaches bottom":"✗");
  await pg.close();
}
await b.close(); s.close();
