# BUILD & TESTING GUIDE: IPHONE & IOS

## The Reality of Apple's Platform: An Honest Explanation

Unlike Android (which allows direct installation of `.apk` files via sideloading), Apple strictly restricts iOS app installation:
- A standalone `.ipa` file **cannot** simply be emailed or messaged to iPhone users.
- Building a native `.ipa` file requires a **Mac running macOS**, **Xcode**, and a **paid Apple Developer Account ($99/year)**.
- Official distribution to friends' iPhones requires Apple's **TestFlight** app or App Store review.

---

## The Recommended iPhone Path Today: Progressive Web App (PWA)

SETLY has been engineered to take full advantage of Apple's Safari Web App engine:

### How to Install and Test on iPhone:
1. Open the live URL in **Safari** on the iPhone:
   `https://sathwik328.github.io/setly/`
2. Tap the **Share** button at the bottom of the screen (the box with an arrow pointing up: `↑`).
3. Scroll down the sheet and tap **Add to Home Screen**.
4. Tap **Add** in the top-right corner.
5. The **SETLY** icon will appear on the iPhone's home screen alongside all other native apps.

### What the User Experiences:
- **Zero Safari UI**: Runs standalone in full screen without the browser URL bar or bottom navigation.
- **Offline Capability**: The Service Worker caches assets so the app launches instantly even in airplane mode.
- **Local Persistence**: User workouts, PRs, and preferences remain permanently stored on the device.
- **Web Audio Chimes**: Synthesized timers and audio feedback function seamlessly.

---

## Future Native iOS App Preparation (When You Have a Mac)

The project includes `capacitor.config.json` ready for iOS compilation:

```bash
# On a Mac:
npm install @capacitor/core @capacitor/cli @capacitor/ios
npx cap add ios
npx cap copy ios
npx cap open ios
```

In Xcode:
1. Select your Apple Developer Team in Signing & Capabilities.
2. Connect an iPhone via USB or select Any iOS Device (arm64).
3. Go to **Product** → **Archive**.
4. Distribute to **TestFlight** to invite friends by email to test the app.
