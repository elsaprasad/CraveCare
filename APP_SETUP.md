# Mobile App Setup Guide

Your CraveCare app is now configured for both **PWA (Progressive Web App)** and **Native Mobile Apps** using Capacitor.

## 🚀 Quick Start

### 1. Build the App
```bash
npm run build
```

### 2. Test as PWA (Progressive Web App)
1. Build the app: `npm run build`
2. Preview: `npm run preview`
3. Open in browser (Chrome/Safari on mobile)
4. Look for "Add to Home Screen" option
5. Install and use like a native app!

**PWA Features:**
- ✅ Works offline
- ✅ Installable on phones
- ✅ Fast loading
- ✅ No app store needed

---

## 📱 Native App Setup (iOS & Android)

### Prerequisites

**For Android:**
- Install [Android Studio](https://developer.android.com/studio)
- Install Android SDK
- Enable USB debugging on your device

**For iOS (Mac only):**
- Install [Xcode](https://developer.apple.com/xcode/)
- Install Xcode Command Line Tools: `xcode-select --install`
- Sign up for Apple Developer account (free for testing, $99/year for App Store)

### Step 1: Add Platform

**For Android:**
```bash
npm run cap:add:android
```

**For iOS:**
```bash
npm run cap:add:ios
```

### Step 2: Build and Sync

After making changes to your web app:
```bash
npm run cap:build
```

This will:
1. Build your React app
2. Copy files to native projects
3. Sync Capacitor plugins

### Step 3: Open in Native IDE

**Android:**
```bash
npm run cap:open:android
```
Then click "Run" in Android Studio

**iOS:**
```bash
npm run cap:open:ios
```
Then click "Run" in Xcode

---

## 🎨 App Icons

**Important:** Replace the placeholder icon files with your actual app icons:

1. **PWA Icons** (in `public/` folder):
   - `pwa-192x192.png` - 192x192 pixels
   - `pwa-512x512.png` - 512x512 pixels

2. **Native App Icons** (will be added when you add platforms):
   - Android: `android/app/src/main/res/` (various sizes)
   - iOS: `ios/App/App/Assets.xcassets/AppIcon.appiconset/`

You can use tools like:
- [App Icon Generator](https://www.appicon.co/)
- [Figma](https://www.figma.com/)
- [Canva](https://www.canva.com/)

---

## 📦 Publishing to App Stores

### Android (Google Play Store)

1. **Build Release APK/AAB:**
   ```bash
   npm run cap:open:android
   ```
   - In Android Studio: Build → Generate Signed Bundle/APK
   - Choose "Android App Bundle" (recommended)

2. **Create Google Play Console Account:**
   - Go to [Google Play Console](https://play.google.com/console)
   - Pay $25 one-time fee
   - Create new app
   - Upload AAB file
   - Fill in store listing, screenshots, etc.

### iOS (App Store)

1. **Build for App Store:**
   ```bash
   npm run cap:open:ios
   ```
   - In Xcode: Product → Archive
   - Upload to App Store Connect

2. **App Store Connect:**
   - Go to [App Store Connect](https://appstoreconnect.apple.com/)
   - Create new app ($99/year developer account required)
   - Upload build
   - Submit for review

---

## 🔧 Development Workflow

### During Development:

1. **Make changes** to your React code
2. **Build:** `npm run build`
3. **Sync:** `npm run cap:sync`
4. **Test:** Open in native IDE and run

### Quick Commands:

```bash
# Development server (web)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Sync Capacitor (after build)
npm run cap:sync

# Open native project
npm run cap:open:android  # or cap:open:ios
```

---

## 🌐 PWA Testing

### Desktop (Chrome):
1. Build: `npm run build`
2. Preview: `npm run preview`
3. Open DevTools → Application → Service Workers
4. Check "Offline" to test offline mode
5. Click "Add to Home Screen" in browser menu

### Mobile:
1. Deploy to a server (or use ngrok/local tunnel)
2. Open on mobile browser
3. Look for "Add to Home Screen" prompt
4. Install and test offline functionality

---

## 📝 Notes

- **PWA** works immediately after build - no additional setup needed
- **Native apps** require platform-specific tools (Android Studio/Xcode)
- Icons are placeholders - replace with your brand icons
- Test on real devices for best results
- PWA is great for quick deployment, native apps for app store distribution

---

## 🐛 Troubleshooting

**PWA not installing?**
- Make sure you're using HTTPS (or localhost)
- Check browser console for errors
- Verify manifest.json is being generated

**Capacitor sync issues?**
- Make sure you've run `npm run build` first
- Delete `node_modules` and reinstall if needed
- Check `capacitor.config.ts` settings

**Build errors?**
- Clear cache: `rm -rf dist node_modules/.vite`
- Reinstall: `npm install`
- Check for TypeScript errors: `npm run lint`

---

## 📚 Resources

- [Capacitor Docs](https://capacitorjs.com/docs)
- [PWA Guide](https://web.dev/progressive-web-apps/)
- [Vite PWA Plugin](https://vite-pwa-org.netlify.app/)
- [Android Studio Setup](https://developer.android.com/studio/intro)
- [Xcode Setup](https://developer.apple.com/xcode/)

---

**Need help?** Check the Capacitor and PWA documentation links above!
