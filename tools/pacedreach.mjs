import { chromium } from "playwright";
import http from "node:http"; import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs"; import { extname, join } from "node:path";
const ROOT=new URL("../_site/",import.meta.url).pathname;
const T={".html":"text/html",".css":"text/css",".js":"text/javascript",".svg":"image/svg+xml",".png":"image/png"};
const s=http.createServer(async(rq,rs)=>{try{let p=rq.url.split("?")[0];if(p.endsWith("/"))p+="index.html";let f=join(ROOT,p);if(!existsSync(f)&&existsSync(f+".html"))f+=".html";rs.writeHead(200,{"content-type":T[extname(f)]||"text/plain"});rs.end(await readFile(f));}catch{rs.writeHead(404);rs.end("x");}});
await new Promise(r=>s.listen(4579,r));
const EXE="/home/balnagowan/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell";
const b=await chromium.launch({executablePath:EXE,args:["--no-sandbox","--disable-gpu"]});
for (const path of ["/","/pages/services.html"]) {
  const pg=await b.newPage({viewport:{width:1280,height:860}});
  await pg.goto("http://localhost:4579"+path,{waitUntil:"load"});
  await pg.waitForTimeout(300);
  // paced: small steps, long settle (mimics real wheel)
  const r=await pg.evaluate(async()=>{const sc=document.querySelector('.story-scroll');let last=-1,stuckCount=0;for(let i=0;i<120;i++){sc.scrollBy(0,200);await new Promise(r=>setTimeout(r,140));if(Math.round(sc.scrollTop)===last){stuckCount++;if(stuckCount>5)break;}else{stuckCount=0;last=Math.round(sc.scrollTop);}}const max=sc.scrollHeight-sc.clientHeight;return {top:Math.round(sc.scrollTop),max:Math.round(max),ok:Math.abs(sc.scrollTop-max)<60};});
  console.log(path.padEnd(24),"top="+r.top+" max="+r.max, r.ok?"REACHES BOTTOM ✓":"STUCK ✗");
  await pg.close();
}
await b.close(); s.close();
