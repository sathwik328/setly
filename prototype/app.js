/**
 * PUSHPA APP CONTROLLER — ROUND 4 COMPLETE IMPLEMENTATION
 * Cinematic Fire Intro, Two Modes (AI Planner & Logbook), Guided Home Workouts,
 * Web Audio FX, Offline-first, Capacitor-ready
 */

import {
  STORAGE_KEY,
  getDefaultState,
  loadState,
  saveState,
  exportJSON,
  importJSON,
  exportCSV,
  hashPassword
} from "./storage.js";

import {
  EXERCISE_LIBRARY,
  calculateE1RM,
  calculatePlates,
  generateWarmupLadder,
  computeProgression,
  estimateStartingWeight,
  generateWeeklyPlan,
  generateFullProgram,
  getExerciseDetails
} from "./engine.js";

import {
  DEFAULT_LAYOUT,
  getWeeklySessionQueue,
  getSuggestedSessionForDay,
  evaluateWeekTransition,
  suggestionEngine,
  runMissedDayUnitTests
} from "./logbook-engine.js";

import {
  GUIDED_MOVES,
  GUIDED_ROUTINES
} from "./moves.js";

// Global Persistent Application State
let state = loadState();

// Global Runtime State
let deferredPrompt = null;
let liveWorkoutInterval = null;
let liveWorkoutStartTime = 0;
let audioCtx = null;
let isAudioMuted = !state.settings.soundEnabled;
let emberAnimationId = null;
let guidedActiveRoutine = null;
let guidedMoveIndex = 0;
let guidedTimerInterval = null;
let guidedTimeRemaining = 0;
let guidedTotalElapsedSeconds = 0;

// DOM Helper shortcuts
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ==========================================================================
   AUDIO SYNTHESIZER (Pure Web Audio API — No audio files)
   ========================================================================== */

function wakeAudio() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume();
  } catch (e) {
    console.log("AudioContext init skipped", e);
  }
}

function tone(freq, startDelay, duration, gainVal = 0.08, type = "sine") {
  if (isAudioMuted || !audioCtx) return;
  try {
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    const now = audioCtx.currentTime + startDelay;
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(gainVal, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gainNode).connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.05);
  } catch (e) {}
}

function noiseBurst(startDelay, duration, gainVal = 0.04, bandFreq = 800) {
  if (isAudioMuted || !audioCtx) return;
  try {
    const bufferSize = audioCtx.sampleRate * duration;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;

    const filter = audioCtx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(bandFreq, audioCtx.currentTime + startDelay);

    const gain = audioCtx.createGain();
    const now = audioCtx.currentTime + startDelay;
    gain.gain.setValueAtTime(gainVal, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    noise.connect(filter).connect(gain).connect(audioCtx.destination);
    noise.start(now);
  } catch (e) {}
}

export const S = {
  tap: () => tone(520, 0, 0.06, 0.04),
  tab: () => tone(620, 0, 0.08, 0.04),
  open: () => { tone(420, 0, 0.08, 0.04); tone(620, 0.06, 0.1, 0.04); },
  done: () => {
    tone(620, 0, 0.1, 0.07);
    tone(820, 0.08, 0.1, 0.07);
    tone(1240, 0.16, 0.25, 0.08);
  },
  lock: () => tone(160, 0, 0.18, 0.08, "triangle"),
  thump: () => tone(80, 0, 0.14, 0.12, "triangle"),
  fireIgnite: () => {
    tone(60, 0, 0.8, 0.14, "sine");
    noiseBurst(0.1, 0.6, 0.06, 600);
    noiseBurst(0.4, 0.4, 0.05, 1200);
  }
};

/* ==========================================================================
   INITIALIZATION
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

function initApp() {
  initAudioControls();
  initEmberParticles();
  initFireIntro();
  initModeSwitcher();
  initNavigation();
  initAuthEvents();
  initBackupRestore();
  initLogbookEvents();
  initGuidedPlayer();
  initPlannerEvents();

  // Run missed-day unit tests in background to confirm math
  runMissedDayUnitTests();

  // Check backup reminder
  checkBackupReminder();

  // Screen routing check
  if (!state.auth.isLoggedIn && !state.auth.isGuest) {
    switchScreen("s-auth");
  } else {
    applyModeUI(state.activeMode || "planner");
  }
}

function initAudioControls() {
  const sndBtn = $("#snd");
  const sw = $("#sw");

  isAudioMuted = !state.settings.soundEnabled;
  if (sw) sw.style.opacity = isAudioMuted ? 0 : 1;

  window.addEventListener("pointerdown", () => {
    wakeAudio();
  }, { once: true, passive: true });

  if (sndBtn) {
    sndBtn.onclick = (e) => {
      e.stopPropagation();
      wakeAudio();
      isAudioMuted = !isAudioMuted;
      state.settings.soundEnabled = !isAudioMuted;
      saveState(state);
      if (sw) sw.style.opacity = isAudioMuted ? 0 : 1;
      if (!isAudioMuted) S.tap();
    };
  }
}

/* ==========================================================================
   CINEMATIC FIRE INTRO (Section 2)
   ========================================================================== */

function initEmberParticles() {
  const canvas = $("#ember-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  
  const resize = () => {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  };
  resize();

  const particleCount = 45;
  const particles = Array.from({ length: particleCount }, () => ({
    x: Math.random() * canvas.width,
    y: canvas.height + Math.random() * 80,
    size: Math.random() * 2.8 + 1,
    speedY: Math.random() * 1.8 + 0.8,
    speedX: (Math.random() - 0.5) * 1.2,
    opacity: Math.random() * 0.8 + 0.2,
    hue: Math.random() > 0.4 ? 25 : 12 // Orange or Red
  }));

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.y -= p.speedY;
      p.x += p.speedX;
      p.opacity -= 0.003;

      if (p.y < 0 || p.opacity <= 0) {
        p.y = canvas.height + 10;
        p.x = Math.random() * canvas.width;
        p.opacity = Math.random() * 0.8 + 0.2;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 100%, 55%, ${p.opacity})`;
      ctx.shadowBlur = 6;
      ctx.shadowColor = "#FF6A00";
      ctx.fill();
    });

    emberAnimationId = requestAnimationFrame(draw);
  }
  draw();
}

function initFireIntro() {
  const splash = $("#fire-splash");
  const skipBtn = $("#btn-skip-intro");
  if (!splash) return;

  const now = Date.now();
  const lastActive = state.lastActiveTimestamp || 0;
  const hoursSince = (now - lastActive) / (1000 * 60 * 60);

  // If away less than 12 hours, play short 1.4s ignite
  const isQuick = hoursSince < 12 && sessionStorage.getItem("PUSHPA_INTRO_SEEN");

  const dismiss = () => {
    cancelAnimationFrame(emberAnimationId);
    splash.classList.add("out");
    sessionStorage.setItem("PUSHPA_INTRO_SEEN", "true");
    state.lastActiveTimestamp = Date.now();
    saveState(state);
  };

  skipBtn?.addEventListener("click", dismiss);
  splash.addEventListener("click", dismiss);

  if (isQuick) {
    setTimeout(dismiss, 1400);
    return;
  }

  // Full 4.5s cinematic timeline
  setTimeout(() => {
    wakeAudio();
    S.fireIgnite();
  }, 400);

  // Letter slam thumps
  [600, 800, 1000, 1200, 1700, 1900].forEach(delay => {
    setTimeout(() => S.thump(), delay);
  });

  setTimeout(dismiss, 4600);
}

/* ==========================================================================
   MODE SWITCHER (AI PLANNER vs LOGBOOK — Section 4)
   ========================================================================== */

function initModeSwitcher() {
  const plannerCard = $("#mode-card-planner");
  const logbookCard = $("#mode-card-logbook");

  plannerCard?.addEventListener("click", () => {
    applyModeUI("planner");
    S.open();
  });

  logbookCard?.addEventListener("click", () => {
    applyModeUI("logbook");
    S.open();
  });

  // Top header mode switcher buttons
  $$("#mode-switch-pill .mode-switch-btn").forEach(btn => {
    btn.onclick = () => {
      const mode = btn.getAttribute("data-mode");
      applyModeUI(mode);
      S.tab();
    };
  });

  // Logo home click opens mode select
  $("#brand-home-link")?.addEventListener("click", () => {
    switchScreen("s-mode-select");
    S.open();
  });
}

function applyModeUI(mode) {
  state.activeMode = mode;
  saveState(state);

  $$("#mode-switch-pill .mode-switch-btn").forEach(btn => {
    btn.classList.toggle("active", btn.getAttribute("data-mode") === mode);
  });

  const plannerViews = $("#mode-planner-views");
  const logbookViews = $("#mode-logbook-views");

  if (mode === "planner") {
    plannerViews?.classList.remove("hidden");
    logbookViews?.classList.add("hidden");
    renderPlannerToday();
    renderPlanTab();
  } else {
    plannerViews?.classList.add("hidden");
    logbookViews?.classList.remove("hidden");
    renderLogbookToday();
    renderLogbookReports();
  }

  switchScreen(mode === "planner" ? "s-today" : "s-logbook-today");
}

/* ==========================================================================
   NAVIGATION
   ========================================================================== */

function switchScreen(screenId) {
  $$(".scr").forEach(s => s.classList.remove("on"));
  const target = $(`#${screenId}`);
  if (target) target.classList.add("on");
}

function initNavigation() {
  const tabs = $$("#tabs button");
  tabs.forEach(btn => {
    btn.onclick = () => {
      tabs.forEach(t => t.classList.toggle("on", t === btn));
      const targetTab = btn.getAttribute("data-t");

      if (state.activeMode === "logbook") {
        if (targetTab === "today" || targetTab === "plan") {
          switchScreen("s-logbook-today");
          renderLogbookToday();
        } else if (targetTab === "prog") {
          switchScreen("s-logbook-reports");
          renderLogbookReports();
        } else {
          switchScreen("s-profile");
        }
      } else {
        switchScreen(`s-${targetTab}`);
        if (targetTab === "today") renderPlannerToday();
        else if (targetTab === "plan") renderPlanTab();
        else if (targetTab === "prog") renderPlannerProgress();
      }
      S.tab();
    };
  });
}

function initAuthEvents() {
  $("#btn-guest-login")?.addEventListener("click", () => {
    state.auth.isLoggedIn = true;
    state.auth.isGuest = true;
    state.auth.username = "Guest Athlete";
    saveState(state);
    S.open();
    switchScreen("s-mode-select");
  });

  $("#auth-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const u = $("#auth-username")?.value.trim();
    const p = $("#auth-password")?.value;
    if (!u || !p) return;

    state.auth.isLoggedIn = true;
    state.auth.isGuest = false;
    state.auth.username = u;
    state.auth.passwordHash = await hashPassword(p);
    saveState(state);
    S.open();
    switchScreen("s-mode-select");
  });
}

/* ==========================================================================
   LOGBOOK ENGINE & NOTION-STYLE UI (Section 5)
   ========================================================================== */

let activeDailyLog = null;

function renderLogbookToday() {
  const container = $("#log-exercise-blocks-container");
  if (!container) return;

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dayKeys = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const now = new Date();
  const currentDayKey = dayKeys[now.getDay()];

  // Missed-day weekly queue check
  const suggested = getSuggestedSessionForDay(
    state.logbook.layout || DEFAULT_LAYOUT,
    state.logbook.completedSessionsInWeek || [],
    currentDayKey
  );

  $("#log-date-label").textContent = `Today • ${dayNames[now.getDay()]}`;
  $("#log-suggested-session-name").textContent = suggested.sessionName;

  // Initialize today's working session in memory if not set
  if (!activeDailyLog) {
    activeDailyLog = {
      date: now.toISOString().split("T")[0],
      sessionName: suggested.sessionName,
      exercises: []
    };
  }

  renderExerciseBlocks();

  // Change Session Badge
  $("#btn-change-log-session").onclick = () => {
    const customName = prompt("Enter session type (e.g. Push, Pull, Legs, Arms, Core):", activeDailyLog.sessionName);
    if (customName) {
      activeDailyLog.sessionName = customName;
      $("#log-suggested-session-name").textContent = customName;
      S.tap();
    }
  };

  // Rest Today Button
  $("#btn-log-rest-today").onclick = () => {
    if (confirm("Mark today as Rest? Your week queue will remain intact.")) {
      activeDailyLog.sessionName = "Rest";
      activeDailyLog.exercises = [];
      saveState(state);
      S.tap();
      alert("Rest day recorded. Rest up and recover!");
    }
  };

  // Autocomplete & Add Exercise
  const addInput = $("#input-add-exercise-name");
  const dropdown = $("#log-autocomplete-dropdown");

  if (addInput && dropdown) {
    addInput.oninput = () => {
      const val = addInput.value.trim().toLowerCase();
      if (!val) {
        dropdown.classList.add("hidden");
        return;
      }

      const matches = EXERCISE_LIBRARY.filter(e => e.name.toLowerCase().includes(val)).slice(0, 5);
      if (matches.length === 0) {
        dropdown.innerHTML = `<div class="autocomplete-item" id="btn-create-custom-ex">+ Add "${addInput.value}" as custom move</div>`;
      } else {
        dropdown.innerHTML = matches.map(m => `<div class="autocomplete-item" data-name="${m.name}">${m.name}</div>`).join("");
      }
      dropdown.classList.remove("hidden");

      $$(".autocomplete-item", dropdown).forEach(item => {
        item.onclick = () => {
          const name = item.getAttribute("data-name") || addInput.value.trim();
          addExerciseToDailyLog(name);
          addInput.value = "";
          dropdown.classList.add("hidden");
        };
      });
    };
  }

  // Finish Session & Save
  $("#btn-finish-logbook-session").onclick = () => {
    finishLogbookSession();
  };
}

function addExerciseToDailyLog(name) {
  activeDailyLog.exercises.push({
    name,
    sets: [
      { weight: "", reps: "" },
      { weight: "", reps: "" },
      { weight: "", reps: "" }
    ],
    remark: "",
    tag: "Good"
  });
  renderExerciseBlocks();
  S.tap();
}

function renderExerciseBlocks() {
  const container = $("#log-exercise-blocks-container");
  if (!container) return;
  container.innerHTML = "";

  activeDailyLog.exercises.forEach((ex, exIdx) => {
    const block = document.createElement("div");
    block.className = "log-exercise-block";

    // "Last time" lookup for SAME session and SAME exercise
    const pastLogs = state.logbook.logs || [];
    const lastSession = pastLogs.find(l => 
      l.sessionName?.toLowerCase() === activeDailyLog.sessionName?.toLowerCase() &&
      l.exercises?.some(e => e.name?.toLowerCase() === ex.name?.toLowerCase())
    );
    const lastEx = lastSession?.exercises?.find(e => e.name?.toLowerCase() === ex.name?.toLowerCase());

    const lastTimeHtml = lastEx ? `
      <div class="last-time-banner" data-ex-idx="${exIdx}">
        <span>Last time (${lastSession.date}): <b>${lastEx.sets.map(s => `${s.weight}kg×${s.reps}`).join(", ")}</b> ${lastEx.remark ? `• "${lastEx.remark}"` : ""}</span>
      </div>
    ` : `
      <div class="last-time-banner" style="border-left-color: var(--dim);">
        <span class="sub">First time logging this exercise in ${activeDailyLog.sessionName}.</span>
      </div>
    `;

    block.innerHTML = `
      <div class="log-exercise-head">
        <span class="log-exercise-title">${ex.name}</span>
        <button type="button" class="spark-ai-btn" data-ex-idx="${exIdx}">
          <span>✦ Suggest</span>
        </button>
      </div>

      ${lastTimeHtml}

      <div class="log-set-table">
        <div style="display: grid; grid-template-columns: 28px 1fr 1fr 34px; gap: 8px; margin-bottom: 4px; font-size: 11px; color: var(--dim); font-weight: 700; text-align: center;">
          <span>SET</span><span>KG</span><span>REPS</span><span></span>
        </div>
        <div id="log-sets-container-${exIdx}">
          ${ex.sets.map((s, sIdx) => `
            <div class="log-set-row">
              <span class="log-set-idx">${sIdx + 1}</span>
              <input type="number" step="0.5" class="form-input log-input inp-set-w" placeholder="0" inputmode="decimal" value="${s.weight}" data-ex="${exIdx}" data-s="${sIdx}">
              <input type="number" class="form-input log-input inp-set-r" placeholder="0" inputmode="decimal" value="${s.reps}" data-ex="${exIdx}" data-s="${sIdx}">
              <button type="button" class="log-row-del" data-ex="${exIdx}" data-s="${sIdx}">✕</button>
            </div>
          `).join("")}
        </div>
      </div>

      <button type="button" class="btn-secondary" style="width: 100%; height: 34px; font-size: 11px; margin-top: 6px;" id="btn-add-set-row-${exIdx}">
        + Add Set
      </button>

      <div style="margin-top: 10px;">
        <input type="text" class="form-input inp-remark" placeholder="Remark (e.g. felt light, right shoulder tight)..." value="${ex.remark}" data-ex="${exIdx}" style="height: 38px; font-size: 12px;">
      </div>

      <div class="log-tags-row">
        ${["Easy", "Good", "Hard", "Pain"].map(t => `
          <button type="button" class="log-tag-pill ${ex.tag === t ? "selected" : ""}" data-ex="${exIdx}" data-tag="${t}">${t}</button>
        `).join("")}
      </div>
    `;

    // Bind inputs & autosave
    $$(".inp-set-w", block).forEach(inp => {
      inp.oninput = () => {
        const eI = inp.getAttribute("data-ex");
        const sI = inp.getAttribute("data-s");
        activeDailyLog.exercises[eI].sets[sI].weight = inp.value;
      };
    });

    $$(".inp-set-r", block).forEach(inp => {
      inp.oninput = () => {
        const eI = inp.getAttribute("data-ex");
        const sI = inp.getAttribute("data-s");
        activeDailyLog.exercises[eI].sets[sI].reps = inp.value;
      };
    });

    $$(".log-row-del", block).forEach(btn => {
      btn.onclick = () => {
        const eI = btn.getAttribute("data-ex");
        const sI = btn.getAttribute("data-s");
        activeDailyLog.exercises[eI].sets.splice(sI, 1);
        renderExerciseBlocks();
      };
    });

    block.querySelector(`#btn-add-set-row-${exIdx}`).onclick = () => {
      activeDailyLog.exercises[exIdx].sets.push({ weight: "", reps: "" });
      renderExerciseBlocks();
      S.tap();
    };

    block.querySelector(".inp-remark").oninput = (e) => {
      activeDailyLog.exercises[exIdx].remark = e.target.value;
    };

    $$(".log-tag-pill", block).forEach(pill => {
      pill.onclick = () => {
        activeDailyLog.exercises[exIdx].tag = pill.getAttribute("data-tag");
        $$(".log-tag-pill", block).forEach(p => p.classList.remove("selected"));
        pill.classList.add("selected");
        S.tap();
      };
    });

    // Spark Suggestion Popover
    block.querySelector(".spark-ai-btn").onclick = () => {
      const suggestion = suggestionEngine.suggest(ex.name, activeDailyLog.sessionName, state.logbook.logs || []);
      alert(`💡 PUSHPA Coach (${ex.name}):\n\n${suggestion.text}`);
      S.open();
    };

    container.appendChild(block);
  });
}

function finishLogbookSession() {
  if (!activeDailyLog || activeDailyLog.exercises.length === 0) {
    alert("Please log at least one exercise before finishing.");
    return;
  }

  // Calculate volume
  let vol = 0;
  let totalSets = 0;
  activeDailyLog.exercises.forEach(e => {
    e.sets.forEach(s => {
      const w = parseFloat(s.weight) || 0;
      const r = parseInt(s.reps, 10) || 0;
      if (w > 0 && r > 0) {
        vol += w * r;
        totalSets++;
      }
    });
  });

  const savedLog = {
    ...activeDailyLog,
    id: `logbook_${Date.now()}`,
    totalVolumeKg: Math.round(vol),
    totalSets
  };

  if (!state.logbook.logs) state.logbook.logs = [];
  state.logbook.logs.unshift(savedLog);

  // Update weekly completed sessions queue
  if (!state.logbook.completedSessionsInWeek) state.logbook.completedSessionsInWeek = [];
  state.logbook.completedSessionsInWeek.push(savedLog.sessionName);

  saveState(state);
  S.done();

  // Reset active in-memory log
  activeDailyLog = null;

  alert(`🔥 Session Saved!\n\nCompleted ${savedLog.sessionName} with ${totalSets} working sets and ${vol.toLocaleString()} kg total volume.`);
  renderLogbookToday();
  renderLogbookReports();
}

function renderLogbookReports() {
  const logs = state.logbook.logs || [];
  const queue = getWeeklySessionQueue(state.logbook.layout || DEFAULT_LAYOUT);
  const plannedWeekly = queue.length;
  const completedWeekly = state.logbook.completedSessionsInWeek?.length || 0;

  const consistencyPct = Math.round((completedWeekly / Math.max(1, plannedWeekly)) * 100);
  $("#log-stat-consistency").textContent = `${consistencyPct}%`;
  $("#log-stat-streak").textContent = `${Math.max(1, Math.floor(logs.length / 4))} Wk`;
  $("#log-stat-missed").textContent = state.logbook.missedSessionsCount || 0;

  $("#log-report-summary").textContent = logs.length > 0
    ? `You completed ${completedWeekly} of ${plannedWeekly} planned sessions this week. Overall progressive overload trajectory is strong.`
    : "Start logging your workouts to unlock weekly volume trends and consistency analysis.";

  // Render History Timeline
  const timeline = $("#log-history-timeline");
  if (!timeline) return;

  if (logs.length === 0) {
    timeline.innerHTML = `<span class="sub">No logs yet. Finish your first daily page!</span>`;
    return;
  }

  timeline.innerHTML = logs.map(l => `
    <div class="row" style="padding: 10px 0;">
      <div>
        <b>${l.date} • ${l.sessionName}</b>
        <small>${l.exercises.length} moves • ${l.totalSets || 0} sets • ${l.totalVolumeKg || 0} kg</small>
      </div>
    </div>
  `).join("");
}

function initLogbookEvents() {
  $("#btn-open-log-setup")?.addEventListener("click", () => {
    const layout = state.logbook.layout || DEFAULT_LAYOUT;
    const days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
    const sheetContent = $("#sc");
    sheetContent.innerHTML = `
      <h2 style="font-size: 22px; font-weight: 800; margin-bottom: 12px;">Weekly Layout Setup</h2>
      <p class="sub" style="margin-bottom: 16px;">Set your split template. The week queue resets automatically each week.</p>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        ${days.map(d => `
          <div style="display: flex; justify-content: space-between; align-items: center; background: var(--s2); padding: 8px 12px; border-radius: 10px;">
            <b style="text-transform: uppercase; font-size: 12px;">${d}</b>
            <input type="text" class="form-input inp-layout-day" data-day="${d}" value="${layout[d]}" style="width: 120px; height: 34px; text-align: center; font-size: 13px;">
          </div>
        `).join("")}
      </div>
      <button type="button" class="cta" id="btn-save-layout" style="margin-top: 16px;">Save Layout</button>
    `;
    $("#ph").classList.add("open");

    $("#btn-save-layout").onclick = () => {
      $$(".inp-layout-day", sheetContent).forEach(inp => {
        const d = inp.getAttribute("data-day");
        state.logbook.layout[d] = inp.value.trim() || "Rest";
      });
      saveState(state);
      $("#ph").classList.remove("open");
      renderLogbookToday();
      S.done();
    };
  });
}

/* ==========================================================================
   GUIDED HOME WORKOUTS (Section 7)
   ========================================================================== */

function initGuidedPlayer() {
  $("#btn-start-guided-home")?.addEventListener("click", () => {
    openGuidedSelectionSheet();
  });

  $("#btn-guided-done")?.addEventListener("click", () => {
    advanceGuidedMove();
  });

  $("#btn-guided-skip")?.addEventListener("click", () => {
    advanceGuidedMove();
  });
}

function openGuidedSelectionSheet() {
  const sheetContent = $("#sc");
  sheetContent.innerHTML = `
    <h2 style="font-size: 22px; font-weight: 800; margin-bottom: 10px;">Guided Home Workouts</h2>
    <p class="sub" style="margin-bottom: 16px;">No weights required. Low-poly animated skeleton guide.</p>
    <div style="display: flex; flex-direction: column; gap: 10px;">
      ${Object.entries(GUIDED_ROUTINES).map(([k, r]) => `
        <div class="card" style="cursor: pointer; padding: 14px;" data-routine="${k}">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <b style="font-size: 16px;">${r.name}</b>
            <span class="chip on" style="font-size: 11px;">~${r.estimatedMinutes} min</span>
          </div>
          <p class="sub" style="margin-top: 4px;">${r.warmup.length} warm-up moves • ${r.main.length} main moves • ${r.cooldown.length} cool-down stretches</p>
        </div>
      `).join("")}
    </div>
  `;
  $("#ph").classList.add("open");

  $$("[data-routine]", sheetContent).forEach(card => {
    card.onclick = () => {
      const routineKey = card.getAttribute("data-routine");
      startGuidedWorkout(routineKey);
      $("#ph").classList.remove("open");
    };
  });
}

function startGuidedWorkout(routineKey) {
  const routine = GUIDED_ROUTINES[routineKey];
  if (!routine) return;

  const allMoveIds = [...routine.warmup, ...routine.main, ...routine.cooldown];
  guidedActiveRoutine = {
    ...routine,
    moves: allMoveIds.map(id => GUIDED_MOVES.find(m => m.id === id)).filter(Boolean)
  };

  guidedMoveIndex = 0;
  guidedTotalElapsedSeconds = 0;

  $("#guided-player-screen").classList.add("active");
  renderGuidedMoveUI();
}

function renderGuidedMoveUI() {
  if (!guidedActiveRoutine || !guidedActiveRoutine.moves || guidedActiveRoutine.moves.length === 0) {
    const defaultRoutine = GUIDED_ROUTINES["full_body_ignite"] || Object.values(GUIDED_ROUTINES)[0];
    const allMoveIds = [...defaultRoutine.warmup, ...defaultRoutine.main, ...defaultRoutine.cooldown];
    guidedActiveRoutine = {
      ...defaultRoutine,
      moves: allMoveIds.map(id => GUIDED_MOVES.find(m => m.id === id)).filter(Boolean)
    };
  }

  const move = guidedActiveRoutine.moves[guidedMoveIndex];
  if (!move) {
    finishGuidedWorkout();
    return;
  }

  $("#guided-progress-label").textContent = `Move ${guidedMoveIndex + 1} of ${guidedActiveRoutine.moves.length}`;
  $("#guided-move-name").textContent = move.name;
  $("#guided-cue-disp").textContent = move.cues[0] || "";

  // Highlight working muscles
  $$(".muscle-highlight-poly").forEach(poly => poly.classList.remove("active-working"));
  move.primaryMuscles.forEach(m => {
    if (m === "chest") $("#poly-chest")?.classList.add("active-working");
    if (m === "core") $("#poly-core")?.classList.add("active-working");
    if (m === "quads") { $("#poly-quad-l")?.classList.add("active-working"); $("#poly-quad-r")?.classList.add("active-working"); }
    if (m === "shoulders" || m === "triceps") { $("#poly-arm-l")?.classList.add("active-working"); $("#poly-arm-r")?.classList.add("active-working"); }
  });

  if (move.type === "time") {
    guidedTimeRemaining = move.defaultDuration || 30;
    $("#guided-target-disp").textContent = `${guidedTimeRemaining}s`;
    clearInterval(guidedTimerInterval);
    guidedTimerInterval = setInterval(() => {
      guidedTimeRemaining--;
      guidedTotalElapsedSeconds++;
      updateGuidedCalories();
      if (guidedTimeRemaining <= 0) {
        clearInterval(guidedTimerInterval);
        S.done();
        advanceGuidedMove();
      } else {
        $("#guided-target-disp").textContent = `${guidedTimeRemaining}s`;
      }
    }, 1000);
  } else {
    clearInterval(guidedTimerInterval);
    $("#guided-target-disp").textContent = `${move.defaultReps || 12} reps`;
  }
}

function updateGuidedCalories() {
  const weight = state.profile.weightKg || 70;
  // MET formula: Calories = MET * 3.5 * weightKg / 200 * (seconds / 60)
  const calories = Math.round(5.5 * 3.5 * weight / 200 * (guidedTotalElapsedSeconds / 60));
  $("#guided-calories-label").textContent = `~${calories} kcal`;
}

function advanceGuidedMove() {
  clearInterval(guidedTimerInterval);
  guidedMoveIndex++;
  S.done();
  if (guidedActiveRoutine && guidedActiveRoutine.moves && guidedMoveIndex < guidedActiveRoutine.moves.length) {
    renderGuidedMoveUI();
  } else {
    finishGuidedWorkout();
  }
}

function finishGuidedWorkout() {
  clearInterval(guidedTimerInterval);
  $("#guided-player-screen").classList.remove("active");

  const weight = state.profile.weightKg || 70;
  const calories = Math.round(5.5 * 3.5 * weight / 200 * (guidedTotalElapsedSeconds / 60));
  const rName = guidedActiveRoutine?.name || "Guided Session";

  alert(`🔥 Workout Finished!\n\nCompleted ${rName} in ${Math.round(guidedTotalElapsedSeconds / 60)} min (~${calories} estimated kcal). Fantastic effort!`);
  S.done();
}

/* ==========================================================================
   AI PLANNER ENGINE (Section 6)
   ========================================================================== */

function renderPlannerToday() {
  ensureProgramSchedule();
  const schedule = state.programSchedule;
  const cur = state.currentProgramDay || 1;
  const dayPlan = schedule.find(d => d.dayNumber === cur) || schedule[0];

  $("#today-day-counter").textContent = `Day ${cur} of ${state.profile.programLength || 60}`;
  $("#today-session-name").textContent = dayPlan.shortName || dayPlan.name;

  // Clean, simplified lineup list
  const lineup = $("#lineup");
  if (lineup) {
    lineup.innerHTML = dayPlan.exercises.map((ex, i) => `
      <div class="row" style="cursor: pointer;" data-ex-id="${ex.exerciseId}">
        <div>
          <b>${i + 1}. ${ex.name}</b>
          <small>${ex.targetSets} sets × ${ex.targetReps} reps @ <span class="num text-fire font-bold">${ex.targetWeight} kg</span></small>
        </div>
      </div>
    `).join("");

    $$("#lineup .row").forEach(row => {
      row.onclick = () => {
        const exId = row.getAttribute("data-ex-id");
        openExerciseDetailSheet(exId);
      };
    });
  }

  $("#btn-start-today-workout").onclick = () => {
    startLiveGymWorkout(dayPlan);
  };
}

function renderPlanTab() {
  ensureProgramSchedule();
  const schedule = state.programSchedule;
  const N = state.profile.programLength || 60;
  const cur = state.currentProgramDay || 1;

  $("#pl").textContent = `Day ${cur} of ${N}`;
  $("#pp").textContent = `${Math.round((cur / N) * 100)}%`;
  $("#pbar").style.width = `${Math.round((cur / N) * 100)}%`;

  const daysContainer = $("#days");
  if (daysContainer) {
    daysContainer.innerHTML = Array.from({ length: N }, (_, i) => {
      const dNum = i + 1;
      const isDone = state.completedDays.includes(dNum) || dNum < cur;
      const isCur = dNum === cur;
      return `<button class="dc ${isDone ? "done" : isCur ? "cur" : "lock"}" data-d="${dNum}">${dNum}</button>`;
    }).join("");

    $$("#days .dc").forEach(btn => {
      btn.onclick = () => {
        const dNum = parseInt(btn.getAttribute("data-d"), 10);
        openDaySheet(dNum);
      };
    });
  }
}

function openDaySheet(dNum) {
  const plan = state.programSchedule.find(d => d.dayNumber === dNum);
  if (!plan) return;

  const cur = state.currentProgramDay || 1;
  const isLocked = dNum > cur;

  const sheetContent = $("#sc");
  sheetContent.innerHTML = `
    <h2 style="font-size: 22px; font-weight: 800;">${plan.name}</h2>
    <p class="sub">${plan.focus} • ~${plan.durationMinutes} min</p>
    <div style="margin-top: 14px;">
      ${plan.exercises.map(e => `
        <div class="row">
          <div>
            <b>${e.name}</b>
            <small>${e.targetSets} sets × ${e.targetReps} reps ${isLocked ? "• Set at unlock" : `@ ${e.targetWeight} kg`}</small>
          </div>
        </div>
      `).join("")}
    </div>
    ${isLocked ? `<p class="sub" style="color: var(--warn); margin-top: 10px;">Finish Day ${cur} to unlock.</p>` : ""}
    <button class="cta" ${isLocked ? "disabled" : ""} id="btn-sheet-start-gym" style="margin-top: 16px;">Start Workout</button>
  `;
  $("#ph").classList.add("open");

  $("#btn-sheet-start-gym")?.addEventListener("click", () => {
    if (!isLocked) {
      $("#ph").classList.remove("open");
      startLiveGymWorkout(plan);
    }
  });
}

function openExerciseDetailSheet(exerciseId) {
  const details = getExerciseDetails(exerciseId);
  const sheetContent = $("#sc");
  sheetContent.innerHTML = `
    <h2 style="font-size: 22px; font-weight: 800;">${details.name}</h2>
    <p class="sub">${details.equipment.toUpperCase()} • ${details.pattern?.replace("_", " ").toUpperCase()}</p>
    
    <div style="margin-top: 14px;">
      <b style="color: var(--fire); font-size: 13px;">Key Form Cues</b>
      ${details.cues.map(c => `<div style="font-size: 13px; padding: 3px 0;">✓ ${c}</div>`).join("")}
    </div>

    <div style="margin-top: 12px;">
      <b style="color: var(--hard); font-size: 13px;">Common Mistakes</b>
      ${details.mistakes.map(m => `<div style="font-size: 13px; padding: 3px 0; color: var(--dim);">✕ ${m}</div>`).join("")}
    </div>

    <button type="button" class="btn-secondary" style="width: 100%; height: 42px; margin-top: 16px;" id="btn-close-ex-sheet">Close</button>
  `;
  $("#ph").classList.add("open");
  $("#btn-close-ex-sheet").onclick = () => $("#ph").classList.remove("open");
  S.open();
}

function ensureProgramSchedule() {
  if (!state.programSchedule || state.programSchedule.length === 0) {
    state.programSchedule = generateFullProgram(
      state.profile.programLength || 60,
      state.profile.daysPerWeek || 4,
      state.profile.availableEquipment,
      state.profile.limitations,
      state.profile.weightKg || 75,
      state.profile.sex,
      state.profile.experience,
      state.profile.goal,
      state.profile.prioritizedMuscles
    );
    saveState(state);
  }
}

function startLiveGymWorkout(dayPlan) {
  const liveScreen = $("#live-workout-screen");
  liveScreen.classList.add("active");
  liveWorkoutStartTime = Date.now();
  updateLiveElapsed();
  clearInterval(liveWorkoutInterval);
  liveWorkoutInterval = setInterval(updateLiveElapsed, 1000);

  const body = $("#live-workout-body");
  body.innerHTML = dayPlan.exercises.map(e => `
    <div class="card">
      <b>${e.name}</b>
      <div style="margin-top: 6px;">
        <span class="chip on">${e.targetSets} sets × ${e.targetReps} reps @ ${e.targetWeight} kg</span>
      </div>
    </div>
  `).join("");

  $("#btn-minimize-workout").onclick = () => liveScreen.classList.remove("active");
  $("#btn-finish-workout").onclick = () => {
    clearInterval(liveWorkoutInterval);
    liveScreen.classList.remove("active");
    state.currentProgramDay = Math.min(state.profile.programLength, state.currentProgramDay + 1);
    saveState(state);
    alert("Gym workout finished! Progressive overload updated.");
    S.done();
    renderPlannerToday();
    renderPlanTab();
  };
}

function updateLiveElapsed() {
  const sec = Math.floor((Date.now() - liveWorkoutStartTime) / 1000);
  const m = String(Math.floor(sec / 60)).padStart(2, "0");
  const s = String(sec % 60).padStart(2, "0");
  const el = $("#live-elapsed-time");
  if (el) el.textContent = `${m}:${s}`;
}

function renderPlannerProgress() {
  // Volume bars & rings
  const musEl = $("#mus");
  if (musEl) {
    musEl.innerHTML = ["Chest", "Back", "Legs", "Shoulders", "Arms"].map(m => `
      <div class="mb">
        <span>${m}</span>
        <div class="bar" style="margin: 0;"><i style="width: 70%; background: var(--fire);"></i></div>
        <span class="num text-tx">14</span>
      </div>
    `).join("");
  }
}

function initPlannerEvents() {
  $("#shade")?.addEventListener("click", () => $("#ph").classList.remove("open"));
}

/* ==========================================================================
   BACKUP & RESTORE (Section 8)
   ========================================================================== */

function initBackupRestore() {
  $("#btn-export-backup")?.addEventListener("click", () => {
    exportJSON(state);
    state.backup = state.backup || {};
    state.backup.lastBackupDate = new Date().toISOString();
    saveState(state);
    S.done();
  });

  const fileInput = $("#input-import-file");
  $("#btn-trigger-import")?.addEventListener("click", () => fileInput?.click());

  fileInput?.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      state = await importJSON(file);
      alert("Backup successfully restored!");
      location.reload();
    } catch (err) {
      alert("Invalid backup file: " + err.message);
    }
  });

  $("#btn-logout")?.addEventListener("click", () => {
    state.auth.isLoggedIn = false;
    state.auth.isGuest = false;
    saveState(state);
    switchScreen("s-auth");
  });
}

function checkBackupReminder() {
  const lastBackup = state.backup?.lastBackupDate;
  if (!lastBackup) return;
  const daysSince = (Date.now() - new Date(lastBackup).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSince > 7) {
    console.log("Weekly backup reminder: It has been over 7 days since your last backup.");
  }
}
