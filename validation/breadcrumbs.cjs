#!/usr/bin/env node
'use strict';

// Behaviour gate for the standalone-page breadcrumb trail builder.
// The last item is always the current page (href === null); every earlier item links.

const { loadApp } = require('./_load-app.cjs');
const { breadcrumbTrail } = loadApp('src/components/Breadcrumbs.tsx');

let failures = 0;
const check = (c, m) => { if (c) console.log('PASS  ' + m); else { failures++; console.error('FAIL  ' + m); } };
const labels = (t) => t.map((x) => x.label);
const lastNoLink = (t) => t.length > 0 && t[t.length - 1].href === null && t.slice(0, -1).every((x) => typeof x.href === 'string' && x.href.length > 0);

const med = breadcrumbTrail({ medical: true }, 'en');
check(JSON.stringify(labels(med)) === JSON.stringify(['Ganak', 'Muhurat', 'Medical timing']), 'medical EN trail = Ganak > Muhurat > Medical timing');
check(lastNoLink(med), 'medical: only the current (last) item has no href');
check(/lang=en/.test(med[0].href) && /muhurat-finder/.test(med[1].href), 'medical ancestor hrefs (home + finder anchor)');

const medHi = breadcrumbTrail({ medical: true }, 'hi');
check(JSON.stringify(labels(medHi)) === JSON.stringify(['गणक', 'मुहूर्त', 'चिकित्सा समय']), 'medical HI trail localised');

const cat = breadcrumbTrail({ utility: { kind: 'catalogue' } }, 'en');
check(JSON.stringify(labels(cat)) === JSON.stringify(['Ganak', 'Jyotish', 'Calculators']), 'calculator catalogue trail = Ganak > Jyotish > Calculators');
check(lastNoLink(cat), 'catalogue: current has no href');
check(/screen=chart/.test(cat[1].href), 'calculator catalogue: Jyotish parent links to the chart workspace');

const detail = breadcrumbTrail({ utility: { kind: 'calculator', calculator: { en: 'Mangal Dosha', hi: 'मंगल दोष', slug: 'mangal-dosha' } } }, 'en');
check(JSON.stringify(labels(detail)) === JSON.stringify(['Ganak', 'Jyotish', 'Calculators', 'Mangal Dosha']), 'calculator detail trail = Ganak > Jyotish > Calculators > <name>');
check(/\/calculators/.test(detail[2].href), 'calculator detail: Calculators links to /calculators');
const linkedDetail = breadcrumbTrail(
  { utility: { kind: 'calculator', calculator: { en: 'Moon sign', hi: 'राशि', slug: 'rashi' } } },
  'en',
  '?lang=en&city=San+Francisco%2C+USA&lat=37.77&lon=-122.42&zone=America%2FLos_Angeles',
);
for (const href of [linkedDetail[1].href, linkedDetail[2].href]) {
  check(/city=San\+Francisco%2C\+USA/.test(href) && /lat=37.77/.test(href) && /lon=-122.42/.test(href) && /zone=America%2FLos_Angeles/.test(href), 'calculator ancestor preserves the complete linked-city context');
}

const catHi = breadcrumbTrail({ utility: { kind: 'catalogue' } }, 'hi');
check(JSON.stringify(labels(catHi)) === JSON.stringify(['गणक', 'ज्योतिष', 'कैलकुलेटर']), 'calculator catalogue HI trail localised');

const fest = breadcrumbTrail({ festival: { key: 'diwali' } }, 'en');
check(fest.length === 2 && fest[0].label === 'Ganak' && fest[1].href === null && fest[1].label.length > 0, 'festival trail = Ganak > <name>, current no link');

// No standalone route → only the home crumb (component renders nothing for length < 2).
const none = breadcrumbTrail({}, 'en');
check(none.length === 1 && none[0].label === 'Ganak', 'no standalone route → single home crumb (component hides)');

if (failures) { console.error(`\nbreadcrumbs FAILED: ${failures}`); process.exit(1); }
console.log('\nBREADCRUMBS GATE PASSED');
