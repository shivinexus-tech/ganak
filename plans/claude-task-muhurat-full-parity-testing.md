# Claude Code Task — Second Bug Bash for Muhurat Rows 16/17

Status: RESERVED for Claude Code
Assigned by: Cursor, 2026-07-24
Product rows: backlog acceptance register #16 and #17

## Goal

Run the second independent adversarial testing round for the deep Muhurat work:

- marriage
- engagement
- housewarming
- Bhoomi Puja
- construction
- business
- travel
- document signing / registration

Do not make product fixes unless the owner explicitly asks you to take over a finding. Record findings first.

## Required Setup

Use the current branch after Cursor's Muhurat implementation commit. Read:

- `plans/cursor-bugbash-muhurat-full-parity.md`
- `validation/deep-muhurats.cjs`
- `src/engine/muhurat.ts`
- `src/data/muhurat-ui.ts`
- `src/screens/MuhuratHub.tsx`

## Minimum Test Matrix

- English and Hindi.
- Desktop width and 390px phone width.
- Direct URL restore for at least `?muhurat=engagement`, `?muhurat=travel`, `?muhurat=document`.
- Confirm each of the eight categories has its own result wording, blockers and windows.
- Confirm Travel shows Char/Labh/Amrit/Shubh windows and never says Panchaka-Rahita.
- Confirm Business/Documents do not inherit Travel's Char-first logic.
- Confirm marriage/engagement/housewarming/Bhoomi/construction show Panchaka-Rahita-style clean windows where applicable.
- Confirm changing the selected category keeps old results visible only while the new calculation is in progress, then replaces them.
- Check start-after-end range error in English and Hindi.
- Check no horizontal overflow and no runtime errors.

## Gates To Run

```bash
export PATH="/opt/homebrew/bin:$PATH"
node validation/deep-muhurats.cjs
node validation/muhurat-anchors.cjs
node validation/samskara-muhurats.cjs
npm run build
```

If a defect is found, record severity, repro steps, expected behavior and actual behavior in `plans/task-log.md` and a bug-bash note. Hand it back unless explicitly assigned to fix.
