# Ganak Website Design Feedback Ledger

**Status:** mandatory pre-flight and regression gate for every website Figma lane
**Owner:** Shivie
**Scope:** responsive Ganak website only; Ganak Phone/native parked work is separate

## Purpose

Owner feedback is a design-system input, not a disposable chat correction. A mistake
fixed on one screen must not recur on the next screen because the feedback lived only
in another task. This ledger is the durable bridge between owner comments, parallel
screen lanes, the Design Director and independent QA.

## Feedback classes

Every owner comment is classified before work continues:

| Class | Meaning | Required propagation |
|---|---|---|
| `GLOBAL` | Applies to the whole website | Audit every existing and future website candidate |
| `PATTERN` | Applies to a reusable pattern such as header, hero, grouped list, footer, navigation or forms | Audit every instance of that pattern |
| `SCREEN` | Intentional rule for one screen/state only | Apply only to the named screen and document why it is local |
| `REJECTED DIRECTION` | A visual or structural direction the owner rejected | Archive and prevent reuse as a source |
| `PARKED PHONE` | Useful only for the future Ganak Phone/native track | Exclude from website source and QA paths |

## Required fields

Each recovered or new feedback item must record:

- stable ID (`GDF-001`, `GDF-002`, ...);
- exact owner wording or a faithful short paraphrase;
- source task/comment and Figma node when available;
- class and affected screen families/patterns;
- concrete do/don't rule;
- responsible lane/integrator;
- status: `RECOVERED`, `ACTIVE`, `FIXED — VERIFY`, or `CLOSED`;
- affected existing candidate nodes audited;
- before/after or screenshot evidence;
- independent-QA result.

## Non-negotiable workflow

1. The Design Director reviews every new owner Figma comment or task message and
   adds/updates the ledger before routing the fix.
2. If feedback is `GLOBAL` or `PATTERN`, the Design Director sends the rule to all
   affected lanes immediately; it is not closed after fixing only the reported node.
3. Before editing, each lane lists the ledger IDs applicable to its workbench.
4. Every lane handoff includes a compliance table: applicable ID → proof/node.
5. Independent Design QA audits the candidate against all applicable open and closed
   regression rules. A candidate cannot enter `OWNER REVIEW` without a QA result.
6. A feedback item reaches `CLOSED` only after every affected existing candidate has
   been checked, not merely the first reported screen.
7. Conversation-only feedback is considered at risk until it appears here.

## Recovery pass — 2026-08-19

The Design Director and QA lane must recover earlier owner feedback from:

- `Ganak Design Director — Figma master` task history;
- `Ganak floral Figma — Vrat hero` task history;
- prior Claude/Codex redesign and Figma task histories discoverable in the project;
- Figma comments and named `OWNER REVIEW` / `REJECTED` annotations;
- `plans/ganak-redesign-requirements.md`;
- `plans/ganak-figma-prototype-state.json`;
- the website migration and capability-placement contracts.

Recovery is complete only when the Design Director publishes a deduplicated ledger,
marks uncertainty honestly, and audits the two pilot screens against every applicable
recovered rule.

## Seed rules already established

These are known system rules and must receive stable IDs during recovery:

- Live Ganak is a behavioral/data/state reference, never the redesign's visual source.
- Website and Ganak Phone/native are separate product tracks.
- Approved shared components/variables/styles are inherited, not locally redrawn.
- Ornament is structural and restrained, not pasted flower clusters or crude strips.
- Owner-approved pale-blue/white website baseline remains the source unless an exact
  later approval explicitly supersedes it.
- Rejected or exploration frames never become implementation sources.
- Feedback on a reusable pattern propagates to every instance before closure.

## Recovery evidence and limitations

Recovered on **2026-08-19** from the owner-visible history of:

- `01a017af-6f82-7760-89c6-f54e21c97720` — Ganak Design Director;
- `01a00933-7378-7331-a468-574b8e9cd62c` — Festival/Vrat and floral specialist;
- the earlier website/prototype conversation retained in the current canonical task;
- `plans/ganak-figma-authority.md`, `plans/ganak-redesign-requirements.md`,
  `plans/ganak-website-migration-contract.md`,
  `plans/ganak-site-capability-placement-register.md` and
  `plans/ganak-figma-prototype-state.json`;
- Figma node names and visible reviewer/status text on page `30:2`; and
- the independent read-only QA task `01a018d9-dca3-70b3-a851-b46eccd965cf`.

The available Figma connector does **not** expose Figma comment threads. The recovery
could inspect named annotations and canvas text but cannot honestly claim that every
historical pinned Figma comment was recovered. Any later comment that conflicts with
this ledger must be added as a new decision with its date and must not silently edit
the older rule.

## Canonical recovered feedback

`ACTIVE` means the rule governs new work now. `FIXED — VERIFY` means one reported
instance was repaired but the required cross-screen sweep is incomplete. `CLOSED`
means the prohibited direction is durably recorded; every candidate must still prove
that it did not use it.

### Authority, process and migration safety

| ID | Class / status | Owner feedback and source | Concrete do / don't | Scope / owner |
|---|---|---|---|---|
| `GDF-001` | `GLOBAL` · `ACTIVE` | Live Ganak is useful for capabilities, data, states and journeys, but is visually poor and must not become the redesign's visual/layout source. Owner, Design Director task; Figma authority §7. | Preserve working behavior and fixtures; derive composition only from approved website masters. | All website lanes · integrator |
| `GDF-002` | `GLOBAL` · `ACTIVE` | Use the exact approved website masters. Exploration, historical, rejected and merely `OWNER REVIEW` frames are not implementation authority. Owner after the wrong prototype was reused; prototype state. | Cite approved node lineage before building. Never promote a candidate because it happens to exist in Figma. | All website lanes · integrator |
| `GDF-003` | `GLOBAL` · `ACTIVE` | Ganak Website and Ganak Phone/native are separate product tracks. Owner correction after phone UI was presented as website work. | Website work must not use `518:*`, `1:932`, `1:972`, native bottom navigation or native IA. | All website lanes · integrator |
| `GDF-004` | `PARKED PHONE` · `ACTIVE` | The phone-derived designs are useful later and must be parked, not deleted or called rejected website work. Owner, Design Director task. | Preserve sections `554:7622` and `556:2`; exclude every descendant from website lineage, QA, queue and integration. | Future Ganak Phone only · integrator |
| `GDF-005` | `GLOBAL` · `ACTIVE` | Prove quality on two representative website screens before broad propagation: Today/Panchang and Festival/Vrat. Owner: speed with “absolutely no compromise on quality.” | Require desktop + responsive website 390/320, EN/HI, applicable long/ordinary/special/sparse/error states, honest limitations and owner approval. | All lanes; C/D inventory-only · integrator |
| `GDF-006` | `GLOBAL` · `ACTIVE` | Approved components/variables/styles are inherited, while site-wide changes and intentional per-instance variation must both remain possible. Owner after footer/breadcrumb regressions; authority §§1–2; migration §10.8. | Instantiate approved shared patterns. Do not detach/redraw locally. Put deliberate variants in the shared component API instead of breaking every screen. | Header, context, footer, cards, rows, controls · integrator |
| `GDF-007` | `GLOBAL` · `ACTIVE` | Feedback on a reusable pattern must reach every affected screen; fixing the reported screen alone is not closure. Owner, 2026-08-19. | Every handoff lists applicable GDF IDs and evidence. Independent QA compares the exact approved source and candidate at the same viewport/state and must pass the exact nodes before `OWNER REVIEW`. | All website lanes · integrator + independent QA |
| `GDF-008` | `GLOBAL` · `ACTIVE` | A small requested edit must change only that element. Owner after one Muhurat-icon request changed an entire bottom panel and borders. | Freeze all unrequested geometry, styling and content; show a before/after diff for surgical changes. | All design and implementation work · responsible lane |
| `GDF-009` | `GLOBAL` · `ACTIVE` | Migration must preserve repaired capabilities and journeys rather than reintroducing old Ganak defects. Owner requested a migration contract and feature/journey preservation map. | Use the migration contract and capability-placement register; no repaired Calendar, Muhurat Finder, Hora, guide, calculator or saved-action journey may be orphaned. | All screen families · integrator |
| `GDF-010` | `GLOBAL` · `ACTIVE` | Mock data must be internally coherent and traceable. Owner reported Devshayani paired with Shashthi/Krishna Paksha and rejected an unsupported “Sourced from Drik Panchang” line. | Use one named Ganak engine fixture per screen. Never mix dates, tithi, paksha, month, solar times or observance labels; never invent a source claim. | Every data-bearing screen · lane + engine reviewer |
| `GDF-011` | `GLOBAL` · `ACTIVE` | Every apparent control must perform a mapped real action; deferred capabilities must be absent, not decorative or disabled-looking. Migration contract §§1, 3 and 10. | Record destination/action/state preservation. Do not show fake search, geolocation, reminder, share, retry or language controls. | All interactive patterns · lane + integrator |

### Visual system and accessibility

| ID | Class / status | Owner feedback and source | Concrete do / don't | Scope / owner |
|---|---|---|---|---|
| `GDF-012` | `GLOBAL` · `ACTIVE` | The later owner-approved website baseline is pale blue and clean white with deep navy, crimson/burgundy and controlled luminous gold. Repeated ivory/cream washes, orange gradients, sage drift and dark-jewel screens were rejected. Authority §4; owner 2026-08-11 onward. | Use `#F9FCFD`, `#FFFFFF`, `#ECF4F7` and the approved semantic navy/crimson/gold roles unless an exact later approval supersedes them. Do not reintroduce ivory headers, breadcrumbs, footers or panels. | All website screens · integrator |
| `GDF-013` | `GLOBAL` · `ACTIVE` | Default text must be readable to older users: slightly larger, smooth-edged but sharp, high-contrast and comfortably spaced—not old, cramped or vertically squeezed. Owner testing with older family members. | Meet WCAG-AA, keep body/utility copy readable, and preserve the comfort scale/density architecture. No low-contrast gold/grey body copy. | Typography and every screen · integrator |
| `GDF-014` | `PATTERN` · `ACTIVE` | Responsive website means a true internal reflow, not a scaled desktop screen or a native shell. Owner and independent QA. | Recompose modules; body ≈16px+, utility labels 12–14px+, controls/tap targets ≥42px; stack/wrap without deletion, clipping or microscopic type. | Responsive website 390/320 · lanes + integrator |
| `GDF-015` | `GLOBAL` · `ACTIVE` | Screens need consistent outer margins, section alignment, rhythm and breathing room. Owner repeatedly reported cramped vertical stacks, dimension mismatch, homeless elements and unfinished blank bands. | Use a coherent grid and measured content height. Avoid both crowding and excessive empty regions. | All website screens · lanes |
| `GDF-016` | `GLOBAL` · `ACTIVE` | English and Hindi are complete address-language screens, not mixed-language structure proofs. Full Panchang hierarchy cannot depend on Latin uppercase. Owner; migration §§10.6–10.7. | Translate shell, controls, previous/next, method, health and footer. Use Anek/Mukta or another proven Devanagari font, measured line boxes and weight/rules/tint rather than uppercase alone. | EN/HI variants · lanes + language reviewer |
| `GDF-017` | `GLOBAL` · `ACTIVE` | Reviewer/status/proof prose must never occupy devotee-facing slots. Owner rejected “SPARSE PROOF,” “VISIBLE ERROR,” “displayed without clipping” and similar copy. | Put QA specimens outside the buildable screen. Product empty/error states use only real user-facing copy. | All screens and state proofs · lanes |
| `GDF-018` | `PATTERN` · `ACTIVE` | Auspicious/avoid states need an icon plus a word and must not rely on colour. Abhijit must not receive disproportionate visual pressure. Owner comfort/accessibility brief and later timing feedback. | Balance Abhijit and Rahu; label `GOOD`/`AVOID` (or bilingual equivalents); maintain contrast at every scale. | Timing blocks · A/C/integrator |
| `GDF-019` | `PATTERN` · `ACTIVE` | Ornament is structural and restrained—frame, ribbon, transition, niche, footer or purposeful sprig—not a pasted flower cluster or crude strip. Owner's repeated floral corrections. | Keep ornament subordinate to content and brand; vary its role by pattern instead of pasting the same cluster everywhere. | All botanical/decorative patterns · integrator |
| `GDF-020` | `REJECTED DIRECTION` · `CLOSED` | The wedding invitation is a colour/composition/floral reference, not a website asset. Owner repeatedly rejected cropping it into a banner or framing deity art with the complete card. | Never place/crop the reference image itself in the website, and never treat its full border as a mandatory deity frame. | All website visuals · all lanes |
| `GDF-021` | `PATTERN` · `ACTIVE` | Sacred imagery must be real, relevant and adaptive. Devshayani should show reclining/sleeping Vishnu; ordinary days should not invent a festival hero. Owner visual brief and Option C ordinary-day approval. | Use mapped real deity/festival art; collapse the slot when not relevant; never use a grey placeholder. | Today special, Festival/Vrat · A/B |
| `GDF-022` | `PATTERN` · `ACTIVE` | Icons must form one coherent family with equal optical size, stroke, colour and alignment. Poor icons should be replaced, not simply removed. Owner repeated bottom-panel and general icon feedback. | Audit every set as a family. Editable fields use border/shape/chevron/focus—not an ugly pencil icon. | Navigation, Quick Access, fields, actions · lanes + integrator |
| `GDF-023` | `GLOBAL` · `ACTIVE` | Remove repeated context and information unless it performs a distinct job. Owner cited Tithi/Nakshatra duplication, “Today in New Delhi,” “Upcoming for New Delhi” and Calendar redundancy. | Each block has one job; do not repeat place/date or Panchang values merely to fill space. | All website screens · lanes |

### Shared website patterns

| ID | Class / status | Owner feedback and source | Concrete do / don't | Scope / owner |
|---|---|---|---|---|
| `GDF-024` | `PATTERN` · `ACTIVE` | Brand and primary navigation must dominate the masthead; flowers must not become first fixation or weaken the wordmark. Owner Full Panchang critique. | Keep strong florals in the approved context/footer/hero zones, not inside the wordmark/primary-nav band. Responsive website header sets are EN `588:204` and HI `590:268`; lanes instantiate them rather than redraw the masthead. | Website masthead · integrator |
| `GDF-025` | `PATTERN` · `ACTIVE` | Shared context must preserve Place, Date, Calendar System, Sunrise and Sunset and make the first three visibly editable. Approved Today/context source and owner editability feedback. | Desktop lineage is `206:135` / Hindi `552:2`; responsive website sets are EN `584:116` / HI `587:116`. The shared base owns appearance and five value slots but no sample-specific destination. Each instance binds Place/Date/Calendar controls to its visible `lang`, `city`, `lat`, `lon`, `zone`, `date` and `cal`; display and destination must agree. Reflow must not clip or omit values. | Applicable date-based routes · integrator |
| `GDF-026` | `PATTERN` · `ACTIVE` | Visible Calendar System names are fixed for this prototype. Owner exact naming corrections. | Use: `Amanta lunar — Ganak default`; `Standard International Calendar`; `Hindu Panchang`; `Tamil solar · Thirukanitha`; `Bengali Panjika`. Remove the small supporting text. | Calendar selector · A/B/integrator |
| `GDF-027` | `PATTERN` · `ACTIVE` | Holiday Overlay is a real backlog capability but should not be forced into the already dense shared ribbon. Owner clarification. | Preserve space/state in Calendar or Full Panchang; do not invent a ribbon control before its presentation/behavior is approved. | Calendar / Full Panchang · A/integrator |
| `GDF-028` | `PATTERN` · `ACTIVE` | Quick Access needs one canonical compact, aligned treatment and truthful capability set. Owner rejected green, arbitrary blue variants, clutter and cross-screen colour drift. | Use approved palette and one shared row/grid rhythm; no invented destination and no per-screen recolouring. Responsive website sets are EN `593:174` and HI `594:174`. | Today and applicable hubs · integrator |
| `GDF-029` | `PATTERN` · `ACTIVE` | A decorative floral finish is not the functional footer. Footer must match the pale-blue/white website, feel complete, and allow site-wide destinations plus intentional page options. Owner footer rounds; migration §10.8. | Desktop set is `349:14`; responsive website sets are EN `591:161` / HI `592:161`. Use exactly one approved floral-bottom treatment. Do not duplicate the ribbon, use ivory, or hand-compose unrelated footer styles. | Every website route · integrator |

### Today and Full Panchang

| ID | Class / status | Owner feedback and source | Concrete do / don't | Scope / owner |
|---|---|---|---|---|
| `GDF-030` | `SCREEN` / `PATTERN` · `ACTIVE` | Ordinary Today must preserve the approved `116:49` hierarchy: masthead/context, answer-first card, daily timing, Upcoming Festivals, detailed Panchang, Quick Access, floral finish and website footer. Owner after sparse rebuilds. | Responsive reflow may reorder/stack; it must not delete modules, replace them with a generic shell or leave unfinished whitespace. | Today ordinary · Lane A |
| `GDF-031` | `SCREEN` · `ACTIVE` | Special Today must use one internally consistent observance fixture. “Today in New Delhi” is redundant; owner chose `Today at a glance` and removed “Today” from the blue ribbon. | Hero, Tithi, Paksha, month, Nakshatra, timings and upcoming list must agree. Context carries the place. | Today special · Lane A |
| `GDF-032` | `SCREEN` · `ACTIVE` | Today remains answer-before-data but must show both a useful good window and explicit avoid/do-not-begin semantics, compact Tithi+Paksha/Nakshatra, and a route to Full Panchang. Owner requirements §21; independent QA. | Never drop Rahu/AVOID at narrow widths. Error copy and Retry cannot overlap. | Today responsive states · Lane A |
| `GDF-033` | `SCREEN` · `ACTIVE` | Hora may appear on Today and Full Panchang; clicking it goes to the existing Hora Calculator. Owner clarification. | Reuse the existing engine/route; do not rebuild duplicate Hora logic. | Today / Full Panchang · Lane A |
| `GDF-034` | `SCREEN` · `ACTIVE` | Full Panchang is a distinct deep surface under Today and must say where the user is. Owner blocking critique. | Show `Today › Full Panchang` and a return path; do not leave Today as the only active/location cue. | Full Panchang · Lane A |
| `GDF-035` | `SCREEN` / `PATTERN` · `ACTIVE` | Full Panchang needs a useful continuation/footer; one midnight convention; shared tile rhythm; consistent columns and readable footnotes. Owner Full Panchang critique. | Previous/next day, this month's festivals, other cities, language and legal must be reachable. Explain cross-midnight once in Day Reckoning; unify Choghadiya/Gowri tiles; footnotes ≥12px and 4.5:1. | Full Panchang · Lane A/integrator |
| `GDF-036` | `SCREEN` · `ACTIVE` | Moonset must be corrected and rendered; Godhuli may remain a named P0 backlog item. Owner #63/#64 decision. | Do not omit Moonset or claim migration-ready while an accuracy blocker is open. | Full Panchang · Lane A/engine |

### Festivals, guides and Vrat

| ID | Class / status | Owner feedback and source | Concrete do / don't | Scope / owner |
|---|---|---|---|---|
| `GDF-037` | `SCREEN` / `PATTERN` · `ACTIVE` | Festivals uses A default list, optional B Calendar and returning-user D after explicit follows/preferences; C is excluded. Details adapt by intent: general, story or vrat. Owner approval 2026-08-11. | Keep the full list/calendar reachable; never infer religious preference from passive behavior. | Festivals discovery/detail · Lane B |
| `GDF-038` | `SCREEN` · `ACTIVE` | Festival discovery says `Upcoming this month`, not `Upcoming for New Delhi`; cards should be compact, ordering data-informed, and unexplained “Agenda view” avoided. Owner feedback. | Include fasts and astronomical events such as Pradosh, Shiv Chaturdashi and eclipses through the canonical registry/taxonomy. | Festivals list/calendar · Lane B |
| `GDF-039` | `GLOBAL` / `SCREEN` · `ACTIVE` | One observance may have several meanings. Owner approved multi-tag taxonomy. | Primary type: `vrat`, `festival` or `astronomical event`; additional monthly, regional, deity/tradition and observance-family tags. | Registry, search, Festivals · data + Lane B |
| `GDF-040` | `SCREEN` / `PATTERN` · `FIXED — VERIFY` | Vrat uses the owner-selected bright botanical editorial hero `485:24`: clean white/pale-blue shell, navy, crimson, luminous gold, left/bottom-left sweep and mapped deity at right. Latest owner adjustment reduced the sweep to 92%. | Preserve hero lineage/geometry; no clipping, unrelated layout drift or empty artwork placeholder. | Festival/Vrat pilot · Lane B |
| `GDF-041` | `SCREEN` / `PATTERN` · `ACTIVE` | Guide headline explains the day's meaning; observance name sits in the eyebrow/page title. Practical observance/actions must be readable; Detail 3's vrat hierarchy was preferred. Owner and migration §10.6. | Omit unavailable sections rather than leaving bare `Aarti`/`Udyapan` fragments. Reviewer notes stay outside. | Festival/Vrat guide · Lane B |
| `GDF-042` | `PATTERN` · `ACTIVE` | Follow is preserved on every guide including sparse; Listen, language twin, previous/next, method/source and health note remain usable. Contract §10.6 and owner accessibility work. | Missing art/content collapses cleanly but does not remove Follow. Keep actions separate with usable spacing and prove long names in title, action, previous/next and calendar/list rows. | Festival/Vrat guide · Lane B |
| `GDF-043` | `SCREEN` · `ACTIVE` | Owner preferred `Remind me of this festival`, but the current contract preserves Follow and reminder/calendar infrastructure is not yet available. Design Director resolution 2026-08-19. | Use truthful `Follow festival`. Do not expose or imply a working reminder until backlog #37 is implemented and accepted. | Festival guide · Lane B |
| `GDF-044` | `SCREEN` · `ACTIVE — OWNER CHOICE PENDING` | The special Today page exposes several next actions while the data pack proposed “one deliberate next step.” Owner requested a clear explanation rather than another full-screen lottery. | Build one compact action-hierarchy micro-comparison with a recommendation; do not duplicate or redesign the complete Today screen merely to compare action order. | Today special · Lane A + integrator |

### Muhurat, Calendar and parked native specifics

| ID | Class / status | Owner feedback and source | Concrete do / don't | Scope / owner |
|---|---|---|---|---|
| `GDF-045` | `SCREEN` · `ACTIVE` | Medical timing belongs inside the Muhurat family hierarchy, not as an alien special screen. Owner approved Option B direction and restrained floral corner sprig. | Preserve hierarchy and the restrained sprig; do not revive the ivory header. | Muhurat · Lane C when gate reopens |
| `GDF-046` | `REJECTED DIRECTION` · `ACTIVE` | Owner rejected the Muhurat grouped-list three-colour coral/sage/blue mix, caution-like strong coral, disconnected sage, pale blue for that list and a dull generic light gold. Exact replacement accent remains unresolved. | Preserve structure; do not choose a new accent without a source-based owner review. | Muhurat grouped list · owner + Lane C |
| `GDF-047` | `SCREEN` · `ACTIVE` | Calendar redesign must remove duplication while preserving the already repaired Calendar journey and room for backlog selector work. `Panchang Calendar` and `Full Panchang` are different jobs. Owner migration review. | Do not merge or duplicate them; keep route/state/back behavior intact. | Calendar · Lane A/integrator |
| `GDF-048` | `PARKED PHONE` · `ACTIVE` | Native-specific choices remain available only in the parked app track: five-tab bottom nav, `Prashna`, selected Today/Muhurat/Jyotish icons, native `Panchang`, native Remind Me placement and the native Follow/Listen decision. | Never propagate these decisions to responsive website screens without a new owner decision. | Ganak Phone only · future app lane |

### Prashna and Jyotish preservation rules

| ID | Class / status | Owner feedback and source | Concrete do / don't | Scope / owner |
|---|---|---|---|---|
| `GDF-049` | `SCREEN FAMILY` · `ACTIVE` | Jyotish keeps answer-before-data without capping the depth, precision or range required by serious learners and practising astrologers. Owner audience decision; `AGENTS.md`; redesign requirements. | Put the plain-language conclusion first, then preserve complete professional chart evidence and specialist panels. | Jyotish family · Lane D |
| `GDF-050` | `SCREEN FAMILY` · `ACTIVE` | Jyotish state and calculation conventions must remain explicit and stable. | Preserve North/South/East chart style, Lahiri ayanamsa, mean Rahu/Ketu, explicit place/date/time and no silent reset. | Kundli, Dashas, Matching, tools · Lane D |
| `GDF-051` | `SCREEN FAMILY` · `ACTIVE` | Temporary charts are not retained automatically; saving is explicit and on-device. Deferred accounts/cloud sync/subscriptions must not appear to work. | Saved charts visibly support Rename, Export and Delete; clearing site data removes them; preserve Kundli, Dashas, Matching, Tools and Vault plus every calculator/direct route. | Jyotish/Vault · Lane D |
| `GDF-052` | `SCREEN` · `FIXED — VERIFY` | KP number method `1–249` is deferred until source and engine approval and must not appear in the general Prashna selector. Placement register row 25; Lane C recovery. | Use corrected ask candidate `514:7153`; keep dedicated KP entry absent and re-audit answer/evidence states. | Prashna · Lane C |
| `GDF-053` | `SCREEN` / `PATTERN` · `ACTIVE` | Reminder, save, share and calendar actions remain truthful `OWNER REVIEW` behavior until backlog #37 passes. | Do not promote them as approved or working without recipient/export/calendar behavior, state preservation and privacy acceptance. | Muhurat results and related confirmation states · Lane C |

## Current regression audit — two-screen gate

This matrix records the recovery-time audit. It does **not** approve any candidate.
Global and pattern rules remain open until all affected website families are swept.

| Pilot / exact nodes | Applicable GDF IDs | Audit evidence | Independent QA / current state |
|---|---|---|---|
| Today approved reference `116:49`; comparison clone `562:7804`; desktop candidate `562:8057` | `001–003`, `005–019`, `022–035` | Desktop EN visually matches the approved source; later candidate families do not prove shared-instance inheritance or a canonical engine fixture. | Desktop reference comparison passed visually; pilot remains `CHANGES REQUESTED` because the complete matrix fails. |
| Today earlier failed set `544:7715`, `544:7748`, `544:7781`, `544:7835`, `544:7889`, `544:7942` | `005–017`, `025`, `028–032` | Independent QA found local redraws with zero shared instances, missing narrow Rahu/AVOID, 8.5–11px text, English body in HI, incomplete same-state pairs, no fixture provenance, generic/unfinished composition and a 320-HI error collision. | `CHANGES REQUESTED`; never queue or use as source. |
| Today later responsive set `565:8419`, `565:8489`, `565:8559`, `565:8628` | `005–017`, `025`, `028–032` | Lane A reports ≥12px and collision repair, but still local reauthored shells; Rahu is present without explicit `AVOID` semantics; no same-state EN/HI pairs, special-day proof or generator fixture provenance. | `CHANGES REQUESTED`; exact nodes still require independent re-QA. |
| Festival/Vrat desktop `535:7265`, `535:7344`; approved guide `135:1312`; hero `485:24`; comparison board `555:2` | `001–023`, `025`, `029`, `037–043` | Botanical direction retained and Hindi glyph collision repaired. QA still found English previous/next and method text in HI, empty `Aarti`/`Udyapan` fragments, unproven apparent actions and hero crop needing explicit acceptance. On 2026-08-19 the integrator corrected wrapper `535:7264` and board `555:2` from `OWNER REVIEW` to `CHANGES REQUESTED` without changing design content. | `CHANGES REQUESTED`; status-safety fix passes, content does not; do not queue. |
| Festival/Vrat responsive website `544:8016`, `546:2`, `544:8094`, `546:41` | `001–023`, `025`, `029`, `037–043` | Independent QA found zero shared instances, small utility/nav/footer text, unproven action wiring, and sparse/error proof cards embedded together in the normal guide instead of exclusive external specimens. | `CHANGES REQUESTED`; do not queue. |
| Final Today visual-primary pair `601:9563`, `601:8508`; owner-review clones `652:13737`, `652:13989` | `001–035`, `047–048` as applicable | Responsive shared lineage restored; approved Today modules retained; minimum text 12px; GOOD/AVOID semantics restored; final 390 labels measure 5.47:1; no overlap, overflow, QA-copy leakage or Phone/native lineage. | **Visual-direction + accessibility PASS** by independent QA on 2026-08-19. Eligible for visual-only owner review. **Production interaction FAIL:** unsupported/unimplemented routes and unmapped/Figma-only destinations remain open under `009`, `011`, `025`, `047`. |
| Final Festival/Vrat visual-primary pair `535:7265`, `544:8016`; owner-review clones `652:14035`, `652:14120` | `001–029`, `037–043`, `048` as applicable | Approved `485:24` botanical/deity composition is continuous at 390; shared responsive lineage restored; minimum text 13px/12px; dark-panel heading measures 12.53:1; no overlap, overflow, QA-copy leakage or Phone/native lineage. | **Visual-direction + accessibility PASS** by independent QA on 2026-08-19. Eligible for visual-only owner review. **Production interaction FAIL:** Follow/Listen still use internal prototype outcomes and several shared destinations are not implemented production routes. |
| Parked phone sections `554:7622`, `556:2` and recorded descendants | `003`, `004`, `048` | Names/containment distinguish the future native track. No website candidate may cite them. | Boundary passes; remain `PARKED PHONE`, not website approval/rejection. |
| Lane C `512:4212` and Lane D `512:4213` existing candidates | All applicable GLOBAL/PATTERN IDs; Lane C also `011`, `045–047`; Lane D professional-depth/state/privacy rules from requirements | Both lanes are paused. Lane C corrected KP selector `514:7153`; C9/C10 contain no KP entry. Neither family has complete EN/HI responsive website proof or full GDF sweep. | Inventory-only. No construction, propagation or queue admission until both pilots pass and exact candidates receive independent QA. |

## Open decisions — do not infer

| Decision | Related GDF | Current safe statement |
|---|---|---|
| Festival `Follow` versus `Remind me of this festival` | `GDF-043` | **Resolved for this cycle:** use truthful `Follow festival`; reminder remains deferred until #37 is implemented and accepted. |
| Special Today's one next step versus several actions | `GDF-044` | Lane A supplies a compact action-hierarchy micro-comparison and recommendation; the full screen is not duplicated. |
| Muhurat grouped-list replacement accent | `GDF-046` | **Parked** until Lane C resumes. The restrained sprig and Option B hierarchy are safe; all tested list accent colours named in the rule remain rejected. |

## Mandatory handoff format after recovery

Every lane handoff must now include:

1. exact candidate and approved-source node IDs;
2. applicable GDF IDs listed **before** mutation;
3. a row for every applicable GDF ID with node/screenshot evidence;
4. EN/HI, desktop/390/320 and applicable long/empty/error-state evidence;
5. all apparent-control destinations and engine fixture provenance;
6. known limitations and product decisions still required; and
7. an independent-QA result for those exact nodes;
8. a same-viewport/state source-versus-candidate visual comparison; and
9. raw node links that the owner can open without navigating a worker workbench.

No lane may label a frame, wrapper or comparison board `OWNER REVIEW` while any child
is `CHANGES REQUESTED` or while an applicable GDF item lacks evidence.

The ledger, authority and prototype-state files are the only project records for this
governance. Do not create one-off audit files for failed visual attempts unless the
owner explicitly requests a separate artifact.
