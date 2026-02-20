# CraveCare Product Requirements Document (PRD)

**Target Users:** Female university students and young professionals living in hostels, PGs, or shared apartments with limited kitchen access.
**Main Problem:** The nutritional "gap" caused by unhealthy mess food, high costs of delivery, and the lack of cooking knowledge for limited appliances.
**Unique Value:** An appliance-first, cycle-syncing nutrition guide that "hacks" hostel limitations to provide healthy, budget-friendly comfort food.

## 1. Problem Statement

Young women in hostels face a "Triple Threat" to their health:

1. **Structural Constraints:** Most hostels only allow a kettle or a single induction plate, making traditional healthy recipes impossible.
2. **Biological Neglect:** Standard food apps don't account for hormonal phases (PCOS/Menstrual cycles) which dictate energy levels and cravings.
3. **Financial Friction:** The "convenience tax" of ordering healthy salads via delivery apps leads to monthly food budgets being exhausted within the first 15 days.

## 2. User Personas

### Persona A: The First-Year Fresher (Anjali)

* **Pain Points:** Missing "Mom's food," doesn't know how to cook, gets severe period cramps, only has a kettle.
* **Goal:** Find a way to make a warm, comforting meal that feels like home without burning her room down.

### Persona B: The Busy Med-Student (Sneha)

* **Pain Points:** No time to eat, manages PCOS, stays up late for exams, budget is tight.
* **Goal:** Quick, high-protein snacks that prevent insulin spikes and keep her focused during 2:00 AM study sessions.

## 3. SMART Success Metrics

* **S:** Achieve **100% successful generation** of recipes based on specific appliance constraints during the hackathon demo.
* **M:** Calculate and display **macro-nutrient estimates** for at least 5 common hostel ingredients (Oats, Eggs, Maggi, Milk, Poha).
* **A:** User can complete the onboarding and receive their first recipe in **under 90 seconds**.
* **R:** 100% of suggested recipes must cost **under ₹60** per serving.
* **T:** App must be fully functional and deployed for testing within the **12-hour hackathon window**.

## 4. Feature Tiering

| Tier | Feature Name | Description |
| --- | --- | --- |
| **P0** | **Appliance-First Onboarding** | Capturing user tools (Kettle/Induction) and health profile. |
| **P0** | **AI Recipe Engine (Gemini)** | Generating recipes based on appliances + cycle phase. |
| **P0** | **Cycle-Syncing Logic** | Basic phase calculation (Menstrual, Follicular, etc.). |
| **P1** | **Budget Tracker** | Logging daily spends and calculating "Cheat Day" tokens. |
| **P1** | **Photo-to-Grade** | AI analysis of a food photo to give a nutrition grade (A-F). |
| **P2** | **Auto-Grocery List** | Extracting ingredients from recipes into a checklist. |
| **P2** | **Community "Swap"** | (Stretch) Sharing extra ingredients with other girls in the hostel. |

## 5. P0 Feature Deep-Dive

### Feature: Appliance-First Onboarding

* **User Story:** As a new user, I want to input my limited tools so that I don't get recipes requiring an oven or microwave.
* **Acceptance Criteria:**
1. User can multi-select from a list: Kettle, Induction, Sandwich Maker, Fridge.
2. App must save these preferences to a local state or Firebase.
3. UI must prevent proceeding if no appliance or "No Appliances" is selected.



### Feature: AI Recipe Engine

* **User Story:** As a hostel resident, I want a recipe for my current health need using only my kettle.
* **Acceptance Criteria:**
1. Prompt must include the user's selected appliance as a hard constraint.
2. Recipe must be returned in 3-5 clear steps.
3. AI must suggest 1 "Budget Hack" per recipe (e.g., using milk powder instead of fresh milk).

## 6. Explicitly Out of Scope

1. **Direct E-commerce:** No in-app purchasing of groceries or appliances.
2. **Professional Medical Advice:** No prescriptions or medical diagnoses for PCOS/disorders.
3. **Complex Meal Prep:** No recipes requiring >20 mins of active cooking.
4. **Multi-device Sync:** App will be localized to a single mobile device for the MVP.
5. **Livestreaming:** No live cooking classes or video hosting.


## 7. User Scenarios

### Scenario 1: The "Cramp Relief" Flow

1. **User Action:** Opens app, selects "Menstrual Phase" on the dashboard.
2. **System Action:** Queries Gemini for "Kettle + Period Cramps + Comfort Food."
3. **Edge Case:** User has no ingredients.
4. **Outcome:** App suggests "Dark Chocolate Oats" and highlights Magnesium as the key benefit.

### Scenario 2: The "End of Month" Budget Hack

1. **User Action:** Inputs ₹50 as the current budget for dinner.
2. **System Action:** Filters recipes to "Ultra-Low Cost" (e.g., Savory Poha).
3. **Edge Case:** User enters ₹0.
4. **Outcome:** App suggests using "Hostel Mess Basics" (like bread or hot water) to create a meal.

### Scenario 3: Photo Grading

1. **User Action:** Uploads photo of a plate of oily Mess Biryani.
2. **System Action:** Gemini Vision identifies high oil/low protein.
3. **Edge Case:** Image is blurry or not food.
4. **Outcome:** App returns "Grade D" and suggests: "Add a bowl of curd to balance the glycemic index."

## 8. Non-Functional Requirements

* **Performance:** AI recipe generation must return a response in **< 5 seconds**.
* **Security:** User health data (period dates) must be stored securely (Firebase Auth/Firestore rules).
* **Accessibility:** Use high-contrast text and a minimum touch-target size of **44x44 pixels** for tired/stressed users.
* **Reliability:** The app must work offline for the Budget Tracker (local storage).
