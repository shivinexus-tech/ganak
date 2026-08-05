#!/usr/bin/env node
// ============================================================================
// validation/parse-check.js — the gate that runs after EVERY structural edit.
//
//   node validation/parse-check.js kundli-app.jsx
//
// Checks (any failure = exit 1, so Claude Code hooks block on it):
//   1. TSX/JSX parses clean               (syntax)
//   2. No duplicate top-level definitions (the recurring failure mode)
//   3. No orphaned references             (used but never defined/imported)
//   4. Browser storage only through the approved adapter
//   5. No internal notes in vrat copy      (research instructions stay in plans)
//   6. cutBlock registration              (every component before `export
//      default` appears in validation/build-engine.js, if that file exists)
//
// Requires: npm i -D typescript
// ============================================================================
'use strict';
const fs = require('fs');
const path = require('path');

let ts;
try { ts = require('typescript'); }
catch { console.error('parse-check: missing dep. Run:  npm i -D typescript'); process.exit(1); }

const target = process.argv[2];
if (!target) { console.error('usage: node validation/parse-check.js <file.jsx>'); process.exit(1); }
if (!fs.existsSync(target)) { console.error(`parse-check: no such file: ${target}`); process.exit(1); }

const src = fs.readFileSync(target, 'utf8');
const sf = ts.createSourceFile(target, src, ts.ScriptTarget.ES2020, true, ts.ScriptKind.TSX);
const failures = [];
const lineOf = node => sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;

// ---------------------------------------------------------------- 1. SYNTAX
{
  const out = ts.transpileModule(src, {
    compilerOptions: { jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2020 },
    reportDiagnostics: true,
    fileName: path.basename(target).replace(/\.jsx?$/, '.tsx'),
  });
  for (const d of out.diagnostics || []) {
    const p = d.file ? d.file.getLineAndCharacterOfPosition(d.start) : { line: -1 };
    failures.push(`SYNTAX  line ${p.line + 1}: ${ts.flattenDiagnosticMessageText(d.messageText, ' ')}`);
  }
}

// --------------------------------------------- collect declarations + refs
const declaredAt = new Map();      // name -> [lines]  (all scopes)
const topLevel = new Map();        // name -> [lines]  (module scope only)
const referenced = new Map();      // name -> [lines]
const componentsBeforeExport = []; // PascalCase fns declared before `export default`

// A component is a PascalCase function whose body actually contains JSX —
// capitalization alone is not enough (PR_time, TOKENS, etc. are not components).
function containsJsx(node) {
  if (!node) return false;
  let found = false;
  (function scan(n) {
    if (found) return;
    if (ts.isJsxElement(n) || ts.isJsxSelfClosingElement(n) || ts.isJsxFragment(n)) { found = true; return; }
    n.forEachChild(scan);
  })(node);
  return found;
}

function addDecl(name, node, isTop) {
  if (!name) return;
  if (!declaredAt.has(name)) declaredAt.set(name, []);
  declaredAt.get(name).push(lineOf(node));
  if (isTop) {
    if (!topLevel.has(name)) topLevel.set(name, []);
    topLevel.get(name).push(lineOf(node));
  }
}
function bindingNames(nameNode, node, isTop) {
  if (!nameNode) return;
  if (ts.isIdentifier(nameNode)) addDecl(nameNode.text, node, isTop);
  else if (ts.isObjectBindingPattern(nameNode) || ts.isArrayBindingPattern(nameNode))
    for (const el of nameNode.elements)
      if (ts.isBindingElement(el)) bindingNames(el.name, node, false);
}

let exportDefaultLine = Infinity;
sf.forEachChild(n => { if (ts.isExportAssignment(n) || (n.modifiers || []).some(m => m.kind === ts.SyntaxKind.DefaultKeyword)) exportDefaultLine = Math.min(exportDefaultLine, lineOf(n)); });

function walk(node, isTop) {
  if ((ts.isTypeAliasDeclaration(node) || ts.isInterfaceDeclaration(node)) && node.name)
    addDecl(node.name.text, node, isTop);
  if (ts.isTypeParameterDeclaration(node) && node.name)
    addDecl(node.name.text, node, false);
  if (ts.isFunctionDeclaration(node) && node.name) {
    addDecl(node.name.text, node, isTop);
    if (isTop && /^[A-Z]/.test(node.name.text) && lineOf(node) < exportDefaultLine && containsJsx(node.body))
      componentsBeforeExport.push(node.name.text);
  }
  if (ts.isClassDeclaration(node) && node.name) addDecl(node.name.text, node, isTop);
  if (ts.isVariableDeclaration(node)) {
    bindingNames(node.name, node, isTop);
    if (isTop && ts.isIdentifier(node.name) && /^[A-Z]/.test(node.name.text)
        && node.initializer && (ts.isArrowFunction(node.initializer) || ts.isFunctionExpression(node.initializer))
        && lineOf(node) < exportDefaultLine && containsJsx(node.initializer.body))
      componentsBeforeExport.push(node.name.text);
  }
  if (ts.isParameter(node)) bindingNames(node.name, node, false);
  if (ts.isImportSpecifier(node) || ts.isImportClause(node) || ts.isNamespaceImport(node))
    if (node.name) addDecl(node.name.text, node, false);
  if (ts.isCatchClause(node) && node.variableDeclaration) bindingNames(node.variableDeclaration.name, node, false);

  if (ts.isIdentifier(node)) {
    const p = node.parent;
    let typeParent = p;
    let isTypeOnly = false;
    while (typeParent && typeParent !== sf) {
      if (ts.isTypeNode(typeParent)) { isTypeOnly = true; break; }
      typeParent = typeParent.parent;
    }
    const isPropName    = p && ts.isPropertyAccessExpression(p) && p.name === node;
    const isImportProp  = p && ts.isImportSpecifier(p) && p.propertyName === node;
    const isObjKey      = p && (ts.isPropertyAssignment(p) || ts.isPropertySignature(p)) && p.name === node;
    const isDeclName    = p && (ts.isFunctionDeclaration(p) || ts.isClassDeclaration(p) || ts.isVariableDeclaration(p)
                              || ts.isParameter(p) || ts.isBindingElement(p) || ts.isImportSpecifier(p)
                              || ts.isImportClause(p) || ts.isNamespaceImport(p) || ts.isMethodDeclaration(p)) && p.name === node;
    const isJsxAttr     = p && ts.isJsxAttribute(p) && p.name === node;
    const isMetaName    = p && ts.isMetaProperty(p) && p.name === node;
    const isIntrinsic   = p && (ts.isJsxOpeningElement(p) || ts.isJsxSelfClosingElement(p) || ts.isJsxClosingElement(p))
                            && p.tagName === node && /^[a-z]/.test(node.text);
    if (!isPropName && !isImportProp && !isTypeOnly && !isObjKey && !isDeclName && !isJsxAttr && !isMetaName && !isIntrinsic) {
      if (!referenced.has(node.text)) referenced.set(node.text, []);
      referenced.get(node.text).push(lineOf(node));
    }
  }
  // isTop must survive VariableStatement → VariableDeclarationList → VariableDeclaration
  const keepTop = isTop && (ts.isVariableStatement(node) || ts.isVariableDeclarationList(node));
  node.forEachChild(c => walk(c, keepTop));
}
sf.forEachChild(n => walk(n, true));

// ------------------------------------------------- 2. DUPLICATE DEFINITIONS
for (const [name, lines] of topLevel)
  if (lines.length > 1)
    failures.push(`DUPLICATE  '${name}' defined ${lines.length}x at top level (lines ${[...new Set(lines)].join(', ')})`);

// ------------------------------------------------------ 3. ORPHANED REFS
const GLOBALS = new Set(['console','window','document','navigator','Math','Date','JSON','Object','Array','String',
'Number','Boolean','Set','Map','WeakMap','WeakSet','Symbol','Promise','RegExp','Error','TypeError','Intl','BigInt',
'parseInt','parseFloat','isNaN','isFinite','encodeURIComponent','decodeURIComponent','setTimeout','clearTimeout',
'setInterval','clearInterval','requestAnimationFrame','cancelAnimationFrame','fetch','structuredClone','queueMicrotask',
'undefined','NaN','Infinity','globalThis','module','require','process','exports','__dirname','arguments',
'Blob','URL','btoa','atob','URLSearchParams','history','location','SpeechSynthesisUtterance',
'React','ReactDOM','useState','useEffect','useMemo','useCallback','useRef','useReducer','useContext','Fragment','Suspense']);
for (const [name, lines] of referenced) {
  if (declaredAt.has(name) || GLOBALS.has(name)) continue;
  failures.push(`ORPHAN  '${name}' referenced at line ${lines[0]} but never defined or imported`);
}

// ------------------------------------------ 4. APPROVED STORAGE ADAPTER ONLY
// The owner approved two auditable on-device stores. Direct browser-storage calls
// anywhere else remain a release blocker. Scan all source files so running this
// gate against the shell cannot miss a violation hidden in a feature module.
{
  const adapter = path.normalize('src/storage/approved-storage.ts');
  const root = process.cwd();
  const sourceRoot = path.join(root, 'src');
  const scan = (dir) => {
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) return scan(full);
      return /\.(?:js|jsx|ts|tsx)$/.test(entry.name) ? [full] : [];
    });
  };
  for (const file of scan(sourceRoot)) {
    const rel = path.normalize(path.relative(root, file));
    const body = fs.readFileSync(file, 'utf8');
    body.split('\n').forEach((ln, i) => {
      const code = ln.replace(/\/\/.*$/, '').replace(/\/\*.*?\*\//g, '');
      if (!/\b(localStorage|sessionStorage)\b/.test(code)) return;
      if (rel !== adapter) {
        failures.push(`STORAGE  ${rel}:${i + 1}: use ${adapter}; direct browser storage is banned`);
      } else if (/\bsessionStorage\b/.test(code)) {
        failures.push(`STORAGE  ${rel}:${i + 1}: the approved adapter may use localStorage only`);
      }
    });
  }
}

// ---------------------------------------- 5. NO INTERNAL NOTES IN VRAT COPY
{
  // Locate the displayed vrat-copy block. The end sentinel only exists while the
  // data lives inside kundli-app.tsx; once extracted to src/data/vrat-vidhis.ts
  // the module IS the copy, so scan to EOF. (Requiring both sentinels silently
  // disabled this gate the moment the data was split out — don't reintroduce that.)
  // Match the DEFINITION only ("const"/"export const"), never a bare import of the
  // name — otherwise this scans the whole app file and false-positives on app code.
  const start = src.indexOf('const VRAT_VIDHI_SAFETY');
  if (start >= 0) {
    const endSentinel = src.indexOf('/* upcoming-occurrence search', start);
    const copy = endSentinel > start ? src.slice(start, endSentinel) : src.slice(start);
    const forbidden = [
      { re: /\bGanak\b/i, label: 'product/editorial instruction' },
      { re: /\b(?:the\s+)?app(?:\x27s)?\b/i, label: 'app/editorial instruction' },
      { re: /\bSafe app copy\b/i, label: 'copywriting instruction' },
      { re: /\bSources reviewed\b/i, label: 'research note' },
      { re: /\bdo not ship\b/i, label: 'release instruction' },
      { re: /\bas calculated\b/i, label: 'unresolved calculation placeholder' },
      { re: /गणक|ऐप/, label: 'product/editorial instruction in Hindi' },
      // Copy must address the devotee, never the app's author/reader-as-"user".
      { re: /\bdo not (?:shame|blame|scare)\b/i, label: 'instruction addressed to the writer' },
      { re: /\busers?\b/i, label: 'refers to "users" — copy should address the devotee directly' },
      { re: /उपयोगकर्ता/, label: 'refers to "उपयोगकर्ता" — address the devotee directly' },
    ];
    for (const { re, label } of forbidden) {
      const match = re.exec(copy);
      if (!match) continue;
      const line = src.slice(0, start + match.index).split('\n').length;
      failures.push(`USER_COPY  line ${line}: ${label} leaked into displayed vrat guidance`);
    }
  }
}

// ------------------------------------------------- 6. CUTBLOCK REGISTRATION
const engine = path.join(path.dirname(target), 'validation', 'build-engine.js');
const engineAlt = path.join(process.cwd(), 'validation', 'build-engine.js');
const enginePath = fs.existsSync(engine) ? engine : fs.existsSync(engineAlt) ? engineAlt : null;
if (enginePath) {
  const eng = fs.readFileSync(enginePath, 'utf8');
  for (const c of [...new Set(componentsBeforeExport)])
    if (!eng.includes(c))
      failures.push(`CUTBLOCK  component '${c}' is defined before \`export default\` but is not registered in ${path.relative(process.cwd(), enginePath)}`);
} else {
  console.log('note: validation/build-engine.js not found — skipping cutBlock check');
}

// ------------------------------------------------------------------ REPORT
if (failures.length) {
  console.error(`\n✗ parse-check FAILED on ${target} (${failures.length} issue${failures.length > 1 ? 's' : ''}):\n`);
  for (const f of failures) console.error('  ' + f);
  console.error('');
  process.exit(1);
}
console.log(`✓ parse-check clean: ${target}  (syntax, no duplicates, no orphans, approved storage adapter only, no internal vrat notes${enginePath ? ', cutBlock registered' : ''})`);
