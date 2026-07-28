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
assert(src.includes('Copy link to this result')&&src.includes('इस परिणाम का लिंक कॉपी करें'),'share action must say plainly what is copied');
assert(src.includes('Send this result to someone or open it again later.')&&src.includes('यह परिणाम किसी को भेजें या बाद में फिर खोलें।'),'share purpose must be explained in both languages');
assert(!src.includes('Copy permanent link')&&!src.includes('स्थायी लिंक कॉपी करें'),'technical permanence jargon must not appear in the share action');
assert(src.includes('Add this reminder for ${place.label}?')&&src.includes('${place.label} के लिए स्मरण जोड़ें?'),'calendar export must confirm the selected city in both languages');
assert(src.includes('The date and Muhurat window use this city’s local time.')&&src.includes('तारीख़ और मुहूर्त का समय इसी शहर के स्थानीय समय में है।'),'city confirmation must explain local timing');
assert(src.includes('Yes, add to calendar')&&src.includes('Change city')&&src.includes('हाँ, कैलेंडर में जोड़ें')&&src.includes('शहर बदलें'),'city confirmation must offer clear proceed/change actions');
assert(src.includes('onClick={() => setConfirmCity(true)}'),'initial calendar action must open city confirmation');
assert(!src.includes('onClick={exportCalendar} style={{ minHeight: T.ctrlH, borderRadius: T.rMd, padding: "8px 13px", border: `1px solid ${C.line}`'),'initial calendar action must not create a file before confirmation');
console.log('✓ muhurat-actions PASSED (stable URL state, ICS export, calendar reminder and no browser storage)');
