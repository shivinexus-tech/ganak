# Ganak backlog → Google Sheet automation

## Outcome

Agents update the repository files. GitHub Actions publishes commit-changed cells to
**Ganak — Open Backlog Acceptance Register** after a push to `main`. Claude Code,
Cursor, Codex and future agents do not need personal Google access.

Repository sources:

- `plans/backlog-acceptance-register.md` — status, time, dependencies, acceptance
  criteria and closure evidence.
- `plans/backlog-sheet-sync.json` — spreadsheet/tab identity plus the technical
  complexity and exact title/section for every numbered item; quality-column
  defaults and evidence-backed overrides.

Every live backlog row has nine quality-visibility columns after the existing ten:

1. **Delivery state** — distinguishes delivered, in progress, not started, launch
   baseline/ongoing, and built locally but not publicly delivered.
2. **Limitations / pending work** — never hide a known constraint behind “Done.”
3. **Short-term impact** — what the limitation means for users or operations now.
4. **Long-term impact** — scaling, reliability, maintenance or dependency cost if
   it remains unresolved.
5. **Bug-bash status / evidence** — `Not completed`, `In progress`, or `Completed`
   with a task-log/run reference. Normal gates and an implementer's smoke check do
   not silently count as a distinct bug bash.
6. **Quality risk (RAG)** — Red, Amber or Green. Red means a high-impact release has
   an unresolved quality limitation; Amber means open/incomplete; Green means no
   currently recorded delivery limitation.
7. **Last verified · environment** — exposes local-only claims and stale or missing
   production verification.
8. **Source confidence** — primary/textual, institutional, regional/lineage-variable,
   insufficiently verified/not classified, or not applicable for technical work.
9. **Recommendation / action items** — the concrete next action needed to clear a
   Red or limitation-bearing row. Amber rows name the dependency/closure step;
   Green rows state that no corrective work is currently required.

Bug bash is an optional added quality check for ordinary items. It is mandatory for
items explicitly classified as high impact because they affect several journeys or
carry safety, privacy, legal, financial, religious-trust or platform-wide risk. A
delivered high-impact item without completed bug-bash evidence remains visibly Red
and “Delivered with quality limitation”; its percentage is not silently rewritten.
When a row has a non-default delivery condition, limitation, impact, risk,
verification, source-confidence, recommendation or bug-bash result, add/update its full entry in
`qualityOverrides` rather than relying on a generic derived value.

The live **Quality Dashboard** tab automatically stacks all six backlog tabs and
shows counts plus filterable lists for delivered-with-limitations, publicly
unavailable features, Red/high-impact limitations, missing bug bashes, items without
production verification and owner-decision blockers. Hidden helper columns contain
only formulas pointing at the source tabs; the repository remains the source of
truth for row values.

Publisher:

- `.github/workflows/sync-backlog-sheet.yml`
- `scripts/sync-backlog-sheet.mjs`

The publisher is deliberately incremental. It compares the pushed commit with its
trusted Git base and updates only cells changed in Git. If the same live cell was
changed independently, it fails with a three-way conflict instead of overwriting
either version. Deletes and cross-tab moves also fail for explicit review.

An explicitly reviewed failed batch can be replayed with the manual workflow's
`base_sha` input. This is a recovery control, not a full-sheet overwrite: the same
three-way conflict checks still apply to every changed cell.

The manual workflow also has `bootstrap-plan` and `bootstrap-apply` operations for
the one-time initial baseline only. Plan lists every stale cell without writing;
apply aligns those listed cells to the reviewed repository register. It refuses
unknown IDs, missing rows and tab moves. Routine agent runs must use the default
incremental operation, which retains three-way conflict protection.

## Google/GitHub connection

The automation uses **Workload Identity Federation**. GitHub stores no Google
private key: a workflow running from Ganak's exact numeric repository ID and
`main` branch may exchange its GitHub OIDC identity for a short-lived Google token.

Configured resources:

- Google project: `ganak-automation` (`59361883151`)
- Service account: `api-service-details@ganak-automation.iam.gserviceaccount.com`
- Workload identity pool: `ganak-github`
- OIDC provider: `ganak-main`
- Trusted GitHub repository ID: `1304481875`
- Trusted ref: `refs/heads/main`

The service account has no Google Cloud project role. It is shared as Editor only
on the [Ganak acceptance register](https://docs.google.com/spreadsheets/d/1ZNHtQqfLJ2smeG5QLbO46wBKYetqYuGHW0AQyGOtRSk/edit).
Its IAM policy grants `roles/iam.workloadIdentityUser` only to the repository-ID
attribute in the dedicated pool; the provider condition additionally requires
`main`. The workflow requests only the Google Sheets OAuth scope.

No `GOOGLE_SHEETS_CREDENTIALS` GitHub secret is required. The temporary JSON key
created during setup must be revoked in Google Cloud and deleted from the Mac after
the first green workflow run.

## Agent closeout procedure

1. Edit only the assigned row in `plans/backlog-acceptance-register.md`.
2. For a new item, renamed item, section move, complexity change, delivered-with-
   limitations state, changed impact/risk, verification evidence, source confidence,
   or bug-bash result, also update
   `plans/backlog-sheet-sync.json`.
3. Run:

   ```bash
   node scripts/sync-backlog-sheet.mjs --check
   ```

4. Commit and push the completed slice to `main` under the standing Git policy.
5. Confirm **Sync backlog acceptance register** is green. A failed or missing sync
   is a named closeout blocker; the task must not be presented as fully closed.

Do not paste Google credentials into prompts, task logs, commits, `.env` files or
agent settings. Do not manually repair a conflict by forcing a full-sheet rewrite;
compare the named Git base/head/live values printed by the failed action and decide
which value is current.

## Local validation and troubleshooting

`--check` requires no network or credentials. It verifies all 57 IDs, exact titles,
sections, ordering and technical-complexity values.

The GitHub publisher verifies the spreadsheet title, all six tab names and the
full 19-column header before writing. It safely upgrades the previous 18-column
header by adding the recommendation/action column. Common failures are intentionally explicit:

- **OIDC permission denied** — verify the pool/provider condition, repository ID,
  `main` ref and the service account's Workload Identity User binding.
- **403 from Google Sheets** — share the Sheet with the service-account
  `client_email` as Editor and confirm the Sheets API is enabled.
- **Three-way conflict** — the same cell changed both in Git and directly in the
  Sheet; reconcile that one row rather than overwriting the full register.
- **Title/ID/section mismatch** — update the Markdown row and sync metadata together.

Official references:

- [GitHub Actions secrets](https://docs.github.com/en/actions/reference/security/secrets)
- [`google-github-actions/auth`](https://github.com/google-github-actions/auth)
- [Google Sheets API](https://developers.google.com/workspace/sheets/api/)
