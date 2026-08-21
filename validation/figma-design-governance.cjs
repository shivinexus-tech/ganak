#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const ROOT = path.resolve(__dirname, "..");
const MANIFEST_PATH = path.join(ROOT, "plans/ganak-design-decision-manifest.json");
const SCHEMA_PATH = path.join(ROOT, "plans/schemas/ganak-design-decision-manifest.schema.json");
const INCIDENTS_PATH = path.join(ROOT, "validation/fixtures/figma-design-governance-known-incidents.json");
const DEFAULT_PACKET = path.join(ROOT, "plans/figma-review-evidence/batch-01-recovery.json");
const PRECEDENCE = ["direct_owner_latest", "direct_owner_earlier", "canonical_human_record", "agent_report", "inference"];
const REVIEW_ROLES = ["mechanical", "accessibility", "ornament_background", "blind_visual", "visual_art", "integrator"];
const SCREEN_COVERAGE_CATEGORIES = ["language", "asset_rejection", "surface", "geometry", "ornament"];
const STATUS = ["BLOCKED_FROM_OWNER_REVIEW", "NARROW_PASS", "FULL_SCREEN_PASS"];
const BATCH_SECTION = "769:17254";

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
  assert(manifest.batchAdmission.visualArtGate.platform === "desktop", "Visual Art admission must be desktop-scoped");
  assert(manifest.batchAdmission.visualArtGate.nodeMutationInvalidates === true, "node mutation must invalidate Visual Art evidence");
  assert(manifest.batchAdmission.ornamentLibraryGate.rejectedModes.includes("BALANCED"), "BALANCED ornament mode must remain rejected");

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
    for (const placement of [...(d.scope.requiredPlacements || []), ...(d.scope.prohibitedPlacements || [])]) {
      assert(["screenFamily", "slot", "ornamentFamily", "role", "density"].every(key => typeof placement[key] === "string" && placement[key].length), `${d.id}: incomplete ornament placement contract`);
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

function placementMatches(actual, rule) {
  return ["screenFamily", "slot", "ornamentFamily", "role", "density"].every(key =>
    rule[key] === "ANY" || actual[key] === rule[key]
  );
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
  for (const layout of evidence.responsiveLayouts || []) {
    const pauseRule = manifest.decisions.find(d => d.id === "RULE-003" && d.status === "rule");
    if (pauseRule) {
      const pausedRoles = new Set(pauseRule.scope.prohibitedRoles || []);
      const preservedRoles = new Set(pauseRule.scope.allowedRoles || []);
      if (pausedRoles.has(layout.role) && !preservedRoles.has(layout.role)) {
        errors.push({ code: "RESPONSIVE_SCOPE_PAUSED", detail: `${pauseRule.id}:${layout.node}:${layout.role}` });
      }
    }
    for (const d of rejected) {
      const nodeHit = d.scope.exactNodes.includes(layout.node) || (layout.sourceNode && d.scope.exactNodes.includes(layout.sourceNode));
      const patternHit = (d.scope.prohibitedRoles || []).includes(layout.pattern);
      const archived = (d.scope.allowedRoles || []).includes(layout.role);
      if ((nodeHit || patternHit) && !archived) {
        errors.push({ code: "REJECTED_RESPONSIVE_DIRECTION", detail: `${d.id}:${layout.node}:${layout.pattern || "exact-node"}` });
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
  const actualPlacements = evidence.ornamentPlacements || [];
  for (const required of manifest.decisions.flatMap(d => d.scope.requiredPlacements || [])) {
    const found = actualPlacements.some(actual => placementMatches(actual, required));
    if (!found) errors.push({ code: "REQUIRED_ORNAMENT_MISSING", detail: `${required.screenFamily}:${required.slot}:${required.ornamentFamily}` });
  }
  for (const prohibited of manifest.decisions.flatMap(d => d.scope.prohibitedPlacements || [])) {
    const found = actualPlacements.some(actual => placementMatches(actual, prohibited));
    if (found) errors.push({ code: "PROHIBITED_ORNAMENT_PLACEMENT", detail: `${prohibited.screenFamily}:${prohibited.slot}` });
  }
  return errors;
}

function visualArtBindingPayload(packet, evidence) {
  return {
    figmaFile: packet.figmaFile,
    sectionNode: packet.sectionNode,
    screenNodes: (packet.screens || []).map(s => s.node),
    nodeFingerprints: evidence.binding && evidence.binding.nodeFingerprints,
    naturalScale: (evidence.naturalScaleScreenshots || []).map(x => ({ screenNode: x.screenNode, artifactDigest: x.artifactDigest })),
    contactSheet: evidence.contactSheet ? { artifactDigest: evidence.contactSheet.artifactDigest, memberNodes: evidence.contactSheet.memberNodes } : null,
    reviewerTaskId: evidence.reviewer && evidence.reviewer.taskId,
    reviewedAt: evidence.reviewedAt,
    screenJudgements: evidence.screenJudgements
  };
}

function visualArtDigest(packet, evidence) {
  return crypto.createHash("sha256").update(JSON.stringify(visualArtBindingPayload(packet, evidence))).digest("hex");
}

function auditVisualArt(packet) {
  const errors = [];
  const evidence = packet.visualArtEvidence;
  const fail = detail => errors.push({ code: "VISUAL_ART_EVIDENCE", detail });
  if (!evidence) {
    fail("missing desktop Visual Art evidence");
    return errors;
  }
  if (evidence.platform !== "desktop") fail("Visual Art evidence is not desktop-scoped");
  const screenNodes = (packet.screens || []).map(s => s.node);
  const boundNodes = evidence.binding && evidence.binding.screenNodes;
  const currentFingerprints = packet.mechanicalEvidence?.nodeFingerprints || [];
  if (!evidence.binding || evidence.binding.figmaFile !== packet.figmaFile || evidence.binding.sectionNode !== packet.sectionNode ||
      JSON.stringify(boundNodes) !== JSON.stringify(screenNodes)) {
    fail("stale exact-node binding; any mutation or reclone invalidates the pass");
  }
  if (currentFingerprints.length !== screenNodes.length ||
      JSON.stringify(evidence.binding?.nodeFingerprints) !== JSON.stringify(currentFingerprints) ||
      currentFingerprints.some((x, index) => x.screenNode !== screenNodes[index] || !/^[a-f0-9]{64}$/.test(x.fingerprint || ""))) {
    fail("node fingerprints are missing/stale; same-ID mutations invalidate Visual Art evidence");
  }
  const shots = evidence.naturalScaleScreenshots || [];
  if (shots.length !== screenNodes.length || JSON.stringify(shots.map(s => s.screenNode)) !== JSON.stringify(screenNodes) ||
      shots.some(s => !/^https:\/\//.test(s.url || "") || !/^[a-f0-9]{64}$/.test(s.artifactDigest || ""))) {
    fail("natural-scale screenshot membership or immutable artifact binding is incomplete");
  }
  const contact = evidence.contactSheet;
  if (!contact || !/^https:\/\//.test(contact.url || "") || !/^[a-f0-9]{64}$/.test(contact.artifactDigest || "") ||
      JSON.stringify(contact.memberNodes) !== JSON.stringify(screenNodes)) {
    fail("contact-sheet membership or immutable artifact binding is stale/incomplete");
  }
  const reviewer = evidence.reviewer || {};
  if (!reviewer.taskId || reviewer.independent !== true || (reviewer.builderTaskIds || []).includes(reviewer.taskId) || reviewer.taskId === reviewer.integratorTaskId) {
    fail("Visual Art reviewer is missing, self-approved or not independent");
  }
  const requiredScreen = new Set(screenNodes);
  const judgments = evidence.screenJudgements || [];
  if (judgments.length !== screenNodes.length || judgments.some(j => !requiredScreen.delete(j.screenNode))) {
    fail("Visual Art screen judgments do not cover the exact node set");
  }
  for (const j of judgments) {
    if (!j.backgroundRationale || j.compositionBalance !== "PASS" || !j.compositionRationale ||
        j.rejectedResemblance !== "PASS" || !j.rejectedResemblanceRationale || (j.openFindings || []).length) {
      fail(`${j.screenNode || "unknown"}: incomplete background/composition/resemblance/finding judgment`);
    }
    if (!Array.isArray(j.ornaments)) {
      fail(`${j.screenNode || "unknown"}: ornament inventory missing`);
      continue;
    }
    for (const ornament of j.ornaments) {
      if (!isNodeId(ornament.node) || !["keep", "remove", "none"].includes(ornament.decision) || !ornament.namedJob ||
          !ornament.libraryComponentNode || ornament.placement !== "PASS" || ornament.space !== "PASS" ||
          ornament.alignment !== "PASS" || ornament.scale !== "PASS") {
        fail(`${j.screenNode || "unknown"}: incomplete ornament decision`);
      }
    }
  }
  if (!/^[a-f0-9]{64}$/.test(evidence.evidenceDigest || "") || evidence.evidenceDigest !== visualArtDigest(packet, evidence)) {
    fail("immutable evidence digest is missing or does not bind the current nodes/artifacts/reviewer");
  }
  return errors;
}

function auditOrnamentLibrary(manifest, packet) {
  const errors = [];
  const fail = detail => errors.push({ code: "ORNAMENT_LIBRARY_EVIDENCE", detail });
  const evidence = packet.visualArtEvidence;
  if (!evidence) {
    fail("missing exact-node ornament evidence inside the independent Visual Art packet");
    return errors;
  }
  const allowedModes = new Set(manifest.batchAdmission.ornamentLibraryGate.allowedModes);
  const celebratoryContexts = new Set(manifest.batchAdmission.ornamentLibraryGate.celebratoryContexts);
  const approvedRoots = new Set(manifest.decisions.filter(d => d.id === "APP-002").flatMap(d => d.scope.exactNodes));
  const screenNodes = (packet.screens || []).map(s => s.node);
  const judgments = evidence.screenJudgements || [];
  if (judgments.length !== screenNodes.length) fail("ornament evidence does not cover every exact current node");
  for (const j of judgments) {
    const prefix = `${j.screenNode || "unknown"}: `;
    if (!allowedModes.has(j.ornamentMode) || j.ornamentMode === "BALANCED") fail(prefix + "missing or rejected ornament mode");
    if (!j.modeRationale || !Array.isArray(j.permittedContexts) || !j.permittedContexts.includes(j.screenContext)) fail(prefix + "mode rationale or permitted screen context missing");
    if (j.ornamentMode === "CELEBRATORY" && !celebratoryContexts.has(j.screenContext)) fail(prefix + "CELEBRATORY is outside Festival/Vrat/ceremonial hero context");
    if (j.inventoryComplete !== true || !Array.isArray(j.ornaments)) fail(prefix + "ornament inventory is incomplete");
    if (!j.noOrnamentComparison) fail(prefix + "no-ornament comparison missing");
    if (j.visualArtVerdict !== "PASS") fail(prefix + "independent Visual Art verdict missing");
    if (j.ornamentMode === "NONE") {
      if (j.ornaments.length || j.compositionBalance !== "PASS" || !j.compositionRationale || !j.modeRationale) fail(prefix + "NONE leaves the composition empty/unfinished or contains ornaments");
    } else if (!j.ornaments.length) fail(prefix + "non-NONE mode has no inventoried instances");
    for (const ornament of j.ornaments || []) {
      if (!ornament.namedJob || /^(decoration|decorative|ornament)$/i.test(ornament.namedJob)) fail(prefix + "ornament lacks a named structural job");
      if (!isNodeId(ornament.libraryComponentNode) || !approvedRoots.has(ornament.libraryRoot)) fail(prefix + "unknown or non-library provenance");
      if (ornament.placement !== "PASS" || ornament.space !== "PASS" || ornament.alignment !== "PASS" || ornament.scale !== "PASS") fail(prefix + "placement/space/alignment/scale decision incomplete");
      if (ornament.provenanceStatus === "EXPLORATION") fail(prefix + "unapproved EXPLORATION cannot appear in an admitted screen");
      if (!["APPROVED_LIBRARY", "EXPLORATION"].includes(ornament.provenanceStatus)) fail(prefix + "unknown provenance status");
      if (ornament.creatorTaskId && ornament.creatorTaskId === ornament.curatorTaskId) fail(prefix + "creator/curator self-approval");
      if (ornament.curatorTaskId && ornament.curatorIndependent !== true) fail(prefix + "curator independence missing");
    }
  }
  return errors;
}

function computeAdmission(manifest, packet) {
  const errors = [
    ...decisionErrors(manifest),
    ...auditMechanical(manifest, packet.mechanicalEvidence || {}),
    ...auditVisualArt(packet),
    ...auditOrnamentLibrary(manifest, packet)
  ];
  if (!Array.isArray(packet.mechanicalEvidence?.ornamentPlacements)) {
    errors.push({ code: "OWNER_ADMISSION", detail: "explicit ornament placement inventory is missing" });
  }
  const screens = packet.screens || [];
  const screenIds = screens.map(screen => screen.node);
  if (new Set(screenIds).size !== screenIds.length) errors.push({ code: "OWNER_ADMISSION", detail: "duplicate screen in exact roster" });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(packet.inspectedAt || "")) errors.push({ code: "OWNER_ADMISSION", detail: "packet inspection date missing" });
  const batchRule = manifest.decisions.find(decision => decision.id === "RULE-001");
  const canonicalScreens = (batchRule?.scope.exactNodes || []).filter(node => node !== BATCH_SECTION);
  const submittedSet = new Set(screenIds);
  const canonicalSet = new Set(canonicalScreens);
  const exactRoster = canonicalScreens.length > 0 && screenIds.length === canonicalScreens.length &&
    canonicalScreens.every(node => submittedSet.has(node)) && screenIds.every(node => canonicalSet.has(node));
  if (!batchRule || packet.sectionNode !== BATCH_SECTION || packet.figmaFile !== batchRule.scope.figmaFile || !exactRoster) {
    errors.push({ code: "OWNER_ADMISSION", detail: "packet is not bound to canonical Figma file, Batch 01 section and exact RULE-001 roster" });
  }
  const reviews = new Map((packet.reviews || []).map(r => [r.role, r]));
  for (const role of REVIEW_ROLES) {
    const r = reviews.get(role);
    if (!r || r.status !== "FULL_SCREEN_PASS" || !r.coversAllScreens || !r.reviewer || !r.evidence.length) {
      errors.push({ code: "OWNER_ADMISSION", detail: `${role}: complete full-screen evidence missing` });
    }
  }
  const blind = reviews.get("blind_visual");
  if (!blind || blind.cold !== true) errors.push({ code: "OWNER_ADMISSION", detail: "blind visual review is not cold" });
  const visualArtReview = reviews.get("visual_art");
  if (visualArtReview && visualArtReview.status === "FULL_SCREEN_PASS" &&
      visualArtReview.reviewer !== packet.visualArtEvidence?.reviewer?.taskId) {
    errors.push({ code: "VISUAL_ART_EVIDENCE", detail: "Visual Art review role is not bound to the independent evidence reviewer" });
  }
  const lineage = packet.mechanicalEvidence.lineage || [];
  const coveredLineage = new Set(lineage.filter(x => x.regenerated === true).map(x => x.screen));
  const everyScreenRegenerated = screens.every(s => coveredLineage.has(s.node));
  if (packet.sourceFirstRequired !== true || !lineage.length || !everyScreenRegenerated) {
    errors.push({ code: "OWNER_ADMISSION", detail: "source-first lineage not proven" });
  }
  const screenAudits = packet.screenAudits || [];
  const auditIds = screenAudits.map(audit => audit.screen);
  if (screenAudits.length !== screens.length || new Set(auditIds).size !== screens.length || auditIds.some(id => !screenIds.includes(id))) {
    errors.push({ code: "OWNER_ADMISSION", detail: "screen audits do not bind one-to-one to exact roster" });
  }
  const auditByScreen = new Map(screenAudits.map(audit => [audit.screen, audit]));
  const groundSurfaces = (packet.mechanicalEvidence.surfaces || []).filter(surface => surface.isGround === true || surface.role === "canvas");
  for (const screen of screens) {
    const audit = auditByScreen.get(screen.node);
    const grounds = groundSurfaces.filter(surface => surface.screen === screen.node);
    if (!audit || audit.screenshot !== screen.screenshot || audit.inspectedAt !== packet.inspectedAt || !audit.auditor) {
      errors.push({ code: "OWNER_ADMISSION", detail: `${screen.node}: exact audit/capture binding missing` });
      continue;
    }
    if (grounds.length !== 1 || grounds[0].node !== screen.node || grounds[0].fill !== audit.rootFill || grounds[0].capture !== screen.screenshot) {
      errors.push({ code: "OWNER_ADMISSION", detail: `${screen.node}: unique root surface is not bound to exact capture` });
    }
    if (audit.visibleTextCount <= 0 || audit.unexpectedLanguageCount !== 0) errors.push({ code: "OWNER_ADMISSION", detail: `${screen.node}: language audit failed` });
    if (audit.activeRejectedHashCount !== 0 || audit.activeRejectedCropCount !== 0) errors.push({ code: "OWNER_ADMISSION", detail: `${screen.node}: rejected asset audit failed` });
    if (!/^#[A-F0-9]{6}$/.test(audit.rootFill || "") || audit.blockedDeniedSurfaceCount !== 0) errors.push({ code: "OWNER_ADMISSION", detail: `${screen.node}: surface audit failed` });
    if (audit.mappedReactionCount <= 0 || audit.under42Count !== 0 || audit.directTextReactionCount !== 0 || audit.overflowCount !== 0) errors.push({ code: "OWNER_ADMISSION", detail: `${screen.node}: geometry audit failed` });
    if (audit.ornamentFindingCount !== 0 || audit.forbiddenOrnamentPlacementCount !== 0) errors.push({ code: "OWNER_ADMISSION", detail: `${screen.node}: ornament audit failed` });
    if (/^Today (ordinary|special)$/.test(screen.name || "")) {
      const hidden = audit.checkedHiddenOrnamentNodes || [];
      if (!audit.emptySlotEvidence || !hidden.length || hidden.some(item => !isNodeId(item.node) || item.effectiveVisible !== false)) {
        errors.push({ code: "OWNER_ADMISSION", detail: `${screen.node}: Today no-ornament evidence missing` });
      }
    }
  }
  const coverage = packet.mechanicalEvidence.screenCoverage || [];
  const coverageKeys = coverage.map(item => `${item.screen}:${item.category}`);
  if (coverage.length !== screens.length * SCREEN_COVERAGE_CATEGORIES.length || new Set(coverageKeys).size !== coverage.length) {
    errors.push({ code: "OWNER_ADMISSION", detail: "screen coverage is not exact or contains duplicates" });
  }
  for (const screen of screens) {
    const audit = auditByScreen.get(screen.node);
    for (const category of SCREEN_COVERAGE_CATEGORIES) {
      const proof = coverage.find(item => item.screen === screen.node && item.category === category);
      if (!proof || proof.status !== "PASS" || !Array.isArray(proof.evidence) || proof.evidence.length === 0) {
        errors.push({ code: "OWNER_ADMISSION", detail: `${screen.node}:${category} screen-level evidence missing` });
      }
      const categoryPass = audit && (
        (category === "language" && audit.visibleTextCount > 0 && audit.unexpectedLanguageCount === 0) ||
        (category === "asset_rejection" && audit.activeRejectedHashCount === 0 && audit.activeRejectedCropCount === 0) ||
        (category === "surface" && audit.blockedDeniedSurfaceCount === 0) ||
        (category === "geometry" && audit.mappedReactionCount > 0 && audit.under42Count === 0 && audit.directTextReactionCount === 0 && audit.overflowCount === 0) ||
        (category === "ornament" && audit.ornamentFindingCount === 0 && audit.forbiddenOrnamentPlacementCount === 0)
      );
      if (!categoryPass) errors.push({ code: "OWNER_ADMISSION", detail: `${screen.node}:${category} narrative coverage lacks matching mechanical evidence` });
    }
  }
  const open = (packet.knownFindings || []).filter(f => f.status !== "closed");
  if (open.length) errors.push({ code: "OWNER_ADMISSION", detail: `${open.length} known findings remain open` });
  const holistic = packet.holisticJudgements || [];
  const exactHolistic = screens.every(screen => {
    const matches = holistic.filter(item => item.screen === screen.node);
    return matches.length === 1 && matches[0].naturalScale === "PASS" && matches[0].contactSheet === "PASS";
  });
  if (!exactHolistic || holistic.length !== screens.length) {
    errors.push({ code: "OWNER_ADMISSION", detail: "exact natural/contact-sheet PASS judgements incomplete or stale" });
  }
  if ((packet.reviews || []).some(r => r.status === "NARROW_PASS") && packet.requestedDisposition === "FULL_SCREEN_PASS") {
    errors.push({ code: "NARROW_PROMOTION", detail: "narrow PASS cannot promote a batch" });
  }
  return { disposition: errors.length ? "BLOCKED_FROM_OWNER_REVIEW" : "FULL_SCREEN_PASS", errors };
}

function canonicalBatchScreens(manifest) {
  const batchRule = manifest.decisions.find(decision => decision.id === "RULE-001");
  assert(batchRule, "RULE-001 must define canonical Batch 01 admission");
  const screens = batchRule.scope.exactNodes.filter(node => node !== BATCH_SECTION);
  assert(screens.length > 0 && new Set(screens).size === screens.length, "RULE-001 must define a non-empty unique screen roster");
  return screens;
}

function fixtureName(node) {
  if (node === "851:18729") return "Today ordinary";
  if (node === "897:23887") return "Today special";
  return `Fixture ${node}`;
}

function correctedFixture(manifest) {
  const screens = canonicalBatchScreens(manifest);
  return {
    activeAssets: [],
    responsiveLayouts: [],
    visibleTexts: screens.map((screen, index) => ({ node: `990:${index + 1}`, screen, lang: "en", value: "Find best days" })),
    surfaces: screens.map(screen => ({ node: screen, screen, fill: "#FFFFFF", role: "canvas", areaPercent: 100, isGround: true, capture: `fixture://${screen}` })),
    controls: [{ node: "990:100", height: 42, touchWidth: 120, touchHeight: 42, paddingLeft: 16, paddingRight: 16, labelCenterOffset: 0, overflow: false, labelInset: 16 }],
    ornaments: [{ node: "990:101", sourceNode: "760:4", libraryRoot: "760:20", role: "section_finish", clearSpace: 16 }],
    ornamentPlacements: [],
    screenCoverage: screens.flatMap(screen => SCREEN_COVERAGE_CATEGORIES.map(category => ({ screen, category, status: "PASS", evidence: [`fixture-${screen}-${category}`] }))),
    lineage: screens.map((screen, index) => ({ screen, source: `980:${index + 1}`, regenerated: true })),
    nodeFingerprints: screens.map(screenNode => ({ screenNode, fingerprint: "a".repeat(64) }))
  };
}

function validVisualArtFixture(packet) {
  const nodes = packet.screens.map(s => s.node);
  const evidence = {
    platform: "desktop",
    binding: { figmaFile: packet.figmaFile, sectionNode: packet.sectionNode, screenNodes: nodes, nodeFingerprints: packet.mechanicalEvidence.nodeFingerprints },
    naturalScaleScreenshots: nodes.map((screenNode, index) => ({ screenNode, url: `https://example.test/natural-${index}.png`, artifactDigest: String(index + 1).padStart(64, "0") })),
    contactSheet: { url: "https://example.test/contact.png", artifactDigest: "f".repeat(64), memberNodes: nodes },
    reviewer: { taskId: "fixture-visual_art", independent: true, builderTaskIds: ["fixture-builder"], integratorTaskId: "fixture-integrator" },
    reviewedAt: "2026-08-20T12:00:00Z",
    screenJudgements: nodes.map(screenNode => ({
      screenNode, screenContext: "utility", backgroundRationale: "The background supports the screen's semantic density.",
      compositionBalance: "PASS", compositionRationale: "Weight and negative space are balanced.", ornamentMode: "RESTRAINED",
      modeRationale: "One restrained finish supports hierarchy without arbitrary decoration.", permittedContexts: ["utility", "festival", "vrat"], inventoryComplete: true,
      ornaments: [{ node: "900:5", decision: "keep", namedJob: "section finish", libraryRoot: "760:20", libraryComponentNode: "760:4", provenanceStatus: "APPROVED_LIBRARY", creatorTaskId: null, curatorTaskId: "fixture-curator", curatorIndependent: true, placement: "PASS", space: "PASS", alignment: "PASS", scale: "PASS" }],
      noOrnamentComparison: "Without the finish the section ending is visually unresolved.", visualArtVerdict: "PASS",
      rejectedResemblance: "PASS", rejectedResemblanceRationale: "No rejected asset, crop or close visual substitute is present.", openFindings: []
    }))
  };
  evidence.evidenceDigest = visualArtDigest(packet, evidence);
  return evidence;
}

function correctedPacket(manifest) {
  const screenIds = canonicalBatchScreens(manifest);
  const screens = screenIds.map(node => ({ node, name: fixtureName(node), screenshot: `fixture://${node}` }));
  const screenAudits = screens.map((screen, index) => {
    const audit = {
      screen: screen.node, screenshot: screen.screenshot, inspectedAt: "2026-08-20", auditor: "fixture", rootFill: "#FFFFFF",
      visibleTextCount: 1, unexpectedLanguageCount: 0, activeRejectedHashCount: 0, activeRejectedCropCount: 0,
      rawDeniedFillHitCount: 0, blockedDeniedSurfaceCount: 0, mappedReactionCount: 1, under42Count: 0,
      directTextReactionCount: 0, overflowCount: 0, ornamentFindingCount: 0, forbiddenOrnamentPlacementCount: 0
    };
    if (/^Today (ordinary|special)$/.test(screen.name)) {
      audit.emptySlotEvidence = "fixture no-ornament slot verified";
      audit.checkedHiddenOrnamentNodes = [{ node: `970:${index + 1}`, effectiveVisible: false }];
    }
    return audit;
  });
  const packet = {
    batchId: "FIXTURE-BATCH-01", figmaFile: manifest.decisions.find(decision => decision.id === "RULE-001").scope.figmaFile,
    sectionNode: BATCH_SECTION, inspectedAt: "2026-08-20", screens, screenAudits, sourceFirstRequired: true,
    mechanicalEvidence: correctedFixture(manifest),
    reviews: REVIEW_ROLES.map(role => ({ role, status: "FULL_SCREEN_PASS", reviewer: `fixture-${role}`, evidence: ["fixture"], coversAllScreens: true, cold: role === "blind_visual" })),
    knownFindings: [], holisticJudgements: screenIds.map(screen => ({ screen, naturalScale: "PASS", contactSheet: "PASS" })), requestedDisposition: "FULL_SCREEN_PASS"
  };
  packet.visualArtEvidence = validVisualArtFixture(packet);
  return packet;
}

function runIncidentSelfTests(manifest, schema, incidents) {
  let passed = 0;
  for (const incident of incidents.cases) {
    const localManifest = JSON.parse(JSON.stringify(manifest));
    const packet = correctedPacket(localManifest);
    validateJsonSchema(packet.visualArtEvidence, schema.$defs.visualArtEvidence, schema);
    const evidence = packet.mechanicalEvidence;
    if (incident.kind === "asset") evidence.activeAssets.push({ node: "999:1", sourceNode: "485:51", hash: "b7559c796e972db13b8aa54daba3a1405264f488", role: "active_screen" });
    if (incident.kind === "crop") evidence.activeAssets.push({ node: "999:2", hash: "c69d89b16c8068f8f06ea86b4a3852a19db33732", role: "active_screen", crop: localManifest.decisions.find(d => d.id === "REJ-017").scope.cropSignatures[0] });
    if (incident.kind === "conflict") localManifest.conflicts.push({ id: "FIXTURE", decisionIds: ["APP-001", "REJ-004"], status: "unresolved", resolution: null });
    if (incident.kind === "language") evidence.visibleTexts.push({ node: "999:3", lang: "en", value: "आज का Muhurat" });
    if (incident.kind === "surface") evidence.surfaces.push({ node: "999:4", fill: "#FFFDFC", role: "panel", areaPercent: 15 });
    if (incident.kind === "nearby_ivory") evidence.surfaces.push({ node: "999:7", fill: "#F8F4EC", role: "small_card", areaPercent: 1, isGround: true });
    if (incident.kind === "resemblance") evidence.activeAssets.push({ node: "999:8", role: "active_screen", visualTraits: ["faded_coral_bloom", "washed_sage_foliage", "thin_gold_curl", "ivory_ground"] });
    if (incident.kind === "geometry") evidence.controls.push({ node: "999:5", height: 34, touchWidth: 70, touchHeight: 34, paddingLeft: 2, paddingRight: 2, labelCenterOffset: 7, overflow: true, labelInset: 2 });
    if (incident.kind === "ornament") evidence.ornaments.push({ node: "999:6", sourceNode: null, libraryRoot: null, role: "decoration", clearSpace: 2 });
    if (incident.kind === "prohibited_placement") evidence.ornamentPlacements.push({ screenFamily: "today_ordinary", slot: "non_hero_panel_left", ornamentFamily: "FLORAL-SWEEP", role: "anchor", density: "restrained" });
    if (incident.kind === "responsive_direction") evidence.responsiveLayouts.push({ node: "899:27940", sourceNode: "899:27940", pattern: "desktop_full_page_continuous_stack", role: "responsive_template" });
    if (incident.kind === "responsive_pause") evidence.responsiveLayouts.push({ node: "999:999", pattern: "new_responsive_screen", role: "responsive_create" });
    if (incident.kind === "surface_binding") packet.screenAudits[0].rootFill = "#F9FCFD";
    if (incident.kind === "coverage_claim") packet.screenAudits[0].overflowCount = 1;
    if (incident.kind === "empty_roster") packet.screens = [];
    if (incident.kind === "wrong_section") packet.sectionNode = "769:99999";
    if (incident.kind === "roster_mismatch") packet.screens[0].node = "999:999";
    if (incident.kind === "missing_ornament_inventory") delete packet.mechanicalEvidence.ornamentPlacements;
    if (incident.kind === "typed_status") packet.reviews[0].status = "NARROW_PASS";
    if (incident.kind === "admission") packet.knownFindings.push({ id: "OPEN", status: "open" });
    if (incident.kind === "visual_art_missing") delete packet.visualArtEvidence;
    if (incident.kind === "visual_art_stale") packet.mechanicalEvidence.nodeFingerprints[0].fingerprint = "b".repeat(64);
    if (incident.kind === "visual_art_reclone") packet.visualArtEvidence.binding.screenNodes[0] = "999:99";
    if (incident.kind === "visual_art_self_approved") packet.visualArtEvidence.reviewer.builderTaskIds.push("fixture-visual_art");
    if (incident.kind === "visual_art_incomplete") delete packet.visualArtEvidence.screenJudgements[0].backgroundRationale;
    if (incident.kind === "ornament_mode_missing") delete packet.visualArtEvidence.screenJudgements[0].ornamentMode;
    if (incident.kind === "ornament_balanced") packet.visualArtEvidence.screenJudgements[0].ornamentMode = "BALANCED";
    if (incident.kind === "ornament_celebratory_misuse") packet.visualArtEvidence.screenJudgements[0].ornamentMode = "CELEBRATORY";
    if (incident.kind === "ornament_unknown_provenance") packet.visualArtEvidence.screenJudgements[0].ornaments[0].libraryRoot = "999:98";
    if (incident.kind === "ornament_missing_job") delete packet.visualArtEvidence.screenJudgements[0].ornaments[0].namedJob;
    if (incident.kind === "ornament_no_comparison") delete packet.visualArtEvidence.screenJudgements[0].noOrnamentComparison;
    if (incident.kind === "ornament_exploration") packet.visualArtEvidence.screenJudgements[0].ornaments[0].provenanceStatus = "EXPLORATION";
    if (incident.kind === "ornament_stale") packet.mechanicalEvidence.nodeFingerprints[0].fingerprint = "c".repeat(64);
    if (incident.kind === "ornament_self_approval") packet.visualArtEvidence.screenJudgements[0].ornaments[0].creatorTaskId = "fixture-curator";
    if (incident.kind === "ornament_none_unfinished") {
      const judgment = packet.visualArtEvidence.screenJudgements[0];
      judgment.ornamentMode = "NONE";
      judgment.ornaments = [];
      judgment.compositionBalance = "FINDING";
    }
    const errors = computeAdmission(localManifest, packet).errors;
    assert(errors.some(e => e.code === incident.expected), `${incident.name}: expected ${incident.expected}, got ${errors.map(e => e.code).join(",")}`);
    passed++;
  }
  const cleanPacket = correctedPacket(manifest);
  validateJsonSchema(cleanPacket.visualArtEvidence, schema.$defs.visualArtEvidence, schema);
  const clean = computeAdmission(manifest, cleanPacket);
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
  const selfTests = runIncidentSelfTests(manifest, schema, incidents);

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
