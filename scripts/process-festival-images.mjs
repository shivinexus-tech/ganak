#!/usr/bin/env node
/*
 * Normalize AI-generated festival hero art into shippable web assets.
 *
 * Drop raw generated images into  festival-images-src/  named  <festivalKey>.<ext>
 * (png / jpg / jpeg / webp). Run:
 *
 *     npm run festival-images
 *
 * Each source is cover-fit to 1280×480 (the 2× hero banner) and written as an
 * optimized WebP to  public/festival-images/raster/<festivalKey>.webp , which the
 * app prefers over the SVG placeholder. Filenames must match a known festival key.
 */
import { readdirSync, existsSync, mkdirSync, statSync } from "node:fs";
import { join, extname, basename, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { FESTIVAL_HERO_ART } from "../src/data/festival-hero-art.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC_DIR = join(ROOT, "festival-images-src");
const OUT_DIR = join(ROOT, "public", "festival-images", "raster");
const WIDTH = 1280;
const HEIGHT = 480;
const ACCEPTED = new Set([".png", ".jpg", ".jpeg", ".webp"]);
const VALID_KEYS = new Set(Object.keys(FESTIVAL_HERO_ART));

if (!existsSync(SRC_DIR)) {
  console.error(`No source folder found. Create it and add images:\n  ${SRC_DIR}`);
  process.exit(1);
}
mkdirSync(OUT_DIR, { recursive: true });

const files = readdirSync(SRC_DIR).filter((f) => ACCEPTED.has(extname(f).toLowerCase()));
if (files.length === 0) {
  console.error(`No images in ${SRC_DIR} (accepted: ${[...ACCEPTED].join(", ")}).`);
  process.exit(1);
}

let ok = 0;
const warnings = [];
for (const file of files) {
  const key = basename(file, extname(file));
  if (!VALID_KEYS.has(key)) {
    warnings.push(`skipped "${file}" — "${key}" is not a known festival key`);
    continue;
  }
  const inPath = join(SRC_DIR, file);
  const outPath = join(OUT_DIR, `${key}.webp`);
  const info = await sharp(inPath)
    .resize(WIDTH, HEIGHT, { fit: "cover", position: "attention" })
    .webp({ quality: 82, effort: 6 })
    .toFile(outPath);
  const kb = (statSync(outPath).size / 1024).toFixed(1);
  console.log(`✓ ${key.padEnd(28)} ${WIDTH}×${HEIGHT}  ${kb} KB  (${info.format})`);
  ok++;
}

console.log(`\nDone: ${ok} image(s) → ${OUT_DIR}`);
if (warnings.length) {
  console.log("\nWarnings:");
  for (const w of warnings) console.log(`  ⚠ ${w}`);
}
