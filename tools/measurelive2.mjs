import { chromium } from "playwright";
const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:1000}});
await pg.goto("https://quickler.co/",{waitUntil:"networkidle",timeout:30000});await pg.waitForTimeout(1500);
const m=await pg.evaluate(()=>{const nav=document.querySelector("nav").getBoundingClientRect();const pill=document.querySelector(".hero-label").getBoundingClientRect();return{gap:Math.round(pill.top-nav.bottom)};});
console.log("LIVE nav->pill gap:",m.gap,"px");
await b.close();
