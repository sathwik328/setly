/**
 * PUSHPA PERSISTENCE & STORAGE MODULE — V5
 * Local-First, Schema Versioning, Migrations, Web Crypto SHA-256 Hashing
 * Strictly keeps user data safe across all legacy versions.
 */

export const STORAGE_KEY = "PUSHPA_LOCAL_V5";
export const LEGACY_KEYS = [
  "PUSHPA_LOCAL_V4",
  "PUSHPA_LOCAL_V3",
  "SETLY_LOCAL_V2",
  "SETLY_LOCAL_V1"
];
export const SCHEMA_VERSION = 5;

export async function hashPassword(plainText) {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const msgUint8 = new TextEncoder().encode(plainText);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  return btoa(plainText);
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
    // Shared user profile across both modes
    profile: {
      name: "",
      age: 25,
      gender: "male", // 'male' | 'female' | 'other'
      heightCm: 175,
      weightKg: 75,
      unitWeight: "kg", // 'kg' | 'lb'
      unitHeight: "cm", // 'cm' | 'ft'
      goal: "muscle",
      experience: "intermediate"
    },
    // Shared user preferences
    settings: {
      theme: "dark", // 'dark' | 'light' | 'system'
      accent: "red", // 'red' | 'rose' | 'blue' | 'teal' | 'violet' | 'graphite'
      soundLevel: "low", // 'off' | 'low' | 'normal'
      haptics: true,
      openLastModeAuto: false
    },
    currentMode: "select", // 'select' | 'planner' | 'logbook'
    lastIntroTimestamp: 0,

    // MODE 1: AI PLANNER DATA STORE
    planner: {
      setupCompleted: false,
      programLength: 60,
      currentDay: 1,
      completedDays: [],
      daysPerWeek: 4,
      sessionLengthMin: 45,
      equipment: "full_gym",
      limitations: [],
      activeWorkout: null,
      workoutLogs: [],
      prs: {}
    },

    // MODE 2: NOTION-STYLE LOGBOOK DATA STORE
    logbook: {
      setupCompleted: false,
      split: [
        { day: 1, name: "Push", isRest: false },
        { day: 2, name: "Pull", isRest: false },
        { day: 3, name: "Legs", isRest: false },
        { day: 4, name: "Push", isRest: false },
        { day: 5, name: "Pull", isRest: false },
        { day: 6, name: "Legs", isRest: false },
        { day: 0, name: "Rest", isRest: true }
      ],
      weekStartDay: 1, // 1 = Monday
      logs: [],
      draft: null,
      customExercises: []
    }
  };
}

export function loadState() {
  try {
    let raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      for (const legacyKey of LEGACY_KEYS) {
        const found = localStorage.getItem(legacyKey);
        if (found) {
          raw = found;
          break;
        }
      }
    }
    if (!raw) {
      return getDefaultState();
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

export function migrateState(oldState) {
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
      theme: oldState.settings?.themeMode || oldState.settings?.theme || base.settings.theme,
      accent: oldState.settings?.accentColor === "#C6FF3D" ? "red" : (oldState.settings?.accent || base.settings.accent),
      soundLevel: oldState.settings?.soundEnabled === false ? "off" : (oldState.settings?.soundLevel || base.settings.soundLevel),
      haptics: oldState.settings?.vibrationEnabled !== undefined ? oldState.settings.vibrationEnabled : (oldState.settings?.haptics ?? true),
      openLastModeAuto: oldState.settings?.openLastModeAuto ?? false
    },
    planner: {
      ...base.planner,
      setupCompleted: oldState.setupCompleted ?? (oldState.planner?.setupCompleted ?? false),
      programLength: oldState.profile?.programLength || oldState.planner?.programLength || 60,
      currentDay: oldState.currentProgramDay || oldState.planner?.currentDay || 1,
      completedDays: oldState.completedDays || oldState.planner?.completedDays || [],
      activeWorkout: oldState.activeWorkout || oldState.planner?.activeWorkout || null,
      workoutLogs: oldState.workoutLogs || oldState.planner?.workoutLogs || [],
      prs: oldState.prs || oldState.planner?.prs || {}
    },
    logbook: {
      ...base.logbook,
      ...(oldState.logbook || {})
    }
  };

  // Ensure athlete name default if profile has username
  if (!migrated.profile.name && migrated.auth.username) {
    migrated.profile.name = migrated.auth.username;
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
