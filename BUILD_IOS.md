# 🍏 PUSHPA — IPHONE & IOS TESTING & INSTALLATION GUIDE

## 🎯 How iPhone Users Run PUSHPA (Zero Friction PWA)

Apple restricts raw `.ipa` file distribution (requiring a Mac, Xcode, and a $99/yr Apple Developer Account for TestFlight). However, **PUSHPA** is built as an installable standalone Web App that gives iPhone users the exact same experience as an App Store app without needing any downloads or app store approvals!

---

### 📲 Step-by-Step iPhone Installation:

1. Open **Safari** on the iPhone and navigate to:  
   👉 **[https://setly-zeta.vercel.app/](https://setly-zeta.vercel.app/)**
2. Tap the **Share** button at the bottom of the screen (the square with an arrow pointing up: `↑`).
3. Scroll down the actions sheet and tap **Add to Home Screen** (`➕`).
4. You will see the glowing flame icon and name **Pushpa**. Tap **Add** in the top right corner.
5. The **Pushpa** app icon is now placed directly on the home screen!

---

### 🚀 What the User Experiences on iPhone:

- **Full-Screen Standalone Mode**: No Safari search bar, no navigation buttons, no tabs.
- **Dark Fire Theme**: Immersive `#050505` OLED black with glowing flame accents and responsive UI.
- **Instant Web Audio**: Real-time sound chimes and cinematic intro audio powered by Web Audio API.
- **Offline Persistence**: All workout programs, logbook entries, and history are stored securely in local device storage.
- **Haptic & Touch Responsiveness**: Native active press states, bottom sheets, and zero input contrast glitches.

---

## 🛠️ Native iOS Compilation (For Developers with a Mac)

The project includes `capacitor.config.json` configured for iOS:

```bash
# On macOS:
npm install @capacitor/core @capacitor/cli @capacitor/ios
npx cap add ios
npx cap copy ios
npx cap open ios
```

In Xcode:
1. Set the Bundle Identifier to `com.pushpa.app`.
2. Select your Team under Signing & Capabilities.
3. Select your connected iPhone and press **Run** (Cmd + R) or Archive for TestFlight distribution.
