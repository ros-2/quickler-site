import { chromium } from "playwright";
import http from "node:http"; import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs"; import { extname, join } from "node:path";
const ROOT=new URL("../_site/",import.meta.url).pathname;
const T={".html":"text/html",".css":"text/css",".js":"text/javascript",".svg":"image/svg+xml",".png":"image/png",".ico":"image/x-icon",".woff2":"font/woff2",".json":"application/json"};
const s=http.createServer(async(rq,rs)=>{try{let p=rq.url.split("?")[0];if(p.endsWith("/"))p+="index.html";let f=join(ROOT,p);if(!existsSync(f)&&existsSync(f+".html"))f+=".html";rs.writeHead(200,{"content-type":T[extname(f)]||"text/plain"});rs.end(await readFile(f));}catch{rs.writeHead(404);rs.end("x");}});
await new Promise(r=>s.listen(4564,r));
const EXE="/home/balnagowan/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell";
const b=await chromium.launch({executablePath:EXE,args:["--no-sandbox","--disable-gpu"]});
const pg=await b.newPage({viewport:{width:1280,height:860}});
await pg.goto("http://localhost:4564/pages/pricing.html",{waitUntil:"load"});
await pg.waitForTimeout(500);
// scroll the container to the very bottom
const r=await pg.evaluate(async()=>{const sc=document.querySelector('.story-scroll');sc.scrollTop=sc.scrollHeight;await new Promise(r=>setTimeout(r,400));const max=sc.scrollHeight-sc.clientHeight;return {after:Math.round(sc.scrollTop),max:Math.round(max),atBottom:Math.abs(sc.scrollTop-max)<5};});
console.log("PRICING bottom test:",JSON.stringify(r),r.atBottom?"STAYS AT BOTTOM ✓":"JUMPED ✗");
// also footer reachable?
const foot=await pg.evaluate(()=>{const f=document.querySelector('.story-footer');if(!f)return 'no footer';const r=f.getBoundingClientRect();return 'footer top='+Math.round(r.top)+' (visible if < viewport 860)';});
console.log("FOOTER:",foot);
await b.close(); s.close();
