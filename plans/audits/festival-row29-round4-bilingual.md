# Festival row #29 — Round 4 bilingual/devotional verification

Date: 2026-07-28

Auditor: Codex bilingual verification lane

Base: integrated `main` at `904ec04`

Scope: report only; no application or validation edits

## Verdict

**Not ready to close Round 4.** All five focused automated gates pass and the
route-content registry has exact 108-route coverage. Manual sampling across every
mapped hero family found one systematic P0 semantic-parity defect: the English
practice is variant-specific for the 24 Ekadashis and seven weekday Pradoshas, but
the Hindi practice is a generated family template whose only route-level change is
the observance name.

This means the Hindi reader does not receive the same actionable distinction as the
English reader. The current gate accepts this because the differing identity makes
each generated Hindi string technically unique.

## Automated evidence

Commands were run independently on the integrated base:

```text
$ node validation/hindi-devotional-language.cjs
HINDI DEVOTIONAL LANGUAGE PASSED (59 source files; 57 merged guides checked)

$ node validation/hindi-worship-glossary.cjs
HINDI WORSHIP GLOSSARY PASSED (7 core terms; 6 UI labels)

$ node validation/devotional-voice-english.cjs
DEVOTIONAL VOICE ENGLISH PASSED (9 patterns checked)

$ node validation/devotional-guide-quality.cjs
DEVOTIONAL GUIDE QUALITY PASSED (57 dynamically discovered bilingual guides; 7 named-route semantic profiles; failure fixtures proven)

$ node validation/festival-route-content.cjs
FESTIVAL ROUTE CONTENT PASSED (77 full routes + 24 Ekadashi + 7 Pradosh; 57 hero families; failure fixtures proven)
```

Independent structural inspection confirmed:

- 108 exact overlay records: 77 `full` and 31 `named-variant`.
- Every record has EN/HI identity, meaning, practice, completion, timing note and
  source boundary.
- No duplicate EN or HI meaning or practice strings exist byte-for-byte.
- All records resolve to an existing devotional/hero family.
- The repeated completion/timing/source-boundary text is family-level scaffolding,
  which is allowed; the requirement that matters here is distinct route-level
  identity and observance action in both languages.

## Manual sample across every mapped route family

At least one route was read in both languages from each of the 17 hero families
actually used by the 108 records.

| Hero family | Routes | Sample read | Result |
|---|---:|---|---|
| `diwali` | 8 | `pongal` | Pass — harvest action and safe cattle boundary survive in HI |
| `ekadashi` | 25 | `narasimhaJayanti`, `Chaitra_Shukla_11`, `Jyeshtha_Shukla_11`, `Margshirsh_Shukla_11` | **Fail for the 24 named Ekadashis** — see P0 finding |
| `ganeshChaturthi` | 3 | `anantChaturdashi` | Pass — Anant and visarjan paths remain distinct |
| `gudiPadwa` | 1 | `vishu` | Pass — Vishukkani dawn action survives in HI |
| `guruPurnima` | 4 | `vishwakarmaPuja` | Pass — machine/tool safety boundary survives |
| `hanumanJ` | 1 | `parashuramaJayanti` | Pass — prayer plus anti-violence boundary survives |
| `janmashtami` | 3 | `radhaAshtami` | Pass — Radha-Krishna offering is specific |
| `mahaShivaratri` | 3 | `kalabhairavJayanti` | Pass — Bhairava identity and temple boundary survive |
| `makarSankranti` | 12 | `rathaSaptami`, `meshaSankranti` | Pass — sunrise versus ingress/punya timing remains distinct |
| `masikDurgashtami` | 17 | `kaliJayanti` | Pass — Kali offering and initiated-mantra boundary survive |
| `pradosh` | 8 | `shaniJayanti`, Sunday, Monday and Saturday variants | **Fail for seven weekday variants** — see P0 finding |
| `purnima` | 6 | `pitruPakshaBegins` | Pass — ancestor remembrance and priest-led boundary survive |
| `rakshaBandhan` | 2 | `nagPanchami` | Pass — symbolic milk and wildlife safety survive |
| `ramNavami` | 3 | `vivahPanchami` | Pass — Rama-Sita wedding episode remains specific |
| `sharadNavratri` | 4 | `chaitraGhatasthapana` | Pass — local kalasha window and Chaitra vow survive |
| `skandaShashti` | 3 | `vaikasiVisakam` | Pass — Murugan/Tamil hymn/abhishekam action survives |
| `varalakshmi` | 5 | `tulasiVivah` | Pass — Tulasi-Shaligram marriage sequence survives |

## Blocking finding

### P0 — named-variant Hindi practice loses route-specific action

Scope: 24 named Ekadashi records and seven weekday Pradosh records.

Examples:

- **Nirjala Ekadashi EN** tells the reader to hear Bhima's katha, keep nirjala only
  when medically safe, and choose a supported alternative otherwise.
- **Nirjala Ekadashi HI** says only to hear the named katha, worship Vishnu and keep
  a selected grain-free fast. It omits the defining waterless practice and its
  essential health accommodation.
- **Mokshada Ekadashi EN** tells the reader to hear the Mokshada katha, read a Gita
  chapter and keep ancestor rites within family guidance.
- **Mokshada Ekadashi HI** falls back to the same named-katha/Vishnu/grain-free
  template and omits both Gita reading and the ancestor boundary.
- **Som Pradosh EN** names Shiva-Parvati worship and explicitly rejects marriage or
  emotional-cure promises.
- **Som Pradosh HI** uses the same water/bilva/lamp sentence as every weekday,
  changing only “सोम प्रदोष”; the Monday-specific devotional boundary disappears.
- **Shani Pradosh EN** adds service or charity and rejects fear-based Saturn
  remedies. Its Hindi practice again contains only the shared water/bilva/lamp
  template.

Required repair:

1. Write a route-specific Hindi practice for each of the 24 Ekadashis, preserving
   the distinctive English katha/action and every safety or source boundary.
2. Write a weekday-specific Hindi practice for each of the seven Pradoshas,
   preserving the English devotional action and non-guarantee boundary.
3. Strengthen `festival-route-content.cjs` with semantic fixtures that prove the
   defining action survives in **both** languages. String uniqueness is not enough;
   inserting the route name into one common template must fail.

## Negative-fixture review

The current route-content gate correctly proves rejection of:

- one missing route (`pongal`);
- generic English meaning (`tulasiVivah`);
- product-meta in devotional content (`kaliPuja`);
- English prose in a Hindi field (`kaliPuja`);
- duplicate bilingual identity (`onam`/`vishu`).

These fixtures are useful and passed. They do not exercise loss of semantic parity
between an English action and a templated Hindi action, which is the gap exposed in
this round.

## Round 4 close condition

Round 4 may be marked green only after the 31 Hindi named-variant practice fields
are route-specific, a negative fixture rejects name-only template variation, and
the five focused gates above rerun cleanly. No other blocking bilingual or
devotional defect was found in the sampled full-route families.
