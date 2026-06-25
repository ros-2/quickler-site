import { chromium } from "playwright";
import http from "node:http"; import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs"; import { extname, join } from "node:path";
const ROOT=new URL("../_site/",import.meta.url).pathname;
const T={".html":"text/html",".css":"text/css",".js":"text/javascript",".svg":"image/svg+xml",".png":"image/png"};
const s=http.createServer(async(rq,rs)=>{try{let p=rq.url.split("?")[0];if(p.endsWith("/"))p+="index.html";let f=join(ROOT,p);if(!existsSync(f)&&existsSync(f+".html"))f+=".html";rs.writeHead(200,{"content-type":T[extname(f)]||"text/plain"});rs.end(await readFile(f));}catch{rs.writeHead(404);rs.end("x");}});
await new Promise(r=>s.listen(4581,r));
const EXE="/home/balnagowan/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell";
const b=await chromium.launch({executablePath:EXE,args:["--no-sandbox","--disable-gpu"]});
for (const path of ["/","/pages/services.html","/pages/pricing.html"]) {
  const pg=await b.newPage({viewport:{width:1280,height:860}});
  await pg.goto("http://localhost:4581"+path,{waitUntil:"load"});
  await pg.waitForTimeout(400);
  // paced scroll to bottom
  const reach=await pg.evaluate(async()=>{const sc=document.querySelector('.story-scroll');let last=-1,stuck=0;for(let i=0;i<150;i++){sc.scrollBy(0,180);await new Promise(r=>setTimeout(r,130));const t=Math.round(sc.scrollTop);if(t===last){if(++stuck>8)break;}else{stuck=0;last=t;}}const max=sc.scrollHeight-sc.clientHeight;return {top:Math.round(sc.scrollTop),max:Math.round(max),ok:Math.abs(sc.scrollTop-max)<70};});
  console.log(path.padEnd(24), reach.ok?"REACHES BOTTOM ✓":"STUCK @"+reach.top+"/"+reach.max+" ✗");
  await pg.close();
}
await b.close(); s.close();
