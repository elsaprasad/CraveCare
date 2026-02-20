# IMPLEMENTATION_PLAN.md — CraveCare

**Tech Stack:** Flutter 3.19, Firebase (Auth/Firestore), Gemini Pro API.
**MVP Features:** Appliance-First Onboarding, AI Recipe Engine, Cycle-Syncing Logic.
**Timeline:** 12-Hour Hackathon Sprint.

---

## Phase 1: Project Setup & Foundation

**Duration:** 1 Hour | **Goal:** Initialize development environment and cloud infrastructure.

1. **Initialize Flutter Project:**
```bash
flutter create crave_care --org com.team.cravecare --platforms android,ios
cd crave_care

```


2. **Add Core Dependencies:**
```bash
flutter pub add firebase_core firebase_auth cloud_firestore google_generative_ai provider dio go_router

```


3. **Firebase CLI Setup:**
```bash
export PATH="$PATH":"$HOME/.pub-cache/bin"
flutterfire configure # Connect to Firebase Project defined in TECH_STACK.md

```


4. **Environment Config:** Create `lib/core/secrets.dart` (Add to `.gitignore`).
```dart
class Secrets {
  static const String geminiApiKey = "YOUR_API_KEY_HERE";
}

```



**Success Criteria:**

* [ ] `flutter run` launches the default counter app.
* [ ] Firebase console shows the app connected.
* [ ] `google_generative_ai` package is imported without errors.

---

## Phase 2: Design System (Frontend Foundation)

**Duration:** 1.5 Hours | **Goal:** Implement tokens from `FRONTEND_GUIDELINES.md`.

1. **Define Theme Data:** Create `lib/core/theme.dart`.
```dart
final ThemeData craveCareTheme = ThemeData(
  primaryColor: Color(0xFFFF7F50), // Coral 500
  scaffoldBackgroundColor: Color(0xFAF9F6), // Neutral 50
  textTheme: TextTheme(displayLarge: TextStyle(fontSize: 36, fontWeight: FontWeight.bold)),
  // Add Border Radius and Button Themes here
);

```


2. **Build Atomic Components:** Create `lib/widgets/cc_button.dart` and `lib/widgets/cc_input.dart`.
3. **Setup Navigation:** Implement `GoRouter` in `lib/core/router.dart` as per `APP_FLOW.md`.

**Success Criteria:**

* [ ] Theme colors are correctly reflected in a test screen.
* [ ] Navigation works between two dummy screens.

---

## Phase 3: Authentication & Onboarding

**Duration:** 1.5 Hours | **Goal:** User registration and profile creation.

1. **Firebase Auth Integration:** Create `lib/services/auth_service.dart`.
2. **Build Onboarding Screen:** Follow Step-by-Step flow from `APP_FLOW.md`.
* Implement `PageView` for appliance selection (P0).


3. **Firestore Profile Sync:**
```dart
// Task: Save onboarding data to users collection
await FirebaseFirestore.instance.collection('users').doc(user.uid).set({
  'appliances': selectedTools,
  'last_period': periodDate,
  'created_at': FieldValue.serverTimestamp(),
});

```



**Success Criteria:**

* [ ] User can sign up with email/password.
* [ ] Data appears in Firestore `users` collection in snake_case.

---

## Phase 4: Core Features (AI Recipe Engine)

**Duration:** 4 Hours | **Goal:** Generate appliance-specific recipes using Gemini.

1. **Gemini Service Implementation:** Create `lib/services/ai_service.dart`.
```dart
final model = GenerativeModel(model: 'gemini-pro', apiKey: Secrets.geminiApiKey);
// Prompt Logic: Use PRD P0 Feature constraints
final prompt = "Role: Hostel Big Sister. Tools: $appliances. Goal: $healthGoal. Suggest a recipe.";

```


2. **Recipe Dashboard UI:** Create `lib/screens/home_screen.dart` with "Current Phase" widget.
3. **Integration:** Connect AI response to the `RecipeDetail` screen.

**Success Criteria:**

* [ ] Recipe generator respects "Kettle" vs "Induction" toggles.
* [ ] AI output is formatted correctly in the UI.

---

## Phase 5: Testing & Refinement

**Duration:** 2 Hours | **Goal:** Ensure stability and data accuracy.

1. **Unit Tests:** Test cycle-phase calculation logic.
```bash
flutter test test/cycle_logic_test.dart

```


2. **Manual E2E Test:** - [ ] Scenario 1: Fresh user -> Onboarding -> Kettle Recipe.
* [ ] Scenario 2: Existing user -> Change appliance -> New Recipe.


3. **UI Polish:** Ensure all touch targets are >44px per `FRONTEND_GUIDELINES.md`.

**Success Criteria:**

* [ ] All critical flows in `APP_FLOW.md` work without crashing.
* [ ] No API keys are leaked in public code.

---

## Phase 6: Deployment & Pitch Prep

**Duration:** 2 Hours | **Goal:** Final build and documentation.

1. **Build APK:**
```bash
flutter build apk --release --split-per-abi

```


2. **Pitch Deck:** Focus on **40% Innovation** (Cycle-syncing + Appliance hacks).
3. **Documentation:** Update README.md with the `PRD.md` summary.

**Success Criteria:**

* [ ] APK successfully installed on a physical test device.
* [ ] 3-minute demo video recorded (Fallback).

---

## Milestones & Risks

| Milestone | Deliverable | Target (Hour) |
| --- | --- | --- |
| **Foundation** | Firebase + Flutter Init | Hour 1 |
| **Logic** | AI Recipe Service Working | Hour 6 |
| **The "Wow"** | Cycle-Synced Dashboard | Hour 8 |
| **Submission** | Final APK + Documentation | Hour 12 |

### Risk Management

| Risk | Severity | Mitigation |
| --- | --- | --- |
| **Gemini API Latency** | High | Implement a "The Chef is Thinking" loading animation. |
| **Firebase Auth Latency** | Medium | Use anonymous sign-in for the judge's demo. |
| **Scope Creep** | Critical | P1 features (Budgeting) are strictly moved to Post-MVP. |

---

## MVP Success Criteria

1. Successful profile creation with appliance/cycle data.
2. Recipe generation that changes based on appliance selection.
3. Functional "Cycle-Phase" display on the home screen.

## Post-MVP Roadmap (P1/P2)

1. **Photo-to-Macro:** Use Gemini Vision to grade mess food.
2. **Budget Tracker:** Gamified "Cheat Day" token system.
3. **Grocery List:** Auto-extraction of ingredients.
