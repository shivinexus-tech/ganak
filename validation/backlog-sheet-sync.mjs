import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  buildBootstrapChanges,
  buildChanges,
  buildSyncChanges,
  parseRegister,
  planDimensionExpansions,
  sheetRow,
  validateDashboardContract,
} from "../scripts/sync-backlog-sheet.mjs";

const config = JSON.parse(await readFile(new URL("../plans/backlog-sheet-sync.json", import.meta.url), "utf8"));
const markdown = await readFile(new URL("../plans/backlog-acceptance-register.md", import.meta.url), "utf8");
const base = parseRegister(markdown, config, "test base");

assert.equal(base.rows.size, 83);

// 76-83 added 2026-08-18: the defects a five-lane audit-and-fix sweep found and
// closed in one day. Registered as closed work with gate evidence, except 76 and
// 80, whose remaining share is named honestly in the register rather than rounded up.
assert.equal(base.rows.get("76").section, "P0");
assert.equal(base.rows.get("83").section, "P0");

// 73, 74 and 75 added 2026-08-14: the three reference-source divergences the
// 2026-08-12 Drik cross-check left open (C3). All three shipped with the row, so
// they are registered as closed work with gate evidence, not as intentions.
// NOTE ON NUMBERING: these were first drafted as 62/63/64 against a stale branch;
// those IDs already belong to the SEO rows on main, and the Sheet sync treats a
// duplicate ID as a hard failure. Renumbered to the next free IDs.
assert.equal(base.rows.get("73").section, "P0");
assert.equal(base.rows.get("73").metadata.title, "Cross-midnight times must carry their date (`C3-CROSSMIDNIGHT-DATE`)");
assert.equal(base.rows.get("74").section, "P1");
assert.equal(base.rows.get("74").metadata.title, "Moonset divergence vs Drik ~43 min (`C3-MOONSET-DRIK`)");
assert.equal(base.rows.get("75").section, "P1");
assert.equal(base.rows.get("75").metadata.title, "Godhuli convention divergence ~14 min (`C3-GODHULI-DRIK`)");
// 70 and 71 added 2026-08-13 at owner instruction: Drik-style calendar/regional
// Panchang-name display, and a Panchang utilities hub. Both are deliberately
// registered as brainstorming/spec rows, not as implementation claims.
assert.equal(base.rows.get("70").section, "P1");
assert.equal(base.rows.get("70").metadata.title, "Calendar types and regional Panchang-name display");
assert.equal(base.rows.get("71").section, "P1");
assert.equal(base.rows.get("71").metadata.title, "Panchang utilities hub");
// 69 added 2026-08-11: E-1.0, registered at the owner's instruction after the code
// had already shipped, so the two human follow-ups (B8, B10) have a home.
assert.equal(base.rows.get("69").section, "P1");
assert.equal(base.rows.get("69").metadata.title, "E-1.0 English sign names and one shared name table");
// 67 and 68 added 2026-08-11: the sunrise-vs-midnight panchang day boundary, and
// the empty night Blocked lane. Both found on production while verifying the Hora
// overhaul; both deliberately left unfixed there and tracked instead.
assert.equal(base.rows.get("67").section, "P2");
assert.equal(base.rows.get("67").metadata.title, "Panchang day boundary — sunrise-to-sunrise, not midnight");
assert.equal(base.rows.get("68").section, "P2");
assert.equal(base.rows.get("68").metadata.title, 'Empty "Blocked" lane reads as a glitch at night');
assert.equal(sheetRow(base.rows.get("1")).length, 19);
assert.equal(base.rows.get("58").section, "P0");
assert.equal(base.rows.get("58").metadata.title, "Direct date entry and better Panchang date picker");
assert.equal(base.rows.get("59").section, "P0");
assert.equal(base.rows.get("59").metadata.title, "Global site search and guided “find what I need” input");
assert.equal(base.rows.get("46").section, "P1");
assert.equal(base.rows.get("46").metadata.title, "Design-system pass");
// 95% -> 93%: the row claimed only human verification remained, which the 2026-08-10 city
// bash disproved. Percentages move down when a bash reopens real work, not silently back up.
assert.equal(sheetRow(base.rows.get("46"))[4], "93%");
// Realigned 2026-08-10 after the second independent city bug bash. The old pins asserted
// "only the standing owner live sign-off ... remain" and "No link-city code action remains";
// both became false when that bash found a P1 (the same-city false conflict) plus three P2s.
// Pinning stale text would have forced the register to keep claiming the journey was clear.
// No assertion was dropped — each is re-pointed at what is now true, and the row's open
// limitations and unbuilt account sync are pinned so they cannot be quietly deleted.
assert.equal(base.rows.get("46").quality.deliveryState, "Base design-system pass, the first-run city chooser and the linked-city question are deployed; a second independent city bug bash on 2026-08-10 found one P1 and three P2s, three of which are now fixed with permanent behavioural gates, deployed and production-verified. One P2 (blocking-dialog width on phones) and three P3s remain open, alongside the standing owner live sign-off and the human real-device accessibility pass.");
assert.equal(base.rows.get("46").quality.qualityRisk, "Amber");
assert.match(base.rows.get("46").quality.limitations, /Cloudflare Web Analytics beacon/);
assert.match(base.rows.get("46").quality.limitations, /signed-in cross-device account sync/i);
assert.match(base.rows.get("46").quality.bugBashStatus, /first-run-city/);
assert.match(base.rows.get("46").quality.bugBashStatus, /not harmless/);
assert.match(base.rows.get("46").quality.recommendedAction, /within 5km/);
assert.match(base.rows.get("46").quality.recommendedAction, /300km/);
assert.equal(sheetRow(base.rows.get("1"))[4], "90%");
assert.equal(base.rows.get("1").quality.deliveryState, "Immediate Jyotish continuity bridge live locally; final redesigned-UI migration incomplete");
assert.equal(base.rows.get("1").quality.qualityRisk, "Amber");
assert.match(base.rows.get("1").quality.bugBashStatus, /F7 was then fixed/);
assert.match(base.rows.get("1").quality.limitations, /standalone legacy-page shell/);
assert.match(base.rows.get("1").quality.shortTermImpact, /retain city, timezone and language/);
assert.equal(base.rows.get("12").quality.qualityRisk, "Amber");
assert.equal(base.rows.get("12").quality.deliveryState, "Implemented on main — final QA and production verification pending");
assert.match(base.rows.get("12").quality.limitations, /calendar-options row/);
assert.match(base.rows.get("2").quality.sourceConfidence, /Primary\/textual and institutional/);
assert.match(base.rows.get("13").quality.sourceConfidence, /Bengali sources/);
assert.equal(base.rows.get("5").quality.deliveryState, "Built, adversarially tested and fix-merged locally — not publicly delivered");
assert.match(base.rows.get("5").quality.limitations, /Not deployed/);
assert.match(base.rows.get("5").quality.shortTermImpact, /External developers cannot use/);
assert.match(base.rows.get("5").quality.longTermImpact, /quota enforcement unreliable/);
assert.match(base.rows.get("5").quality.bugBashStatus, /Required high-impact bug bash completed/);
assert.equal(base.rows.get("5").quality.qualityRisk, "Amber");
assert.match(base.rows.get("5").quality.lastVerified, /Local server smoke after c271dc9/);
assert.match(base.rows.get("5").quality.sourceConfidence, /Not applicable/);
assert.match(base.rows.get("1").quality.recommendedAction, /Keep row open at 90%/);
assert.match(base.rows.get("5").quality.recommendedAction, /deploy the API/);
assert.match(base.rows.get("12").quality.recommendedAction, /Codex-owned EN\/HI phone\/desktop/);
assert.match(base.rows.get("2").quality.recommendedAction, /bug bash/);
assert.match(base.rows.get("13").quality.recommendedAction, /No corrective action/);

const dashboardFixture = {
  title: "Ganak Quality Dashboard",
  metricFormulas: Array.from({ length: 7 }, (_, index) => `=COUNTIF(A:A,"${index}")`),
  listFormulas: Array.from({ length: 6 }, () => "=IFERROR(FILTER(A:A,A:A<>\"\"),\"None\")"),
};
assert.doesNotThrow(() => validateDashboardContract(dashboardFixture, config));
assert.throws(
  () => validateDashboardContract({ ...dashboardFixture, listFormulas: dashboardFixture.listFormulas.slice(1) }, config),
  /retain 6 filtered management lists/,
  "a deleted dashboard list formula must fail the permanent gate",
);

const legacyConfig = structuredClone(config);
delete legacyConfig.qualityColumns;
delete legacyConfig.qualityDefaults;
delete legacyConfig.qualityOverrides;
const legacyBase = parseRegister(markdown, legacyConfig, "legacy quality-free base");
assert.equal(sheetRow(legacyBase.rows.get("1")).slice(10).every((value) => value === ""), true);

const v2Config = structuredClone(config);
v2Config.qualityColumns = v2Config.qualityColumns.slice(0, 5);
delete v2Config.highImpactItemIds;
delete v2Config.sourceNotApplicableItemIds;
delete v2Config.dashboard;
for (const override of Object.values(v2Config.qualityOverrides)) {
  delete override.qualityRisk;
  delete override.lastVerified;
  delete override.sourceConfidence;
}
const v2Base = parseRegister(markdown, v2Config, "five-column quality base");
assert.equal(sheetRow(v2Base.rows.get("5")).slice(15).every((value) => value === ""), true);

const changedMarkdown = markdown
  .split(/(\r?\n)/)
  .map((part) => {
    if (!part.startsWith("| 3 | Expose and polish all built Jyotish panels |")) return part;
    const cells = part.split("|");
    cells[4] = " 61% ";
    return cells.join("|");
  })
  .join("");
assert.notEqual(changedMarkdown, markdown, "test fixture must change backlog item 3");
const head = parseRegister(changedMarkdown, config, "test head");

function makeLive(parsed) {
  const liveById = new Map();
  const liveBySection = new Map(config.tabs.map((tab) => [tab.section, [
    ["#", "Backlog item", "Effort", "Technical / coding complexity", "Progress", "Remaining AI time", "Dependencies", "Why it may take longer", "Acceptance criteria", "Definition of done / closure evidence", "Delivery state", "Limitations / pending work", "Short-term impact", "Long-term impact", "Bug-bash status / evidence", "Quality risk (RAG)", "Last verified · environment", "Source confidence", "Recommendation / action items"],
  ]]));
  const tabInfo = new Map();
  for (const tab of config.tabs) {
    let rowNumber = 2;
    for (const row of parsed.rowsBySection.get(tab.section)) {
      const cells = sheetRow(row);
      liveById.set(row.id, { id: row.id, section: tab.section, sheetName: tab.sheetName, rowNumber, cells: [...cells] });
      liveBySection.get(tab.section).push([...cells]);
      rowNumber += 1;
    }
    tabInfo.set(tab.sheetName, {
      sheetId: 1000 + tabInfo.size,
      rowCount: liveBySection.get(tab.section).length,
      columnCount: 19,
    });
  }
  return { liveById, liveBySection, headerMigrations: [], tabInfo };
}

function removeLiveRow(live, id) {
  const liveRow = live.liveById.get(id);
  assert.ok(liveRow, `fixture must contain live row ${id}`);
  live.liveById.delete(id);
  const rows = live.liveBySection.get(liveRow.section);
  const index = rows.findIndex((cells) => cells[0] === id);
  assert.ok(index >= 0, `fixture section must contain live row ${id}`);
  rows.splice(index, 1);
}

const live = makeLive(base);
const changes = buildChanges(base, head, live, config);
assert.deepEqual(
  changes.map(({ kind, sheetIndex, value }) => ({ kind, sheetIndex, value })),
  [{ kind: "cell", sheetIndex: 4, value: "61%" }],
  "a progress edit must target only Sheet column E",
);

const alreadyPublished = makeLive(head);
assert.deepEqual(buildChanges(base, head, alreadyPublished, config), [], "an already-published change must be idempotent");

const staleBaseline = makeLive(head);
staleBaseline.liveById.get("1").cells[4] = "20%";
assert.deepEqual(
  buildBootstrapChanges(head, staleBaseline).map(({ kind, liveRow, sheetIndex, value }) => ({ kind, id: liveRow.id, sheetIndex, value })),
  [{ kind: "cell", id: "1", sheetIndex: 4, value: "90%" }],
  "an explicitly requested bootstrap must identify every stale live cell against the repository",
);
assert.deepEqual(buildBootstrapChanges(head, alreadyPublished), [], "bootstrap must be idempotent after alignment");

const missedPublish = makeLive(base);
removeLiveRow(missedPublish, "60");
removeLiveRow(missedPublish, "61");
missedPublish.liveById.get("46").cells[4] = "55%";
const selfHealChanges = buildSyncChanges(base, base, missedPublish, config);
assert.deepEqual(
  selfHealChanges
    .filter((change) => change.kind === "append")
    .map((change) => change.after.id),
  ["60", "61"],
  "incremental sync must append repository rows missing from a stale live Sheet",
);
assert.ok(
  selfHealChanges.some((change) => (
    change.kind === "cell"
    && change.liveRow.id === "46"
    && change.sheetIndex === 4
    && change.value === "93%"   // realigned with row 46 after the 2026-08-10 city bug bash
  )),
  "incremental sync must repair stale live cells even when the Git base already contains the new value",
);
assert.throws(
  () => buildChanges(base, base, missedPublish, config),
  /Live Sheet is missing existing backlog ID 60/,
  "the permanent regression fixture must exercise the exact stale-Sheet wedge that broke the workflow",
);

const crampedMissedPublish = makeLive(base);
removeLiveRow(crampedMissedPublish, "60");
removeLiveRow(crampedMissedPublish, "61");
for (const tab of config.tabs) {
  const rowCount = crampedMissedPublish.liveBySection.get(tab.section).length;
  crampedMissedPublish.tabInfo.get(tab.sheetName).rowCount = rowCount;
}
const rowExpansionRequests = planDimensionExpansions(
  buildSyncChanges(base, base, crampedMissedPublish, config),
  crampedMissedPublish,
  config,
).filter((request) => request.appendDimension?.dimension === "ROWS");
assert.ok(
  rowExpansionRequests.length >= 1,
  "append recovery must expand the live Sheet row grid before writing missing rows",
);

const legacyHeaderLive = makeLive(base);
legacyHeaderLive.headerMigrations.push({
  kind: "header",
  sheetName: "P0 Before Go-Live",
  sheetId: 123,
  additionalColumns: 1,
  sheetIndex: 18,
  value: "Recommendation / action items",
});
assert.deepEqual(
  buildChanges(base, base, legacyHeaderLive, config),
  legacyHeaderLive.headerMigrations,
  "the publisher must migrate the old 18-column header without rewriting existing cells",
);

const conflicted = makeLive(base);
conflicted.liveById.get("3").cells[4] = "59%";
assert.throws(
  () => buildChanges(base, head, conflicted, config),
  /Conflict for ID 3, Progress/,
  "a third live value must fail rather than be overwritten",
);

const renamed = changedMarkdown.replace("Approved utility-calculator catalogue", "Renamed without metadata");
assert.throws(
  () => parseRegister(renamed, config, "renamed fixture"),
  /title mismatch for ID 1/,
  "renames must update sync metadata explicitly",
);

const preAutomationMarkdown = markdown.replace(
  "| 57 | sunSidMs performance investigation |",
  "| 57 | `sunSidMs` performance investigation |",
);
assert.notEqual(preAutomationMarkdown, markdown, "bootstrap fixture must contain the historical title");
assert.throws(
  () => parseRegister(preAutomationMarkdown, config, "strict historical fixture"),
  /title mismatch for ID 57/,
  "normal runs must continue rejecting title drift",
);
assert.equal(
  parseRegister(preAutomationMarkdown, config, "bootstrap historical fixture", { allowMetadataTitleMismatch: true }).rows.size,
  83,
  "the first run may parse a pre-metadata base while preserving its old cell values",
);

console.log(`Backlog Sheet sync gate: PASS — ${base.rows.size} rows; 19-column quality/action contract, legacy-header migration, dashboard formula guard, high-impact bug-bash/RAG policy, API limitation/impact disclosure, verification/source confidence, changed-cell targeting, stale-Sheet self-heal, row-grid expansion, idempotence, strict conflict detector, metadata guard and explicit bootstrap planning verified.`);
