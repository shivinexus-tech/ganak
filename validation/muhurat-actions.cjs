#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const src=fs.readFileSync('src/components/MuhuratActions.tsx','utf8');
for(const token of ['muhuratShareUrl','mfrom','mto','maction','BEGIN:VCALENDAR','BEGIN:VALARM','TRIGGER:-PT24H']) {
  assert(src.includes(token),`Muhurat actions missing ${token}`);
}
assert(!/localStorage|sessionStorage/.test(src),'Muhurat actions must not use browser storage');
assert(src.includes('No browser storage')&&src.includes('कोई ब्राउज़र संग्रह नहीं'),'privacy explanation must follow language');
console.log('✓ muhurat-actions PASSED (stable URL state, ICS export, calendar reminder and no browser storage)');
