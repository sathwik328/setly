/**
 * PUSHPA GUIDED HOME WORKOUTS — 2D MOVEMENT SKELETON & KEYFRAMES LIBRARY
 * Pure data-driven moves with joint angles, MET calorie factors, cues and mistakes
 */

export const GUIDED_MOVES = [
  {
    id: "arm_circles",
    name: "Arm Circles",
    view: "front",
    type: "time",
    defaultDuration: 30,
    met: 3.5,
    primaryMuscles: ["shoulders"],
    secondaryMuscles: ["traps"],
    cues: ["Keep arms straight at shoulder height", "Make smooth circles with controlled tempo"],
    mistakes: ["Dropping elbows below shoulders", "Arching lower back"],
    keyframes: [
      { t: 0, shoulderL: -90, shoulderR: 90, elbowL: 0, elbowR: 0 },
      { t: 0.5, shoulderL: -75, shoulderR: 105, elbowL: 0, elbowR: 0 },
      { t: 1.0, shoulderL: -90, shoulderR: 90, elbowL: 0, elbowR: 0 }
    ]
  },
  {
    id: "jumping_jacks",
    name: "Jumping Jacks",
    view: "front",
    type: "time",
    defaultDuration: 30,
    met: 8.0,
    primaryMuscles: ["calves", "shoulders"],
    secondaryMuscles: ["core", "quads"],
    cues: ["Land softly on balls of feet", "Clap overhead with full extension"],
    mistakes: ["Landing flat-footed with heavy impact", "Bending elbows too much"],
    keyframes: [
      { t: 0, hipL: 5, hipR: -5, shoulderL: -20, shoulderR: 20 },
      { t: 0.5, hipL: 25, hipR: -25, shoulderL: -150, shoulderR: 150 },
      { t: 1.0, hipL: 5, hipR: -5, shoulderL: -20, shoulderR: 20 }
    ]
  },
  {
    id: "high_knees",
    name: "High Knees",
    view: "side",
    type: "time",
    defaultDuration: 30,
    met: 8.5,
    primaryMuscles: ["quads", "core"],
    secondaryMuscles: ["calves"],
    cues: ["Drive knees up to hip height", "Pump arms in rhythm with cadence"],
    mistakes: ["Leaning backward", "Dropping knees below waist"]
  },
  {
    id: "hip_circles",
    name: "Hip Circles",
    view: "front",
    type: "time",
    defaultDuration: 30,
    met: 3.0,
    primaryMuscles: ["glutes", "core"],
    secondaryMuscles: ["hamstrings"],
    cues: ["Hands on hips, smooth circular rotations", "Feel stretch through outer hips"],
    mistakes: ["Bending knees excessively", "Jerking the lower back"]
  },
  {
    id: "inchworm",
    name: "Inchworm Walkouts",
    view: "side",
    type: "reps",
    defaultReps: 8,
    met: 5.0,
    primaryMuscles: ["hamstrings", "core"],
    secondaryMuscles: ["shoulders", "chest"],
    cues: ["Hinge at hips with soft knees", "Walk hands out into high plank brace"],
    mistakes: ["Sagging hips in the plank", "Rushing the walkout"]
  },
  {
    id: "push_up",
    name: "Push-Ups",
    view: "side",
    type: "reps",
    defaultReps: 12,
    met: 6.0,
    primaryMuscles: ["chest", "triceps"],
    secondaryMuscles: ["front_delts", "core"],
    cues: ["Elbows at 45 degrees to ribs", "Chest reaches 2 inches from floor", "Solid body line from head to heels"],
    mistakes: ["Sagging lumbar spine", "Flaring elbows out to 90 degrees"]
  },
  {
    id: "knee_push_up",
    name: "Knee Push-Ups",
    view: "side",
    type: "reps",
    defaultReps: 10,
    met: 4.5,
    primaryMuscles: ["chest", "triceps"],
    secondaryMuscles: ["front_delts"],
    cues: ["Keep straight line from knees to head", "Full depth push to chest level"],
    mistakes: ["Leaving hips in the air (piking)"]
  },
  {
    id: "pike_push_up",
    name: "Pike Push-Ups",
    view: "side",
    type: "reps",
    defaultReps: 8,
    met: 6.5,
    primaryMuscles: ["shoulders", "triceps"],
    secondaryMuscles: ["traps", "core"],
    cues: ["Hips piked high in inverted V", "Lower crown of head diagonally forward between hands"],
    mistakes: ["Turning movement into standard push-up", "Rounding thoracic spine"]
  },
  {
    id: "squat",
    name: "Air Squats",
    view: "side",
    type: "reps",
    defaultReps: 15,
    met: 5.5,
    primaryMuscles: ["quads", "glutes"],
    secondaryMuscles: ["hamstrings", "calves"],
    cues: ["Drive knees outward over middle toes", "Break parallel with hip crease below knees", "Chest proud"],
    mistakes: ["Knees caving inward (valgus collapse)", "Rising onto toes"]
  },
  {
    id: "lunge",
    name: "Walking Lunges",
    view: "side",
    type: "reps",
    defaultReps: 12,
    met: 6.0,
    primaryMuscles: ["quads", "glutes"],
    secondaryMuscles: ["hamstrings", "calves"],
    cues: ["Both knees bend to 90 degrees", "Drive through front heel on ascent"],
    mistakes: ["Front knee shooting past toes", "Banging back knee on floor"]
  },
  {
    id: "glute_bridge",
    name: "Glute Bridges",
    view: "side",
    type: "reps",
    defaultReps: 15,
    met: 4.0,
    primaryMuscles: ["glutes"],
    secondaryMuscles: ["hamstrings", "core"],
    cues: ["Feet flat, drive through heels", "Squeeze glutes hard at the top", "Do not hyperextend spine"],
    mistakes: ["Pushing with lower back instead of glutes"]
  },
  {
    id: "plank",
    name: "Forearm Plank",
    view: "side",
    type: "time",
    defaultDuration: 40,
    met: 4.0,
    primaryMuscles: ["core"],
    secondaryMuscles: ["shoulders", "glutes"],
    cues: ["Forearms parallel, elbows under shoulders", "Brace abs as if preparing for a punch"],
    mistakes: ["Sagging hips", "Piking hips into air"]
  },
  {
    id: "mountain_climber",
    name: "Mountain Climbers",
    view: "side",
    type: "time",
    defaultDuration: 30,
    met: 8.0,
    primaryMuscles: ["core", "shoulders"],
    secondaryMuscles: ["quads", "calves"],
    cues: ["High plank brace", "Drive knees rapidly toward chest with control"],
    mistakes: ["Bouncing hips up and down", "Hands drifting ahead of shoulders"]
  },
  {
    id: "bicycle_crunch",
    name: "Bicycle Crunches",
    view: "front",
    type: "reps",
    defaultReps: 20,
    met: 5.0,
    primaryMuscles: ["core"],
    secondaryMuscles: ["hip_flexors"],
    cues: ["Rotate shoulder toward opposite knee", "Slow, deliberate contraction, no neck pulling"],
    mistakes: ["Yanking on the back of the neck", "Moving too fast without contraction"]
  },
  {
    id: "chair_tricep_dip",
    name: "Chair Tricep Dips",
    view: "side",
    type: "reps",
    defaultReps: 12,
    met: 5.0,
    primaryMuscles: ["triceps"],
    secondaryMuscles: ["front_delts", "chest"],
    cues: ["Keep back close to chair edge", "Lower until elbows reach 90 degrees"],
    mistakes: ["Shoulders shrugging up to ears", "Drifting hips too far forward"]
  },
  {
    id: "superman",
    name: "Supermans",
    view: "side",
    type: "reps",
    defaultReps: 12,
    met: 4.0,
    primaryMuscles: ["lower_back", "glutes"],
    secondaryMuscles: ["traps"],
    cues: ["Lie prone, lift arms and thighs together", "Hold squeeze at top for 2 seconds"],
    mistakes: ["Jerking neck upward", "Holding breath"]
  },
  {
    id: "burpee",
    name: "Full Burpees",
    view: "side",
    type: "reps",
    defaultReps: 10,
    met: 9.5,
    primaryMuscles: ["full_body", "chest", "quads"],
    secondaryMuscles: ["core", "shoulders"],
    cues: ["Drop to chest on floor, snap feet to hands, jump vertically with clap"],
    mistakes: ["Landing stiff-legged", "Skipping the jump at the top"]
  },
  {
    id: "wall_sit",
    name: "Wall Sit",
    view: "side",
    type: "time",
    defaultDuration: 35,
    met: 4.5,
    primaryMuscles: ["quads"],
    secondaryMuscles: ["calves", "glutes"],
    cues: ["Thighs parallel to floor", "Knees stacked over ankles, back flat against wall"],
    mistakes: ["Resting hands on knees", "Sliding down below 90 degrees"]
  },
  {
    id: "childs_pose",
    name: "Child's Pose",
    view: "side",
    type: "time",
    defaultDuration: 30,
    met: 2.0,
    primaryMuscles: ["lats", "lower_back"],
    secondaryMuscles: ["hips"],
    cues: ["Knees wide, sink hips back to heels", "Extend arms forward and breathe deeply"],
    mistakes: ["Tensing shoulders"]
  },
  {
    id: "cobra_stretch",
    name: "Cobra Stretch",
    view: "side",
    type: "time",
    defaultDuration: 30,
    met: 2.0,
    primaryMuscles: ["abs"],
    secondaryMuscles: ["chest", "spine"],
    cues: ["Press palms down, extend chest forward and up", "Keep shoulders away from ears"],
    mistakes: ["Pinching lower back aggressively"]
  },
  {
    id: "standing_quad_stretch",
    name: "Standing Quad Stretch",
    view: "side",
    type: "time",
    defaultDuration: 30,
    met: 2.0,
    primaryMuscles: ["quads"],
    secondaryMuscles: ["hip_flexors"],
    cues: ["Pull heel gently toward glute", "Keep knees touching and posture tall"],
    mistakes: ["Arching lower back", "Allowing knee to flare out to side"]
  },
  {
    id: "hamstring_stretch",
    name: "Standing Hamstring Stretch",
    view: "side",
    type: "time",
    defaultDuration: 30,
    met: 2.0,
    primaryMuscles: ["hamstrings"],
    secondaryMuscles: ["calves"],
    cues: ["Hinge at hips, reach toward toes with flat back", "Feel gentle stretch along posterior thigh"],
    mistakes: ["Rounding spine excessively to reach toes"]
  }
];

export const GUIDED_ROUTINES = {
  full_body: {
    name: "Full Body Ignite",
    estimatedMinutes: 16,
    warmup: ["arm_circles", "hip_circles", "jumping_jacks"],
    main: ["squat", "push_up", "lunge", "plank", "mountain_climber", "glute_bridge", "burpee"],
    cooldown: ["cobra_stretch", "childs_pose", "hamstring_stretch"]
  },
  upper_body: {
    name: "Upper Body Blaze",
    estimatedMinutes: 14,
    warmup: ["arm_circles", "inchworm"],
    main: ["push_up", "pike_push_up", "chair_tricep_dip", "plank", "knee_push_up"],
    cooldown: ["childs_pose", "cobra_stretch"]
  },
  lower_body: {
    name: "Lower Body Forge",
    estimatedMinutes: 15,
    warmup: ["hip_circles", "high_knees"],
    main: ["squat", "lunge", "glute_bridge", "wall_sit", "jumping_jacks"],
    cooldown: ["standing_quad_stretch", "hamstring_stretch"]
  },
  core: {
    name: "Core Inferno",
    estimatedMinutes: 12,
    warmup: ["hip_circles", "inchworm"],
    main: ["plank", "mountain_climber", "bicycle_crunch", "superman", "glute_bridge"],
    cooldown: ["cobra_stretch", "childs_pose"]
  }
};
