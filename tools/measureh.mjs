import { chromium } from "playwright";
import http from "node:http"; import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs"; import { extname, join } from "node:path";
const ROOT=new URL("../_site/",import.meta.url).pathname;
const T={".html":"text/html",".css":"text/css",".js":"text/javascript",".svg":"image/svg+xml",".png":"image/png",".ico":"image/x-icon",".woff2":"font/woff2",".json":"application/json"};
const s=http.createServer(async(rq,rs)=>{try{let p=rq.url.split("?")[0];if(p.endsWith("/"))p+="index.html";let f=join(ROOT,p);if(!existsSync(f)&&existsSync(f+".html"))f+=".html";rs.writeHead(200,{"content-type":T[extname(f)]||"text/plain"});rs.end(await readFile(f));}catch{rs.writeHead(404);rs.end("x");}});
await new Promise(r=>s.listen(4477,r));
const b=await chromium.launch();
for(const [w,h] of [[1440,1000],[1320,740],[1440,680]]){
  const pg=await b.newPage({viewport:{width:w,height:h}});
  await pg.goto("http://localhost:4477/",{waitUntil:"networkidle"});await pg.waitForTimeout(700);
  const m=await pg.evaluate(()=>{const nav=document.querySelector("nav").getBoundingClientRect();const pill=document.querySelector(".hero-label").getBoundingClientRect();return Math.round(pill.top-nav.bottom);});
  console.log(`${w}x${h} -> nav->pill gap: ${m}px`);
  await pg.close();
}
await b.close();s.close();
