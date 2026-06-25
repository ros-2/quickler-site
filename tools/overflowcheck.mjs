import { chromium } from "playwright";
import http from "node:http"; import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs"; import { extname, join } from "node:path";
const ROOT=new URL("../_site/",import.meta.url).pathname;
const T={".html":"text/html",".css":"text/css",".js":"text/javascript",".svg":"image/svg+xml",".png":"image/png"};
const s=http.createServer(async(rq,rs)=>{try{let p=rq.url.split("?")[0];if(p.endsWith("/"))p+="index.html";let f=join(ROOT,p);if(!existsSync(f)&&existsSync(f+".html"))f+=".html";rs.writeHead(200,{"content-type":T[extname(f)]||"text/plain"});rs.end(await readFile(f));}catch{rs.writeHead(404);rs.end("x");}});
await new Promise(r=>s.listen(4575,r));
const EXE="/home/balnagowan/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell";
const b=await chromium.launch({executablePath:EXE,args:["--no-sandbox","--disable-gpu"]});
const pg=await b.newPage({viewport:{width:1900,height:945}});
await pg.goto("http://localhost:4575/",{waitUntil:"load"});
await pg.waitForTimeout(500);
// find the steps panel and check if its inner content overflows the safe area
const d=await pg.evaluate(()=>{
  const panels=[...document.querySelectorAll('.story')];
  const out=[];
  panels.forEach((p,i)=>{
    const inner=p.querySelector('.story-inner');
    if(!inner)return;
    const cs=getComputedStyle(p);
    const padTop=parseFloat(cs.paddingTop), padBot=parseFloat(cs.paddingBottom);
    const safeH=p.clientHeight-padTop-padBot;
    const innerH=inner.scrollHeight;
    const overflows=innerH>safeH;
    const scrolls=cs.overflowY;
    if(i<5) out.push({i,panel:p.className.replace('story ','').slice(0,20),safeH:Math.round(safeH),innerH:Math.round(innerH),overflows,scrolls,panelScrollH:p.scrollHeight,panelClientH:p.clientHeight});
  });
  return out;
});
console.log(JSON.stringify(d,null,1));
await b.close(); s.close();
