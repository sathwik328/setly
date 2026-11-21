/**
 * SETLY APPLICATION CONTROLLER — ROUND 2 & 3 COMPLETE ARCHITECTURE
 * Local-First, Full Day-Map, Motion Design, Audio FX, Body Map Heatmap, PWA
 */

import {
  STORAGE_KEY,
  getDefaultState,
  loadState,
  saveState,
  exportJSON,
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

// Global Persistent Application State
let state = loadState();

// Global Runtime State
let deferredPrompt = null;
let liveWorkoutInterval = null;
let liveWorkoutStartTime = 0;
let restTimerInterval = null;
let restTimerTargetTime = 0;
let restTimerTotalDuration = 90;
let audioCtx = null;
let isAudioMuted = !state.settings.soundEnabled;

// DOM Helper shortcuts
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ==========================================================================
   AUDIO ENGINE (Web Audio API Synthesizer)
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
  } catch (e) {
    console.log("Audio play error", e);
  }
}

export const S = {
  tap: () => tone(520, 0, 0.07, 0.05),
  tab: () => tone(660, 0, 0.09, 0.05),
  open: () => {
    tone(440, 0, 0.1, 0.05);
    tone(660, 0.07, 0.12, 0.05);
  },
  done: () => {
    tone(660, 0, 0.12, 0.08);
    tone(880, 0.09, 0.12, 0.08);
    tone(1320, 0.18, 0.28, 0.09);
  },
  lock: () => tone(180, 0, 0.18, 0.07, "triangle"),
  splash: () => {
    tone(220, 0, 0.5, 0.05);
    [0, 0.12, 0.24, 0.36, 0.48].forEach((t, i) =>
      tone(440 * Math.pow(1.26, i), 1 + t, 0.2, 0.05)
    );
    tone(1320, 1.7, 0.5, 0.06);
  }
};

/* ==========================================================================
   INITIALIZATION
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

function initApp() {
  applyTheme(state.settings.themeMode || "dark");
  applyAccent(state.settings.accentColor || "#C6FF3D");
  initAudioControls();
  initSplashAnimation();
  initPWA();
  bindNavigation();
  bindAuthEvents();
  bindOnboardingEvents();
  bindLiveWorkoutControls();
  bindModalEvents();
  bindProfileEvents();

  // Make sure program schedule is generated
  ensureProgramSchedule();

  // Screen routing check
  if (!state.auth.isLoggedIn && !state.auth.isGuest) {
    switchScreen("s-auth");
  } else if (!state.setupCompleted) {
    switchScreen("s-onboarding");
  } else {
    renderAllViews();
  }
}

function ensureProgramSchedule() {
  if (!state.programSchedule || state.programSchedule.length === 0) {
    state.programSchedule = generateFullProgram(
      state.profile.programLength || 60,
      state.profile.daysPerWeek || 4,
      state.profile.availableEquipment || ["barbell", "dumbbells", "cables", "machine", "bodyweight"],
      state.profile.limitations || [],
      state.profile.weightKg || 75,
      state.profile.sex || "male",
      state.profile.experience || "intermediate",
      state.profile.goal || "muscle",
      state.profile.prioritizedMuscles || []
    );
    saveState(state);
  }
}

function applyTheme(theme) {
  state.settings.themeMode = theme;
  document.documentElement.setAttribute("data-theme", theme);
  const themeSeg = $("#theme-mode-seg");
  if (themeSeg) {
    $$("#theme-mode-seg button").forEach(b => {
      b.classList.toggle("on", b.getAttribute("data-theme") === theme);
    });
  }
}

function applyAccent(hex) {
  state.settings.accentColor = hex;
  document.documentElement.style.setProperty("--ac", hex);
  document.documentElement.style.setProperty("--ac-glow", `${hex}33`);
  $$(".theme-dot").forEach(d => {
    d.style.borderColor = d.getAttribute("data-col") === hex ? "#ffffff" : "transparent";
  });
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

function initSplashAnimation() {
  const splash = $("#splash");
  const app = $("#app");
  if (!splash) return;

  const lastSplash = sessionStorage.getItem("SETLY_SPLASH_SEEN");
  if (lastSplash) {
    splash.classList.add("out");
    app.classList.add("in");
    return;
  }

  sessionStorage.setItem("SETLY_SPLASH_SEEN", "true");
  setTimeout(() => {
    wakeAudio();
    S.splash();
  }, 200);

  setTimeout(() => {
    splash.classList.add("out");
    app.classList.add("in");
    animateCounters();
  }, 2700);
}

function initPWA() {
  // Service Worker Registration
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(e => console.log("SW register failed", e));
  }

  // Catch BeforeInstallPrompt
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const installCard = $("#card-pwa-install");
    if (installCard) installCard.classList.remove("hidden");
  });

  const btnInstall = $("#btn-install-pwa");
  if (btnInstall) {
    btnInstall.onclick = async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
          btnInstall.textContent = "Installed!";
          btnInstall.disabled = true;
        }
        deferredPrompt = null;
      } else {
        // iOS or already installed
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        if (isIOS) {
          $("#ios-pwa-guide")?.classList.remove("hidden");
        } else {
          alert("To install SETLY: tap browser settings (⋮ or Share) and select 'Add to Home Screen' / 'Install App'.");
        }
      }
    };
  }
}

/* ==========================================================================
   ROUTING & TAB SWITCHING
   ========================================================================== */

function switchScreen(screenId) {
  $$(".scr").forEach(s => s.classList.remove("on"));
  const target = $(`#${screenId}`);
  if (target) target.classList.add("on");
}

function bindNavigation() {
  const tabs = $$("#tabs button");
  tabs.forEach(btn => {
    btn.onclick = () => {
      tabs.forEach(t => t.classList.toggle("on", t === btn));
      const targetTab = btn.getAttribute("data-t");
      switchScreen(`s-${targetTab}`);
      S.tab();

      if (targetTab === "today") renderTodayTab();
      else if (targetTab === "plan") renderPlanTab();
      else if (targetTab === "prog") renderProgressTab();
      else if (targetTab === "profile") renderProfileTab();
    };
  });
}

function renderAllViews() {
  renderTodayTab();
  renderPlanTab();
  renderProgressTab();
  renderProfileTab();
}

/* ==========================================================================
   AUTHENTICATION & GUEST ACCESS
   ========================================================================== */

function bindAuthEvents() {
  let isSignUp = false;
  const btnToggle = $("#btn-toggle-auth-mode");
  const authTitle = $("#auth-title");
  const btnSubmit = $("#btn-auth-submit");
  const authForm = $("#auth-form");
  const btnGuest = $("#btn-guest-login");

  if (btnToggle) {
    btnToggle.onclick = () => {
      isSignUp = !isSignUp;
      authTitle.textContent = isSignUp ? "Create Your Account" : "Log In to Your Plan";
      btnToggle.textContent = isSignUp ? "Log In" : "Sign Up";
      btnSubmit.textContent = isSignUp ? "Create Account" : "Log In";
      S.tap();
    };
  }

  if (authForm) {
    authForm.onsubmit = async (e) => {
      e.preventDefault();
      const user = $("#auth-username").value.trim();
      const pass = $("#auth-password").value;
      if (!user || !pass) {
        alert("Please enter username and password.");
        return;
      }
      const hashed = await hashPassword(pass);
      state.auth.isLoggedIn = true;
      state.auth.isGuest = false;
      state.auth.username = user;
      state.auth.passwordHash = hashed;
      saveState(state);
      S.open();

      if (!state.setupCompleted) {
        switchScreen("s-onboarding");
      } else {
        switchScreen("s-today");
        renderAllViews();
      }
    };
  }

  if (btnGuest) {
    btnGuest.onclick = () => {
      state.auth.isLoggedIn = true;
      state.auth.isGuest = true;
      state.auth.username = "Guest Athlete";
      saveState(state);
      S.open();

      if (!state.setupCompleted) {
        switchScreen("s-onboarding");
      } else {
        switchScreen("s-today");
        renderAllViews();
      }
    };
  }
}

/* ==========================================================================
   ONBOARDING WIZARD (6 STEPS INCL. PROGRAM LENGTH)
   ========================================================================== */

let currentObStep = 1;

function bindOnboardingEvents() {
  // Step 1: Program Length Cards
  $$("#ob-program-cards .chip-option").forEach(card => {
    card.onclick = () => {
      $$("#ob-program-cards .chip-option").forEach(c => c.classList.remove("selected"));
      card.classList.add("selected");
      const lenVal = card.getAttribute("data-len");
      if (lenVal !== "custom") {
        state.profile.programLength = parseInt(lenVal, 10);
      }
      S.tap();
    };
  });

  const customInput = $("#ob-custom-days");
  if (customInput) {
    customInput.oninput = () => {
      const val = parseInt(customInput.value, 10);
      if (val >= 14 && val <= 365) {
        state.profile.programLength = val;
      }
    };
  }

  // Step 2: Goal Cards
  $$("#ob-step-2 .chip-option").forEach(chip => {
    chip.onclick = () => {
      $$("#ob-step-2 .chip-option").forEach(c => c.classList.remove("selected"));
      chip.classList.add("selected");
      state.profile.goal = chip.getAttribute("data-goal");
      S.tap();
    };
  });

  // Step 3: Vitals
  $$("#ob-sex-seg button").forEach(btn => {
    btn.onclick = () => {
      $$("#ob-sex-seg button").forEach(b => b.classList.remove("on"));
      btn.classList.add("on");
      state.profile.sex = btn.getAttribute("data-sex");
      state.profile.bodyOutline = state.profile.sex === "female" ? "female" : "male";
      S.tab();
    };
  });

  const expToggle = $("#ob-exp-toggle");
  const expText = $("#ob-exp-text");
  const exps = ["beginner", "intermediate", "advanced"];
  if (expToggle) {
    expToggle.onclick = () => {
      const curIdx = exps.indexOf(state.profile.experience || "intermediate");
      const nextIdx = (curIdx + 1) % exps.length;
      state.profile.experience = exps[nextIdx];
      expText.textContent = state.profile.experience.charAt(0).toUpperCase() + state.profile.experience.slice(1);
      S.tap();
    };
  }

  // Height / Weight unit toggles
  const btnToggleH = $("#ob-toggle-h-unit");
  if (btnToggleH) {
    btnToggleH.onclick = () => {
      state.profile.unitHeight = state.profile.unitHeight === "cm" ? "ft" : "cm";
      btnToggleH.textContent = state.profile.unitHeight.toUpperCase();
      $("#ob-height").placeholder = state.profile.unitHeight === "cm" ? "e.g. 178" : "e.g. 5.10";
      S.tap();
    };
  }

  const btnToggleW = $("#ob-toggle-w-unit");
  if (btnToggleW) {
    btnToggleW.onclick = () => {
      state.profile.unitWeight = state.profile.unitWeight === "kg" ? "lb" : "kg";
      btnToggleW.textContent = state.profile.unitWeight.toUpperCase();
      $("#ob-weight").placeholder = state.profile.unitWeight === "kg" ? "e.g. 75" : "e.g. 165";
      S.tap();
    };
  }

  // Step 4: Schedule Days
  $$("#ob-days-selector .dc").forEach(btn => {
    btn.onclick = () => {
      $$("#ob-days-selector .dc").forEach(b => b.classList.remove("done"));
      btn.classList.add("done");
      state.profile.daysPerWeek = parseInt(btn.getAttribute("data-days"), 10);
      S.tap();
    };
  });

  $$("#ob-duration-chips .chip").forEach(chip => {
    chip.onclick = () => {
      $$("#ob-duration-chips .chip").forEach(c => c.classList.remove("on"));
      chip.classList.add("on");
      state.profile.sessionLengthMin = parseInt(chip.getAttribute("data-time"), 10);
      S.tap();
    };
  });

  // Step 5: Equipment Presets
  $$("#ob-equip-presets .chip").forEach(chip => {
    chip.onclick = () => {
      $$("#ob-equip-presets .chip").forEach(c => c.classList.remove("on"));
      chip.classList.add("on");
      const preset = chip.getAttribute("data-preset");
      state.profile.equipmentPreset = preset;

      let list = ["barbell", "dumbbells", "cables", "machine", "bodyweight"];
      if (preset === "home_db") list = ["dumbbells", "bodyweight"];
      else if (preset === "bodyweight") list = ["bodyweight"];

      if (preset !== "custom") {
        state.profile.availableEquipment = list;
        $$("#ob-equip-checklist .toggle-row").forEach(row => {
          const eq = row.getAttribute("data-equip");
          const cb = row.querySelector(".custom-checkbox");
          const isInc = list.includes(eq);
          cb.classList.toggle("checked", isInc);
          cb.textContent = isInc ? "✓" : "";
        });
      }
      S.tap();
    };
  });

  $$("#ob-equip-checklist .toggle-row").forEach(row => {
    row.onclick = () => {
      const eq = row.getAttribute("data-equip");
      const cb = row.querySelector(".custom-checkbox");
      const isChecked = cb.classList.contains("checked");
      cb.classList.toggle("checked", !isChecked);
      cb.textContent = !isChecked ? "✓" : "";

      if (isChecked) {
        state.profile.availableEquipment = state.profile.availableEquipment.filter(e => e !== eq);
      } else if (!state.profile.availableEquipment.includes(eq)) {
        state.profile.availableEquipment.push(eq);
      }
      S.tap();
    };
  });

  // Step 6: Limitations
  $$("#ob-step-6 .toggle-row").forEach(row => {
    row.onclick = () => {
      const limit = row.getAttribute("data-limit");
      const cb = row.querySelector(".custom-checkbox");
      const isChecked = cb.classList.contains("checked");
      cb.classList.toggle("checked", !isChecked);
      cb.textContent = !isChecked ? "✓" : "";

      if (isChecked) {
        state.profile.limitations = state.profile.limitations.filter(l => l !== limit);
      } else if (!state.profile.limitations.includes(limit)) {
        state.profile.limitations.push(limit);
      }
      S.tap();
    };
  });

  // Wizard Next / Prev Buttons
  const btnPrev = $("#btn-ob-prev");
  const btnNext = $("#btn-ob-next");

  if (btnPrev) {
    btnPrev.onclick = () => {
      if (currentObStep > 1) {
        currentObStep--;
        renderObStepUI();
        S.tap();
      }
    };
  }

  if (btnNext) {
    btnNext.onclick = () => {
      if (currentObStep === 1) {
        // Validate custom input if selected
        const selCard = $("#ob-program-cards .chip-option.selected");
        if (selCard?.getAttribute("data-len") === "custom") {
          const customVal = parseInt($("#ob-custom-days")?.value, 10);
          if (!customVal || customVal < 14) {
            alert("Please enter a custom program length of at least 14 days.");
            return;
          }
          state.profile.programLength = customVal;
        }
      } else if (currentObStep === 3) {
        // Collect vitals
        const a = $("#ob-age")?.value;
        const h = $("#ob-height")?.value;
        const w = $("#ob-weight")?.value;
        state.profile.age = a ? parseInt(a, 10) : 23;
        state.profile.heightCm = h ? parseInt(h, 10) : 178;
        state.profile.weightKg = w ? parseFloat(w) : 75;
      }

      if (currentObStep < 6) {
        currentObStep++;
        renderObStepUI();
        S.tap();
      } else {
        // Finished Onboarding
        finishOnboarding();
      }
    };
  }
}

function renderObStepUI() {
  const stepBadge = $("#ob-step-badge");
  const stepName = $("#ob-step-name");
  const progBar = $("#ob-prog-bar");
  const btnPrev = $("#btn-ob-prev");
  const btnNext = $("#btn-ob-next");

  const names = [
    "Program Length",
    "Primary Goal",
    "Baseline Vitals",
    "Training Schedule",
    "Equipment Setup",
    "Joint Integrity"
  ];

  if (stepBadge) stepBadge.textContent = `Step ${currentObStep} of 6`;
  if (stepName) stepName.textContent = names[currentObStep - 1];
  if (progBar) progBar.style.width = `${(currentObStep / 6) * 100}%`;

  [1, 2, 3, 4, 5, 6].forEach(s => {
    $(`#ob-step-${s}`)?.classList.toggle("hidden", s !== currentObStep);
  });

  if (btnPrev) btnPrev.classList.toggle("hidden", currentObStep === 1);
  if (btnNext) btnNext.textContent = currentObStep === 6 ? "Generate Program" : "Continue";
}

function finishOnboarding() {
  state.setupCompleted = true;
  state.currentProgramDay = 1;
  state.completedDays = [];

  // Generate full periodized Day 1 to Day N schedule
  state.programSchedule = generateFullProgram(
    state.profile.programLength || 60,
    state.profile.daysPerWeek || 4,
    state.profile.availableEquipment,
    state.profile.limitations,
    state.profile.weightKg || 75,
    state.profile.sex || "male",
    state.profile.experience || "intermediate",
    state.profile.goal || "muscle",
    state.profile.prioritizedMuscles || []
  );

  saveState(state);
  S.done();
  switchScreen("s-today");
  renderAllViews();
}

/* ==========================================================================
   TAB 1: TODAY VIEW & BODY MAP
   ========================================================================== */

function renderTodayTab() {
  ensureProgramSchedule();
  const schedule = state.programSchedule;
  const currentDayNum = state.currentProgramDay || 1;
  const dayPlan = schedule.find(d => d.dayNumber === currentDayNum) || schedule[0];

  $("#today-day-counter").textContent = `Day ${currentDayNum} of ${state.profile.programLength || 60}`;
  $("#today-session-name").textContent = dayPlan.isRest ? "Rest & Active Recovery" : dayPlan.shortName;

  $("#today-chip-primary").textContent = dayPlan.isRest ? "Recovery" : (dayPlan.muscles[0]?.toUpperCase() || "UPPER");
  $("#today-chip-time").textContent = `About ${dayPlan.durationMinutes} min`;
  $("#today-chip-phase").textContent = `Phase: ${dayPlan.phase}`;

  // Render Anatomical Body Map
  renderBodyMap();

  // Render Exercise Lineup
  renderTodayLineup(dayPlan);

  // Bind Start Button
  const btnStart = $("#btn-start-today-workout");
  if (btnStart) {
    btnStart.onclick = () => {
      startLiveWorkout(dayPlan);
      S.open();
    };
  }

  // Bind Readiness Chips
  $$("#readiness-chips-row .chip").forEach(chip => {
    chip.onclick = () => {
      chip.classList.toggle("on");
      const activeCount = $$("#readiness-chips-row .chip.on").length;
      const score = Math.round((activeCount / 3) * 100);
      $("#readiness-summary-badge").textContent = `${score}% Ready`;
      state.todayReadiness = { date: new Date().toISOString().split("T")[0], score };
      saveState(state);
      S.tap();
    };
  });
}

function renderTodayLineup(dayPlan) {
  const container = $("#lineup");
  if (!container) return;

  $("#today-lineup-count").textContent = `${dayPlan.exercises.length} movements`;

  container.innerHTML = dayPlan.exercises.map((ex, i) => {
    const isCompleted = state.completedDays.includes(dayPlan.dayNumber);
    return `
      <div class="row" data-ex-id="${ex.exerciseId}">
        <div style="flex: 1; cursor: pointer;" class="lineup-ex-info">
          <b>${i + 1}. ${ex.name}</b>
          <small>${ex.targetSets} sets • ${ex.targetReps} reps ${ex.targetWeight ? `@ <span class="num text-ac font-bold">${ex.targetWeight} kg</span>` : ""}</small>
        </div>
        <button class="ck ${isCompleted ? "done" : ""}" aria-label="Mark set complete" data-row-idx="${i}">
          <svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>
        </button>
      </div>
    `;
  }).join("");

  // Bind Exercise Detail Sheet click
  $$("#lineup .lineup-ex-info").forEach((info, idx) => {
    info.onclick = () => {
      const ex = dayPlan.exercises[idx];
      openExerciseDetailSheet(ex.exerciseId);
    };
  });

  // Bind Checkmark Button
  $$("#lineup .ck").forEach(ck => {
    ck.onclick = (e) => {
      e.stopPropagation();
      ck.classList.toggle("done");
      if (ck.classList.contains("done")) {
        S.done();
        if (navigator.vibrate) navigator.vibrate(22);
      } else {
        S.tap();
      }
    };
  });
}

/* ==========================================================================
   ANATOMICAL BODY MAP (MALE / FEMALE + HEAT SHADING)
   ========================================================================== */

const MUSCLE_DATA = {
  Shoulders: { weeklySets: 12, exercises: "Overhead Press, Lateral Raise" },
  Chest: { weeklySets: 14, exercises: "Bench Press, Incline DB Press" },
  Biceps: { weeklySets: 9, exercises: "Incline DB Curl, Hammer Curl" },
  Triceps: { weeklySets: 11, exercises: "Cable Pushdown, Skull Crusher" },
  Abs: { weeklySets: 6, exercises: "Cable Crunch, Hanging Leg Raise" },
  Quads: { weeklySets: 12, exercises: "Barbell Squat, Leg Press" },
  Hamstrings: { weeklySets: 8, exercises: "Romanian Deadlift, Leg Curl" },
  Calves: { weeklySets: 6, exercises: "Standing Calf Raise" }
};

let currentOutlineGender = "m";

function renderBodyMap() {
  const bodySvg = $("#body");
  if (!bodySvg) return;

  currentOutlineGender = state.profile.bodyOutline === "female" ? "f" : "m";

  // Segmented control sync
  $$("#gseg button").forEach(b => {
    b.classList.toggle("on", b.getAttribute("data-g") === currentOutlineGender);
    b.onclick = () => {
      currentOutlineGender = b.getAttribute("data-g");
      state.profile.bodyOutline = currentOutlineGender === "f" ? "female" : "male";
      saveState(state);
      $$("#gseg button").forEach(x => x.classList.toggle("on", x === b));
      renderBodyMap();
      S.tab();
    };
  });

  const sw = currentOutlineGender === "m" ? 34 : 26;
  const hw = currentOutlineGender === "m" ? 20 : 25;

  const r = (m, x, y, w, h, rx) => `<rect data-m="${m}" x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}"/>`;
  const op = (m) => 0.18 + ((MUSCLE_DATA[m]?.weeklySets || 8) / 16) * 0.75;

  let svgHtml = `
    <circle class="sk" cx="60" cy="16" r="11"/>
    <rect class="sk" x="54" y="26" width="12" height="10" rx="4"/>
    <rect class="sk" x="${60 - sw * 0.8}" y="40" width="${sw * 1.6}" height="70" rx="14"/>
    <rect class="sk" x="${60 - hw - 2}" y="108" width="${hw * 2 + 4}" height="14" rx="6"/>
  `;

  svgHtml += r("Shoulders", 60 - sw - 8, 40, 18, 18, 9) +
             r("Shoulders", 60 + sw - 10, 40, 18, 18, 9) +
             r("Chest", 60 - sw * 0.7, 46, sw * 1.4, 24, 9) +
             r("Abs", 48, 72, 24, 36, 8) +
             r("Biceps", 60 - sw - 10, 60, 11, 36, 5) +
             r("Biceps", 60 + sw - 1, 60, 11, 36, 5) +
             r("Quads", 60 - hw, 124, hw - 2, 50, 8) +
             r("Quads", 62, 124, hw - 2, 50, 8) +
             r("Calves", 60 - hw + 2, 178, 12, 38, 6) +
             r("Calves", 60 + hw - 14, 178, 12, 38, 6);

  bodySvg.innerHTML = svgHtml;

  // Apply heat-shading opacity and bind click
  $$("#body [data-m]").forEach(node => {
    const muscle = node.getAttribute("data-m");
    node.style.opacity = op(muscle);

    node.onclick = () => {
      $$("#body [data-m]").forEach(x => x.classList.toggle("sel", x.getAttribute("data-m") === muscle));
      const info = MUSCLE_DATA[muscle] || { weeklySets: 10, exercises: "Compound movements" };
      $("#mn").textContent = muscle;
      $("#mi").innerHTML = `<b class="text-ac font-bold">${info.weeklySets} sets</b> this week.<br>Best lifts: ${info.exercises}.`;

      const btnPrio = $("#btn-prioritize-muscle");
      if (btnPrio) {
        btnPrio.style.display = "inline-block";
        const isPrio = state.profile.prioritizedMuscles?.includes(muscle.toLowerCase());
        btnPrio.textContent = isPrio ? "★ Prioritized" : "+ Prioritize Volume";
        btnPrio.classList.toggle("on", isPrio);

        btnPrio.onclick = () => {
          if (!state.profile.prioritizedMuscles) state.profile.prioritizedMuscles = [];
          const mKey = muscle.toLowerCase();
          if (state.profile.prioritizedMuscles.includes(mKey)) {
            state.profile.prioritizedMuscles = state.profile.prioritizedMuscles.filter(m => m !== mKey);
            btnPrio.textContent = "+ Prioritize Volume";
            btnPrio.classList.remove("on");
          } else {
            state.profile.prioritizedMuscles.push(mKey);
            btnPrio.textContent = "★ Prioritized";
            btnPrio.classList.add("on");
          }
          saveState(state);
          S.tap();
        };
      }
      S.tap();
    };
  });
}

/* ==========================================================================
   TAB 2: PLAN (FULL-LENGTH DAY MAP & 5-COLUMN GRID)
   ========================================================================== */

function renderPlanTab() {
  ensureProgramSchedule();
  const schedule = state.programSchedule;
  const N = state.profile.programLength || 60;
  const cur = state.currentProgramDay || 1;

  // Render Program Length Chips
  const lensContainer = $("#lens");
  if (lensContainer) {
    const lens = [30, 60, 90, 180, 360];
    lensContainer.innerHTML = lens.map(n => `
      <button class="chip ${n === N ? "on" : ""}" data-len="${n}">${n} days</button>
    `).join("");

    $$("#lens .chip").forEach(c => {
      c.onclick = () => {
        const newLen = parseInt(c.getAttribute("data-len"), 10);
        if (newLen !== N) {
          state.profile.programLength = newLen;
          state.programSchedule = generateFullProgram(
            newLen,
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
          S.tab();
          renderPlanTab();
        }
      };
    });
  }

  // Sticky Progress Header
  const pct = Math.round((cur / N) * 100);
  $("#pl").textContent = `Day ${cur} of ${N}`;
  $("#pp").textContent = `${pct}%`;
  setTimeout(() => {
    const pbar = $("#pbar");
    if (pbar) pbar.style.width = `${pct}%`;
  }, 60);

  // Render "Up Next" Cards (Current Day & Following Day)
  const upNextContainer = $("#plan-up-next-section");
  if (upNextContainer) {
    const todayPlan = schedule.find(d => d.dayNumber === cur) || schedule[0];
    const tomorrowPlan = schedule.find(d => d.dayNumber === cur + 1);

    let upNextHtml = `
      <div class="card hero" style="cursor: pointer;" id="card-up-next-today">
        <div style="display: flex; justify-content: space-between; align-items: baseline;">
          <span class="sub text-ac font-bold">UP NEXT TODAY</span>
          <span class="chip on" style="font-size: 11px;">Day ${todayPlan.dayNumber}</span>
        </div>
        <h2 style="font-size: 20px; font-weight: 800; margin-top: 4px;">${todayPlan.name}</h2>
        <div class="chips" style="margin-top: 6px;">
          <span class="chip">${todayPlan.focus}</span>
          <span class="chip">${todayPlan.exercises.length} moves</span>
          <span class="chip">~${todayPlan.durationMinutes} min</span>
        </div>
      </div>
    `;

    if (tomorrowPlan) {
      upNextHtml += `
        <div class="card" style="cursor: pointer; margin-top: 10px;" id="card-up-next-tomorrow">
          <div style="display: flex; justify-content: space-between; align-items: baseline;">
            <span class="sub font-bold">TOMORROW</span>
            <span class="chip" style="font-size: 11px;">Day ${tomorrowPlan.dayNumber}</span>
          </div>
          <h3 style="font-size: 17px; margin-top: 4px;">${tomorrowPlan.name}</h3>
          <p class="sub" style="font-size: 12px;">${tomorrowPlan.focus} • ~${tomorrowPlan.durationMinutes} min</p>
        </div>
      `;
    }
    upNextContainer.innerHTML = upNextHtml;

    $("#card-up-next-today")?.addEventListener("click", () => openDaySheet(todayPlan.dayNumber));
    $("#card-up-next-tomorrow")?.addEventListener("click", () => openDaySheet(tomorrowPlan.dayNumber));
  }

  // Render 5-Column Grid of Day Circles
  const daysContainer = $("#days");
  if (!daysContainer) return;

  const lockIcon = `<i><svg viewBox="0 0 24 24"><rect x="6" y="11" width="12" height="9" rx="2"/><path d="M9 11V8a3 3 0 016 0v3"/></svg></i>`;
  const checkIcon = `<svg width="15" viewBox="0 0 24 24" fill="none" stroke="#11140A" stroke-width="3.2" stroke-linecap="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>`;

  daysContainer.innerHTML = Array.from({ length: N }, (_, i) => {
    const dNum = i + 1;
    const planItem = schedule.find(d => d.dayNumber === dNum);
    const isRest = planItem ? planItem.isRest : (dNum % 4 === 0);
    const isDone = state.completedDays.includes(dNum) || dNum < cur;
    const isCur = dNum === cur;
    const isLock = dNum > cur;

    let stateClass = "lock";
    if (isDone) stateClass = "done";
    else if (isCur) stateClass = "cur";

    return `
      <button class="dc ${stateClass} ${isRest ? "rest" : ""}" data-d="${dNum}">
        ${isDone ? checkIcon : dNum}
        ${isLock ? lockIcon : ""}
      </button>
    `;
  }).join("");

  $$("#days .dc").forEach(btn => {
    btn.onclick = () => {
      const dNum = parseInt(btn.getAttribute("data-d"), 10);
      openDaySheet(dNum);
    };
  });
}

function openDaySheet(dayNumber) {
  ensureProgramSchedule();
  const schedule = state.programSchedule;
  const dayPlan = schedule.find(d => d.dayNumber === dayNumber) || {
    dayNumber,
    name: `Day ${dayNumber}`,
    focus: "Training Session",
    durationMinutes: 50,
    exercises: []
  };

  const cur = state.currentProgramDay || 1;
  const isLocked = dayNumber > cur;
  const isDone = state.completedDays.includes(dayNumber) || dayNumber < cur;

  if (isLocked) S.lock();
  else S.open();

  const sheetContent = $("#sc");
  sheetContent.innerHTML = `
    <p class="sub">Day ${dayNumber} of ${state.profile.programLength || 60} • Phase: ${dayPlan.phase || "Foundation"}</p>
    <h2 style="font-size: 24px; font-weight: 800; margin-top: 2px;">${dayPlan.name}</h2>
    <p class="sub" style="margin-top: 2px;">Focus: ${dayPlan.focus} • ~${dayPlan.durationMinutes} min</p>

    <div style="margin-top: 14px;">
      ${dayPlan.exercises.map(e => `
        <div class="row">
          <div>
            <b>${e.name}</b>
            <small>${e.targetSets} sets • ${e.targetReps} reps ${isLocked ? `• <span class="text-dim">Set at unlock</span>` : `@ <span class="text-ac num font-bold">${e.targetWeight} kg</span>`}</small>
          </div>
        </div>
      `).join("")}
    </div>

    ${isLocked ? `
      <div class="warn">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="11" width="12" height="9" rx="2"/><path d="M9 11V8a3 3 0 016 0v3"/></svg>
        <span>Not unlocked yet. Finish Day ${cur} to unlock this workout.</span>
      </div>
      <div style="display: flex; gap: 8px; margin-top: 12px;">
        <button type="button" id="btn-shift-plan" class="btn-secondary" style="flex: 1; height: 42px;">Shift Plan Forward</button>
      </div>
    ` : ""}

    <button class="cta" ${isLocked ? "disabled" : ""} id="btn-sheet-start">
      ${isDone ? "Review Completed Workout" : "Start Workout"}
    </button>
  `;

  $("#ph").classList.add("open");

  $("#btn-sheet-start")?.addEventListener("click", () => {
    if (!isLocked) {
      closeSheet();
      startLiveWorkout(dayPlan);
    }
  });

  $("#btn-shift-plan")?.addEventListener("click", () => {
    if (confirm("Shift plan forward by 1 day without penalty?")) {
      state.currentProgramDay = Math.min(state.profile.programLength, cur + 1);
      saveState(state);
      closeSheet();
      renderPlanTab();
      renderTodayTab();
    }
  });
}

function closeSheet() {
  $("#ph").classList.remove("open");
}

const shadeEl = $("#shade");
if (shadeEl) shadeEl.onclick = closeSheet;

/* ==========================================================================
   TAB 3: PROGRESS SCREEN (RINGS, SPARKLINE, TARGETS)
   ========================================================================== */

function renderProgressTab() {
  const musEl = $("#mus");
  if (musEl) {
    musEl.innerHTML = Object.entries(MUSCLE_DATA).map(([k, v]) => `
      <div class="mb">
        <span>${k}</span>
        <div class="bar" style="margin: 0;"><i data-w="${Math.min(100, (v.weeklySets / 16) * 100)}"></i></div>
        <span class="num text-tx">${v.weeklySets}</span>
      </div>
    `).join("");
  }

  // Trigger animations
  const progScr = $("#s-prog");
  if (progScr) {
    progScr.classList.remove("go");
    void progScr.offsetWidth;
    progScr.classList.add("go");

    const rfg = $("#rfg");
    const sessionsDone = state.completedDays.length || 3;
    const targetSessions = state.profile.daysPerWeek || 4;
    if (rfg) {
      rfg.style.strokeDashoffset = 264 * (1 - Math.min(1, sessionsDone / targetSessions));
    }
    $("#c1-target").textContent = targetSessions;

    $$("#mus i").forEach((iEl, n) => {
      setTimeout(() => {
        iEl.style.width = `${iEl.dataset.w}%`;
      }, 120 + n * 70);
    });

    animateCounters();
  }

  // Body weight log button
  $("#btn-prog-log-weight")?.addEventListener("click", () => {
    $("#modal-weight-log")?.classList.add("open");
  });
}

function animateCounters() {
  $$("[data-to]").forEach(el => {
    const to = parseInt(el.dataset.to, 10);
    let v = 0;
    const t = setInterval(() => {
      el.textContent = ++v;
      if (v >= to) clearInterval(t);
    }, 80);
  });
}

/* ==========================================================================
   TAB 4: PROFILE & SETTINGS
   ========================================================================== */

function renderProfileTab() {
  const user = state.auth.username || "Athlete";
  $("#profile-name").textContent = user;
  $("#profile-avatar").textContent = user.charAt(0).toUpperCase();
  $("#profile-sub").textContent = `${state.profile.experience || "Intermediate"} • ${(state.profile.goal || "Muscle").toUpperCase()}`;
  $("#profile-program-summary").textContent = `${state.profile.programLength || 60} Days (${state.completedDays.length} days crushed)`;
}

function bindProfileEvents() {
  // Theme dots
  $$(".theme-dot").forEach(dot => {
    dot.onclick = () => {
      const col = dot.getAttribute("data-col");
      applyAccent(col);
      saveState(state);
      S.tap();
    };
  });

  // Dark / Light toggle
  $$("#theme-mode-seg button").forEach(b => {
    b.onclick = () => {
      const theme = b.getAttribute("data-theme");
      applyTheme(theme);
      saveState(state);
      S.tab();
    };
  });

  // Change Program Length button
  $("#btn-change-program-length")?.addEventListener("click", () => {
    const newLenStr = prompt("Enter new program length in days (e.g. 30, 60, 90, 180):", state.profile.programLength || 60);
    const newLen = parseInt(newLenStr, 10);
    if (newLen && newLen >= 14 && newLen <= 365) {
      state.profile.programLength = newLen;
      state.programSchedule = generateFullProgram(
        newLen,
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
      renderProfileTab();
      renderPlanTab();
      S.done();
    }
  });

  // Edit vitals button opens onboarding
  $("#btn-edit-vitals")?.addEventListener("click", () => {
    currentObStep = 1;
    renderObStepUI();
    switchScreen("s-onboarding");
  });

  // Data management
  $("#btn-export-json")?.addEventListener("click", () => exportJSON(state));
  $("#btn-export-csv")?.addEventListener("click", () => exportCSV(state.workoutLogs));

  $("#btn-reset-all")?.addEventListener("click", () => {
    if (confirm("Reset all SETLY data and start completely fresh?")) {
      localStorage.removeItem(STORAGE_KEY);
      sessionStorage.clear();
      state = getDefaultState();
      saveState(state);
      location.reload();
    }
  });

  $("#btn-logout")?.addEventListener("click", () => {
    state.auth.isLoggedIn = false;
    state.auth.isGuest = false;
    saveState(state);
    switchScreen("s-auth");
  });
}

/* ==========================================================================
   EXERCISE DETAIL SHEET (FORM CUES, MISTAKES, ALTERNATIVES)
   ========================================================================== */

function openExerciseDetailSheet(exerciseId) {
  const details = getExerciseDetails(exerciseId);
  S.open();

  const sheetContent = $("#sc");
  sheetContent.innerHTML = `
    <p class="sub">${details.equipment.toUpperCase()} • ${details.pattern.replace("_", " ").toUpperCase()}</p>
    <h2 style="font-size: 24px; font-weight: 800; margin-top: 2px;">${details.name}</h2>

    <div style="margin-top: 14px;">
      <b style="font-size: 13px; color: var(--ac); text-transform: uppercase;">Key Form Cues</b>
      <div style="margin-top: 6px;">
        ${details.cues.map(c => `<div style="font-size: 13px; padding: 4px 0; color: var(--tx);">✓ ${c}</div>`).join("")}
      </div>
    </div>

    <div style="margin-top: 14px;">
      <b style="font-size: 13px; color: var(--hard); text-transform: uppercase;">Common Mistakes</b>
      <div style="margin-top: 6px;">
        ${details.mistakes.map(m => `<div style="font-size: 13px; padding: 4px 0; color: var(--dim);">✕ ${m}</div>`).join("")}
      </div>
    </div>

    ${details.alternatives.length > 0 ? `
      <div style="margin-top: 14px;">
        <b style="font-size: 13px; text-transform: uppercase;">Safe Alternatives</b>
        <div class="chips" style="margin-top: 6px;">
          ${details.alternatives.map(a => `<span class="chip">${a.name}</span>`).join("")}
        </div>
      </div>
    ` : ""}

    <button type="button" class="btn-secondary" style="width: 100%; height: 44px; margin-top: 18px;" id="btn-close-detail-sheet">Close</button>
  `;

  $("#ph").classList.add("open");
  $("#btn-close-detail-sheet")?.addEventListener("click", closeSheet);
}

/* ==========================================================================
   FULLSCREEN LIVE WORKOUT MODE & REST TIMER
   ========================================================================== */

let activeLiveSession = null;

function startLiveWorkout(sessionPlan) {
  const liveScreen = $("#live-workout-screen");
  if (!liveScreen) return;

  liveScreen.classList.add("active");
  liveWorkoutStartTime = Date.now();
  updateLiveElapsed();
  clearInterval(liveWorkoutInterval);
  liveWorkoutInterval = setInterval(updateLiveElapsed, 1000);

  // Clone session to track live sets
  activeLiveSession = {
    dayNumber: sessionPlan.dayNumber,
    name: sessionPlan.name,
    exercises: sessionPlan.exercises.map(ex => {
      const sets = [];
      const setTotal = ex.targetSets || 3;
      for (let i = 0; i < setTotal; i++) {
        sets.push({
          setIndex: i + 1,
          weight: ex.targetWeight || 50,
          reps: ex.targetReps || 10,
          effort: "good",
          completed: false
        });
      }
      return {
        ...ex,
        sets
      };
    })
  };

  renderLiveWorkoutView();
}

function updateLiveElapsed() {
  const sec = Math.floor((Date.now() - liveWorkoutStartTime) / 1000);
  const m = String(Math.floor(sec / 60)).padStart(2, "0");
  const s = String(sec % 60).padStart(2, "0");
  const el = $("#live-elapsed-time");
  if (el) el.textContent = `${m}:${s}`;
}

function renderLiveWorkoutView() {
  const body = $("#live-workout-body");
  if (!body) return;
  body.innerHTML = "";

  activeLiveSession.exercises.forEach((ex, exIdx) => {
    const card = document.createElement("div");
    card.className = "workout-ex-card";
    card.innerHTML = `
      <div class="workout-ex-head">
        <div>
          <div class="workout-ex-title">${ex.name}</div>
          <div class="sub">${ex.equipment.toUpperCase()} • Rest ${ex.restSeconds || 75}s</div>
        </div>
        <div class="workout-ex-tools">
          <button type="button" class="tool-chip-btn btn-live-plates" data-idx="${exIdx}">Plates</button>
          <button type="button" class="tool-chip-btn btn-live-warmup" data-idx="${exIdx}">Warmup</button>
          <button type="button" class="tool-chip-btn btn-live-info" data-idx="${exIdx}">Cues</button>
        </div>
      </div>

      <div class="set-table-head">
        <span>Set</span><span>Weight</span><span>Reps</span><span>Effort</span><span style="text-align: right;">Done</span>
      </div>

      <div id="live-sets-ex-${exIdx}"></div>

      <button type="button" class="cta" style="margin-top: 8px; padding: 10px; font-size: 12px; background: var(--s2); color: var(--tx);" id="btn-add-set-${exIdx}">
        + Add Another Set
      </button>
    `;

    const setsContainer = card.querySelector(`#live-sets-ex-${exIdx}`);
    ex.sets.forEach((setObj, sIdx) => {
      setsContainer.appendChild(createLiveSetRow(exIdx, sIdx, setObj));
    });

    card.querySelector(`#btn-add-set-${exIdx}`).onclick = () => {
      const last = ex.sets[ex.sets.length - 1];
      const newS = {
        setIndex: ex.sets.length + 1,
        weight: last ? last.weight : 50,
        reps: last ? last.reps : 10,
        effort: "good",
        completed: false
      };
      ex.sets.push(newS);
      setsContainer.appendChild(createLiveSetRow(exIdx, ex.sets.length - 1, newS));
      S.tap();
    };

    body.appendChild(card);
  });

  // Tool chips handlers
  $$(".btn-live-plates").forEach(b => {
    b.onclick = () => {
      const idx = parseInt(b.getAttribute("data-idx"), 10);
      const ex = activeLiveSession.exercises[idx];
      openPlateCalcModal(ex.sets[0]?.weight || 60);
    };
  });

  $$(".btn-live-warmup").forEach(b => {
    b.onclick = () => {
      const idx = parseInt(b.getAttribute("data-idx"), 10);
      const ex = activeLiveSession.exercises[idx];
      openWarmupModal(ex.sets[0]?.weight || 60);
    };
  });

  $$(".btn-live-info").forEach(b => {
    b.onclick = () => {
      const idx = parseInt(b.getAttribute("data-idx"), 10);
      const ex = activeLiveSession.exercises[idx];
      openExerciseDetailSheet(ex.exerciseId);
    };
  });
}

function createLiveSetRow(exIdx, sIdx, setObj) {
  const row = document.createElement("div");
  row.className = `set-row ${setObj.completed ? "completed" : ""}`;
  row.innerHTML = `
    <span class="num text-dim" style="font-weight: 700; text-align: center;">${setObj.setIndex}</span>
    
    <div class="stepper-box">
      <div class="stepper-btn btn-w-m">-</div>
      <input type="number" step="0.5" class="stepper-input num inp-w" value="${setObj.weight}">
      <div class="stepper-btn btn-w-p">+</div>
    </div>

    <div class="stepper-box">
      <div class="stepper-btn btn-r-m">-</div>
      <input type="number" class="stepper-input num inp-r" value="${setObj.reps}">
      <div class="stepper-btn btn-r-p">+</div>
    </div>

    <div class="effort-group">
      <div class="effort-pill ${setObj.effort === "easy" ? "selected" : ""}" data-e="easy">Easy</div>
      <div class="effort-pill ${setObj.effort === "good" ? "selected" : ""}" data-e="good">Good</div>
      <div class="effort-pill ${setObj.effort === "hard" ? "selected" : ""}" data-e="hard">Hard</div>
    </div>

    <button type="button" class="ck ${setObj.completed ? "done" : ""}" style="width: 38px; height: 38px; border-radius: 8px;">
      <svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>
    </button>
  `;

  const inpW = row.querySelector(".inp-w");
  const inpR = row.querySelector(".inp-r");

  row.querySelector(".btn-w-m").onclick = () => {
    setObj.weight = Math.max(0, (parseFloat(inpW.value) || 0) - 2.5);
    inpW.value = setObj.weight;
  };
  row.querySelector(".btn-w-p").onclick = () => {
    setObj.weight = (parseFloat(inpW.value) || 0) + 2.5;
    inpW.value = setObj.weight;
  };

  row.querySelector(".btn-r-m").onclick = () => {
    setObj.reps = Math.max(1, (parseInt(inpR.value, 10) || 1) - 1);
    inpR.value = setObj.reps;
  };
  row.querySelector(".btn-r-p").onclick = () => {
    setObj.reps = (parseInt(inpR.value, 10) || 1) + 1;
    inpR.value = setObj.reps;
  };

  $$(".effort-pill", row).forEach(p => {
    p.onclick = () => {
      $$(".effort-pill", row).forEach(x => x.classList.remove("selected"));
      p.classList.add("selected");
      setObj.effort = p.getAttribute("data-e");
      S.tap();
    };
  });

  const ckBtn = row.querySelector(".ck");
  ckBtn.onclick = () => {
    setObj.completed = !setObj.completed;
    ckBtn.classList.toggle("done", setObj.completed);
    row.classList.toggle("completed", setObj.completed);

    if (setObj.completed) {
      S.done();
      if (navigator.vibrate) navigator.vibrate(20);
      triggerRestTimer(activeLiveSession.exercises[exIdx].restSeconds || 75);
    }
  };

  return row;
}

function bindLiveWorkoutControls() {
  $("#btn-minimize-workout")?.addEventListener("click", () => {
    $("#live-workout-screen")?.classList.remove("active");
  });

  $("#btn-finish-workout")?.addEventListener("click", () => {
    if (!activeLiveSession) return;
    const completedCount = activeLiveSession.exercises.reduce((acc, e) => {
      return acc + e.sets.filter(s => s.completed).length;
    }, 0);

    if (completedCount === 0) {
      if (!confirm("No completed sets logged. Finish anyway?")) return;
    }
    finishLiveWorkout();
  });
}

function finishLiveWorkout() {
  clearInterval(liveWorkoutInterval);
  dismissRestTimer();

  const elapsedSec = Math.max(60, Math.floor((Date.now() - liveWorkoutStartTime) / 1000));
  const elapsedMin = Math.round(elapsedSec / 60);

  let totalVolume = 0;
  let totalSets = 0;

  activeLiveSession.exercises.forEach(ex => {
    ex.sets.forEach(s => {
      if (s.completed) {
        totalVolume += s.weight * s.reps;
        totalSets++;

        // Calculate e1RM & check PR
        const e1rm = calculateE1RM(s.weight, s.reps);
        const existing = state.prs[ex.exerciseId];
        if (!existing || e1rm > existing.e1rm) {
          state.prs[ex.exerciseId] = {
            weight: s.weight,
            reps: s.reps,
            e1rm: parseFloat(e1rm.toFixed(1)),
            date: new Date().toISOString().split("T")[0]
          };
        }
      }
    });
  });

  // Mark day completed & unlock next day
  const finishedDay = activeLiveSession.dayNumber;
  if (!state.completedDays.includes(finishedDay)) {
    state.completedDays.push(finishedDay);
  }
  state.currentProgramDay = Math.min(state.profile.programLength || 60, finishedDay + 1);

  const workoutLog = {
    id: `log_${Date.now()}`,
    date: new Date().toISOString().split("T")[0],
    dayNumber: finishedDay,
    name: activeLiveSession.name,
    durationMinutes: elapsedMin,
    totalVolumeKg: Math.round(totalVolume),
    totalSets,
    exercises: activeLiveSession.exercises
  };

  state.workoutLogs.push(workoutLog);
  state.lastCompletedWorkout = workoutLog;
  saveState(state);

  $("#live-workout-screen")?.classList.remove("active");
  S.done();

  // Show Celebration & Share Card
  openCelebrationModal(workoutLog);
  renderAllViews();
}

/* ==========================================================================
   REST TIMER CONTROLLER
   ========================================================================== */

function triggerRestTimer(sec) {
  dismissRestTimer();
  restTimerTotalDuration = sec;
  restTimerTargetTime = Date.now() + sec * 1000;

  const bar = $("#rest-timer-bar");
  if (bar) bar.classList.add("visible");
  updateRestTimerUI();

  restTimerInterval = setInterval(() => {
    const leftMs = restTimerTargetTime - Date.now();
    if (leftMs <= 0) {
      dismissRestTimer();
      S.done();
      if (navigator.vibrate) navigator.vibrate([40, 60, 40]);
    } else {
      updateRestTimerUI();
    }
  }, 250);
}

function updateRestTimerUI() {
  const leftSec = Math.max(0, Math.ceil((restTimerTargetTime - Date.now()) / 1000));
  const m = String(Math.floor(leftSec / 60)).padStart(2, "0");
  const s = String(leftSec % 60).padStart(2, "0");

  const disp = $("#rest-time-display");
  if (disp) disp.textContent = `${m}:${s}`;

  const ringFg = $("#rest-ring-fg");
  if (ringFg) {
    const frac = leftSec / restTimerTotalDuration;
    ringFg.style.strokeDashoffset = 264 * (1 - frac);
  }
}

function dismissRestTimer() {
  clearInterval(restTimerInterval);
  const bar = $("#rest-timer-bar");
  if (bar) bar.classList.remove("visible");
}

/* ==========================================================================
   MODALS (PLATES, WARMUP, CELEBRATION)
   ========================================================================== */

function bindModalEvents() {
  $$(".btn-close-modal").forEach(b => {
    b.onclick = () => {
      $$(".modal-backdrop").forEach(m => m.classList.remove("open"));
    };
  });

  $("#btn-timer-add-30")?.addEventListener("click", () => {
    restTimerTargetTime += 30000;
    updateRestTimerUI();
    S.tap();
  });

  $("#btn-timer-skip")?.addEventListener("click", () => {
    dismissRestTimer();
    S.tap();
  });

  $("#btn-close-celebration")?.addEventListener("click", () => {
    $("#modal-workout-complete")?.classList.remove("open");
  });

  $("#btn-save-weight-log")?.addEventListener("click", () => {
    const val = parseFloat($("#input-daily-weight")?.value);
    if (val && val > 30) {
      state.profile.weightKg = val;
      state.bodyWeightLogs.push({
        date: new Date().toISOString().split("T")[0],
        weightKg: val
      });
      saveState(state);
      $("#modal-weight-log")?.classList.remove("open");
      renderProgressTab();
      S.done();
    }
  });
}

function openPlateCalcModal(weight) {
  const modal = $("#modal-plate-calc");
  $("#plate-target-weight").textContent = `${weight.toFixed(1)} kg`;

  const slots = $("#plate-visual-slots");
  const list = $("#plate-breakdown-list");
  slots.innerHTML = "";
  list.innerHTML = "";

  const math = calculatePlates(weight);

  const colors = {
    25: "#EF4444",
    20: "#3B82F6",
    15: "#EAB308",
    10: "#22C55E",
    5: "#F8FAFC",
    2.5: "#64748B",
    1.25: "#A1A1AA"
  };

  math.platesPerSide.forEach(p => {
    for (let i = 0; i < p.count; i++) {
      const d = document.createElement("div");
      d.className = "visual-plate";
      d.style.width = "7px";
      d.style.height = `${Math.min(65, Math.max(22, p.weight * 2.6))}px`;
      d.style.backgroundColor = colors[p.weight] || "#64748B";
      slots.appendChild(d);
    }
  });

  if (math.platesPerSide.length === 0) {
    list.innerHTML = `<span class="sub">Just load the bare 20kg barbell!</span>`;
  } else {
    list.innerHTML = `<b style="font-size: 13px;">Plates per side:</b>`;
    math.platesPerSide.forEach(p => {
      list.innerHTML += `
        <div style="display: flex; justify-content: space-between; padding: 4px 0;">
          <span class="num font-bold">${p.count} × ${p.weight} kg</span>
          <span class="sub">${p.weight * p.count} kg side total</span>
        </div>
      `;
    });
  }

  modal?.classList.add("open");
  S.open();
}

function openWarmupModal(workingWeight) {
  const modal = $("#modal-warmup-ladder");
  const container = $("#warmup-ladder-container");
  container.innerHTML = "";

  const ladder = generateWarmupLadder(workingWeight);
  ladder.forEach(st => {
    container.innerHTML += `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--line);">
        <div>
          <b>Set ${st.set}: ${st.pct}%</b>
          <small>${st.rest}</small>
        </div>
        <span class="num text-ac font-bold" style="font-size: 16px;">${st.weight} kg × ${st.reps}</span>
      </div>
    `;
  });

  modal?.classList.add("open");
  S.open();
}

function openCelebrationModal(workoutLog) {
  const modal = $("#modal-workout-complete");
  $("#celebrate-summary-text").textContent = `
    Completed ${workoutLog.name} in ${workoutLog.durationMinutes} min with ${workoutLog.totalVolumeKg.toLocaleString()} kg lifted across ${workoutLog.totalSets} sets.
  `;

  drawShareCard(workoutLog);
  modal?.classList.add("open");
}

function drawShareCard(log) {
  const canvas = $("#share-card-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;

  // Background
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, "#1F231B");
  grad.addColorStop(1, "#0E0F0C");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Border
  ctx.strokeStyle = state.settings.accentColor || "#C6FF3D";
  ctx.lineWidth = 3;
  ctx.strokeRect(10, 10, w - 20, h - 20);

  // Wordmark
  ctx.fillStyle = state.settings.accentColor || "#C6FF3D";
  ctx.font = "bold 24px -apple-system, sans-serif";
  ctx.fillText("SETLY", 30, 48);

  ctx.fillStyle = "#9AA08E";
  ctx.font = "12px sans-serif";
  ctx.fillText(log.date, w - 100, 48);

  // Title
  ctx.fillStyle = "#F2F4EC";
  ctx.font = "bold 26px sans-serif";
  ctx.fillText(log.name, 30, 105);

  // Volume
  ctx.fillStyle = state.settings.accentColor || "#C6FF3D";
  ctx.font = "bold 44px sans-serif";
  ctx.fillText(`${log.totalVolumeKg.toLocaleString()} kg`, 30, 165);

  ctx.fillStyle = "#9AA08E";
  ctx.font = "12px sans-serif";
  ctx.fillText("TOTAL VOLUME CRUSHED", 30, 185);

  // Stats Box
  ctx.fillStyle = "#20231C";
  ctx.fillRect(30, 210, w - 60, 60);

  ctx.fillStyle = "#F2F4EC";
  ctx.font = "bold 18px sans-serif";
  ctx.fillText(`${log.durationMinutes} min`, 50, 245);
  ctx.fillText(`${log.totalSets} sets`, 220, 245);

  ctx.fillStyle = "#666C5B";
  ctx.font = "11px sans-serif";
  ctx.fillText("DURATION", 50, 260);
  ctx.fillText("SETS LOGGED", 220, 260);

  // Exercises
  ctx.fillStyle = "#F2F4EC";
  ctx.font = "13px sans-serif";
  log.exercises.slice(0, 3).forEach((ex, i) => {
    ctx.fillText(`• ${ex.name}`, 36, 310 + i * 22);
  });

  // Footer
  ctx.fillStyle = "#666C5B";
  ctx.font = "italic 11px sans-serif";
  ctx.fillText("Smart Adaptive Workout Planner", 30, 380);

  $("#btn-download-share-card").onclick = () => {
    const a = document.createElement("a");
    a.download = `SETLY_${log.name.replace(/\s+/g, "_")}_${log.date}.png`;
    a.href = canvas.toDataURL("image/png");
    a.click();
  };
}
