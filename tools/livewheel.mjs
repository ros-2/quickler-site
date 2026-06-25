import { chromium } from "playwright";
const EXE="/home/balnagowan/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell";
const b=await chromium.launch({executablePath:EXE,args:["--no-sandbox","--disable-gpu"]});
const pg=await b.newPage({viewport:{width:1280,height:860}});
await pg.goto("https://quickler.co/?w="+Date.now()%9999,{waitUntil:"networkidle"});
await pg.waitForTimeout(800);
await pg.mouse.move(640,430); await pg.mouse.wheel(0,600); await pg.waitForTimeout(500);
console.log("LIVE wheel -> scrollTop="+(await pg.evaluate(()=>Math.round(document.querySelector('.story-scroll').scrollTop))));
await b.close();
