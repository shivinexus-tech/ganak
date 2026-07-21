#!/usr/bin/env node
'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { loadApp, ROOT } = require('./_load-app.cjs');

const routeModule = loadApp('src/screens/FestivalGuideScreen.tsx');
const vidhiModule = loadApp('src/data/vrat-vidhis.ts');
const metaModule = loadApp('src/data/festival-meta.ts');
assert.strictEqual(routeModule.decidingKalaLabel('solar-ingress', 'en'), 'the exact moment Surya enters the next rashi');
assert.strictEqual(routeModule.decidingKalaLabel('solar-ingress', 'hi'), 'सूर्य के अगली राशि में प्रवेश का ठीक क्षण');
assert.strictEqual(routeModule.decidingKalaLabel('internal-code-that-must-not-leak', 'en'), null);
console.log('PASS  internal deciding-kala codes receive safe bilingual labels or stay hidden');
const expected = {
  '/festival/hartalika-teej': 'hartalikaTeej',
  '/festival/chaitra-navratri': 'chaitraNavratri',
  '/festival/sharad-navratri': 'sharadNavratri',
  '/festival/chhath': 'chhath',
  '/festival/skanda-shashti': 'skandaShashti',
  '/festival/masik-durgashtami': 'masikDurgashtami',
  '/festival/vat-savitri': 'vatSavitri',
  '/festival/vat-purnima': 'vatPurnima',
  '/festival/varalakshmi': 'varalakshmi',
  '/festival/skanda-sashti-begins': 'kandaSashtiAnnual',
  '/festival/skanda-sashti-soorasamharam': 'kandaSashtiAnnual',
  '/festival/skanda-sashti-thirukalyanam': 'kandaSashtiAnnual',
  '/festival/ayyappa-mandala-begins': 'ayyappaMandala',
  '/festival/ayyappa-mandala-puja': 'ayyappaMandala',
  '/festival/makar-sankranti': 'makarSankranti',
};

for (const [urlPath, vidhiKey] of Object.entries(expected)) {
  const guide = routeModule.festivalGuideFromPath(urlPath);
  assert(guide, `${urlPath} must resolve to a guide`);
  assert.strictEqual(guide.vidhiKey, vidhiKey, `${urlPath} must use ${vidhiKey}`);
  assert(vidhiModule.VRAT_VIDHI[vidhiKey], `${vidhiKey} must exist in VRAT_VIDHI`);
  assert.strictEqual(routeModule.festivalGuideFromPath(`${urlPath}/`), guide, `${urlPath}/ must accept a trailing slash`);
  console.log(`PASS  ${urlPath} -> ${vidhiKey}`);
}

for (const vidhiKey of ['skandaShashti', 'kandaSashtiAnnual', 'masikDurgashtami', 'vatSavitri', 'vatPurnima', 'varalakshmi', 'ayyappaMandala']) {
  const data = vidhiModule.VRAT_VIDHI[vidhiKey];
  assert(data, `${vidhiKey} must exist`);
  for (const field of ['verdict', 'diet', 'sankalpa', 'puja', 'paran', 'udyapan']) {
    assert(data[field]?.en && data[field]?.hi, `${vidhiKey}.${field} must be bilingual`);
  }
  assert(Array.isArray(data.vidhi) && data.vidhi.length >= 3, `${vidhiKey} must include a usable step-by-step vidhi`);
  assert(data.vidhi.every((step) => step.en && step.hi), `${vidhiKey} vidhi steps must be bilingual`);
}
assert(vidhiModule.VRAT_VIDHI.ayyappaMandala.safety?.en && vidhiModule.VRAT_VIDHI.ayyappaMandala.safety?.hi, 'Ayyappa must keep its pilgrimage-specific bilingual health guidance');
console.log('PASS  five approved guide families are complete and bilingual');

const hartalika = vidhiModule.VRAT_VIDHI.hartalikaTeej;
assert(hartalika.puja?.en && hartalika.puja?.hi, 'Hartalika puja introduction must be bilingual');
assert(hartalika.pujaMaterials?.en && hartalika.pujaMaterials?.hi, 'Hartalika materials must be bilingual');
assert(Array.isArray(hartalika.pujaPanchopachara) && hartalika.pujaPanchopachara.length >= 9, 'Hartalika must include a complete household Panchopachara path');
assert.strictEqual(hartalika.pujaShodashopachara?.length, 16, 'Hartalika Shodashopachara must contain all 16 ordered offerings');
for (const field of ['pujaPanchopachara', 'pujaShodashopachara']) {
  assert(hartalika[field].every((step) => step.en && step.hi), `Hartalika ${field} steps must be bilingual`);
}
assert(hartalika.pujaCompletion?.en && hartalika.pujaCompletion?.hi, 'Hartalika must explain katha, aarti and respectful completion');
const hartalikaText = JSON.stringify(hartalika);
assert(!hartalikaText.includes('only if you know it') && !hartalikaText.includes('केवल जानकार के लिए'), 'Hartalika must not dismiss the full puja instead of explaining it');
for (const offering of ['Gandha', 'Pushpa', 'Dhupa', 'Dipa', 'Naivedya', 'Dhyana', 'Avahana', 'Asana', 'Padya', 'Arghya', 'Achamaniya', 'Snana', 'Vastra', 'Yajnopavita', 'Tambula']) {
  assert(hartalikaText.includes(offering), `Hartalika procedure must retain ${offering}`);
}
console.log('PASS  Hartalika has complete bilingual Panchopachara and 16-offering Shodashopachara paths');

const makar = vidhiModule.VRAT_VIDHI.makarSankranti;
for (const field of ['verdict', 'meaning', 'diet', 'sankalpa', 'puja', 'paran', 'udyapan', 'safety']) {
  assert(makar[field]?.en && makar[field]?.hi, `makarSankranti.${field} must be bilingual`);
}
for (const field of ['vidhi', 'stories', 'regional']) {
  assert(Array.isArray(makar[field]) && makar[field].length >= 3, `makarSankranti.${field} must be substantial`);
  assert(makar[field].every((item) => item.en && item.hi), `makarSankranti.${field} must be bilingual`);
}
assert(makar.meaning.en.includes('winter solstice'), 'Makar guide must explain the modern Uttarayana/solstice distinction');
assert(JSON.stringify(makar).includes('til') && JSON.stringify(makar).includes('तिल'), 'Makar guide must cover til in both languages');
console.log('PASS  Makar Sankranti has a substantive bilingual festival guide');

const monthlySkanda = vidhiModule.VRAT_VIDHI.skandaShashti;
const annualSkanda = vidhiModule.VRAT_VIDHI.kandaSashtiAnnual;
const monthlySkandaText = JSON.stringify(monthlySkanda);
const annualSkandaText = JSON.stringify(annualSkanda);
assert(monthlySkanda.verdict.en.includes('one-day'), 'monthly Skanda must identify itself as a one-day vrata');
assert(!monthlySkanda.verdict.en.includes('annual') && !monthlySkanda.verdict.hi.includes('वार्षिक'), 'monthly Skanda verdict must describe only the selected monthly occurrence');
assert(!monthlySkandaText.includes('state whether'), 'monthly Skanda must not ask the user to identify an occurrence the calendar already knows');
assert(!monthlySkandaText.includes('Traditional forms') && !monthlySkandaText.includes('One documented') && !monthlySkandaText.includes('form of vrata'), 'monthly Skanda must avoid vague research-language copy');
assert(annualSkanda.verdict.en.includes('six-day'), 'annual Kanda Sashti must identify itself as a six-day observance');
assert(!annualSkandaText.includes('state whether'), 'annual Kanda Sashti must not ask the user to identify the occurrence');
assert(!annualSkandaText.includes('Traditional forms') && !annualSkandaText.includes('One documented'), 'annual Kanda Sashti must avoid vague research-language copy');
console.log('PASS  monthly one-day and annual six-day Skanda guidance remain separate');

const samples = {
  '/festival/karva-chauth': { key: 'karvaChauth', vidhiKey: 'karvaChauth' },
  '/festival/makar-sankranti': { key: 'makarSankranti', vidhiKey: 'makarSankranti' },
  '/festival/mokshada-ekadashi': { key: 'Margshirsh_Shukla_11', vidhiKey: 'ekadashi' },
  '/festival/ravi-pradosh': { key: 'pradosh_Sunday', vidhiKey: 'pradosh' },
};
for (const [urlPath, want] of Object.entries(samples)) {
  const guide = routeModule.festivalGuideFromPath(urlPath);
  assert(guide, `${urlPath} must resolve to a guide/meta page`);
  assert.strictEqual(guide.key, want.key, `${urlPath} must resolve ${want.key}`);
  assert.strictEqual(guide.vidhiKey, want.vidhiKey, `${urlPath} vidhi mapping must be stable`);
  const sourceMeta = guide.sourceKind === 'festival'
    ? metaModule.FEST_META[guide.metaKey]
    : metaModule.OBS_META[guide.metaKey];
  assert(sourceMeta, `${urlPath} must have source metadata`);
  assert.strictEqual(routeModule.festivalGuideFromPath(`${urlPath}/`), guide, `${urlPath}/ must accept a trailing slash`);
  console.log(`PASS  ${urlPath} -> ${want.key}${want.vidhiKey ? ` (${want.vidhiKey} vidhi)` : ' (meta)'}`);
}

assert.strictEqual(routeModule.festivalGuideFromPath('/festival/not-a-guide'), null, 'unknown festival paths must not resolve');
assert.strictEqual(routeModule.festivalGuideFromPath('/festival/durga-puja-mahalaya'), null, 'deferred multi-day routes must not be invented');
assert.strictEqual(routeModule.festivalGuideFromPath('/'), null, 'the home page must not resolve as a festival guide');

const DELHI = { label: 'New Delhi, India', lat: 28.61, lon: 77.21, zone: 'Asia/Kolkata' };
const IST = 5.5;
const fmt = (ms) => new Date(ms + IST * 3600000).toISOString().slice(0, 10);

const karva = routeModule.festivalGuideFromPath('/festival/karva-chauth');
const karvaLocal = routeModule.findLocalFestivalOccurrence(karva, DELHI, Date.UTC(2026, 9, 1) - IST * 3600000);
assert(karvaLocal.hit, 'Karva Chauth must resolve a local date for Delhi');
assert.strictEqual(fmt(karvaLocal.hit.ms), '2026-10-29', `Karva Chauth Delhi date expected 2026-10-29, got ${fmt(karvaLocal.hit.ms)}`);
assert(karvaLocal.detail && karvaLocal.detail.moonrise != null, 'Karva Chauth must expose local moonrise for paran');
console.log(`PASS  local Karva Chauth Delhi ${fmt(karvaLocal.hit.ms)} with moonrise`);

const mokshada = routeModule.festivalGuideFromPath('/festival/mokshada-ekadashi');
const mokshadaLocal = routeModule.findLocalFestivalOccurrence(mokshada, DELHI, Date.UTC(2026, 11, 1) - IST * 3600000);
assert(mokshadaLocal.hit, 'Mokshada Ekadashi must resolve a local date for Delhi');
assert.strictEqual(fmt(mokshadaLocal.hit.ms), '2026-12-20', `Mokshada Delhi date expected 2026-12-20, got ${fmt(mokshadaLocal.hit.ms)}`);
assert(mokshadaLocal.detail && mokshadaLocal.detail.parana, 'Mokshada must expose local paran window');
console.log(`PASS  local Mokshada Ekadashi Delhi ${fmt(mokshadaLocal.hit.ms)} with paran`);

assert.throws(
  () => routeModule.findLocalFestivalOccurrence(karva, { label: 'Nowhere', zone: 'Asia/Kolkata' }),
  /place-required/,
  'missing coordinates must fail clearly',
);
console.log('PASS  missing coordinates surface a clear failure');

const shell = fs.readFileSync(path.join(ROOT, 'src/kundli-app.tsx'), 'utf8');
const card = fs.readFileSync(path.join(ROOT, 'src/components/VratVidhiCard.tsx'), 'utf8');
const guideScreen = fs.readFileSync(path.join(ROOT, 'src/screens/FestivalGuideScreen.tsx'), 'utf8');
assert(shell.includes('directFestivalGuide'), 'the shell must render direct festival guides');
assert(shell.includes('onPlace={setPanchPlace}'), 'festival pages must share the shell place picker state');
assert(guideScreen.includes('PlaceInput'), 'festival pages must render PlaceInput');
assert(!/Open this festival in the Daily Panchang/i.test(guideScreen), 'Daily Panchang timing workaround copy must be gone');
assert(!/दैनिक पंचांग में देखें/.test(guideScreen), 'Hindi Daily Panchang timing workaround copy must be gone');
assert(card.includes('initiallyOpen = false'), 'normal VratVidhiCard behaviour must remain closed by default');
assert(card.includes('useState(initiallyOpen)'), 'direct routes must be able to open the full guide immediately');
assert(card.includes('data.safety || VRAT_VIDHI_SAFETY'), 'a guide-specific safety note must override the shared fasting note');

console.log('PASS  place-aware festival page wiring present');
console.log('PASS  normal festival cards remain closed by default');
console.log('PASS  unknown paths leave the existing app route unchanged');
console.log('\nFESTIVAL DEEPLINK REGRESSION PASSED');
