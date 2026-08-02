# Ganak brand theme — Sacred Bouquet

**Status:** one owner-review direction, committed on the isolated brand-theme branch.
The production token architecture is unchanged; only the 18 existing colour values
inside `src/styles/design-tokens.css` have been replaced.

## Direction

**Sacred Bouquet** is warm Indian luxury rather than generic saffron UI: a luminous
ivory ground, calm porcelain content panels, wine-crimson emphasis, antique-gold
filigree, temple-sage auspicious states and sindoor-coral avoid states. Dusty sky blue
stays in devotional imagery, where it can enrich the bouquet without becoming an
arbitrary interface status colour.

The default remains light and radiant. Dark mode is a separate aubergine-jewel layer,
not the product's primary personality.

## Colour values

| Role | Light | Dark | Intended use |
|---|---|---|---|
| Background | `#FFF8ED` | `#211620` | Warm ivory / deep aubergine canvas |
| Surface | `#FFFCF7` | `#30212E` | Calm reading panel |
| Ink | `#34263A` | `#FFF7EA` | Plum-black / warm ivory primary text |
| Muted | `#6D5962` | `#D4C2C5` | Dusty rose-brown secondary text |
| Accent | `#8E2F49` | `#FF9DB0` | Crimson rose: selection, devotion, focus |
| Gold | `#78500F` | `#F0C36C` | Antique-gold ornament and sacred emphasis |
| Good | `#356448` | `#9AD8AE` | Deep temple sage, always with ✓ + text |
| Avoid | `#A33E32` | `#FFAD9B` | Sindoor coral, always with ⚠/✗ + text |
| Line | `#A98C72` | `#897080` | Gilded structural keyline |

Every text/status pairing is WCAG-AA. Structural lines clear 3:1 against their
surface. The focused validation gate checks the actual committed hex values.

## Type

The architecture-owned families remain unchanged:

- **Display and devotional headings:** Eczar 600/700. Use it for Ganak, festival
  names, Tithi and Devanagari sacred headings—not for every label.
- **Body, controls and timings:** Spectral 400/600. Its open forms keep dense timing
  information calm and readable.
- **Devanagari treatment:** Eczar for visible headings; loaded self-hosted subsets are
  preserved. Hindi is never letter-spaced or forced to uppercase.

The premium effect comes from hierarchy and air, not calligraphy everywhere: one
expressive title, short lines, generous leading and stable tabular timings.

## Ornament and imagery treatment

1. **Ornate around the sacred, quiet around the useful.** Antique-gold arches,
   flowers and jali belong to the adaptive hero; timing cards use a single clean
   keyline.
2. **Subject-correct art.** Festival images must depict the actual observance. The
   Devshayani approval hero shows Vishnu reclining on Shesha—not a generic seated
   Vishnu—and includes Lakshmi and the lotus with respectful iconography.
3. **Bouquet, not confetti.** Crimson rose and coral lead, sage carries foliage,
   dusty blue is a small cooling note, and gold binds the composition.
4. **Readable crop.** Keep the deity/focal subject clear at phone width; text sits on
   an opaque surface rather than over a busy face or ornament.
5. **No empty states disguised as design.** If correct art is unavailable, use a
   calm tithi illustration; never ship a grey image placeholder.

## Approval renders

- [Side-by-side approval board](design-previews/ganak-sacred-alive-gallery.jpg)
- [Festival day — Devshayani Ekadashi](design-previews/ganak-sacred-alive-festival.png)
- [Ordinary day — Krishna Chaturthi](design-previews/ganak-sacred-alive-ordinary.png)
- [Auditable HTML source](design-previews/ganak-sacred-alive-today.html)
- [Devshayani sleeping-Vishnu hero source](design-previews/ganak-devshayani-vishnu-hero.webp)
- [Ordinary tithi hero source](design-previews/ganak-ordinary-tithi-hero.webp)

The two supplied AVIF invitation files could not be read from Downloads because
macOS privacy denied file access even after approved conversion attempts. This
direction therefore follows the owner's written DNA precisely but does not claim
pixel-sampling of those files.
