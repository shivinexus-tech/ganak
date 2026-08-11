# City preference migration contract

**Status:** Product requirement. The local/device and shared-link behaviour is live;
signed-in account sync remains to be built.

This contract must survive every Ganak UI, UX, routing, storage, authentication or
framework migration. A redesigned screen is not accepted if it weakens any rule
below.

## Required user behaviour

1. **Never default a first-time visitor to Delhi.** Before any city-dependent
   Panchang or Jyotish result mounts, ask the visitor to search/select a city or
   explicitly choose **Use device location**.
2. **Location is opt-in.** Do not request browser/device location permission until
   the visitor taps the device-location action. If permission or lookup fails, show
   bilingual guidance and keep manual city selection available.
3. **Remember the deliberate choice locally.** Use only
   `src/storage/approved-storage.ts` → `preferences`; application code must not add
   raw `localStorage`/`sessionStorage` calls or ad-hoc keys.
4. **Also remember it in the signed-in account.** When account support is present,
   sync the non-sensitive home-city preference to that account so it follows the
   user to another browser/device. Keep the approved local copy for fast/offline
   startup. This account-sync portion is not yet implemented and must not be marked
   delivered until authenticated cross-device tests pass.
5. **Always keep city change available.** The existing city search/change control
   remains reachable after onboarding. A deliberate normal city change updates the
   current view and remembered default (local, and account when signed in).
6. **A linked city never silently wins or overwrites the default.** If a URL names
   London while Mumbai is remembered, block city-dependent content and ask:
   - **View London for this link** — use London for this linked view only; keep
     Mumbai remembered.
   - **Use my remembered city: Mumbai** — replace this view/URL with Mumbai; keep
     Mumbai remembered.
7. **Do not ask when there is no real conflict.** A valid link matching the
   remembered city opens normally. Invalid/incomplete place parameters must not
   bypass first-run selection or corrupt a preference.
8. **No silent resets.** Language switches, responsive-layout changes, navigation,
   Back/Forward and visual redesigns must preserve the current city and the saved
   default unless the user deliberately changes or clears preferences.
9. **English and Hindi parity.** Chooser, conflict question, permission/storage
   failures and city controls must follow Ganak's language toggle.

## Account-sync conflict rule

Account sync must be explicit and non-destructive. On sign-in, if an account city
differs from a deliberate local city, ask which city should become the default;
do not silently overwrite either copy. A shared-link city remains a temporary view
choice and must never be uploaded as the account default unless the user later
chooses it through the normal city-change control.

## Migration acceptance tests

- Fresh browser: no Delhi timings render before manual city selection or an
  explicit device-location request.
- Selected city survives reload and a later normal visit on the same device.
- Signed-in city survives sign-out/sign-in and appears on a second device once
  account sync is implemented.
- Remember Mumbai, then open a London URL: the two-choice question appears before
  city-dependent content in both English and Hindi.
- Choose London: current linked view is London; a later normal visit is Mumbai.
- Choose Mumbai: current URL/view becomes Mumbai; saved preference remains Mumbai.
- Normal city search can still deliberately change the remembered city.
- Denied location, failed lookup and failed persistence each show visible bilingual
  recovery guidance.
- Keyboard focus stays trapped in either blocking dialog; phone widths have no
  horizontal overflow; screen-reader names state both cities and each choice.

## Existing permanent proof

- `validation/first-run-place.cjs`
- `validation/link-city-choice.cjs`
- `src/components/FirstRunPlaceDialog.tsx`
- `src/components/LinkCityChoiceDialog.tsx`
- `src/accessibility/AccessibilityRoot.tsx`
- `src/storage/approved-storage.ts`

Any migration that replaces these files must recreate equivalent permanent gates
before deleting them. Grep old names afterward; zero orphaned references is the
standard.
