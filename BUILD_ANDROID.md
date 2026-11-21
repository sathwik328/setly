# 📱 PUSHPA — ANDROID (APK) BUILD & DISTRIBUTION GUIDE

This guide details how to build and install the standalone Android APK for **PUSHPA** (`com.pushpa.app`) to share with friends.

---

## ⚡ Method 1: Instant Cloud APK via PWABuilder (Zero Setup — 60 Seconds)

Because PUSHPA has a complete PWA Manifest, custom layered fire flame launcher icons, and offline Service Worker:

1. Visit **[PWABuilder](https://www.pwabuilder.com)** in any browser.
2. Enter your live Vercel URL:  
   `https://setly-zeta.vercel.app/`
3. Click **Start**. PWABuilder verifies the manifest, fire theme `#050505`, icons, and service worker (100% PWA score).
4. Click **Package For Stores** → Select **Android**.
5. Set Package ID to `com.pushpa.app` and App Name to `Pushpa`.
6. Click **Generate** and download your package zip.
7. Inside the downloaded zip you have `app-debug.apk` and signed APKs ready to install!
8. Send this `.apk` directly to friends via WhatsApp, Telegram, or Google Drive.

---

## ☁️ Method 2: GitHub Actions Cloud Build

A complete CI/CD workflow is configured in `.github/workflows/android.yml`:
- Runs Ubuntu runner with Node 20 and JDK 17.
- Automatically copies web assets into the Capacitor Android container.
- Builds `app-debug.apk` via Gradle.
- Publishes the compiled `.apk` as a downloadable artifact under the GitHub repository **Actions** tab (`pushpa-debug-apk`).

*(Note: If your personal GitHub token has the `workflow` scope enabled, each push to `main` automatically compiles this artifact in the cloud).*

---

## 💻 Method 3: Local Compilation with Capacitor & Android Studio

If you wish to compile locally:

### Prerequisites:
- Node.js (already installed)
- Java Development Kit (JDK 17 or 21)
- Android Studio or Android SDK Command-line tools

### Step-by-Step Commands:
```powershell
# In D:\Workout Planner:
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap add android
npx cap copy android
npx cap open android
```

In Android Studio:
1. Allow Gradle sync to complete.
2. Click **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**.
3. Once completed, click **locate** to retrieve `app-debug.apk`.

---

## 📲 How Your Friends Install the APK on Android:

1. Send your friend the `Pushpa.apk` (or `app-debug.apk`).
2. When they tap the file in WhatsApp or their file manager, Android prompts:
   > *"For your security, your phone is not allowed to install unknown apps from this source."*
3. They tap **Settings** → toggle **Allow from this source**.
4. Tap **Install**.
5. The **Pushpa** flame icon appears on their home screen!
6. It runs full-screen, completely offline, with local-first workout tracking and no login barrier.
