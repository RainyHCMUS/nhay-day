'use strict';
// Nhảy Dây cùng Bee — mỗi ngày có clip = 1 sao. Toàn bộ dữ liệu nằm trong IndexedDB trên máy.
const APP_VERSION = '1.3.1';

const MILESTONES = [
  { days: 3, e: '🌱', name: 'Khởi động' },
  { days: 7, e: '🔥', name: '1 tuần bền bỉ' },
  { days: 14, e: '⚡', name: 'Nửa tháng sung sức' },
  { days: 21, e: '💪', name: 'Thói quen nảy mầm' },
  { days: 30, e: '🏅', name: 'Tròn 1 tháng' },
  { days: 50, e: '🚀', name: 'Nửa trăm' },
  { days: 66, e: '🧠', name: 'Thói quen thành hình' },
  { days: 100, e: '💯', name: 'Trăm ngày' },
  { days: 200, e: '👑', name: 'Chiến binh dây' },
  { days: 365, e: '🏆', name: 'Huyền thoại 1 năm' },
];

const LINES = {
  first: [
    'Chào {name}! Mình là Bee 🐝 Quay clip nhảy dây đầu tiên để nhận sao nha!',
    'Ong chăm chỉ ngày nào cũng làm việc, mình cùng nhảy dây mỗi ngày nha 🐝',
    'Mỗi ngày Bee đổi một bộ đồ mới, mai nhớ ghé xem Bee mặc gì nha 👗',
    'Ngày đầu tiên luôn là ngày ngầu nhất. Lên dây thôi! 🚀',
    'Chỉ cần 5 phút hôm nay thôi, Bee nhảy cùng bạn!',
  ],
  todo: [
    'Hôm nay mình nhảy chưa nè? 💪',
    'Giữ lửa chuỗi {n} ngày nha {name}! 🔥',
    'Dây đâu rồi? Khởi động thôi nào!',
    '5 phút nhảy dây = tim khoẻ, đầu nhẹ ✨',
    'Chuỗi {n} ngày đang chờ ngôi sao tiếp theo ⭐',
    'Nhảy xong nhớ quay clip để Bee chấm sao nha!',
    'Bee vỗ cánh sẵn rồi, {name} lên dây thôi! 🐝',
    'Chăm chỉ như ong, mỗi ngày một chút là thành thói quen 🍯',
  ],
  late: [
    'Còn kịp mà! Nhảy nhanh 5 phút rồi đi ngủ nha 🌙',
    'Đừng để chuỗi {n} ngày đứt nha {name}, cố lên! 🔥',
    'Tối rồi nhưng sao vẫn còn đó, nhảy liền nè ⭐',
  ],
  done: [
    'Đỉnh quá {name}! Thêm 1 sao rồi ⭐',
    'Chuỗi {n} ngày, bạn đang cháy lắm đó 🔥',
    'Xong bài hôm nay! Nhớ uống nước nha 💧',
    'Mai gặp lại nha, Bee chờ đó! 😎',
    'Thêm một giọt mật ngọt vào hũ chuỗi rồi 🍯',
    'Bạn chăm hơn cả ong luôn đó {name}! 🐝',
    'Cơ thể cảm ơn bạn đó, {name} ơi 💖',
  ],
  broken: [
    'Không sao hết! Bắt đầu lại từ hôm nay nhé 💛',
    'Ngã thì đứng dậy, đứt chuỗi thì nối lại! 💪',
    'Kỷ lục {best} ngày vẫn còn đó, mình phá nó nha!',
    'Ong cũng có ngày nghỉ, giờ mình bay tiếp thôi 🐝',
  ],
};

// ---------- Ngày giờ ----------
const pad = (n) => String(n).padStart(2, '0');
const keyOf = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseKey = (k) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (k, n) => { const d = parseKey(k); d.setDate(d.getDate() + n); return keyOf(d); };
const todayKey = () => keyOf(new Date());
const WD_SHORT = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const WD_LONG = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
const fmtShort = (k) => { const d = parseKey(k); return `${WD_SHORT[d.getDay()]} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}`; };
const fmtLong = (k) => { const d = parseKey(k); return `${WD_LONG[d.getDay()]}, ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`; };
function fmtDur(s) {
  s = Math.round(s || 0);
  if (!s) return '—';
  const m = Math.floor(s / 60), r = s % 60;
  return m ? `${m}:${pad(r)}` : `${r} giây`;
}
function fmtTotal(s) {
  const mins = Math.round((s || 0) / 60);
  if (mins < 60) return `${mins} phút`;
  return `${Math.floor(mins / 60)} giờ ${mins % 60} phút`;
}

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const $ = (sel, el = document) => el.querySelector(sel);
const STAR = '<svg aria-hidden="true"><use href="#star"/></svg>';

// ---------- IndexedDB ----------
const DB = (() => {
  let dbp;
  function open() {
    if (!dbp) {
      dbp = new Promise((res, rej) => {
        const r = indexedDB.open('nhay-day', 1);
        r.onupgradeneeded = () => {
          const db = r.result;
          db.createObjectStore('clips', { keyPath: 'id' });
          db.createObjectStore('videos');
          db.createObjectStore('kv');
        };
        r.onsuccess = () => res(r.result);
        r.onerror = () => rej(r.error);
      });
    }
    return dbp;
  }
  async function run(store, mode, fn) {
    const db = await open();
    return new Promise((res, rej) => {
      const t = db.transaction(store, mode);
      const req = fn(t.objectStore(store));
      let out;
      if (req) req.onsuccess = () => { out = req.result; };
      t.oncomplete = () => res(out);
      t.onerror = () => rej(t.error);
      t.onabort = () => rej(t.error);
    });
  }
  return {
    all: (s) => run(s, 'readonly', (st) => st.getAll()),
    get: (s, k) => run(s, 'readonly', (st) => st.get(k)),
    put: (s, v, k) => run(s, 'readwrite', (st) => (k === undefined ? st.put(v) : st.put(v, k))),
    del: (s, k) => run(s, 'readwrite', (st) => st.delete(k)),
    clear: (s) => run(s, 'readwrite', (st) => st.clear()),
  };
})();

// ---------- Trạng thái ----------
const state = {
  name: '',
  keepVideo: false,
  badges: [],
  clips: [],
  tab: 'home',
  calMonth: null, // Date ngày 1 của tháng đang xem
  mood: 'happy',
  line: '',
  pendingDate: null,
};

// Bee mỗi ngày một ánh mắt + bộ đồ (cố định trong ngày, đổi khi sang ngày mới)
const todayLook = () => mascotLookFor(todayKey());
const bee = (mood) => mascotSVG(mood, { look: todayLook() });

const starDates = () => new Set(state.clips.map((c) => c.date));

function streakInfo() {
  const s = starDates();
  const t = todayKey();
  const y = addDays(t, -1);
  const end = s.has(t) ? t : s.has(y) ? y : null;
  let cur = 0;
  for (let k = end; k && s.has(k); k = addDays(k, -1)) cur++;
  let best = 0, run = 0, prev = null;
  for (const k of [...s].sort()) {
    run = prev && addDays(prev, 1) === k ? run + 1 : 1;
    best = Math.max(best, run);
    prev = k;
  }
  return { cur, best, total: s.size, doneToday: s.has(t), alive: !!end };
}

let lastLine = '';
function pickLine(info) {
  let pool;
  if (info.total === 0) pool = LINES.first;
  else if (info.doneToday) pool = LINES.done;
  else if (info.alive) pool = new Date().getHours() >= 20 ? LINES.late : LINES.todo;
  else pool = LINES.broken;
  const choices = pool.length > 1 ? pool.filter((l) => l !== lastLine) : pool;
  lastLine = choices[Math.floor(Math.random() * choices.length)];
  return lastLine
    .replaceAll('{name}', state.name || 'bạn')
    .replaceAll('{n}', info.cur)
    .replaceAll('{best}', info.best);
}

function moodFor(info) {
  if (info.doneToday) return 'party';
  if (info.total > 0 && !info.alive) return 'sad';
  return info.total === 0 ? 'happy' : 'wink';
}

// ---------- Hiển thị ----------
function render() {
  if (!state.name) return renderWelcome();
  document.body.classList.remove('onboarding');
  renderHome();
  renderCal();
  renderStats();
}

function isStandalone() {
  return navigator.standalone === true || matchMedia('(display-mode: standalone)').matches;
}
function isIOS() {
  return /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}
function tipDismissed() { try { return localStorage.getItem('nd-tip') === '1'; } catch { return false; } }

function renderWelcome() {
  document.body.classList.add('onboarding');
  $('#tab-home').innerHTML = `
    <div class="welcome">
      ${bee('party')}
      <h1>Nhảy dây cùng <em>Bee</em></h1>
      <p>Mỗi ngày nhảy dây, thêm clip vào app là nhận 1 ⭐. Giữ chuỗi càng dài, huy hiệu càng xịn!</p>
      <div class="rules">
        <div>🎬 Quay clip bằng app Camera như bình thường</div>
        <div>⭐ Thêm clip vào app → ngày đó có 1 sao</div>
        <div>🔥 Ngày nào cũng có sao → chuỗi tăng dần</div>
        <div>📱 Dữ liệu chỉ nằm trên iPhone của bạn</div>
      </div>
      <input class="field" id="w-name" placeholder="Tên của bạn là gì?" maxlength="24" autocomplete="given-name">
      <button class="btn" id="w-go">Bắt đầu thôi! 🚀</button>
    </div>`;
  const go = async () => {
    const v = $('#w-name').value.trim();
    if (!v) { $('#w-name').focus(); toast('Cho Bee biết tên bạn nha 😊'); return; }
    state.name = v.slice(0, 24);
    await DB.put('kv', state.name, 'name');
    render();
  };
  $('#w-go').onclick = go;
  $('#w-name').onkeydown = (e) => { if (e.key === 'Enter') go(); };
}

function renderHome() {
  const info = streakInfo();
  state.mood = moodFor(info);
  state.line = pickLine(info);
  const t = todayKey();
  const s = starDates();
  const now = new Date();

  const week = [];
  for (let i = 6; i >= 0; i--) {
    const k = addDays(t, -i);
    const d = parseKey(k);
    week.push(`<div><div class="wd">${WD_SHORT[d.getDay()]}</div><div class="dot ${s.has(k) ? 'on' : ''} ${k === t ? 'today' : ''}">${s.has(k) ? STAR : d.getDate()}</div></div>`);
  }

  const next = MILESTONES.find((m) => m.days > info.cur);
  const nextHTML = next
    ? `<div class="card"><div class="next"><div class="badge-emoji">${next.e}</div><div class="txt">Còn ${next.days - info.cur} ngày tới “${esc(next.name)}”<small>Chuỗi ${info.cur}/${next.days} ngày</small><div class="bar"><i style="width:${Math.round((info.cur / next.days) * 100)}%"></i></div></div></div></div>`
    : `<div class="card"><div class="next"><div class="badge-emoji">🏆</div><div class="txt">Bạn đã chinh phục mọi huy hiệu! Huyền thoại thật sự!</div></div></div>`;

  const tip = isIOS() && !isStandalone() && !tipDismissed()
    ? `<div class="install-tip"><div>📲 <b>Cài app:</b> bấm <b>Chia sẻ</b> → <b>Thêm vào MH chính</b>, rồi mở app bằng icon. Dữ liệu chỉ lưu trong app đã cài.</div><button id="tip-x" aria-label="Ẩn">✕</button></div>`
    : '';

  const cta = info.doneToday
    ? `<button class="cta done" id="add-btn">✅ Hôm nay đã có sao · Thêm clip nữa</button>`
    : `<button class="cta" id="add-btn"><span class="cta-big">🎬</span><span>Thêm clip hôm nay<span class="sub">Nhận ngay 1 ⭐</span></span></button>`;

  $('#tab-home').innerHTML = `
    <div class="top">
      <div><h1 class="hello">Chào ${esc(state.name)} 👋</h1><div class="subdate">${WD_LONG[now.getDay()]}, ${pad(now.getDate())}/${pad(now.getMonth() + 1)}</div></div>
      <button class="iconbtn" id="settings-btn" aria-label="Cài đặt">⚙️</button>
    </div>
    ${tip}
    <div class="hero">
      <div id="mascot-slot">${bee(state.mood)}</div>
      <div class="bubble" id="bubble">${esc(state.line)}</div>
    </div>
    <div class="streak">
      <div class="streak-row">
        <div class="flame ${info.cur ? '' : 'off'}">🔥</div>
        <div><div class="streak-num" id="streak-num">${info.cur}</div><div class="streak-label">${info.cur ? 'ngày liên tiếp' : 'Bắt đầu chuỗi mới hôm nay!'}</div></div>
      </div>
      <div class="streak-meta"><span class="chip-w">🏆 Kỷ lục ${info.best}</span><span class="chip-w">⭐ Tổng ${info.total} sao</span></div>
    </div>
    ${cta}
    <div class="card"><h3>7 ngày gần nhất</h3><div class="week">${week.join('')}</div></div>
    ${nextHTML}`;

  $('#add-btn').onclick = () => startAdd(null);
  $('#settings-btn').onclick = openSettings;
  const tx = $('#tip-x');
  if (tx) tx.onclick = () => { try { localStorage.setItem('nd-tip', '1'); } catch {} tx.parentElement.remove(); };
  $('#mascot-slot').onclick = () => {
    const m = $('#mascot-slot .mascot');
    m.classList.remove('boing'); void m.getBoundingClientRect(); m.classList.add('boing');
    say(pickLine(streakInfo()));
  };
}

function say(text, mood) {
  const b = $('#bubble');
  if (!b) return;
  b.textContent = text;
  b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop');
  if (mood && mood !== state.mood) {
    state.mood = mood;
    $('#mascot-slot').innerHTML = bee(mood);
  }
}

function renderCal() {
  if (!state.calMonth) { const n = new Date(); state.calMonth = new Date(n.getFullYear(), n.getMonth(), 1); }
  const m = state.calMonth;
  const y = m.getFullYear(), mo = m.getMonth();
  const days = new Date(y, mo + 1, 0).getDate();
  const lead = (m.getDay() + 6) % 7; // tuần bắt đầu thứ hai
  const t = todayKey();
  const s = starDates();
  const cells = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((w) => `<div class="wd center">${w}</div>`);
  for (let i = 0; i < lead; i++) cells.push('<div class="day empty"></div>');
  let count = 0, elapsed = 0;
  for (let d = 1; d <= days; d++) {
    const k = keyOf(new Date(y, mo, d));
    const on = s.has(k);
    const future = k > t;
    if (on) count++;
    if (!future) elapsed++;
    cells.push(`<button class="day ${on ? 'on' : ''} ${k === t ? 'today' : ''} ${future ? 'future' : ''}" data-day="${k}" ${future ? 'disabled' : ''}>${on ? STAR + `<span>${d}</span>` : d}</button>`);
  }
  const nowMonth = new Date(); nowMonth.setDate(1); nowMonth.setHours(0, 0, 0, 0);
  const isCurrent = y === nowMonth.getFullYear() && mo === nowMonth.getMonth();
  $('#tab-cal').innerHTML = `
    <div class="cal-head">
      <button class="iconbtn" id="cal-prev" aria-label="Tháng trước">‹</button>
      <h2>Tháng ${mo + 1}/${y}</h2>
      <button class="iconbtn" id="cal-next" aria-label="Tháng sau" ${isCurrent ? 'disabled style="opacity:.35"' : ''}>›</button>
    </div>
    <p class="cal-sum center">⭐ ${count}/${elapsed} ngày có sao${elapsed ? ` · ${Math.round((count / elapsed) * 100)}%` : ''}</p>
    <div class="cal">${cells.join('')}</div>
    <div class="legend"><span>⭐ Có clip</span><span>⭕ Hôm nay</span><span>Bấm ngày để xem</span></div>`;
  $('#cal-prev').onclick = () => { state.calMonth = new Date(y, mo - 1, 1); renderCal(); };
  $('#cal-next').onclick = () => { if (!isCurrent) { state.calMonth = new Date(y, mo + 1, 1); renderCal(); } };
  $('#tab-cal').querySelectorAll('[data-day]').forEach((b) => { b.onclick = () => openDay(b.dataset.day); });
}

function renderStats() {
  const info = streakInfo();
  const totalSec = state.clips.reduce((a, c) => a + (c.duration || 0), 0);
  const totalJumps = state.clips.reduce((a, c) => a + (c.jumps || 0), 0);
  const badges = MILESTONES.map((m) => {
    const got = state.badges.includes(m.days);
    return `<div class="badge ${got ? 'got' : 'locked'}"><div class="e">${m.e}</div><div class="n">${esc(m.name)}</div><div class="d">${m.days} ngày</div></div>`;
  }).join('');
  $('#tab-stats').innerHTML = `
    <div class="top"><h1 class="hello">Thành tích 🏆</h1><button class="iconbtn" id="settings-btn2" aria-label="Cài đặt">⚙️</button></div>
    <div class="stats">
      <div class="stat hot"><div class="v">🔥 ${info.cur}</div><div class="k">Chuỗi hiện tại</div></div>
      <div class="stat"><div class="v">🏆 ${info.best}</div><div class="k">Chuỗi dài nhất</div></div>
      <div class="stat"><div class="v">⭐ ${info.total}</div><div class="k">Tổng số sao</div></div>
      <div class="stat"><div class="v">🎬 ${state.clips.length}</div><div class="k">Clip đã thêm</div></div>
      <div class="stat"><div class="v">⏱️ ${fmtTotal(totalSec)}</div><div class="k">Tổng thời gian clip</div></div>
      <div class="stat"><div class="v">🪢 ${totalJumps.toLocaleString('vi-VN')}</div><div class="k">Tổng lần nhảy đã ghi</div></div>
    </div>
    <div class="card"><h3>Huy hiệu chuỗi (${state.badges.length}/${MILESTONES.length})</h3><div class="badges">${badges}</div></div>
    <div class="version">Nhảy Dây cùng Bee · v${APP_VERSION}</div>`;
  $('#settings-btn2').onclick = openSettings;
}

// ---------- Sheet & toast ----------
let sheetCleanup = null;
function openSheet(html, onClose) {
  if (sheetCleanup) { const f = sheetCleanup; sheetCleanup = null; f(); }
  $('#sheet-body').innerHTML = html;
  $('#sheet').hidden = false;
  sheetCleanup = onClose || null;
}
function closeSheet() {
  $('#sheet').hidden = true;
  $('#sheet-body').innerHTML = '';
  if (sheetCleanup) { const f = sheetCleanup; sheetCleanup = null; f(); }
}
document.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) closeSheet(); });

let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}

function confetti(n = 90) {
  const colors = ['#FF7A1A', '#FFB020', '#FFD84D', '#B8F23A', '#0FB5A3', '#1E90FF'];
  const wrap = document.createElement('div');
  wrap.className = 'confetti';
  for (let i = 0; i < n; i++) {
    const p = document.createElement('i');
    p.style.left = Math.random() * 100 + '%';
    p.style.background = colors[i % colors.length];
    p.style.setProperty('--dx', (Math.random() * 160 - 80) + 'px');
    p.style.setProperty('--r', (Math.random() * 900 - 450) + 'deg');
    p.style.animationDuration = (1.8 + Math.random() * 1.6) + 's';
    p.style.animationDelay = Math.random() * 0.4 + 's';
    if (i % 3 === 0) p.style.borderRadius = '50%';
    wrap.appendChild(p);
  }
  document.body.appendChild(wrap);
  setTimeout(() => wrap.remove(), 4200);
}

// ---------- Thêm clip ----------
function startAdd(date) {
  state.pendingDate = date;
  const input = $('#pick-video');
  input.value = '';
  input.click();
}

$('#pick-video').addEventListener('change', async (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  openSheet(`<h2>Đang đọc clip…</h2><p class="lead">Bee đang xem clip của bạn 👀</p><div class="spinner"></div>`);
  const meta = await readVideo(file);
  showConfirm(file, meta);
});

function readVideo(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const v = document.createElement('video');
    v.muted = true;
    v.playsInline = true;
    v.preload = 'auto';
    let done = false;
    const finish = (thumb) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      const duration = Number.isFinite(v.duration) ? v.duration : 0;
      v.removeAttribute('src');
      v.load();
      URL.revokeObjectURL(url);
      resolve({ duration, thumb });
    };
    const timer = setTimeout(() => finish(null), 8000);
    v.addEventListener('loadedmetadata', () => {
      v.currentTime = Math.min(1, (Number.isFinite(v.duration) ? v.duration : 2) / 2);
    }, { once: true });
    v.addEventListener('seeked', () => {
      try {
        const w = 360;
        const h = v.videoWidth ? Math.round((w * v.videoHeight) / v.videoWidth) : 480;
        const c = document.createElement('canvas');
        c.width = w; c.height = h;
        c.getContext('2d').drawImage(v, 0, 0, w, h);
        finish(c.toDataURL('image/jpeg', 0.72));
      } catch { finish(null); }
    }, { once: true });
    v.addEventListener('error', () => finish(null), { once: true });
    v.src = url;
    v.load();
  });
}

function showConfirm(file, meta) {
  const t = todayKey();
  const y = addDays(t, -1);
  let date = state.pendingDate === y ? y : t;
  const s = starDates();
  const thumb = meta.thumb ? `<img src="${meta.thumb}" alt="">` : '<div class="thumb-ph">🎬</div>';
  const choice = (k, label) => `<button class="choice ${k === date ? 'sel' : ''}" data-date="${k}">${label}<small>${fmtShort(k)}${s.has(k) ? ' · đã có ⭐' : ''}</small></button>`;
  openSheet(`
    <h2>Nhận sao nào! ⭐</h2>
    <p class="lead">Kiểm tra lại rồi bấm nhận sao nha.</p>
    <div class="preview">${thumb}<div><div class="pv-t">Clip nhảy dây</div><div class="pv-s">⏱️ ${fmtDur(meta.duration)} · ${(file.size / 1048576).toFixed(1)} MB</div></div></div>
    <label class="f">Tính sao cho ngày</label>
    <div class="choices">${choice(t, 'Hôm nay')}${choice(y, 'Hôm qua')}</div>
    <p class="note" id="day-note"></p>
    <label class="f" for="jumps">Số lần nhảy <span style="color:var(--muted);font-weight:600">(không bắt buộc)</span></label>
    <input class="field" id="jumps" type="number" inputmode="numeric" min="0" max="100000" placeholder="Ví dụ: 300">
    <button class="btn" id="claim">Nhận sao ⭐</button>
    ${state.keepVideo ? '<p class="note center">Bản sao clip sẽ được lưu trong app để xem lại.</p>' : ''}`);

  const updNote = () => {
    $('#day-note').textContent = s.has(date) ? 'Ngày này đã có sao rồi, clip sẽ được thêm vào bộ sưu tập của ngày.' : '';
    $('#sheet-body').querySelectorAll('[data-date]').forEach((b) => b.classList.toggle('sel', b.dataset.date === date));
  };
  $('#sheet-body').querySelectorAll('[data-date]').forEach((b) => { b.onclick = () => { date = b.dataset.date; updNote(); }; });
  updNote();
  $('#claim').onclick = async () => {
    $('#claim').disabled = true;
    const j = Math.max(0, Math.min(100000, parseInt($('#jumps').value, 10) || 0));
    await saveClip(file, meta, date, j);
  };
}

async function saveClip(file, meta, date, jumps) {
  const before = streakInfo();
  const hadStar = starDates().has(date);
  const clip = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    date,
    addedAt: Date.now(),
    duration: Math.round(meta.duration || 0),
    thumb: meta.thumb || null,
    jumps,
    hasVideo: false,
  };
  if (state.keepVideo) {
    try {
      await DB.put('videos', file, clip.id);
      clip.hasVideo = true;
    } catch {
      toast('Không đủ chỗ lưu bản sao clip, chỉ lưu ảnh thu nhỏ');
    }
  }
  try {
    await DB.put('clips', clip);
  } catch {
    toast('Không lưu được, iPhone có thể đã đầy bộ nhớ 😢');
    closeSheet();
    return;
  }
  state.clips.push(clip);
  closeSheet();

  const after = streakInfo();
  const newly = MILESTONES.filter((m) => after.best >= m.days && !state.badges.includes(m.days));
  if (newly.length) {
    state.badges.push(...newly.map((m) => m.days));
    await DB.put('kv', state.badges, 'badges');
  }
  showTab('home');
  render();
  if (!hadStar) {
    const n = $('#streak-num');
    if (n) n.classList.add('bump');
    confetti(newly.length ? 140 : 70);
    say(after.cur > before.cur && after.cur > 1 ? `Chuỗi lên ${after.cur} ngày rồi! Quá đỉnh 🔥` : `+1 ⭐ cho ${fmtShort(date)}! Giỏi lắm ${state.name}!`, 'party');
  } else {
    toast('Đã thêm clip vào ngày ' + fmtShort(date));
  }
  if (newly.length) setTimeout(() => celebrate(newly[newly.length - 1]), 900);
}

function celebrate(m) {
  openSheet(`
    <div class="celebrate">
      ${bee('party')}
      <div class="big-e">${m.e}</div>
      <h2>Huy hiệu mới: ${esc(m.name)}!</h2>
      <p class="lead">Chuỗi ${m.days} ngày liên tiếp. ${m.days >= 66 ? 'Nhảy dây giờ là thói quen của bạn rồi đó!' : 'Cứ thế mà giữ lửa nha!'}</p>
      <button class="btn" data-close>Tuyệt vời! 🎉</button>
    </div>`);
  confetti(120);
}

// ---------- Xem một ngày ----------
async function openDay(k) {
  const clips = state.clips.filter((c) => c.date === k).sort((a, b) => a.addedAt - b.addedAt);
  const t = todayKey();
  const canAdd = k === t || k === addDays(t, -1);
  const list = clips.map((c) => `
    <div class="clip" data-id="${esc(c.id)}">
      ${c.thumb ? `<img class="thumb-ph" src="${esc(c.thumb)}" alt="">` : '<div class="thumb-ph">🎬</div>'}
      <div class="info"><div class="pv-t">⏱️ ${fmtDur(c.duration)}${c.jumps ? ` · 🪢 ${c.jumps}` : ''}</div><div class="pv-s">Thêm lúc ${new Date(c.addedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</div></div>
      <div class="acts">${c.hasVideo ? '<button data-act="play" aria-label="Xem clip">▶️</button>' : ''}<button data-act="del" aria-label="Xoá clip">🗑️</button></div>
    </div>`).join('');
  let objUrl = null;
  openSheet(`
    <h2>${clips.length ? '⭐ ' : ''}${fmtLong(k)}</h2>
    <p class="lead">${clips.length ? `${clips.length} clip trong ngày này` : 'Ngày này chưa có clip.'}</p>
    <div id="player-slot"></div>
    ${list}
    ${canAdd ? `<button class="btn" id="day-add">🎬 Thêm clip cho ngày này</button>` : ''}
    ${!clips.length && !canAdd ? '<p class="note">Chỉ thêm được clip cho hôm nay và hôm qua thôi nha.</p>' : ''}`,
  () => { if (objUrl) URL.revokeObjectURL(objUrl); });
  const add = $('#day-add');
  if (add) add.onclick = () => { closeSheet(); startAdd(k); };
  $('#sheet-body').querySelectorAll('.clip').forEach((row) => {
    const id = row.dataset.id;
    row.querySelectorAll('[data-act]').forEach((b) => {
      b.onclick = async () => {
        if (b.dataset.act === 'play') {
          const blob = await DB.get('videos', id);
          if (!blob) { toast('Không tìm thấy bản sao clip'); return; }
          if (objUrl) URL.revokeObjectURL(objUrl);
          objUrl = URL.createObjectURL(blob);
          $('#player-slot').innerHTML = `<video class="player" src="${objUrl}" controls playsinline autoplay></video>`;
        } else if (confirm('Xoá clip này? Nếu đây là clip duy nhất của ngày, ngày đó sẽ mất sao.')) {
          await DB.del('clips', id);
          await DB.del('videos', id);
          state.clips = state.clips.filter((c) => c.id !== id);
          render();
          openDay(k);
          toast('Đã xoá clip');
        }
      };
    });
  });
}

// ---------- Cài đặt, sao lưu ----------
async function openSettings() {
  let usage = '';
  try {
    const est = await navigator.storage.estimate();
    usage = `Đang dùng ${(est.usage / 1048576).toFixed(1)} MB trên iPhone`;
  } catch {}
  openSheet(`
    <h2>Cài đặt ⚙️</h2>
    <label class="f" for="s-name">Tên của bạn</label>
    <input class="field" id="s-name" maxlength="24" value="${esc(state.name)}">
    <div class="row">
      <div><div class="rt">Lưu bản sao clip trong app</div><div class="rs">Để xem lại clip ngay trên lịch. Tốn thêm dung lượng vì clip gốc vẫn nằm trong app Ảnh.</div></div>
      <label class="switch"><input type="checkbox" id="s-keep" ${state.keepVideo ? 'checked' : ''}><span></span></label>
    </div>
    <div class="row"><div><div class="rt">Sao lưu dữ liệu</div><div class="rs">Xuất sao, chuỗi, ảnh thu nhỏ ra 1 file (không kèm video). Lưu file vào app Tệp nha.</div></div></div>
    <button class="btn small" id="s-export">💾 Sao lưu ngay</button>
    <button class="btn ghost small" id="s-import">📂 Khôi phục từ file sao lưu</button>
    <button class="btn danger small" id="s-wipe">🗑️ Xoá toàn bộ dữ liệu</button>
    <p class="note center">${esc(usage)}${usage ? ' · ' : ''}Phiên bản ${APP_VERSION}</p>`);
  const nameInput = $('#s-name');
  nameInput.onchange = async () => {
    const v = nameInput.value.trim().slice(0, 24);
    if (!v) { nameInput.value = state.name; return; }
    state.name = v;
    await DB.put('kv', v, 'name');
    render();
    toast('Đã đổi tên');
  };
  $('#s-keep').onchange = async (e) => {
    state.keepVideo = e.target.checked;
    await DB.put('kv', state.keepVideo, 'keepVideo');
    toast(state.keepVideo ? 'Từ giờ clip mới sẽ được lưu bản sao' : 'Đã tắt lưu bản sao clip');
  };
  $('#s-export').onclick = exportBackup;
  $('#s-import').onclick = () => { $('#pick-backup').value = ''; $('#pick-backup').click(); };
  $('#s-wipe').onclick = wipeAll;
}

async function exportBackup() {
  const data = {
    app: 'nhay-day',
    format: 1,
    version: APP_VERSION,
    exportedAt: new Date().toISOString(),
    name: state.name,
    badges: state.badges,
    clips: state.clips.map(({ hasVideo, ...c }) => c),
  };
  const fname = `nhay-day-sao-luu-${todayKey()}.json`;
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  const file = new File([blob], fname, { type: 'application/json' });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'Sao lưu Nhảy Dây' });
      return;
    } catch (err) {
      if (err && err.name === 'AbortError') return;
    }
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = fname;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

$('#pick-backup').addEventListener('change', async (e) => {
  const f = e.target.files && e.target.files[0];
  if (!f) return;
  let data;
  try { data = JSON.parse(await f.text()); } catch { toast('File này không đọc được'); return; }
  if (!data || data.app !== 'nhay-day' || !Array.isArray(data.clips)) { toast('Đây không phải file sao lưu của app Nhảy Dây'); return; }
  const have = new Set(state.clips.map((c) => c.id));
  const clean = data.clips.filter((c) => c && typeof c.id === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(c.date) && !have.has(c.id)).map((c) => ({
    id: c.id.slice(0, 40),
    date: c.date,
    addedAt: Number(c.addedAt) || Date.now(),
    duration: Math.max(0, Number(c.duration) || 0),
    thumb: typeof c.thumb === 'string' && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(c.thumb) ? c.thumb : null,
    jumps: Math.max(0, Math.min(100000, parseInt(c.jumps, 10) || 0)),
    hasVideo: false,
  }));
  if (!confirm(`Khôi phục ${clean.length} clip từ file sao lưu? Dữ liệu đang có vẫn được giữ.`)) return;
  for (const c of clean) await DB.put('clips', c);
  state.clips.push(...clean);
  if (Array.isArray(data.badges)) {
    const b = new Set(state.badges);
    data.badges.forEach((d) => { if (MILESTONES.some((m) => m.days === d)) b.add(d); });
    state.badges = [...b];
    await DB.put('kv', state.badges, 'badges');
  }
  if (!state.name && typeof data.name === 'string') {
    state.name = data.name.slice(0, 24);
    await DB.put('kv', state.name, 'name');
  }
  closeSheet();
  render();
  toast(`Đã khôi phục ${clean.length} clip ⭐`);
});

async function wipeAll() {
  if (!confirm('Xoá TOÀN BỘ sao, chuỗi và clip trong app? Không thể hoàn tác.')) return;
  if (!confirm('Chắc chắn chưa? Nên bấm "Sao lưu ngay" trước đó nha.')) return;
  await DB.clear('clips');
  await DB.clear('videos');
  await DB.clear('kv');
  Object.assign(state, { name: '', keepVideo: false, badges: [], clips: [] });
  closeSheet();
  showTab('home');
  render();
}

// ---------- Tab ----------
function showTab(name) {
  state.tab = name;
  document.querySelectorAll('.tab').forEach((s) => s.classList.toggle('is-active', s.id === 'tab-' + name));
  document.querySelectorAll('.tabbtn').forEach((b) => b.classList.toggle('is-active', b.dataset.tab === name));
  window.scrollTo(0, 0);
}
document.querySelectorAll('.tabbtn').forEach((b) => { b.onclick = () => showTab(b.dataset.tab); });

// Qua nửa đêm khi app vẫn mở: vẽ lại để "hôm nay" đúng ngày
let renderedDay = todayKey();
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && todayKey() !== renderedDay) {
    renderedDay = todayKey();
    state.calMonth = null;
    render();
  }
});

// ---------- Khởi động ----------
(async function init() {
  try {
    const [name, keep, badges, clips] = await Promise.all([
      DB.get('kv', 'name'), DB.get('kv', 'keepVideo'), DB.get('kv', 'badges'), DB.all('clips'),
    ]);
    state.name = name || '';
    state.keepVideo = !!keep;
    state.badges = Array.isArray(badges) ? badges : [];
    state.clips = clips || [];
  } catch {
    toast('Không mở được bộ nhớ của app 😢');
  }
  render();
  try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch {}
  if ('serviceWorker' in navigator && window.isSecureContext) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
})();
