#!/usr/bin/env node
'use strict';
const { loadApp } = require('./_load-app.cjs');
const fs=require('fs');
const { computeDailyWindows, scanSpecialYogaCalendar, chandraBala, pradoshaWindow } = loadApp('src/engine/daily-windows.ts');
const festEngine = loadApp('src/engine/festivals.ts');
const { lakshmiPujaTimings } = loadApp('src/engine/lakshmi-puja.ts');
const DAY=86400000, DELHI={lat:28.6139,lon:77.2090,zone:'Asia/Kolkata'}, ANAND={lat:22.5645,lon:72.9289,zone:'Asia/Kolkata'};
const WASHINGTON={lat:38.9072,lon:-77.0369,zone:'America/New_York'};
const LONDON={lat:51.5083,lon:-0.1256,zone:'Europe/London'};
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
/* Chandra Bala may never promote the avoided positions. Until 2026-08-19 the
   waning arm read `[4,8,12]`, so on every Krishna-paksha day the 8th from the
   Moon — Ashtama Chandra — was reported as supportive to a reader who had just
   picked their own rashi, and was also let through one of the two HARD filters
   in the personalised Muhurat finder. Assert both pakshas, from every transit
   sign, so the inversion cannot come back in either arm. (2026-08-18 Muhurat
   bug bash, F3.) */
const CB_NEVER=[4,8,12], CB_ALWAYS=[1,3,6,7,10,11];
for(const waxing of [true,false]) for(let sign=0;sign<12;sign++){
  const rows=chandraBala(sign,waxing);
  if(rows.length!==12) fail(`chandraBala sign ${sign} ${waxing?'waxing':'waning'}: expected 12 rows, got ${rows.length}`);
  for(const d of CB_NEVER) if(rows.some(r=>r.distance===d&&r.good))
    fail(`chandraBala ${waxing?'waxing':'waning'}, transit sign ${sign}: position ${d} reported supportive — 4/8/12 are the avoided positions in both pakshas`);
  for(const d of CB_ALWAYS) if(!rows.some(r=>r.distance===d&&r.good))
    fail(`chandraBala ${waxing?'waxing':'waning'}, transit sign ${sign}: position ${d} reported weak — 1/3/6/7/10/11 are supportive in both pakshas`);
}
/* ── PRADOSHA ────────────────────────────────────────────────────────────────
   Anchored to Drik Panchang's PUBLISHED 2026 Pradosh Puja times — never to
   Ganak's own output. Fetched 2026-08-19 from
   https://www.drikpanchang.com/vrats/pradoshdates.html for three cities: New Delhi
   (no DST), Washington D.C. (US DST) and London (BST) — so the assertions exercise
   the zone resolver rather than assuming IST, and cover the full seasonal range of
   night lengths. 74 published rows in all.

   Drik states the rule in words on the same page — "day is fixed when Trayodashi
   Tithi falls during Pradosh Kaal which starts after Sunset" — and its published
   times are the window Ganak must reproduce: local sunset to the first fifth of
   the night. Until 2026-08-19 the Panchang card and the festival day-decider drew
   a window 1.5 muhurtas either side of sunset instead, which matched nothing
   published, disagreed with the Lakshmi Puja panel on 25 of 25 sampled
   city-evenings, and manufactured Pradosh Vrat days no panchang lists.
   Reasoned in plans/research/pradosha-definition.md.

   `clip` marks the rows where DRIK clips its published puja window to the
   Trayodashi tithi rather than to the kala. On those rows only the unclipped end
   is a statement about the Pradosha window, so only that end is asserted — the
   other end is a statement about the tithi, and asserting it would be asserting
   the wrong thing. */
const PRADOSH_PUBLISHED = {
  'New Delhi': { place: DELHI, zone: 'Asia/Kolkata', rows: [
    [1,1,'17:35','20:19',null],   [1,16,'17:47','20:29',null],  [1,30,'17:59','20:37',null],
    [2,14,'18:10','20:44',null],  [3,1,'18:21','19:09','end'],  [3,16,'18:30','20:54',null],
    [3,30,'18:38','20:57',null],  [4,15,'18:47','21:00',null],  [4,28,'18:54','21:04',null],
    [5,14,'19:04','21:09',null],  [5,28,'19:12','21:15',null],  [6,12,'19:36','21:20','start'],
    [6,27,'19:23','21:23',null],  [7,12,'19:22','21:24',null],  [7,26,'19:16','21:21',null],
    [8,10,'19:05','21:14',null],  [8,25,'18:51','21:04',null],  [9,8,'18:35','20:52',null],
    [9,24,'18:16','20:39',null],  [10,8,'17:59','20:27',null],  [10,23,'17:44','20:16',null],
    [11,6,'17:33','20:09',null],  [11,22,'17:25','20:06',null], [12,6,'17:24','20:07',null],
    [12,21,'17:36','20:13','start'],
  ]},
  'Washington DC': { place: WASHINGTON, zone: 'America/New_York', rows: [
    [1,15,'17:10','20:01',null],  [1,30,'17:27','20:13',null],  [2,14,'17:45','20:24',null],
    [2,28,'18:00','20:32',null],  [3,16,'19:16','21:40',null],  [3,30,'19:30','21:25','end'],
    [4,14,'19:44','21:54',null],  [4,28,'19:58','22:01',null],  [5,14,'20:13','22:10',null],
    [5,28,'20:25','22:17',null],  [6,12,'20:34','22:24',null],  [6,26,'20:38','22:27',null],
    [7,11,'20:35','22:26',null],  [7,26,'20:25','22:21',null],  [8,10,'20:09','22:11',null],
    [8,25,'19:49','21:57',null],  [9,8,'19:28','21:43',null],   [9,23,'19:04','21:26',null],
    [10,7,'18:41','21:11',null],  [10,23,'18:19','20:56',null], [11,6,'17:02','19:46',null],
    [11,21,'18:26','19:40','start'], [12,5,'16:46','19:39',null], [12,21,'16:49','19:44',null],
  ]},
  'London': { place: LONDON, zone: 'Europe/London', rows: [
    [1,1,'16:02','16:52','end'],  [1,15,'16:21','19:28',null],  [1,30,'16:46','19:45',null],
    [2,14,'17:14','20:02',null],  [2,28,'17:39','20:16',null],  [3,16,'18:07','20:31',null],
    [3,30,'19:30','21:44',null],  [4,14,'19:55','21:57',null],  [4,28,'20:19','22:10',null],
    [5,14,'20:44','22:25',null],  [5,28,'21:04','22:37',null],  [6,12,'21:18','22:47',null],
    [6,26,'21:22','22:51',null],  [7,11,'21:34','22:48','start'], [7,26,'20:58','22:38',null],
    [8,10,'20:33','22:22',null],  [8,25,'20:02','22:03',null],  [9,8,'19:31','21:42',null],
    [9,23,'18:57','21:19',null],  [10,7,'18:46','20:58','start'], [10,23,'17:51','20:37',null],
    [11,6,'16:25','19:21',null],  [11,22,'16:03','19:08',null], [12,6,'15:53','19:04',null],
    [12,21,'15:53','19:08',null],
  ]},
};
const FALLBACK_TZ={'Asia/Kolkata':5.5,'America/New_York':-5,'Europe/London':0};
const localDate=(ms,zone)=>new Date(ms).toLocaleDateString('en-CA',{timeZone:zone});
const localHm=(ms,zone)=>new Date(ms).toLocaleTimeString('en-GB',{timeZone:zone,hour:'2-digit',minute:'2-digit'});
const toMin=(s)=>Number(s.slice(0,2))*60+Number(s.slice(3));
let pradoshaChecks=0;
for(const [city,{place,zone,rows}] of Object.entries(PRADOSH_PUBLISHED)){
  for(const [m,d,ps,pe,clip] of rows){
    // Probe at local noon so the sunrise-day resolves to this civil date in any zone.
    const x=computeDailyWindows(place,Date.UTC(2026,m-1,d,12)-FALLBACK_TZ[zone]*3600000);
    if(!x){ fail(`Pradosha ${city} 2026-${m}-${d}: no daily windows`); continue; }
    const gs=localHm(x.pradosha.start,zone), ge=localHm(x.pradosha.end,zone);
    if(localDate(x.pradosha.start,zone)!==`2026-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`)
      fail(`Pradosha ${city} 2026-${m}-${d}: window landed on ${localDate(x.pradosha.start,zone)}`);
    if(clip!=='start'){
      pradoshaChecks++;
      if(Math.abs(toMin(gs)-toMin(ps))>2)
        fail(`Pradosha ${city} 2026-${m}-${d}: start ${gs}, Drik published ${ps} — Pradosha begins AT sunset, it does not open before it`);
    }
    if(clip!=='end'){
      pradoshaChecks++;
      if(Math.abs(toMin(ge)-toMin(pe))>2)
        fail(`Pradosha ${city} 2026-${m}-${d}: end ${ge}, Drik published ${pe} — Pradosha runs the first fifth of the night`);
    }
  }
}
/* ONE definition: the Panchang card and the festival guide's Lakshmi Puja panel
   must return the SAME interval every night. They differed on 25 of 25 sampled
   city-evenings by about an hour at each end until 2026-08-19; both now read
   pradoshaWindow() from daily-windows.ts. This asserts they cannot fork again —
   accuracy is the published-anchor block above, this is sameness. */
let sameness=0;
for(const [city,{place,zone}] of Object.entries(PRADOSH_PUBLISHED)){
  for(let i=0;i<120;i+=1){
    const at=Date.UTC(2026,0,1,12)-FALLBACK_TZ[zone]*3600000+i*3*DAY;
    const card=computeDailyWindows(place,at), guide=lakshmiPujaTimings(place,'lahiri',at);
    if(!card) continue;
    sameness++;
    if(card.pradosha.start!==guide.pradosh.start||card.pradosha.end!==guide.pradosh.end)
      fail(`Pradosha ${city} ${localDate(at,zone)}: card ${localHm(card.pradosha.start,zone)}-${localHm(card.pradosha.end,zone)} vs Lakshmi Puja panel ${localHm(guide.pradosh.start,zone)}-${localHm(guide.pradosh.end,zone)} — two definitions again`);
    if(card.nishita.start!==guide.nishita.start||card.nishita.end!==guide.nishita.end)
      fail(`Nishitha ${city} ${localDate(at,zone)}: card and Lakshmi Puja panel disagree`);
    if(card.pradosha.start!==pradoshaWindow(guide.set,card.end).start)
      fail(`Pradosha ${city} ${localDate(at,zone)}: the card is not using the shared pradoshaWindow()`);
  }
}
/* DECIDE with the window we DISPLAY. The festival engine used to choose the
   observance day with the old centred window while the guide printed the other
   one. This pins the chosen DAYS to Drik's published 2026 Pradosh date lists for
   the same two cities — the half of the defect that was putting Pradosh Vrat days
   in Ganak that no panchang lists (New Delhi 2026 had 27 where Drik has 25). */
for(const [city,{place,zone,rows}] of Object.entries(PRADOSH_PUBLISHED)){
  const fallbackTz=FALLBACK_TZ[zone];
  const {fasts}=festEngine.scanPanchangCalendar(Date.UTC(2026,0,1)-fallbackTz*3600000,fallbackTz,366,366,place);
  const got=fasts.filter((f)=>festEngine.obsKind(f.key)==='pradosh').map((f)=>localDate(f.ms,zone));
  const want=rows.map(([m,d])=>`2026-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`);
  const missing=want.filter((d)=>!got.includes(d)), extra=got.filter((d)=>!want.includes(d));
  if(missing.length) fail(`Pradosh dates ${city}: Drik publishes ${missing.join(' ')} and Ganak does not list them`);
  if(extra.length) fail(`Pradosh dates ${city}: Ganak lists ${extra.join(' ')}, which no published panchang shows`);
  if(!missing.length&&!extra.length) pradoshaChecks+=want.length;
}
if(failures){ console.error(`daily-windows FAILED: ${failures}`); process.exit(1); }
console.log(`✓ daily-windows PASSED (${windows} intervals across 370 days; no zero/overlap defects; 3-city regional anchors; Chandra Bala never promotes 4/8/12 in either paksha (24 sign x paksha checks); all 8 yoga calendars, ${cal.length} yoga dates; Pradosha: ${pradoshaChecks} assertions against Drik's published 2026 Pradosh times and date lists for New Delhi, Washington DC and London, and ${sameness} nights where the Panchang card and the Lakshmi Puja panel return the identical window)`);
