import { chromium } from "playwright";
const EXE="/home/balnagowan/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell";
const SC="/tmp/claude-1000/-home-balnagowan-quickler-engine/7ba1eac7-26e9-49f0-a6d1-8dd163346506/scratchpad/";
const b=await chromium.launch({executablePath:EXE,args:["--no-sandbox","--disable-gpu"]});
const pg=await b.newPage({viewport:{width:1440,height:300}});
await pg.goto("https://quickler.co/?fresh=243",{waitUntil:"networkidle"});
await pg.waitForTimeout(1000);
// close cookie banner so it doesn't cover
await pg.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/close/i.test(x.textContent));if(b)b.click();});
await pg.waitForTimeout(300);
await pg.screenshot({path:SC+"final-pill.png"});
const d=await pg.evaluate(()=>{const n=document.querySelector('nav');const r=n.getBoundingClientRect();return {left:Math.round(r.left),width:Math.round(r.width),radius:getComputedStyle(n).borderTopLeftRadius};});
console.log("LIVE TOP NAV:",JSON.stringify(d));
await b.close();
