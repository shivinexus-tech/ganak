'use strict';

const crypto = require('node:crypto');
const sharp = require('sharp');

const EXPECTED_WIDTH = 1280;
const EXPECTED_HEIGHT = 480;
const MIN_BYTES = 10_000;

function inspectWebP(buffer) {
  if (!Buffer.isBuffer(buffer)) throw new Error('asset is not a Buffer');
  if (buffer.length < 30) throw new Error(`asset is too small to be a decodable WebP (${buffer.length} bytes)`);
  if (buffer.toString('ascii', 0, 4) !== 'RIFF' || buffer.toString('ascii', 8, 12) !== 'WEBP') {
    throw new Error('asset does not have a RIFF/WEBP signature');
  }
  const riffSize = buffer.readUInt32LE(4);
  if (riffSize + 8 > buffer.length) throw new Error('RIFF length exceeds file length');

  let offset = 12;
  let dimensions = null;
  while (offset + 8 <= buffer.length) {
    const kind = buffer.toString('ascii', offset, offset + 4);
    const size = buffer.readUInt32LE(offset + 4);
    const data = offset + 8;
    const end = data + size;
    if (end > buffer.length) throw new Error(`${kind || 'unknown'} chunk exceeds file length`);

    if (kind === 'VP8 ') {
      if (size < 10 || buffer[data + 3] !== 0x9d || buffer[data + 4] !== 0x01 || buffer[data + 5] !== 0x2a) {
        throw new Error('invalid VP8 frame header');
      }
      dimensions = {
        width: buffer.readUInt16LE(data + 6) & 0x3fff,
        height: buffer.readUInt16LE(data + 8) & 0x3fff,
      };
    } else if (kind === 'VP8L') {
      if (size < 5 || buffer[data] !== 0x2f) throw new Error('invalid VP8L frame header');
      const bits = buffer.readUInt32LE(data + 1);
      dimensions = { width: (bits & 0x3fff) + 1, height: ((bits >>> 14) & 0x3fff) + 1 };
    } else if (kind === 'VP8X') {
      if (size < 10) throw new Error('invalid VP8X frame header');
      dimensions = {
        width: buffer.readUIntLE(data + 4, 3) + 1,
        height: buffer.readUIntLE(data + 7, 3) + 1,
      };
    }
    offset = end + (size & 1);
  }
  if (!dimensions || !dimensions.width || !dimensions.height) throw new Error('no decodable VP8 frame dimensions found');
  return {
    ...dimensions,
    bytes: buffer.length,
    sha256: crypto.createHash('sha256').update(buffer).digest('hex'),
  };
}

function validateRaster(buffer, options = {}) {
  const { width = EXPECTED_WIDTH, height = EXPECTED_HEIGHT, minBytes = MIN_BYTES } = options;
  const info = inspectWebP(buffer);
  const problems = [];
  if (info.bytes < minBytes) problems.push(`asset is only ${info.bytes} bytes; expected at least ${minBytes}`);
  if (info.width !== width || info.height !== height) {
    problems.push(`asset is ${info.width}×${info.height}; expected ${width}×${height}`);
  }
  return { info, problems };
}

async function assertDecodable(buffer) {
  try {
    await sharp(buffer, { failOn: 'error' }).raw().toBuffer();
  } catch (error) {
    throw new Error(`image decoder rejected WebP payload: ${error.message}`);
  }
}

function duplicateProblems(records, sharedAllowlist = new Set()) {
  const byHash = new Map();
  const problems = [];
  for (const record of records) {
    if (!record.sha256) continue;
    const priorKeys = byHash.get(record.sha256) || [];
    if (!priorKeys.length) {
      byHash.set(record.sha256, [record.key]);
      continue;
    }
    for (const prior of priorKeys) {
      const pair = [prior, record.key].sort().join('|');
      if (!sharedAllowlist.has(pair)) {
        problems.push(`duplicate raster bytes: ${prior}.webp and ${record.key}.webp (${record.sha256})`);
      }
    }
    priorKeys.push(record.key);
    byHash.set(record.sha256, priorKeys);
  }
  return problems;
}

function fixtureWebP(width = EXPECTED_WIDTH, height = EXPECTED_HEIGHT, totalBytes = MIN_BYTES) {
  const size = Math.max(totalBytes, 30);
  const buffer = Buffer.alloc(size);
  buffer.write('RIFF', 0, 'ascii');
  buffer.writeUInt32LE(size - 8, 4);
  buffer.write('WEBP', 8, 'ascii');
  buffer.write('VP8 ', 12, 'ascii');
  buffer.writeUInt32LE(size - 20, 16);
  buffer[23] = 0x9d; buffer[24] = 0x01; buffer[25] = 0x2a;
  buffer.writeUInt16LE(width, 26);
  buffer.writeUInt16LE(height, 28);
  return buffer;
}

async function runMutationFixtures() {
  const expectedFailure = (label, fn, pattern) => {
    let message = '';
    try { fn(); } catch (error) { message = error.message; }
    if (!pattern.test(message)) throw new Error(`${label} fixture was not rejected (${message || 'no error'})`);
  };
  expectedFailure('bad signature', () => inspectWebP(Buffer.alloc(64)), /RIFF|WebP/);
  expectedFailure('truncated chunk', () => {
    const b = fixtureWebP(); b.writeUInt32LE(b.length, 16); inspectWebP(b);
  }, /chunk exceeds/);
  const tiny = validateRaster(fixtureWebP(1280, 480, 100), { minBytes: MIN_BYTES });
  if (!tiny.problems.some((p) => p.includes('expected at least'))) throw new Error('tiny-file fixture was not rejected');
  const wrong = validateRaster(fixtureWebP(640, 240));
  if (!wrong.problems.some((p) => p.includes('expected 1280×480'))) throw new Error('wrong-dimensions fixture was not rejected');
  const duplicate = duplicateProblems([{ key: 'a', sha256: 'same' }, { key: 'b', sha256: 'same' }]);
  if (duplicate.length !== 1) throw new Error('duplicate fixture was not rejected');
  const allowed = duplicateProblems(
    [{ key: 'a', sha256: 'same' }, { key: 'b', sha256: 'same' }],
    new Set(['a|b']),
  );
  if (allowed.length) throw new Error('explicit shared-art allowlist fixture was rejected');
  const duplicateGroups = duplicateProblems([
    { key: 'a', sha256: 'same-1' }, { key: 'b', sha256: 'same-1' },
    { key: 'c', sha256: 'same-2' }, { key: 'd', sha256: 'same-2' },
  ]);
  if (duplicateGroups.length !== 2) {
    throw new Error(`multiple duplicate groups fixture found ${duplicateGroups.length}; expected 2`);
  }
  let decodeMessage = '';
  try {
    await assertDecodable(fixtureWebP());
  } catch (error) {
    decodeMessage = error.message;
  }
  if (!/decoder rejected/.test(decodeMessage)) {
    throw new Error('header-only fake WebP fixture was not rejected by the image decoder');
  }
}

module.exports = {
  EXPECTED_WIDTH,
  EXPECTED_HEIGHT,
  MIN_BYTES,
  inspectWebP,
  validateRaster,
  assertDecodable,
  duplicateProblems,
  runMutationFixtures,
};
