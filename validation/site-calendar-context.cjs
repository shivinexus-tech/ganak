#!/usr/bin/env node
'use strict';

const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { loadApp, ROOT } = require('./_load-app.cjs');

const read = (file) => fs.readFileSync(path.join(ROOT, file), 'utf8');
const { sharedContextHref } = loadApp('src/components/url-prefs.ts');

const place = { label: 'New Delhi, India', lat: 28.6139, lon: 77.209, zone: 'Asia/Kolkata' };
const href = sharedContextHref('/festival/devshayani-ekadashi', {
  lang: 'hi', place, date: '2026-07-25', calendarMode: 'north-purnimanta', holidayMode: 'gazetted',
});
const parsed = new URL(href, 'https://ganakapp.com');
assert.strictEqual(parsed.pathname, '/festival/devshayani-ekadashi');
assert.deepStrictEqual(Object.fromEntries(parsed.searchParams), {
  lang: 'hi', city: 'New Delhi, India', lat: '28.6139', lon: '77.209', zone: 'Asia/Kolkata',
  date: '2026-07-25', cal: 'north-purnimanta', hol: 'gazetted',
});
assert(!parsed.searchParams.has('muhurat') && !parsed.searchParams.has('question'), 'shared links must not carry unrelated specialist inputs');

const component = read('src/components/DateCalendarContext.tsx');
const daily = read('src/screens/DailyScreen.tsx');
const calendar = read('src/screens/CalendarPage.tsx');
const hub = read('src/screens/MuhuratHub.tsx');
const guide = read('src/screens/FestivalGuideScreen.tsx');

assert.strictEqual((daily.match(/<DateCalendarContext\b/g) || []).length, 1, 'Today must instantiate one shared context component');
for (const prop of ['placeControl=', 'dateControl=', 'calendarControl=', 'holidayControl=', 'sunrise=', 'sunset=']) {
  assert(daily.includes(prop), `shared Today context is missing ${prop}`);
}
assert(component.includes('Calendar & holidays') && component.includes('कैलेंडर और अवकाश'), 'phone disclosure must be bilingual');
assert(component.includes('aria-expanded={mobileControlsOpen}'), 'phone calendar controls must expose their state');
assert(!component.includes('<img') && !component.includes('/festival-images/') && !component.includes('/design-previews/'), 'production context must not embed extracted Figma raster art');
assert(!/\.(?:localStorage|sessionStorage)\b/.test(component + daily + calendar + hub + guide), 'calendar-context journey must not use direct browser storage');

assert(daily.includes('calView ? (') && daily.includes('onCal={openCalendarView}'), 'calendar view must replace the Today body while retaining the shared ribbon');
assert(!calendar.includes('position: "fixed"'), 'calendar must not cover or disconnect the shared controls');
assert(calendar.includes('holidayMode !== "off"') && calendar.includes('Government holiday · separate from Panchang calculation'), 'calendar view must render the selected holiday layer separately');
assert(hub.includes('date: selectedDate, calendarMode, holidayMode'), 'Today festival links must retain date/calendar/holiday context');
assert(calendar.includes('date: selectedDate, calendarMode, holidayMode'), 'calendar festival links must retain date/calendar/holiday context');
assert(guide.includes('sharedContextHref("/"') && guide.includes('extra: { screen: "daily" }'), 'festival Back must restore the exact Today context');

console.log('SITE CALENDAR CONTEXT PASSED (one real shared ribbon; 5 calendar/3 holiday controls retained; calendar + festival route state preserved)');
