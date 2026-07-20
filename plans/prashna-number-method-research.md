# Ganak — Prashna number-method research brief

Status: **before-live research; owner confirmation required before implementation**

Task: `P0-PRASHNA-249-RESEARCH`

Created: 2026-07-20

## Owner's request

The current Prashna chart needs substantial improvement. Investigate the suggestion
that the user supplies any number within a prescribed range and Ganak predicts from
the selected number. Bring the verified method and proposed inputs back to the owner
before building it.

## Initial research conclusion

The established method matching this suggestion is **KP Horary Number Prashna**, using
a number from **1 to 249**. It is not a numerology score and the number alone is not the
prediction. Each number maps to a defined zodiac subdivision and establishes the
Prashna ascendant/sensitive point. The sincere question, chosen number, moment and
place of judgment remain inputs. Judgment then uses relevant houses, cuspal sub-lords,
significators and ruling planets.

Ganak already has a time-based Prashna screen with KP-style Placidus cusps and
sub-lords. The number method should therefore be offered as a separately named mode,
not silently mixed into or substituted for the current answer.

This is also distinct from **Prashnavali**, where a selected number retrieves a verse
or textual answer. The two must not share names or explanatory copy.

## Proposed user inputs for owner review

1. **Method choice:** “Ask from this moment” or “Choose a KP number (1–249).”
2. **One clear question:** retain structured life-area chips; research whether a
   short optional question sentence is needed for correct house selection.
3. **KP number:** manually enter 1–249 after focusing on the question. Explain that it
   is not a lucky number and that the first sincere number should be retained.
4. **Place of judgment:** use Ganak's normal place selector and show the confirmed city.
5. **Moment:** capture visibly only when the user deliberately presses the answer
   button; do not reset or recast without user action.

## Research questions that must be resolved

- Exact canonical 1–249 boundary table, including sign-boundary splits and whether
  the number selects a boundary, midpoint or another defined sensitive degree.
- KP ayanamsa versus Ganak's standing Lahiri convention. Do not label a mixed method
  “KP” without resolving and disclosing this difference.
- Required house system and high-latitude fallback.
- Whether the relevant place is the querent's location, the astrologer's judgment
  location, or—because Ganak is self-service—the user's confirmed current location.
- Complete house groups and denial/promise rules for every supported question chip.
- Ruling-planet validation, Moon/relevance checks, significator hierarchy and event
  timing. Ganak must not reduce the method to a simplistic number-to-yes/no lookup.
- Rules for repeated questions, changed numbers and unsuitable/vague questions.
- Bilingual answer-first copy that explains what the number changed and why the
  verdict followed, before showing the technical chart.
- Published examples and boundary anchors sufficient for a permanent calculation
  gate; prove that the gate fails if the 249 mapping is altered.

## Required owner checkpoint

Before code is changed, show the owner:

- a phone-first input mock-up in Hindi and English;
- the exact inputs and what Ganak does with each one;
- one favourable, one unfavourable and one mixed worked example;
- the proposed relationship between the existing time-based mode and KP-number mode;
- the ayanamsa/house-system recommendation and evidence;
- user-facing guidance for sincere, single-question use and repeat attempts.

## Initial sources

- KP 1–249 degree/sub table: https://kpastrology.com/Dasha%20Degrees%20table%201-249.pdf
- KP horary casting workflow and input distinctions:
  https://kpastroapp.com/learn/how-to-cast-a-horary-chart

These establish the feature family and starting workflow. Implementation still needs
primary-text/expert verification and published worked-chart anchors; the two web pages
alone are not sufficient authority for Ganak's final calculation engine.
