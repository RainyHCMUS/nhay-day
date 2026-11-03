// Bee — chú ong chăm chỉ cổ vũ của app. mascotSVG(mood, { look }) trả về chuỗi SVG.
// mood: 'happy' | 'party' | 'wink' | 'sad'. look: { eyes, outfit, accent } — mỗi ngày một bộ, lấy từ mascotLookFor(ngày).
// Dùng chung cho app (trình duyệt) và tools/make-icon.js (Node).
(function (root) {
  'use strict';
  let uid = 0;

  const INK = '#2A2118';
  const STAR_PATH = 'M0 -12 L2.94 -4.05 L11.41 -3.71 L4.76 1.55 L7.05 9.71 L0 5 L-7.05 9.71 L-4.76 1.55 L-11.41 -3.71 L-2.94 -4.05 Z';

  const EYES = [
    { id: 'round', name: 'Mắt tròn long lanh', e: '👀' },
    { id: 'sparkle', name: 'Mắt lấp lánh hy vọng', e: '✨' },
    { id: 'fire', name: 'Ánh mắt quyết tâm', e: '🔥' },
    { id: 'shades', name: 'Kính râm cực ngầu', e: '😎' },
    { id: 'lashes', name: 'Mi cong điệu đà', e: '💁' },
    { id: 'star', name: 'Mắt sao phấn khích', e: '🤩' },
    { id: 'heart', name: 'Mắt tim yêu đời', e: '😍' },
    { id: 'focus', name: 'Tập trung cao độ', e: '🎯' },
  ];
  const OUTFITS = [
    { id: 'band', name: 'Băng đô thể thao', e: '🎽' },
    { id: 'cap', name: 'Mũ lưỡi trai lệch', e: '🧢' },
    { id: 'towel', name: 'Khăn lau mồ hôi', e: '💦' },
    { id: 'jersey', name: 'Áo đấu số 1', e: '👕' },
    { id: 'headphones', name: 'Tai nghe quẩy nhạc', e: '🎧' },
    { id: 'crown', name: 'Vương miện vô địch', e: '👑' },
    { id: 'beanie', name: 'Mũ len quả bông', e: '🧶' },
    { id: 'bow', name: 'Nơ xinh xắn', e: '🎀' },
    { id: 'cape', name: 'Áo choàng siêu anh hùng', e: '🦸' },
    { id: 'medal', name: 'Huy chương vàng', e: '🥇' },
  ];
  const ACCENTS = ['#FF3D7F', '#0FB5A3', '#1E90FF', '#FF7A1A', '#43A047', '#E53935'];
  const DEFAULT_LOOK = { eyes: 'round', outfit: 'band', accent: '#FF3D7F' };

  // Bộ đồ của một ngày (khoá YYYY-MM-DD). Ngày liền kề luôn khác cả mắt, đồ lẫn màu.
  function mascotLookFor(key) {
    const [y, m, d] = key.split('-').map(Number);
    const n = Math.round(Date.UTC(y, m - 1, d) / 86400000);
    const outfit = OUTFITS[n % OUTFITS.length];
    const eyes = EYES[(n * 3 + 5) % EYES.length];
    return { eyes: eyes.id, outfit: outfit.id, accent: ACCENTS[(n * 5 + 2) % ACCENTS.length], eyesInfo: eyes, outfitInfo: outfit };
  }

  // ---------- Mắt (toạ độ trước khi dịch cụm mặt lên 12) ----------
  const EYE = {
    round: (x) => `<ellipse cx="${x}" cy="104" rx="8.5" ry="11" fill="${INK}"/><circle cx="${x + 3}" cy="99.5" r="3.2" fill="#fff"/>`,
    sparkle: (x) => `<ellipse cx="${x}" cy="103" rx="10" ry="12.5" fill="${INK}"/><circle cx="${x + 3.5}" cy="97.5" r="3.8" fill="#fff"/><circle cx="${x - 3}" cy="108" r="1.8" fill="#fff"/>`,
    fire: (x) => {
      const s = x < 100 ? 1 : -1;
      return `<ellipse cx="${x}" cy="105" rx="8" ry="9.5" fill="${INK}"/><circle cx="${x + 2.5}" cy="101.5" r="2.8" fill="#fff"/>` +
        `<path d="M${x - 12 * s} 89 L${x + 9 * s} 95" stroke="${INK}" stroke-width="4.5" stroke-linecap="round"/>`;
    },
    lashes: (x) => {
      const s = x < 100 ? -1 : 1;
      return EYE.round(x) +
        `<path d="M${x + 7 * s} 97 L${x + 12 * s} 92 M${x + 3 * s} 94.5 L${x + 6 * s} 88.5" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`;
    },
    star: (x) => `<path transform="translate(${x} 104)" d="${STAR_PATH}" fill="${INK}" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round"/><circle cx="${x + 2}" cy="101" r="2" fill="#fff"/>`,
    heart: (x) => `<path transform="translate(${x} 104)" d="M0 9 C-15 -1 -9 -13 0 -5 C9 -13 15 -1 0 9 Z" fill="#FF3D7F" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/><circle cx="${x - 4}" cy="99.5" r="2" fill="#fff"/>`,
    focus: (x) => `<path d="M${x - 9} 102 Q${x} 117 ${x + 9} 102 Z" fill="${INK}"/><path d="M${x - 11} 101.5 L${x + 11} 101.5" stroke="${INK}" stroke-width="4" stroke-linecap="round"/><circle cx="${x + 3}" cy="106" r="2.2" fill="#fff"/>`,
  };
  const SHADES =
    `<rect x="67" y="94" width="30" height="19" rx="8" fill="#1E1A16" stroke="${INK}" stroke-width="3"/>` +
    `<rect x="103" y="94" width="30" height="19" rx="8" fill="#1E1A16" stroke="${INK}" stroke-width="3"/>` +
    `<path d="M97 101 L103 101 M67 99 L56 95 M133 99 L144 95" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>` +
    `<path d="M73 98 L79 104 M109 98 L115 104" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity="0.75"/>`;
  const WINK_R = `<path d="M108 105 Q118 99 128 105" stroke="${INK}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
  const ARC = (x) => `<path d="M${x - 10} 108 Q${x} 95 ${x + 10} 108" stroke="${INK}" stroke-width="5" fill="none" stroke-linecap="round"/>`;

  function eyes(mood, style) {
    if (mood === 'sad') {
      return (
        `<ellipse cx="82" cy="107" rx="7.5" ry="9" fill="${INK}"/><circle cx="84.5" cy="103" r="2.6" fill="#fff"/>` +
        `<ellipse cx="118" cy="107" rx="7.5" ry="9" fill="${INK}"/><circle cx="120.5" cy="103" r="2.6" fill="#fff"/>` +
        `<path d="M70 93 L90 88 M130 93 L110 88" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`
      );
    }
    if (style === 'shades') return SHADES;
    const one = EYE[style] || EYE.round;
    if (mood === 'party') return ['heart', 'star', 'sparkle'].includes(style) ? one(82) + one(118) : ARC(82) + ARC(118);
    if (mood === 'wink') return one(82) + WINK_R;
    return one(82) + one(118);
  }

  function mouth(mood) {
    switch (mood) {
      case 'party':
        return (
          `<path d="M86 124 Q100 150 114 124 Z" fill="#6B1F3A" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>` +
          `<ellipse cx="100" cy="137" rx="7" ry="4.5" fill="#FF6F91"/>`
        );
      case 'wink':
        return `<path d="M86 126 Q101 144 116 123" stroke="${INK}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
      case 'sad':
        return `<path d="M90 135 Q100 127 110 135" stroke="${INK}" stroke-width="4.5" fill="none" stroke-linecap="round"/>`;
      default:
        return `<path d="M87 125 Q100 139 113 125" stroke="${INK}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
    }
  }

  // ---------- Trang phục: mỗi bộ vẽ ở 4 lớp (sau lưng / trên thân / trên đầu / quanh cổ) ----------
  const st = `stroke="${INK}" stroke-width="3" stroke-linejoin="round"`;
  const band = (a) =>
    `<path d="M57 76 Q100 46 143 76 L141 88 Q100 60 59 88 Z" fill="${a}" ${st}/>` +
    `<path d="M141 80 Q158 74 162 84 M141 82 Q156 88 158 98" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>`;

  function outfitLayers(outfit, a, clipId) {
    const L = { back: '', body: '', head: '', neck: '' };
    switch (outfit) {
      case 'cap':
        L.head =
          `<path d="M54 78 Q53 36 100 36 Q147 36 146 78 Q100 64 54 78 Z" fill="${a}" ${st}/>` +
          `<path d="M58 74 Q36 66 24 78 Q40 87 60 82 Z" fill="${a}" ${st}/>` +
          `<path d="M100 38 L100 68" stroke="#fff" stroke-width="3" opacity="0.55"/>` +
          `<circle cx="100" cy="37" r="4.5" fill="${a}" stroke="${INK}" stroke-width="2.5"/>`;
        break;
      case 'towel':
        L.head = band(a);
        L.neck =
          `<path d="M62 134 Q100 152 138 134 L137 147 Q100 166 63 147 Z" fill="#fff" ${st}/>` +
          `<path d="M116 150 L130 146 L134 176 L119 178 Z" fill="#fff" ${st}/>` +
          `<path d="M120 170 L133 168 M119 164 L132 162" stroke="${a}" stroke-width="3"/>`;
        break;
      case 'jersey':
        L.head = band(a);
        L.body =
          `<g clip-path="url(#${clipId})"><rect x="50" y="134" width="100" height="58" fill="${a}"/><rect x="50" y="188" width="100" height="4" fill="#fff"/></g>` +
          `<text x="100" y="182" text-anchor="middle" font-size="26" font-weight="900" fill="#fff" font-family="ui-rounded,-apple-system,Arial,sans-serif">1</text>` +
          `<ellipse cx="100" cy="166" rx="42" ry="36" fill="none" stroke="${INK}" stroke-width="3"/>`;
        break;
      case 'headphones':
        L.head =
          `<path d="M51 98 Q49 36 100 36 Q151 36 149 98" stroke="${INK}" stroke-width="10" fill="none" stroke-linecap="round"/>` +
          `<path d="M51 98 Q49 36 100 36 Q151 36 149 98" stroke="${a}" stroke-width="4.5" fill="none" stroke-linecap="round"/>` +
          `<rect x="39" y="82" width="18" height="30" rx="8" fill="${a}" ${st}/>` +
          `<rect x="143" y="82" width="18" height="30" rx="8" fill="${a}" ${st}/>` +
          `<path d="M168 58 L168 42 L180 39 L180 54" stroke="${a}" stroke-width="3" fill="none"/><circle cx="165" cy="58" r="4" fill="${a}"/><circle cx="177" cy="55" r="4" fill="${a}"/>`;
        break;
      case 'crown':
        L.head =
          `<path d="M72 58 L70 30 L86 44 L100 24 L114 44 L130 30 L128 58 Z" fill="#FFD84D" ${st}/>` +
          `<circle cx="100" cy="47" r="4.5" fill="${a}" stroke="${INK}" stroke-width="2"/>` +
          `<circle cx="84" cy="51" r="3" fill="${a}"/><circle cx="116" cy="51" r="3" fill="${a}"/>`;
        break;
      case 'beanie':
        L.head =
          `<path d="M55 72 Q53 30 100 30 Q147 30 145 72 Z" fill="${a}" ${st}/>` +
          `<path d="M66 46 L66 66 M80 38 L80 66 M94 33 L94 66 M108 33 L108 66 M122 38 L122 66 M136 46 L136 66" stroke="#fff" stroke-opacity="0.35" stroke-width="3"/>` +
          `<rect x="51" y="62" width="98" height="15" rx="7.5" fill="${a}" ${st}/>` +
          `<rect x="51" y="62" width="98" height="15" rx="7.5" fill="#fff" opacity="0.3"/>` +
          `<circle cx="100" cy="26" r="10" fill="#fff" ${st}/>`;
        break;
      case 'bow':
        L.head =
          `<path d="M126 56 C112 38 100 50 108 66 C115 64 121 60 126 56 Z" fill="${a}" ${st}/>` +
          `<path d="M126 56 C140 38 152 50 144 66 C137 64 131 60 126 56 Z" fill="${a}" ${st}/>` +
          `<circle cx="126" cy="56" r="5.5" fill="${a}" ${st}/>`;
        break;
      case 'cape':
        L.head = band(a);
        L.back = `<path d="M66 140 Q46 196 56 228 Q100 216 144 228 Q154 196 134 140 Z" fill="${a}" ${st}/>`;
        L.neck = `<circle cx="100" cy="141" r="5.5" fill="#FFD84D" ${st}/>`;
        break;
      case 'medal':
        L.head = band(a);
        L.neck =
          `<path d="M84 137 L100 163 L116 137" stroke="${a}" stroke-width="7" fill="none" stroke-linejoin="round"/>` +
          `<circle cx="100" cy="170" r="11" fill="#FFC83D" ${st}/>` +
          `<path transform="translate(100 171) scale(0.55)" d="${STAR_PATH}" fill="#fff"/>`;
        break;
      default:
        L.head = band(a);
    }
    return L;
  }

  function sparkle(x, y, s, color) {
    return `<path transform="translate(${x} ${y}) scale(${s})" d="M0 -10 Q2 -2 10 0 Q2 2 0 10 Q-2 2 -10 0 Q-2 -2 0 -10 Z" fill="${color}"/>`;
  }

  function mascotSVG(mood = 'happy', opts = {}) {
    const id = 'm' + ++uid;
    const rope = opts.rope || '#0FB5A3';
    const cls = opts.className || 'mascot';
    const look = Object.assign({}, DEFAULT_LOOK, opts.look || {});
    const a = look.accent;
    const L = outfitLayers(look.outfit, a, id + 'c');
    const extras =
      mood === 'party'
        ? `<g class="m-sparkles">${sparkle(22, 52, 1.1, '#FFC83D')}${sparkle(180, 40, 0.9, '#B8F23A')}${sparkle(186, 150, 0.7, '#FF3D7F')}${sparkle(16, 172, 0.8, '#1E90FF')}</g>`
        : '';
    return `<svg class="${cls} mood-${mood}" viewBox="0 0 200 250" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Chú ong Bee">
  <defs>
    <radialGradient id="${id}h" cx="0.38" cy="0.3" r="0.8">
      <stop offset="0" stop-color="#FFE98A"/><stop offset="0.6" stop-color="#FFCB1F"/><stop offset="1" stop-color="#F5A300"/>
    </radialGradient>
    <clipPath id="${id}c"><ellipse cx="100" cy="166" rx="42" ry="36"/></clipPath>
  </defs>
  <ellipse class="m-shadow" cx="100" cy="236" rx="42" ry="6" fill="${INK}" opacity="0.13"/>
  ${extras}
  <g class="m-jump">
    <path class="m-rope-top" d="M36 140 C20 -40 180 -40 164 140" stroke="${rope}" stroke-width="5" fill="none" stroke-linecap="round"/>
    ${L.back}
    <g class="m-wing m-wing-l"><ellipse cx="50" cy="116" rx="32" ry="18" transform="rotate(-38 50 116)" fill="#DFF4FF" fill-opacity="0.9" stroke="${INK}" stroke-width="2.5"/></g>
    <g class="m-wing m-wing-r"><ellipse cx="150" cy="116" rx="32" ry="18" transform="rotate(38 150 116)" fill="#DFF4FF" fill-opacity="0.9" stroke="${INK}" stroke-width="2.5"/></g>
    <path d="M89 196 L87 204" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
    <path d="M111 196 L113 204" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
    <g>
      <path d="M71 208 Q71 196 85 196 Q99 196 99 208 Z" fill="#fff" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <rect x="69" y="206" width="32" height="6" rx="3" fill="#B8F23A" stroke="${INK}" stroke-width="2.5"/>
      <path d="M101 208 Q101 196 115 196 Q129 196 129 208 Z" fill="#fff" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <rect x="99" y="206" width="32" height="6" rx="3" fill="#B8F23A" stroke="${INK}" stroke-width="2.5"/>
    </g>
    <path d="M62 160 Q46 154 40 144" stroke="${INK}" stroke-width="6" fill="none" stroke-linecap="round"/>
    <path d="M138 160 Q154 154 160 144" stroke="${INK}" stroke-width="6" fill="none" stroke-linecap="round"/>
    <rect x="30" y="130" width="13" height="22" rx="6.5" fill="${a}" stroke="${INK}" stroke-width="2.5"/>
    <rect x="157" y="130" width="13" height="22" rx="6.5" fill="${a}" stroke="${INK}" stroke-width="2.5"/>
    <ellipse cx="100" cy="166" rx="42" ry="36" fill="url(#${id}h)"/>
    <g clip-path="url(#${id}c)" fill="${INK}">
      <rect x="50" y="160" width="100" height="11"/>
      <rect x="50" y="182" width="100" height="11"/>
    </g>
    <ellipse cx="100" cy="166" rx="42" ry="36" fill="none" stroke="${INK}" stroke-width="3"/>
    ${L.body}
    <path d="M88 52 Q82 34 74 24" stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M112 52 Q118 34 126 24" stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round"/>
    <circle cx="73" cy="22" r="7" fill="#FF8A3D" stroke="${INK}" stroke-width="3"/>
    <circle cx="127" cy="22" r="7" fill="#FF8A3D" stroke="${INK}" stroke-width="3"/>
    <circle cx="100" cy="94" r="47" fill="url(#${id}h)" stroke="${INK}" stroke-width="3"/>
    ${L.head}
    <g transform="translate(0 -12)">
      ${eyes(mood, look.eyes)}
      <ellipse cx="67" cy="122" rx="9" ry="6" fill="#FF3D7F" opacity="0.35"/>
      <ellipse cx="133" cy="122" rx="9" ry="6" fill="#FF3D7F" opacity="0.35"/>
      ${mouth(mood)}
    </g>
    ${L.neck}
    <path class="m-rope-bottom" d="M36 140 C24 275 176 275 164 140" stroke="${rope}" stroke-width="5" fill="none" stroke-linecap="round"/>
  </g>
</svg>`;
  }

  const api = { mascotSVG, mascotLookFor, MASCOT_EYES: EYES, MASCOT_OUTFITS: OUTFITS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else Object.assign(root, api);
})(typeof window !== 'undefined' ? window : globalThis);
