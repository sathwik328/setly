# PUSHPA iOS Deployment Guide

## 1. Web Progressive Web App (Available Now)
iPhone does not allow installing standalone `.apk` or `.ipa` packages directly from a browser without enterprise certificates or TestFlight. However, PUSHPA is fully PWA-optimized:

1. Open **https://setly-zeta.vercel.app/** in Safari on your iPhone.
2. Tap the **Share** button (box with upward arrow at bottom of Safari).
3. Scroll down and tap **Add to Home Screen**.
4. Tap **Add** in the top right.
5. Pushpa will appear on your Home Screen as a native app icon, running in full-screen standalone mode with offline caching enabled.

---

## 2. Message to Send an iPhone Friend
> "Hey! Check out PUSHPA — my adaptive workout planner and progressive overload engine. Open https://setly-zeta.vercel.app/ in Safari, tap Share -> 'Add to Home Screen', and it installs like a native app!"

---

## 3. Native App Store Build via Xcode (For Future Mac + Apple Developer Account)
When you have access to macOS and an Apple Developer Team account:
1. Prerequisites:
   - macOS Sonoma or newer
   - Xcode 15+
   - Active Apple Developer account ($99/year)
2. Add iOS platform:
   ```bash
   npm install @capacitor/ios
   npx cap add ios
   npx cap sync ios
   npx cap open ios
   ```
3. In Xcode:
   - Select the `App` target.
   - Go to **Signing & Capabilities** and choose your Development Team.
   - Set Bundle Identifier to `com.pushpa.app`.
   - Connect your iPhone via USB, select it as destination device, and press **Run** (Cmd + R) to install directly.
   - For App Store distribution, select **Product** > **Archive**, and submit via TestFlight / App Store Connect.
