# ⚡ SETLY — Smart Workout Planner

> **Lift. Log. Level up.**  
> SETLY tells you exactly what to lift today (exercises, sets, reps, weight), learns from how each set felt, and shows clear progress so you always know you are getting stronger.

---

## 🌐 Live Application

Experience the full mobile web application live in your browser:  
👉 **[https://setly-zeta.vercel.app/](https://setly-zeta.vercel.app/)**

*Works on all mobile devices (iOS & Android) and desktop browsers.*

---

## 📱 Install as an App on Your Phone

SETLY is a Progressive Web App (PWA) designed to look and feel like a native mobile app.

### 🤖 For Android Users:
1. Open **[https://setly-zeta.vercel.app/](https://setly-zeta.vercel.app/)** in Google Chrome.
2. Tap the **"Android (APK / Install)"** button on the home screen banner (or tap Chrome's menu `⋮` → **Add to Home screen** / **Install app**).
3. The SETLY app icon will appear on your home screen. It runs in full screen and works offline.

### 🍏 For iPhone Users:
1. Open **[https://setly-zeta.vercel.app/](https://setly-zeta.vercel.app/)** in **Safari**.
2. Tap the **Share** button at the bottom of the screen (the square with an arrow pointing up `↑`).
3. Scroll down and tap **Add to Home Screen**, then tap **Add**.
4. The SETLY app icon is installed! It opens in standalone full-screen mode without any browser address bar.

---

## ✨ Key Features & Capabilities

### 1. Flexible Program Length (30 to 360 Days)
- Choose the exact commitment that fits your schedule:
  - **30 Days (Quick Start)**: 4 weeks • Perfect for a fitness habit reset.
  - **60 Days (Solid Block)**: 8 weeks • Full periodized training block.
  - **90 Days (Full Transformation)**: 12 weeks • Foundation, Build, and Peak phases.
  - **180 Days (Long Game)**: 26 weeks • Advanced progressive overload mesocycle.
  - **360 Days (Full Year)**: 52 weeks • Complete annual athletic roadmap with built-in deloads.
  - **Custom Duration**: Enter any length from 14 to 365 days.

### 2. Full-Length Day Map & Unlock System
- View every single workout from **Day 1 to Day N** in an interactive 5-column grid.
- **Completed Days**: Highlighted with an electric lime checkmark.
- **Current Day**: Pulses with a gentle neon glow.
- **Upcoming Locked Days**: Kept locked until you finish the previous day, preventing program overload.
- **Rest & Recovery Days**: Marked with dashed circles and mobility routines.
- **Zero-Penalty Plan Shifter**: Missed a day or need extra recovery? Shift the plan forward with one tap — life happens, and your streak never breaks.

### 3. Interactive Anatomical Body Map
- **Male & Female Outlines**: Switch between anatomical outlines with one tap.
- **Volume Heat-Map Shading**: Muscles glow brighter in electric lime based on how much training volume they received this week.
- **Muscle Info Cards**: Tap any muscle region (Chest, Lats, Shoulders, Biceps, Quads, etc.) to see weekly sets, recommended ranges, and best exercises.
- **Prioritize Muscle Toggle**: Tap "+ Prioritize Volume" on lagging muscles to have the training engine automatically prescribe extra targeted volume.

### 4. One-Tap Live Workout Logging
- **Fast Set Tracking**: Check off sets with a single tap.
- **Weight & Rep Steppers**: Fine-tune your load with easy `+` and `-` steppers ($2.5\text{ kg}$ and $1\text{ rep}$).
- **Inline Effort Feedback**: Rate every working set as **Easy**, **Good**, or **Hard**.
- **Adaptive Double Progression**: The engine reads your effort rating to automatically calculate your target weights for the next session.

### 5. Gym Tools Included
- **Barbell Plate Calculator**: Visual graphic showing the exact colored Olympic plates (25kg, 20kg, 15kg, 10kg, 5kg, 2.5kg, 1.25kg) to load on each side of the barbell.
- **Dynamic 4-Step Warmup Ladder**: Progressive warmup ramp (Bar only $\to$ 50% $\to$ 70% $\to$ 85%) to prime your nervous system and protect joints.
- **Movement Pattern Swaps**: Swap any exercise with a safe alternative targeting the same pattern without aggravating joint limitations.
- **Floating Rest Timer**: Automatic countdown with synthesized sound chimes that won't drift if your phone screen goes to sleep.

### 6. Synthesized Audio & Motion Design
- **Web Audio Sound Effects**: Zero external audio files to download — snappy synthesized chimes for button taps, tab switches, sheet opens, and set completions (3-note chime).
- **Mute Toggle**: Quick speaker button in the top header with persistent settings.
- **"Gym at Night" Aesthetic**: Warm dark palette (`#0E0F0C`) accented with Electric Lime (`#C6FF3D`) and high-readability typography (`Bricolage Grotesque` and `Inter`).

---

## 🔒 Privacy & Local-First Philosophy

- **No Mandatory Login**: Click **"Continue as Guest"** for instant access.
- **100% On-Device Storage**: Your workout logs, body weights, and personal records never leave your phone.
- **Web Crypto Hashing**: Account passwords are encrypted using SHA-256 directly on your device.
- **Data Export & Freedom**: Export your full state backup as a `.JSON` file or your complete workout history as a `.CSV` file anytime.

---

## 🛠️ Technology Stack

- **Frontend**: Vanilla JavaScript (ES Modules), HTML5, CSS3 Custom Properties.
- **Engine**: Pure-function training engine (Epley 1RM formula, greedy plate math, rolling mesocycles).
- **Audio**: Web Audio API oscillator synthesis.
- **Graphics**: Hand-crafted SVG anatomy diagrams, pure SVG sparklines, and HTML5 Canvas share cards.
- **PWA**: Web App Manifest & Service Worker with offline caching.
- **Hosting**: Deployed on **Vercel** with edge caching.
