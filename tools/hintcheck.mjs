import { chromium } from "playwright";
import http from "node:http"; import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs"; import { extname, join } from "node:path";
const ROOT=new URL("../_site/",import.meta.url).pathname;
const T={".html":"text/html",".css":"text/css",".js":"text/javascript",".svg":"image/svg+xml",".png":"image/png",".ico":"image/x-icon",".woff2":"font/woff2",".json":"application/json"};
const s=http.createServer(async(rq,rs)=>{try{let p=rq.url.split("?")[0];if(p.endsWith("/"))p+="index.html";let f=join(ROOT,p);if(!existsSync(f)&&existsSync(f+".html"))f+=".html";rs.writeHead(200,{"content-type":T[extname(f)]||"text/plain"});rs.end(await readFile(f));}catch{rs.writeHead(404);rs.end("x");}});
await new Promise(r=>s.listen(4558,r));
const EXE="/home/balnagowan/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell";
const b=await chromium.launch({executablePath:EXE,args:["--no-sandbox","--disable-gpu"]});
async function check(path,vp,hasTouch){
  const pg=await b.newPage({viewport:vp,hasTouch:hasTouch,isMobile:hasTouch});
  await pg.goto("http://localhost:4558"+path,{waitUntil:"load"});
  await pg.waitForTimeout(900);
  const present=await pg.evaluate(()=>{const h=document.querySelector(".reel-hint");if(!h)return {present:false};const cs=getComputedStyle(h);return {present:true,opacity:cs.opacity,text:h.textContent.trim()};});
  console.log(path, JSON.stringify(vp), "touch="+hasTouch, "->", JSON.stringify(present));
  await pg.close();
}
await check("/", {width:390,height:844}, true);    // mobile home -> expect present
await check("/", {width:1440,height:900}, false);  // desktop home -> expect absent
await check("/pages/about.html", {width:390,height:844}, true); // mobile about -> expect absent
await b.close(); s.close();
