import { chromium } from "playwright";
import http from "node:http"; import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs"; import { extname, join } from "node:path";
const ROOT=new URL("../_site/",import.meta.url).pathname;
const T={".html":"text/html",".css":"text/css",".js":"text/javascript",".svg":"image/svg+xml",".png":"image/png"};
const s=http.createServer(async(rq,rs)=>{try{let p=rq.url.split("?")[0];if(p.endsWith("/"))p+="index.html";let f=join(ROOT,p);if(!existsSync(f)&&existsSync(f+".html"))f+=".html";rs.writeHead(200,{"content-type":T[extname(f)]||"text/plain"});rs.end(await readFile(f));}catch{rs.writeHead(404);rs.end("x");}});
await new Promise(r=>s.listen(4580,r));
const EXE="/home/balnagowan/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell";
const b=await chromium.launch({executablePath:EXE,args:["--no-sandbox","--disable-gpu"]});
for (const path of ["/","/pages/services.html","/pages/pricing.html","/pages/help/index.html"]) {
  const pg=await b.newPage({viewport:{width:1280,height:860}});
  await pg.goto("http://localhost:4580"+path,{waitUntil:"load"});
  await pg.waitForTimeout(400);
  // real wheel event over the centre of the page
  await pg.mouse.move(640,430);
  await pg.mouse.wheel(0,600);
  await pg.waitForTimeout(500);
  const moved=await pg.evaluate(()=>Math.round(document.querySelector('.story-scroll').scrollTop));
  console.log(path.padEnd(24),"after wheel 600 -> scrollTop="+moved, moved>50?"SCROLLS ✓":"FROZEN ✗");
  await pg.close();
}
await b.close(); s.close();
