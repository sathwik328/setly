/**
 * PUSHPA LOGBOOK ENGINE — MISSED-DAY LOGIC & AI SUGGESTION PROVIDER
 * Pluggable on-device progressive overload rules and weekly queue tracking
 */

export const DEFAULT_LAYOUT = {
  mon: "Push",
  tue: "Pull",
  wed: "Legs",
  thu: "Push",
  fri: "Pull",
  sat: "Legs",
  sun: "Rest"
};

const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

/**
 * Returns the ordered non-rest session queue for the weekly layout.
 * e.g. ['Push', 'Pull', 'Legs', 'Push', 'Pull', 'Legs']
 */
export function getWeeklySessionQueue(layout = DEFAULT_LAYOUT) {
  const queue = [];
  DAY_KEYS.forEach(day => {
    const sName = layout[day];
    if (sName && sName.toLowerCase() !== "rest") {
      queue.push({ day, sessionName: sName });
    }
  });
  return queue;
}

/**
 * Computes today's suggested session based on the week's queue and completed sessions.
 * 
 * Rules:
 * 1. Today's suggestion = the first session in this week's queue not completed yet.
 * 2. If all sessions in the queue are completed, today is Rest ('Week complete').
 * 3. If today is a template rest day but sessions are pending, suggest the pending
 *    session as catch-up with an option to rest instead.
 */
export function getSuggestedSessionForDay(layout, completedSessionsThisWeek = [], currentDayKey = "mon") {
  const queue = getWeeklySessionQueue(layout);
  
  // Count how many times each session name appears in queue vs completed
  const remaining = [];
  const completedClone = [...completedSessionsThisWeek];

  queue.forEach(item => {
    const foundIdx = completedClone.indexOf(item.sessionName);
    if (foundIdx !== -1) {
      completedClone.splice(foundIdx, 1);
    } else {
      remaining.push(item);
    }
  });

  if (remaining.length === 0) {
    return {
      sessionName: "Rest",
      isRest: true,
      reason: "Week complete! All planned sessions crushed.",
      isCatchUp: false
    };
  }

  const nextUp = remaining[0];
  const templateForToday = layout[currentDayKey] || "Rest";
  const isTemplateRest = templateForToday.toLowerCase() === "rest";

  return {
    sessionName: nextUp.sessionName,
    isRest: false,
    reason: isTemplateRest ? "Catch-up session available" : `Scheduled for ${currentDayKey.toUpperCase()}`,
    isCatchUp: isTemplateRest,
    remainingCount: remaining.length
  };
}

/**
 * Handles transition to a new week:
 * Unfinished sessions from old week are dropped and counted as missed for stats.
 */
export function evaluateWeekTransition(layout, completedSessionsThisWeek = []) {
  const queue = getWeeklySessionQueue(layout);
  const plannedTotal = queue.length;
  const completedTotal = completedSessionsThisWeek.length;
  const missedCount = Math.max(0, plannedTotal - completedTotal);

  return {
    missedCount,
    consistencyPct: Math.round((completedTotal / plannedTotal) * 100),
    resetQueue: getWeeklySessionQueue(layout)
  };
}

/**
 * Pluggable Suggestion Provider interface
 * Analyzes previous logs for the same exercise & session type
 */
export class OfflineSuggestionProvider {
  suggest(exerciseName, sessionType, pastLogs = []) {
    // Filter to past logs of the same exercise and session
    const matchingEntries = [];
    pastLogs.forEach(log => {
      if (log.sessionName?.toLowerCase() === sessionType?.toLowerCase()) {
        const foundEx = log.exercises?.find(e => e.name?.toLowerCase() === exerciseName?.toLowerCase());
        if (foundEx && foundEx.sets?.length > 0) {
          matchingEntries.push({ date: log.date, ...foundEx });
        }
      }
    });

    if (matchingEntries.length === 0) {
      return {
        text: "No history yet. Log it once and I will help next time.",
        type: "neutral"
      };
    }

    const latest = matchingEntries[0]; // Most recent
    const remark = (latest.remark || "").toLowerCase();
    const tag = (latest.tag || "").toLowerCase();

    // Rule 1: Pain or injury check
    const injuryWords = ["pain", "sharp", "injury", "hurt", "pinch", "tweak"];
    if (injuryWords.some(w => remark.includes(w)) || tag === "pain") {
      return {
        text: "You logged pain last time. Do not push through it; reduce load by 20% or swap this exercise, and consult a professional if discomfort persists.",
        type: "warning"
      };
    }

    // Check reps consistency
    const sets = latest.sets || [];
    const firstReps = sets[0]?.reps || 10;
    const allSameReps = sets.every(s => s.reps === firstReps);
    const isDropping = sets.some((s, i) => i > 0 && s.reps < sets[i - 1].reps);

    // Rule 2: Easy & consistent reps -> Add reps or small weight jump
    if (allSameReps && (tag === "easy" || remark.includes("easy") || remark.includes("smooth"))) {
      if (firstReps < 12) {
        return {
          text: `Last time felt easy with ${firstReps} reps! Aim for ${firstReps + 2} reps on all sets today before adding weight.`,
          type: "increase"
        };
      } else {
        return {
          text: `You hit ${firstReps} solid reps last time. Great base! Add the smallest weight increment (+1 to +2.5 kg) and aim for 8-10 reps.`,
          type: "increase"
        };
      }
    }

    // Rule 3: Reps dropped or Hard tag -> Maintain weight and consolidate
    if (isDropping || tag === "hard" || remark.includes("hard") || remark.includes("heavy")) {
      return {
        text: `Reps dropped last time (${sets.map(s => s.reps).join(" → ")}). Keep the same load and focus on matching or exceeding your previous reps.`,
        type: "maintain"
      };
    }

    // Default progressive overload nudge
    return {
      text: `Last time: ${sets.length} sets × ${firstReps} reps @ ${sets[0]?.weight || 0} kg. Try to add 1 rep on your first set today!`,
      type: "neutral"
    };
  }
}

export const suggestionEngine = new OfflineSuggestionProvider();

/**
 * Required Unit Tests for Section 5c
 * Validates Cases 1 to 4 exactly as specified.
 */
export function runMissedDayUnitTests() {
  const layout = { ...DEFAULT_LAYOUT };
  const results = [];

  // Case 1 (nothing missed): Mon Push, Tue Pull, Wed Legs, Thu Push, Fri Pull, Sat Legs, Sun Rest
  let c1Completed = [];
  const c1Mon = getSuggestedSessionForDay(layout, c1Completed, "mon");
  c1Completed.push("Push");
  const c1Tue = getSuggestedSessionForDay(layout, c1Completed, "tue");
  c1Completed.push("Pull");
  const c1Wed = getSuggestedSessionForDay(layout, c1Completed, "wed");
  c1Completed.push("Legs");
  const c1Thu = getSuggestedSessionForDay(layout, c1Completed, "thu");
  c1Completed.push("Push");
  const c1Fri = getSuggestedSessionForDay(layout, c1Completed, "fri");
  c1Completed.push("Pull");
  const c1Sat = getSuggestedSessionForDay(layout, c1Completed, "sat");
  c1Completed.push("Legs");
  const c1Sun = getSuggestedSessionForDay(layout, c1Completed, "sun");

  results.push({
    test: "Case 1: Regular schedule (nothing missed)",
    passed: c1Mon.sessionName === "Push" && c1Tue.sessionName === "Pull" && c1Wed.sessionName === "Legs" &&
            c1Thu.sessionName === "Push" && c1Fri.sessionName === "Pull" && c1Sat.sessionName === "Legs" &&
            c1Sun.isRest === true
  });

  // Case 2 (miss Monday): Tue Push, Wed Pull, Thu Legs, Fri Push, Sat Pull, Sun Legs, next Monday Push
  let c2Completed = [];
  // Monday missed (no push completed)
  const c2Tue = getSuggestedSessionForDay(layout, c2Completed, "tue"); // Must be Push
  c2Completed.push("Push");
  const c2Wed = getSuggestedSessionForDay(layout, c2Completed, "wed"); // Must be Pull
  c2Completed.push("Pull");
  const c2Thu = getSuggestedSessionForDay(layout, c2Completed, "thu"); // Must be Legs
  c2Completed.push("Legs");
  const c2Fri = getSuggestedSessionForDay(layout, c2Completed, "fri"); // Must be Push
  c2Completed.push("Push");
  const c2Sat = getSuggestedSessionForDay(layout, c2Completed, "sat"); // Must be Pull
  c2Completed.push("Pull");
  const c2Sun = getSuggestedSessionForDay(layout, c2Completed, "sun"); // Must be Legs (catch-up on Sunday)
  c2Completed.push("Legs");
  // Week resets next Monday
  const c2NextMon = getSuggestedSessionForDay(layout, [], "mon"); // Push regular

  results.push({
    test: "Case 2: Miss Monday, catch-up shifts week, Sunday does Legs, next Monday resets to Push",
    passed: c2Tue.sessionName === "Push" && c2Wed.sessionName === "Pull" && c2Thu.sessionName === "Legs" &&
            c2Fri.sessionName === "Push" && c2Sat.sessionName === "Pull" && c2Sun.sessionName === "Legs" &&
            c2NextMon.sessionName === "Push"
  });

  // Case 3 (miss Mon and Tue): Wed Push, Thu Pull, Fri Legs, Sat Push, Sun Pull, Legs dropped as missed
  let c3Completed = [];
  // Mon and Tue missed
  const c3Wed = getSuggestedSessionForDay(layout, c3Completed, "wed"); // Push
  c3Completed.push("Push");
  const c3Thu = getSuggestedSessionForDay(layout, c3Completed, "thu"); // Pull
  c3Completed.push("Pull");
  const c3Fri = getSuggestedSessionForDay(layout, c3Completed, "fri"); // Legs
  c3Completed.push("Legs");
  const c3Sat = getSuggestedSessionForDay(layout, c3Completed, "sat"); // Push
  c3Completed.push("Push");
  const c3Sun = getSuggestedSessionForDay(layout, c3Completed, "sun"); // Pull (catch-up)
  c3Completed.push("Pull");
  
  // Transition resets and drops the second Legs session as missed
  const c3Transition = evaluateWeekTransition(layout, c3Completed);
  const c3NextMon = getSuggestedSessionForDay(layout, [], "mon"); // Next Monday Push

  results.push({
    test: "Case 3: Miss Mon & Tue, Sun does Pull, Legs dropped as missed, next Monday resets to Push",
    passed: c3Wed.sessionName === "Push" && c3Thu.sessionName === "Pull" && c3Fri.sessionName === "Legs" &&
            c3Sat.sessionName === "Push" && c3Sun.sessionName === "Pull" &&
            c3Transition.missedCount === 1 && c3NextMon.sessionName === "Push"
  });

  // Case 4 (train only Push then skip a week): new week starts at Push again
  let c4Completed = ["Push"];
  // Skipping rest of week
  const c4Transition = evaluateWeekTransition(layout, c4Completed);
  const c4NextMon = getSuggestedSessionForDay(layout, [], "mon"); // New week starts at Push

  results.push({
    test: "Case 4: Train only Push then skip rest of week, new week resets to Push",
    passed: c4Transition.missedCount === 5 && c4NextMon.sessionName === "Push"
  });

  // Case 5: Layout Mon Push, Wed Pull, Fri Legs (rest days between): miss Monday -> Tue Push (catch-up), Wed Pull, Fri Legs
  const c5Layout = {
    mon: "Push",
    tue: "Rest",
    wed: "Pull",
    thu: "Rest",
    fri: "Legs",
    sat: "Rest",
    sun: "Rest"
  };
  let c5Completed = [];
  // Miss Monday
  const c5Tue = getSuggestedSessionForDay(c5Layout, c5Completed, "tue"); // Tue is template rest, but Push is pending!
  c5Completed.push("Push");
  const c5Wed = getSuggestedSessionForDay(c5Layout, c5Completed, "wed"); // Pull
  c5Completed.push("Pull");
  const c5Fri = getSuggestedSessionForDay(c5Layout, c5Completed, "fri"); // Legs
  c5Completed.push("Legs");

  results.push({
    test: "Case 5: Layout with rest days between: miss Monday -> Tue Push catch-up, Wed Pull, Fri Legs",
    passed: c5Tue.sessionName === "Push" && c5Tue.isCatchUp === true &&
            c5Wed.sessionName === "Pull" && c5Fri.sessionName === "Legs"
  });

  console.log("LOGBOOK MISSED-DAY UNIT TESTS:", results);
  return results;
}

/**
 * Convenience helper for inline UI spark suggestions
 */
export function getExerciseSuggestion({ exerciseName, sessionType = "Push", history = [] } = {}) {
  const pastLogs = history.length > 0 ? [{
    sessionName: sessionType,
    exercises: [{
      name: exerciseName,
      tag: history[0]?.feel || "good",
      sets: Array(history[0]?.sets || 3).fill({ reps: history[0]?.reps || 10, weight: history[0]?.weight || 70 })
    }]
  }] : [];
  const res = suggestionEngine.suggest(exerciseName, sessionType, pastLogs);
  let action = "Maintain Load";
  if (res.type === "increase") action = "+1-2 Reps / Progression";
  else if (res.type === "warning") action = "Deload / Swap";
  return {
    action,
    explanation: res.text,
    targetWeight: history[0]?.weight ? (res.type === "warning" ? Math.round(history[0].weight * 0.8) : history[0].weight) : 70,
    targetReps: history[0]?.reps ? (res.type === "increase" ? history[0].reps + 2 : history[0].reps) : 10
  };
}
