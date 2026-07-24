# Ekadashi naming — Ashadha month (calendar labels)

**Keys:** `Ashadha_Shukla_11`, `Ashadha_Krishna_11` · **Status:** fixed 2026-07-24 (owner feedback)

## Owner issue

Page showed **Yogini Ekadashi** when households expect **Devshayani** (Shayani / Hari Shayani) for the Shukla paksha fast that opens Chaturmas.

## Correct mapping (Drik + Bhaskar/Hindustan)

| Lunar key | Popular name (EN) | Hindi | Notes |
|-----------|-------------------|-------|-------|
| `Ashadha_Krishna_11` | Yogini Ekadashi | योगिनी एकादशी | Krishna paksha, ~2 weeks before Devshayani |
| `Ashadha_Shukla_11` | Devshayani Ekadashi | देवशयनी एकादशी | Shukla paksha; Vishnu’s sleep begins; aliases: Shayani, Hari Shayani, Ashadhi |

**Bug was:** names were **swapped** on the wrong paksha (`Yogini` on Shukla, `Hari Bodhini` on Krishna).

## UI

- List/calendar label uses `EKADASHI_NAMES` via `obsLabel()`.
- Optional gloss on dedicated ekadashi pages: “also called Shayani Ekadashi”.

## Sources

- Drik Panchang Devshayani Ekadashi
- India TV / Hindustan July 2026 ekadashi articles (two distinct dates in Ashadha)
