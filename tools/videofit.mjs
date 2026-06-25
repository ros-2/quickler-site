import { chromium } from "playwright";
import http from "node:http"; import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs"; import { extname, join } from "node:path";
const ROOT=new URL("../_site/",import.meta.url).pathname;
const T={".html":"text/html",".css":"text/css",".js":"text/javascript",".svg":"image/svg+xml",".png":"image/png"};
const s=http.createServer(async(rq,rs)=>{try{let p=rq.url.split("?")[0];if(p.endsWith("/"))p+="index.html";let f=join(ROOT,p);if(!existsSync(f)&&existsSync(f+".html"))f+=".html";rs.writeHead(200,{"content-type":T[extname(f)]||"text/plain"});rs.end(await readFile(f));}catch{rs.writeHead(404);rs.end("x");}});
await new Promise(r=>s.listen(4583,r));
const EXE="/home/balnagowan/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell";
const SC="/tmp/claude-1000/-home-balnagowan-quickler-engine/7ba1eac7-26e9-49f0-a6d1-8dd163346506/scratchpad/";
const b=await chromium.launch({executablePath:EXE,args:["--no-sandbox","--disable-gpu"]});
for (const h of [1015, 860, 760]) {
  const pg=await b.newPage({viewport:{width:1280,height:h}});
  await pg.goto("http://localhost:4583/",{waitUntil:"load"});
  await pg.waitForTimeout(400);
  await pg.evaluate(()=>{const v=document.querySelector('.story-video-panel');if(v)v.scrollIntoView();});
  await pg.waitForTimeout(700);
  const d=await pg.evaluate(()=>{const e=document.querySelector('.story-video-panel .story-video-embed');const arrow=document.querySelector('.story-next');const er=e.getBoundingClientRect();const ar=arrow.getBoundingClientRect();const head=document.querySelector('.story-video-panel .story-h2').getBoundingClientRect();return {videoTop:Math.round(er.top),videoBottom:Math.round(er.bottom),headTop:Math.round(head.top),navClear:head.top>89,arrowTop:Math.round(ar.top),arrowClear:er.bottom<ar.top};});
  console.log("vh="+h, "head.top="+d.headTop+(d.navClear?" navOK":" NAVOVERLAP"), "video["+d.videoTop+"-"+d.videoBottom+"] arrow@"+d.arrowTop, d.arrowClear?"CLEAR ✓":"OVERLAP ✗");
  if(h===860){await pg.screenshot({path:SC+"videofit.png"});}
  await pg.close();
}
await b.close(); s.close();
