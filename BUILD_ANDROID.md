# PUSHPA Android Build & Install Guide

## 1. Quick Cloud Download (Recommended)
You do not need to install Android Studio or Java on your PC. The GitHub Actions workflow (`.github/workflows/android.yml`) automatically builds the debug APK on push to `main` and on any tag matching `pushpa-*`.

1. Go to the GitHub repository: **https://github.com/sathwik328/setly**
2. Click **Releases** on the right side (or **Actions** > **Build Android APK**).
3. Download `pushpa-debug.apk` directly to your Android phone.
4. On your phone, tap the downloaded `.apk` file:
   - If prompted "Install unknown apps", tap **Settings** and toggle **Allow from this source**.
   - Tap **Install**.
   - Tap **Open**.
5. Pushpa will launch in full-screen native mode, running 100% offline from internal storage with zero browser chrome!

---

## 2. Message to Send an Android Friend
> "Hey! Check out PUSHPA — my new workout planner app. It has an automated progressive overload planner, a Notion-style free logbook, and guided 2D home workouts. Runs completely offline on your phone: https://github.com/sathwik328/setly/releases"

---

## 3. Local Build with Android Studio (Optional)
If you ever want to build or sign the app manually on a computer:
1. Prerequisites:
   - Node.js 18+
   - Android Studio (Electric Eel or newer) with Android SDK 34
2. Open terminal in the project directory:
   ```bash
   npm install
   npx cap sync android
   npx cap open android
   ```
3. In Android Studio:
   - Wait for Gradle sync to complete.
   - Click **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
   - Locate the APK in `android/app/build/outputs/apk/debug/app-debug.apk`.
