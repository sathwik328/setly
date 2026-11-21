/**
 * SETLY TRAINING ENGINE
 * Pure mathematical functions for workout generation, progressive overload,
 * volume tracking, plate calculation, and recovery modeling.
 */

export const EXERCISE_LIBRARY = [
  // Horizontal Push (Chest, Front Delts, Triceps)
  {
    id: "barbell_bench_press",
    name: "Barbell Bench Press",
    primaryMuscles: ["chest"],
    secondaryMuscles: ["front_delts", "triceps"],
    equipment: "barbell",
    pattern: "horizontal_push",
    type: "compound",
    difficulty: "intermediate",
    contraindications: ["shoulders", "wrists"],
    defaultReps: [6, 8],
    alternatives: ["dumbbell_flat_press", "machine_chest_press", "push_ups"]
  },
  {
    id: "dumbbell_flat_press",
    name: "Dumbbell Flat Press",
    primaryMuscles: ["chest"],
    secondaryMuscles: ["front_delts", "triceps"],
    equipment: "dumbbells",
    pattern: "horizontal_push",
    type: "compound",
    difficulty: "beginner",
    contraindications: ["wrists"],
    defaultReps: [8, 12],
    alternatives: ["barbell_bench_press", "incline_dumbbell_press", "push_ups"]
  },
  {
    id: "incline_dumbbell_press",
    name: "Incline Dumbbell Press",
    primaryMuscles: ["chest"],
    secondaryMuscles: ["front_delts", "triceps"],
    equipment: "dumbbells",
    pattern: "horizontal_push",
    type: "compound",
    difficulty: "beginner",
    contraindications: ["shoulders"],
    defaultReps: [8, 12],
    alternatives: ["incline_barbell_press", "dumbbell_flat_press"]
  },
  {
    id: "incline_barbell_press",
    name: "Incline Barbell Press",
    primaryMuscles: ["chest"],
    secondaryMuscles: ["front_delts", "triceps"],
    equipment: "barbell",
    pattern: "horizontal_push",
    type: "compound",
    difficulty: "intermediate",
    contraindications: ["shoulders", "wrists"],
    defaultReps: [6, 10],
    alternatives: ["incline_dumbbell_press", "barbell_bench_press"]
  },
  {
    id: "machine_chest_press",
    name: "Machine Chest Press",
    primaryMuscles: ["chest"],
    secondaryMuscles: ["front_delts", "triceps"],
    equipment: "machine",
    pattern: "horizontal_push",
    type: "compound",
    difficulty: "beginner",
    contraindications: [],
    defaultReps: [10, 12],
    alternatives: ["dumbbell_flat_press", "push_ups"]
  },
  {
    id: "push_ups",
    name: "Push-Ups",
    primaryMuscles: ["chest"],
    secondaryMuscles: ["front_delts", "triceps", "core"],
    equipment: "bodyweight",
    pattern: "horizontal_push",
    type: "compound",
    difficulty: "beginner",
    contraindications: ["wrists"],
    defaultReps: [12, 20],
    alternatives: ["dumbbell_flat_press", "cable_chest_flyes"]
  },
  {
    id: "cable_chest_flyes",
    name: "Cable Chest Flyes",
    primaryMuscles: ["chest"],
    secondaryMuscles: ["front_delts"],
    equipment: "cables",
    pattern: "isolation",
    type: "isolation",
    difficulty: "beginner",
    contraindications: ["shoulders"],
    defaultReps: [12, 15],
    alternatives: ["pec_deck_fly", "dumbbell_flyes"]
  },
  {
    id: "pec_deck_fly",
    name: "Pec Deck Fly",
    primaryMuscles: ["chest"],
    secondaryMuscles: [],
    equipment: "machine",
    pattern: "isolation",
    type: "isolation",
    difficulty: "beginner",
    contraindications: [],
    defaultReps: [12, 15],
    alternatives: ["cable_chest_flyes", "dumbbell_flyes"]
  },
  {
    id: "dumbbell_flyes",
    name: "Dumbbell Flat Flyes",
    primaryMuscles: ["chest"],
    secondaryMuscles: ["front_delts"],
    equipment: "dumbbells",
    pattern: "isolation",
    type: "isolation",
    difficulty: "intermediate",
    contraindications: ["shoulders"],
    defaultReps: [10, 14],
    alternatives: ["cable_chest_flyes", "pec_deck_fly"]
  },
  {
    id: "chest_dips",
    name: "Bodyweight Dips",
    primaryMuscles: ["chest", "triceps"],
    secondaryMuscles: ["front_delts"],
    equipment: "bodyweight",
    pattern: "horizontal_push",
    type: "compound",
    difficulty: "advanced",
    contraindications: ["shoulders", "wrists"],
    defaultReps: [8, 12],
    alternatives: ["push_ups", "barbell_bench_press"]
  },

  // Vertical Pull (Lats, Upper Back, Biceps)
  {
    id: "lat_pulldown",
    name: "Lat Pulldown",
    primaryMuscles: ["lats"],
    secondaryMuscles: ["biceps", "upper_back"],
    equipment: "cables",
    pattern: "vertical_pull",
    type: "compound",
    difficulty: "beginner",
    contraindications: [],
    defaultReps: [8, 12],
    alternatives: ["pull_ups", "chin_ups", "single_arm_cable_pulldown"]
  },
  {
    id: "pull_ups",
    name: "Pull-Ups",
    primaryMuscles: ["lats"],
    secondaryMuscles: ["biceps", "upper_back", "forearms"],
    equipment: "bodyweight",
    pattern: "vertical_pull",
    type: "compound",
    difficulty: "advanced",
    contraindications: ["shoulders", "wrists"],
    defaultReps: [6, 10],
    alternatives: ["lat_pulldown", "chin_ups", "inverted_rows"]
  },
  {
    id: "chin_ups",
    name: "Chin-Ups",
    primaryMuscles: ["lats", "biceps"],
    secondaryMuscles: ["upper_back"],
    equipment: "bodyweight",
    pattern: "vertical_pull",
    type: "compound",
    difficulty: "intermediate",
    contraindications: ["wrists"],
    defaultReps: [6, 10],
    alternatives: ["pull_ups", "lat_pulldown"]
  },
  {
    id: "single_arm_cable_pulldown",
    name: "Single-Arm Neutral Pulldown",
    primaryMuscles: ["lats"],
    secondaryMuscles: ["biceps"],
    equipment: "cables",
    pattern: "vertical_pull",
    type: "compound",
    difficulty: "intermediate",
    contraindications: [],
    defaultReps: [10, 14],
    alternatives: ["lat_pulldown", "pull_ups"]
  },

  // Horizontal Pull (Mid Back, Rhomboids, Lats, Rear Delts)
  {
    id: "barbell_bent_over_row",
    name: "Barbell Bent-Over Row",
    primaryMuscles: ["upper_back", "lats"],
    secondaryMuscles: ["biceps", "lower_back"],
    equipment: "barbell",
    pattern: "horizontal_pull",
    type: "compound",
    difficulty: "intermediate",
    contraindications: ["lower_back"],
    defaultReps: [8, 10],
    alternatives: ["chest_supported_db_row", "seated_cable_row"]
  },
  {
    id: "seated_cable_row",
    name: "Seated Cable Row",
    primaryMuscles: ["upper_back", "lats"],
    secondaryMuscles: ["biceps"],
    equipment: "cables",
    pattern: "horizontal_pull",
    type: "compound",
    difficulty: "beginner",
    contraindications: [],
    defaultReps: [10, 12],
    alternatives: ["chest_supported_db_row", "single_arm_db_row"]
  },
  {
    id: "single_arm_db_row",
    name: "Single-Arm Dumbbell Row",
    primaryMuscles: ["lats", "upper_back"],
    secondaryMuscles: ["biceps"],
    equipment: "dumbbells",
    pattern: "horizontal_pull",
    type: "compound",
    difficulty: "beginner",
    contraindications: [],
    defaultReps: [8, 12],
    alternatives: ["seated_cable_row", "chest_supported_db_row"]
  },
  {
    id: "chest_supported_db_row",
    name: "Chest-Supported Incline Row",
    primaryMuscles: ["upper_back", "rear_delts"],
    secondaryMuscles: ["biceps"],
    equipment: "dumbbells",
    pattern: "horizontal_pull",
    type: "compound",
    difficulty: "beginner",
    contraindications: [],
    defaultReps: [10, 12],
    alternatives: ["seated_cable_row", "barbell_bent_over_row"]
  },
  {
    id: "face_pulls",
    name: "Cable Face Pulls",
    primaryMuscles: ["rear_delts", "upper_back"],
    secondaryMuscles: ["rotator_cuff"],
    equipment: "cables",
    pattern: "horizontal_pull",
    type: "isolation",
    difficulty: "beginner",
    contraindications: [],
    defaultReps: [12, 16],
    alternatives: ["reverse_pec_deck", "dumbbell_rear_delt_fly"]
  },
  {
    id: "reverse_pec_deck",
    name: "Reverse Pec Deck Fly",
    primaryMuscles: ["rear_delts"],
    secondaryMuscles: ["upper_back"],
    equipment: "machine",
    pattern: "isolation",
    type: "isolation",
    difficulty: "beginner",
    contraindications: [],
    defaultReps: [12, 15],
    alternatives: ["face_pulls", "dumbbell_rear_delt_fly"]
  },

  // Knee-Dominant / Squat (Quads, Glutes)
  {
    id: "barbell_back_squat",
    name: "Barbell Back Squat",
    primaryMuscles: ["quads", "glutes"],
    secondaryMuscles: ["lower_back", "calves"],
    equipment: "barbell",
    pattern: "squat",
    type: "compound",
    difficulty: "intermediate",
    contraindications: ["knees", "lower_back"],
    defaultReps: [5, 8],
    alternatives: ["leg_press", "goblet_squat", "hack_squat"]
  },
  {
    id: "front_squat",
    name: "Barbell Front Squat",
    primaryMuscles: ["quads"],
    secondaryMuscles: ["glutes", "core"],
    equipment: "barbell",
    pattern: "squat",
    type: "compound",
    difficulty: "advanced",
    contraindications: ["knees", "wrists"],
    defaultReps: [6, 8],
    alternatives: ["hack_squat", "goblet_squat", "leg_press"]
  },
  {
    id: "leg_press",
    name: "45° Incline Leg Press",
    primaryMuscles: ["quads", "glutes"],
    secondaryMuscles: ["hamstrings"],
    equipment: "machine",
    pattern: "squat",
    type: "compound",
    difficulty: "beginner",
    contraindications: ["knees"],
    defaultReps: [8, 12],
    alternatives: ["hack_squat", "goblet_squat", "barbell_back_squat"]
  },
  {
    id: "hack_squat",
    name: "Hack Squat Machine",
    primaryMuscles: ["quads"],
    secondaryMuscles: ["glutes"],
    equipment: "machine",
    pattern: "squat",
    type: "compound",
    difficulty: "intermediate",
    contraindications: ["knees"],
    defaultReps: [8, 12],
    alternatives: ["leg_press", "barbell_back_squat"]
  },
  {
    id: "goblet_squat",
    name: "Dumbbell Goblet Squat",
    primaryMuscles: ["quads", "glutes"],
    secondaryMuscles: ["core"],
    equipment: "dumbbells",
    pattern: "squat",
    type: "compound",
    difficulty: "beginner",
    contraindications: [],
    defaultReps: [10, 15],
    alternatives: ["leg_press", "bulgarian_split_squat"]
  },
  {
    id: "bulgarian_split_squat",
    name: "Bulgarian Split Squat",
    primaryMuscles: ["quads", "glutes"],
    secondaryMuscles: ["hamstrings"],
    equipment: "dumbbells",
    pattern: "squat",
    type: "compound",
    difficulty: "intermediate",
    contraindications: [],
    defaultReps: [8, 12],
    alternatives: ["walking_lunges", "leg_press"]
  },
  {
    id: "walking_lunges",
    name: "Dumbbell Walking Lunges",
    primaryMuscles: ["glutes", "quads"],
    secondaryMuscles: ["hamstrings", "calves"],
    equipment: "dumbbells",
    pattern: "squat",
    type: "compound",
    difficulty: "beginner",
    contraindications: ["knees"],
    defaultReps: [10, 14],
    alternatives: ["bulgarian_split_squat", "goblet_squat"]
  },
  {
    id: "leg_extensions",
    name: "Leg Extensions",
    primaryMuscles: ["quads"],
    secondaryMuscles: [],
    equipment: "machine",
    pattern: "isolation",
    type: "isolation",
    difficulty: "beginner",
    contraindications: ["knees"],
    defaultReps: [12, 15],
    alternatives: ["goblet_squat", "bulgarian_split_squat"]
  },

  // Hip-Dominant / Hinge (Hamstrings, Glutes, Lower Back)
  {
    id: "conventional_deadlift",
    name: "Conventional Barbell Deadlift",
    primaryMuscles: ["hamstrings", "glutes", "lower_back"],
    secondaryMuscles: ["lats", "forearms", "traps"],
    equipment: "barbell",
    pattern: "hinge",
    type: "compound",
    difficulty: "advanced",
    contraindications: ["lower_back"],
    defaultReps: [4, 6],
    alternatives: ["trap_bar_deadlift", "romanian_deadlift_barbell"]
  },
  {
    id: "trap_bar_deadlift",
    name: "Trap Bar Deadlift",
    primaryMuscles: ["glutes", "quads", "hamstrings"],
    secondaryMuscles: ["traps", "lower_back"],
    equipment: "barbell",
    pattern: "hinge",
    type: "compound",
    difficulty: "intermediate",
    contraindications: [],
    defaultReps: [5, 8],
    alternatives: ["conventional_deadlift", "romanian_deadlift_barbell"]
  },
  {
    id: "romanian_deadlift_barbell",
    name: "Barbell Romanian Deadlift",
    primaryMuscles: ["hamstrings", "glutes"],
    secondaryMuscles: ["lower_back"],
    equipment: "barbell",
    pattern: "hinge",
    type: "compound",
    difficulty: "intermediate",
    contraindications: ["lower_back"],
    defaultReps: [8, 10],
    alternatives: ["dumbbell_rdl", "seated_leg_curl"]
  },
  {
    id: "dumbbell_rdl",
    name: "Dumbbell Romanian Deadlift",
    primaryMuscles: ["hamstrings", "glutes"],
    secondaryMuscles: ["lower_back"],
    equipment: "dumbbells",
    pattern: "hinge",
    type: "compound",
    difficulty: "beginner",
    contraindications: [],
    defaultReps: [8, 12],
    alternatives: ["romanian_deadlift_barbell", "lying_leg_curl"]
  },
  {
    id: "lying_leg_curl",
    name: "Lying Hamstring Leg Curl",
    primaryMuscles: ["hamstrings"],
    secondaryMuscles: ["calves"],
    equipment: "machine",
    pattern: "isolation",
    type: "isolation",
    difficulty: "beginner",
    contraindications: [],
    defaultReps: [10, 14],
    alternatives: ["seated_leg_curl", "dumbbell_rdl"]
  },
  {
    id: "seated_leg_curl",
    name: "Seated Hamstring Leg Curl",
    primaryMuscles: ["hamstrings"],
    secondaryMuscles: [],
    equipment: "machine",
    pattern: "isolation",
    type: "isolation",
    difficulty: "beginner",
    contraindications: [],
    defaultReps: [10, 14],
    alternatives: ["lying_leg_curl", "dumbbell_rdl"]
  },
  {
    id: "barbell_hip_thrust",
    name: "Barbell Hip Thrust",
    primaryMuscles: ["glutes"],
    secondaryMuscles: ["hamstrings"],
    equipment: "barbell",
    pattern: "hinge",
    type: "compound",
    difficulty: "intermediate",
    contraindications: [],
    defaultReps: [8, 12],
    alternatives: ["dumbbell_hip_thrust", "cable_pull_through"]
  },
  {
    id: "cable_pull_through",
    name: "Cable Glute Pull-Through",
    primaryMuscles: ["glutes", "hamstrings"],
    secondaryMuscles: ["lower_back"],
    equipment: "cables",
    pattern: "hinge",
    type: "isolation",
    difficulty: "beginner",
    contraindications: [],
    defaultReps: [12, 15],
    alternatives: ["barbell_hip_thrust", "dumbbell_rdl"]
  },

  // Vertical Push / Shoulders
  {
    id: "overhead_barbell_press",
    name: "Overhead Barbell Press (OHP)",
    primaryMuscles: ["front_delts", "side_delts"],
    secondaryMuscles: ["triceps", "upper_chest", "core"],
    equipment: "barbell",
    pattern: "vertical_push",
    type: "compound",
    difficulty: "intermediate",
    contraindications: ["shoulders", "lower_back"],
    defaultReps: [6, 8],
    alternatives: ["seated_dumbbell_shoulder_press", "machine_shoulder_press"]
  },
  {
    id: "seated_dumbbell_shoulder_press",
    name: "Seated Dumbbell Shoulder Press",
    primaryMuscles: ["front_delts", "side_delts"],
    secondaryMuscles: ["triceps"],
    equipment: "dumbbells",
    pattern: "vertical_push",
    type: "compound",
    difficulty: "beginner",
    contraindications: ["shoulders"],
    defaultReps: [8, 12],
    alternatives: ["overhead_barbell_press", "machine_shoulder_press"]
  },
  {
    id: "machine_shoulder_press",
    name: "Machine Overhead Press",
    primaryMuscles: ["front_delts"],
    secondaryMuscles: ["triceps"],
    equipment: "machine",
    pattern: "vertical_push",
    type: "compound",
    difficulty: "beginner",
    contraindications: [],
    defaultReps: [10, 12],
    alternatives: ["seated_dumbbell_shoulder_press", "dumbbell_lateral_raise"]
  },
  {
    id: "dumbbell_lateral_raise",
    name: "Dumbbell Lateral Raise",
    primaryMuscles: ["side_delts"],
    secondaryMuscles: ["traps"],
    equipment: "dumbbells",
    pattern: "isolation",
    type: "isolation",
    difficulty: "beginner",
    contraindications: [],
    defaultReps: [12, 16],
    alternatives: ["cable_lateral_raise", "machine_lateral_raise"]
  },
  {
    id: "cable_lateral_raise",
    name: "Cable Lateral Raise",
    primaryMuscles: ["side_delts"],
    secondaryMuscles: [],
    equipment: "cables",
    pattern: "isolation",
    type: "isolation",
    difficulty: "beginner",
    contraindications: [],
    defaultReps: [12, 16],
    alternatives: ["dumbbell_lateral_raise", "machine_lateral_raise"]
  },

  // Arms: Triceps
  {
    id: "cable_tricep_pushdown",
    name: "Cable Tricep Pushdown",
    primaryMuscles: ["triceps"],
    secondaryMuscles: [],
    equipment: "cables",
    pattern: "isolation",
    type: "isolation",
    difficulty: "beginner",
    contraindications: [],
    defaultReps: [10, 14],
    alternatives: ["overhead_cable_extension", "skull_crushers"]
  },
  {
    id: "overhead_cable_extension",
    name: "Overhead Rope Cable Extension",
    primaryMuscles: ["triceps"],
    secondaryMuscles: [],
    equipment: "cables",
    pattern: "isolation",
    type: "isolation",
    difficulty: "beginner",
    contraindications: ["shoulders"],
    defaultReps: [10, 14],
    alternatives: ["cable_tricep_pushdown", "dumbbell_overhead_extension"]
  },
  {
    id: "skull_crushers",
    name: "Barbell Skull Crushers",
    primaryMuscles: ["triceps"],
    secondaryMuscles: [],
    equipment: "barbell",
    pattern: "isolation",
    type: "isolation",
    difficulty: "intermediate",
    contraindications: ["wrists"],
    defaultReps: [8, 12],
    alternatives: ["cable_tricep_pushdown", "close_grip_bench_press"]
  },
  {
    id: "close_grip_bench_press",
    name: "Close-Grip Barbell Bench Press",
    primaryMuscles: ["triceps", "chest"],
    secondaryMuscles: ["front_delts"],
    equipment: "barbell",
    pattern: "horizontal_push",
    type: "compound",
    difficulty: "intermediate",
    contraindications: ["wrists", "shoulders"],
    defaultReps: [8, 10],
    alternatives: ["cable_tricep_pushdown", "chest_dips"]
  },

  // Arms: Biceps
  {
    id: "barbell_bicep_curl",
    name: "Barbell Standing Curl",
    primaryMuscles: ["biceps"],
    secondaryMuscles: ["forearms"],
    equipment: "barbell",
    pattern: "isolation",
    type: "isolation",
    difficulty: "beginner",
    contraindications: ["wrists"],
    defaultReps: [8, 12],
    alternatives: ["dumbbell_bicep_curl", "incline_dumbbell_curl"]
  },
  {
    id: "dumbbell_bicep_curl",
    name: "Dumbbell Alternating Curl",
    primaryMuscles: ["biceps"],
    secondaryMuscles: ["forearms"],
    equipment: "dumbbells",
    pattern: "isolation",
    type: "isolation",
    difficulty: "beginner",
    contraindications: [],
    defaultReps: [10, 12],
    alternatives: ["incline_dumbbell_curl", "cable_bicep_curl"]
  },
  {
    id: "incline_dumbbell_curl",
    name: "Incline Dumbbell Curl",
    primaryMuscles: ["biceps"],
    secondaryMuscles: [],
    equipment: "dumbbells",
    pattern: "isolation",
    type: "isolation",
    difficulty: "intermediate",
    contraindications: ["shoulders"],
    defaultReps: [10, 12],
    alternatives: ["dumbbell_bicep_curl", "hammer_curls"]
  },
  {
    id: "hammer_curls",
    name: "Dumbbell Hammer Curls",
    primaryMuscles: ["biceps", "forearms"],
    secondaryMuscles: [],
    equipment: "dumbbells",
    pattern: "isolation",
    type: "isolation",
    difficulty: "beginner",
    contraindications: [],
    defaultReps: [10, 14],
    alternatives: ["cable_rope_hammer_curl", "dumbbell_bicep_curl"]
  },
  {
    id: "cable_bicep_curl",
    name: "Cable Bicep Curl",
    primaryMuscles: ["biceps"],
    secondaryMuscles: [],
    equipment: "cables",
    pattern: "isolation",
    type: "isolation",
    difficulty: "beginner",
    contraindications: [],
    defaultReps: [12, 15],
    alternatives: ["barbell_bicep_curl", "dumbbell_bicep_curl"]
  },

  // Calves & Core
  {
    id: "standing_calf_raise",
    name: "Standing Calf Raise",
    primaryMuscles: ["calves"],
    secondaryMuscles: [],
    equipment: "machine",
    pattern: "isolation",
    type: "isolation",
    difficulty: "beginner",
    contraindications: [],
    defaultReps: [12, 16],
    alternatives: ["seated_calf_raise", "single_leg_bodyweight_calf_raise"]
  },
  {
    id: "hanging_leg_raise",
    name: "Hanging Leg Raise",
    primaryMuscles: ["core"],
    secondaryMuscles: ["forearms"],
    equipment: "bodyweight",
    pattern: "isolation",
    type: "compound",
    difficulty: "intermediate",
    contraindications: ["lower_back"],
    defaultReps: [10, 15],
    alternatives: ["cable_woodchopper", "ab_wheel_rollout"]
  },
  {
    id: "cable_woodchopper",
    name: "Cable Rotational Chop",
    primaryMuscles: ["core"],
    secondaryMuscles: ["shoulders"],
    equipment: "cables",
    pattern: "isolation",
    type: "isolation",
    difficulty: "beginner",
    contraindications: [],
    defaultReps: [12, 15],
    alternatives: ["hanging_leg_raise"]
  }
];

// ============================================================================
// ESTIMATED 1-REP MAX (EPLEY FORMULA)
// ============================================================================
export function calculateE1RM(weight, reps) {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  return parseFloat((weight * (1 + reps / 30)).toFixed(1));
}

// ============================================================================
// BARBELL PLATE CALCULATOR (GREEDY ALGORITHM)
// ============================================================================
export function calculatePlates(targetWeight, barWeight = 20, availablePlates = [25, 20, 15, 10, 5, 2.5, 1.25]) {
  let perSide = (targetWeight - barWeight) / 2;
  if (perSide <= 0) return [];

  const plates = [];
  const sorted = [...availablePlates].sort((a, b) => b - a);

  for (const plate of sorted) {
    while (perSide >= plate) {
      plates.push(plate);
      perSide = parseFloat((perSide - plate).toFixed(2));
    }
  }
  return plates;
}

// ============================================================================
// DYNAMIC WARM-UP LADDER GENERATOR
// ============================================================================
export function generateWarmupLadder(workingWeight, barWeight = 20) {
  if (workingWeight <= barWeight) return [];
  return [
    { set: "W1", weight: barWeight, reps: 10, note: "Bar warm-up & joint activation" },
    { set: "W2", weight: Math.round((workingWeight * 0.5) / 2.5) * 2.5, reps: 5, note: "50% load prep" },
    { set: "W3", weight: Math.round((workingWeight * 0.7) / 2.5) * 2.5, reps: 3, note: "70% speed single" },
    { set: "W4", weight: Math.round((workingWeight * 0.85) / 2.5) * 2.5, reps: 1, note: "85% potentiation single" }
  ];
}

// ============================================================================
// PROGRESSIVE OVERLOAD ENGINE (DOUBLE PROGRESSION)
// ============================================================================
export function computeProgression(lastSets, targetRepMax, isCompound = true, smallestStep = 2.5) {
  if (!lastSets || lastSets.length === 0) return { action: "maintain", delta: 0, reason: "No previous logs." };

  const allCompleted = lastSets.every(s => s.completed && s.reps >= targetRepMax);
  const allEasy = lastSets.every(s => s.effort === "easy");
  const hardCount = lastSets.filter(s => s.effort === "hard").length;

  if (allCompleted) {
    if (allEasy) {
      // Aggressive double-step jump
      const delta = smallestStep * 2;
      return { action: "increase", delta, reason: `Hit ${targetRepMax} reps easily across all sets. Progressive overload: +${delta}kg.` };
    }
    return { action: "increase", delta: smallestStep, reason: `Target reps achieved on all sets. Progressive overload: +${smallestStep}kg.` };
  }

  if (hardCount >= 2) {
    return { action: "hold", delta: 0, reason: "Sets were challenging. Holding weight to consolidate form." };
  }

  return { action: "maintain", delta: 0, reason: "Aim to add +1 rep on your first set today." };
}

// ============================================================================
// STARTING WEIGHT ESTIMATOR
// ============================================================================
export function estimateStartingWeight(exerciseId, bodyWeightKg = 75, sex = "male", experience = "intermediate") {
  const expFactor = experience === "advanced" ? 1.2 : (experience === "intermediate" ? 0.9 : 0.6);
  const sexFactor = sex === "female" ? 0.65 : 1.0;

  const ratios = {
    barbell_bench_press: 0.75,
    barbell_back_squat: 1.0,
    conventional_deadlift: 1.2,
    overhead_barbell_press: 0.45,
    lat_pulldown: 0.65,
    seated_cable_row: 0.6,
    dumbbell_flat_press: 0.25,
    dumbbell_lateral_raise: 0.1,
    cable_tricep_pushdown: 0.3,
    incline_dumbbell_curl: 0.15
  };

  const ratio = ratios[exerciseId] || 0.4;
  const raw = bodyWeightKg * ratio * expFactor * sexFactor;
  return Math.max(5, Math.round(raw / 2.5) * 2.5);
}

// ============================================================================
// SPLIT & PLAN GENERATOR (Rolling, Adaptive)
// ============================================================================
export function generateWeeklyPlan(daysPerWeek = 4, equipmentList = [], limitations = [], bodyWeight = 75, sex = "male", experience = "intermediate") {
  // Filter exercise catalog by equipment & contraindications
  const available = EXERCISE_LIBRARY.filter(ex => {
    // Check contraindications
    if (limitations.some(lim => ex.contraindications.includes(lim))) return false;
    // Check equipment
    if (ex.equipment === "bodyweight") return true;
    if (equipmentList.length > 0 && !equipmentList.includes(ex.equipment)) return false;
    return true;
  });

  const getEx = (pattern, fallbackId) => {
    const match = available.find(e => e.pattern === pattern);
    if (match) return match;
    const fallback = EXERCISE_LIBRARY.find(e => e.id === fallbackId);
    return fallback || available[0];
  };

  if (daysPerWeek <= 3) {
    // Full Body A & B
    return [
      {
        id: "session_fb_a",
        name: "Full Body A (Squat & Push)",
        durationMinutes: 50,
        muscles: ["quads", "chest", "lats"],
        exercises: [
          createSessionSlot(getEx("squat", "barbell_back_squat"), bodyWeight, sex, experience),
          createSessionSlot(getEx("horizontal_push", "barbell_bench_press"), bodyWeight, sex, experience),
          createSessionSlot(getEx("vertical_pull", "lat_pulldown"), bodyWeight, sex, experience),
          createSessionSlot(getEx("isolation", "dumbbell_lateral_raise"), bodyWeight, sex, experience)
        ]
      },
      {
        id: "session_fb_b",
        name: "Full Body B (Hinge & Pull)",
        durationMinutes: 50,
        muscles: ["hamstrings", "upper_back", "front_delts"],
        exercises: [
          createSessionSlot(getEx("hinge", "dumbbell_rdl"), bodyWeight, sex, experience),
          createSessionSlot(getEx("horizontal_pull", "seated_cable_row"), bodyWeight, sex, experience),
          createSessionSlot(getEx("vertical_push", "seated_dumbbell_shoulder_press"), bodyWeight, sex, experience),
          createSessionSlot(getEx("isolation", "cable_tricep_pushdown"), bodyWeight, sex, experience)
        ]
      }
    ];
  }

  // 4-Day Upper / Lower Split (Default Standard)
  return [
    {
      id: "session_ul_upper_a",
      name: "Upper Body A (Horizontal Focus)",
      durationMinutes: 50,
      muscles: ["chest", "lats", "triceps"],
      exercises: [
        createSessionSlot(getEx("horizontal_push", "barbell_bench_press"), bodyWeight, sex, experience),
        createSessionSlot(getEx("horizontal_pull", "seated_cable_row"), bodyWeight, sex, experience),
        createSessionSlot(getEx("vertical_push", "seated_dumbbell_shoulder_press"), bodyWeight, sex, experience),
        createSessionSlot(getEx("isolation", "cable_tricep_pushdown"), bodyWeight, sex, experience)
      ]
    },
    {
      id: "session_ul_lower_a",
      name: "Lower Body A (Squat Dominant)",
      durationMinutes: 55,
      muscles: ["quads", "glutes", "calves"],
      exercises: [
        createSessionSlot(getEx("squat", "barbell_back_squat"), bodyWeight, sex, experience),
        createSessionSlot(getEx("hinge", "dumbbell_rdl"), bodyWeight, sex, experience),
        createSessionSlot(getEx("isolation", "dumbbell_lateral_raise"), bodyWeight, sex, experience),
        createSessionSlot(getEx("isolation", "incline_dumbbell_curl"), bodyWeight, sex, experience)
      ]
    },
    {
      id: "session_ul_upper_b",
      name: "Upper Body B (Vertical Focus)",
      durationMinutes: 50,
      muscles: ["lats", "chest", "biceps"],
      exercises: [
        createSessionSlot(getEx("vertical_pull", "lat_pulldown"), bodyWeight, sex, experience),
        createSessionSlot(getEx("horizontal_push", "dumbbell_flat_press"), bodyWeight, sex, experience),
        createSessionSlot(getEx("horizontal_pull", "face_pulls"), bodyWeight, sex, experience),
        createSessionSlot(getEx("isolation", "incline_dumbbell_curl"), bodyWeight, sex, experience)
      ]
    },
    {
      id: "session_ul_lower_b",
      name: "Lower Body B (Hinge Dominant)",
      durationMinutes: 55,
      muscles: ["hamstrings", "glutes", "core"],
      exercises: [
        createSessionSlot(getEx("hinge", "trap_bar_deadlift"), bodyWeight, sex, experience),
        createSessionSlot(getEx("squat", "leg_press"), bodyWeight, sex, experience),
        createSessionSlot(getEx("isolation", "standing_calf_raise"), bodyWeight, sex, experience),
        createSessionSlot(getEx("isolation", "cable_tricep_pushdown"), bodyWeight, sex, experience)
      ]
    }
  ];
}

function createSessionSlot(ex, bodyWeight, sex, experience) {
  const weight = estimateStartingWeight(ex.id, bodyWeight, sex, experience);
  return {
    exerciseId: ex.id,
    name: ex.name,
    equipment: ex.equipment,
    targetSets: 3,
    targetReps: ex.defaultReps[1] || 10,
    targetWeight: weight,
    restSeconds: ex.type === "compound" ? 120 : 75
  };
}

/**
 * Generates the full Day 1 to Day N program structure.
 * Days unlock sequentially as previous days are completed.
 * Weights on locked days are marked adaptive.
 */
export function generateFullProgram(
  totalDays = 60,
  daysPerWeek = 4,
  equipmentList = [],
  limitations = [],
  bodyWeight = 75,
  sex = "male",
  experience = "intermediate",
  goal = "muscle",
  prioritizedMuscles = []
) {
  const weeklyBase = generateWeeklyPlan(
    daysPerWeek,
    equipmentList,
    limitations,
    bodyWeight,
    sex,
    experience
  );

  // Define training day indices within a 7-day microcycle
  let trainingDayIndices = [1, 2, 4, 5]; // default 4-day (1-based: Mon, Tue, Thu, Fri)
  if (daysPerWeek === 2) trainingDayIndices = [1, 4];
  else if (daysPerWeek === 3) trainingDayIndices = [1, 3, 5];
  else if (daysPerWeek === 5) trainingDayIndices = [1, 2, 3, 5, 6];
  else if (daysPerWeek === 6) trainingDayIndices = [1, 2, 3, 4, 5, 6];

  const fullProgram = [];
  let trainingSessionPointer = 0;

  for (let dayNum = 1; dayNum <= totalDays; dayNum++) {
    const dayOfWeek = ((dayNum - 1) % 7) + 1; // 1 to 7
    const weekNum = Math.ceil(dayNum / 7);
    const totalWeeks = Math.ceil(totalDays / 7);

    // Determine periodization phase
    let phase = "Foundation";
    let isDeload = false;

    if (totalWeeks >= 4 && weekNum % 5 === 0) {
      phase = "Deload";
      isDeload = true;
    } else if (weekNum > totalWeeks - 2) {
      phase = "Peak";
    } else if (weekNum > 3) {
      phase = "Build";
    }

    const isTrainingDay = trainingDayIndices.includes(dayOfWeek);

    if (isTrainingDay) {
      const baseSession = weeklyBase[trainingSessionPointer % weeklyBase.length];
      trainingSessionPointer++;

      // Clone exercises and adjust for phase / deload / prioritized muscles
      const exercises = baseSession.exercises.map(e => {
        let sets = isDeload ? 2 : e.targetSets;
        let weight = isDeload ? Math.round(e.targetWeight * 0.85) : e.targetWeight;
        
        // Boost volume if muscle is prioritized
        const exMeta = EXERCISE_LIBRARY.find(lib => lib.id === e.exerciseId);
        if (exMeta && prioritizedMuscles.some(m => exMeta.primaryMuscles.includes(m))) {
          sets = Math.min(5, sets + 1);
        }

        return {
          ...e,
          targetSets: sets,
          targetWeight: weight
        };
      });

      fullProgram.push({
        dayNumber: dayNum,
        weekNumber: weekNum,
        dayOfWeek,
        phase,
        isDeload,
        isRest: false,
        sessionId: `day_${dayNum}_${baseSession.id}`,
        name: `Day ${dayNum} – ${baseSession.name}`,
        shortName: baseSession.name.split(" (")[0],
        focus: baseSession.muscles.map(m => m.replace("_", " ")).join(", "),
        muscles: baseSession.muscles,
        durationMinutes: isDeload ? Math.round(baseSession.durationMinutes * 0.8) : baseSession.durationMinutes,
        exercises
      });
    } else {
      // Recovery Day
      fullProgram.push({
        dayNumber: dayNum,
        weekNumber: weekNum,
        dayOfWeek,
        phase,
        isDeload,
        isRest: true,
        sessionId: `day_${dayNum}_recovery`,
        name: `Day ${dayNum} – Rest & Active Recovery`,
        shortName: "Recovery",
        focus: "Mobility, Hydration, Sleep",
        muscles: ["recovery"],
        durationMinutes: 20,
        exercises: [
          {
            exerciseId: "mobility_flow",
            name: "Hip & Thoracic Mobility Flow",
            equipment: "bodyweight",
            targetSets: 2,
            targetReps: 10,
            targetWeight: 0,
            restSeconds: 45
          },
          {
            exerciseId: "light_walk",
            name: "Zone 1 Aerobic Walk (20 min)",
            equipment: "bodyweight",
            targetSets: 1,
            targetReps: 1,
            targetWeight: 0,
            restSeconds: 0
          }
        ]
      });
    }
  }

  return fullProgram;
}

/**
 * Returns comprehensive form cues, common mistakes, and alternative lifts for any exercise.
 */
export function getExerciseDetails(exerciseId) {
  const ex = EXERCISE_LIBRARY.find(e => e.id === exerciseId);
  if (!ex) {
    return {
      name: "Exercise Details",
      pattern: "General",
      equipment: "Standard",
      primaryMuscles: ["Full Body"],
      cues: ["Maintain neutral spine", "Breathe steadily through the eccentric phase", "Full control on descent"],
      mistakes: ["Using momentum instead of muscular contraction", "Shortening the range of motion"],
      alternatives: []
    };
  }

  const cuesMap = {
    barbell_bench_press: {
      cues: ["Retract and depress your scapulae into the bench", "Keep forearms vertical throughout the press", "Drive feet through floor to generate leg drive", "Touch lower sternum smoothly without bouncing"],
      mistakes: ["Flaring elbows out at 90 degrees", "Lifting hips off the bench surface", "Uneven bar lockout"]
    },
    dumbbell_flat_press: {
      cues: ["Keep dumbbells at a 45-degree angle to torso", "Lower until a deep stretch is felt in the chest", "Press up in a slight arc over mid-chest"],
      mistakes: ["Colliding weights together at the top", "Bouncing at the bottom of the stretch"]
    },
    incline_dumbbell_press: {
      cues: ["Set bench to 30-degree incline", "Drive shoulders back and down", "Focus on clavicular head contraction at top"],
      mistakes: ["Setting bench angle too steep (shifts work to front delts)", "Arching lower back excessively"]
    },
    barbell_back_squat: {
      cues: ["Create high upper-back shelf with traps", "Brace core 360 degrees before descending", "Drive knees outward in line with middle toes", "Break parallel with control and explode up"],
      mistakes: ["Knees collapsing inward (valgus collapse)", "Chest caving forward / good morning squat", "Rising onto toes during ascent"]
    },
    trap_bar_deadlift: {
      cues: ["Stand in center of diamond bar", "Hinge hips back and pull slack out of handles", "Drive ground away through heels and mid-foot", "Lock out hips by squeezing glutes at the top"],
      mistakes: ["Rounding the lumbar spine", "Jerking the weight off the floor", "Hyperextending spine at lockout"]
    },
    lat_pulldown: {
      cues: ["Slight lean back (10-15 degrees)", "Initiate pull with shoulder blades, not arms", "Drive elbows toward back pockets", "Control the stretch on the way up"],
      mistakes: ["Swinging body back and forth", "Pulling bar down to stomach instead of clavicle", "Using wrist flexion to pull"]
    },
    seated_cable_row: {
      cues: ["Keep spine vertical with slight natural arch", "Full forward stretch without rounding lower back", "Pull handle to lower abdomen with elbows tucked"],
      mistakes: ["Excessive rocking momentum", "Shrugging traps up toward ears"]
    },
    dumbbell_rdl: {
      cues: ["Soft bend in knees that stays fixed", "Push hips backward toward the wall", "Keep dumbbells tracking close along thighs and shins", "Stop when hamstrings reach full stretch"],
      mistakes: ["Turning movement into a squat by bending knees", "Rounding upper/lower back to reach lower"]
    }
  };

  const specific = cuesMap[exerciseId] || {
    cues: [
      "Keep core braced and maintain neutral joint alignment",
      "Control the eccentric (lowering) tempo over 2-3 seconds",
      "Drive through the active muscle group with full intention"
    ],
    mistakes: [
      "Using momentum to swing the weight",
      "Cutting range of motion short at the top or bottom"
    ]
  };

  const alternatives = (ex.alternatives || [])
    .map(altId => EXERCISE_LIBRARY.find(e => e.id === altId))
    .filter(Boolean);

  return {
    ...ex,
    ...specific,
    alternatives
  };
}
