import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { buildBootstrapChanges, buildChanges, parseRegister, sheetRow } from "../scripts/sync-backlog-sheet.mjs";

const config = JSON.parse(await readFile(new URL("../plans/backlog-sheet-sync.json", import.meta.url), "utf8"));
const markdown = await readFile(new URL("../plans/backlog-acceptance-register.md", import.meta.url), "utf8");
const base = parseRegister(markdown, config, "test base");

assert.equal(base.rows.size, 57);
assert.equal(sheetRow(base.rows.get("1")).length, 15);
assert.equal(base.rows.get("5").quality.deliveryState, "Built and tested locally — not publicly delivered");
assert.match(base.rows.get("5").quality.limitations, /Not deployed/);
assert.match(base.rows.get("5").quality.shortTermImpact, /External developers cannot use/);
assert.match(base.rows.get("5").quality.longTermImpact, /quota enforcement unreliable/);
assert.match(base.rows.get("5").quality.bugBashStatus, /Not completed/);

const legacyConfig = structuredClone(config);
delete legacyConfig.qualityColumns;
delete legacyConfig.qualityDefaults;
delete legacyConfig.qualityOverrides;
const legacyBase = parseRegister(markdown, legacyConfig, "legacy quality-free base");
assert.equal(sheetRow(legacyBase.rows.get("1")).slice(10).every((value) => value === ""), true);

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
    ["#", "Backlog item", "Effort", "Technical / coding complexity", "Progress", "Remaining AI time", "Dependencies", "Why it may take longer", "Acceptance criteria", "Definition of done / closure evidence", "Delivery state", "Limitations / pending work", "Short-term impact", "Long-term impact", "Bug-bash status / evidence"],
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

console.log("Backlog Sheet sync gate: PASS — 57 rows; 15-column quality contract, API limitation/impact disclosure, changed-cell targeting, idempotence, conflict refusal, metadata guard and explicit bootstrap planning verified.");
