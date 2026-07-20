#!/usr/bin/env node
// Regression gate for display-safe Panchaka and Lagna windows.
//
// The original failure was a real 36-second Agni interval on 2026-07-30 in
// Delhi. The UI formats times to minutes, so it appeared as 9:31 PM-9:31 PM.
// This gate scans the reported day plus a broad 120-day range and enforces the
// engine contract used by both Daily and the Muhurat finder:
//   - no sub-minute windows,
//   - no visible same-minute spans,
//   - continuous sunrise-to-next-sunrise coverage with no gaps or overlaps,
//   - no adjacent windows that should have been merged.
'use strict';

const { loadApp } = require('./_load-app.cjs');
const { computeLagnaPanchaka } = loadApp('src/engine/panchaka.ts');

const MINUTE = 60_000;
const DAY = 86_400_000;
const IST_MS = 5.5 * 3_600_000;
const DELHI = { zone: 'Asia/Kolkata', lat: 28.6139, lon: 77.2090 };
const START = Date.UTC(2026, 6, 1, 6, 30); // 2026-07-01 12:00 IST
const REPORTED_DAY = '2026-07-30';

let failures = 0;
let daysChecked = 0;
let windowsChecked = 0;

function fail(message) {
  failures++;
  console.error(`FAIL  ${message}`);
}

function localIso(ms) {
  return new Date(ms + IST_MS).toISOString().slice(0, 19).replace('T', ' ');
}

function localDate(ms) {
  return localIso(ms).slice(0, 10);
}

function localMinute(ms) {
  return Math.floor((ms + IST_MS) / MINUTE);
}

function checkSeries(date, label, list, rise, nextRise, keyOf) {
  if (!list.length) {
    fail(`${date} ${label}: no windows returned`);
    return;
  }

  if (Math.abs(list[0].start - rise) > 1) {
    fail(`${date} ${label}: first window does not start at sunrise`);
  }
  if (Math.abs(list[list.length - 1].end - nextRise) > 1) {
    fail(`${date} ${label}: last window does not end at next sunrise`);
  }

  for (let i = 0; i < list.length; i++) {
    const window = list[i];
    const duration = window.end - window.start;
    windowsChecked++;

    if (!Number.isFinite(window.start) || !Number.isFinite(window.end)) {
      fail(`${date} ${label}[${i}]: non-finite boundary`);
      continue;
    }
    if (duration < MINUTE) {
      fail(`${date} ${label}[${i}]: ${Math.round(duration / 1000)}s window (${localIso(window.start)}-${localIso(window.end)})`);
    }
    if (localMinute(window.start) === localMinute(window.end)) {
      fail(`${date} ${label}[${i}]: same-minute display (${localIso(window.start)}-${localIso(window.end)})`);
    }

    if (i > 0) {
      const previous = list[i - 1];
      if (Math.abs(previous.end - window.start) > 1) {
        fail(`${date} ${label}[${i}]: gap or overlap between consecutive windows`);
      }
      if (keyOf(previous) === keyOf(window)) {
        fail(`${date} ${label}[${i}]: adjacent equal windows were not merged`);
      }
    }
  }
}

for (let i = 0; i < 120; i++) {
  const result = computeLagnaPanchaka(DELHI, 'lahiri', START + i * DAY);
  const date = localDate(result.rise);
  daysChecked++;

  if (result.rise == null || result.nextRise == null) {
    fail(`${date}: sunrise boundary missing`);
    continue;
  }

  checkSeries(date, 'lagnaSchedule', result.lagnaSchedule, result.rise, result.nextRise, (window) => window.sign);
  checkSeries(date, 'panchakaWindows', result.panchakaWindows, result.rise, result.nextRise, (window) => window.type);

  if (date === REPORTED_DAY) {
    const badAgni = result.panchakaWindows.find((window) =>
      window.type === 'agni' && localMinute(window.start) === localMinute(window.end));
    if (badAgni) fail(`${REPORTED_DAY}: reported Agni same-minute row returned`);
  }
}

if (failures) {
  console.error(`\nPANCHAKA WINDOW REGRESSION FAILED (${failures} failure${failures === 1 ? '' : 's'})`);
  process.exit(1);
}

console.log(`PASS  Reported ${REPORTED_DAY} Agni same-minute row is absent`);
console.log(`PASS  ${daysChecked} Delhi days have no sub-minute or same-minute windows`);
console.log(`PASS  ${windowsChecked} Panchaka/Lagna windows tile sunrise-to-sunrise without gaps or overlaps`);
console.log('\nPANCHAKA WINDOW REGRESSION PASSED');
