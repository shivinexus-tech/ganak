#!/usr/bin/env node
'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const screen = fs.readFileSync(path.join(ROOT, 'src/screens/FestivalGuideScreen.tsx'), 'utf8');

assert(
  screen.includes('import { festivalRouteContentFor } from "../data/festival-route-content"'),
  'guide screen must consume the route-content data contract',
);
assert(
  screen.includes('festivalRouteContentFor(guide.key)'),
  'canonical route key must drive route-specific lookup',
);
assert(
  screen.includes('guide.sourceKind === "observance" && guide.metaKey !== guide.key'),
  'named recurring variants must be distinguished from their shared family',
);
assert(
  screen.includes('guide.status === "required"') && screen.includes('(!data || isNamedVariant)'),
  'metadata-only and named-variant required routes must require distinct content',
);

for (const field of ['verdict', 'meaning', 'timingNote', 'sourceBoundary']) {
  assert(
    screen.includes(`localizedRouteContentField(content, "${field}", L)`),
    `answer card must render bilingual ${field}`,
  );
}
assert(
  screen.includes('localizedRouteContentField(routeContent, "verdict", L)')
    && screen.includes('localizedRouteContentField(routeContent, "timingNote", L)')
    && screen.includes('localizedRouteContentField(routeContent, "sourceBoundary", L)'),
  'required answer must not render as complete without verdict, timing and source boundary',
);

const answerPosition = screen.indexOf('<RouteSpecificAnswer content={routeContent}');
const timingPosition = screen.indexOf('LOCAL DATE & TIMING');
const sharedGuidePosition = screen.indexOf('<VratVidhiCard data={data}');
assert(answerPosition > 0, 'route-specific answer card must render');
assert(answerPosition < timingPosition, 'answer card must precede technical local timing');
assert(answerPosition < sharedGuidePosition, 'answer card must precede shared family guide');

assert(
  screen.includes('role="alert"')
    && screen.includes('do not treat them as the complete guide for this specific observance')
    && screen.includes('इस विशेष पर्व की पूरी विधि न मानें'),
  'required route-content failures must be visible and bilingual',
);
assert(
  screen.includes('WHAT THIS OBSERVANCE MEANS FOR YOU')
    && screen.includes('इस पर्व का स्पष्ट उत्तर'),
  'answer-first card heading must follow the language toggle',
);
assert(
  screen.includes('Tradition and source boundary:')
    && screen.includes('परम्परा और स्रोत-सीमा:'),
  'source boundary must be visible in both languages',
);

console.log('PASS  canonical route key drives route-specific content lookup');
console.log('PASS  metadata-only and named-variant routes require distinct content');
console.log('PASS  bilingual verdict, meaning, timing note and source boundary render answer-first');
console.log('PASS  missing required content surfaces a visible bilingual error');
console.log('\nFESTIVAL ROUTE CONTENT WIRING PASSED');
