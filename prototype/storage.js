/**
 * SETLY PERSISTENCE & REPOSITORY MODULE — V2
 * Local-First, Schema Versioning, Web Crypto Hashing, JSON & CSV Exports
 */

export const STORAGE_KEY = "SETLY_LOCAL_V2";
export const LEGACY_STORAGE_KEY = "SETLY_LOCAL_V1";
export const SCHEMA_VERSION = 2;

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
      prioritizedMuscles: [], // ['chest', 'lats', ...]
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
      accentColor: "#C6FF3D", // electric lime default
      themeMode: "dark", // 'dark' or 'light'
      soundEnabled: true,
      vibrationEnabled: true
    },
    currentProgramDay: 1, // 1 to programLength
    completedDays: [], // array of day numbers: [1, 2, ...]
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
    todayReadiness: null, // { date, sleep, soreness, energy, score }
    achievements: {
      first_workout: null,
      streak_7: null,
      first_pr: null,
      sessions_10: null,
      sets_100: null
    },
    exerciseNotes: {}, // { [exerciseId]: "..." }
    workoutNotes: {}, // { [sessionId]: "..." }
    programSchedule: [] // Full day-by-day plan from Day 1 to Day N
  };
}

export function loadState() {
  try {
    let raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Check for legacy v1 state to preserve existing workout progress
      const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacyRaw) {
        raw = legacyRaw;
      } else {
        return getDefaultState();
      }
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
    profile: {
      ...base.profile,
      ...(oldState.profile || {})
    },
    settings: {
      ...base.settings,
      ...(oldState.settings || {})
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

  // Convert old currentSessionIndex to currentProgramDay if needed
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
  a.download = `SETLY_BACKUP_${new Date().toISOString().split("T")[0]}.json`;
  a.click();
}

export function exportCSV(workoutLogs) {
  if (!workoutLogs || workoutLogs.length === 0) {
    alert("No workout logs available to export yet.");
    return;
  }
  const headers = ["Date", "SessionName", "Exercise", "SetIndex", "WeightKg", "Reps", "Effort"];
  const rows = [];

  workoutLogs.forEach(log => {
    log.exercises?.forEach(ex => {
      ex.sets?.forEach(s => {
        rows.push([
          log.date,
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

  const csvContent = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `SETLY_WORKOUT_HISTORY_${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
}
