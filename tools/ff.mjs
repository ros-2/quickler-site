import { firefox } from "playwright";
import http from "node:http"; import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs"; import { extname, join } from "node:path";
import { PNG } from "pngjs";
const ROOT=new URL("../_site/",import.meta.url).pathname;
const T={".html":"text/html",".css":"text/css",".js":"text/javascript",".svg":"image/svg+xml",".png":"image/png",".ico":"image/x-icon",".woff2":"font/woff2",".json":"application/json"};
const s=http.createServer(async(rq,rs)=>{try{let p=rq.url.split("?")[0];if(p.endsWith("/"))p+="index.html";let f=join(ROOT,p);if(!existsSync(f)&&existsSync(f+".html"))f+=".html";rs.writeHead(200,{"content-type":T[extname(f)]||"text/plain"});rs.end(await readFile(f));}catch{rs.writeHead(404);rs.end("x");}});
await new Promise(r=>s.listen(4551,r));
const b=await firefox.launch();
const pg=await b.newPage({viewport:{width:1440,height:900}});
await pg.goto("http://localhost:4551/",{waitUntil:"load"});await pg.evaluate(()=>{const c=document.querySelector('[class*="cookie"]'); if(c)c.style.display='none';}).catch(()=>{});await pg.waitForTimeout(600);
await pg.evaluate(()=>document.querySelectorAll(".story-scroll .story")[1].scrollIntoView({block:"start"}));await pg.waitForTimeout(700);
const buf=await pg.screenshot(); const png=PNG.sync.read(buf);
function rgb(x,y){const i=(png.width*y+x)*4;return `${png.data[i]},${png.data[i+1]},${png.data[i+2]}`;}
function white(x,y){const i=(png.width*y+x)*4;return png.data[i]>248&&png.data[i+1]>248&&png.data[i+2]>248;}
console.log("FIREFOX top y=0:",rgb(700,0),"white?",white(700,0));
console.log("FIREFOX bottom y=899:",rgb(700,899),"white?",white(700,899));
await pg.screenshot({path:"tools/shots/FIREFOX.png"});
await b.close(); s.close();
