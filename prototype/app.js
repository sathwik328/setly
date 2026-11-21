/**
 * PUSHPA APPLICATION CONTROLLER — CLEAN REBUILD
 * Implements Layout Contract, 2 Modes (AI Planner & Logbook), Guided Workouts,
 * Cinematic Intro, Audio Engine, Zero !important, Single Screen Mounted at a time.
 */

import {
  STORAGE_KEY,
  getDefaultState,
  loadState,
  saveState,
  exportJSON,
  importJSON,
  hashPassword
} from "./storage.js";

import {
  EXERCISE_LIBRARY,
  calculateE1RM,
  calculatePlates,
  generateWarmupLadder,
  generateFullProgram,
  getExerciseDetails
} from "./engine.js";

import {
  DEFAULT_LAYOUT,
  getWeeklySessionQueue,
  getSuggestedSessionForDay,
  getExerciseSuggestion
} from "./logbook-engine.js";

import {
  GUIDED_MOVES,
  GUIDED_ROUTINES
} from "./moves.js";

import { Icons } from "./icons.js";
import "./audio.js";

// Global Persistent Application State
let state = loadState();

// Active Runtime & Timer References for Safe Cleanup
let currentScreen = null;
let screenTimers = [];
let liveWorkoutTimer = null;
let restTimer = null;
let guidedTimer = null;

// DOM Shortcuts
const $ = (sel, parent = document) => parent.querySelector(sel);
const $$ = (sel, parent = document) => [...parent.querySelectorAll(sel)];

function clearAllTimers() {
  screenTimers.forEach(t => clearTimeout(t));
  screenTimers = [];
  if (liveWorkoutTimer) { clearInterval(liveWorkoutTimer); liveWorkoutTimer = null; }
  if (restTimer) { clearInterval(restTimer); restTimer = null; }
  if (guidedTimer) { clearInterval(guidedTimer); guidedTimer = null; }
}

function addScreenTimer(t) {
  screenTimers.push(t);
  return t;
}

/* ==========================================================================
   THEME, ACCENT & KEYBOARD INITIALIZATION
   ========================================================================== */

function applyThemeAndAccent() {
  const root = document.documentElement;
  const theme = state.settings.theme || "dark";
  const accent = state.settings.accent || "red";

  if (theme === "system") {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.setAttribute("data-theme", prefersDark ? "dark" : "light");
  } else {
    root.setAttribute("data-theme", theme);
  }

  root.setAttribute("data-accent", accent);

  const themeMeta = $('meta[name="theme-color"]');
  if (themeMeta) {
    themeMeta.content = root.getAttribute("data-theme") === "light" ? "#F7F6F4" : "#0B0B0C";
  }

  if (window.pushpaAudio) {
    window.pushpaAudio.setLevel(state.settings.soundLevel || "low");
  }
}

// VisualViewport Keyboard Handler to hide nav
if (window.visualViewport) {
  window.visualViewport.addEventListener("resize", () => {
    const isKeyboard = window.visualViewport.height < window.innerHeight * 0.75;
    document.body.classList.toggle("keyboard-open", isKeyboard);
  });
}

/* ==========================================================================
   OVERLAY ROOT HELPERS (Sheets, Modals, Toasts)
   ========================================================================== */

const overlayRoot = $("#overlay-root");

function closeOverlay() {
  overlayRoot.innerHTML = "";
}

function showSheet({ title, contentHtml, onRender }) {
  closeOverlay();
  const backdrop = document.createElement("div");
  backdrop.className = "sheet-backdrop";
  backdrop.innerHTML = `
    <div class="sheet" role="dialog" aria-modal="true">
      <div class="sheet__handle"></div>
      <div class="sheet__header">
        <h3 class="sheet__title">${title}</h3>
        <button class="btn btn--ghost btn--icon" id="sheet-close-btn" aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div class="sheet__body">
        ${contentHtml}
      </div>
    </div>
  `;
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) closeOverlay();
  });
  overlayRoot.appendChild(backdrop);
  const closeBtn = $("#sheet-close-btn", backdrop);
  if (closeBtn) closeBtn.onclick = closeOverlay;
  if (onRender) onRender(backdrop);
}

function showModal({ title, desc, confirmText = "Confirm", cancelText = "Cancel", onConfirm }) {
  closeOverlay();
  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop";
  backdrop.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true">
      <h3 class="modal__title">${title}</h3>
      <p class="modal__desc">${desc}</p>
      <div class="modal__actions">
        <button class="btn btn--secondary btn--sm" id="modal-cancel-btn">${cancelText}</button>
        <button class="btn btn--primary btn--sm" id="modal-confirm-btn">${confirmText}</button>
      </div>
    </div>
  `;
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) closeOverlay();
  });
  overlayRoot.appendChild(backdrop);
  $("#modal-cancel-btn", backdrop).onclick = closeOverlay;
  $("#modal-confirm-btn", backdrop).onclick = () => {
    closeOverlay();
    if (onConfirm) onConfirm();
  };
}

function showToast(message) {
  let container = $(".toast-container", overlayRoot);
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    overlayRoot.appendChild(container);
  }
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
    <span>${message}</span>
  `;
  container.appendChild(toast);
  setTimeout(() => {
    toast.remove();
    if (container.children.length === 0) container.remove();
  }, 2800);
}

/* ==========================================================================
   ROUTER & SCREEN MOUNT SYSTEM
   ========================================================================== */

const contentEl = $("#app-content");
const headerLeftEl = $("#header-left");
const headerRightEl = $("#header-right");
const navEl = $("#main-nav");

function setHeader({ title, brand = false, showBack = false, onBack, actionsHtml = "" }) {
  if (brand) {
    headerLeftEl.innerHTML = `
      <div class="app-header__brand" id="brand-home-btn">
        ${Icons.flameLogo(24)}
        <div class="intro__wordmark" style="font-size: 20px;">PUSH<span class="intro__dash" style="width: 14px; height: 4px;"></span>PA</div>
      </div>
    `;
    const brandBtn = $("#brand-home-btn", headerLeftEl);
    if (brandBtn) brandBtn.onclick = () => mountModeSelect();
  } else if (showBack) {
    headerLeftEl.innerHTML = `
      <button class="btn btn--ghost btn--icon" id="hdr-back-btn" aria-label="Go Back">
        ${Icons.back}
      </button>
      <h2 class="app-header__title">${title || ""}</h2>
    `;
    const backBtn = $("#hdr-back-btn", headerLeftEl);
    if (backBtn) backBtn.onclick = onBack || (() => window.history.back());
  } else {
    headerLeftEl.innerHTML = `<h2 class="app-header__title">${title || ""}</h2>`;
  }
  headerRightEl.innerHTML = actionsHtml;
}

function setNav(mode, activeTab = "") {
  if (!mode || ["auth", "about", "mode-select", "live-workout", "guided"].includes(mode)) {
    navEl.style.display = "none";
    navEl.innerHTML = "";
    return;
  }
  navEl.style.display = "grid";

  if (mode === "planner") {
    navEl.setAttribute("data-tabs", "4");
    navEl.innerHTML = `
      <button class="app-nav__tab ${activeTab === 'today' ? 'app-nav__tab--active' : ''}" id="nav-p-today">
        ${Icons.today}
        <span>Today</span>
      </button>
      <button class="app-nav__tab ${activeTab === 'plan' ? 'app-nav__tab--active' : ''}" id="nav-p-plan">
        ${Icons.plan}
        <span>Plan</span>
      </button>
      <button class="app-nav__tab ${activeTab === 'progress' ? 'app-nav__tab--active' : ''}" id="nav-p-progress">
        ${Icons.progress}
        <span>Progress</span>
      </button>
      <button class="app-nav__tab ${activeTab === 'profile' ? 'app-nav__tab--active' : ''}" id="nav-p-profile">
        ${Icons.profile}
        <span>Profile</span>
      </button>
    `;
    $("#nav-p-today").onclick = () => mountPlannerToday();
    $("#nav-p-plan").onclick = () => mountPlannerPlan();
    $("#nav-p-progress").onclick = () => mountPlannerProgress();
    $("#nav-p-profile").onclick = () => mountSettings("planner");
  } else if (mode === "logbook") {
    navEl.setAttribute("data-tabs", "4");
    navEl.innerHTML = `
      <button class="app-nav__tab ${activeTab === 'log' ? 'app-nav__tab--active' : ''}" id="nav-l-log">
        ${Icons.log}
        <span>Log</span>
      </button>
      <button class="app-nav__tab ${activeTab === 'history' ? 'app-nav__tab--active' : ''}" id="nav-l-history">
        ${Icons.history}
        <span>History</span>
      </button>
      <button class="app-nav__tab ${activeTab === 'reports' ? 'app-nav__tab--active' : ''}" id="nav-l-reports">
        ${Icons.reports}
        <span>Reports</span>
      </button>
      <button class="app-nav__tab ${activeTab === 'settings' ? 'app-nav__tab--active' : ''}" id="nav-l-settings">
        ${Icons.settings}
        <span>Settings</span>
      </button>
    `;
    $("#nav-l-log").onclick = () => mountLogbookLog();
    $("#nav-l-history").onclick = () => mountLogbookHistory();
    $("#nav-l-reports").onclick = () => mountLogbookReports();
    $("#nav-l-settings").onclick = () => mountSettings("logbook");
  }
}

function mountScreen(screenName, renderFn) {
  clearAllTimers();
  closeOverlay();
  currentScreen = screenName;
  contentEl.scrollTop = 0;
  contentEl.innerHTML = "";

  const container = document.createElement("div");
  container.className = `screen screen--${screenName}`;
  contentEl.appendChild(container);

  renderFn(container);
}

/* ==========================================================================
   MILESTONE 2: CINEMATIC INTRO ANIMATION
   ========================================================================== */

function checkAndRunIntro(onFinish) {
  const now = Date.now();
  const twelveHours = 12 * 60 * 60 * 1000;
  const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (state.lastIntroTimestamp && (now - state.lastIntroTimestamp < twelveHours)) {
    onFinish();
    return;
  }

  // Update timestamp
  state.lastIntroTimestamp = now;
  saveState(state);

  const intro = document.createElement("div");
  intro.className = "intro-overlay";
  intro.innerHTML = `
    <canvas class="intro__canvas" id="intro-canvas"></canvas>
    <div class="intro__flame-stage">
      ${Icons.flameLogo(180)}
    </div>
    <div class="intro__brand">
      <div class="intro__wordmark">
        <span>PUSH</span>
        <span class="intro__dash"></span>
        <span>PA</span>
      </div>
      <p class="intro__tagline">Train. Track. Burn.</p>
    </div>
    <div class="intro__skip">Tap anywhere to skip</div>
  `;

  overlayRoot.appendChild(intro);

  // Play audio whoosh
  if (window.pushpaAudio) {
    window.pushpaAudio.playIntroWhoosh();
  }

  // Canvas Ember Particles
  const canvas = $("#intro-canvas", intro);
  const ctx = canvas.getContext("2d");
  let animId = null;
  const particles = [];
  const pCount = window.innerWidth < 400 ? 25 : 50;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();

  for (let i = 0; i < pCount; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: canvas.height + Math.random() * 80,
      size: Math.random() * 2.5 + 1,
      speedY: Math.random() * 1.5 + 0.8,
      speedX: (Math.random() - 0.5) * 0.8,
      opacity: Math.random() * 0.7 + 0.3
    });
  }

  function drawEmbers() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      ctx.fillStyle = `rgba(255, 106, 0, ${p.opacity})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      p.y -= p.speedY;
      p.x += p.speedX;
      if (p.y < 0) {
        p.y = canvas.height + 10;
        p.x = Math.random() * canvas.width;
      }
    });
    animId = requestAnimationFrame(drawEmbers);
  }
  if (!isReduced) drawEmbers();

  let finished = false;
  function finishIntro() {
    if (finished) return;
    finished = true;
    if (animId) cancelAnimationFrame(animId);
    intro.classList.add("intro-overlay--fading");
    setTimeout(() => {
      intro.remove();
      onFinish();
    }, 450);
  }

  // Tap anywhere to skip
  intro.onclick = finishIntro;

  // Auto transition after ~4.8s (or 1.5s on reduced motion)
  setTimeout(finishIntro, isReduced ? 1500 : 4800);
}

/* ==========================================================================
   MILESTONE 3: AUTH, ABOUT YOU, MODE SELECT & SETTINGS
   ========================================================================== */

function mountAuth() {
  setHeader({ brand: true });
  setNav(null);

  mountScreen("auth", (container) => {
    let isSignUp = false;

    container.innerHTML = `
      <div class="auth-hero">
        <div class="auth-hero__logo">
          ${Icons.flameLogo(56)}
        </div>
        <h1 class="auth-hero__title">Welcome to PUSHPA</h1>
        <p class="auth-hero__tagline">Train. Track. Burn.</p>
      </div>

      <div class="auth-card">
        <div class="card__header">
          <h3 class="card__title" id="auth-title">Log In to Your Plan</h3>
          <button class="btn btn--secondary btn--sm" id="auth-toggle-mode">Sign Up</button>
        </div>

        <form id="auth-form" onsubmit="return false;" style="display: flex; flex-direction: column; gap: 14px;">
          <div class="form-group">
            <label class="form-label" for="auth-user">Username or Email</label>
            <input type="text" id="auth-user" class="form-input" placeholder="e.g. sathwik" required autocomplete="username">
            <div class="form-error" id="auth-user-err" style="display:none;"></div>
          </div>

          <div class="form-group">
            <label class="form-label" for="auth-pass">Password</label>
            <div class="form-input-wrap">
              <input type="password" id="auth-pass" class="form-input" placeholder="••••••••" required autocomplete="current-password">
              <button type="button" class="form-input__action" id="auth-eye-btn" aria-label="Toggle password visibility">
                ${Icons.eye}
              </button>
            </div>
            <div class="form-error" id="auth-pass-err" style="display:none;"></div>
          </div>

          <button type="submit" class="btn btn--primary btn--block" id="auth-submit-btn">Log In</button>
        </form>

        <div class="auth-card__divider">
          <div class="auth-card__divider-line"></div>
          <span class="auth-card__divider-text">OR</span>
          <div class="auth-card__divider-line"></div>
        </div>

        <button type="button" class="btn btn--secondary btn--block" id="auth-guest-btn">
          Continue as Guest (Instant Access)
        </button>
      </div>
    `;

    const titleEl = $("#auth-title", container);
    const toggleBtn = $("#auth-toggle-mode", container);
    const formEl = $("#auth-form", container);
    const userInput = $("#auth-user", container);
    const passInput = $("#auth-pass", container);
    const eyeBtn = $("#auth-eye-btn", container);
    const userErr = $("#auth-user-err", container);
    const passErr = $("#auth-pass-err", container);
    const submitBtn = $("#auth-submit-btn", container);
    const guestBtn = $("#auth-guest-btn", container);

    let passwordVisible = false;
    eyeBtn.onclick = () => {
      passwordVisible = !passwordVisible;
      passInput.type = passwordVisible ? "text" : "password";
      eyeBtn.innerHTML = passwordVisible ? Icons.eyeOff : Icons.eye;
    };

    toggleBtn.onclick = () => {
      isSignUp = !isSignUp;
      titleEl.textContent = isSignUp ? "Create Your Account" : "Log In to Your Plan";
      submitBtn.textContent = isSignUp ? "Create Account" : "Log In";
      toggleBtn.textContent = isSignUp ? "Sign In" : "Sign Up";
      userErr.style.display = "none";
      passErr.style.display = "none";
    };

    formEl.onsubmit = async () => {
      const u = userInput.value.trim();
      const p = passInput.value;
      userErr.style.display = "none";
      passErr.style.display = "none";

      if (isSignUp) {
        if (u.length < 3) {
          userErr.textContent = "Username must be at least 3 characters.";
          userErr.style.display = "block";
          return;
        }
        if (p.length < 6) {
          passErr.textContent = "Password must be at least 6 characters.";
          passErr.style.display = "block";
          return;
        }
        const pHash = await hashPassword(p);
        state.auth = {
          isLoggedIn: true,
          isGuest: false,
          username: u,
          passwordHash: pHash
        };
        if (!state.profile.name) state.profile.name = u;
        saveState(state);
        showToast("Account created successfully!");
        mountAbout();
      } else {
        // Sign In
        if (!u || !p) return;
        const pHash = await hashPassword(p);
        if (state.auth.username && state.auth.username.toLowerCase() === u.toLowerCase() && state.auth.passwordHash === pHash) {
          state.auth.isLoggedIn = true;
          state.auth.isGuest = false;
          saveState(state);
          showToast(`Welcome back, ${state.profile.name || u}!`);
          routeAfterAuth();
        } else {
          passErr.textContent = "Wrong username or password.";
          passErr.style.display = "block";
        }
      }
    };

    guestBtn.onclick = () => {
      state.auth = {
        isLoggedIn: true,
        isGuest: true,
        username: "Guest",
        passwordHash: ""
      };
      if (!state.profile.name) state.profile.name = "Athlete";
      saveState(state);
      showToast("Signed in as Guest");
      mountAbout();
    };
  });
}

function routeAfterAuth() {
  if (!state.profile.name || !state.profile.heightCm || !state.profile.weightKg) {
    mountAbout();
  } else if (state.settings.openLastModeAuto && state.currentMode === "planner") {
    mountPlannerToday();
  } else if (state.settings.openLastModeAuto && state.currentMode === "logbook") {
    mountLogbookLog();
  } else {
    mountModeSelect();
  }
}

function mountAbout() {
  setHeader({ title: "About You" });
  setNav(null);

  mountScreen("about", (container) => {
    let gender = state.profile.gender || "male";
    let unitH = state.profile.unitHeight || "cm";
    let unitW = state.profile.unitWeight || "kg";

    container.innerHTML = `
      <div class="about-header">
        <h1 class="about-header__title">About You</h1>
        <p class="about-header__subtitle">Your vitals tailor progression & calorie estimation.</p>
      </div>

      <div class="about-card">
        <div class="form-group">
          <label class="form-label" for="about-name">Your Name</label>
          <input type="text" id="about-name" class="form-input" placeholder="e.g. Sathwik" value="${state.profile.name || ''}" required>
        </div>

        <div class="form-group">
          <label class="form-label" for="about-age">Age</label>
          <input type="number" id="about-age" class="form-input tabular-num" placeholder="e.g. 24" value="${state.profile.age || ''}" required>
        </div>

        <div class="form-group">
          <label class="form-label">Gender</label>
          <div class="segmented-control" id="gender-segmented">
            <button type="button" class="segmented-control__item ${gender === 'male' ? 'segmented-control__item--active' : ''}" data-val="male">Male</button>
            <button type="button" class="segmented-control__item ${gender === 'female' ? 'segmented-control__item--active' : ''}" data-val="female">Female</button>
            <button type="button" class="segmented-control__item ${gender === 'other' ? 'segmented-control__item--active' : ''}" data-val="other">Other</button>
          </div>
        </div>

        <div class="about-grid-2">
          <div class="form-group">
            <label class="form-label" for="about-height">Height (${unitH})</label>
            <input type="number" id="about-height" class="form-input tabular-num" placeholder="${unitH === 'cm' ? '178' : '5.10'}" value="${state.profile.heightCm || ''}" required>
          </div>

          <div class="form-group">
            <label class="form-label" for="about-weight">Weight (${unitW})</label>
            <input type="number" id="about-weight" class="form-input tabular-num" placeholder="${unitW === 'kg' ? '74' : '163'}" value="${state.profile.weightKg || ''}" required>
          </div>
        </div>

        <button type="button" class="btn btn--primary btn--block" id="about-continue-btn" style="margin-top: 8px;">
          Continue
        </button>
      </div>
    `;

    $$("#gender-segmented .segmented-control__item", container).forEach(btn => {
      btn.onclick = () => {
        $$("#gender-segmented .segmented-control__item", container).forEach(b => b.classList.remove("segmented-control__item--active"));
        btn.classList.add("segmented-control__item--active");
        gender = btn.getAttribute("data-val");
      };
    });

    $("#about-continue-btn", container).onclick = () => {
      const name = $("#about-name", container).value.trim();
      const age = parseInt($("#about-age", container).value) || 24;
      const height = parseFloat($("#about-height", container).value) || 175;
      const weight = parseFloat($("#about-weight", container).value) || 72;

      if (!name) {
        showToast("Please enter your name.");
        return;
      }

      state.profile.name = name;
      state.profile.age = age;
      state.profile.gender = gender;
      state.profile.heightCm = height;
      state.profile.weightKg = weight;
      saveState(state);

      showToast("Profile vitals saved!");
      mountModeSelect();
    };
  });
}

function mountModeSelect() {
  setHeader({ brand: true });
  setNav(null);

  mountScreen("mode-select", (container) => {
    container.innerHTML = `
      <div class="mode-card" id="mode-planner-card">
        <div class="mode-card__illustration">
          ${Icons.calendarScene()}
        </div>
        <h2 class="mode-card__title">AI Planner</h2>
        <p class="mode-card__desc">Automated periodization, 5-col day map, double progression and volume heatmaps.</p>
      </div>

      <div class="mode-card" id="mode-logbook-card">
        <div class="mode-card__illustration">
          ${Icons.notebookScene()}
        </div>
        <h2 class="mode-card__title">Logbook</h2>
        <p class="mode-card__desc">Notion-style blank page tracking, autocomplete, last-time history and spark AI suggestions.</p>
      </div>
    `;

    $("#mode-planner-card", container).onclick = () => {
      state.currentMode = "planner";
      saveState(state);
      if (!state.planner.setupCompleted) {
        mountPlannerSetup();
      } else {
        mountPlannerToday();
      }
    };

    $("#mode-logbook-card", container).onclick = () => {
      state.currentMode = "logbook";
      saveState(state);
      if (!state.logbook.setupCompleted) {
        mountLogbookSetup();
      } else {
        mountLogbookLog();
      }
    };
  });
}

function mountSettings(sourceMode = "planner") {
  setHeader({
    title: "Settings & Profile",
    showBack: true,
    onBack: () => {
      if (sourceMode === "planner") mountPlannerToday();
      else if (sourceMode === "logbook") mountLogbookLog();
      else mountModeSelect();
    }
  });
  setNav(sourceMode, sourceMode === "planner" ? "profile" : "settings");

  mountScreen("settings", (container) => {
    const p = state.profile;
    const s = state.settings;

    container.innerHTML = `
      <!-- 1. Profile Vitals Section -->
      <div class="settings-section">
        <span class="settings-section__title">Athlete Vitals</span>
        <div class="card">
          <div class="form-group">
            <label class="form-label" for="set-name">Full Name</label>
            <input type="text" id="set-name" class="form-input" value="${p.name || ''}">
          </div>

          <div class="about-grid-2">
            <div class="form-group">
              <label class="form-label" for="set-age">Age</label>
              <input type="number" id="set-age" class="form-input tabular-num" value="${p.age || 24}">
            </div>
            <div class="form-group">
              <label class="form-label">Gender</label>
              <div class="segmented-control" id="set-gender-seg">
                <button type="button" class="segmented-control__item ${p.gender === 'male' ? 'segmented-control__item--active' : ''}" data-val="male">M</button>
                <button type="button" class="segmented-control__item ${p.gender === 'female' ? 'segmented-control__item--active' : ''}" data-val="female">F</button>
                <button type="button" class="segmented-control__item ${p.gender === 'other' ? 'segmented-control__item--active' : ''}" data-val="other">O</button>
              </div>
            </div>
          </div>

          <div class="about-grid-2">
            <div class="form-group">
              <label class="form-label" for="set-height">Height (${p.unitHeight || 'cm'})</label>
              <input type="number" id="set-height" class="form-input tabular-num" value="${p.heightCm || 175}">
            </div>
            <div class="form-group">
              <label class="form-label" for="set-weight">Weight (${p.unitWeight || 'kg'})</label>
              <input type="number" id="set-weight" class="form-input tabular-num" value="${p.weightKg || 74}">
            </div>
          </div>

          <button type="button" class="btn btn--secondary btn--sm" id="set-save-vitals">
            Save Vitals
          </button>
        </div>
      </div>

      <!-- 2. Training Mode Switch -->
      <div class="settings-section">
        <span class="settings-section__title">Training Mode</span>
        <div class="card">
          <div class="settings-row">
            <div>
              <div class="settings-row__label">Current: ${state.currentMode === 'planner' ? 'AI Planner' : 'Logbook'}</div>
              <div class="settings-row__desc">Switch between automated planner and free logbook</div>
            </div>
            <button class="btn btn--primary btn--sm" id="set-switch-mode">Switch Path</button>
          </div>
        </div>
      </div>

      <!-- 3. Appearance & Theme -->
      <div class="settings-section">
        <span class="settings-section__title">Appearance</span>
        <div class="card">
          <div class="form-group">
            <label class="form-label">Theme Mode</label>
            <div class="segmented-control" id="theme-seg">
              <button type="button" class="segmented-control__item ${s.theme === 'dark' ? 'segmented-control__item--active' : ''}" data-val="dark">Dark</button>
              <button type="button" class="segmented-control__item ${s.theme === 'light' ? 'segmented-control__item--active' : ''}" data-val="light">Light</button>
              <button type="button" class="segmented-control__item ${s.theme === 'system' ? 'segmented-control__item--active' : ''}" data-val="system">System</button>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Accent Swatch</label>
            <div class="swatches-grid" id="swatches-grid">
              <button type="button" class="swatch-btn swatch--red ${s.accent === 'red' ? 'swatch-btn--active' : ''}" data-val="red" aria-label="Red">${Icons.check}</button>
              <button type="button" class="swatch-btn swatch--rose ${s.accent === 'rose' ? 'swatch-btn--active' : ''}" data-val="rose" aria-label="Rose">${Icons.check}</button>
              <button type="button" class="swatch-btn swatch--blue ${s.accent === 'blue' ? 'swatch-btn--active' : ''}" data-val="blue" aria-label="Blue">${Icons.check}</button>
              <button type="button" class="swatch-btn swatch--teal ${s.accent === 'teal' ? 'swatch-btn--active' : ''}" data-val="teal" aria-label="Teal">${Icons.check}</button>
              <button type="button" class="swatch-btn swatch--violet ${s.accent === 'violet' ? 'swatch-btn--active' : ''}" data-val="violet" aria-label="Violet">${Icons.check}</button>
              <button type="button" class="swatch-btn swatch--graphite ${s.accent === 'graphite' ? 'swatch-btn--active' : ''}" data-val="graphite" aria-label="Graphite">${Icons.check}</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 4. Sound & Audio Level -->
      <div class="settings-section">
        <span class="settings-section__title">Sound & Haptics</span>
        <div class="card">
          <div class="form-group">
            <label class="form-label">Sound FX Level</label>
            <div class="segmented-control" id="sound-seg">
              <button type="button" class="segmented-control__item ${s.soundLevel === 'off' ? 'segmented-control__item--active' : ''}" data-val="off">Off</button>
              <button type="button" class="segmented-control__item ${s.soundLevel === 'low' ? 'segmented-control__item--active' : ''}" data-val="low">Low</button>
              <button type="button" class="segmented-control__item ${s.soundLevel === 'normal' ? 'segmented-control__item--active' : ''}" data-val="normal">Normal</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 5. Backup & Restore -->
      <div class="settings-section">
        <span class="settings-section__title">Local Backup & Restore</span>
        <div class="card">
          <p class="card__subtitle">Your training data stays on your device. Export regularly to save your logs.</p>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn--secondary btn--sm" id="btn-export-backup" style="flex:1;">Export (.JSON)</button>
            <button class="btn btn--secondary btn--sm" id="btn-restore-backup" style="flex:1;">Restore</button>
            <input type="file" id="file-restore-input" accept=".json" style="display:none;">
          </div>
        </div>
      </div>

      <!-- 6. Account Actions -->
      <div class="settings-section">
        <div class="card">
          <button class="btn btn--ghost btn--block" id="btn-sign-out" style="color: #EF4444;">Sign Out</button>
          <button class="btn btn--danger btn--block" id="btn-reset-data">Reset All Data</button>
        </div>
      </div>
    `;

    // Save vitals
    let genderVal = p.gender || "male";
    $$("#set-gender-seg .segmented-control__item", container).forEach(b => {
      b.onclick = () => {
        $$("#set-gender-seg .segmented-control__item", container).forEach(x => x.classList.remove("segmented-control__item--active"));
        b.classList.add("segmented-control__item--active");
        genderVal = b.getAttribute("data-val");
      };
    });

    $("#set-save-vitals", container).onclick = () => {
      state.profile.name = $("#set-name", container).value.trim() || state.profile.name;
      state.profile.age = parseInt($("#set-age", container).value) || state.profile.age;
      state.profile.gender = genderVal;
      state.profile.heightCm = parseFloat($("#set-height", container).value) || state.profile.heightCm;
      state.profile.weightKg = parseFloat($("#set-weight", container).value) || state.profile.weightKg;
      saveState(state);
      showToast("Profile vitals saved!");
    };

    // Switch Mode
    $("#set-switch-mode", container).onclick = () => mountModeSelect();

    // Theme Selector
    $$("#theme-seg .segmented-control__item", container).forEach(b => {
      b.onclick = () => {
        $$("#theme-seg .segmented-control__item", container).forEach(x => x.classList.remove("segmented-control__item--active"));
        b.classList.add("segmented-control__item--active");
        state.settings.theme = b.getAttribute("data-val");
        saveState(state);
        applyThemeAndAccent();
      };
    });

    // Swatches
    $$("#swatches-grid .swatch-btn", container).forEach(btn => {
      btn.onclick = () => {
        $$("#swatches-grid .swatch-btn", container).forEach(x => x.classList.remove("swatch-btn--active"));
        btn.classList.add("swatch-btn--active");
        state.settings.accent = btn.getAttribute("data-val");
        saveState(state);
        applyThemeAndAccent();
      };
    });

    // Sound Level
    $$("#sound-seg .segmented-control__item", container).forEach(b => {
      b.onclick = () => {
        $$("#sound-seg .segmented-control__item", container).forEach(x => x.classList.remove("segmented-control__item--active"));
        b.classList.add("segmented-control__item--active");
        state.settings.soundLevel = b.getAttribute("data-val");
        saveState(state);
        if (window.pushpaAudio) window.pushpaAudio.setLevel(state.settings.soundLevel);
        if (window.pushpaAudio && state.settings.soundLevel !== "off") {
          window.pushpaAudio.playSetTick();
        }
      };
    });

    // Backup & Restore
    $("#btn-export-backup", container).onclick = () => {
      exportJSON(state);
      showToast("Backup downloaded!");
    };

    const restoreInput = $("#file-restore-input", container);
    $("#btn-restore-backup", container).onclick = () => restoreInput.click();
    restoreInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        state = await importJSON(file);
        applyThemeAndAccent();
        showToast("Backup restored successfully!");
        mountSettings(sourceMode);
      } catch (err) {
        showToast("Failed to restore backup file.");
      }
    };

    // Sign out
    $("#btn-sign-out", container).onclick = () => {
      showModal({
        title: "Sign Out?",
        desc: "You will return to the login screen. Your local data remains saved on this device.",
        confirmText: "Sign Out",
        onConfirm: () => {
          state.auth.isLoggedIn = false;
          saveState(state);
          mountAuth();
        }
      });
    };

    // Reset All Data
    $("#btn-reset-data", container).onclick = () => {
      showModal({
        title: "Reset All Training Data?",
        desc: "This will permanently wipe all logs, programs, and settings. This action cannot be undone.",
        confirmText: "Reset Everything",
        onConfirm: () => {
          state = getDefaultState();
          saveState(state);
          applyThemeAndAccent();
          showToast("All data reset to factory defaults.");
          mountAuth();
        }
      });
    };
  });
}

/* ==========================================================================
   MILESTONE 4 & 5: AI PLANNER MODE & LIVE GYM WORKOUT
   ========================================================================== */

function mountPlannerSetup() {
  setHeader({ title: "Plan Setup (< 60s)" });
  setNav(null);

  mountScreen("planner-setup", (container) => {
    let days = state.planner.daysPerWeek || 4;
    let length = state.planner.programLength || 60;

    container.innerHTML = `
      <div class="card">
        <h2 class="card__title">Customize Your Program</h2>
        <p class="card__subtitle">Adaptive periodization tailored to your schedule.</p>

        <div class="form-group" style="margin-top: 10px;">
          <label class="form-label">Training Days Per Week</label>
          <div class="segmented-control" id="days-seg">
            <button type="button" class="segmented-control__item ${days === 3 ? 'segmented-control__item--active' : ''}" data-val="3">3 Days</button>
            <button type="button" class="segmented-control__item ${days === 4 ? 'segmented-control__item--active' : ''}" data-val="4">4 Days</button>
            <button type="button" class="segmented-control__item ${days === 5 ? 'segmented-control__item--active' : ''}" data-val="5">5 Days</button>
            <button type="button" class="segmented-control__item ${days === 6 ? 'segmented-control__item--active' : ''}" data-val="6">6 Days</button>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Program Length</label>
          <div class="segmented-control" id="len-seg">
            <button type="button" class="segmented-control__item ${length === 30 ? 'segmented-control__item--active' : ''}" data-val="30">30d</button>
            <button type="button" class="segmented-control__item ${length === 60 ? 'segmented-control__item--active' : ''}" data-val="60">60d</button>
            <button type="button" class="segmented-control__item ${length === 90 ? 'segmented-control__item--active' : ''}" data-val="90">90d</button>
            <button type="button" class="segmented-control__item ${length === 180 ? 'segmented-control__item--active' : ''}" data-val="180">180d</button>
          </div>
        </div>

        <button type="button" class="btn btn--primary btn--block" id="btn-finish-setup" style="margin-top: 14px;">
          Generate My Plan
        </button>
      </div>
    `;

    $$("#days-seg .segmented-control__item", container).forEach(b => {
      b.onclick = () => {
        $$("#days-seg .segmented-control__item", container).forEach(x => x.classList.remove("segmented-control__item--active"));
        b.classList.add("segmented-control__item--active");
        days = parseInt(b.getAttribute("data-val"));
      };
    });

    $$("#len-seg .segmented-control__item", container).forEach(b => {
      b.onclick = () => {
        $$("#len-seg .segmented-control__item", container).forEach(x => x.classList.remove("segmented-control__item--active"));
        b.classList.add("segmented-control__item--active");
        length = parseInt(b.getAttribute("data-val"));
      };
    });

    $("#btn-finish-setup", container).onclick = () => {
      state.planner.daysPerWeek = days;
      state.planner.programLength = length;
      state.planner.setupCompleted = true;
      saveState(state);
      showToast("Plan generated successfully!");
      mountPlannerToday();
    };
  });
}

function mountPlannerToday() {
  setHeader({
    title: "Today",
    actionsHtml: `
      <div class="app-header__btn" title="Streak">
        ${Icons.flameStreak(18)}
        <span class="tabular-num">${state.planner.completedDays.length}</span>
      </div>
    `
  });
  setNav("planner", "today");

  mountScreen("planner-today", (container) => {
    const curDay = state.planner.currentDay || 1;
    const isCompleted = state.planner.completedDays.includes(curDay);

    container.innerHTML = `
      <!-- 1. Hero Workout Card (ONE main action) -->
      <div class="today-hero">
        <div class="today-hero__badge">
          ${Icons.flameStreak(14)}
          <span>Day ${curDay} of ${state.planner.programLength}</span>
        </div>
        <h1 class="today-hero__title">Push Hypertrophy & Overload</h1>
        <div class="today-hero__meta">
          <span>~45 min</span>
          <span>•</span>
          <span>Chest, Delts, Triceps</span>
        </div>

        <div class="exercise-list">
          <div class="exercise-item">
            <span class="exercise-item__name">Barbell Bench Press</span>
            <span class="exercise-item__sets">3 × 8-10</span>
          </div>
          <div class="exercise-item">
            <span class="exercise-item__name">Incline Dumbbell Press</span>
            <span class="exercise-item__sets">3 × 10-12</span>
          </div>
          <div class="exercise-item">
            <span class="exercise-item__name">Cable Chest Flyes</span>
            <span class="exercise-item__sets">3 × 12-15</span>
          </div>
        </div>

        <button class="btn btn--primary btn--block" id="btn-start-gym-workout">
          ${isCompleted ? 'Repeat Workout' : 'Start Workout'}
        </button>
      </div>

      <!-- 2. Home Workout Row -->
      <div class="home-workout-row" id="row-home-workout">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 40px; height: 40px; border-radius: 10px; background-color: var(--s2); display: flex; align-items: center; justify-content: center;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
          </div>
          <div>
            <div style="font-weight: 700; color: var(--tx);">Guided Home Workout</div>
            <div style="font-size: 12px; color: var(--dim);">No equipment • 2D animated skeleton</div>
          </div>
        </div>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--dim)" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
      </div>

      <!-- 3. Compact Body Map -->
      <div class="bodymap-container">
        <div style="display: flex; justify-content: space-between; width: 100%; align-items: center;">
          <span class="caption">Weekly Muscle Volume</span>
          <span style="font-size: 12px; color: var(--accent); font-weight: 600;">9 Direct Sets</span>
        </div>
        <svg class="bodymap-svg" viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Head & Torso -->
          <circle cx="100" cy="30" r="16" fill="var(--s2)" stroke="var(--line)"/>
          <path class="muscle-path muscle-path--active" d="M75 55 H125 L120 110 H80 Z"/>
          <!-- Arms -->
          <path class="muscle-path muscle-path--active" d="M60 60 L72 58 L68 110 L56 110 Z"/>
          <path class="muscle-path muscle-path--active" d="M140 60 L128 58 L132 110 L144 110 Z"/>
          <!-- Legs -->
          <path class="muscle-path" d="M80 115 H98 L94 210 H80 Z"/>
          <path class="muscle-path" d="M102 115 H120 L120 210 H106 Z"/>
        </svg>
      </div>
    `;

    $("#btn-start-gym-workout", container).onclick = () => {
      mountLiveWorkout({ dayNumber: curDay, name: "Push Hypertrophy & Overload" });
    };

    $("#row-home-workout", container).onclick = () => {
      mountGuided();
    };
  });
}

function mountPlannerPlan() {
  setHeader({ title: "Program Plan" });
  setNav("planner", "plan");

  mountScreen("planner-plan", (container) => {
    const totalDays = state.planner.programLength || 60;
    const completed = state.planner.completedDays || [];
    const curDay = state.planner.currentDay || 1;
    const pct = Math.round((completed.length / totalDays) * 100);

    // Build 5-column Day Map cells
    let cellsHtml = "";
    for (let d = 1; d <= totalDays; d++) {
      const isDone = completed.includes(d);
      const isCur = d === curDay;
      const isLocked = d > curDay && !isDone;
      const isRest = d % 7 === 0;

      let cls = "daymap__cell";
      let inner = `${d}`;

      if (isDone) {
        cls += " daymap__cell--done";
        inner = Icons.check;
      } else if (isCur) {
        cls += " daymap__cell--current";
      } else if (isRest) {
        cls += " daymap__cell--rest";
      } else if (isLocked) {
        cls += " daymap__cell--locked";
        inner = Icons.lock;
      }

      cellsHtml += `<button class="${cls}" data-day="${d}" aria-label="Day ${d}">${inner}</button>`;
    }

    container.innerHTML = `
      <!-- Sticky Progress Card -->
      <div class="plan-progress-card">
        <div class="plan-progress-card__header">
          <span style="font-weight: 800; font-size: 16px;">Day ${curDay} of ${totalDays}</span>
          <span class="tabular-num" style="color: var(--accent); font-weight: 700;">${pct}%</span>
        </div>
        <div class="plan-progress-card__bar-wrap">
          <div class="plan-progress-card__bar" style="width: ${pct}%;"></div>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
          <span class="caption">Program Grid</span>
          <span class="caption">5 Columns</span>
        </div>
      </div>

      <!-- 5-Column Day Map Grid -->
      <div class="daymap" id="plan-daymap">
        ${cellsHtml}
      </div>
    `;

    // Click handler for Day Map cells
    $$("#plan-daymap .daymap__cell", container).forEach(btn => {
      btn.onclick = () => {
        const d = parseInt(btn.getAttribute("data-day"));
        const isDone = completed.includes(d);
        const isCur = d === curDay;
        const isLocked = d > curDay && !isDone;

        showSheet({
          title: `Day ${d} Session`,
          contentHtml: `
            <div style="display:flex; flex-direction:column; gap:12px;">
              <div style="font-size:15px; font-weight:700; color:var(--tx);">
                ${d % 7 === 0 ? 'Active Rest & Recovery' : 'Push Hypertrophy & Overload'}
              </div>
              <p style="font-size:13px; color:var(--dim);">
                ${isDone ? 'Completed! Great work on progressive overload.' : (isLocked ? `Unlocks after completing Day ${d - 1}.` : 'Ready to train.')}
              </p>
              <button class="btn btn--primary btn--block" id="sheet-start-day-btn" ${isLocked ? 'disabled' : ''}>
                ${isDone ? 'Repeat Workout' : 'Start Workout'}
              </button>
            </div>
          `,
          onRender: (sheet) => {
            const startBtn = $("#sheet-start-day-btn", sheet);
            if (startBtn) {
              startBtn.onclick = () => {
                closeOverlay();
                mountLiveWorkout({ dayNumber: d, name: "Push Hypertrophy & Overload" });
              };
            }
          }
        });
      };
    });
  });
}

function mountPlannerProgress() {
  setHeader({ title: "Progress & Overload" });
  setNav("planner", "progress");

  mountScreen("planner-progress", (container) => {
    const completedCount = state.planner.completedDays.length;
    const totalDays = state.planner.programLength || 60;

    container.innerHTML = `
      <div class="card">
        <h3 class="card__title">Consistency Overview</h3>
        <div style="display: flex; gap: 12px; align-items: center; margin-top: 8px;">
          <div class="stat-card" style="flex: 1;">
            <span class="stat-card__label">Sessions</span>
            <span class="stat-card__val">${completedCount}</span>
          </div>
          <div class="stat-card" style="flex: 1;">
            <span class="stat-card__label">Current Streak</span>
            <span class="stat-card__val">${completedCount > 0 ? completedCount : 0}d</span>
          </div>
          <div class="stat-card" style="flex: 1;">
            <span class="stat-card__label">Total Target</span>
            <span class="stat-card__val">${totalDays}d</span>
          </div>
        </div>
      </div>

      <!-- Estimated 1RM Progression Chart (SVG) -->
      <div class="card">
        <div class="card__header">
          <h3 class="card__title">Bench Press E1RM Trend</h3>
          <span class="chip chip--accent">+5.2 kg</span>
        </div>
        <div class="chart-container">
          <svg width="100%" height="100%" viewBox="0 0 300 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="0" y1="110" x2="300" y2="110" stroke="var(--line)" stroke-width="1"/>
            <line x1="0" y1="60" x2="300" y2="60" stroke="var(--line)" stroke-width="1" stroke-dasharray="4"/>
            <polyline points="20,95 80,85 140,75 200,60 260,40" stroke="var(--accent)" stroke-width="3" fill="none"/>
            <circle cx="20" cy="95" r="4" fill="var(--accent)"/>
            <circle cx="80" cy="85" r="4" fill="var(--accent)"/>
            <circle cx="140" cy="75" r="4" fill="var(--accent)"/>
            <circle cx="200" cy="60" r="4" fill="var(--accent)"/>
            <circle cx="260" cy="40" r="4" fill="var(--accent)"/>
          </svg>
        </div>
        <p style="font-size: 13px; color: var(--dim); margin-top: 6px;">
          Your upper body strength has increased by 6.8% over the last 4 weeks.
        </p>
      </div>
    `;
  });
}

function mountLiveWorkout({ dayNumber = 1, name = "Push Hypertrophy" } = {}) {
  let seconds = 0;
  setHeader({
    title: `Day ${dayNumber}`,
    showBack: true,
    onBack: () => {
      showModal({
        title: "Leave Workout?",
        desc: "Your progress for unlogged sets will be discarded.",
        confirmText: "Leave",
        onConfirm: () => mountPlannerToday()
      });
    },
    actionsHtml: `
      <button class="btn btn--primary btn--sm" id="btn-finish-live-workout">Finish</button>
    `
  });
  setNav(null);

  mountScreen("live-workout", (container) => {
    let sets = [
      { num: 1, weight: 70, reps: 10, done: false, effort: "good" },
      { num: 2, weight: 70, reps: 10, done: false, effort: "good" },
      { num: 3, weight: 70, reps: 8, done: false, effort: "good" }
    ];

    container.innerHTML = `
      <div class="workout-exercise-card">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <h2 class="workout-exercise-card__title">Barbell Bench Press</h2>
          <span class="tabular-num" id="live-timer-display" style="font-size:16px; font-weight:700; color:var(--accent);">00:00</span>
        </div>
        <p class="workout-exercise-card__cues">Retract scapulae into bench, drive feet into floor, control descent.</p>

        <!-- Set Table Grid -->
        <div class="set-grid-header">
          <span>Set</span>
          <span>Kg</span>
          <span>Reps</span>
          <span>Check</span>
        </div>

        <div style="display: flex; flex-direction: column; gap: 8px;" id="sets-container">
          <!-- Populated dynamically -->
        </div>

        <!-- Effort Pills Selector for active set -->
        <div class="effort-selector" id="effort-selector">
          <button class="effort-pill effort-pill--easy" data-effort="easy">Easy</button>
          <button class="effort-pill effort-pill--good effort-pill--active" data-effort="good">Good</button>
          <button class="effort-pill effort-pill--hard" data-effort="hard">Hard</button>
        </div>
      </div>

      <!-- Docked Rest Timer Bar (Layout, NOT floating) -->
      <div class="rest-timer-bar" id="docked-rest-timer">
        <div>
          <span class="caption">Rest Timer</span>
          <div class="rest-timer-bar__countdown" id="rest-countdown-txt">01:30</div>
        </div>
        <div class="rest-timer-bar__controls">
          <button class="btn btn--secondary btn--sm" id="btn-rest-plus15">+15s</button>
          <button class="btn btn--primary btn--sm" id="btn-rest-skip">Skip</button>
        </div>
      </div>

      <!-- Workout Tools Row -->
      <div class="workout-tools-row">
        <button class="btn btn--secondary btn--sm" id="btn-plate-calc">Plate Calc</button>
        <button class="btn btn--secondary btn--sm" id="btn-warmup-ladder">Warm-up</button>
      </div>
    `;

    // Timer display interval
    liveWorkoutTimer = setInterval(() => {
      seconds++;
      const m = String(Math.floor(seconds / 60)).padStart(2, "0");
      const s = String(seconds % 60).padStart(2, "0");
      const el = $("#live-timer-display", container);
      if (el) el.textContent = `${m}:${s}`;
    }, 1000);

    const setsContainer = $("#sets-container", container);

    function renderSets() {
      setsContainer.innerHTML = "";
      sets.forEach((set, idx) => {
        const row = document.createElement("div");
        row.className = `set-grid-row ${set.done ? 'set-grid-row--completed' : ''}`;
        row.innerHTML = `
          <span class="set-grid-row__num">${set.num}</span>
          <input type="number" class="set-grid-row__input set-weight-input" value="${set.weight}">
          <input type="number" class="set-grid-row__input set-reps-input" value="${set.reps}">
          <button class="set-grid-row__check" data-idx="${idx}" aria-label="Toggle set done">
            ${Icons.check}
          </button>
        `;
        setsContainer.appendChild(row);

        $(".set-grid-row__check", row).onclick = () => {
          set.done = !set.done;
          if (set.done && window.pushpaAudio) {
            window.pushpaAudio.playSetTick();
            startRestTimer(90);
          }
          renderSets();
        };
      });
    }
    renderSets();

    // Rest Timer Logic
    let restRemaining = 90;
    function startRestTimer(dur) {
      if (restTimer) clearInterval(restTimer);
      restRemaining = dur;
      updateRestUI();
      restTimer = setInterval(() => {
        restRemaining--;
        if (restRemaining <= 0) {
          clearInterval(restTimer);
          restTimer = null;
          if (window.pushpaAudio) window.pushpaAudio.playRestChime();
        }
        updateRestUI();
      }, 1000);
    }

    function updateRestUI() {
      const txt = $("#rest-countdown-txt", container);
      if (!txt) return;
      const m = String(Math.floor(Math.max(0, restRemaining) / 60)).padStart(2, "0");
      const s = String(Math.max(0, restRemaining) % 60).padStart(2, "0");
      txt.textContent = `${m}:${s}`;
    }

    $("#btn-rest-plus15", container).onclick = () => {
      restRemaining += 15;
      updateRestUI();
    };

    $("#btn-rest-skip", container).onclick = () => {
      if (restTimer) clearInterval(restTimer);
      restTimer = null;
      restRemaining = 0;
      updateRestUI();
    };

    // Tools: Plate Calc
    $("#btn-plate-calc", container).onclick = () => {
      const plates = calculatePlates(70, 20);
      showSheet({
        title: "Plate Calculator (70 kg)",
        contentHtml: `
          <div style="display:flex; flex-direction:column; gap:12px;">
            <p style="font-size:14px; color:var(--dim);">Olympic Barbell: 20 kg</p>
            <div style="font-size:15px; font-weight:700; color:var(--tx);">
              Each side requires 25 kg:
            </div>
            <div style="display:flex; gap:8px;">
              <span class="chip chip--accent">1 × 20 kg</span>
              <span class="chip chip--accent">1 × 5 kg</span>
            </div>
          </div>
        `
      });
    };

    // Tools: Warmup Ladder
    $("#btn-warmup-ladder", container).onclick = () => {
      const ladder = generateWarmupLadder(70, 20);
      let rowsHtml = ladder.map(step => `
        <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid var(--line);">
          <span>${step.reps} reps @ ${step.weight} kg</span>
          <span style="color:var(--dim);">${step.pct}% load</span>
        </div>
      `).join("");

      showSheet({
        title: "Warm-Up Ladder",
        contentHtml: `<div>${rowsHtml}</div>`
      });
    };

    // Finish Workout
    $("#btn-finish-live-workout").onclick = () => {
      if (!state.planner.completedDays.includes(dayNumber)) {
        state.planner.completedDays.push(dayNumber);
      }
      state.planner.currentDay = Math.min(state.planner.programLength, dayNumber + 1);
      saveState(state);

      showModal({
        title: "Workout Complete!",
        desc: "All sets logged. Progressive overload targets have been updated for your next session.",
        confirmText: "Done",
        onConfirm: () => mountPlannerToday()
      });
    };
  });
}

/* ==========================================================================
   MILESTONE 6: NOTION-STYLE FREE LOGBOOK MODE
   ========================================================================== */

function mountLogbookSetup() {
  setHeader({ title: "Logbook Split Setup" });
  setNav(null);

  mountScreen("logbook-setup", (container) => {
    container.innerHTML = `
      <div class="card">
        <h2 class="card__title">Choose Weekly Split</h2>
        <p class="card__subtitle">Your default routine for freeform tracking.</p>

        <div style="display:flex; flex-direction:column; gap:10px; margin-top:8px;">
          <button class="btn btn--secondary btn--block" id="btn-split-ppl">Push / Pull / Legs (6-Day)</button>
          <button class="btn btn--secondary btn--block" id="btn-split-ul">Upper / Lower (4-Day)</button>
          <button class="btn btn--secondary btn--block" id="btn-split-fb">Full Body (3-Day)</button>
        </div>
      </div>
    `;

    $("#btn-split-ppl", container).onclick = () => {
      state.logbook.setupCompleted = true;
      saveState(state);
      showToast("Split saved: Push / Pull / Legs");
      mountLogbookLog();
    };
    $("#btn-split-ul", container).onclick = () => {
      state.logbook.setupCompleted = true;
      saveState(state);
      showToast("Split saved: Upper / Lower");
      mountLogbookLog();
    };
    $("#btn-split-fb", container).onclick = () => {
      state.logbook.setupCompleted = true;
      saveState(state);
      showToast("Split saved: Full Body");
      mountLogbookLog();
    };
  });
}

function mountLogbookLog() {
  const dayNames = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const curDayKey = dayNames[new Date().getDay()];
  const suggestion = getSuggestedSessionForDay(DEFAULT_LAYOUT, [], curDayKey);

  setHeader({
    title: "Free Logbook",
    actionsHtml: `
      <button class="btn btn--primary btn--sm" id="btn-finish-log">Finish</button>
    `
  });
  setNav("logbook", "log");

  mountScreen("logbook", (container) => {
    let exerciseBlocks = [
      {
        id: "ex_1",
        name: "Incline Dumbbell Press",
        lastTime: "Nov 18: 3 × 10 @ 32 kg • RPE 8.5",
        sets: [{ weight: "", reps: "", feel: "" }]
      }
    ];

    container.innerHTML = `
      <!-- Session Selector Bar -->
      <div class="logbook-session-bar">
        <div>
          <span class="caption">Today's Session</span>
          <div class="logbook-session-chip" id="session-chip">
            <span>${suggestion.sessionName}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
        </div>
        <span class="caption">${new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
      </div>

      <!-- Add Exercise Autocomplete Input -->
      <div class="exercise-search-wrap">
        <input type="text" id="log-exercise-search" class="form-input" placeholder="Type exercise name to add...">
        <div class="exercise-autocomplete-dropdown" id="log-autocomplete" style="display:none;"></div>
      </div>

      <!-- Exercise Log Blocks Container -->
      <div id="exercise-blocks-container" style="display:flex; flex-direction:column; gap:16px;"></div>
    `;

    const blocksContainer = $("#exercise-blocks-container", container);

    function renderBlocks() {
      blocksContainer.innerHTML = "";
      exerciseBlocks.forEach((block, bIdx) => {
        const card = document.createElement("div");
        card.className = "log-block";
        card.innerHTML = `
          <div class="log-block__header">
            <h3 class="log-block__title">${block.name}</h3>
            <div class="log-block__actions">
              <button class="spark-btn" data-bidx="${bIdx}" title="AI Overload Suggestion">
                ${Icons.spark}
              </button>
              <button class="btn btn--ghost btn--icon" data-delblock="${bIdx}" aria-label="Delete Exercise" style="width:32px; height:32px;">
                ${Icons.trash}
              </button>
            </div>
          </div>

          <!-- Display-only Quiet Last Time Reference Line -->
          <div class="last-time-ref">
            <span>Last time: <b>${block.lastTime}</b></span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
          </div>

          <div id="spark-container-${bIdx}"></div>

          <!-- Sets Table -->
          <div class="log-table">
            <div class="log-table__header">
              <span>Set</span>
              <span>Kg</span>
              <span>Reps</span>
              <span>Feel</span>
              <span></span>
            </div>
            <div id="sets-list-${bIdx}" style="display:flex; flex-direction:column; gap:6px;">
              ${block.sets.map((s, sIdx) => `
                <div class="log-table__row">
                  <span style="font-weight:700; color:var(--dim); text-align:center;">${sIdx + 1}</span>
                  <input type="number" class="log-table__input" placeholder="-" value="${s.weight || ''}">
                  <input type="number" class="log-table__input" placeholder="-" value="${s.reps || ''}">
                  <input type="text" class="log-table__input" placeholder="Good" value="${s.feel || ''}">
                  <button class="log-table__delete-btn" data-delset="${bIdx}:${sIdx}">${Icons.trash}</button>
                </div>
              `).join("")}
            </div>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px;">
            <button class="btn btn--ghost btn--sm" data-addset="${bIdx}">+ Add Set</button>
            <input type="text" class="form-input" style="flex:1; max-width:200px; min-height:34px; font-size:12px;" placeholder="Remark (optional)...">
          </div>
        `;
        blocksContainer.appendChild(card);

        // Add set
        $(`[data-addset="${bIdx}"]`, card).onclick = () => {
          block.sets.push({ weight: "", reps: "", feel: "" });
          renderBlocks();
        };

        // Delete set
        $$(`[data-delset]`, card).forEach(btn => {
          btn.onclick = () => {
            const [b, s] = btn.getAttribute("data-delset").split(":").map(Number);
            exerciseBlocks[b].sets.splice(s, 1);
            renderBlocks();
          };
        });

        // Delete block
        $(`[data-delblock="${bIdx}"]`, card).onclick = () => {
          exerciseBlocks.splice(bIdx, 1);
          renderBlocks();
        };

        // Spark Suggestion Popover
        $(`.spark-btn[data-bidx="${bIdx}"]`, card).onclick = () => {
          const sparkBox = $(`#spark-container-${bIdx}`, card);
          if (sparkBox.innerHTML) {
            sparkBox.innerHTML = "";
            return;
          }
          const sugg = getExerciseSuggestion({
            exerciseName: block.name,
            history: [{ weight: 32, reps: 10, feel: "easy", sets: 3 }]
          });

          sparkBox.innerHTML = `
            <div class="spark-popover">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="font-weight:700; color:var(--accent);">AI Overload Spark</span>
                <span class="chip chip--accent" style="font-size:10px;">${sugg.action}</span>
              </div>
              <p style="font-size:12px; color:var(--tx);">${sugg.explanation}</p>
              <button class="btn btn--primary btn--sm" id="btn-apply-spark-${bIdx}">Apply Suggestion</button>
            </div>
          `;

          $(`#btn-apply-spark-${bIdx}`, sparkBox).onclick = () => {
            block.sets.forEach(s => {
              if (sugg.targetWeight) s.weight = sugg.targetWeight;
              if (sugg.targetReps) s.reps = sugg.targetReps;
            });
            sparkBox.innerHTML = "";
            renderBlocks();
            showToast("Applied AI suggestion to sets!");
          };
        };
      });
    }
    renderBlocks();

    // Autocomplete handling
    const searchInput = $("#log-exercise-search", container);
    const dropEl = $("#log-autocomplete", container);

    searchInput.oninput = () => {
      const q = searchInput.value.trim().toLowerCase();
      if (!q) {
        dropEl.style.display = "none";
        return;
      }
      const matches = EXERCISE_LIBRARY.filter(e => e.name.toLowerCase().includes(q)).slice(0, 5);
      if (matches.length === 0) {
        dropEl.innerHTML = `<div class="autocomplete-item" id="auto-create">Create custom: "<b>${searchInput.value}</b>"</div>`;
      } else {
        dropEl.innerHTML = matches.map(m => `<div class="autocomplete-item" data-name="${m.name}">${m.name}</div>`).join("");
      }
      dropEl.style.display = "block";

      $$(".autocomplete-item", dropEl).forEach(item => {
        item.onclick = () => {
          const exName = item.getAttribute("data-name") || searchInput.value.trim();
          exerciseBlocks.push({
            id: `ex_${Date.now()}`,
            name: exName,
            lastTime: "First time logging this move",
            sets: [{ weight: "", reps: "", feel: "" }]
          });
          searchInput.value = "";
          dropEl.style.display = "none";
          renderBlocks();
        };
      });
    };

    // Finish session
    $("#btn-finish-log").onclick = () => {
      showModal({
        title: "Finish & Save Session?",
        desc: "All logged exercises will be archived to your history and consistency streak.",
        confirmText: "Finish",
        onConfirm: () => {
          state.logbook.logs.push({
            date: new Date().toISOString(),
            session: suggestion.sessionName,
            exercises: exerciseBlocks
          });
          saveState(state);
          showToast("Session saved to History!");
          mountLogbookHistory();
        }
      });
    };
  });
}

function mountLogbookHistory() {
  setHeader({ title: "History Timeline" });
  setNav("logbook", "history");

  mountScreen("logbook-history", (container) => {
    container.innerHTML = `
      <div class="card">
        <h3 class="card__title">Past Workout Logs</h3>
        <p class="card__subtitle">Grouped chronologically by completion date.</p>
      </div>

      <div class="history-item">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-weight:800; font-size:16px;">Push Overload</span>
          <span class="caption">Nov 21, 2026</span>
        </div>
        <div style="font-size:13px; color:var(--dim);">
          • Incline Dumbbell Press (3 × 10 @ 32 kg)<br>
          • Barbell Overhead Press (3 × 8 @ 45 kg)<br>
          • Tricep Rope Extensions (3 × 12 @ 22 kg)
        </div>
      </div>

      <div class="history-item">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-weight:800; font-size:16px;">Pull & Posterior</span>
          <span class="caption">Nov 19, 2026</span>
        </div>
        <div style="font-size:13px; color:var(--dim);">
          • Weighted Pull-Ups (3 × 6 @ +10 kg)<br>
          • Barbell Chest-Supported Rows (3 × 10 @ 65 kg)<br>
          • Incline Dumbbell Curls (3 × 10 @ 14 kg)
        </div>
      </div>
    `;
  });
}

function mountLogbookReports() {
  setHeader({ title: "Reports & Overload" });
  setNav("logbook", "reports");

  mountScreen("logbook-reports", (container) => {
    container.innerHTML = `
      <div class="card">
        <h3 class="card__title">Consistency Report</h3>
        <div style="display:flex; gap:10px; margin-top:8px;">
          <div class="stat-card" style="flex:1;">
            <span class="stat-card__label">Consistency</span>
            <span class="stat-card__val">92%</span>
          </div>
          <div class="stat-card" style="flex:1;">
            <span class="stat-card__label">This Week</span>
            <span class="stat-card__val">5/6</span>
          </div>
          <div class="stat-card" style="flex:1;">
            <span class="stat-card__label">Streak</span>
            <span class="stat-card__val">3 wks</span>
          </div>
        </div>
        <p style="font-size:13px; color:var(--dim); margin-top:10px;">
          You completed 92% of scheduled sessions over the past 4 weeks with zero missed push days.
        </p>
      </div>
    `;
  });
}

/* ==========================================================================
   MILESTONE 7: GUIDED HOME WORKOUTS & 2D SKELETON
   ========================================================================== */

function mountGuided() {
  setHeader({
    title: "Guided Home Workout",
    showBack: true,
    onBack: () => mountPlannerToday()
  });
  setNav(null);

  mountScreen("guided", (container) => {
    let currentRoutineKey = "full_body";
    let routine = GUIDED_ROUTINES[currentRoutineKey];
    let moveIdx = 0;
    let secondsLeft = 30;
    let isPaused = false;

    const allMoves = [...routine.warmup, ...routine.main, ...routine.cooldown];
    let activeMove = GUIDED_MOVES.find(m => m.id === allMoves[moveIdx]) || GUIDED_MOVES[0];

    container.innerHTML = `
      <!-- Top Stage with 2D Character Animation -->
      <div class="character-stage">
        <svg class="character-svg" viewBox="0 0 200 200" fill="none" id="char-canvas">
          <!-- Torso & Head -->
          <circle cx="100" cy="50" r="14" fill="#E5E5E5"/>
          <line x1="100" y1="64" x2="100" y2="120" stroke="#E5E5E5" stroke-width="8" stroke-linecap="round"/>
          
          <!-- Limbs with Joint Angles -->
          <line id="joint-arm-l" x1="100" y1="75" x2="65" y2="100" stroke="#FF6A00" stroke-width="6" stroke-linecap="round"/>
          <line id="joint-arm-r" x1="100" y1="75" x2="135" y2="100" stroke="#FF6A00" stroke-width="6" stroke-linecap="round"/>
          <line id="joint-leg-l" x1="100" y1="120" x2="80" y2="175" stroke="#E5E5E5" stroke-width="6" stroke-linecap="round"/>
          <line id="joint-leg-r" x1="100" y1="120" x2="120" y2="175" stroke="#E5E5E5" stroke-width="6" stroke-linecap="round"/>
        </svg>
      </div>

      <!-- Move Info Card -->
      <div class="move-info-card">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <h2 class="move-info-card__title" id="guided-move-name">${activeMove.name}</h2>
          <span class="guided-calorie-pill tabular-num" id="guided-calories">~24 kcal</span>
        </div>
        <div class="move-info-card__target tabular-num" id="guided-countdown">00:30</div>
        <p class="move-info-card__cues" id="guided-cues">${activeMove.cues[0] || 'Keep core tight.'}</p>
      </div>

      <!-- Controls Row: Skip | Pause | Done -->
      <div class="guided-controls-row">
        <button class="btn btn--secondary" id="guided-skip-btn">Skip</button>
        <button class="btn btn--secondary" id="guided-pause-btn">Pause</button>
        <button class="btn btn--primary" id="guided-done-btn">Done</button>
      </div>
    `;

    // Guided countdown loop
    guidedTimer = setInterval(() => {
      if (isPaused) return;
      secondsLeft--;
      if (secondsLeft <= 0) {
        nextMove();
      }
      updateGuidedUI();
    }, 1000);

    function updateGuidedUI() {
      const countEl = $("#guided-countdown", container);
      if (countEl) {
        countEl.textContent = `00:${String(Math.max(0, secondsLeft)).padStart(2, "0")}`;
      }
    }

    function nextMove() {
      moveIdx++;
      if (moveIdx >= allMoves.length) {
        clearInterval(guidedTimer);
        showModal({
          title: "Home Workout Complete!",
          desc: "Great energy. How did it feel? (Helps calibrate future moves)",
          confirmText: "Save & Finish",
          onConfirm: () => mountPlannerToday()
        });
        return;
      }
      activeMove = GUIDED_MOVES.find(m => m.id === allMoves[moveIdx]) || GUIDED_MOVES[0];
      secondsLeft = activeMove.defaultDuration || 30;
      $("#guided-move-name", container).textContent = activeMove.name;
      $("#guided-cues", container).textContent = activeMove.cues[0] || "Focus on form.";
      if (window.pushpaAudio) window.pushpaAudio.playSetTick();
      updateGuidedUI();
    }

    $("#guided-skip-btn", container).onclick = nextMove;
    $("#guided-done-btn", container).onclick = nextMove;
    $("#guided-pause-btn", container).onclick = () => {
      isPaused = !isPaused;
      $("#guided-pause-btn", container).textContent = isPaused ? "Resume" : "Pause";
    };
  });
}

/* ==========================================================================
   APPLICATION ENTRYPOINT
   ========================================================================== */

function initApp() {
  applyThemeAndAccent();

  // If user is logged in and intro not needed, route directly
  if (state.auth && state.auth.isLoggedIn) {
    checkAndRunIntro(() => {
      routeAfterAuth();
    });
  } else {
    checkAndRunIntro(() => {
      mountAuth();
    });
  }
}

// Kickoff
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}
