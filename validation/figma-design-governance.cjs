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
const REVIEW_ROLES = ["mechanical", "accessibility", "ornament_background", "ornament_curator", "blind_visual", "visual_art", "integrator"];
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
  assert(manifest.batchAdmission.exactVisualArtPassRequired === true, "exact Visual Art PASS must be mandatory");
  assert(manifest.batchAdmission.visualArtMutationInvalidatesPass === true, "post-review mutation must invalidate Visual Art PASS");
  assert(manifest.batchAdmission.independentVisualArtReviewerRequired === true, "Visual Art reviewer must be independent");
  assert(manifest.batchAdmission.ornamentCuratorReviewRequired === true, "ornament curator review must be mandatory");
  assert(manifest.batchAdmission.directorOnlyLibraryRelease === true, "only the Director may release library selections");

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

function computeAdmission(manifest, packet) {
  const errors = [...decisionErrors(manifest), ...auditMechanical(manifest, packet.mechanicalEvidence || {})];
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
  const visualArt = packet.visualArtReviews || [];
  const visualArtIds = visualArt.map(review => review.screen);
  if (visualArt.length !== screens.length || new Set(visualArtIds).size !== screens.length || visualArtIds.some(id => !screenIds.includes(id))) {
    errors.push({ code: "VISUAL_ART_ADMISSION", detail: "Visual Art reviews do not bind one-to-one to the exact current roster" });
  }
  const visualArtByScreen = new Map(visualArt.map(review => [review.screen, review]));
  const ornamentDecisions = new Set(["KEEP", "REMOVE", "REPLACE", "PROPOSE"]);
  for (const screen of screens) {
    const art = visualArtByScreen.get(screen.node);
    if (!art) continue;
    const composition = art.composition || {};
    const resemblance = art.rejectedResemblance || {};
    const noOrnament = art.noOrnamentComparison || {};
    const background = art.background || {};
    const ornaments = art.ornaments;
    const screenshotsBound = /^(https:\/\/|fixture:\/\/)/.test(art.naturalScaleScreenshot || "") &&
      art.batchContextScreenshot === packet.visualArtContactSheet;
    const contentBound = typeof screen.contentFingerprint === "string" && screen.contentFingerprint.length >= 12 &&
      art.contentFingerprint === screen.contentFingerprint && art.contentUnchangedSinceReview === true &&
      art.mutatedAfterReview === false;
    const independent = art.independent === true && art.authoredByReviewer === false && Boolean(art.reviewer);
    const backgroundComplete = ornamentDecisions.has(background.decision) && typeof background.reason === "string" && background.reason.length >= 12;
    const ornamentComplete = art.ornamentInventoryComplete === true && Array.isArray(ornaments) && ornaments.every(ornament =>
      isNodeId(ornament.node) && ornamentDecisions.has(ornament.decision) &&
      ["purpose", "provenance", "fit", "clearSpace", "alignment", "scale"].every(key => typeof ornament[key] === "string" && ornament[key].length >= 3)
    );
    const noOrnamentComplete = noOrnament.performed === true && typeof noOrnament.assessment === "string" && noOrnament.assessment.length >= 12;
    const compositionComplete = ["balance", "empty", "dull", "crowded"].every(key => composition[key] === "PASS") &&
      typeof composition.assessment === "string" && composition.assessment.length >= 12;
    const resemblanceComplete = resemblance.status === "PASS" && Array.isArray(resemblance.evidence) && resemblance.evidence.length > 0;
    if (art.decision !== "PASS" || art.unresolvedVisualFindingCount !== 0 || !screenshotsBound || !contentBound || !independent ||
        !backgroundComplete || !ornamentComplete || !noOrnamentComplete || !compositionComplete || !resemblanceComplete ||
        art.inspectedAt !== packet.inspectedAt) {
      errors.push({ code: "VISUAL_ART_ADMISSION", detail: `${screen.node}: exact independent Visual Art release evidence is missing, stale or incomplete` });
    }
  }
  const curatorReviews = packet.ornamentCuratorReviews || [];
  const curatorIds = curatorReviews.map(review => review.screen);
  if (curatorReviews.length !== screens.length || new Set(curatorIds).size !== screens.length || curatorIds.some(id => !screenIds.includes(id))) {
    errors.push({ code: "ORNAMENT_CURATOR_ADMISSION", detail: "Ornament Curator reviews do not bind one-to-one to the exact current roster" });
  }
  const allowedModes = new Set(["NONE", "RESTRAINED", "RICH", "CELEBRATORY"]);
  const celebratoryContexts = new Set(["festival", "vrat", "ceremonial_hero"]);
  const screenById = new Map(screens.map(screen => [screen.node, screen]));
  for (const review of curatorReviews) {
    const libraryNodes = review.libraryNodes || [];
    const curatorOrnaments = review.ornaments || [];
    const screen = screenById.get(review.screen);
    const art = visualArtByScreen.get(review.screen);
    const explorationValid = (review.newSourceDerivedAdditions || []).every(addition =>
      addition.status === "EXPLORATION" && Array.isArray(addition.alternatives) && addition.alternatives.length >= 2 &&
      addition.autoApproved === false && addition.directorReleased === false && typeof addition.role === "string" && addition.role.length >= 3 &&
      typeof addition.context === "string" && addition.context.length >= 3
    );
    const selectionValid = review.selection === "NO_ORNAMENT"
      ? review.mode === "NONE" && libraryNodes.length === 0 && curatorOrnaments.length === 0
      : review.selection === "LIBRARY_ORNAMENT" && review.mode !== "NONE" && libraryNodes.length > 0 && libraryNodes.every(isNodeId) &&
        curatorOrnaments.length === libraryNodes.length && curatorOrnaments.every(ornament =>
          isNodeId(ornament.node) && isNodeId(ornament.componentNode) && libraryNodes.includes(ornament.componentNode) &&
          ["job", "provenance", "placement", "clearSpace", "alignment", "scale"].every(key =>
            typeof ornament[key] === "string" && ornament[key].length >= 3
          )
        );
    const celebratoryValid = review.mode !== "CELEBRATORY" || celebratoryContexts.has(review.contextClass);
    const contextValid = Array.isArray(review.permittedContexts) && review.permittedContexts.includes(review.contextClass);
    const rationaleValid = typeof review.rationale === "string" && review.rationale.length >= 12 &&
      typeof review.compositionRationale === "string" && review.compositionRationale.length >= 12 &&
      review.noOrnamentComparison?.performed === true &&
      typeof review.noOrnamentComparison?.assessment === "string" && review.noOrnamentComparison.assessment.length >= 12;
    const contentBound = screen && review.contentFingerprint === screen.contentFingerprint &&
      review.contentUnchangedSinceReview === true && review.mutatedAfterReview === false;
    const independentCurator = review.independent === true && review.authoredByCurator === false && Boolean(review.curator) &&
      art && art.reviewer !== review.curator;
    const independentVisualArtPass = art?.decision === "PASS" && art.unresolvedVisualFindingCount === 0 &&
      art.independent === true && art.authoredByReviewer === false && review.visualArtReviewed === true;
    if (!allowedModes.has(review.mode) || review.mode === "BALANCED" || !selectionValid || !celebratoryValid || !contextValid ||
        !rationaleValid || !contentBound || !independentCurator || !independentVisualArtPass || !explorationValid ||
        review.atlasNode !== "723:14636" || typeof review.job !== "string" || review.job.length < 3 ||
        review.directorReleased !== true) {
      errors.push({ code: "ORNAMENT_CURATOR_ADMISSION", detail: `${review.screen}: curator selection is missing, unscoped, unreleased or uses a rejected mode` });
    }
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
    lineage: screens.map((screen, index) => ({ screen, source: `980:${index + 1}`, regenerated: true }))
  };
}

function correctedPacket(manifest) {
  const screenIds = canonicalBatchScreens(manifest);
  const screens = screenIds.map(node => ({ node, name: fixtureName(node), screenshot: `fixture://${node}`, contentFingerprint: `fixture-content-${node}` }));
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
  return {
    batchId: "FIXTURE-BATCH-01", figmaFile: manifest.decisions.find(decision => decision.id === "RULE-001").scope.figmaFile,
    sectionNode: BATCH_SECTION, inspectedAt: "2026-08-20", contactSheet: "fixture://batch", visualArtContactSheet: "fixture://visual-art-batch", screens, screenAudits, sourceFirstRequired: true,
    mechanicalEvidence: correctedFixture(manifest),
    reviews: REVIEW_ROLES.map(role => ({ role, status: "FULL_SCREEN_PASS", reviewer: `fixture-${role}`, evidence: ["fixture"], coversAllScreens: true, cold: role === "blind_visual" })),
    visualArtReviews: screens.map(screen => ({
      screen: screen.node, decision: "PASS", inspectedAt: "2026-08-20", reviewer: "fixture-independent-visual-art",
      independent: true, authoredByReviewer: false, naturalScaleScreenshot: screen.screenshot,
      batchContextScreenshot: "fixture://visual-art-batch", contentFingerprint: screen.contentFingerprint,
      contentUnchangedSinceReview: true, mutatedAfterReview: false, unresolvedVisualFindingCount: 0,
      background: { decision: "KEEP", reason: "Fixture background is appropriate for the exact screen." },
      ornamentInventoryComplete: true, ornaments: [],
      noOrnamentComparison: { performed: true, assessment: "Fixture no-ornament comparison confirms the current composition." },
      composition: { balance: "PASS", empty: "PASS", dull: "PASS", crowded: "PASS", assessment: "Fixture composition is balanced at natural and batch scale." },
      rejectedResemblance: { status: "PASS", evidence: ["Fixture rejected-resemblance sweep is clear."] }
    })),
    ornamentCuratorReviews: screens.map(screen => ({
      screen: screen.node, curator: "fixture-ornament-curator", atlasNode: "723:14636", selection: "NO_ORNAMENT",
      independent: true, authoredByCurator: false, mode: "NONE", contextClass: "data", permittedContexts: ["data"],
      job: "Explicit no-ornament composition", rationale: "Fixture screen requires no local ornament for its functional composition.",
      libraryNodes: [], ornaments: [], noOrnamentComparison: { performed: true, assessment: "Fixture comparison confirms no ornament is the stronger composition." },
      compositionRationale: "Fixture content and shared boundaries complete the page without local decoration.",
      contentFingerprint: screen.contentFingerprint, contentUnchangedSinceReview: true, mutatedAfterReview: false,
      newSourceDerivedAdditions: [], visualArtReviewed: true, directorReleased: true
    })),
    knownFindings: [], holisticJudgements: screenIds.map(screen => ({ screen, naturalScale: "PASS", contactSheet: "PASS" })), requestedDisposition: "FULL_SCREEN_PASS"
  };
}

function runIncidentSelfTests(manifest, incidents) {
  let passed = 0;
  for (const incident of incidents.cases) {
    const localManifest = JSON.parse(JSON.stringify(manifest));
    const packet = correctedPacket(localManifest);
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
    if (incident.kind === "missing_visual_art") packet.visualArtReviews = [];
    if (incident.kind === "self_visual_art") packet.visualArtReviews[0].authoredByReviewer = true;
    if (incident.kind === "mutated_visual_art") packet.visualArtReviews[0].mutatedAfterReview = true;
    if (incident.kind === "visual_finding") packet.visualArtReviews[0].unresolvedVisualFindingCount = 1;
    if (incident.kind === "missing_curator") packet.ornamentCuratorReviews = [];
    if (incident.kind === "balanced_curator") packet.ornamentCuratorReviews[0].mode = "BALANCED";
    if (incident.kind === "self_curator") packet.ornamentCuratorReviews[0].authoredByCurator = true;
    if (incident.kind === "mutated_curator") packet.ornamentCuratorReviews[0].mutatedAfterReview = true;
    if (incident.kind === "curator_missing_provenance") {
      packet.ornamentCuratorReviews[0].selection = "LIBRARY_ORNAMENT";
      packet.ornamentCuratorReviews[0].mode = "RICH";
      packet.ornamentCuratorReviews[0].libraryNodes = ["760:6"];
      packet.ornamentCuratorReviews[0].ornaments = [{ node: "990:1", componentNode: "760:6", job: "edge" }];
    }
    if (incident.kind === "none_without_rationale") packet.ornamentCuratorReviews[0].compositionRationale = "";
    if (incident.kind === "celebratory_scope") {
      packet.ornamentCuratorReviews[0].selection = "LIBRARY_ORNAMENT";
      packet.ornamentCuratorReviews[0].mode = "CELEBRATORY";
      packet.ornamentCuratorReviews[0].libraryNodes = ["760:4"];
      packet.ornamentCuratorReviews[0].contextClass = "data";
    }
    if (incident.kind === "autoapprove_exploration") packet.ornamentCuratorReviews[0].newSourceDerivedAdditions.push({ status: "APPROVED", alternatives: ["A", "B"], autoApproved: true, directorReleased: true, role: "hero", context: "festival" });
    if (incident.kind === "typed_status") packet.reviews[0].status = "NARROW_PASS";
    if (incident.kind === "admission") packet.knownFindings.push({ id: "OPEN", status: "open" });
    const errors = computeAdmission(localManifest, packet).errors;
    assert(errors.some(e => e.code === incident.expected), `${incident.name}: expected ${incident.expected}, got ${errors.map(e => e.code).join(",")}`);
    passed++;
  }
  const clean = computeAdmission(manifest, correctedPacket(manifest));
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
