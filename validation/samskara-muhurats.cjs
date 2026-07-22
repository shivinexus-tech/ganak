#!/usr/bin/env node
'use strict';
const { loadApp }=require('./_load-app.cjs');
const { MUHURTA_RULES, muhuratScanRange }=loadApp('src/engine/muhurat.ts');
const { SAMSKARA_INPUTS }=loadApp('src/data/muhurat-ui.ts');
const DELHI={label:'New Delhi',lat:28.6139,lon:77.2090,zone:'Asia/Kolkata'};
const MUMBAI={label:'Mumbai',lat:19.076,lon:72.8777,zone:'Asia/Kolkata'};
const BENGALURU={label:'Bengaluru',lat:12.9716,lon:77.5946,zone:'Asia/Kolkata'};
const KANPUR={label:'Kanpur',lat:26.4499,lon:80.3319,zone:'Asia/Kolkata'};
let failures=0; const fail=m=>{failures++;console.error('FAIL '+m);};
const ceremonies=['mundan','naming','annaprashana','vidyarambha','upanayana'];
for(const key of ceremonies) {
  if(!MUHURTA_RULES[key]) fail(`${key}: missing distinct rule set`);
  if(!SAMSKARA_INPUTS[key]||!SAMSKARA_INPUTS[key].secondary||!SAMSKARA_INPUTS[key].secondaryLabel?.en||!SAMSKARA_INPUTS[key].secondaryLabel?.hi) fail(`${key}: missing distinct bilingual input model`);
}
if(new Set(ceremonies.map(k=>SAMSKARA_INPUTS[k]?.secondary)).size!==ceremonies.length) fail('Samskara input models are not ceremony-specific');
const exact=(set,values,label)=>{const a=[...set].sort((x,y)=>x-y).join(','),b=[...values].sort((x,y)=>x-y).join(',');if(a!==b)fail(`${label}: ${a} != ${b}`);};
// Published rule tables captured from Drik Panchang's Samskara pages, 2026-07-21.
exact(MUHURTA_RULES.naming.goodTithi,[1,2,3,5,7,10,11,12,13],'Namakaran tithi');
exact(MUHURTA_RULES.naming.allowWeekday,[1,3,4,5],'Namakaran weekdays');
exact(MUHURTA_RULES.annaprashana.goodTithi,[2,3,5,7,10,13,15],'Annaprashana tithi');
exact(MUHURTA_RULES.annaprashana.allowWeekday,[1,3,4,5],'Annaprashana weekdays');
exact(MUHURTA_RULES.vidyarambha.goodTithi,[2,3,5,6,10,11,12],'Vidyarambha tithi');
exact(MUHURTA_RULES.vidyarambha.allowWeekday,[0,3,4,5],'Vidyarambha weekdays');
const one=(place,y,m,d,cat)=>muhuratScanRange(place,'lahiri',{y,m,d},{y,m,d},cat)[0];
const anchors=[
  ['Mundan Kanpur 2026-07-18',one(KANPUR,2026,7,18,'mundan'),false],
  ['Vidyarambha Delhi 2026-12-11',one(DELHI,2026,12,11,'vidyarambha'),true],
  ['Annaprashana Delhi 2026-07-25',one(DELHI,2026,7,25,'annaprashana'),false],
  ['Namakaran Mumbai 2026-07-20',one(MUMBAI,2026,7,20,'naming'),false],
  ['Upanayana Bengaluru 2026-07-17',one(BENGALURU,2026,7,17,'upanayana'),false],
];
for(const [label,row,want] of anchors) if(!row||row.valid!==want) fail(`${label}: expected ${want?'available':'no muhurat'}, got ${row?.valid}`);
for(const cat of ceremonies){
  const rows=muhuratScanRange(DELHI,'lahiri',{y:2026,m:1,d:1},{y:2026,m:3,d:31},cat);
  const n=rows.filter(x=>x.valid).length;
  if(rows.length!==90||n===0||n===90) fail(`${cat}: implausible seasonal coverage ${n}/${rows.length}`);
}
if(failures){console.error(`samskara-muhurats FAILED: ${failures}`);process.exit(1);}
console.log('✓ samskara-muhurats PASSED (5 distinct engines and bilingual input models; published rule tables; 5 dated comparator anchors; seasonal coverage)');
