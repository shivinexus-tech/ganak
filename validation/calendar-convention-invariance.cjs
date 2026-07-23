#!/usr/bin/env node
'use strict';
const { loadApp }=require('./_load-app.cjs');
const fs=require('fs');
const { computeTodayPanchang }=loadApp('src/engine/today-panchang.ts');
const { CALENDAR_CONVENTIONS, calendarLabel, safeConvention, resolveConvention }=loadApp('src/engine/calendar-conventions.ts');
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
    const label=calendarLabel(mode.id,p,p.rise,'en',city);
    if(!label||!label.trim()) { console.error(`FAIL ${city.label} ${mode.id}: blank label`); failures++; }
    if(immutable(p)!==before) { console.error(`FAIL ${city.label} ${mode.id}: canonical Panchang mutated`); failures++; }
    checked++;
  }
}
if(safeConvention('not-a-mode')!=='canonical') { console.error('FAIL unsupported-mode fallback'); failures++; }
const enabled=CALENDAR_CONVENTIONS.filter(x=>x.enabled).map(x=>x.id);
/* The visible switch list. "amanta" was merged into the default 2026-07-22 — it
   produced a byte-identical label, so offering both was a duplicate choice. */
for(const required of ['canonical','gregorian','north-purnimanta','tamil-solar','bengali-solar']) if(!enabled.includes(required)) { console.error(`FAIL ${required}: supported switch missing`); failures++; }
if(enabled.includes('amanta')) { console.error('FAIL amanta: merged into the default, must not reappear as a separate switch'); failures++; }
/* Retired ids must still resolve SILENTLY so shared/bookmarked links keep working
   and never show an "unsupported mode" warning for output we still produce. */
for(const [retired,expect] of [['amanta','canonical']]){
  const r=resolveConvention(retired);
  if(r.id!==expect||r.recoveredFrom!==null||r.reason!==null) { console.error(`FAIL ${retired}: retired id must resolve silently to ${expect} (got ${JSON.stringify(r)})`); failures++; }
}
/* Duplicate guard: no two offered conventions may render the same label. This is
   the check that would have caught the canonical/amanta duplicate before a user
   did — two switches that produce an identical string are one switch. */
for(const city of CITIES) for(const lang of ['en','hi']){
  const p=computeTodayPanchang(city,'lahiri',Date.UTC(2026,6,23,6,30));
  const seen=new Map();
  for(const mode of CALENDAR_CONVENTIONS){
    const label=calendarLabel(mode.id,p,p.rise,lang,city);
    if(seen.has(label)) { console.error(`FAIL ${city.label}/${lang}: "${mode.id}" and "${seen.get(label)}" render the identical label ${JSON.stringify(label)}`); failures++; }
    seen.set(label,mode.id);
  }
}
for(const [dark,flags] of [['tamil-solar',{tamilSolar:false,bengaliSolar:true}],['bengali-solar',{tamilSolar:true,bengaliSolar:false}]]) { const r=resolveConvention(dark,flags); if(r.id!=='canonical'||r.recoveredFrom!==dark||r.reason!=='disabled') { console.error(`FAIL ${dark}: independent runtime recovery missing`); failures++; } }
const daily=fs.readFileSync('src/screens/DailyScreen.tsx','utf8');
if(!/urlPrefPush\("cal",\s*next\.id\)/.test(daily)||!/popstate/.test(daily)||!daily.includes('conventionIsEnabled')) { console.error('FAIL calendar mode URL/back-forward wiring missing'); failures++; }
if(!daily.includes('That regional mode is temporarily disabled')||!daily.includes('यह क्षेत्रीय पद्धति अस्थायी रूप से बन्द है')) { console.error('FAIL bilingual non-silent fallback UI missing'); failures++; }
if(failures){ console.error(`calendar-convention-invariance FAILED: ${failures}`); process.exit(1); }
console.log(`✓ calendar-convention-invariance PASSED (${checked} cross-mode checks; 75 place/date anchors; URL/back-forward wiring; runtime per-mode fallback)`);
