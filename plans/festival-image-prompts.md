# Festival hero image — AI generation prompts

Prompts for generating the high-quality festival hero banners that replace the
placeholder SVGs. Works with any image model (Claude image gen, Midjourney, DALL·E,
Firefly, SDXL, etc.).

## How to use

1. For each festival, paste **`STYLE BLOCK` + the festival's `SUBJECT` line** into your
   image generator.
2. Target aspect ratio **8:3 (1280×480)**. If your tool can't do 8:3, generate **16:9**
   (or 3:2) — `npm run festival-images` cover-crops to 1280×480, so keep the subject
   **centered with breathing room** on all sides.
3. Save each result into `festival-images-src/` as `<key>.png` (or .jpg/.webp), using
   the exact key from the SUBJECT list below.
4. Run `npm run festival-images`. Review the page; regenerate any you don't like.

Do a few flagships first (diwali, sharadNavratri, mahaShivaratri, ganeshChaturthi,
holi, ramNavami, janmashtami) to lock the house style before doing the long tail.

---

## STYLE BLOCK (prepend to every prompt)

> Wide horizontal festival banner illustration, 8:3 aspect ratio. Rich, reverent,
> painterly semi-realistic digital art in the style of contemporary Indian devotional
> illustration. Deep jewel-tone palette (maroon, indigo, saffron, gold) with warm
> golden oil-lamp light and a soft glowing halo behind the subject. Atmospheric dark
> background with gentle bokeh and subtle rangoli/paisley motifs. Elegant, ornate but
> uncluttered composition; the main subject centered with clear margin around it.
> Cinematic soft lighting, fine detail, tasteful and respectful. No text, no letters,
> no watermark, no signature, no border frame.
>
> Negative: cartoonish, childish, flat vector, clip-art, deformed faces, extra limbs,
> extra fingers, distorted hands, low detail, harsh flat lighting, text, watermark.

---

## SUBJECT lines (per festival key)

### Lakshmi / Diwali cluster
- **diwali** — Goddess Lakshmi seated serenely on a full-bloomed pink lotus, four graceful arms, gold coins flowing from one palm, flanked by rows of glowing clay diyas, marigold garlands.
- **dhanteras** — Goddess Lakshmi with Dhanvantari's kalash and a display of gold coins, brass pots and new utensils gleaming under lamplight.
- **narakChaturdashi** — A radiant row of lit clay diyas and a rangoli on a dark polished floor, faint Lakshmi silhouette and glow (Chhoti Diwali eve).
- **bhaiDooj** — A sister applying tilak to her brother's forehead at a decorated thali with diya, sweets and roli-chawal; warm affectionate mood.
- **varalakshmi** — Goddess Varalakshmi beside an ornate decorated kalash crowned with a coconut and mango leaves, silk and jasmine, festive South-Indian setting.
- **govardhanPuja** — Young Krishna lifting the green Govardhan hill on one fingertip while villagers and cattle shelter beneath, monsoon sky.

### Durga / Navratri cluster
- **durgaPujaShashthi** — Goddess Durga astride her lion, ten arms with weapons, serene powerful face, pandal marigold and red hibiscus (Shashthi).
- **durgaPujaSaptami** — Goddess Durga in full worship, ten arms, lion at her side, dhak drums and lamps, Saptami morning glow.
- **durgaPujaAshtami** — Goddess Durga at Sandhi puja, 108 lamps aglow, fierce yet calm, red hibiscus offerings.
- **durgaPujaNavami** — Goddess Durga before a sacred homa fire, ten arms, lion, Navami worship, smoke and gold light.
- **durgaPujaDashami** — Durga idol carried in a Vijayadashami visarjan procession toward the river at dusk, sindoor and crowds.
- **durgaPujaMahalaya** — Dawn ancestor-offering (tarpan) at a riverbank with a rising sun, silhouettes with folded hands, soft Mahalaya light.
- **chaitraNavratri** — Goddess Durga on her lion amid nine glowing lamps, spring flowers, Chaitra Navratri.
- **sharadNavratri** — Goddess Durga on her lion amid nine glowing lamps, autumn marigolds, garba dandiya sticks hinted in the foreground.
- **guptNavratriAshadha** — Goddess Durga in meditative sadhana, nine subtle flames, esoteric quiet monsoon mood (Gupt Navratri).
- **guptNavratriMagha** — Goddess Durga in meditative sadhana, nine flames, cool winter-night atmosphere (Magha Gupt Navratri).
- **masikDurgashtami** — Goddess Durga on her lion, single lamp and red flowers, intimate monthly Durgashtami devotion.
- **dussehra** — Lord Rama drawing his bow with a divine arrow toward a distant burning Ravana effigy, victorious Vijayadashami dusk.

### Shiva cluster
- **mahaShivaratri** — A garlanded Shiva lingam with trishul, damaru and bilva leaves, milk abhishek pouring, moon crescent above, night of Shiva.
- **masikShivaratri** — Shiva lingam with bilva leaves and a single oil lamp, quiet monthly Shivaratri night.
- **pradosh** — Shiva in serene meditation at dusk twilight (Pradosh kaal), crescent moon, Nandi bull silhouette, bilva.
- **hartalikaTeej** — Shiva and Parvati together, tender and regal, monsoon greenery, Teej flowers and bangles.

### Vishnu / Krishna / Rama cluster
- **janmashtami** — Infant Krishna asleep in a decorated swing-cradle with a peacock feather and butter pot, midnight blue Janmashtami glow.
- **ramNavami** — Lord Rama, noble and calm, holding his bow, tilak and crown, warm temple light.
- **hanumanJ** — Mighty Hanuman kneeling in devotion with mace (gada), Rama emblem on his chest glowing, saffron.
- **akshaya** — Lord Vishnu blessing with gold and grain abundance, kalash overflowing, auspicious Akshaya Tritiya prosperity.
- **ekadashi** — Lord Vishnu reclining serenely (or standing with conch and chakra), tulsi leaves, fasting-day calm.

### Ganesha
- **ganeshChaturthi** — Lord Ganesha seated, modak in hand, mouse companion, marigolds and a lit lamp, festive pandal.
- **sankashti** — Lord Ganesha under a bright full-ish moon after moonrise, modak and durva grass, Sankashti night.

### Surya / harvest cluster
- **makarSankranti** — The rising sun worshipped over a winter field, kites in a golden sky, sesame-jaggery offerings.
- **pongal** — An overflowing clay pot of Pongal boiling over on a wood fire at sunrise, sugarcane and turmeric, harvest joy.
- **chhath** — A devotee standing waist-deep in river water offering arghya to the rising/setting sun, bamboo baskets of fruit, Chhath dawn.

### Moon / observance cluster
- **karvaChauth** — A decorated Karva Chauth thali with a lit diya and sieve raised toward a large full moon, henna hands, mehendi red.
- **purnima** — A luminous full moon over calm water with a single floating diya, serene Purnima night.
- **amavasya** — A quiet moonless night with oil lamps and folded hands honoring ancestors (Amavasya remembrance), soft indigo.
- **ahoiAshtami** — A mother gazing at a star-filled twilight sky, small diya and karva, protective Ahoi Ashtami mood.
- **kartikaPurnima** — Hundreds of tiny lamps floating on a dark river under a full moon (Dev Deepawali / Kartika Purnima), reflections.

### Holi cluster
- **holika** — A tall Holika bonfire at night with sparks rising and silhouetted devotees circling it, Phalgun Purnima eve.
- **rangwaliHoli** — Joyful burst of colored powder (gulal) in the air, splashes of pink, yellow and blue, playful Holi celebration.

### New year / regional
- **gudiPadwa** — A raised Gudi (bright silk flag with an inverted copper pot, neem and mango leaves, garland) against a fresh spring morning sky.
- **ugadi** — A festive plate of Ugadi pachadi with neem flowers, jaggery and mango, mango-leaf toran, new-year freshness.
- **rakshaBandhan** — An ornate sacred rakhi thread tied on a wrist beside a thali with roli, rice and sweets, warm sibling bond.
- **vatSavitri** — Savitri worshipping at a great banyan tree, tying sacred thread around its trunk, devoted married-woman mood.
- **vatPurnima** — A woman circling a sacred banyan tree with thread and lamp on a full-moon morning (Vat Purnima).
- **sheetlaAshtami** — Sheetla Mata seated calmly with a broom, pot and neem, cool blue tones and previous-day (basoda) cooling foods.

### Jagannath / Buddha / Guru
- **rathYatra** — The towering wooden Jagannath chariot with big painted eyes, ropes pulled by a devout crowd, festive Puri procession.
- **buddhaPurnima** — The Buddha in serene meditation under the Bodhi tree beneath a luminous full moon, lotus, tranquil golden peace.
- **guruPurnima** — A disciple bowing at the feet of a serene guru, lamp and lotus, reverent Guru Purnima devotion.

### South Indian — Murugan / Ayyappa
- **skandaShashti** — Lord Murugan holding the vel spear, peacock mount, six faces hinted, radiant devotion (monthly Shashti).
- **kandaSashtiAnnual** — Lord Murugan victorious with the vel and peacock, temple gopuram glow, six-day Kanda Sashti grandeur.
- **skandaSashtiBegins** — Lord Murugan with vel at a lit temple lamp, first-day vow atmosphere.
- **skandaSashtiSoorasamharam** — Lord Murugan on his peacock triumphant over the demon Soorapadman, vel raised, dramatic victory.
- **skandaSashtiThirukalyanam** — The divine wedding of Murugan and Deivanai/Valli, floral mandapam, celebratory temple scene.
- **ayyappaMandala** — Lord Ayyappa seated in yoga posture with a bell and mala, forest shrine, black-and-gold pilgrim mood.
- **ayyappaMandalaBegins** — Sabarimala pilgrim with irumudi bundle and lamp beginning the Mandala season, forest dawn.
- **ayyappaMandalaPuja** — Grand Mandala Pooja deepam at the Sabarimala shrine, golden closing worship.

### Eclipses
- **suryaGrahan** — A dramatic solar eclipse, the sun's corona ringing a dark disc over a hushed sky, subtle Surya presence, solemn.
- **chandraGrahan** — A deep-red total lunar eclipse (blood moon) in a starry night sky, still and solemn.
