#!/usr/bin/env node
'use strict';

const { loadApp } = require('./_load-app.cjs');
const engine = loadApp('src/engine/festivals.ts');

const DELHI = { zone: 'Asia/Kolkata', lat: 28.6139, lon: 77.2090 };
const IST = 5.5;
const minute = (ms) => new Date(ms + IST * 3600000).toISOString().slice(11, 16);
const assertNear = (label, got, expected, toleranceMinutes = 3) => {
  const diff = Math.abs(got - expected) / 60000;
  if (diff > toleranceMinutes) throw new Error(`${label}: ${minute(got)} differs from ${minute(expected)} by ${diff.toFixed(1)} minutes`);
  console.log(`PASS  ${label}: ${minute(got)} (within ${toleranceMinutes} min)`);
};

const makarFor = (year) => {
  const cal = engine.scanPanchangCalendar(Date.UTC(year, 0, 1) - IST * 3600000, IST, 45, 1, DELHI);
  const hit = cal.festivals.find((item) => item.key === 'makarSankranti');
  if (!hit) throw new Error(`${year} Makar Sankranti missing`);
  return hit;
};

const makar2024 = makarFor(2024);
const makar2026 = makarFor(2026);
const makar2027 = makarFor(2027);
assertNear('Delhi 2024 ingress', makar2024.ms, Date.UTC(2024, 0, 14, 21, 24));
assertNear('Delhi 2026 ingress', makar2026.ms, Date.UTC(2026, 0, 14, 9, 43));
assertNear('Delhi 2027 ingress', makar2027.ms, Date.UTC(2027, 0, 14, 15, 44));
const daytime = engine.sankrantiPunyaKala(makar2026.ms, DELHI, IST);
if (!daytime) throw new Error('daytime Punya Kala missing');
assertNear('Delhi 2026 ingress', daytime.ingress, Date.UTC(2026, 0, 14, 9, 43));
assertNear('Delhi 2026 Punya start', daytime.punya.start, Date.UTC(2026, 0, 14, 9, 43));
assertNear('Delhi 2026 Punya end', daytime.punya.end, Date.UTC(2026, 0, 14, 12, 15));
assertNear('Delhi 2026 Maha end', daytime.mahaPunya.end, Date.UTC(2026, 0, 14, 11, 28));
if (daytime.carriedToDaylight) throw new Error('daytime ingress was incorrectly carried');

const afterSunsetIngress = Date.UTC(2026, 0, 14, 16, 30);
const carried = engine.sankrantiPunyaKala(afterSunsetIngress, DELHI, IST);
if (!carried || !carried.carriedToDaylight) throw new Error('after-sunset ingress was not carried to daylight');
if (!(carried.punya.start < carried.punya.end && carried.mahaPunya.end <= carried.punya.end)) throw new Error('carried windows are invalid');
const startLocal = new Date(carried.punya.start + IST * 3600000);
if (startLocal.getUTCDate() !== 15) throw new Error('after-sunset window did not move to the next civil day');
console.log(`PASS  after-sunset carry begins next sunrise: ${minute(carried.punya.start)}`);
console.log('SANKRANTI PUNYA KALA REGRESSION PASSED');
