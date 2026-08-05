#!/usr/bin/env node
'use strict';

/* Gate: every path-route the shell can render must be REACHABLE from inside the app.

   Why this gate exists
   --------------------
   Ganak's 66 other gates all verify an artifact in isolation — is the maths right, is the
   copy bilingual, does the route resolve, is there no raw hex. None of them could answer
   "can a user actually get to this page?" So three separate features shipped to production
   as orphans: /calculators (12 calculators), /muhurat/medical, and /muhurat/personal. Each
   passed every gate, deployed green, and was unreachable unless someone was handed the URL.
   The backlog had already diagnosed this class in prose three times — "a permanent URL is
   not complete merely because it resolves", "route existence is not enough for closure",
   and an open bug about calendar rows being navigation dead-ends — but prose cannot fail a
   build. This gate is that prose, made mechanical.
   Root cause: plans/ganak-gate-decay-rootcause.md § "the product between the files".

   What it checks
   --------------
   Routes are DISCOVERED, not hardcoded: any `<name>FromPath(...)` the shell calls is
   picked up automatically, so a new route added tomorrow is covered without editing this
   file. That is the whole point — it must not depend on anyone remembering.

   A route is reachable when another part of the app links to it, either:
     (a) DIRECTLY  — a literal href/anchor to the path in some other file, or
     (b) VIA A BUILDER — a function that returns the path (e.g. festivalPathForKey returns
         `/festival/${key}`) which some other file calls in a navigational context.

   A route's own screen linking to itself does NOT count: a page that links to its own
   catalogue still leaves the user unable to get IN. Self-links are excluded deliberately.

   This gate does not check that a link is *prominent* or well-placed — only that a path
   from elsewhere in the app exists. Discoverability is a design question for a human. */

const fs = require('fs');
const path = require('path');

const SHELL = 'src/kundli-app.tsx';
// Files that describe or resolve routes rather than navigate to them. A mention here is
// never evidence that a user can reach the page.
const NON_NAVIGATIONAL = new Set(['src/metadata/route-metadata.ts']);

let failures = 0;
const fail = (m) => { failures++; console.error('FAIL ' + m); };

/* ---------- collect every source file ---------- */
function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(ts|tsx)$/.test(e.name)) out.push(p);
  }
  return out;
}
const FILES = walk('src');
const SRC = Object.fromEntries(FILES.map((f) => [f, fs.readFileSync(f, 'utf8')]));

const shell = SRC[SHELL];
if (!shell) { console.error(`FAIL cannot read ${SHELL}`); process.exit(1); }

/* ---------- 1. discover the routes the shell renders ---------- */
// e.g.  const medicalRoute = medicalMuhuratFromPath(window.location.pathname)
const matcherCalls = [...shell.matchAll(/const\s+(\w+)\s*=\s*(\w*FromPath)\s*\(/g)]
  .map((m) => ({ varName: m[1], matcher: m[2] }));

if (matcherCalls.length === 0) fail('no *FromPath route matchers found in the shell — has the routing pattern changed?');

/* resolve which module exports each matcher */
function moduleOf(matcher) {
  const re = new RegExp(`import[^;]*\\b${matcher}\\b[^;]*from\\s*["']([^"']+)["']`);
  const m = shell.match(re);
  if (!m) return null;
  let rel = m[1].replace(/^\.\//, 'src/').replace(/^src\/src\//, 'src/');
  for (const ext of ['.ts', '.tsx', '/index.ts']) {
    if (SRC[rel + ext]) return rel + ext;
  }
  return SRC[rel] ? rel : null;
}

/* which component the shell renders for this route variable */
function screenOf(varName) {
  const re = new RegExp(`\\{\\s*${varName}\\s*&&\\s*<(\\w+)`);
  const m = shell.match(re);
  if (!m) return null;
  const comp = m[1];
  const im = shell.match(new RegExp(`import\\s+${comp}[^;]*from\\s*["']([^"']+)["']`));
  if (!im) return null;
  const rel = im[1].replace(/^\.\//, 'src/');
  for (const ext of ['.tsx', '.ts']) if (SRC[rel + ext]) return rel + ext;
  return null;
}

/* ---------- 2. extract the literal path(s) each matcher recognises ---------- */
function literalPaths(file) {
  const out = new Set();
  for (const m of SRC[file].matchAll(/["'`](\/[a-z0-9][a-z0-9\-/]*)["'`]/gi)) {
    const p = m[1].replace(/\/$/, '');
    if (p && p !== '/') out.add(p);
  }
  return [...out];
}

/* resolve a relative import from `file` to a real src path */
function resolveImport(file, spec) {
  if (!spec.startsWith('.')) return null;
  const base = path.normalize(path.join(path.dirname(file), spec));
  for (const ext of ['.ts', '.tsx', '/index.ts', '']) if (SRC[base + ext]) return base + ext;
  return null;
}

/* A matcher may not hold the literals itself — festivalGuideFromPath delegates to a route
   TABLE imported from a data module. So if the matcher's own file has no path literal,
   look one hop into the modules it imports. */
function pathsFor(file) {
  const own = literalPaths(file);
  if (own.length) return own;
  const out = new Set();
  for (const m of SRC[file].matchAll(/from\s*["']([^"']+)["']/g)) {
    const dep = resolveImport(file, m[1]);
    if (dep) for (const p of literalPaths(dep)) out.add(p);
  }
  return [...out];
}

/* Longest common prefix of a route family, trimmed to a path boundary. */
function commonPrefix(paths) {
  if (paths.length === 1) return paths[0];
  let p = paths[0];
  for (const q of paths.slice(1)) {
    let i = 0;
    while (i < p.length && i < q.length && p[i] === q[i]) i++;
    p = p.slice(0, i);
  }
  const cut = p.lastIndexOf('/');
  return cut > 0 ? p.slice(0, cut + 1) : p || '/';
}

/* ---------- 3. find path-builder functions anywhere in src ---------- */
// a function whose body returns a template/literal starting with the route prefix
function buildersFor(prefix) {
  const names = new Set();
  for (const [file, text] of Object.entries(SRC)) {
    const re = new RegExp(`(?:function\\s+(\\w+)|const\\s+(\\w+)\\s*=)[^]{0,400}?\`${prefix.replace(/[/]/g, '\\/')}`, 'g');
    for (const m of text.matchAll(re)) names.add({ name: m[1] || m[2], file });
  }
  return [...names];
}

const NAV = /href|to=|pushState|replaceState|location\.(assign|href)|window\.open/;

/* ---------- 4. judge each route ---------- */
const report = [];
for (const { varName, matcher } of matcherCalls) {
  const mod = moduleOf(matcher);
  if (!mod) { fail(`could not resolve the module exporting ${matcher}`); continue; }
  const screen = screenOf(varName);
  // the route's own implementation — self-links from here do not make it reachable
  const own = new Set([mod, screen].filter(Boolean));

  const candidates = pathsFor(mod);
  if (candidates.length === 0) { fail(`${matcher}: no literal path found in ${mod}`); continue; }
  // The front door of the family. A parameterised family (/festival/holi, /festival/diwali…)
  // shares a common prefix — /festival/ — which is what a builder produces and what we must
  // test for reachability. A single-page route is its own prefix.
  const entry = commonPrefix(candidates);

  let reachedBy = null;

  /* (a) a direct navigational link to the path from elsewhere.
     The shell is NOT excluded here: it holds the global nav and footer, which is exactly
     where a site-wide link belongs. Its route-matching lines can't false-positive because
     every match must also carry a navigational attribute (href/pushState/...), and
     `fooFromPath(window.location.pathname)` carries none. */
  for (const [file, text] of Object.entries(SRC)) {
    if (own.has(file) || NON_NAVIGATIONAL.has(file)) continue;
    for (const line of text.split('\n')) {
      if (line.includes(entry) && NAV.test(line)) { reachedBy = `direct link in ${file}`; break; }
    }
    if (reachedBy) break;
  }

  // (b) a builder that returns this path, called navigationally from elsewhere
  if (!reachedBy) {
    for (const b of buildersFor(entry)) {
      for (const [file, text] of Object.entries(SRC)) {
        if (own.has(file) || file === b.file || NON_NAVIGATIONAL.has(file)) continue;
        if (!text.includes(b.name)) continue;
        // used somewhere, and this file navigates
        if (NAV.test(text)) { reachedBy = `${b.name}() from ${file}`; break; }
      }
      if (reachedBy) break;
    }
  }

  report.push({ entry, matcher, screen: screen || mod, reachedBy });
  if (!reachedBy) {
    fail(`ORPHAN ROUTE ${entry} — rendered by ${screen || mod} but nothing in the app links to it. `
      + `A user can only reach it by being handed the URL. Add a navigational link, or remove the route.`);
  }
}

/* ---------- report ---------- */
console.log('route                     reachable via');
for (const r of report.sort((a, b) => a.entry.localeCompare(b.entry))) {
  console.log(`${r.entry.padEnd(25)} ${r.reachedBy || '— NOTHING (orphan)'}`);
}
console.log('');

if (failures) {
  console.error(`✗ route-reachability FAILED (${failures})`);
  process.exit(1);
}
console.log(`✓ route-reachability PASSED (${report.length} routes, all reachable from inside the app)`);
