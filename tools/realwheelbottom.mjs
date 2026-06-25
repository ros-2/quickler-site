import { chromium } from "playwright";
import http from "node:http"; import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs"; import { extname, join } from "node:path";
const ROOT=new URL("../_site/",import.meta.url).pathname;
const T={".html":"text/html",".css":"text/css",".js":"text/javascript",".svg":"image/svg+xml",".png":"image/png"};
const s=http.createServer(async(rq,rs)=>{try{let p=rq.url.split("?")[0];if(p.endsWith("/"))p+="index.html";let f=join(ROOT,p);if(!existsSync(f)&&existsSync(f+".html"))f+=".html";rs.writeHead(200,{"content-type":T[extname(f)]||"text/plain"});rs.end(await readFile(f));}catch{rs.writeHead(404);rs.end("x");}});
await new Promise(r=>s.listen(4582,r));
const EXE="/home/balnagowan/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell";
const b=await chromium.launch({executablePath:EXE,args:["--no-sandbox","--disable-gpu"]});
const pg=await b.newPage({viewport:{width:1280,height:860}});
await pg.goto("http://localhost:4582/pages/pricing.html",{waitUntil:"load"});
await pg.waitForTimeout(400);
await pg.mouse.move(640,430);
const trace=[];
for(let i=0;i<30;i++){await pg.mouse.wheel(0,400);await pg.waitForTimeout(180);trace.push(await pg.evaluate(()=>Math.round(document.querySelector('.story-scroll').scrollTop)));}
const max=await pg.evaluate(()=>{const sc=document.querySelector('.story-scroll');return Math.round(sc.scrollHeight-sc.clientHeight)});
console.log("real wheel trace:",JSON.stringify(trace));
console.log("max:",max,"reached:",Math.abs(trace[trace.length-1]-max)<70);
await b.close(); s.close();
