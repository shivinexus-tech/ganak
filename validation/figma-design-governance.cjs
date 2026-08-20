#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const MANIFEST_PATH = path.join(ROOT, "plans/ganak-design-decision-manifest.json");
const SCHEMA_PATH = path.join(ROOT, "plans/schemas/ganak-design-decision-manifest.schema.json");
const INCIDENTS_PATH = path.join(ROOT, "validation/fixtures/figma-design-governance-known-incidents.json");
const DEFAULT_PACKET = path.join(ROOT, "plans/figma-review-evidence/batch-01-recovery.json");
const PRECEDENCE = ["direct_owner_latest", "direct_owner_earlier", "canonical_human_record", "agent_report", "inference"];
const REVIEW_ROLES = ["mechanical", "accessibility", "ornament_background", "blind_visual", "integrator"];
const STATUS = ["BLOCKED_FROM_OWNER_REVIEW", "NARROW_PASS", "FULL_SCREEN_PASS"];

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function isNodeId(value) {
  return typeof value === "string" && /^\d+:\d+$/.test(value);
}

function resolveRef(root, ref) {
  assert(ref.startsWith("#/"), `unsupported schema ref ${ref}`);
  return ref.slice(2).split("/").reduce((value, key) => value[key], root);
}

function validateJsonSchema(value, schema, root, location = "manifest") {
  if (schema.$ref) return validateJsonSchema(value, resolveRef(root, schema.$ref), root, location);
  if (Object.prototype.hasOwnProperty.call(schema, "const")) {
    assert(JSON.stringify(value) === JSON.stringify(schema.const), `${location}: schema const mismatch`);
  }
  if (schema.enum) assert(schema.enum.includes(value), `${location}: value is not in schema enum`);
  if (schema.type) {
    const allowed = Array.isArray(schema.type) ? schema.type : [schema.type];
    const actual = value === null ? "null" : Array.isArray(value) ? "array" : typeof value;
    assert(allowed.includes(actual), `${location}: expected ${allowed.join("|")}, got ${actual}`);
  }
  if (typeof value === "string") {
    if (schema.pattern) assert(new RegExp(schema.pattern).test(value), `${location}: pattern mismatch`);
    if (schema.minLength !== undefined) assert(value.length >= schema.minLength, `${location}: shorter than minLength`);
    if (schema.format === "date") assert(/^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`)), `${location}: invalid date`);
  }
  if (typeof value === "number" && schema.exclusiveMinimum !== undefined) {
    assert(value > schema.exclusiveMinimum, `${location}: must be greater than ${schema.exclusiveMinimum}`);
  }
  if (Array.isArray(value)) {
    if (schema.minItems !== undefined) assert(value.length >= schema.minItems, `${location}: too few items`);
    if (schema.items) value.forEach((item, index) => validateJsonSchema(item, schema.items, root, `${location}[${index}]`));
  }
  if (value && typeof value === "object" && !Array.isArray(value)) {
    for (const required of schema.required || []) assert(Object.prototype.hasOwnProperty.call(value, required), `${location}: missing ${required}`);
    if (schema.additionalProperties === false) {
      const allowed = new Set(Object.keys(schema.properties || {}));
      for (const key of Object.keys(value)) assert(allowed.has(key), `${location}: unexpected property ${key}`);
    }
    for (const [key, child] of Object.entries(schema.properties || {})) {
      if (Object.prototype.hasOwnProperty.call(value, key)) validateJsonSchema(value[key], child, root, `${location}.${key}`);
    }
  }
}

function validateManifestShape(manifest, schema) {
  validateJsonSchema(manifest, schema, schema);
  assert(schema.$schema && schema.$defs && schema.$defs.crop, "schema must define the crop identity contract");
  assert(manifest.schemaVersion === 1, "manifest schemaVersion must be 1");
  assert(JSON.stringify(manifest.precedence) === JSON.stringify(PRECEDENCE), "manifest precedence is not canonical");
  assert(Array.isArray(manifest.decisions) && manifest.decisions.length > 0, "manifest decisions must be non-empty");
  assert(Array.isArray(manifest.conflicts), "manifest conflicts must be an array");
  assert(JSON.stringify(manifest.batchAdmission.allowedStatuses) === JSON.stringify(STATUS), "typed status vocabulary drifted");
  assert(JSON.stringify(manifest.batchAdmission.fullScreenRequiredReviews) === JSON.stringify(REVIEW_ROLES), "mandatory reviewer roles drifted");
  assert(manifest.batchAdmission.zeroKnownFindings === true, "owner admission must require zero findings");
  assert(manifest.batchAdmission.unresolvedConflictsBlock === true, "unresolved conflicts must block");

  const ids = new Set();
  for (const d of manifest.decisions) {
    assert(/^(APP|REJ|PARK|RULE)-\d{3}[A-Z]?$/.test(d.id), `bad decision id ${d.id}`);
    assert(!ids.has(d.id), `duplicate decision id ${d.id}`);
    ids.add(d.id);
    assert(["approved", "rejected", "parked", "rule"].includes(d.status), `${d.id}: bad status`);
    assert(PRECEDENCE.includes(d.authority), `${d.id}: bad authority`);
    assert(/^\d{4}-\d{2}-\d{2}$/.test(d.decidedAt), `${d.id}: decidedAt must be YYYY-MM-DD`);
    assert(["confirmed", "reported", "inferred"].includes(d.confidence), `${d.id}: bad confidence`);
    assert(d.scope && ["website", "ganak_phone", "global"].includes(d.scope.track), `${d.id}: bad track`);
    assert(Array.isArray(d.scope.exactNodes) && d.scope.exactNodes.every(isNodeId), `${d.id}: bad exact node`);
    assert(Array.isArray(d.scope.allowedRoles) && Array.isArray(d.scope.prohibitedRoles), `${d.id}: roles required`);
    for (const hash of d.scope.imageHashes || []) assert(/^[a-f0-9]{40}$/.test(hash), `${d.id}: bad image hash`);
    for (const fill of d.scope.surfaceFills || []) assert(/^#[A-F0-9]{6}$/.test(fill), `${d.id}: bad surface fill`);
    for (const crop of d.scope.cropSignatures || []) {
      assert(crop.wrapper.width > 0 && crop.wrapper.height > 0, `${d.id}: bad wrapper size`);
      assert(crop.raster.width > 0 && crop.raster.height > 0, `${d.id}: bad raster size`);
      assert(Number.isFinite(crop.offset.x) && Number.isFinite(crop.offset.y), `${d.id}: bad crop offset`);
      assert(crop.clips === true && crop.contentSignature.length >= 12, `${d.id}: incomplete crop signature`);
    }
  }
  return ids;
}

function sameCrop(a, b) {
  if (!a || !b) return false;
  return a.wrapper.width === b.wrapper.width && a.wrapper.height === b.wrapper.height &&
    a.raster.width === b.raster.width && a.raster.height === b.raster.height &&
    a.offset.x === b.offset.x && a.offset.y === b.offset.y && a.clips === b.clips &&
    a.contentSignature === b.contentSignature;
}

function decisionErrors(manifest) {
  const errors = [];
  for (const c of manifest.conflicts) {
    if (c.status === "unresolved") errors.push({ code: "DECISION_CONFLICT", detail: c.id });
    if (c.status === "resolved" && !c.resolution) errors.push({ code: "DECISION_CONFLICT", detail: `${c.id}: resolved without resolution` });
  }
  const byNode = new Map();
  for (const d of manifest.decisions) {
    for (const node of d.scope.exactNodes) {
      const key = `${d.scope.track}:${node}`;
      const list = byNode.get(key) || [];
      list.push(d);
      byNode.set(key, list);
    }
  }
  for (const [key, list] of byNode) {
    const live = list.filter(d => d.status === "approved" || d.status === "rejected");
    if (new Set(live.map(d => d.status)).size > 1) {
      const winner = [...live].sort((a, b) => {
        const rank = PRECEDENCE.indexOf(a.authority) - PRECEDENCE.indexOf(b.authority);
        return rank || b.decidedAt.localeCompare(a.decidedAt);
      })[0];
      const losers = live.filter(d => d !== winner);
      const unresolved = losers.some(l => !winner.supersedes.includes(l.id));
      if (unresolved) errors.push({ code: "DECISION_CONFLICT", detail: `${key}: approval/rejection conflict` });
    }
  }
  return errors;
}

function rejectedDecisions(manifest) {
  return manifest.decisions.filter(d => d.status === "rejected");
}

function hexRgb(hex) {
  const value = String(hex || "").toUpperCase();
  if (!/^#[A-F0-9]{6}$/.test(value)) return null;
  return { r: Number.parseInt(value.slice(1, 3), 16), g: Number.parseInt(value.slice(3, 5), 16), b: Number.parseInt(value.slice(5, 7), 16) };
}

function isWarmOffWhite(hex) {
  const rgb = hexRgb(hex);
  return Boolean(rgb && Math.min(rgb.r, rgb.g, rgb.b) >= 220 && rgb.r > rgb.b);
}

function auditMechanical(manifest, evidence) {
  const errors = [];
  const rejected = rejectedDecisions(manifest);
  for (const asset of evidence.activeAssets || []) {
    for (const d of rejected) {
      const nodeHit = d.scope.exactNodes.includes(asset.node) || (asset.sourceNode && d.scope.exactNodes.includes(asset.sourceNode));
      const hashHit = asset.hash && (d.scope.imageHashes || []).includes(asset.hash);
      const roleDenied = d.scope.prohibitedRoles.includes(asset.role);
      const cropHit = (d.scope.cropSignatures || []).some(c => sameCrop(c, asset.crop));
      if ((nodeHit || (hashHit && d.id !== "REJ-017")) && roleDenied) {
        errors.push({ code: "REJECTED_ASSET_ACTIVE", detail: `${d.id}:${asset.node}` });
      }
      if (cropHit && roleDenied) errors.push({ code: "REJECTED_CROP_ACTIVE", detail: `${d.id}:${asset.node}` });
      const forbiddenTraits = new Set(d.scope.paletteTraits || []);
      if ((asset.visualTraits || []).some(trait => forbiddenTraits.has(trait)) && roleDenied) {
        errors.push({ code: "REJECTED_RESEMBLANCE", detail: `${d.id}:${asset.node}` });
      }
    }
  }

  const languageSwitchNodes = new Set(manifest.decisions.filter(d => d.id === "RULE-002").flatMap(d => d.scope.exactNodes));
  const latinUi = /\b(Today|Festivals|Muhurat|Prashna|Find best days|Ask now|Calendar|Place|Date)\b/;
  const devanagari = /[\u0900-\u097F]/;
  for (const text of evidence.visibleTexts || []) {
    const explicitSwitch = text.role === "language_switch_label" && languageSwitchNodes.has(text.sourceNode) && /^English\s*\/\s*हिन्दी(?:\s|·|$)/.test(text.value);
    if (explicitSwitch) continue;
    if (text.lang === "en" && devanagari.test(text.value)) errors.push({ code: "LANGUAGE_PURITY", detail: `${text.node}: Devanagari on English screen` });
    if (text.lang === "hi" && latinUi.test(text.value)) errors.push({ code: "LANGUAGE_PURITY", detail: `${text.node}: English UI on Hindi screen` });
  }

  const rejectedFills = new Map();
  for (const d of rejected) for (const fill of d.scope.surfaceFills || []) rejectedFills.set(fill, d);
  for (const surface of evidence.surfaces || []) {
    const d = rejectedFills.get(String(surface.fill || "").toUpperCase());
    if (!d) continue;
    if (d.scope.prohibitedRoles.includes(surface.role) || surface.areaPercent >= 2) {
      errors.push({ code: "DOMINANT_SURFACE", detail: `${surface.node}:${surface.fill}:${surface.role}` });
    }
  }
  for (const surface of evidence.surfaces || []) {
    if (surface.isGround !== false && isWarmOffWhite(surface.fill)) {
      errors.push({ code: "IVORY_GROUND", detail: `${surface.node}:${surface.fill}:${surface.role}` });
    }
  }

  for (const control of evidence.controls || []) {
    const violations = [];
    if (control.height < 42) violations.push("height");
    if (control.touchWidth < 42 || control.touchHeight < 42) violations.push("touch target");
    if (control.paddingLeft < 12 || control.paddingRight < 12) violations.push("horizontal padding");
    if (Math.abs(control.labelCenterOffset || 0) > 2) violations.push("label centring");
    if (control.overflow === true) violations.push("overflow");
    if (control.labelInset < 12) violations.push("label inset");
    if (violations.length) errors.push({ code: "COMPONENT_GEOMETRY", detail: `${control.node}:${violations.join(",")}` });
  }

  const approvedOrnamentNodes = new Set(manifest.decisions.filter(d => d.id === "APP-002").flatMap(d => d.scope.exactNodes));
  for (const ornament of evidence.ornaments || []) {
    if (!ornament.sourceNode || !approvedOrnamentNodes.has(ornament.libraryRoot) || !ornament.role || ornament.role === "decoration") {
      errors.push({ code: "ORNAMENT_PROVENANCE", detail: `${ornament.node}: missing approved lineage or structural role` });
    }
    if (!Number.isFinite(ornament.clearSpace) || ornament.clearSpace < 12) {
      errors.push({ code: "ORNAMENT_PROVENANCE", detail: `${ornament.node}: insufficient clear space` });
    }
  }
  return errors;
}

function computeAdmission(manifest, packet) {
  const errors = [...decisionErrors(manifest), ...auditMechanical(manifest, packet.mechanicalEvidence || {})];
  const reviews = new Map((packet.reviews || []).map(r => [r.role, r]));
  for (const role of REVIEW_ROLES) {
    const r = reviews.get(role);
    if (!r || r.status !== "FULL_SCREEN_PASS" || !r.coversAllScreens || !r.reviewer || !r.evidence.length) {
      errors.push({ code: "OWNER_ADMISSION", detail: `${role}: complete full-screen evidence missing` });
    }
  }
  const blind = reviews.get("blind_visual");
  if (!blind || blind.cold !== true) errors.push({ code: "OWNER_ADMISSION", detail: "blind visual review is not cold" });
  const lineage = packet.mechanicalEvidence.lineage || [];
  const coveredLineage = new Set(lineage.filter(x => x.regenerated === true).map(x => x.screen));
  const everyScreenRegenerated = (packet.screens || []).every(s => coveredLineage.has(s.node));
  if (packet.sourceFirstRequired !== true || !lineage.length || !everyScreenRegenerated) {
    errors.push({ code: "OWNER_ADMISSION", detail: "source-first lineage not proven" });
  }
  const open = (packet.knownFindings || []).filter(f => f.status !== "closed");
  if (open.length) errors.push({ code: "OWNER_ADMISSION", detail: `${open.length} known findings remain open` });
  if ((packet.holisticJudgements || []).length < (packet.screens || []).length) {
    errors.push({ code: "OWNER_ADMISSION", detail: "natural/contact-sheet judgements incomplete" });
  }
  if ((packet.reviews || []).some(r => r.status === "NARROW_PASS") && packet.requestedDisposition === "FULL_SCREEN_PASS") {
    errors.push({ code: "NARROW_PROMOTION", detail: "narrow PASS cannot promote a batch" });
  }
  return { disposition: errors.length ? "BLOCKED_FROM_OWNER_REVIEW" : "FULL_SCREEN_PASS", errors };
}

function correctedFixture() {
  return {
    activeAssets: [],
    visibleTexts: [
      { node: "900:1", lang: "en", value: "Find best days" },
      { node: "900:2", lang: "hi", value: "शुभ दिन खोजें" }
    ],
    surfaces: [{ node: "900:3", fill: "#FFFFFF", role: "panel", areaPercent: 30 }],
    controls: [{ node: "900:4", height: 42, touchWidth: 120, touchHeight: 42, paddingLeft: 16, paddingRight: 16, labelCenterOffset: 0, overflow: false, labelInset: 16 }],
    ornaments: [{ node: "900:5", sourceNode: "760:4", libraryRoot: "760:20", role: "section_finish", clearSpace: 16 }],
    lineage: [{ screen: "900:0", source: "800:0", regenerated: true }]
  };
}

function runIncidentSelfTests(manifest, incidents) {
  let passed = 0;
  for (const incident of incidents.cases) {
    const localManifest = JSON.parse(JSON.stringify(manifest));
    const evidence = correctedFixture();
    let packet = {
      screens: [{ node: "900:0" }], sourceFirstRequired: true, mechanicalEvidence: evidence,
      reviews: REVIEW_ROLES.map(role => ({ role, status: "FULL_SCREEN_PASS", reviewer: `fixture-${role}`, evidence: ["fixture"], coversAllScreens: true, cold: role === "blind_visual" })),
      knownFindings: [], holisticJudgements: [{ screen: "900:0", naturalScale: "PASS", contactSheet: "PASS" }], requestedDisposition: "FULL_SCREEN_PASS"
    };
    if (incident.kind === "asset") evidence.activeAssets.push({ node: "999:1", sourceNode: "485:51", hash: "b7559c796e972db13b8aa54daba3a1405264f488", role: "active_screen" });
    if (incident.kind === "crop") evidence.activeAssets.push({ node: "999:2", hash: "c69d89b16c8068f8f06ea86b4a3852a19db33732", role: "active_screen", crop: localManifest.decisions.find(d => d.id === "REJ-017").scope.cropSignatures[0] });
    if (incident.kind === "conflict") localManifest.conflicts.push({ id: "FIXTURE", decisionIds: ["APP-001", "REJ-004"], status: "unresolved", resolution: null });
    if (incident.kind === "language") evidence.visibleTexts.push({ node: "999:3", lang: "en", value: "आज का Muhurat" });
    if (incident.kind === "surface") evidence.surfaces.push({ node: "999:4", fill: "#FFFDFC", role: "panel", areaPercent: 15 });
    if (incident.kind === "nearby_ivory") evidence.surfaces.push({ node: "999:7", fill: "#F8F4EC", role: "small_card", areaPercent: 1, isGround: true });
    if (incident.kind === "resemblance") evidence.activeAssets.push({ node: "999:8", role: "active_screen", visualTraits: ["faded_coral_bloom", "washed_sage_foliage", "thin_gold_curl", "ivory_ground"] });
    if (incident.kind === "geometry") evidence.controls.push({ node: "999:5", height: 34, touchWidth: 70, touchHeight: 34, paddingLeft: 2, paddingRight: 2, labelCenterOffset: 7, overflow: true, labelInset: 2 });
    if (incident.kind === "ornament") evidence.ornaments.push({ node: "999:6", sourceNode: null, libraryRoot: null, role: "decoration", clearSpace: 2 });
    if (incident.kind === "typed_status") packet.reviews[0].status = "NARROW_PASS";
    if (incident.kind === "admission") packet.knownFindings.push({ id: "OPEN", status: "open" });
    const errors = computeAdmission(localManifest, packet).errors;
    assert(errors.some(e => e.code === incident.expected), `${incident.name}: expected ${incident.expected}, got ${errors.map(e => e.code).join(",")}`);
    passed++;
  }
  const clean = computeAdmission(manifest, {
    screens: [{ node: "900:0" }], sourceFirstRequired: true, mechanicalEvidence: correctedFixture(),
    reviews: REVIEW_ROLES.map(role => ({ role, status: "FULL_SCREEN_PASS", reviewer: `fixture-${role}`, evidence: ["fixture"], coversAllScreens: true, cold: role === "blind_visual" })),
    knownFindings: [], holisticJudgements: [{ screen: "900:0", naturalScale: "PASS", contactSheet: "PASS" }], requestedDisposition: "FULL_SCREEN_PASS"
  });
  assert(clean.disposition === "FULL_SCREEN_PASS", `corrected fixture should pass: ${JSON.stringify(clean.errors)}`);
  return passed;
}

function main() {
  const manifest = readJson(MANIFEST_PATH);
  const schema = readJson(SCHEMA_PATH);
  const incidents = readJson(INCIDENTS_PATH);
  validateManifestShape(manifest, schema);
  const malformed = JSON.parse(JSON.stringify(manifest));
  malformed.decisions[0].silentUnknown = true;
  let malformedBlocked = false;
  try {
    validateJsonSchema(malformed, schema, schema);
  } catch (error) {
    malformedBlocked = /unexpected property silentUnknown/.test(error.message);
  }
  assert(malformedBlocked, "schema validator must reject unknown decision properties");
  const conflicts = decisionErrors(manifest);
  assert(conflicts.length === 0, `canonical manifest conflict: ${JSON.stringify(conflicts)}`);
  const selfTests = runIncidentSelfTests(manifest, incidents);

  const admitIndex = process.argv.indexOf("--admit");
  const packetPath = admitIndex >= 0 ? path.resolve(process.argv[admitIndex + 1] || DEFAULT_PACKET) : DEFAULT_PACKET;
  const packet = readJson(packetPath);
  const result = computeAdmission(manifest, packet);
  if (admitIndex >= 0) {
    console.log(`${packet.batchId}: ${result.disposition}`);
    for (const error of result.errors) console.log(`- ${error.code}: ${error.detail}`);
    process.exit(result.disposition === "FULL_SCREEN_PASS" ? 0 : 1);
  }
  assert(result.disposition === packet.expectedDisposition, `packet expected ${packet.expectedDisposition}, computed ${result.disposition}`);
  console.log(`figma-design-governance PASS — schema/precedence valid; ${selfTests} known-incident mutations detected; current ${packet.batchId} correctly ${result.disposition} with ${result.errors.length} admission blockers`);
}

main();
