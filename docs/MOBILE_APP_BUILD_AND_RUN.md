# PiLearn Mobile App — Build & Run Guide

This document is a single reference for how to run and build the mobile app in different scenarios. All commands assume you are in the project root unless otherwise noted.

---

## Quick reference

| Goal | What to use | Command / artifact |
|------|-------------|---------------------|
| Run on **emulator** (local) | Metro + debug app | `npx expo start` → press `a` |
| Run on **your phone** (USB, dev) | Metro + adb reverse | `adb reverse tcp:8081 tcp:8081` then open app |
| Share with **friends** (no Metro) | Release APK | `cd mobile-app/android && ./gradlew assembleRelease` → share `app-release.apk` |
| Submit to **Play Store** | Release AAB | `cd mobile-app/android && ./gradlew bundleRelease` → upload `app-release.aab` |

---

## 1. Run on local machine (Android emulator)

Use this when developing on your computer with an emulator.

### Prerequisites

- Android Studio with an AVD (Android Virtual Device) created
- Node.js and dependencies installed (`npm install` in `mobile-app/`)

### Steps

1. **Start Metro** (from `mobile-app/`):

   ```bash
   cd mobile-app
   npx expo start
   ```

2. **Start the emulator** (if not already running):

   - Open Android Studio → Device Manager → run an AVD, or
   - From terminal: `emulator -avd <your_avd_name>`

3. **Launch the app on the emulator**:

   - In the Expo terminal, press **`a`** to open the app on the Android emulator, or
   - Run from another terminal:  
     `cd mobile-app && npx expo run:android`

The app will connect to Metro on `localhost:8081` and load the JS bundle.

---

## 2. Run on your personal phone (connected to your computer)

Use this when testing on a physical device while your computer is running Metro.

### Prerequisites

- Phone connected via USB
- USB debugging enabled on the phone
- Same as above: Metro and app dependencies

### Steps

1. **Start Metro** (from `mobile-app/`):

   ```bash
   cd mobile-app
   npx expo start
   ```

2. **Forward port 8081** so the phone can reach Metro on your computer:

   ```bash
   adb reverse tcp:8081 tcp:8081
   ```

3. **Install and open the app** on the phone:

   - Either press **`a`** in the Expo terminal (if the device is detected), or
   - Install the debug APK and open it:
     ```bash
     adb install mobile-app/android/app/build/outputs/apk/debug/app-debug.apk
     ```
   - Open the app on the phone; it will load the bundle from your computer.

**If you see "Unable to load script"** → Metro is not running, or `adb reverse tcp:8081 tcp:8081` was not run (for physical device).

---

## 3. Share with friends (standalone APK, no Metro)

Use this when you want to send a single file that runs on any Android device without your computer or Metro.

### What you get

- **Release APK**: JavaScript is bundled inside the app. No server, no `npx expo start`. Your friends just install and open.

### Build command

From project root:

```bash
cd mobile-app/android
./gradlew assembleRelease
```

### Where is the APK?

```
mobile-app/android/app/build/outputs/apk/release/app-release.apk
```

### How to share

- Upload to Google Drive / Dropbox and share the link, or send via email/chat (file is ~90–100 MB).
- Testers: download → open APK → allow "Install from unknown sources" if prompted → install and open.

### Rebuilding after code changes

Run the same command again; replace the old APK with the new one before sharing.

```bash
cd mobile-app/android
./gradlew assembleRelease
```

---

## 4. Play Store build (AAB for upload)

Use this when you are ready to upload to Google Play Console. Play Store expects an **Android App Bundle (AAB)**, not an APK.

### Build command

From project root:

```bash
cd mobile-app/android
./gradlew bundleRelease
```

### Where is the AAB?

```
mobile-app/android/app/build/outputs/bundle/release/app-release.aab
```

### What to do with it

1. Open [Google Play Console](https://play.google.com/console).
2. Select your app (or create one).
3. Go to **Release** → **Production** (or **Testing**).
4. **Create new release** → upload **`app-release.aab`**.
5. Set version and release notes, then submit for review.

### Version and version code

- Update **version name** (e.g. `1.0.1`) in `mobile-app/app.json` under `expo.version`.
- Update **version code** (integer) in `mobile-app/android/app/build.gradle` under `defaultConfig.versionCode`. Each Play Store upload must have a higher version code than the previous one.

---

## 5. Command cheat sheet

All from **project root** unless noted.

| Task | Command |
|------|---------|
| Start Metro (dev server) | `cd mobile-app && npx expo start` |
| Forward port for physical device | `adb reverse tcp:8081 tcp:8081` |
| Build **release APK** (for friends) | `cd mobile-app/android && ./gradlew assembleRelease` |
| Build **release AAB** (for Play Store) | `cd mobile-app/android && ./gradlew bundleRelease` |
| Install debug APK on connected device | `adb install mobile-app/android/app/build/outputs/apk/debug/app-debug.apk` |

### Output locations

| Build type | Path |
|------------|------|
| Debug APK | `mobile-app/android/app/build/outputs/apk/debug/app-debug.apk` |
| Release APK | `mobile-app/android/app/build/outputs/apk/release/app-release.apk` |
| Release AAB | `mobile-app/android/app/build/outputs/bundle/release/app-release.aab` |

---

## 6. Troubleshooting

| Issue | Fix |
|-------|-----|
| "Unable to load script" on device/emulator | Start Metro (`npx expo start` in `mobile-app/`). On physical device, also run `adb reverse tcp:8081 tcp:8081`. |
| Friends get "server error" or app won’t load | Give them the **release APK** from `assembleRelease`, not the debug APK. |
| Build fails (e.g. Gradle/Metro) | In `mobile-app/`: `npm install`, then `cd android && ./gradlew clean` and run the build again. |
| Play Store asks for AAB | Use the **AAB** from `bundleRelease`, not the APK. Upload `app-release.aab`. |

---

## 7. Clearing cache

Running Metro and Gradle builds creates cache. Use these when things act up or you want a clean slate.

### Metro bundler cache

From `mobile-app/`:

```bash
cd mobile-app
npx expo start --clear
```

Or clear Metro cache without starting (e.g. before a build):

```bash
cd mobile-app
rm -rf node_modules/.cache
```

### Gradle / Android build cache (manual — recommended)

`./gradlew clean` can fail in this project because it runs native/CMake clean tasks that expect codegen directories inside `node_modules` that only exist after a full build. Use manual deletion instead:

From project root:

```bash
cd mobile-app/android
rm -rf app/build app/.cxx build
cd ../..
```

- `app/build` — APK/AAB and app build outputs  
- `app/.cxx` — native (CMake) build cache  
- `build` — root Android build cache  

Next `assembleRelease` or `bundleRelease` will do a full rebuild.

### Full clean (Metro + Android, no Gradle clean)

Use this when you want to clear everything and avoid `./gradlew clean` (which can fail with CMake/codegen errors):

```bash
# 1. Clear Metro / JS cache
cd mobile-app
rm -rf node_modules/.cache

# 2. Remove Android build folders (no gradlew clean)
cd android
rm -rf app/build app/.cxx build
cd ../..
```

Then run your build again from `mobile-app/android/`:

```bash
cd mobile-app/android
./gradlew assembleRelease
# or
./gradlew bundleRelease
```

---

*Last updated for PiLearn mobile app (Expo / React Native).*
