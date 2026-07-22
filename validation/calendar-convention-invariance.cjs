#!/usr/bin/env node
'use strict';
const { loadApp }=require('./_load-app.cjs');
const fs=require('fs');
const { computeTodayPanchang }=loadApp('src/engine/today-panchang.ts');
const { CALENDAR_CONVENTIONS, calendarLabel, safeConvention }=loadApp('src/engine/calendar-conventions.ts');
const DAY=86400000;
const CITIES=[
  {label:'Delhi',lat:28.6139,lon:77.2090,zone:'Asia/Kolkata'},
  {label:'Chennai',lat:13.0827,lon:80.2707,zone:'Asia/Kolkata'},
  {label:'Kolkata',lat:22.5726,lon:88.3639,zone:'Asia/Kolkata'},
  {label:'London',lat:51.5072,lon:-0.1276,zone:'Europe/London'},
  {label:'Sydney',lat:-33.8688,lon:151.2093,zone:'Australia/Sydney'},
];
const immutable=(p)=>JSON.stringify({rise:p.rise,set:p.set,tithi:p.tithis,naks:p.naks,yogas:p.yogas,karanas:p.karanas,rahu:p.rahu,gulika:p.gulika,yama:p.yama,abhijit:p.abhijit});
let checked=0,failures=0;
for(const city of CITIES) for(let i=0;i<15;i++){
  const at=Date.UTC(2026,i%12,1+(i*7)%27,6,30), p=computeTodayPanchang(city,'lahiri',at), before=immutable(p);
  for(const mode of CALENDAR_CONVENTIONS){
    const label=calendarLabel(mode.id,p,p.rise,'en');
    if(!label||!label.trim()) { console.error(`FAIL ${city.label} ${mode.id}: blank label`); failures++; }
    if(immutable(p)!==before) { console.error(`FAIL ${city.label} ${mode.id}: canonical Panchang mutated`); failures++; }
    checked++;
  }
}
if(safeConvention('not-a-mode')!=='canonical') { console.error('FAIL unsupported-mode fallback'); failures++; }
for(const dark of ['tamil-solar','bengali-solar']) if(safeConvention(dark)!=='canonical') { console.error(`FAIL ${dark}: unreviewed mode is exposed`); failures++; }
const enabled=CALENDAR_CONVENTIONS.filter(x=>x.enabled).map(x=>x.id);
for(const required of ['canonical','gregorian','amanta','north-purnimanta']) if(!enabled.includes(required)) { console.error(`FAIL ${required}: supported switch missing`); failures++; }
const daily=fs.readFileSync('src/screens/DailyScreen.tsx','utf8');
if(!/urlPrefPush\("cal",\s*next\)/.test(daily)||!/popstate/.test(daily)||!/CALENDAR_CONVENTIONS\.filter\(x\s*=>\s*x\.enabled\)/.test(daily)) { console.error('FAIL calendar mode URL/back-forward wiring missing'); failures++; }
if(failures){ console.error(`calendar-convention-invariance FAILED: ${failures}`); process.exit(1); }
console.log(`✓ calendar-convention-invariance PASSED (${checked} cross-mode checks; 75 place/date anchors; URL/back-forward wiring; reviewed-mode fallback)`);
