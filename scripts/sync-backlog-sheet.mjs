#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import process from "node:process";
import { pathToFileURL } from "node:url";

const REGISTER_PATH = "plans/backlog-acceptance-register.md";
const CONFIG_URL = new URL("../plans/backlog-sheet-sync.json", import.meta.url);
const REGISTER_URL = new URL(`../${REGISTER_PATH}`, import.meta.url);
const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets";

const LOCAL_COLUMNS = [
  "#",
  "Backlog item",
  "Effort",
  "Progress",
  "Remaining AI time",
  "Dependencies",
  "Why it may take longer",
  "Acceptance criteria",
  "Definition of done / closure evidence",
];

const SHEET_COLUMNS = [
  "#",
  "Backlog item",
  "Effort",
  "Technical / coding complexity",
  "Progress",
  "Remaining AI time",
  "Dependencies",
  "Why it may take longer",
  "Acceptance criteria",
  "Definition of done / closure evidence",
  "Delivery state",
  "Limitations / pending work",
  "Short-term impact",
  "Long-term impact",
  "Bug-bash status / evidence",
  "Quality risk (RAG)",
  "Last verified · environment",
  "Source confidence",
];

const QUALITY_KEYS = [
  "deliveryState",
  "limitations",
  "shortTermImpact",
  "longTermImpact",
  "bugBashStatus",
  "qualityRisk",
  "lastVerified",
  "sourceConfidence",
];

const LOCAL_TO_SHEET_COLUMN = [0, 1, 2, 4, 5, 6, 7, 8, 9];

function fail(message) {
  throw new Error(message);
}

function splitMarkdownRow(line) {
  const source = line.trim();
  if (!source.startsWith("|") || !source.endsWith("|")) {
    fail(`Not a Markdown table row: ${line}`);
  }

  const cells = [];
  let current = "";
  let inCode = false;
  let escaped = false;

  for (const char of source.slice(1, -1)) {
    if (escaped) {
      current += char;
      escaped = false;
      continue;
    }
    if (char === "\\") {
      current += char;
      escaped = true;
      continue;
    }
    if (char === "`") {
      inCode = !inCode;
      current += char;
      continue;
    }
    if (char === "|" && !inCode) {
      cells.push(current.trim().replaceAll("\\|", "|"));
      current = "";
      continue;
    }
    current += char;
  }
  cells.push(current.trim().replaceAll("\\|", "|"));
  return cells;
}

function resolveQuality(cells, config, id) {
  if (!config.qualityColumns) {
    return Object.fromEntries(QUALITY_KEYS.map((key) => [key, ""]));
  }
  const actualKeys = config.qualityColumns.map((column) => column.key);
  const actualHeaders = config.qualityColumns.map((column) => column.header);
  const expectedKeys = QUALITY_KEYS.slice(0, actualKeys.length);
  const expectedHeaders = SHEET_COLUMNS.slice(10, 10 + actualHeaders.length);
  if (JSON.stringify(actualKeys) !== JSON.stringify(expectedKeys)) {
    fail(`Quality column keys are ${actualKeys.join(", ")}; expected the ordered contract ${QUALITY_KEYS.join(", ")}`);
  }
  if (JSON.stringify(actualHeaders) !== JSON.stringify(expectedHeaders)) {
    fail("Quality column headers do not match the published Sheet contract");
  }
  const finish = (quality) => Object.fromEntries(
    QUALITY_KEYS.map((key) => [key, actualKeys.includes(key) ? normalizeCell(quality[key]) : ""]),
  );

  const defaults = config.qualityDefaults || {};
  const override = config.qualityOverrides?.[id];
  if (override) {
    const missing = actualKeys.filter((key) => !normalizeCell(override[key]).trim());
    if (missing.length) fail(`Quality override for ID ${id} is missing: ${missing.join(", ")}`);
    return finish(override);
  }

  const progress = normalizeCell(cells[3]);
  const remaining = normalizeCell(cells[4]);
  const dependencies = normalizeCell(cells[5]);
  const delayReason = normalizeCell(cells[6]);
  const closureEvidence = normalizeCell(cells[8]);
  const isDelivered = progress === "100%" || remaining === "Done";
  const isBaselineOngoing = /baseline complete/i.test(progress);
  const isNotStarted = /^0(?:%|\b)/.test(progress);
  const isHighImpact = (config.highImpactItemIds || []).map(String).includes(String(id));
  const qualityDelivered = isDelivered || isBaselineOngoing;
  let deliveryState = isDelivered
    ? "Delivered"
    : isBaselineOngoing
      ? "Launch baseline delivered — ongoing"
      : isNotStarted
        ? "Not started"
        : "In progress";
  const evidenceDate = closureEvidence.match(/20\d{2}-\d{2}-\d{2}/)?.[0];
  const hasProductionEvidence = /production|cloudflare|\blive\b/i.test(closureEvidence);
  const lastVerified = qualityDelivered
    ? `${evidenceDate || "Date not recorded"} · ${hasProductionEvidence ? "Production/live evidence recorded" : "Repository/validation evidence only; production not separately verified"}`
    : "Not production-verified";
  const sourceConfidence = (config.sourceNotApplicableItemIds || []).map(String).includes(String(id))
    ? defaults.technicalSourceConfidence
    : defaults.defaultSourceConfidence;

  if (qualityDelivered && isHighImpact) {
    deliveryState = isBaselineOngoing
      ? "Launch baseline delivered with quality limitation — ongoing"
      : "Delivered with quality limitation";
    return finish({
      deliveryState,
      limitations: "Mandatory high-impact bug bash has no completed evidence recorded.",
      shortTermImpact: "A cross-cutting or high-consequence release has not yet received its required adversarial challenge pass.",
      longTermImpact: "Undiscovered defects could affect several journeys or create safety, privacy, financial, religious-trust or operational risk.",
      bugBashStatus: "Required for high-impact closure — not completed/recorded.",
      qualityRisk: "Red",
      lastVerified,
      sourceConfidence,
    });
  }

  if (isDelivered) {
    return finish({
      deliveryState,
      limitations: defaults.deliveredLimitations,
      shortTermImpact: defaults.deliveredShortTermImpact,
      longTermImpact: defaults.deliveredLongTermImpact,
      bugBashStatus: defaults.deliveredBugBashStatus,
      qualityRisk: "Green",
      lastVerified,
      sourceConfidence,
    });
  }

  return finish({
    deliveryState,
    limitations: `Open: ${dependencies || "No dependency recorded"}. ${delayReason || "No delay reason recorded."}`,
    shortTermImpact: defaults.openShortTermImpact,
    longTermImpact: defaults.openLongTermImpact,
    bugBashStatus: isHighImpact
      ? "Required before high-impact closure — not yet completed."
      : defaults.openBugBashStatus,
    qualityRisk: "Amber",
    lastVerified,
    sourceConfidence,
  });
}

function parseRegister(markdown, config, sourceLabel, options = {}) {
  const tabsBySection = new Map(config.tabs.map((tab) => [tab.section, tab]));
  const rows = new Map();
  const rowsBySection = new Map(config.tabs.map((tab) => [tab.section, []]));
  let section = null;

  for (const line of markdown.split(/\r?\n/)) {
    const heading = line.match(/^##\s+(P[0-4])\b/) || line.match(/^##\s+(Optional)\b/);
    if (heading) {
      section = heading[1];
      continue;
    }
    if (!section || !tabsBySection.has(section) || !/^\|\s*\d+\s*\|/.test(line)) {
      continue;
    }

    const cells = splitMarkdownRow(line);
    if (cells.length !== LOCAL_COLUMNS.length) {
      fail(`${sourceLabel}: item row in ${section} has ${cells.length} columns; expected ${LOCAL_COLUMNS.length}: ${line}`);
    }

    const id = cells[0];
    if (rows.has(id)) fail(`${sourceLabel}: duplicate backlog ID ${id}`);
    const metadata = config.items[id];
    if (!metadata) fail(`${sourceLabel}: backlog ID ${id} is missing from plans/backlog-sheet-sync.json`);
    if (!options.allowMetadataTitleMismatch && metadata.title !== cells[1]) {
      fail(`${sourceLabel}: title mismatch for ID ${id}; register has “${cells[1]}”, sync metadata has “${metadata.title}”`);
    }
    if (metadata.section !== section) {
      fail(`${sourceLabel}: ID ${id} is under ${section}, but sync metadata assigns it to ${metadata.section}`);
    }
    if (!metadata.technicalComplexity) {
      fail(`${sourceLabel}: ID ${id} has no technical complexity`);
    }

    const quality = resolveQuality(cells, config, id);
    const requiredQualityKeys = (config.qualityColumns || []).map((column) => column.key);
    const missingQuality = requiredQualityKeys.filter((key) => !normalizeCell(quality[key]).trim());
    if (config.qualityColumns && missingQuality.length) {
      fail(`${sourceLabel}: quality fields missing for ID ${id}: ${missingQuality.join(", ")}`);
    }
    const row = { id, section, localCells: cells, metadata, quality };
    rows.set(id, row);
    rowsBySection.get(section).push(row);
  }

  const expectedIds = Object.keys(config.items);
  const missing = expectedIds.filter((id) => !rows.has(id));
  if (missing.length) fail(`${sourceLabel}: missing configured backlog IDs: ${missing.join(", ")}`);
  if (rows.size !== expectedIds.length) {
    fail(`${sourceLabel}: parsed ${rows.size} rows but metadata defines ${expectedIds.length}`);
  }

  for (const tab of config.tabs) {
    const actual = rowsBySection.get(tab.section).map((row) => Number(row.id));
    const expected = [...tab.itemIds];
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      fail(`${sourceLabel}: ${tab.section} IDs/order are ${actual.join(", ")}; expected ${expected.join(", ")}`);
    }
  }

  return { rows, rowsBySection };
}

function sheetRow(row) {
  return [
    row.localCells[0],
    row.localCells[1],
    row.localCells[2],
    row.metadata.technicalComplexity,
    ...row.localCells.slice(3),
    ...QUALITY_KEYS.map((key) => row.quality[key]),
  ];
}

function normalizeCell(value) {
  return value === undefined || value === null ? "" : String(value);
}

function a1SheetName(name) {
  return `'${name.replaceAll("'", "''")}'`;
}

function columnLetter(index) {
  let value = index + 1;
  let result = "";
  while (value > 0) {
    value -= 1;
    result = String.fromCharCode(65 + (value % 26)) + result;
    value = Math.floor(value / 26);
  }
  return result;
}

function readGitFile(revision, path) {
  try {
    return execFileSync("git", ["show", `${revision}:${path}`], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (error) {
    const detail = error.stderr?.toString().trim() || error.message;
    fail(`Could not read ${path} at ${revision}: ${detail}`);
  }
}

function readGitFileOptional(revision, path) {
  try {
    return execFileSync("git", ["show", `${revision}:${path}`], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch {
    return null;
  }
}

async function sheetsRequest(config, path, options = {}) {
  const token = process.env.GOOGLE_SHEETS_ACCESS_TOKEN;
  if (!token) fail("GOOGLE_SHEETS_ACCESS_TOKEN is required for --sync");
  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${config.spreadsheetId}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  if (!response.ok) {
    const body = (await response.text()).slice(0, 1200);
    fail(`Google Sheets API ${response.status} ${response.statusText}: ${body}`);
  }
  if (response.status === 204) return {};
  return response.json();
}

async function readLiveSheet(config) {
  const metadata = await sheetsRequest(
    config,
    "?fields=properties.title,sheets.properties(title,sheetId)",
  );
  if (metadata.properties?.title !== config.spreadsheetTitle) {
    fail(`Refusing to sync spreadsheet titled “${metadata.properties?.title || "unknown"}”; expected “${config.spreadsheetTitle}”`);
  }

  const liveTabs = new Set((metadata.sheets || []).map((sheet) => sheet.properties?.title));
  for (const tab of config.tabs) {
    if (!liveTabs.has(tab.sheetName)) fail(`Live spreadsheet is missing tab “${tab.sheetName}”`);
  }
  if (config.dashboard?.sheetName && !liveTabs.has(config.dashboard.sheetName)) {
    fail(`Live spreadsheet is missing dashboard tab “${config.dashboard.sheetName}”`);
  }

  const params = new URLSearchParams();
  for (const tab of config.tabs) params.append("ranges", `${a1SheetName(tab.sheetName)}!A1:R1000`);
  params.set("majorDimension", "ROWS");
  params.set("valueRenderOption", "FORMATTED_VALUE");
  const response = await sheetsRequest(config, `/values:batchGet?${params}`);

  const liveBySection = new Map();
  const liveById = new Map();
  response.valueRanges.forEach((valueRange, index) => {
    const tab = config.tabs[index];
    const values = valueRange.values || [];
    const header = (values[0] || []).map(normalizeCell);
    if (JSON.stringify(header) !== JSON.stringify(SHEET_COLUMNS)) {
      fail(`Header mismatch in “${tab.sheetName}”; refusing to guess column positions`);
    }
    liveBySection.set(tab.section, values);
    values.slice(1).forEach((cells, rowOffset) => {
      const id = normalizeCell(cells[0]);
      if (!id) return;
      if (liveById.has(id)) fail(`Live spreadsheet contains duplicate backlog ID ${id}`);
      liveById.set(id, {
        id,
        section: tab.section,
        sheetName: tab.sheetName,
        rowNumber: rowOffset + 2,
        cells: Array.from({ length: SHEET_COLUMNS.length }, (_, i) => normalizeCell(cells[i])),
      });
    });
  });
  return { liveBySection, liveById };
}

function buildChanges(base, head, live, config) {
  const changes = [];
  const allIds = new Set([...base.rows.keys(), ...head.rows.keys()]);

  for (const id of live.liveById.keys()) {
    if (!allIds.has(id)) fail(`Live Sheet contains unexpected backlog ID ${id}; reconcile it explicitly before syncing`);
  }

  for (const id of allIds) {
    const before = base.rows.get(id);
    const after = head.rows.get(id);
    const liveRow = live.liveById.get(id);

    if (before && !after) fail(`Backlog ID ${id} was deleted; deletion requires an explicit migration, not automatic sync`);
    if (!before && after) {
      if (liveRow) fail(`Backlog ID ${id} is new in Git but already exists in the live Sheet`);
      changes.push({ kind: "append", after });
      continue;
    }
    if (!before || !after) continue;
    if (before.section !== after.section) fail(`Backlog ID ${id} moved from ${before.section} to ${after.section}; tab moves require an explicit migration`);
    if (!liveRow) fail(`Live Sheet is missing existing backlog ID ${id}`);
    if (liveRow.section !== after.section) fail(`Backlog ID ${id} is in ${liveRow.section} live but ${after.section} in Git`);

    for (let localIndex = 0; localIndex < LOCAL_COLUMNS.length; localIndex += 1) {
      const oldValue = normalizeCell(before.localCells[localIndex]);
      const newValue = normalizeCell(after.localCells[localIndex]);
      if (oldValue === newValue) continue;
      const sheetIndex = LOCAL_TO_SHEET_COLUMN[localIndex];
      const liveValue = liveRow.cells[sheetIndex];
      if (liveValue === newValue) continue;
      if (liveValue !== oldValue) {
        fail(`Conflict for ID ${id}, ${SHEET_COLUMNS[sheetIndex]}: Git base is “${oldValue}”, Git head is “${newValue}”, live Sheet is “${liveValue}”`);
      }
      changes.push({ kind: "cell", liveRow, sheetIndex, value: newValue });
    }

    const oldComplexity = normalizeCell(before.metadata.technicalComplexity);
    const newComplexity = normalizeCell(after.metadata.technicalComplexity);
    if (oldComplexity !== newComplexity) {
      const liveValue = liveRow.cells[3];
      if (liveValue !== newComplexity) {
        if (liveValue !== oldComplexity) {
          fail(`Conflict for ID ${id}, technical complexity: Git base is “${oldComplexity}”, Git head is “${newComplexity}”, live Sheet is “${liveValue}”`);
        }
        changes.push({ kind: "cell", liveRow, sheetIndex: 3, value: newComplexity });
      }
    }

    QUALITY_KEYS.forEach((key, qualityIndex) => {
      const sheetIndex = 10 + qualityIndex;
      const oldValue = normalizeCell(before.quality[key]);
      const newValue = normalizeCell(after.quality[key]);
      if (oldValue === newValue) return;
      const liveValue = liveRow.cells[sheetIndex];
      if (liveValue === newValue) return;
      if (liveValue !== oldValue) {
        fail(`Conflict for ID ${id}, ${SHEET_COLUMNS[sheetIndex]}: Git base is “${oldValue}”, Git head is “${newValue}”, live Sheet is “${liveValue}”`);
      }
      changes.push({ kind: "cell", liveRow, sheetIndex, value: newValue });
    });
  }
  return changes;
}

function buildBootstrapChanges(head, live) {
  const changes = [];

  for (const id of live.liveById.keys()) {
    if (!head.rows.has(id)) fail(`Live Sheet contains unexpected backlog ID ${id}; reconcile it explicitly before bootstrapping`);
  }

  for (const [id, row] of head.rows) {
    const liveRow = live.liveById.get(id);
    if (!liveRow) fail(`Live Sheet is missing backlog ID ${id}; bootstrap will not guess row placement`);
    if (liveRow.section !== row.section) {
      fail(`Backlog ID ${id} is in ${liveRow.section} live but ${row.section} in Git; bootstrap will not move rows`);
    }
    const wanted = sheetRow(row);
    wanted.forEach((value, sheetIndex) => {
      const normalized = normalizeCell(value);
      if (liveRow.cells[sheetIndex] === normalized) return;
      changes.push({ kind: "cell", liveRow, sheetIndex, value: normalized });
    });
  }

  return changes;
}

function printBootstrapPlan(changes) {
  console.log(`Backlog Sheet bootstrap plan: ${changes.length} stale cell${changes.length === 1 ? "" : "s"} would be aligned to the repository register.`);
  for (const change of changes) {
    console.log(`- ID ${change.liveRow.id} · ${SHEET_COLUMNS[change.sheetIndex]} · ${change.liveRow.sheetName}!${columnLetter(change.sheetIndex)}${change.liveRow.rowNumber}`);
  }
}

async function applyChanges(changes, live, config) {
  const data = [];
  const nextAppendRow = new Map(
    config.tabs.map((tab) => [tab.section, Math.max(2, (live.liveBySection.get(tab.section) || []).length + 1)]),
  );
  for (const change of changes) {
    if (change.kind === "cell") {
      const cell = `${columnLetter(change.sheetIndex)}${change.liveRow.rowNumber}`;
      data.push({ range: `${a1SheetName(change.liveRow.sheetName)}!${cell}`, values: [[change.value]] });
      continue;
    }

    const tab = config.tabs.find((candidate) => candidate.section === change.after.section);
    const rowNumber = nextAppendRow.get(tab.section);
    nextAppendRow.set(tab.section, rowNumber + 1);
    data.push({
      range: `${a1SheetName(tab.sheetName)}!A${rowNumber}:R${rowNumber}`,
      values: [sheetRow(change.after)],
    });
  }

  if (!data.length) {
    console.log("Backlog Sheet sync: no changed cells to publish.");
    return;
  }

  await sheetsRequest(config, "/values:batchUpdate", {
    method: "POST",
    body: JSON.stringify({ valueInputOption: "RAW", data }),
  });
  console.log(`Backlog Sheet sync: published ${data.length} changed cell/row update${data.length === 1 ? "" : "s"}.`);
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const mode = args.has("--bootstrap-sync")
    ? "bootstrap-sync"
    : args.has("--bootstrap-plan")
      ? "bootstrap-plan"
      : args.has("--sync")
        ? "sync"
        : "check";
  const config = JSON.parse(await readFile(CONFIG_URL, "utf8"));
  const headMarkdown = await readFile(REGISTER_URL, "utf8");
  const head = parseRegister(headMarkdown, config, "working register");

  if (config.oauthScope !== SHEETS_SCOPE) fail(`Unexpected OAuth scope in config: ${config.oauthScope}`);
  console.log(`Backlog register check: ${head.rows.size} rows across ${config.tabs.length} tabs; IDs, titles, sections and technical complexities are complete.`);
  if (mode === "check") return;

  const live = await readLiveSheet(config);
  if (mode === "bootstrap-plan" || mode === "bootstrap-sync") {
    const changes = buildBootstrapChanges(head, live);
    printBootstrapPlan(changes);
    if (mode === "bootstrap-sync") await applyChanges(changes, live, config);
    return;
  }

  const baseSha = process.env.BACKLOG_SYNC_BASE_SHA;
  if (!baseSha || !/^[0-9a-f]{7,40}$/i.test(baseSha)) {
    fail("BACKLOG_SYNC_BASE_SHA must be the trusted Git commit immediately before this change");
  }
  const baseMarkdown = readGitFile(baseSha, REGISTER_PATH);
  const baseConfigText = readGitFileOptional(baseSha, "plans/backlog-sheet-sync.json");
  const baseConfig = baseConfigText ? JSON.parse(baseConfigText) : config;
  const base = parseRegister(baseMarkdown, baseConfig, `register at ${baseSha}`, {
    // The first automation commit has no historical metadata file. Its old
    // register titles are still the authoritative base values for three-way
    // comparison, while the new metadata supplies complexity and tab mapping.
    allowMetadataTitleMismatch: !baseConfigText,
  });
  const changes = buildChanges(base, head, live, config);
  await applyChanges(changes, live, config);
}

export { buildBootstrapChanges, buildChanges, parseRegister, sheetRow };

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(`Backlog Sheet sync failed: ${error.message}`);
    process.exitCode = 1;
  });
}
