# 🔥 PUSH–PA — The Smart Workout & Strength Tracker

> **Train. Track. Burn.**  
> PUSHPA gives you two distinct ways to train: an automated **AI Planner** that designs and adapts your periodized mesocycles, and an intuitive **Logbook** with Notion-style freedom, spark AI progression suggestions, and intelligent missed-day queueing.

---

## 🌐 Live Application

Experience the mobile web application live:  
👉 **[https://setly-zeta.vercel.app/](https://setly-zeta.vercel.app/)**

*Works on all modern mobile phones (iOS Safari, Android Chrome) and desktop browsers.*

---

## 📱 Install as an App on Your Device

### 🤖 For Android Users:
1. Open **[https://setly-zeta.vercel.app/](https://setly-zeta.vercel.app/)** in Google Chrome.
2. Tap the **"Install Pushpa App"** banner or tap Chrome menu `⋮` → **Install app** / **Add to Home screen**.
3. Or generate a standalone `.apk` directly via [PWABuilder](https://www.pwabuilder.com) using the guide in [BUILD_ANDROID.md](BUILD_ANDROID.md).

### 🍏 For iPhone Users:
1. Open **[https://setly-zeta.vercel.app/](https://setly-zeta.vercel.app/)** in **Safari**.
2. Tap the **Share** button (`↑`) at the bottom of the screen.
3. Tap **Add to Home Screen**, then tap **Add**.
4. PUSHPA launches as a full-screen standalone native experience without browser chrome. See [BUILD_IOS.md](BUILD_IOS.md).

---

## 🔥 What's New in Pushpa (Round 4)

### 1. Cinematic Fire Experience & Rebrand
- **Signature Fire Theme**: Deep OLED dark canvas (`#050505`, `#0F0D0C`, `#191513`), blazing accents (`#FF3D2E`, `#FF6A00`, `#FFB020`), and heated barbell glowing wordmark (`PUSH–PA`).
- **Interactive Fire Splash Intro**: Canvas floating ember particles, flickering multi-layer SVG flame, and synthesized Web Audio sound effects (sub-bass ignition boom, filtered noise whoosh, fire crackle, and letter slam impact).
- **Dark Mode Contrast Perfection**: Resolved white-on-white text input styling with explicit system color overrides and `inputmode="decimal"`.

### 2. Dual Training Modes (Switch Anytime)
Switch instantly with the top pill switcher or mode selector:
- **Mode A: AI Planner**
  - **Rolling Adaptive Mesocycles**: 30, 60, 90, 180, 360-day or custom program lengths.
  - **Interactive Day Map**: Visual 5-column roadmap with completed checks, current day pulses, and locked progression states.
  - **Anatomical Volume Heatmap**: Interactive male/female muscle outlines glowing according to weekly set volume.
  - **Smart Double Progression**: Auto-adjusts target loads based on real-time RPE effort ratings (*Easy*, *Good*, *Hard*).
- **Mode B: Notion-Style Free Logbook**
  - **Weekly Overview & Daily Pages**: Clean, minimalist blocks for freeform workout tracking.
  - **Display-Only "Last Time" Line**: Shows your previous session's weight and reps as a quick visual reference without ever pre-filling inputs.
  - **Spark AI Suggestions**: On-device rules engine evaluating rep ranges, load maintenance, and volume adjustments.
  - **Intelligent Missed-Day Queue**: Missed sessions roll into open rest days within the week, automatically resetting cleanly on Monday so you never fall behind.
  - **Consistency Reports**: Plain-English progress summaries and streak analytics.

### 3. Guided Home Workout Player
- **2D Low-Poly Faceted Skeleton**: Smooth vector athlete displaying joint angles and ground contact line.
- **Dynamic Fire Muscle Pulses**: Real-time fire-orange highlights on primary muscle groups during each movement phase.
- **22+ Built-in Exercises**: Squats, Push-Ups, Glute Bridges, Mountain Climbers, Planks, Pike Push-Ups, and more.
- **Real-Time Calorie & MET Tracking**: Formula-based metabolic equivalent (MET) calorie burning counter updated per tick.
- **Audio Cues & Interval Timer**: Form cues, common mistake alerts, and work/rest countdowns.

### 4. Local-First & Backup Security
- **100% On-Device Privacy**: All logs, programs, and weights reside in `localStorage`.
- **Backup & Restore**: Export full database state as JSON or workout history as CSV. Import backups seamlessly on any device.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: Vanilla ES Modules JavaScript, Semantic HTML5, CSS3 Custom Properties.
- **No Heavy Framework**: Ultra-fast cold boot, instant interactions, zero bundle overhead.
- **Pure Training Engines**: Modular logic in `engine.js` (Epley 1RM, plate math, mesocycles) and `logbook-engine.js` (queue shifter, suggestions).
- **Audio Synthesis**: Pure Web Audio API oscillators and noise buffers — no audio assets to fetch.
- **Packaging**: Ready for Android compilation via Capacitor (`com.pushpa.app`) and GitHub Actions.

---

## 🧪 Unit Testing

Unit tests for the missed-day logbook queue engine are integrated directly into `prototype/logbook-engine.js`:
```powershell
node -e "import('./prototype/logbook-engine.js').then(m => m.runMissedDayUnitTests())"
```
Verifies:
1. Regular schedules with no misses.
2. Mid-week shift when a day is missed and caught up on a rest day.
3. Multi-day misses with weekly reset back to Day 1.
4. Single-day training with clean Monday reset.
