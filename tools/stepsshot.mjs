import { chromium } from "playwright";
import http from "node:http"; import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs"; import { extname, join } from "node:path";
const ROOT=new URL("../_site/",import.meta.url).pathname;
const T={".html":"text/html",".css":"text/css",".js":"text/javascript",".svg":"image/svg+xml",".png":"image/png"};
const s=http.createServer(async(rq,rs)=>{try{let p=rq.url.split("?")[0];if(p.endsWith("/"))p+="index.html";let f=join(ROOT,p);if(!existsSync(f)&&existsSync(f+".html"))f+=".html";rs.writeHead(200,{"content-type":T[extname(f)]||"text/plain"});rs.end(await readFile(f));}catch{rs.writeHead(404);rs.end("x");}});
await new Promise(r=>s.listen(4576,r));
const EXE="/home/balnagowan/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell";
const SC="/tmp/claude-1000/-home-balnagowan-quickler-engine/7ba1eac7-26e9-49f0-a6d1-8dd163346506/scratchpad/";
const b=await chromium.launch({executablePath:EXE,args:["--no-sandbox","--disable-gpu"]});
const pg=await b.newPage({viewport:{width:1900,height:945}});
await pg.goto("http://localhost:4576/",{waitUntil:"load"});
await pg.waitForTimeout(500);
// scroll to the steps panel (index 3)
await pg.evaluate(()=>{const p=[...document.querySelectorAll('.story')][3];p.scrollIntoView();});
await pg.waitForTimeout(700);
// check the lowest card bottom vs arrow top
const d=await pg.evaluate(()=>{const cards=[...document.querySelectorAll('.story')][3].querySelectorAll('.story-step');let maxB=0;cards.forEach(c=>{maxB=Math.max(maxB,c.getBoundingClientRect().bottom)});const arrow=document.querySelector('.story-next').getBoundingClientRect();return {lowestCardBottom:Math.round(maxB),arrowTop:Math.round(arrow.top),clear:maxB<arrow.top};});
console.log("steps cards vs arrow:",JSON.stringify(d),d.clear?"CLEAR":"OVERLAP");
await pg.screenshot({path:SC+"steps.png"});
await b.close(); s.close();
