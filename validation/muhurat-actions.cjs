#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const src=fs.readFileSync('src/components/MuhuratActions.tsx','utf8');
for(const token of ['muhuratShareUrl','mfrom','mto','maction','BEGIN:VCALENDAR','BEGIN:VALARM','TRIGGER:-PT24H']) {
  assert(src.includes(token),`Muhurat actions missing ${token}`);
}
assert(src.includes('DTSTART;VALUE=DATE:'),'calendar export must preserve the selected Muhurat date across device timezones');
assert(src.includes('DTEND;VALUE=DATE:'),'all-day calendar export must include an exclusive next-day end');
assert(src.includes('Local Muhurat for ${placeLabel}: ${localWindow}'),'calendar details must retain the chosen place and its local window');
assert(!src.includes('`DTSTART:${icsStamp(start)}`'),'calendar export must not convert the chosen local date into a device-local previous day');
assert(!/localStorage|sessionStorage/.test(src),'Muhurat actions must not use browser storage');
assert(src.includes('No browser storage')&&src.includes('कोई ब्राउज़र संग्रह नहीं'),'privacy explanation must follow language');
console.log('✓ muhurat-actions PASSED (stable URL state, ICS export, calendar reminder and no browser storage)');
