# Raster festival heroes (generated — do not hand-edit)

Optimized **1280×480 WebP** hero images, one per festival key. Produced by
`npm run festival-images` from raw art in `festival-images-src/`.

The app (`src/components/FestivalRasterHero.tsx`) loads `<key>.webp` from here and
renders nothing when the WebP is absent, so this folder can fill in one festival at
a time without showing weak placeholder art. Keep filenames matching the keys in
`src/data/festival-hero-art.ts`.
