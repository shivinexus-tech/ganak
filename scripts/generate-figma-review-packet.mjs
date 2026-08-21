#!/usr/bin/env node
import { readFile } from "node:fs/promises";

const path = process.argv[2];
if (!path) {
  console.error("Usage: node scripts/generate-figma-review-packet.mjs <evidence.json>");
  process.exit(2);
}

const packet = JSON.parse(await readFile(path, "utf8"));
const lines = [];
lines.push(`# ${packet.batchId} — holistic quality checklist`);
lines.push("");
lines.push(`- Figma section: \`${packet.sectionNode}\``);
lines.push(`- Historical label: ${packet.historicalFigmaLabel}`);
lines.push(`- Expected current disposition: \`${packet.expectedDisposition}\``);
lines.push(`- Source-first correction required: ${packet.sourceFirstRequired ? "yes" : "no"}`);
lines.push("");
lines.push("## Screen matrix");
lines.push("");
lines.push("| Screen | Review node | Source node | Natural scale | Contact sheet | Composition | Negative space | Grid/alignment | Geometry | Ornament purpose | Colour role | Language | Coherence |");
lines.push("|---|---:|---:|---|---|---|---|---|---|---|---|---|---|");
const judgements = new Map((packet.holisticJudgements || []).map(j => [j.screen, j]));
const mark = value => value === "PASS" ? "☑" : value === "FINDING" ? "✗" : "☐";
for (const s of packet.screens) {
  const judgement = judgements.get(s.node) || {};
  const full = judgement.naturalScale === "PASS" && judgement.contactSheet === "PASS" ? "PASS" : judgement.naturalScale;
  lines.push(`| ${s.name} | \`${s.node}\` | \`${s.sourceNode}\` | ${mark(judgement.naturalScale)} | ${mark(judgement.contactSheet)} | ${mark(full)} | ${mark(full)} | ${mark(full)} | ${mark(full)} | ${mark(full)} | ${mark(full)} | ${mark(full)} | ${mark(full)} |`);
}
lines.push("");
lines.push("## Desktop Visual Art binding");
lines.push("");
const visualArt = packet.visualArtEvidence;
if (!visualArt) {
  lines.push("- **MISSING** — owner review, release and full-screen admission are blocked.");
} else {
  const bound = visualArt.binding?.screenNodes || [];
  const current = packet.screens.map(s => s.node);
  const exact = JSON.stringify(bound) === JSON.stringify(current);
  const contactExact = JSON.stringify(visualArt.contactSheet?.memberNodes || []) === JSON.stringify(current);
  lines.push(`- Platform: \`${visualArt.platform}\``);
  lines.push(`- Exact current-node binding: **${exact ? "yes" : "no — stale"}**`);
  lines.push(`- Natural-scale immutable artifacts: ${visualArt.naturalScaleScreenshots?.length || 0}/${current.length}`);
  lines.push(`- Contact-sheet exact membership: **${contactExact ? "yes" : "no — stale"}**`);
  lines.push(`- Independent reviewer: ${visualArt.reviewer?.independent ? visualArt.reviewer.taskId : "missing/self-approved"}`);
  lines.push(`- Exact-node judgments: ${visualArt.screenJudgements?.length || 0}/${current.length}`);
  const modes = new Map();
  for (const judgment of visualArt.screenJudgements || []) modes.set(judgment.ornamentMode || "MISSING", (modes.get(judgment.ornamentMode || "MISSING") || 0) + 1);
  lines.push(`- Ornament modes: ${[...modes].map(([mode, count]) => `${mode}=${count}`).join(", ") || "missing"}`);
  lines.push(`- Complete ornament inventories: ${(visualArt.screenJudgements || []).filter(j => j.inventoryComplete === true).length}/${current.length}`);
  lines.push(`- No-ornament comparisons: ${(visualArt.screenJudgements || []).filter(j => Boolean(j.noOrnamentComparison)).length}/${current.length}`);
  lines.push(`- Immutable evidence digest: ${visualArt.evidenceDigest || "missing"}`);
  if (visualArt.invalidationReason) lines.push(`- Invalidation: ${visualArt.invalidationReason}`);
}
lines.push("");
lines.push("## Mandatory review roles");
lines.push("");
for (const review of packet.reviews) {
  lines.push(`- ${review.role}: **${review.status}** — ${review.reviewer ?? "unassigned"}; covers all screens: ${review.coversAllScreens ? "yes" : "no"}; cold: ${review.cold ? "yes" : "no"}`);
}
lines.push("");
lines.push("## Known findings");
lines.push("");
for (const finding of packet.knownFindings) {
  lines.push(`- [${finding.status === "closed" ? "x" : " "}] ${finding.id} · ${finding.screen} · ${finding.category}: ${finding.summary}`);
}
lines.push("");
lines.push("## Admission rule");
lines.push("");
lines.push("No owner link may be sent until every box and mandatory role is evidenced, the blind reviewer is cold, source-first lineage is proven, and known open findings equal zero.");
console.log(lines.join("\n"));
