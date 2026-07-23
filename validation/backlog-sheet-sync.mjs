import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { buildBootstrapChanges, buildChanges, parseRegister, sheetRow, validateDashboardContract } from "../scripts/sync-backlog-sheet.mjs";

const config = JSON.parse(await readFile(new URL("../plans/backlog-sheet-sync.json", import.meta.url), "utf8"));
const markdown = await readFile(new URL("../plans/backlog-acceptance-register.md", import.meta.url), "utf8");
const base = parseRegister(markdown, config, "test base");

assert.equal(base.rows.size, 57);
assert.equal(sheetRow(base.rows.get("1")).length, 18);
assert.equal(base.rows.get("1").quality.deliveryState, "Delivered with quality limitation");
assert.equal(base.rows.get("1").quality.qualityRisk, "Red");
assert.match(base.rows.get("1").quality.bugBashStatus, /Required for high-impact closure/);
assert.equal(base.rows.get("12").quality.qualityRisk, "Amber");
assert.equal(base.rows.get("12").quality.deliveryState, "Core overlay delivered; UI placement decision open");
assert.match(base.rows.get("12").quality.limitations, /owner-approved discoverable location/);
assert.match(base.rows.get("2").quality.sourceConfidence, /Primary\/textual and institutional/);
assert.match(base.rows.get("13").quality.sourceConfidence, /Bengali sources/);
assert.equal(base.rows.get("5").quality.deliveryState, "Built and tested locally — not publicly delivered");
assert.match(base.rows.get("5").quality.limitations, /Not deployed/);
assert.match(base.rows.get("5").quality.shortTermImpact, /External developers cannot use/);
assert.match(base.rows.get("5").quality.longTermImpact, /quota enforcement unreliable/);
assert.match(base.rows.get("5").quality.bugBashStatus, /not completed/i);
assert.equal(base.rows.get("5").quality.qualityRisk, "Red");
assert.match(base.rows.get("5").quality.lastVerified, /Local HTTP smoke only/);
assert.match(base.rows.get("5").quality.sourceConfidence, /Not applicable/);

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
    ["#", "Backlog item", "Effort", "Technical / coding complexity", "Progress", "Remaining AI time", "Dependencies", "Why it may take longer", "Acceptance criteria", "Definition of done / closure evidence", "Delivery state", "Limitations / pending work", "Short-term impact", "Long-term impact", "Bug-bash status / evidence", "Quality risk (RAG)", "Last verified · environment", "Source confidence"],
  ]]));
  for (const tab of config.tabs) {
    let rowNumber = 2;
    for (const row of parsed.rowsBySection.get(tab.section)) {
      const cells = sheetRow(row);
      liveById.set(row.id, { id: row.id, section: tab.section, sheetName: tab.sheetName, rowNumber, cells: [...cells] });
      liveBySection.get(tab.section).push([...cells]);
      rowNumber += 1;
    }
  }
  return { liveById, liveBySection };
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
  [{ kind: "cell", id: "1", sheetIndex: 4, value: "100%" }],
  "an explicitly requested bootstrap must identify every stale live cell against the repository",
);
assert.deepEqual(buildBootstrapChanges(head, alreadyPublished), [], "bootstrap must be idempotent after alignment");

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
  57,
  "the first run may parse a pre-metadata base while preserving its old cell values",
);

console.log("Backlog Sheet sync gate: PASS — 57 rows; 18-column quality contract, dashboard formula guard, high-impact bug-bash/RAG policy, API limitation/impact disclosure, verification/source confidence, changed-cell targeting, idempotence, conflict refusal, metadata guard and explicit bootstrap planning verified.");
