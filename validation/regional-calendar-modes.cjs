#!/usr/bin/env node
'use strict';
const fs=require('fs');
const {loadApp}=require('./_load-app.cjs');
const {computeTodayPanchang}=loadApp('src/engine/today-panchang.ts');
const {sunEvents,zoneOffset}=loadApp('src/engine/panchang.ts');
const {regionalCalendarDate,calendarLabel,resolveConvention,conventionIsEnabled,DEFAULT_REGIONAL_CALENDAR_FLAGS}=loadApp('src/engine/calendar-conventions.ts');
const evidence=loadApp('src/data/regional-calendar-evidence.ts');
const {regionalCalendarShadowResult}=loadApp('src/engine/regional-calendar-shadow-check.ts');
const DAY=86400000;
let failures=0;
const fail=(m)=>{console.error('FAIL '+m);failures++;};
const isoOrdinal=(iso)=>Date.parse(iso+'T00:00:00Z');
const localParts=(ms,zone)=>{const d0=new Date(ms),off=zoneOffset(zone,d0.getUTCFullYear(),d0.getUTCMonth()+1,d0.getUTCDate())||0,d=new Date(ms+off*3600000);return {y:d.getUTCFullYear(),m:d.getUTCMonth()+1,d:d.getUTCDate(),ordinal:Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate())};};
const atLocalNoon=(iso,place)=>{const [y,m,d]=iso.split('-').map(Number),off=zoneOffset(place.zone,y,m,d)||0;return Date.UTC(y,m-1,d,12)-off*3600000;};
const immutable=(p)=>JSON.stringify({rise:p.rise,set:p.set,tithis:p.tithis,naks:p.naks,yogas:p.yogasP,karanas:p.karanas,rahu:p.rahu,gulika:p.gulika,yama:p.yama,abhijit:p.abhijit});

const CHENNAI={label:'Chennai',lat:13.0827,lon:80.2707,zone:'Asia/Kolkata'};
const KOLKATA={label:'Kolkata',lat:22.5726,lon:88.3639,zone:'Asia/Kolkata'};
const CITIES=[CHENNAI,KOLKATA,{label:'Delhi',lat:28.6139,lon:77.209,zone:'Asia/Kolkata'},{label:'London',lat:51.5072,lon:-0.1276,zone:'Europe/London'},{label:'New York',lat:40.7128,lon:-74.006,zone:'America/New_York'},{label:'Sydney',lat:-33.8688,lon:151.2093,zone:'Australia/Sydney'},{label:'Tromso',lat:69.6492,lon:18.9553,zone:'Europe/Oslo'}];

function anchorSeries(mode){
  const rows=mode==='tamil-solar'?evidence.TAMIL_2026_MONTH_STARTS:evidence.BENGALI_2026_MONTH_STARTS;
  return [[8,mode==='tamil-solar'?'2025-12-16':'2025-12-17',mode==='tamil-solar'?'Margazhi':'Poush'],...rows];
}
function expectedFromStarts(mode,iso){
  const ord=isoOrdinal(iso),rows=anchorSeries(mode); let found=rows[0];
  for(const row of rows) if(isoOrdinal(row[1])<=ord) found=row;
  return {sign:found[0],name:found[2],day:Math.floor((ord-isoOrdinal(found[1]))/DAY)+1};
}

let permanent=0;
for(const [mode,place] of [['tamil-solar',CHENNAI],['bengali-solar',KOLKATA]]){
  for(let i=0;i<365;i++){
    const iso=new Date(Date.UTC(2026,0,1+i)).toISOString().slice(0,10),at=atLocalNoon(iso,place),got=regionalCalendarDate(mode,{},at,place),exp=expectedFromStarts(mode,iso);
    if(got.monthIndex!==exp.sign||got.monthEn!==exp.name||got.day!==exp.day) fail(`${mode} published anchor ${iso}: got ${got.monthEn} ${got.day}; expected ${exp.name} ${exp.day}`);
    permanent++;
  }
}

// Independent annual differential model: published ingress instants + explicit
// regional civil-day rules, not Ganak's calculated ingress or label function.
const ingresses=[[8,Date.parse('2025-12-15T22:54:00Z')],...evidence.PUBLISHED_2026_SANKRANTI_UTC.map(([s,x])=>[s,Date.parse(x)])];
function referenceBoundaries(mode,place){
  return ingresses.map(([sign,ms])=>{const local=localParts(ms,place.zone),tz=zoneOffset(place.zone,local.y,local.m,local.d)||0,ev=sunEvents(local.y,local.m,local.d,tz,place.lat,place.lon),beforeSunset=ev.set!=null&&ms<ev.set,add=mode==='tamil-solar'?(beforeSunset?0:1):(beforeSunset?1:2);return {sign,start:local.ordinal+add*DAY};});
}
let differential=0;
for(const place of CITIES) for(const mode of ['tamil-solar','bengali-solar']){
  const bounds=referenceBoundaries(mode,place);
  for(let i=0;i<365;i++){
    const iso=new Date(Date.UTC(2026,0,1+i)).toISOString().slice(0,10),at=atLocalNoon(iso,place),got=regionalCalendarDate(mode,{},at,place),ord=isoOrdinal(iso);let b=bounds[0];for(const x of bounds)if(x.start<=ord)b=x;
    const day=Math.floor((ord-b.start)/DAY)+1;
    if(got.monthIndex!==b.sign||got.day!==day) fail(`${place.label} ${mode} ${iso}: unexplained differential got sign/day ${got.monthIndex}/${got.day}, reference ${b.sign}/${day}`);
    const label=calendarLabel(mode,{tz:zoneOffset(place.zone,2026,1,1)||0},at,'en',place);if(!label||!label.includes(String(got.day)))fail(`${place.label} ${mode} ${iso}: blank/incomplete label`);
    differential++;
  }
}

if(permanent<200)fail(`only ${permanent} permanent daily anchors`);
if(evidence.REGIONAL_OBSERVANCE_ANCHORS_2026.length<25)fail('fewer than 25 observance anchors');
for(const [,iso] of evidence.REGIONAL_OBSERVANCE_ANCHORS_2026){for(const [mode,place] of [['tamil-solar',CHENNAI],['bengali-solar',KOLKATA]]){const at=atLocalNoon(iso,place),d=regionalCalendarDate(mode,{},at,place);if(!d.monthNative||d.day<1)fail(`${mode} observance label missing ${iso}`);}}
if(evidence.REGIONAL_TERMINOLOGY.tamil.months.length!==12||evidence.REGIONAL_TERMINOLOGY.bengali.months.length!==12)fail('native terminology inventory incomplete');
if(evidence.REGIONAL_TERMINOLOGY.tamil.sources.length<2||evidence.REGIONAL_TERMINOLOGY.bengali.sources.length<2)fail('two-source terminology evidence missing');

for(const id of ['tamil-solar','bengali-solar'])if(!conventionIsEnabled(id,DEFAULT_REGIONAL_CALENDAR_FLAGS))fail(`${id} is not enabled by reviewed default`);
let r=resolveConvention('tamil-solar',{tamilSolar:false,bengaliSolar:true});if(r.id!=='canonical'||r.reason!=='disabled'||r.recoveredFrom!=='tamil-solar')fail('Tamil independent kill switch/recovery failed');
r=resolveConvention('bengali-solar',{tamilSolar:true,bengaliSolar:false});if(r.id!=='canonical'||r.reason!=='disabled'||r.recoveredFrom!=='bengali-solar')fail('Bengali independent kill switch/recovery failed');

const daily=fs.readFileSync('src/screens/DailyScreen.tsx','utf8'),flags=fs.readFileSync('src/engine/regional-calendar-flags.ts','utf8'),fn=fs.readFileSync('functions/api/regional-calendar-flags.ts','utf8');
for(const token of ['urlPrefPush("cal"','urlPrefPush("date"','popstate','loadRegionalCalendarFlags','temporarily disabled','अस्थायी रूप से बन्द','calendarLabel(calendarMode, todayP, todayP.rise'])if(!daily.includes(token))fail(`Daily state/recovery UI missing ${token}`);
const shell=fs.readFileSync('src/kundli-app.tsx','utf8');for(const token of ['placeFromUrl','urlPrefsPush({city:next.label','window.addEventListener("popstate"'])if(!shell.includes(token))fail(`place URL/reload/Back preservation missing ${token}`);
if(!flags.includes('cache:"no-store"')||/localStorage|sessionStorage/.test(flags))fail('runtime flags are cached/stored in browser');
if(!fn.includes('REGIONAL_CALENDAR_FLAGS')||!fn.includes('cache-control')||!fn.includes('no-store'))fail('edge KV kill-switch endpoint incomplete');

// Interpretation calls must leave the canonical Panchang object bit-for-bit
// unchanged. Sample ingress-adjacent and ordinary dates across all locations.
for(const place of CITIES)for(const iso of ['2026-01-14','2026-04-14','2026-07-16','2026-07-18','2026-10-18','2026-12-24']){const at=atLocalNoon(iso,place),p=computeTodayPanchang(place,'lahiri',at),before=immutable(p);for(const mode of ['tamil-solar','bengali-solar'])regionalCalendarDate(mode,p,p.rise||at,place);if(immutable(p)!==before)fail(`${place.label} ${iso}: regional interpretation mutated canonical Panchang`);}
for(const place of CITIES)for(const iso of ['2026-01-14','2026-04-14','2026-07-18','2026-10-19'])for(const mode of ['tamil-solar','bengali-solar']){const at=atLocalNoon(iso,place),r=regionalCalendarShadowResult(mode,{},at,place);if(!r.checked||!r.ok)fail(`${place.label} ${mode} ${iso}: production shadow comparator mismatch`);}
const shadow=fs.readFileSync('src/monitoring/regional-calendar-shadow.ts','utf8'),main=fs.readFileSync('src/main.tsx','utf8');if(!shadow.includes('regional-calendar-shadow-mismatch')||!shadow.includes('ganak:regional-calendar-shadow-error')||!main.includes('reportClientError')||!main.includes('ganak:regional-calendar-shadow-error')||!daily.includes('runRegionalCalendarShadow'))fail('production shadow telemetry wiring missing');

if(failures){console.error(`regional-calendar-modes FAILED: ${failures}`);process.exit(1);}
console.log(`✓ regional-calendar-modes PASSED (${permanent} dual-published anchor-city daily labels; ${differential} full-year multi-city differentials; 25 observances; 24 native terms; independent runtime kill switches; zero unexplained mismatches)`);
