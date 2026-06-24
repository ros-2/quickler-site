import { chromium } from "playwright";
import http from "node:http"; import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs"; import { extname, join } from "node:path";
const ROOT=new URL("../_site/",import.meta.url).pathname;
const T={".html":"text/html",".css":"text/css",".js":"text/javascript",".svg":"image/svg+xml",".png":"image/png",".ico":"image/x-icon",".woff2":"font/woff2",".json":"application/json"};
const s=http.createServer(async(rq,rs)=>{try{let p=rq.url.split("?")[0];if(p.endsWith("/"))p+="index.html";let f=join(ROOT,p);if(!existsSync(f)&&existsSync(f+".html"))f+=".html";rs.writeHead(200,{"content-type":T[extname(f)]||"text/plain"});rs.end(await readFile(f));}catch{rs.writeHead(404);rs.end("x");}});
await new Promise(r=>s.listen(4520,r));
try{
  const b=await chromium.launch({executablePath:"/home/balnagowan/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell",args:["--no-sandbox","--disable-gpu"]});
  for(const [w,h,name] of [[1440,900,"DESK"],[390,844,"PHONE"]]){
    const pg=await b.newPage({viewport:{width:w,height:h}});
    await pg.goto("http://localhost:4520/",{waitUntil:"load",timeout:20000});
    await pg.evaluate(()=>document.querySelectorAll(".reveal-on-scroll").forEach(e=>e.classList.add("is-visible"))).catch(()=>{});
    await pg.waitForTimeout(1000);
    await pg.screenshot({path:"tools/shots/RWD-"+name+".png",fullPage:true});
    await pg.close(); console.log("shot",name);
  }
  await b.close();
}catch(e){console.log("FAIL:",String(e).slice(0,150));}
s.close();
