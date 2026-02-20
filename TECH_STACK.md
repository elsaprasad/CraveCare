# TECH_STACK.md — CraveCare

**App Details:**

* **Type:** Cross-Platform Mobile App (Android/iOS)
* **Scale:** MVP (Hackathon Project)
* **Team Size:** 2 Developers
* **MVP Date:** 12-Hour Deadline

## 1. Frontend Stack

| Category | Technology | Version | Documentation | License | Reason |
| --- | --- | --- | --- | --- | --- |
| **Framework** | Flutter | 3.19.0 | [Link](https://docs.flutter.dev/) | BSD-3 | Fastest UI development with Hot Reload. |
| **Language** | Dart | 3.3.0 | [Link](https://dart.dev/guides) | BSD-3 | Type-safe, optimized for UI. |
| **State Mgmt** | Provider | 6.1.2 | [Link](https://pub.dev/packages/provider) | MIT | Lightweight and beginner-friendly. |
| **HTTP Client** | Dio | 5.4.1 | [Link](https://pub.dev/packages/dio) | MIT | Powerful features like interceptors for API logs. |
| **Routing** | GoRouter | 13.2.0 | [Link](https://pub.dev/packages/go_router) | BSD-3 | Declarative routing; handles deep links well. |
| **UI Icons** | Lucide Icons | 0.360.0 | [Link](https://lucide.dev/) | ISC | Clean, consistent "Big Sister" aesthetic. |

**Alternatives Considered:**

* **React Native:** Rejected due to the 12-hour limit; Flutter’s built-in widgets save time on styling compared to CSS-in-JS.

## 2. Backend Stack (Serverless)

| Category | Technology | Version | Documentation | License | Reason |
| --- | --- | --- | --- | --- | --- |
| **Runtime/Auth** | Firebase Auth | 4.17.8 | [Link](https://firebase.google.com/docs/auth) | Proprietary | Instant Google/Phone login setup. |
| **Database** | Cloud Firestore | 4.15.8 | [Link](https://firebase.google.com/docs/firestore) | Proprietary | No-SQL, real-time sync, no server management. |
| **AI Engine** | Gemini Pro API | 0.4.0 | [Link](https://ai.google.dev/) | Proprietary | Multimodal (Text/Image) and free tier for MVP. |
| **Storage** | Firebase Storage | 11.6.9 | [Link](https://firebase.google.com/docs/storage) | Proprietary | Easy image uploads for food tracking. |

**Alternatives Considered:**

* **Node.js/MongoDB:** Rejected. Setting up a VPS and ORM takes 3+ hours; Firebase takes 10 minutes.

## 3. DevOps & Hosting

* **Version Control:** Git (Branching: `main` for stable, `dev` for active work).
* **CI/CD:** GitHub Actions (Auto-build APK on push to `main`).
* **Hosting:** Firebase Hosting (for the Web-demo version) and Firebase App Distribution.
* **Monitoring:** Firebase Crashlytics (v3.4.9) for real-time bug tracking during the demo.


## 4. Development Tools

* **IDE:** VS Code (Version 1.87.0).
* **Extensions:** Flutter (v3.82.0), Dart (v3.82.0), Error Lens (v3.16.0).
* **Linter:** `flutter_lints` (v3.0.1).
* **Formatter:** Built-in Dart Formatter.


## 5. Environment Variables

| Variable | Description |
| --- | --- |
| `GEMINI_API_KEY` | Secret key for Google AI Studio to generate recipes. |
| `FIREBASE_PROJECT_ID` | Identifier for the CraveCare Firebase project. |
| `MAPS_API_KEY` | (Optional) For finding local grocery stores. |

## 6. Scripts (pubspec.yaml/Makefile)

```bash
# Development
flutter run # Start app on connected device
flutter clean && flutter pub get # Reset dependencies

# Build
flutter build apk --split-per-abi # Generate production Android build
flutter build web # Generate web version for judges

```

## 7. Exact Dependency Versions (`pubspec.yaml` snippet)

```json
{
  "dependencies": {
    "flutter": "sdk: flutter",
    "firebase_core": "2.27.0",
    "firebase_auth": "4.17.8",
    "cloud_firestore": "4.15.8",
    "google_generative_ai": "0.2.2",
    "provider": "6.1.2",
    "dio": "5.4.1",
    "image_picker": "1.0.7",
    "intl": "0.19.0"
  }
}

```

## 8. Security Considerations

* **Authentication:** Firebase JWT-based tokens. Only the UID owner can read/write their own health data (Firestore Rules).
* **API Safety:** Gemini API Key will be stored in a `.env` file and accessed via `flutter_dotenv` (v5.1.0) to prevent GitHub exposure.
* **Privacy:** Cycle data is never shared; it remains a private field in the user document.

## 9. Version Upgrade Policy

* **During Hackathon:** **NO UPDATES.** Use the pinned versions above. Upgrading a package mid-sprint can break the build.
* **Post-MVP:** Check for `flutter pub outdated` every major release cycle (Monthly).
