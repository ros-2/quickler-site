import { chromium } from "playwright";
import http from "node:http"; import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs"; import { extname, join } from "node:path";
const ROOT=new URL("../_site/",import.meta.url).pathname;
const T={".html":"text/html",".css":"text/css",".js":"text/javascript",".svg":"image/svg+xml",".png":"image/png",".ico":"image/x-icon",".woff2":"font/woff2",".json":"application/json"};
const s=http.createServer(async(rq,rs)=>{try{let p=rq.url.split("?")[0];if(p.endsWith("/"))p+="index.html";let f=join(ROOT,p);if(!existsSync(f)&&existsSync(f+".html"))f+=".html";rs.writeHead(200,{"content-type":T[extname(f)]||"text/plain"});rs.end(await readFile(f));}catch{rs.writeHead(404);rs.end("x");}});
await new Promise(r=>s.listen(4560,r));
const EXE="/home/balnagowan/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell";
const b=await chromium.launch({executablePath:EXE,args:["--no-sandbox","--disable-gpu"]});
const SC="/tmp/claude-1000/-home-balnagowan-quickler-engine/7ba1eac7-26e9-49f0-a6d1-8dd163346506/scratchpad/";
// demo QR
let pg=await b.newPage({viewport:{width:1100,height:900}});
await pg.goto("http://localhost:4560/pages/demo.html",{waitUntil:"load"});
await pg.waitForTimeout(1000);
const qr=await pg.evaluate(()=>{const c=document.querySelector("#qr-canvas canvas, #qr-canvas img");const l=document.getElementById("wa-link");return {qrDrawn:!!c, qrW:c?c.width||c.getBoundingClientRect().width:0, waHref:l?l.getAttribute("href"):null};});
console.log("DEMO:",JSON.stringify(qr));
await pg.screenshot({path:SC+"demo.png"});
await pg.close();
// mobile home hint
pg=await b.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
await pg.goto("http://localhost:4560/",{waitUntil:"load"});
await pg.waitForTimeout(1500);
await pg.screenshot({path:SC+"hint.png"});
await pg.close();
await b.close(); s.close();
