# SETLY — Smart Workout Planner & Progressive Overload Engine

> **Lift. Log. Level up.**  
> SETLY tells you exactly what to lift today (exercises, sets, reps, weight), learns from how each set felt, and shows clear reports so you always know if you're getting stronger.

---

## ⚡ Highlights & Key Features

- **Program Length Selector**: Choose from 30 days (Quick start), 60 days (Solid block), 90 days (Transformation), 180 days, 360 days, or a custom duration (14–365 days).
- **Full-Length Day Map**: Day 1 to Day N visual roadmap with a 5-column grid. Completed days show electric lime checkmarks; current day pulses; future days lock until unlocked in sequence.
- **Anatomical Body Map**: Male and Female clean SVG anatomy outlines with heat-map shading based on weekly volume sets, muscle detail cards, and a "+ Prioritize Volume" toggle.
- **One-Tap Logging**: Check off sets with a single tap, record inline effort (*Easy / Good / Hard*), and adjust weights/reps with steppers.
- **Synthesized Web Audio FX**: Zero external audio files — synthesized chimes for taps, sheet opens, set completions (3-note chime), and locked day alerts. Includes an instant speaker mute toggle.
- **Floating Rest Timer**: Automatic non-drifting countdown with background timestamp math, circular SVG progress, and completion sound.
- **Integrated Gym Tools**: Visual Barbell Plate Calculator (Olympic bar + colored plates), Dynamic 4-step Warmup Ladder, and Safe Movement Pattern Swaps.
- **Local-First Privacy**: 100% offline-ready PWA with Web Crypto SHA-256 account security, JSON state backup, and CSV workout logs export.
- **Canvas Share Card Generator**: Generates high-res dark-themed post-workout celebration cards for instant saving/sharing.

---

## 📁 Repository & Folder Structure

```text
D:\Workout Planner/
├── .github/
│   └── workflows/
│       └── pages.yml        # Automatic GitHub Pages CI/CD deployment
├── prototype/               # Main application source (Local-first PWA)
│   ├── index.html           # Single-Page Application markup & modals
│   ├── styles.css           # "Gym at Night" design system & animations
│   ├── app.js               # Reactive UI controller, audio FX & routing
│   ├── engine.js            # Pure-function mathematical training engine
│   ├── storage.js           # LocalStorage repository & crypto hashing
│   ├── server.js            # Lightweight Node.js preview server
│   ├── manifest.json        # PWA Web App Manifest
│   └── sw.js                # Offline Service Worker cache
├── capacitor.config.json    # Capacitor configuration for Android/iOS
├── BUILD_ANDROID.md         # Step-by-step Android APK compilation guide
├── BUILD_IOS.md             # iOS Xcode / TestFlight deployment guide
├── DEPLOY.md                # GitHub Pages & hosting instructions
├── README.md                # Project documentation
└── .gitignore               # Ignored build artifacts & temp files
```

---

## 🚀 Running Locally

1. **Option A: With the included Node.js server**:
   ```bash
   cd prototype
   node server.js
   ```
   Open your browser to: **`http://localhost:8080`**

2. **Option B: Direct file opening**:
   Open `prototype/index.html` directly in any modern browser (Chrome, Safari, Edge, Firefox).

---

## 🌐 Deploying to GitHub Pages

This repository includes a GitHub Actions workflow (`.github/workflows/pages.yml`) that automatically deploys the latest version to GitHub Pages on every push to `main`.

### One-Time Setup in GitHub:
1. Go to your repository on GitHub: `https://github.com/sathwik328/setly`
2. Navigate to **Settings** → **Pages**.
3. Under **Build and deployment** → **Source**, select **GitHub Actions**.
4. Push to `main` — your live app will be published at:
   👉 **`https://sathwik328.github.io/setly/`**

---

## 📱 Mobile Installation (Android & iPhone)

- **Android (Chrome)**: Open the URL, tap the in-app **"Install App"** button (or Chrome menu `⋮` → *Add to Home screen*).
- **iPhone (Safari)**: Open the URL in Safari, tap the **Share** button (`⎙` / `↑`), then tap **Add to Home Screen**.

---

## 📄 License
MIT License. Created with precision for strength and hypertrophy athletes.
