/**
 * PUSHPA PERSISTENCE & REPOSITORY MODULE — V3
 * Local-First, Schema Versioning, Web Crypto Hashing, JSON & CSV Exports
 * Supports AI Planner & Notion-Style Logbook isolated stores
 */

export const STORAGE_KEY = "PUSHPA_LOCAL_V3";
export const LEGACY_STORAGE_KEYS = ["SETLY_LOCAL_V2", "SETLY_LOCAL_V1"];
export const SCHEMA_VERSION = 3;

export async function hashPassword(plainText) {
  if (!window.crypto || !window.crypto.subtle) {
    return btoa(plainText);
  }
  const msgUint8 = new TextEncoder().encode(plainText);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function getDefaultState() {
  return {
    schemaVersion: SCHEMA_VERSION,
    appName: "PUSHPA",
    activeMode: "planner", // 'planner' or 'logbook'
    lastActiveTimestamp: Date.now(),
    auth: {
      isLoggedIn: false,
      isGuest: false,
      username: "",
      passwordHash: ""
    },
    setupCompleted: false,
    profile: {
      goal: "muscle", // 'muscle', 'strength', 'fat_loss', 'fitness'
      programLength: 60, // 30, 60, 90, 180, 360, or custom
      bodyOutline: "male", // 'male', 'female', 'neutral'
      prioritizedMuscles: [],
      age: null,
      sex: "male",
      heightCm: null,
      weightKg: null,
      weightGoalKg: null,
      unitWeight: "kg",
      unitHeight: "cm",
      experience: "intermediate",
      daysPerWeek: 4,
      sessionLengthMin: 50,
      equipmentPreset: "full_gym",
      availableEquipment: ["barbell", "dumbbells", "cables", "machine", "bodyweight"],
      limitations: [] // 'knees', 'lower_back', 'shoulders', 'wrists'
    },
    settings: {
      accentColor: "#FF6A00", // PUSHPA Fire Orange
      themeMode: "dark", // default dark
      soundEnabled: true,
      vibrationEnabled: true
    },
    // AI Planner Specific Data Store
    currentProgramDay: 1,
    completedDays: [],
    currentWeekIndex: 0,
    currentSessionIndex: 0,
    activeWorkout: null,
    lastCompletedWorkout: null,
    workoutLogs: [],
    prs: {
      barbell_bench_press: { weight: 70, reps: 8, e1rm: 88.7, date: "2026-11-15" },
      barbell_back_squat: { weight: 90, reps: 6, e1rm: 108.0, date: "2026-11-12" }
    },
    bodyWeightLogs: [
      { date: "2026-11-01", weightKg: 76.5 },
      { date: "2026-11-08", weightKg: 76.0 },
      { date: "2026-11-15", weightKg: 75.4 }
    ],
    todayReadiness: null,
    achievements: {
      first_workout: null,
      streak_7: null,
      first_pr: null,
      sessions_10: null,
      sets_100: null
    },
    exerciseNotes: {},
    workoutNotes: {},
    programSchedule: [],

    // Logbook Specific Data Store (Notion-Style Free Space)
    logbook: {
      setupCompleted: false,
      splitPreset: "ppl", // 'ppl', 'upper_lower', 'full_body', 'custom'
      weekStartDay: "mon",
      layout: {
        mon: "Push",
        tue: "Pull",
        wed: "Legs",
        thu: "Push",
        fri: "Pull",
        sat: "Legs",
        sun: "Rest"
      },
      currentWeekNumber: 1,
      completedSessionsInWeek: [], // e.g. ['Push', 'Pull']
      missedSessionsCount: 0,
      logs: [], // Array of daily log entries
      customExercises: []
    },

    // Guided Workouts Store
    guidedWorkouts: {
      completedSessions: [],
      lastSessionFeedback: null
    },

    backup: {
      lastBackupDate: null,
      dismissedReminderDate: null
    }
  };
}

export function loadState() {
  try {
    let raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Check legacy keys
      for (const legacyKey of LEGACY_STORAGE_KEYS) {
        const legacyRaw = localStorage.getItem(legacyKey);
        if (legacyRaw) {
          raw = legacyRaw;
          break;
        }
      }
      if (!raw) return getDefaultState();
    }
    const parsed = JSON.parse(raw);
    return migrateState(parsed);
  } catch (e) {
    console.warn("Storage load failed, returning clean defaults", e);
    return getDefaultState();
  }
}

export function saveState(state) {
  try {
    state.lastActiveTimestamp = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Storage save failed", e);
  }
}

function migrateState(oldState) {
  const base = getDefaultState();
  const migrated = {
    ...base,
    ...oldState,
    schemaVersion: SCHEMA_VERSION,
    appName: "PUSHPA",
    activeMode: oldState.activeMode || "planner",
    profile: {
      ...base.profile,
      ...(oldState.profile || {})
    },
    settings: {
      ...base.settings,
      ...(oldState.settings || {}),
      accentColor: "#FF6A00" // Upgrade to fire theme
    },
    logbook: {
      ...base.logbook,
      ...(oldState.logbook || {})
    },
    guidedWorkouts: {
      ...base.guidedWorkouts,
      ...(oldState.guidedWorkouts || {})
    },
    achievements: {
      ...base.achievements,
      ...(oldState.achievements || {})
    },
    exerciseNotes: {
      ...(oldState.exerciseNotes || {})
    },
    workoutNotes: {
      ...(oldState.workoutNotes || {})
    }
  };

  if (!migrated.currentProgramDay) {
    migrated.currentProgramDay = Math.max(1, (migrated.currentSessionIndex || 0) + 1);
  }
  return migrated;
}

export function exportJSON(state) {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `PUSHPA_BACKUP_${new Date().toISOString().split("T")[0]}.json`;
  a.click();
}

export function importJSON(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        const migrated = migrateState(parsed);
        saveState(migrated);
        resolve(migrated);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("File read error"));
    reader.readAsText(file);
  });
}

export function exportCSV(workoutLogs, logbookLogs = []) {
  const headers = ["Date", "Mode", "SessionName", "Exercise", "SetIndex", "WeightKg", "Reps", "Effort_Or_Remark"];
  const rows = [];

  // Planner Logs
  (workoutLogs || []).forEach(log => {
    log.exercises?.forEach(ex => {
      ex.sets?.forEach(s => {
        rows.push([
          log.date,
          "AI_Planner",
          `"${log.name}"`,
          `"${ex.name}"`,
          s.setIndex,
          s.weight,
          s.reps,
          s.effort || "good"
        ].join(","));
      });
    });
  });

  // Logbook Logs
  (logbookLogs || []).forEach(log => {
    log.exercises?.forEach(ex => {
      ex.sets?.forEach((s, i) => {
        rows.push([
          log.date,
          "Logbook",
          `"${log.sessionName || "Custom"}"`,
          `"${ex.name}"`,
          i + 1,
          s.weight || 0,
          s.reps || 0,
          `"${ex.remark || ex.tag || ""}"`
        ].join(","));
      });
    });
  });

  const csvContent = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `PUSHPA_WORKOUT_HISTORY_${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
}
