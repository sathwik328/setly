# BUILD & PACKAGING GUIDE: ANDROID (APK)

This guide provides two verified methods to get a standalone Android APK for SETLY to send directly to friends.

---

## Method 1: The Fastest Zero-Install Route (PWABuilder — 2 Minutes)

Because SETLY is built with a valid Web Manifest, Service Worker, and icons, you can generate a signed/debug Android APK without installing 10+ GB of Android Studio or modifying your brother's laptop environment:

1. Deploy SETLY to GitHub Pages (or Netlify/Vercel) so you have your live HTTPS URL:
   `https://sathwik328.github.io/setly/`
2. Open [https://www.pwabuilder.com](https://www.pwabuilder.com) in your browser.
3. Paste your URL and click **Start**.
4. PWABuilder tests the PWA score (Manifest, Service Worker, Security) — SETLY achieves a perfect score.
5. Click **Package For Stores** → Select **Android**.
6. Click **Generate** / **Download Package**.
7. Inside the downloaded ZIP, you will find:
   - `app-release-signed.apk` (or debug APK)
8. Send this `.apk` file directly via WhatsApp, Telegram, or Google Drive to your friends!

---

## Method 2: Local Compilation with Capacitor

If you want to compile the native Android Studio project locally:

### Prerequisites:
1. **Node.js** (already available on this machine).
2. **Java Development Kit (JDK 17 or 21)**.
3. **Android Studio** (or Android SDK Command-line tools).

### Step-by-Step Commands:
Open a terminal in `D:\Workout Planner`:

```powershell
# 1. Initialize npm package if needed
npm init -y

# 2. Install Capacitor Core and CLI locally (inside D:\Workout Planner)
npm install @capacitor/core @capacitor/cli @capacitor/android

# 3. Add Android native platform
npx cap add android

# 4. Sync web assets from the prototype folder
npx cap copy android

# 5. Open in Android Studio or build via Gradle
npx cap open android
```

### In Android Studio:
1. Wait for Gradle sync to complete.
2. Go to **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**.
3. When the build finishes, click **locate** to find `app-debug.apk`.

---

## How Your Friends Install the APK on Android:
1. Send them the `.apk` file.
2. When they tap to open it, Android may show: *"For your security, your phone is not allowed to install unknown apps from this source."*
3. They tap **Settings** → toggle **Allow from this source** → tap **Install**.
4. The SETLY app icon will appear directly on their home screen!
