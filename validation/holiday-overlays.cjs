#!/usr/bin/env node
'use strict';

const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { loadApp } = require('./_load-app.cjs');
const holidays = loadApp('src/data/india-holidays.ts');
const ROOT = path.resolve(__dirname, '..');

const data = holidays.INDIA_HOLIDAY_DATASET;
assert.strictEqual(data.year, 2026, 'verified holiday dataset year changed');
assert.strictEqual(data.jurisdiction, 'IN-CENTRAL-DELHI', 'jurisdiction must remain explicit');
assert.strictEqual(data.holidays.length, 17, '2026 Central gazetted inventory must contain 17 dates');
assert.strictEqual(new Set(data.holidays.map((item) => item.date)).size, 17, 'holiday dates must be unique');
assert(data.holidays.every((item) => item.date.startsWith('2026-') && item.name.en && item.name.hi), 'every holiday must be dated and bilingual');

const national = data.holidays.filter((item) => item.kind === 'national');
assert.deepStrictEqual(national.map((item) => item.date), ['2026-01-26', '2026-08-15', '2026-10-02']);
assert.strictEqual(holidays.holidaysForDate('2026-11-08', 'national').length, 0, 'national layer must not absorb gazetted religious dates');
assert.strictEqual(holidays.holidaysForDate('2026-11-08', 'gazetted')[0].name.en, 'Diwali (Deepavali)');
assert.strictEqual(holidays.holidayDatesForYear(2025, 'gazetted').size, 0, 'unverified years must remain empty');
assert.strictEqual(holidays.resolveHolidayMode('invented'), 'national', 'unknown URL modes must recover safely');

for (const date of ['2026-03-21', '2026-05-27', '2026-06-26', '2026-08-26']) {
  assert(holidays.holidaysForDate(date, 'gazetted')[0].lunarNotice, `${date} must retain its moon-notification notice`);
}

const screen = fs.readFileSync(path.join(ROOT, 'src/screens/DailyScreen.tsx'), 'utf8');
const card = fs.readFileSync(path.join(ROOT, 'src/components/HolidayOverlayCard.tsx'), 'utf8');
assert(screen.includes('urlPrefGet("hol")') && screen.includes('urlPrefPush("hol", next)'), 'holiday preference must use URL state');
assert(screen.includes('holidayDatesForYear(cy, holidayMode)'), 'calendar grid must mark the selected holiday layer');
assert(card.includes('This never changes the Hindu Panchang calculation'), 'overlay separation must be explicit');
assert(card.includes('State, bank and local holidays can differ'), 'jurisdiction warning must remain visible');
assert(!/localStorage|sessionStorage/.test(screen + card), 'holiday overlay must not use browser storage');

console.log('HOLIDAY OVERLAY PASSED (3 national + 17 Central gazetted bilingual dates; URL toggle and jurisdiction separation)');
