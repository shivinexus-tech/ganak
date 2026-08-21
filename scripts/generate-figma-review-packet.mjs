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
const visualArt = new Map((packet.visualArtReviews || []).map(j => [j.screen, j]));
const mark = value => value === "PASS" ? "☑" : value === "FINDING" ? "✗" : "☐";
for (const s of packet.screens) {
  const judgement = judgements.get(s.node) || {};
  const art = visualArt.get(s.node) || {};
  const full = judgement.naturalScale === "PASS" && judgement.contactSheet === "PASS" ? "PASS" : judgement.naturalScale;
  const artMark = art.decision === "PASS" && art.unresolvedVisualFindingCount === 0 && art.contentUnchangedSinceReview === true && art.mutatedAfterReview === false ? "PASS" : art.decision;
  lines.push(`| ${s.name} | \`${s.node}\` | \`${s.sourceNode}\` | ${mark(judgement.naturalScale)} | ${mark(judgement.contactSheet)} | ${mark(artMark)} | ${mark(artMark)} | ${mark(full)} | ${mark(full)} | ${mark(artMark)} | ${mark(artMark)} | ${mark(full)} | ${mark(artMark)} |`);
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
lines.push("## Exact Visual Art release records");
lines.push("");
for (const screen of packet.screens) {
  const art = visualArt.get(screen.node);
  if (!art) {
    lines.push(`- [ ] \`${screen.node}\`: missing`);
    continue;
  }
  lines.push(`- [${art.decision === "PASS" && art.unresolvedVisualFindingCount === 0 && art.contentUnchangedSinceReview === true && art.mutatedAfterReview === false ? "x" : " "}] \`${screen.node}\`: ${art.decision}; reviewer ${art.reviewer || "unassigned"}; ornaments ${Array.isArray(art.ornaments) ? art.ornaments.length : "missing"}; mutation-stable ${art.contentUnchangedSinceReview === true && art.mutatedAfterReview === false ? "yes" : "no"}`);
}
lines.push("");
lines.push("## Admission rule");
lines.push("");
lines.push("No owner link may be sent until every box and mandatory role is evidenced, the blind reviewer is cold, source-first lineage is proven, exact independent Visual Art records are complete and mutation-stable, and known open findings equal zero.");
console.log(lines.join("\n"));
