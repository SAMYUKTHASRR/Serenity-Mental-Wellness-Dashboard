/* ─────────────────────────────────────────
   SERENITY — Mental Wellness Dashboard
   script.js · shared across all pages
───────────────────────────────────────── */

/* ── Clock ── */
function updateClock() {
  const now  = new Date();
  let h      = now.getHours();
  const m    = now.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  const badge = document.getElementById('clockBadge');
  if (badge) {
    badge.textContent =
      (h < 10 ? '0' + h : h) + ':' + (m < 10 ? '0' + m : m) + ' ' + ampm;
  }
}
setInterval(updateClock, 1000);
updateClock();


/* ── Toast ── */
let toastTimer = null;
function showToast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
}


/* ── Mood Tracker (dashboard.html) ── */
let moodLog = [];

function logMood(emoji, label, btn) {
  document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  const now  = new Date();
  const time = now.getHours() + ':' + (now.getMinutes() < 10 ? '0' : '') + now.getMinutes();

  moodLog.unshift({ emoji, label, time });
  if (moodLog.length > 5) moodLog.pop();

  const statMood = document.getElementById('stat-mood');
  if (statMood) statMood.textContent = emoji;
  bumpStat('stat-mood');
  renderMoodHistory();
  showToast(emoji + '  Mood logged — feeling ' + label.toLowerCase());
}

function renderMoodHistory() {
  const el = document.getElementById('moodHistory');
  if (!el) return;
  if (!moodLog.length) {
    el.innerHTML = '<span class="mood-empty">No entries yet — tap a mood above</span>';
    return;
  }
  el.innerHTML = moodLog
    .map(m => `<span class="mood-chip">${m.emoji} <span>${m.label}</span> · ${m.time}</span>`)
    .join('');
}

function bumpStat(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.transform = 'scale(1.25)';
  setTimeout(() => { el.style.transform = 'scale(1)'; }, 220);
}


/* ── Focus Timer (dashboard.html) ── */
const FOCUS_CIRC     = 439.8; // 2 * PI * 70
let focusInterval     = null;
let focusSeconds      = 25 * 60;
let focusTotalSeconds = 25 * 60;
let focusRunning      = false;
let sessionsCompleted = 0;
let currentMode       = 'long';

function setMode(mode) {
  if (focusRunning) return;
  currentMode       = mode;
  focusSeconds      = mode === 'short' ? 5 * 60 : 25 * 60;
  focusTotalSeconds = focusSeconds;
  updateFocusDisplay();
  updateFocusRing();
  const label = document.getElementById('focusLabel');
  if (label) label.textContent = mode === 'short' ? 'Break · Ready' : 'Pomodoro · Ready';
}

function updateFocusDisplay() {
  const el = document.getElementById('focusTime');
  if (!el) return;
  const m = Math.floor(focusSeconds / 60);
  const s = focusSeconds % 60;
  el.textContent = (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
}

function updateFocusRing() {
  const ring = document.getElementById('focusProgress');
  if (!ring) return;
  const progress = focusTotalSeconds > 0 ? (focusTotalSeconds - focusSeconds) / focusTotalSeconds : 0;
  ring.style.strokeDashoffset = FOCUS_CIRC * (1 - progress);
}

function updateRings() {
  document.querySelectorAll('.ring').forEach((r, i) => {
    r.className = 'ring';
    if (i < sessionsCompleted % 4)          r.classList.add('done');
    else if (focusRunning && i === sessionsCompleted % 4) r.classList.add('active');
  });
}

function toggleFocus() {
  const btn   = document.getElementById('focusStartBtn');
  const label = document.getElementById('focusLabel');
  if (!btn || !label) return;

  if (focusRunning) {
    clearInterval(focusInterval);
    focusRunning    = false;
    btn.textContent = 'Start';
    label.textContent = currentMode === 'short' ? 'Break · Paused' : 'Pomodoro · Paused';
    updateRings();
    return;
  }

  focusRunning      = true;
  btn.textContent   = 'Pause';
  label.textContent = currentMode === 'short' ? 'Break · Running' : 'Pomodoro · Running';
  updateRings();

  focusInterval = setInterval(() => {
    focusSeconds--;
    updateFocusDisplay();
    updateFocusRing();

    if (focusSeconds <= 0) {
      clearInterval(focusInterval);
      focusRunning = false;
      sessionsCompleted++;

      btn.textContent   = 'Start';
      label.textContent = 'Session done! 🎉';

      const statFocus = document.getElementById('stat-focus');
      if (statFocus) statFocus.textContent = sessionsCompleted;
      bumpStat('stat-focus');
      const sessionCount = document.getElementById('sessionCount');
      if (sessionCount) sessionCount.textContent = 'Sessions completed: ' + sessionsCompleted;
      showToast('✦ Session complete — nice focus!');

      setMode(currentMode);
      updateRings();
    }
  }, 1000);
}


/* ── Calming Quotes (quotes.html) ── */
const quotes = [
  { t: "You don't have to control your thoughts. You just have to stop letting them control you.",              a: "Dan Millman" },
  { t: "Almost everything will work again if you unplug it for a few minutes, including you.",                  a: "Anne Lamott" },
  { t: "You are allowed to be both a masterpiece and a work in progress simultaneously.",                       a: "Sophia Bush" },
  { t: "Rest when you're weary. Refresh and renew yourself, your body, your mind, your spirit.",               a: "Ralph Marston" },
  { t: "Breathe. Let go. And remind yourself that this very moment is the only one you know you have for sure.", a: "Oprah Winfrey" },
  { t: "The time to relax is when you don't have time for it.",                                                 a: "Sydney J. Harris" },
  { t: "In the middle of difficulty lies opportunity.",                                                         a: "Albert Einstein" },
  { t: "Be gentle with yourself. You are a child of the universe no less than the trees and the stars.",        a: "Max Ehrmann" },
  { t: "Self-care is not selfish. You cannot serve from an empty vessel.",                                      a: "Eleanor Brownn" },
  { t: "Your calm mind is the ultimate weapon against your challenges.",                                        a: "Bryant McGill" },
  { t: "Happiness is not something ready-made. It comes from your own actions.",                                a: "Dalai Lama" },
  { t: "Nothing is permanent. Don't stress yourself too much — no matter how bad the situation is, it will change.", a: "Unknown" },
];

let lastQuoteIdx = 0;

function newQuote() {
  const box = document.querySelector('.big-quote-box');
  if (!box) return;
  let idx;
  do { idx = Math.floor(Math.random() * quotes.length); } while (idx === lastQuoteIdx);
  lastQuoteIdx = idx;

  box.classList.add('swapping');
  setTimeout(() => {
    document.getElementById('quoteText').textContent   = quotes[idx].t;
    document.getElementById('quoteAuthor').textContent = '— ' + quotes[idx].a;
    box.classList.remove('swapping');
  }, 220);
}


/* ── Wellness Insights (dashboard.html) ── */
function updateWellness(type, val) {
  val = parseFloat(val) || 0;

  if (type === 'hydration') {
    const pct = Math.min(100, Math.round((val / 8) * 100));
    setText('hydration-val', pct + '%');
    setWidth('hydration-bar', pct + '%');
    setText('hydration-sub', val + ' of 8 glasses');

  } else if (type === 'sleep') {
    const pct = Math.min(100, Math.round((val / 8) * 100));
    setWidth('sleep-bar', pct + '%');
    setText('sleep-val', val + 'h');
    setText('sleep-sub',
      val >= 7 ? 'Well rested!' :
      val >= 5 ? 'Could improve' :
      val >  0 ? 'Try for 7–8h'  : 'Log hours below');

  } else if (type === 'move') {
    const pct = Math.min(100, Math.round((val / 60) * 100));
    setWidth('move-bar', pct + '%');
    setText('move-val', pct + '%');
    setText('move-sub', val + ' min today');
  }
}
function setText(id, val)  { const el = document.getElementById(id); if (el) el.textContent = val; }
function setWidth(id, val) { const el = document.getElementById(id); if (el) el.style.width = val; }


/* ── Productivity Heatmap (dashboard.html) ── */
const DAYS     = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
let   prodData = [0, 1, 2, 3, 1, 2, 0];

function renderProdGrid() {
  const grid = document.getElementById('prodGrid');
  if (!grid) return;
  grid.innerHTML = DAYS.map((d, i) => `
    <div>
      <div class="prod-day-label">${d}</div>
      <div class="prod-dot ${prodData[i] > 0 ? 'p' + Math.min(4, prodData[i]) : ''}"></div>
    </div>`).join('');
}


/* ── Task List (dashboard.html) ── */
let tasks = [];

function addTask() {
  const inp  = document.getElementById('taskInput');
  if (!inp) return;
  const text = inp.value.trim();
  if (!text) return;
  tasks.push({ text, done: false, id: Date.now() });
  inp.value = '';
  renderTasks();
  updateProd();
}

function toggleTask(id) {
  const t = tasks.find(t => t.id === id);
  if (t) t.done = !t.done;
  renderTasks();
  updateProd();
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  renderTasks();
  updateProd();
}

function renderTasks() {
  const list = document.getElementById('taskList');
  if (!list) return;
  if (!tasks.length) {
    list.innerHTML = '<div class="task-empty">No tasks yet — add one above</div>';
    setText('stat-tasks', '0/0');
    return;
  }
  list.innerHTML = tasks.map(t => `
    <div class="task-item">
      <div class="task-check ${t.done ? 'done' : ''}" onclick="toggleTask(${t.id})"></div>
      <div class="task-text  ${t.done ? 'done' : ''}">${t.text}</div>
      <div class="task-del"  onclick="deleteTask(${t.id})">✕</div>
    </div>`).join('');

  const done = tasks.filter(t => t.done).length;
  setText('stat-tasks', done + '/' + tasks.length);
  bumpStat('stat-tasks');
}

function updateProd() {
  const done  = tasks.filter(t => t.done).length;
  const total = tasks.length;
  const today = new Date().getDay();
  const idx   = today === 0 ? 6 : today - 1;

  prodData[idx] =
    total === 0          ? 0 :
    done / total >= 0.75 ? 4 :
    done / total >= 0.5  ? 3 :
    done / total >= 0.25 ? 2 : 1;

  renderProdGrid();

  const streak = prodData.filter(d => d > 0).length;
  setText('stat-streak', streak + '🔥');
  bumpStat('stat-streak');
}


/* ── Scroll reveal ── */
function initScrollReveal() {
  const targets = document.querySelectorAll('[data-reveal]');
  if (!targets.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
  targets.forEach(t => io.observe(t));
}


/* ── Animated stat counters ── */
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el     = e.target;
      const target = parseInt(el.dataset.count, 10);
      const suffix = el.dataset.suffix || '';
      const dur    = 1200;
      const start  = performance.now();
      function tick(now) {
        const p = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      io.unobserve(el);
    });
  }, { threshold: 0.6 });
  counters.forEach(c => io.observe(c));
}


/* ── Nav: active page, mobile toggle, scroll effects ── */
function initNav() {
  const nav      = document.getElementById('siteNav');
  const toggle   = document.getElementById('navToggle');
  const links    = document.getElementById('navLinks');
  if (!nav) return;

  const navLinks   = document.querySelectorAll('[data-nav]');
  const currentPage = (location.pathname.split('/').pop() || 'index.html') || 'index.html';

  navLinks.forEach(a => {
    const href = a.getAttribute('href');
    a.classList.toggle('active', href === currentPage || (currentPage === '' && href === 'index.html'));
  });

  if (toggle && links) {
    toggle.addEventListener('click', () => links.classList.toggle('open'));
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => links.classList.remove('open')));
  }

  window.addEventListener('scroll', () => {
    nav.style.borderColor = window.scrollY > 20 ? 'var(--line)' : 'var(--line-soft)';
    const scrollTopBtn = document.getElementById('scrollTop');
    if (scrollTopBtn) scrollTopBtn.classList.toggle('show', window.scrollY > 600);
  }, { passive: true });

  const scrollTopBtn = document.getElementById('scrollTop');
  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }
}


/* ── Hero cursor glow + subtle blob parallax (index.html) ── */
function initHeroGlow() {
  const hero = document.getElementById('home');
  const blob = document.getElementById('heroBlob');
  if (!hero || !blob) return;
  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    hero.style.setProperty('--mx', x + '%');
    hero.style.setProperty('--my', y + '%');
    const dx = (e.clientX - rect.left - rect.width / 2) / rect.width;
    const dy = (e.clientY - rect.top - rect.height / 2) / rect.height;
    blob.style.transform = `translate(${dx * 14}px, ${dy * 14}px)`;
  });
}


/* ── Ambient floating petals canvas (every page) ── */
function initPetals() {
  const canvas = document.getElementById('petalCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, petals;
  const COLORS = ['rgba(238,172,169,0.5)', 'rgba(219,205,201,0.4)', 'rgba(183,166,217,0.35)'];

  function resize() {
    w = canvas.width  = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  function makePetals() {
    const count = window.innerWidth < 700 ? 16 : 30;
    petals = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 2 + Math.random() * 3.5,
      speedY: 0.15 + Math.random() * 0.35,
      speedX: (Math.random() - 0.5) * 0.3,
      sway: Math.random() * Math.PI * 2,
      swaySpeed: 0.005 + Math.random() * 0.01,
      color: COLORS[Math.floor(Math.random() * COLORS.length)]
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    petals.forEach(p => {
      p.sway += p.swaySpeed;
      p.y += p.speedY;
      p.x += p.speedX + Math.sin(p.sway) * 0.3;
      if (p.y > h + 10) { p.y = -10; p.x = Math.random() * w; }
      if (p.x > w + 10) p.x = -10;
      if (p.x < -10) p.x = w + 10;
      ctx.beginPath();
      ctx.fillStyle = p.color;
      ctx.ellipse(p.x, p.y, p.r, p.r * 1.6, p.sway, 0, Math.PI * 2);
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }

  resize();
  makePetals();
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduceMotion) draw();
  window.addEventListener('resize', () => { resize(); makePetals(); });
}


/* ── Init (guarded — safe to run on every page) ── */
renderProdGrid();
renderTasks();
updateFocusDisplay();
updateFocusRing();
initScrollReveal();
initCounters();
initNav();
initHeroGlow();
initPetals();