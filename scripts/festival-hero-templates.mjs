#!/usr/bin/env node
/* Rich 640×240 festival hero SVG templates. Each exports data-subject + aria-label. */

export const W = 640;
export const H = 240;

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function labels(titleEn, titleHi) {
  const en = esc(titleEn || 'Festival');
  const hi = esc(titleHi || 'पर्व');
  return `
  <text x="28" y="36" font-family="Georgia, 'Noto Serif Devanagari', serif" font-size="22" fill="#FAF5EA" opacity="0.92">${en}</text>
  <text x="28" y="58" font-family="'Noto Sans Devanagari', sans-serif" font-size="12" fill="#C9B896" letter-spacing="0.08em" opacity="0.78">${hi}</text>`;
}

function shell({ subject, ariaLabel, titleEn, titleHi, defs = '', body = '' }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(ariaLabel)}" data-subject="${esc(subject)}">
  <defs>${defs}</defs>
  ${body}
  ${labels(titleEn, titleHi)}
</svg>
`;
}

function lakshmi({ subject, ariaLabel, titleEn, titleHi }) {
  return shell({
    subject,
    ariaLabel,
    titleEn,
    titleHi,
    defs: `
    <linearGradient id="night" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0F0A1E"/>
      <stop offset="55%" stop-color="#1E1435"/>
      <stop offset="100%" stop-color="#2A1830"/>
    </linearGradient>
    <radialGradient id="halo" cx="50%" cy="42%" r="38%">
      <stop offset="0%" stop-color="#F5C842" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="#F5C842" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="lotus" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#E8A0C8"/>
      <stop offset="100%" stop-color="#C2457E"/>
    </linearGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FFD86B"/>
      <stop offset="100%" stop-color="#A86A12"/>
    </linearGradient>`,
    body: `
  <rect width="${W}" height="${H}" fill="url(#night)"/>
  <rect width="${W}" height="${H}" fill="url(#halo)"/>
  <g fill="#FAF5EA" opacity="0.55">
    <circle cx="90" cy="32" r="1.2"/><circle cx="160" cy="22" r="1"/><circle cx="240" cy="38" r="1.3"/>
    <circle cx="420" cy="18" r="1.1"/><circle cx="510" cy="34" r="1.4"/><circle cx="580" cy="26" r="1"/>
    <circle cx="350" cy="48" r="0.9"/><circle cx="620" cy="44" r="1.2"/>
  </g>
  <circle cx="520" cy="52" r="22" fill="#F5E6B8" opacity="0.18"/>
  <!-- lotus pond -->
  <ellipse cx="320" cy="218" rx="280" ry="28" fill="#1A3048" opacity="0.55"/>
  <g transform="translate(320,198)">
    <ellipse cx="0" cy="8" rx="72" ry="14" fill="#163828" opacity="0.7"/>
    <path d="M-68 6 Q-34 -18 0 2 Q34 -18 68 6 Q34 14 0 10 Q-34 14 -68 6Z" fill="url(#lotus)" opacity="0.9"/>
    <path d="M-42 4 Q-21 -10 0 0 Q21 -10 42 4" fill="none" stroke="#F8D4E8" stroke-width="1.2" opacity="0.6"/>
  </g>
  <!-- goddess on lotus -->
  <g transform="translate(320,118)">
    <ellipse cx="0" cy="58" rx="38" ry="10" fill="#000" opacity="0.2"/>
    <!-- four arms -->
    <path d="M-8 -8 L-52 -28 L-48 -22 L-6 -2Z" fill="url(#gold)" opacity="0.85"/>
    <path d="M8 -8 L52 -28 L48 -22 L6 -2Z" fill="url(#gold)" opacity="0.85"/>
    <path d="M-10 6 L-58 18 L-54 24 L-8 14Z" fill="url(#gold)" opacity="0.8"/>
    <path d="M10 6 L58 18 L54 24 L8 14Z" fill="url(#gold)" opacity="0.8"/>
    <!-- torso & sari -->
    <path d="M-22 4 Q0 -6 22 4 L18 52 Q0 62 -18 52Z" fill="#C2451E" opacity="0.92"/>
    <path d="M-14 8 Q0 0 14 8 L10 48 Q0 54 -10 48Z" fill="#E8A0C8" opacity="0.75"/>
    <!-- crown -->
    <path d="M-18 -18 L-10 -38 L0 -28 L10 -38 L18 -18 Q0 -22 -18 -18Z" fill="url(#gold)"/>
    <circle cx="0" cy="-32" r="4" fill="#FFD86B"/>
    <!-- face -->
    <ellipse cx="0" cy="-6" rx="16" ry="18" fill="#F5D6A8"/>
    <path d="M-6 -10 Q0 -4 6 -10" fill="none" stroke="#8B5A2B" stroke-width="1.2"/>
  </g>
  <!-- diyas at base -->
  <g transform="translate(120,196)">
    <path d="M0 28h32c-3-8-1-18 6-24 4-4 10-5 10-5s6 1 10 5c7 6 9 16 6 24H0z" fill="#6B3410"/>
    <ellipse cx="16" cy="28" rx="16" ry="4" fill="#4A2208"/>
    <ellipse cx="16" cy="6" rx="8" ry="11" fill="#FFD86B" opacity="0.95"/>
    <path d="M12 4c0-5 3-8 4-10 1 2 4 5 4 10" fill="#F5C842"/>
  </g>
  <g transform="translate(220,202)">
    <path d="M0 22h28c-2-6-1-14 5-18 3-3 8-4 9-4s6 1 9 4c6 4 7 12 5 18H0z" fill="#6B3410"/>
    <ellipse cx="14" cy="22" rx="14" ry="3.5" fill="#4A2208"/>
    <ellipse cx="14" cy="5" rx="7" ry="9" fill="#FFD86B" opacity="0.9"/>
  </g>
  <g transform="translate(400,202)">
    <path d="M0 22h28c-2-6-1-14 5-18 3-3 8-4 9-4s6 1 9 4c6 4 7 12 5 18H0z" fill="#6B3410"/>
    <ellipse cx="14" cy="22" rx="14" ry="3.5" fill="#4A2208"/>
    <ellipse cx="14" cy="5" rx="7" ry="9" fill="#FFD86B" opacity="0.9"/>
  </g>
  <g transform="translate(500,196)">
    <path d="M0 28h32c-3-8-1-18 6-24 4-4 10-5 10-5s6 1 10 5c7 6 9 16 6 24H0z" fill="#6B3410"/>
    <ellipse cx="16" cy="28" rx="16" ry="4" fill="#4A2208"/>
    <ellipse cx="16" cy="6" rx="8" ry="11" fill="#FFD86B" opacity="0.95"/>
  </g>`,
  });
}

function krishna({ subject, ariaLabel, titleEn, titleHi }) {
  return shell({
    subject, ariaLabel, titleEn, titleHi,
    defs: `
    <linearGradient id="dusk" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1A2848"/><stop offset="50%" stop-color="#3A5898"/><stop offset="100%" stop-color="#F5A642"/>
    </linearGradient>
    <linearGradient id="skin" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#6B8FD4"/><stop offset="100%" stop-color="#3A5898"/>
    </linearGradient>`,
    body: `
  <rect width="${W}" height="${H}" fill="url(#dusk)"/>
  <circle cx="560" cy="70" r="48" fill="#F5C842" opacity="0.25"/>
  <path d="M0 170 Q200 130 400 165 T640 155 L640 240 L0 240Z" fill="#2A4828" opacity="0.7"/>
  <g transform="translate(340,108)">
    <ellipse cx="0" cy="58" rx="34" ry="9" fill="#000" opacity="0.18"/>
    <path d="M-6 -42 L0 -58 L6 -42 L4 -36 L-4 -36Z" fill="#F5C842"/>
    <circle cx="0" cy="-48" r="5" fill="#4A9E4A"/>
    <ellipse cx="0" cy="-8" rx="18" ry="20" fill="url(#skin)"/>
    <path d="M-20 8 Q0 -2 20 8 L16 56 Q0 66 -16 56Z" fill="#C2451E" opacity="0.9"/>
    <path d="M8 -4 L58 -18" stroke="#D4AF37" stroke-width="3" stroke-linecap="round"/>
    <rect x="52" y="-24" width="8" height="32" rx="2" fill="#8B6914"/>
    <circle cx="0" cy="-6" r="3" fill="#1A2848" opacity="0.5"/>
  </g>
  <g fill="#FAF5EA" opacity="0.35"><circle cx="100" cy="90" r="2"/><circle cx="140" cy="70" r="1.5"/></g>`,
  });
}

function rama({ subject, ariaLabel, titleEn, titleHi }) {
  return shell({
    subject, ariaLabel, titleEn, titleHi,
    defs: `
    <linearGradient id="dawn" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#4A2040"/><stop offset="60%" stop-color="#8B3A28"/><stop offset="100%" stop-color="#D4A050"/>
    </linearGradient>`,
    body: `
  <rect width="${W}" height="${H}" fill="url(#dawn)"/>
  <path d="M0 175 Q320 120 640 170 L640 240 L0 240Z" fill="#1A3020" opacity="0.55"/>
  <g transform="translate(360,100)">
    <ellipse cx="0" cy="62" rx="36" ry="10" fill="#000" opacity="0.2"/>
    <path d="M-16 -28 L0 -48 L16 -28 L10 -20 L-10 -20Z" fill="#D4AF37"/>
    <ellipse cx="0" cy="-6" rx="17" ry="19" fill="#E8C090"/>
    <path d="M-22 6 Q0 -4 22 6 L18 58 Q0 68 -18 58Z" fill="#2A5898" opacity="0.92"/>
    <path d="M-50 -10 L-8 20" stroke="#8B4513" stroke-width="4" stroke-linecap="round"/>
    <path d="M-48 -12 L-52 8 L-44 6Z" fill="#C0C0C0"/>
    <line x1="-48" y1="-12" x2="30" y2="-30" stroke="#A86A12" stroke-width="2.5"/>
    <path d="M28 -32 L38 -28 L32 -22Z" fill="#C2451E"/>
  </g>`,
  });
}

function hanuman({ subject, ariaLabel, titleEn, titleHi }) {
  return shell({
    subject, ariaLabel, titleEn, titleHi,
    defs: `
    <linearGradient id="skyH" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#2A1830"/><stop offset="100%" stop-color="#C2451E"/>
    </linearGradient>`,
    body: `
  <rect width="${W}" height="${H}" fill="url(#skyH)"/>
  <path d="M480 200 L560 80 L600 200Z" fill="#4A3828" opacity="0.5"/>
  <path d="M520 200 L580 100 L620 200Z" fill="#3A2818" opacity="0.45"/>
  <g transform="translate(300,95)">
    <ellipse cx="0" cy="68" rx="40" ry="11" fill="#000" opacity="0.22"/>
    <ellipse cx="0" cy="-4" rx="20" ry="22" fill="#E87840"/>
    <path d="M-8 -22 Q0 -32 8 -22 L6 -14 Q0 -18 -6 -14Z" fill="#8B3010"/>
    <path d="M-24 8 Q0 -2 24 8 L20 62 Q0 72 -20 62Z" fill="#D45020" opacity="0.95"/>
    <path d="M28 0 L68 -20" stroke="#6B3410" stroke-width="8" stroke-linecap="round"/>
    <circle cx="68" cy="-20" r="10" fill="#8B4513"/>
    <path d="M-30 14 L-50 40" stroke="#E87840" stroke-width="6" stroke-linecap="round"/>
  </g>`,
  });
}

function ganesha({ subject, ariaLabel, titleEn, titleHi }) {
  return shell({
    subject, ariaLabel, titleEn, titleHi,
    defs: `
    <linearGradient id="fest" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FAF5EA"/><stop offset="100%" stop-color="#E8C878"/>
    </linearGradient>`,
    body: `
  <rect width="${W}" height="${H}" fill="url(#fest)"/>
  <circle cx="520" cy="150" r="80" fill="#A86A12" opacity="0.12"/>
  <g transform="translate(360,108)">
    <ellipse cx="0" cy="58" rx="42" ry="11" fill="#8C8173" opacity="0.2"/>
    <ellipse cx="0" cy="8" rx="38" ry="34" fill="#E8A050"/>
    <path d="M-28 -8 Q-38 -38 -8 -42 Q12 -44 28 -8 Q18 8 0 10 Q-18 8 -28 -8Z" fill="#E8A050"/>
    <ellipse cx="-18" cy="-18" rx="14" ry="18" fill="#E8A050"/>
    <ellipse cx="18" cy="-18" rx="14" ry="18" fill="#E8A050"/>
    <circle cx="0" cy="-4" r="5" fill="#3B3147"/>
    <path d="M-8 6 Q0 14 8 6" fill="none" stroke="#3B3147" stroke-width="2"/>
    <ellipse cx="0" cy="38" rx="22" ry="16" fill="#C2451E" opacity="0.85"/>
    <circle cx="-28" cy="48" r="8" fill="#F5C842"/>
    <ellipse cx="50" cy="72" rx="10" ry="6" fill="#8C8173" opacity="0.6"/>
  </g>
  <g transform="translate(180,188)">
    <path d="M0 24h26c-2-6-1-14 4-18 3-3 7-4 9-4s6 1 9 4c5 4 6 12 4 18H0z" fill="#6B3410"/>
    <ellipse cx="13" cy="5" rx="6" ry="8" fill="#FFD86B" opacity="0.9"/>
  </g>`,
  });
}

function durga({ subject, ariaLabel, titleEn, titleHi }) {
  return shell({
    subject, ariaLabel, titleEn, titleHi,
    defs: `
    <linearGradient id="devisky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1A0828"/><stop offset="100%" stop-color="#6B1838"/>
    </linearGradient>
    <radialGradient id="aglow" cx="50%" cy="40%" r="45%">
      <stop offset="0%" stop-color="#F5C842" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#F5C842" stop-opacity="0"/>
    </radialGradient>`,
    body: `
  <rect width="${W}" height="${H}" fill="url(#devisky)"/>
  <rect width="${W}" height="${H}" fill="url(#aglow)"/>
  <g transform="translate(340,118)">
    <path d="M-60 50 Q-20 20 20 50 Q60 20 100 50 L90 70 Q50 48 10 70 Q-30 48 -60 70Z" fill="#C2451E" opacity="0.75"/>
    <ellipse cx="20" cy="52" rx="28" ry="12" fill="#E87840" opacity="0.8"/>
    <path d="M-8 -30 L-40 -50 M-4 -28 L-30 -10 M0 -26 L-36 8 M4 -28 L-20 28 M8 -30 L40 -50 M12 -28 L34 -8 M16 -26 L42 6 M20 -28 L48 24" stroke="#D4AF37" stroke-width="3" stroke-linecap="round"/>
    <path d="M-16 -20 L0 -48 L16 -20 L12 -12 L-12 -12Z" fill="#D4AF37"/>
    <ellipse cx="0" cy="-4" rx="14" ry="16" fill="#F5D6A8"/>
    <path d="M-18 4 Q0 -6 18 4 L14 48 Q0 56 -14 48Z" fill="#C2451E"/>
  </g>`,
  });
}

function shiva({ subject, ariaLabel, titleEn, titleHi }) {
  return shell({
    subject, ariaLabel, titleEn, titleHi,
    defs: `
    <linearGradient id="shivnight" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0A1428"/><stop offset="100%" stop-color="#1A2848"/>
    </linearGradient>`,
    body: `
  <rect width="${W}" height="${H}" fill="url(#shivnight)"/>
  <g fill="#FAF5EA" opacity="0.4"><circle cx="80" cy="40" r="1"/><circle cx="200" cy="28" r="1.2"/><circle cx="500" cy="36" r="1"/></g>
  <g transform="translate(360,130)">
    <ellipse cx="0" cy="48" rx="28" ry="38" fill="#2A3040" opacity="0.9"/>
    <ellipse cx="0" cy="20" rx="10" ry="14" fill="#4A5060"/>
    <ellipse cx="0" cy="-8" rx="6" ry="8" fill="#6A7080"/>
    <path d="M-50 -30 L-20 40" stroke="#8B9098" stroke-width="4" stroke-linecap="round"/>
    <path d="M50 -30 L20 40" stroke="#8B9098" stroke-width="4" stroke-linecap="round"/>
    <path d="M0 -50 L0 -70" stroke="#D4AF37" stroke-width="3"/>
    <path d="M-12 -58 L0 -78 L12 -58" fill="#D4AF37"/>
    <ellipse cx="-55" cy="10" rx="8" ry="14" fill="#2A5838" transform="rotate(-25 -55 10)"/>
    <ellipse cx="55" cy="10" rx="8" ry="14" fill="#2A5838" transform="rotate(25 55 10)"/>
  </g>
  <circle cx="120" cy="60" r="18" fill="#E8E8F0" opacity="0.15"/>`,
  });
}

function shivaParvati({ subject, ariaLabel, titleEn, titleHi }) {
  return shell({
    subject, ariaLabel, titleEn, titleHi,
    defs: `
    <linearGradient id="himalaya" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#283858"/><stop offset="70%" stop-color="#6888A8"/><stop offset="100%" stop-color="#D8E8F0"/>
    </linearGradient>`,
    body: `
  <rect width="${W}" height="${H}" fill="url(#himalaya)"/>
  <path d="M0 160 L180 80 L320 130 L480 60 L640 140 L640 240 L0 240Z" fill="#E8F0F8" opacity="0.35"/>
  <g transform="translate(280,108)">
    <ellipse cx="-30" cy="58" rx="22" ry="8" fill="#000" opacity="0.15"/>
    <ellipse cx="30" cy="58" rx="22" ry="8" fill="#000" opacity="0.15"/>
    <ellipse cx="-30" cy="0" rx="14" ry="16" fill="#E8C8D8"/>
    <path d="M-38 -4 Q-30 -24 -22 -4 L-26 40 Q-30 48 -34 40Z" fill="#C2457E"/>
    <ellipse cx="30" cy="-2" rx="14" ry="16" fill="#6B8FD4"/>
    <path d="M22 -6 Q30 -28 38 -6 L34 42 Q30 50 26 42Z" fill="#E8E8F0" opacity="0.85"/>
    <path d="M-8 20 Q0 10 8 20" stroke="#D4AF37" stroke-width="2" fill="none"/>
  </g>`,
  });
}

function surya({ subject, ariaLabel, titleEn, titleHi }) {
  return shell({
    subject, ariaLabel, titleEn, titleHi,
    defs: `
    <radialGradient id="sun" cx="50%" cy="45%" r="40%">
      <stop offset="0%" stop-color="#FFF8D0"/><stop offset="40%" stop-color="#F5C842"/><stop offset="100%" stop-color="#C2451E" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="horizon" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#4A2048"/><stop offset="60%" stop-color="#D45020"/><stop offset="100%" stop-color="#F5A642"/>
    </linearGradient>`,
    body: `
  <rect width="${W}" height="${H}" fill="url(#horizon)"/>
  <rect width="${W}" height="${H}" fill="url(#sun)"/>
  <g stroke="#FFD86B" stroke-width="2" opacity="0.7">
    <line x1="400" y1="90" x2="400" y2="40"/><line x1="400" y1="90" x2="450" y2="65"/><line x1="400" y1="90" x2="350" y2="65"/>
    <line x1="400" y1="90" x2="430" y2="120"/><line x1="400" y1="90" x2="370" y2="120"/><line x1="400" y1="90" x2="400" y2="135"/>
    <line x1="400" y1="90" x2="460" y2="90"/><line x1="400" y1="90" x2="340" y2="90"/>
  </g>
  <circle cx="400" cy="90" r="36" fill="#FFD86B"/>
  <path d="M0 175 Q320 155 640 175 L640 240 L0 240Z" fill="#1A3020" opacity="0.4"/>
  <g transform="translate(180,165)">
    <rect x="0" y="20" width="60" height="8" rx="2" fill="#8B4513" opacity="0.7"/>
    <ellipse cx="30" cy="20" rx="28" ry="8" fill="#D4A050" opacity="0.6"/>
  </g>`,
  });
}

function chhath({ subject, ariaLabel, titleEn, titleHi }) {
  return shell({
    subject, ariaLabel, titleEn, titleHi,
    defs: `
    <linearGradient id="chhathsky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1A2848"/><stop offset="50%" stop-color="#D45020"/><stop offset="100%" stop-color="#F5A642"/>
    </linearGradient>`,
    body: `
  <rect width="${W}" height="${H}" fill="url(#chhathsky)"/>
  <ellipse cx="480" cy="95" rx="40" ry="40" fill="#FFD86B" opacity="0.85"/>
  <path d="M0 185 Q200 165 400 180 T640 170 L640 240 L0 240Z" fill="#1A4868" opacity="0.65"/>
  <g transform="translate(220,150)">
    <rect x="0" y="0" width="4" height="50" fill="#6B4420"/>
    <ellipse cx="40" cy="8" rx="36" ry="10" fill="#D4A050" opacity="0.8"/>
    <path d="M10 8 Q40 -8 70 8" fill="none" stroke="#8B6914" stroke-width="2"/>
    <ellipse cx="40" cy="12" rx="20" ry="6" fill="#F5C842" opacity="0.7"/>
  </g>
  <g transform="translate(340,158)">
    <ellipse cx="0" cy="30" rx="18" ry="22" fill="#E87840" opacity="0.75"/>
    <path d="M-20 8 L0 -10 L20 8" fill="#F5D6A8" opacity="0.6"/>
  </g>`,
  });
}

function moonKarva({ subject, ariaLabel, titleEn, titleHi }) {
  return shell({
    subject, ariaLabel, titleEn, titleHi,
    defs: `
    <linearGradient id="karvanight" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0F0A20"/><stop offset="100%" stop-color="#2A1838"/>
    </linearGradient>`,
    body: `
  <rect width="${W}" height="${H}" fill="url(#karvanight)"/>
  <circle cx="500" cy="72" r="34" fill="#F0E8D8" opacity="0.92"/>
  <circle cx="512" cy="66" r="30" fill="#1A1028" opacity="0.35"/>
  <g transform="translate(300,130)">
    <ellipse cx="0" cy="28" rx="38" ry="10" fill="#8B4513" opacity="0.8"/>
    <path d="M-30 28 Q-30 -8 0 -18 Q30 -8 30 28Z" fill="#A86A12"/>
    <ellipse cx="0" cy="-6" rx="14" ry="8" fill="#C2451E" opacity="0.7"/>
    <circle cx="0" cy="-14" r="6" fill="#D4AF37"/>
  </g>
  <circle cx="180" cy="100" r="28" fill="none" stroke="#D4AF37" stroke-width="2" opacity="0.5"/>
  <line x1="180" y1="72" x2="180" y2="128" stroke="#D4AF37" stroke-width="1" opacity="0.4"/>
  <line x1="152" y1="100" x2="208" y2="100" stroke="#D4AF37" stroke-width="1" opacity="0.4"/>`,
  });
}

function holi({ subject, ariaLabel, titleEn, titleHi }) {
  return shell({
    subject, ariaLabel, titleEn, titleHi,
    defs: `
    <linearGradient id="holi" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#C2451E"/><stop offset="50%" stop-color="#E8A050"/><stop offset="100%" stop-color="#4A9E4A"/>
    </linearGradient>`,
    body: `
  <rect width="${W}" height="${H}" fill="url(#holi)"/>
  <circle cx="120" cy="100" r="40" fill="#E87840" opacity="0.45"/>
  <circle cx="280" cy="80" r="50" fill="#F5C842" opacity="0.4"/>
  <circle cx="440" cy="120" r="45" fill="#6B8FD4" opacity="0.45"/>
  <circle cx="560" cy="70" r="35" fill="#C2457E" opacity="0.4"/>
  <path d="M200 200 Q240 140 280 200" fill="#8B3010" opacity="0.5"/>
  <ellipse cx="240" cy="175" rx="30" ry="18" fill="#F5C842" opacity="0.35"/>
  <g transform="translate(380,150)">
    <rect x="0" y="0" width="50" height="12" rx="4" fill="#6B3410"/>
    <path d="M50 6 L80 0 L75 12 L50 6Z" fill="#4A9E4A"/>
  </g>`,
  });
}

function jagannath({ subject, ariaLabel, titleEn, titleHi }) {
  return shell({
    subject, ariaLabel, titleEn, titleHi,
    defs: `
    <linearGradient id="rath" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FAF5EA"/><stop offset="100%" stop-color="#D4A050"/>
    </linearGradient>`,
    body: `
  <rect width="${W}" height="${H}" fill="url(#rath)"/>
  <g transform="translate(280,145)">
    <rect x="0" y="0" width="200" height="50" rx="4" fill="#6B3010"/>
    <circle cx="40" cy="52" r="18" fill="#3B3147"/><circle cx="100" cy="52" r="18" fill="#3B3147"/><circle cx="160" cy="52" r="18" fill="#3B3147"/>
    <rect x="20" y="-60" width="160" height="65" rx="6" fill="#C2451E" opacity="0.85"/>
    <circle cx="60" cy="-35" r="22" fill="#1A1028"/><circle cx="100" cy="-35" r="22" fill="#F5D6A8"/><circle cx="140" cy="-35" r="22" fill="#E87840"/>
    <circle cx="60" cy="-38" r="6" fill="#FAF5EA"/><circle cx="100" cy="-38" r="6" fill="#3B3147"/><circle cx="140" cy="-38" r="6" fill="#FAF5EA"/>
    <rect x="90" y="-75" width="20" height="18" fill="#D4AF37"/>
  </g>`,
  });
}

function buddha({ subject, ariaLabel, titleEn, titleHi }) {
  return shell({
    subject, ariaLabel, titleEn, titleHi,
    defs: `
    <linearGradient id="bodhi" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1A3048"/><stop offset="100%" stop-color="#4A7858"/>
    </linearGradient>`,
    body: `
  <rect width="${W}" height="${H}" fill="url(#bodhi)"/>
  <circle cx="520" cy="60" r="28" fill="#F0E8D0" opacity="0.8"/>
  <g transform="translate(340,130)">
    <ellipse cx="0" cy="40" rx="50" ry="12" fill="#2A4838" opacity="0.5"/>
    <ellipse cx="0" cy="8" rx="22" ry="26" fill="#D4AF37" opacity="0.9"/>
    <circle cx="0" cy="-18" r="14" fill="#E8C090"/>
    <path d="M-18 10 Q0 0 18 10 L14 36 Q0 42 -14 36Z" fill="#8B6914"/>
    <path d="M-30 20 Q0 8 30 20" fill="none" stroke="#6B5838" stroke-width="4"/>
  </g>
  <circle cx="180" cy="90" r="50" fill="#2A5838" opacity="0.35"/>
  <circle cx="200" cy="80" r="40" fill="#3A6848" opacity="0.3"/>`,
  });
}

function guru({ subject, ariaLabel, titleEn, titleHi }) {
  return shell({
    subject, ariaLabel, titleEn, titleHi,
    defs: `
    <linearGradient id="gurusk" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1A2848"/><stop offset="100%" stop-color="#6888A8"/>
    </linearGradient>`,
    body: `
  <rect width="${W}" height="${H}" fill="url(#gurusk)"/>
  <circle cx="500" cy="65" r="30" fill="#F0E8D0" opacity="0.75"/>
  <g transform="translate(320,105)">
    <ellipse cx="0" cy="58" rx="30" ry="9" fill="#000" opacity="0.18"/>
    <ellipse cx="0" cy="-4" rx="16" ry="18" fill="#E8C090"/>
    <path d="M-20 6 Q0 -4 20 6 L16 54 Q0 62 -16 54Z" fill="#FAF5EA" opacity="0.9"/>
    <rect x="-30" y="20" width="60" height="8" rx="2" fill="#D4A050" opacity="0.7"/>
    <path d="M-50 30 Q-30 10 -10 30" fill="none" stroke="#8C8173" stroke-width="3" opacity="0.5"/>
    <path d="M10 30 Q30 10 50 30" fill="none" stroke="#8C8173" stroke-width="3" opacity="0.5"/>
  </g>`,
  });
}

function murugan({ subject, ariaLabel, titleEn, titleHi }) {
  return shell({
    subject, ariaLabel, titleEn, titleHi,
    defs: `
    <linearGradient id="mur" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1A2048"/><stop offset="100%" stop-color="#C2451E"/>
    </linearGradient>`,
    body: `
  <rect width="${W}" height="${H}" fill="url(#mur)"/>
  <g transform="translate(360,108)">
    <ellipse cx="0" cy="60" rx="34" ry="10" fill="#000" opacity="0.2"/>
    <ellipse cx="0" cy="-4" rx="16" ry="18" fill="#E87840"/>
    <path d="M-18 4 Q0 -6 18 4 L14 52 Q0 60 -14 52Z" fill="#C2451E"/>
    <path d="M20 -10 L70 -40" stroke="#D4AF37" stroke-width="4" stroke-linecap="round"/>
    <path d="M68 -42 L78 -36 L72 -28Z" fill="#C0C0C0"/>
    <path d="M-30 50 Q0 20 40 55 Q20 35 0 45 Q-20 35 -30 50Z" fill="#4A9E4A" opacity="0.7"/>
    <circle cx="0" cy="-22" r="5" fill="#D4AF37"/>
  </g>`,
  });
}

function ayyappa({ subject, ariaLabel, titleEn, titleHi }) {
  return shell({
    subject, ariaLabel, titleEn, titleHi,
    defs: `
    <linearGradient id="sabar" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0A1820"/><stop offset="100%" stop-color="#2A4838"/>
    </linearGradient>`,
    body: `
  <rect width="${W}" height="${H}" fill="url(#sabar)"/>
  <path d="M0 150 Q200 100 400 140 T640 120 L640 240 L0 240Z" fill="#1A3020" opacity="0.6"/>
  <g transform="translate(340,115)">
    <ellipse cx="0" cy="58" rx="28" ry="9" fill="#000" opacity="0.2"/>
    <ellipse cx="0" cy="-2" rx="14" ry="16" fill="#1A2848"/>
    <path d="M-16 4 Q0 -6 16 4 L12 50 Q0 58 -12 50Z" fill="#2A5898"/>
    <circle cx="0" cy="-20" r="10" fill="none" stroke="#D4AF37" stroke-width="2"/>
    <path d="M-24 10 Q0 0 24 10" fill="none" stroke="#F5C842" stroke-width="3"/>
  </g>
  <g transform="translate(200,175)">
    <path d="M0 30h20c-2-6-1-14 4-18 3-3 7-4 9-4s6 1 9 4c5 4 6 12 4 18H0z" fill="#6B3410"/>
    <ellipse cx="10" cy="6" rx="6" ry="8" fill="#FFD86B" opacity="0.9"/>
  </g>
  <ellipse cx="480" cy="80" rx="8" ry="12" fill="#D4AF37" opacity="0.6"/>`,
  });
}

function vishnu({ subject, ariaLabel, titleEn, titleHi }) {
  return shell({
    subject, ariaLabel, titleEn, titleHi,
    defs: `
    <linearGradient id="vish" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1A2048"/><stop offset="100%" stop-color="#4A68A8"/>
    </linearGradient>`,
    body: `
  <rect width="${W}" height="${H}" fill="url(#vish)"/>
  <g transform="translate(360,108)">
    <ellipse cx="0" cy="60" rx="36" ry="10" fill="#000" opacity="0.18"/>
    <ellipse cx="0" cy="-4" rx="17" ry="19" fill="#6B8FD4"/>
    <path d="M-20 6 Q0 -4 20 6 L16 54 Q0 64 -16 54Z" fill="#FAF5EA" opacity="0.88"/>
    <path d="M-14 -18 L-8 -8" stroke="#D4AF37" stroke-width="3"/>
    <circle cx="-50" cy="10" r="14" fill="none" stroke="#F5C842" stroke-width="2"/>
    <circle cx="50" cy="10" r="12" fill="#C2451E" opacity="0.8"/>
    <path d="M-30 40 Q0 28 30 40" fill="none" stroke="#4A9E4A" stroke-width="4" opacity="0.5"/>
  </g>`,
  });
}

function pitru({ subject, ariaLabel, titleEn, titleHi }) {
  return shell({
    subject, ariaLabel, titleEn, titleHi,
    defs: `
    <linearGradient id="pitru" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#283040"/><stop offset="100%" stop-color="#586878"/>
    </linearGradient>`,
    body: `
  <rect width="${W}" height="${H}" fill="url(#pitru)"/>
  <path d="M0 175 Q320 155 640 175 L640 240 L0 240Z" fill="#1A3848" opacity="0.55"/>
  <g transform="translate(300,140)">
    <ellipse cx="0" cy="35" rx="40" ry="8" fill="#4A5868" opacity="0.7"/>
    <path d="M-20 35 L-20 10 Q0 0 20 10 L20 35Z" fill="#8B9098" opacity="0.6"/>
    <ellipse cx="0" cy="8" rx="12" ry="4" fill="#D4A050" opacity="0.7"/>
    <circle cx="-8" cy="6" r="2" fill="#6B3410"/><circle cx="0" cy="5" r="2" fill="#6B3410"/><circle cx="8" cy="6" r="2" fill="#6B3410"/>
  </g>
  <g opacity="0.35" fill="#E8E8F0">
    <ellipse cx="180" cy="100" rx="12" ry="20"/><ellipse cx="220" cy="95" rx="10" ry="18"/><ellipse cx="460" cy="105" rx="11" ry="19"/>
  </g>`,
  });
}

function savitri({ subject, ariaLabel, titleEn, titleHi }) {
  return shell({
    subject, ariaLabel, titleEn, titleHi,
    defs: `
    <linearGradient id="vat" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#2A4838"/><stop offset="100%" stop-color="#688858"/>
    </linearGradient>`,
    body: `
  <rect width="${W}" height="${H}" fill="url(#vat)"/>
  <g transform="translate(200,80)">
    <rect x="-8" y="0" width="16" height="120" rx="4" fill="#4A3018"/>
    <circle cx="0" cy="-10" r="55" fill="#2A5838" opacity="0.65"/>
    <circle cx="-30" cy="10" r="35" fill="#3A6848" opacity="0.5"/>
    <circle cx="35" cy="5" r="40" fill="#3A6848" opacity="0.5"/>
    <path d="M-40 40 Q0 20 40 40" fill="none" stroke="#6B4420" stroke-width="2" opacity="0.5"/>
  </g>
  <g transform="translate(400,125)">
    <ellipse cx="0" cy="50" rx="20" ry="7" fill="#000" opacity="0.15"/>
    <ellipse cx="0" cy="0" rx="12" ry="14" fill="#E8C8D8"/>
    <path d="M-14 4 Q0 -4 14 4 L10 44 Q0 50 -10 44Z" fill="#C2457E" opacity="0.85"/>
    <path d="M-20 20 Q0 10 20 20" fill="none" stroke="#D4AF37" stroke-width="2"/>
  </g>`,
  });
}

function motherStars({ subject, ariaLabel, titleEn, titleHi }) {
  return shell({
    subject, ariaLabel, titleEn, titleHi,
    defs: `
    <linearGradient id="ahoi" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0F0A20"/><stop offset="100%" stop-color="#2A2048"/>
    </linearGradient>`,
    body: `
  <rect width="${W}" height="${H}" fill="url(#ahoi)"/>
  <g fill="#F5C842" opacity="0.85">
    <circle cx="420" cy="55" r="3"/><circle cx="440" cy="48" r="2"/><circle cx="460" cy="58" r="2.5"/>
    <circle cx="400" cy="65" r="2"/><circle cx="450" cy="70" r="2"/><circle cx="480" cy="52" r="2"/><circle cx="430" cy="72" r="1.8"/>
  </g>
  <g transform="translate(280,120)">
    <ellipse cx="0" cy="52" rx="28" ry="8" fill="#000" opacity="0.15"/>
    <ellipse cx="-8" cy="0" rx="11" ry="13" fill="#E8C8D8"/>
    <path d="M-16 4 Q-8 -4 0 4 L-4 40 Q-8 46 -12 40Z" fill="#C2457E" opacity="0.8"/>
    <ellipse cx="14" cy="18" rx="7" ry="9" fill="#F5D6A8"/>
    <path d="M8 22 Q14 14 20 22 L18 36 Q14 40 10 36Z" fill="#6B8FD4" opacity="0.7"/>
  </g>`,
  });
}

function sheetla({ subject, ariaLabel, titleEn, titleHi }) {
  return shell({
    subject, ariaLabel, titleEn, titleHi,
    defs: `
    <linearGradient id="cool" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#D8E8F0"/><stop offset="100%" stop-color="#88A8B8"/>
    </linearGradient>`,
    body: `
  <rect width="${W}" height="${H}" fill="url(#cool)"/>
  <g transform="translate(340,115)">
    <ellipse cx="0" cy="58" rx="30" ry="9" fill="#8C8173" opacity="0.2"/>
    <ellipse cx="0" cy="-4" rx="15" ry="17" fill="#E8C8D8"/>
    <path d="M-18 4 Q0 -6 18 4 L14 50 Q0 58 -14 50Z" fill="#4A9E9E" opacity="0.85"/>
    <circle cx="0" cy="-22" r="8" fill="#6B8FD4" opacity="0.5"/>
  </g>
  <g transform="translate(200,155)">
    <ellipse cx="0" cy="25" rx="28" ry="8" fill="#6B9098" opacity="0.6"/>
    <path d="M-18 25 Q-18 0 0 -10 Q18 0 18 25Z" fill="#8BA8B0" opacity="0.75"/>
    <ellipse cx="0" cy="5" rx="10" ry="5" fill="#D4E8F0" opacity="0.8"/>
  </g>
  <ellipse cx="500" cy="90" rx="18" ry="28" fill="#2A5838" opacity="0.4" transform="rotate(20 500 90)"/>`,
  });
}

function diyaRiver({ subject, ariaLabel, titleEn, titleHi }) {
  return shell({
    subject, ariaLabel, titleEn, titleHi,
    defs: `
    <linearGradient id="river" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0A1828"/><stop offset="100%" stop-color="#1A4868"/>
    </linearGradient>`,
    body: `
  <rect width="${W}" height="${H}" fill="url(#river)"/>
  <path d="M0 160 Q160 140 320 165 T640 150 L640 240 L0 240Z" fill="#0A3048" opacity="0.7"/>
  <g transform="translate(160,175)"><ellipse cx="0" cy="8" rx="8" ry="12" fill="#FFD86B" opacity="0.9"/><ellipse cx="0" cy="20" rx="6" ry="3" fill="#FFD86B" opacity="0.3"/></g>
  <g transform="translate(280,170)"><ellipse cx="0" cy="8" rx="8" ry="12" fill="#FFD86B" opacity="0.85"/><ellipse cx="0" cy="20" rx="6" ry="3" fill="#FFD86B" opacity="0.25"/></g>
  <g transform="translate(400,178)"><ellipse cx="0" cy="8" rx="8" ry="12" fill="#FFD86B" opacity="0.9"/><ellipse cx="0" cy="20" rx="6" ry="3" fill="#FFD86B" opacity="0.3"/></g>
  <g transform="translate(520,172)"><ellipse cx="0" cy="8" rx="8" ry="12" fill="#FFD86B" opacity="0.88"/><ellipse cx="0" cy="20" rx="6" ry="3" fill="#FFD86B" opacity="0.28"/></g>
  <circle cx="540" cy="55" r="22" fill="#F0E8D0" opacity="0.7"/>`,
  });
}

function gudi({ subject, ariaLabel, titleEn, titleHi }) {
  return shell({
    subject, ariaLabel, titleEn, titleHi,
    defs: `
    <linearGradient id="newyr" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FAF5EA"/><stop offset="100%" stop-color="#F5A642"/>
    </linearGradient>`,
    body: `
  <rect width="${W}" height="${H}" fill="url(#newyr)"/>
  <g transform="translate(340,60)">
    <rect x="-3" y="0" width="6" height="140" fill="#6B4420"/>
    <polygon points="0,0 50,25 0,50" fill="#C2451E" opacity="0.9"/>
    <circle cx="0" cy="55" r="14" fill="#D4AF37"/>
    <ellipse cx="-20" cy="30" rx="10" ry="6" fill="#2A5838" opacity="0.7" transform="rotate(-30 -20 30)"/>
    <ellipse cx="18" cy="35" rx="10" ry="6" fill="#2A5838" opacity="0.7" transform="rotate(25 18 35)"/>
    <rect x="-8" y="52" width="16" height="10" rx="2" fill="#FAF5EA" opacity="0.8"/>
  </g>`,
  });
}

function rakhi({ subject, ariaLabel, titleEn, titleHi }) {
  return shell({
    subject, ariaLabel, titleEn, titleHi,
    defs: `
    <linearGradient id="rakhi" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FAF5EA"/><stop offset="100%" stop-color="#E8A0C8"/>
    </linearGradient>`,
    body: `
  <rect width="${W}" height="${H}" fill="url(#rakhi)"/>
  <g transform="translate(320,125)">
    <circle cx="0" cy="0" r="28" fill="none" stroke="#C2451E" stroke-width="4"/>
    <circle cx="0" cy="0" r="18" fill="#D4AF37" opacity="0.5"/>
    <path d="M-8 -8 L0 -20 L8 -8 L6 0 L-6 0Z" fill="#C2457E"/>
    <path d="M-30 20 Q-15 0 0 15" fill="none" stroke="#E8C090" stroke-width="8" stroke-linecap="round" opacity="0.7"/>
    <path d="M30 20 Q15 0 0 15" fill="none" stroke="#E8C090" stroke-width="8" stroke-linecap="round" opacity="0.7"/>
  </g>`,
  });
}

function grahanSolar({ subject, ariaLabel, titleEn, titleHi }) {
  return shell({
    subject, ariaLabel, titleEn, titleHi,
    defs: `
    <radialGradient id="corona" cx="50%" cy="45%" r="45%">
      <stop offset="70%" stop-color="#0A1020"/><stop offset="85%" stop-color="#F5C842" stop-opacity="0.6"/><stop offset="100%" stop-color="#1A1830"/>
    </radialGradient>`,
    body: `
  <rect width="${W}" height="${H}" fill="#0A1020"/>
  <circle cx="400" cy="110" r="70" fill="url(#corona)"/>
  <circle cx="400" cy="110" r="42" fill="#1A1830"/>
  <g stroke="#FFD86B" stroke-width="1.5" opacity="0.5">
    <line x1="400" y1="30" x2="400" y2="50"/><line x1="400" y1="170" x2="400" y2="190"/>
    <line x1="320" y1="110" x2="340" y2="110"/><line x1="460" y1="110" x2="480" y2="110"/>
  </g>`,
  });
}

function grahanLunar({ subject, ariaLabel, titleEn, titleHi }) {
  return shell({
    subject, ariaLabel, titleEn, titleHi,
    defs: `
    <linearGradient id="lunsky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0A0A18"/><stop offset="100%" stop-color="#1A1838"/>
    </linearGradient>`,
    body: `
  <rect width="${W}" height="${H}" fill="url(#lunsky)"/>
  <circle cx="400" cy="110" r="50" fill="#C2451E" opacity="0.85"/>
  <circle cx="418" cy="98" r="48" fill="#1A1838"/>
  <g fill="#FAF5EA" opacity="0.4"><circle cx="120" cy="50" r="1"/><circle cx="200" cy="35" r="1.2"/><circle cx="560" cy="45" r="1"/></g>`,
  });
}

function moon({ subject, ariaLabel, titleEn, titleHi }) {
  return shell({
    subject, ariaLabel, titleEn, titleHi,
    defs: `
    <linearGradient id="moonnight" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0F0A20"/><stop offset="100%" stop-color="#283858"/>
    </linearGradient>
    <radialGradient id="moonglow" cx="50%" cy="40%" r="50%">
      <stop offset="0%" stop-color="#F0E8D8" stop-opacity="0.35"/><stop offset="100%" stop-color="#F0E8D8" stop-opacity="0"/>
    </radialGradient>`,
    body: `
  <rect width="${W}" height="${H}" fill="url(#moonnight)"/>
  <rect width="${W}" height="${H}" fill="url(#moonglow)"/>
  <circle cx="420" cy="100" r="55" fill="#F0E8D8" opacity="0.92"/>
  <path d="M440 75 Q460 100 440 125 Q420 100 440 75" fill="#D8D0C0" opacity="0.25"/>
  <g transform="translate(200,175)">
    <ellipse cx="0" cy="0" rx="20" ry="8" fill="#2A5838" opacity="0.5"/>
    <ellipse cx="0" cy="-8" rx="12" ry="10" fill="#E8A0C8" opacity="0.6"/>
  </g>`,
  });
}

/** @type {Record<string, (opts: { subject: string, ariaLabel: string, titleEn?: string, titleHi?: string }) => string>} */
export const TEMPLATES = Object.freeze({
  lakshmi,
  krishna,
  rama,
  hanuman,
  ganesha,
  durga,
  shiva,
  'shiva-parvati': shivaParvati,
  surya,
  chhath,
  'moon-karva': moonKarva,
  holi,
  jagannath,
  buddha,
  guru,
  murugan,
  ayyappa,
  vishnu,
  pitru,
  savitri,
  'mother-stars': motherStars,
  sheetla,
  'diya-river': diyaRiver,
  gudi,
  rakhi,
  'grahan-solar': grahanSolar,
  'grahan-lunar': grahanLunar,
  moon,
});

/**
 * @param {string} templateName
 * @param {{ subject: string, ariaLabel: string, titleEn?: string, titleHi?: string }} opts
 */
export function renderHero(templateName, opts) {
  const fn = TEMPLATES[templateName];
  if (!fn) throw new Error(`Unknown festival hero template: ${templateName}`);
  return fn(opts);
}
