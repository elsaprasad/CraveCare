# BACKEND_STRUCTURE.md — CraveCare

**Main Features:** Appliance-first recipe engine, Menstrual cycle-synced nutrition, Budget/Token tracking, Photo-to-Macro analysis.
**Authentication:** Firebase Auth (JWT-based) integrated with a custom Firestore/Serverless backend.

---

## 1. Architecture Overview

CraveCare uses a **Serverless Event-Driven Architecture**.

* **Authentication:** Firebase Auth handles the JWT issuance. The backend validates these tokens via the Firebase Admin SDK.
* **API Strategy:** RESTful endpoints using **Google Cloud Functions** (or Firebase Functions).
* **Data Flow:** Flutter App ↔️ Firebase SDK ↔️ Firestore (DB) ↔️ Gemini API (AI Logic).
* **Caching:** Client-side caching via `flutter_cache_manager` and server-side edge caching for static recipe templates.

---

## 2. Complete Database Schema (Firestore Collections)

Firestore is NoSQL, but we maintain a strict relational structure within documents.

### Collection: `users`

| Field Name | Type | Constraints | Description |
| --- | --- | --- | --- |
| `id` | UUID/String | Primary Key | Firebase UID. |
| `email` | String | Unique, Required | User's email address. |
| `name` | String | Max 50 chars | User's display name. |
| `appliances` | Array | Not Null | e.g., `['kettle', 'induction']`. |
| `cycle_goal` | String | Enum | `pcos`, `cramp_relief`, `weight_mgmt`. |
| `last_period` | Timestamp | Not Null | Used to calculate current cycle phase. |
| `created_at` | Timestamp | Default: now | Record creation time. |
| `updated_at` | Timestamp | Default: now | Last update time. |

### Collection: `recipes`

| Field Name | Type | Constraints | Description |
| --- | --- | --- | --- |
| `id` | UUID | Primary Key | Unique recipe identifier. |
| `title` | String | Required | Recipe name. |
| `appliance_type` | String | Index | Filter: `kettle` vs `induction`. |
| `cycle_phase` | String | Index | Phase: `menstrual`, `luteal`, etc. |
| `ingredients` | Array | Not Null | List of items needed. |
| `steps` | Array | Not Null | Step-by-step instructions. |
| `cost_estimate` | Number | Not Null | Approx cost in INR. |

### Collection: `daily_logs`

| Field Name | Type | Constraints | Description |
| --- | --- | --- | --- |
| `id` | UUID | Primary Key | Log ID. |
| `user_id` | String | Foreign Key | Reference to `users.id`. |
| `photo_url` | String | Optional | URL to Firebase Storage image. |
| `macros` | Map | Not Null | `{carb: int, protein: int, cal: int}`. |
| `token_earned` | Boolean | Default: false | If this meal earned a "Cheat Token". |

---

## 3. Complete API Endpoints

### POST `/v1/recipes/generate`

* **Auth Required:** Yes (JWT)
* **Request Body:**
```json
{
  "appliance": "kettle",
  "healthGoal": "cramp_relief",
  "availableIngredients": ["oats", "milk"]
}

```


* **Validation:** `appliance` must be in allowed list; `availableIngredients` max 10 items.
* **Success (200 OK):**
```json
{
  "recipeId": "uuid-123",
  "title": "Kettle Oats Payasam",
  "steps": ["Boil milk", "Add oats", "Sweeten"],
  "nutritionalValue": "High Magnesium"
}

```


* **Errors:** `401` (Unauthorized), `429` (Too many requests), `503` (AI Engine Busy).
* **Side Effects:** Increases API usage counter in user metadata.

### POST `/v1/analyze/food-photo`

* **Auth Required:** Yes
* **Request Body:** `{"image_base64": "..."}` or Multipart Form Data.
* **Success (201 Created):**
```json
{
  "grade": "B",
  "analysis": "High in fiber, needs more protein.",
  "macros": { "carbs": 40, "protein": 5, "calories": 320 }
}

```



---

## 4. Authentication & Authorization

* **JWT Structure:** Handled by Firebase. Payload contains `uid`, `email`, and `email_verified`.
* **Route Protection:** * `Public`: `/v1/health-check`, `/v1/auth/signup`.
* `Private`: Everything under `/v1/recipes`, `/v1/analyze`, and `/v1/user`.



---

## 5. Data Validation Rules

* **Email:** Standard Regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`.
* **Appliances:** Must be a subset of `['kettle', 'induction', 'fridge', 'sandwich_maker']`.
* **Sanitization:** All text inputs are stripped of HTML tags to prevent XSS.

---

## 6. Standardized Error Response

```json
{
  "error": {
    "code": "LIMIT_EXCEEDED",
    "message": "You have reached your daily AI recipe limit.",
    "traceId": "req-990-abc"
  }
}

```

---

## 7. Caching Strategy

* **Static Recipes:** Cached in Firestore Bundle for 24 hours (TTL).
* **User Profile:** Cached locally on device using `SharedPreferences`.
* **AI Responses:** Shared recipes with identical inputs are cached for 1 hour to save Gemini tokens.

---

## 8. Rate Limiting

* **Auth (Signup/Login):** 5 attempts per IP per 15 minutes.
* **AI Generation:** 10 requests per user per day (MVP Constraint).
* **General API:** 100 requests per minute.

---

## 9. Database Migration Strategy

* **Tool:** Firestore does not use traditional migrations. We use a **"Schema Version"** field in the User document.
* **Process:** Background script to update documents if a new required field is added.

---

## 10. Backup & Recovery

* **Frequency:** Firebase Scheduled Backups (Daily).
* **Retention:** 30-day point-in-time recovery.
* **Restore:** Automated via Firebase Console Restore feature.

---

## 11. API Versioning Strategy

* **URL-based:** `/v1/`, `/v2/`.
* **Policy:** Deprecate old versions 3 months after a new major version release.

**Next Step:** Your backend logic is mapped. Would you like me to write the **Cloud Function (Node.js)** code that connects the app to the **Gemini API**?
