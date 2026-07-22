#!/usr/bin/env node
'use strict';
const { loadApp } = require('./_load-app.cjs');
const fs=require('fs');
const { computeDailyWindows, scanSpecialYogaCalendar } = loadApp('src/engine/daily-windows.ts');
const DAY=86400000, DELHI={lat:28.6139,lon:77.2090,zone:'Asia/Kolkata'}, ANAND={lat:22.5645,lon:72.9289,zone:'Asia/Kolkata'};
const CHENNAI={lat:13.0827,lon:80.2707,zone:'Asia/Kolkata'}, KOLKATA={lat:22.5726,lon:88.3639,zone:'Asia/Kolkata'};
let failures=0, windows=0;
const fail=(m)=>{ failures++; console.error('FAIL '+m); };
const hm=(ms,tz)=>new Date(ms+tz*3600000).toISOString().slice(11,16);
for(let i=0;i<370;i++){
  const x=computeDailyWindows(DELHI,Date.UTC(2026,0,1,6,30)+i*DAY);
  if(!x){ fail(`day ${i}: no result`); continue; }
  for(const key of ['bhadra','dur','varjyam','amrit']) for(const w of x[key]){
    windows++; if(!Number.isFinite(w.start)||!Number.isFinite(w.end)||w.end<=w.start) fail(`day ${i} ${key}: invalid interval`);
    if(w.start<x.anchor-1||w.end>x.end+1) fail(`day ${i} ${key}: outside sunrise-day`);
  }
  for(const key of ['bhadra','dur','varjyam','amrit']) {
    const ordered=[...x[key]].sort((a,b)=>a.start-b.start);
    for(let j=1;j<ordered.length;j++) if(ordered[j].start<ordered[j-1].end-1) fail(`day ${i} ${key}: overlapping intervals`);
  }
  for(const key of ['brahma','nishita','godhuli','pradosha']) { const w=x[key]; windows++; if(!w||w.end<=w.start) fail(`day ${i} ${key}: invalid interval`); }
  if(x.chandraBala.length!==12||x.taraBala.length!==27) fail(`day ${i}: bala coverage incomplete`);
  if(x.gowri.length!==16||x.gowriDay.length!==8||x.gowriNight.length!==8||x.nallaNeram.length!==10||!x.anandadi) fail(`day ${i}: regional timing coverage incomplete`);
  for(const w of x.specialYogaWindows) if(w.end<=w.start||w.start<x.anchor-1||w.end>x.end+1) fail(`day ${i}: invalid special-yoga interval`);
  for(const key of new Set(x.specialYogaWindows.map(w=>w.key))) {
    const ordered=x.specialYogaWindows.filter(w=>w.key===key).sort((a,b)=>a.start-b.start);
    for(let j=1;j<ordered.length;j++) if(ordered[j].start<ordered[j-1].end-1) fail(`day ${i} ${key}: overlapping yoga intervals`);
  }
}
// Published Drik Panchang anchor: Anand, 2026-07-19. Minute-level allowance
// covers coordinate rounding while protecting the nakshatra-offset algorithm.
const a=computeDailyWindows(ANAND,Date.UTC(2026,6,19,6,30));
const near=(actual,want,tol=5)=>Math.abs(Number(actual.slice(0,2))*60+Number(actual.slice(3))-want)<=tol;
if(!a.amrit[0]||!near(hm(a.amrit[0].start,a.tz),10*60+56)||!near(hm(a.amrit[0].end,a.tz),12*60+33)) fail('2026-07-19 Amrit Kalam anchor mismatch');
if(!a.varjyam[0]||!near(hm(a.varjyam[0].start,a.tz),2*60+56,6)) fail('2026-07-19 Varjyam anchor mismatch');
if(!a.dur[0]||!near(hm(a.dur[0].start,a.tz),17*60+38,5)||!near(hm(a.dur[0].end,a.tz),18*60+31,5)) fail('2026-07-19 Dur Muhurta anchor mismatch');
if(a.anandadi.en!=='Mitra') fail(`2026-07-19 Anandadi anchor mismatch: ${a.anandadi.en}`);
const gowriFirst=['uthi','amridha','rogam','labam','dhanam','sugam','soram'];
for(let dow=0;dow<7;dow++){
  const date=19+dow, g=computeDailyWindows(DELHI,Date.UTC(2026,6,date,6,30));
  if(g.dow!==dow||g.gowriDay[0].key!==gowriFirst[dow]) fail(`Gowri weekday ${dow} published-table anchor mismatch`);
}
const yogaKeys=(m,d)=>new Set(computeDailyWindows(DELHI,Date.UTC(2026,m-1,d,6,30)).specialYogas.map(x=>x.key));
if(!yogaKeys(3,24).has('dwipushkar')) fail('2026-03-24 Dwipushkar published-date anchor missing');
if(!yogaKeys(4,19).has('tripushkar')) fail('2026-04-19 Tripushkar published-date anchor missing');
if(!yogaKeys(7,19).has('amritaSiddhi')) fail('2026-07-19 Amrita Siddhi weekday/nakshatra anchor missing');
const sarvarthaAnchor=(m,d,start)=>{const x=computeDailyWindows(DELHI,Date.UTC(2026,m-1,d,6,30)),w=x.specialYogaWindows.find(y=>y.key==='sarvartha');if(!w||!near(hm(w.start,x.tz),start,2))fail(`2026-${m}-${d} Sarvartha boundary anchor mismatch`);};
// Published Delhi occurrence/boundary anchors: Anuradha on Monday, Shravana
// on Saturday, Revati on Thursday and Hasta on Wednesday respectively.
sarvarthaAnchor(3,9,16*60+11);
sarvarthaAnchor(4,11,13*60+39);
sarvarthaAnchor(4,16,13*60+58);
sarvarthaAnchor(4,29,5*60+42);
const cal=scanSpecialYogaCalendar(DELHI,Date.UTC(2026,0,1,6,30),366);
if(!cal.length) fail('special-yoga calendar empty');
const requiredYogas=['sarvartha','amritaSiddhi','raviYoga','raviPushya','guruPushya','dwipushkar','tripushkar','gandaMoola'];
const yearlyCounts=Object.fromEntries(requiredYogas.map(k=>[k,0]));
for(const day of cal) for(const y of day.yogas) if(y.key in yearlyCounts) yearlyCounts[y.key]++;
for(const key of requiredYogas) if(yearlyCounts[key]===0) fail(`2026 ${key}: no occurrence in dedicated yearly calendar`);
// Regional helpers must remain complete across anchor cities and not depend on
// Delhi's sunrise length. The labels follow published weekday tables while the
// boundaries scale to each city's local sunrise/sunset.
for(const [name,place] of [['Chennai',CHENNAI],['Kolkata',KOLKATA]]) for(let i=0;i<14;i++) {
  const x=computeDailyWindows(place,Date.UTC(2026,0,1+i,6,30));
  if(!x||x.gowriDay.length!==8||x.gowriNight.length!==8||x.nallaNeram.length<1) fail(`${name} day ${i}: regional timing coverage incomplete`);
  else if(x.gowriDay[0].key!==gowriFirst[x.dow]) fail(`${name} day ${i}: weekday table shifted`);
}
const polar=computeDailyWindows({lat:69.6492,lon:18.9553,zone:'Europe/Oslo'},Date.UTC(2026,5,21,12));
if(polar!==null) fail('polar day should return an explicit unavailable result');
const ui=fs.readFileSync('src/components/DailyWindowsCard.tsx','utf8');
if(!ui.includes('Daily decision windows unavailable')||!ui.includes('दैनिक निर्णय-काल उपलब्ध नहीं')) fail('polar/unavailable bilingual recovery UI missing');
if(failures){ console.error(`daily-windows FAILED: ${failures}`); process.exit(1); }
console.log(`✓ daily-windows PASSED (${windows} intervals across 370 days; no zero/overlap defects; 3-city regional anchors; all 8 yoga calendars, ${cal.length} yoga dates)`);
