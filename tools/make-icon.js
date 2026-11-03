// Tạo icon app từ chú ong Bee: node tools/make-icon.js (sau đó tools/make-icons.sh xuất PNG)
const fs = require('fs');
const path = require('path');
const { mascotSVG } = require('../mascot.js');

const raw = mascotSVG('happy', { rope: '#FFFFFF' })
  .replace(/<path class="m-rope-bottom"[^>]*\/>/, '');
const inner = raw.slice(raw.indexOf('>') + 1, raw.lastIndexOf('</svg>'));

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#12C2A9"/><stop offset="1" stop-color="#1E90FF"/>
    </linearGradient>
  </defs>
  <rect width="1024" height="1024" fill="url(#bg)"/>
  <circle cx="512" cy="560" r="400" fill="#fff" opacity="0.10"/>
  <circle cx="512" cy="560" r="300" fill="#fff" opacity="0.08"/>
  <path transform="translate(850 190) scale(4.2)" d="M0 -10 Q2 -2 10 0 Q2 2 0 10 Q-2 2 -10 0 Q-2 -2 0 -10 Z" fill="#FFC83D"/>
  <path transform="translate(175 260) scale(2.6)" d="M0 -10 Q2 -2 10 0 Q2 2 0 10 Q-2 2 -10 0 Q-2 -2 0 -10 Z" fill="#fff"/>
  <g transform="translate(162 100) scale(3.5)">${inner}</g>
</svg>`;

fs.writeFileSync(path.join(__dirname, '..', 'icons', 'icon.svg'), svg);
console.log('icons/icon.svg OK');
