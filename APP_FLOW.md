# APP_FLOW.md — CraveCare

**App Description:** A hostel-specialized nutrition and budget app for women that generates appliance-specific recipes (Kettle/Induction) synced to their menstrual cycle and health goals.

---

## 1. Entry Points

* **Direct App Launch:** User opens the Flutter app on their mobile device.
* **Push Notifications:** Reminders for cycle-based meals or "Budget Check-ins."
* **Shared Links:** Deep links from roommates sharing a "Hostel Hack" recipe.

---

## 2. Core User Flows

### A. User Onboarding (The Setup)

* **Happy Path:**
1. User opens app -> Welcome Screen.
2. Clicks "Start Journey" -> Firebase Auth (Phone/Google).
3. Input Profile: Name, State/Region (for taste profile).
4. **The Toolkit:** Selects available appliances (Kettle, Induction, etc.).
5. **Health Profile:** Inputs last period date and health goals (PCOS/Exam Focus).
6. App generates the first personalized Dashboard.


* **Error States:** Invalid phone number (validation error), Network timeout during Firebase sync.
* **Edge Cases:** User has *zero* appliances (System defaults to "No-Cook/Mess Hacks").

### B. Main Feature: The "Hostel Hack" Recipe

* **Happy Path:**
1. Dashboard displays "Luteal Phase: Craving Comfort?" card.
2. User clicks "Generate Recipe."
3. AI queries Gemini based on "Induction + Luteal + PCOS."
4. Recipe displays with 3 steps and a "Budget Hack."
5. User clicks "Cooked It!" -> Earns 1 Cheat Day Token.


* **Error States:** Gemini API quota limit reached (Fallback to hardcoded "Emergency Recipes").
* **Edge Cases:** User changes appliances mid-way (App must re-fetch/filter).

### C. Photo-to-Macro Analysis

* **Happy Path:**
1. User clicks Camera Icon on Home.
2. Snaps photo of mess food -> Clicks "Analyze."
3. System displays "Grade: B" + Macro breakdown (Carbs/Protein).
4. User clicks "Add to Daily Log" -> Progress bar updates.


* **Error States:** Image too blurry (Prompt: "Please retake in better light"), No Internet.

---

## 3. Navigation Map (Hierarchical)

```text
Root (App Entry)
├── Onboarding Flow (One-time)
└── Main Bottom Navigation
    ├── Home (Dashboard)
    │   ├── Cycle Status Card
    │   ├── Recipe Generator (Full Screen)
    │   └── Daily Tip
    ├── Track (Camera & Budget)
    │   ├── Photo Analysis Result
    │   └── Budget Input Form
    └── Profile
        ├── Personal Info (Edit Appliances/Goals)
        └── Token Wallet (Cheat Day progress)

```

---

## 4. Screen Inventory

| Screen | Route | Access | Purpose | Key Elements | Actions |
| --- | --- | --- | --- | --- | --- |
| **Welcome** | `/welcome` | Public | Brand Intro | "Big Sister" Graphic | Navigate to Signup |
| **Onboarding** | `/setup` | Auth | Profile Creation | Tool checklist, Date picker | Save to Firebase -> Home |
| **Dashboard** | `/home` | Auth | Central Hub | Cycle Phase Widget, AI Card | Click Recipe, Snap Photo |
| **Recipe Detail** | `/recipe` | Auth | Cooking Guide | Steps, Budget Tip, Timer | "Cooked It" -> Home |
| **Analysis** | `/analyze` | Auth | Food Tracking | Photo Preview, A-F Grade | Log Food, Retake Photo |
| **Settings** | `/profile` | Auth | Customization | Appliance Toggles | Update Profile, Logout |

---

## 5. Decision Points

| IF... | THEN... |
| --- | --- |
| **User is not logged in?** | Redirect to `/welcome`. |
| **User hasn't set period date?** | Dashboard shows "General Energy" recipes instead of cycle-synced ones. |
| **Appliances list is empty?** | Show "Cold Prep/Mess Hall" hacks exclusively. |
| **Tokens == 5?** | Trigger "Cheat Day Unlocked" animation and celebratory notification. |

---

## 6. Error Handling

* **404 (Content Not Found):** Show "Oops! That recipe went back to Mom's kitchen." Button: "Back to Home."
* **500 (API Failure):** Display: "The Chef is currently busy. Here is a Quick Hack: Boiled Eggs!" (Static fallback).
* **Network Offline:** Show Snackbar: "CraveCare works best online, but you can still view your saved Recipes."
* **Permission Denied (Camera):** Overlay: "We need your camera to grade your food!" Button: "Open Settings."

---

## 7. Responsive Behavior

* **Mobile (Primary):** Vertical stack, bottom navigation bar, thumb-friendly buttons (min 48dp).
* **Tablet/Desktop (Secondary):** Sidebar navigation, grid layout for recipes (2 or 3 columns), larger image previews. *Note: For the hackathon, we focus 100% on Mobile viewports.*
