#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const {loadApp}=require('./_load-app.cjs');
const {MUHURTA_RULES,muhuratScanRange}=loadApp('src/engine/muhurat.ts');
const {PURCHASE_ACTIONS,MUH_CATS}=loadApp('src/data/muhurat-ui.ts');
const DELHI={label:'New Delhi',lat:28.6139,lon:77.209,zone:'Asia/Kolkata'};
for(const cat of ['property','vehicle']){
  assert(MUH_CATS.some((x)=>x.key===cat),`${cat} public category missing`);
  assert(MUHURTA_RULES[cat],`${cat} rule set missing`);
  assert(PURCHASE_ACTIONS[cat]?.options.length>=2,`${cat} dedicated steps missing`);
  for(const option of PURCHASE_ACTIONS[cat].options){
    assert(option.en&&option.hi&&option.note.en&&option.note.hi,`${cat}/${option.value} must be bilingual`);
  }
  const days=muhuratScanRange(DELHI,'lahiri',{y:2026,m:7,d:1},{y:2026,m:12,d:31},cat);
  const valid=days.filter((d)=>d.valid);
  assert(valid.length,`${cat} must produce published-period results`);
  assert(valid[0].activityWindows?.length,`${cat} result must include clean windows`);
  assert(valid[0].factors.some((f)=>f.g),`${cat} result must explain why it qualified`);
}
assert(PURCHASE_ACTIONS.property.options.some((x)=>x.value==='deed'));
assert(PURCHASE_ACTIONS.property.options.some((x)=>x.value==='registration'));
assert(PURCHASE_ACTIONS.vehicle.options.some((x)=>x.value==='delivery'));
console.log('✓ property-vehicle-muhurats PASSED (dedicated deed/registration/purchase and purchase/delivery flows; bilingual rationale; ranked clean-window results)');
