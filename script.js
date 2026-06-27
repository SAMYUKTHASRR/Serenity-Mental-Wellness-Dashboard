/* ─────────────────────────────────────────
   SERENITY — Mental Wellness Dashboard
   script.js
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


/* ── Mood Tracker ── */
let moodLog = [];

function logMood(emoji, label, btn) {
  document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  const now  = new Date();
  const time = now.getHours() + ':' + (now.getMinutes() < 10 ? '0' : '') + now.getMinutes();

  moodLog.unshift({ emoji, label, time });
  if (moodLog.length > 5) moodLog.pop();

  document.getElementById('stat-mood').textContent = emoji;
  renderMoodHistory();
}

function renderMoodHistory() {
  const el = document.getElementById('moodHistory');
  if (!moodLog.length) {
    el.innerHTML = '<span class="mood-empty">No entries yet — tap a mood above</span>';
    return;
  }
  el.innerHTML = moodLog
    .map(m => `<span class="mood-chip">${m.emoji} <span>${m.label}</span> · ${m.time}</span>`)
    .join('');
}


/* ── Focus Timer ── */
let focusInterval      = null;
let focusSeconds       = 25 * 60;
let focusRunning       = false;
let sessionsCompleted  = 0;
let currentMode        = 'long';

function setMode(mode) {
  if (focusRunning) return;
  currentMode  = mode;
  focusSeconds = mode === 'short' ? 5 * 60 : 25 * 60;
  updateFocusDisplay();
  document.getElementById('focusLabel').textContent =
    mode === 'short' ? 'Break · Ready' : 'Pomodoro · Ready';
}

function updateFocusDisplay() {
  const m = Math.floor(focusSeconds / 60);
  const s = focusSeconds % 60;
  document.getElementById('focusTime').textContent =
    (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
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

    if (focusSeconds <= 0) {
      clearInterval(focusInterval);
      focusRunning = false;
      sessionsCompleted++;

      btn.textContent   = 'Start';
      label.textContent = 'Session done! 🎉';

      document.getElementById('stat-focus').textContent    = sessionsCompleted;
      document.getElementById('sessionCount').textContent  = 'Sessions completed: ' + sessionsCompleted;

      setMode(currentMode);
      updateRings();
    }
  }, 1000);
}


/* ── Calming Quotes ── */
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
  let idx;
  do { idx = Math.floor(Math.random() * quotes.length); } while (idx === lastQuoteIdx);
  lastQuoteIdx = idx;
  document.getElementById('quoteText').textContent   = quotes[idx].t;
  document.getElementById('quoteAuthor').textContent = '— ' + quotes[idx].a;
}


/* ── Wellness Insights ── */
function updateWellness(type, val) {
  val = parseFloat(val) || 0;

  if (type === 'hydration') {
    const pct = Math.min(100, Math.round((val / 8) * 100));
    document.getElementById('hydration-bar').style.width  = pct + '%';
    document.getElementById('hydration-val').textContent  = pct + '%';
    document.getElementById('hydration-sub').textContent  = val + ' of 8 glasses';

  } else if (type === 'sleep') {
    const pct = Math.min(100, Math.round((val / 8) * 100));
    document.getElementById('sleep-bar').style.width = pct + '%';
    document.getElementById('sleep-val').textContent = val + 'h';
    document.getElementById('sleep-sub').textContent =
      val >= 7 ? 'Well rested!' :
      val >= 5 ? 'Could improve' :
      val >  0 ? 'Try for 7–8h'  : 'Log hours below';

  } else if (type === 'move') {
    const pct = Math.min(100, Math.round((val / 60) * 100));
    document.getElementById('move-bar').style.width = pct + '%';
    document.getElementById('move-val').textContent = pct + '%';
    document.getElementById('move-sub').textContent = val + ' min today';
  }
}


/* ── Productivity Heatmap ── */
const DAYS     = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
let   prodData = [0, 1, 2, 3, 1, 2, 0];

function renderProdGrid() {
  document.getElementById('prodGrid').innerHTML = DAYS.map((d, i) => `
    <div>
      <div class="prod-day-label">${d}</div>
      <div class="prod-dot ${prodData[i] > 0 ? 'p' + Math.min(4, prodData[i]) : ''}"></div>
    </div>`).join('');
}


/* ── Task List ── */
let tasks = [];

function addTask() {
  const inp  = document.getElementById('taskInput');
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
  if (!tasks.length) {
    list.innerHTML = '<div class="task-empty">No tasks yet — add one above</div>';
    document.getElementById('stat-tasks').textContent = '0/0';
    return;
  }
  list.innerHTML = tasks.map(t => `
    <div class="task-item">
      <div class="task-check ${t.done ? 'done' : ''}" onclick="toggleTask(${t.id})"></div>
      <div class="task-text  ${t.done ? 'done' : ''}">${t.text}</div>
      <div class="task-del"  onclick="deleteTask(${t.id})">✕</div>
    </div>`).join('');

  const done = tasks.filter(t => t.done).length;
  document.getElementById('stat-tasks').textContent = done + '/' + tasks.length;
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
  document.getElementById('stat-streak').textContent = streak + '🔥';
}


/* ── Init ── */
renderProdGrid();
renderTasks();
updateFocusDisplay();
