<p align="center">
  <img src="./img.png" alt="Project Banner" width="100%">
</p>
# CraveCare 🎯

**The "Big Sister" App for Hostel Students**

## Basic Details

### Team Name: Atles

### Team Members

* **Elsa Prasad** - Muthoot Institute of Technology and Science
* **Elna Susan Kuriakose** - Muthoot Institute of Technology and Science

### Hosted Project Link

https://cravecaredeply.vercel.app/

### Project Description

CraveCare is a health and nutrition app specifically designed for female students living in hostels or PGs. It helps users manage their nutrition by providing recipes restricted to limited appliances (Kettle/Induction) while syncing their diet with their menstrual cycle phases.

### The Problem statement

Hostel students often face "food poverty"—limited access to kitchen tools, tight budgets, and lack of knowledge on how to eat according to their hormonal health (PCOS, menstrual cramps, etc.), leading to reliance on unhealthy instant noodles or expensive deliveries.

### The Solution

We provide an AI-powered recipe engine that filters by specific hostel appliances and cycle phases. It includes a "Photo-to-Macro" analyzer to grade mess food and a budget tracker to encourage healthy, low-cost cooking.

---

## Technical Details

### Technologies/Components Used

**For Software:**

* **Languages used:** TypeScript, JavaScript, HTML/CSS
* **Frameworks used:** React (Vite)
* **Libraries used:** `@google/generative-ai` (Gemini SDK), `lucide-react`, `framer-motion`, `react-router-dom`
* **Tools used:** VS Code, Git, Google AI Studio (Gemini 1.5 Flash)

---

## Features

* **Appliance-Restricted Recipes:** Filters meals that can be made *only* with a Kettle, Induction, or Sandwich Maker.
* **Cycle-Synced Nutrition:** Automatically calculates menstrual phases and suggests nutrients (e.g., Magnesium during Luteal phase).
* **AI Food Vision:** Uses Gemini 1.5 Flash to analyze photos of mess food and provide a health grade (A-F).
* **Budget Tracking:** Keeps track of daily spends to prevent overspending on food delivery.
* **PCOS-Friendly Toggle:** Filters for low-GI and anti-inflammatory ingredients.

---

## Implementation

### For Software:

#### Installation

```bash
npm install

```

#### Run

```bash
# Add VITE_GEMINI_API_KEY to your .env.local file first
npm run dev

```

---

## Project Documentation

### For Software:

#### Screenshots
<img src="screenshots/screenshot.png">

#### Diagrams

**System Architecture:**

*The frontend sends user parameters (phase/appliance) to the Gemini 1.5 Flash API via a secure service layer, returning structured JSON recipes.*

**Application Workflow:**

*User Onboards -> Selects Appliances -> Input Last Period Date -> Dashboard calculates Phase -> AI Generates Personalized Recipe.*

---

## Additional Documentation

### For Web Projects with Backend:

#### API Documentation (External)

**Google Generative AI (Gemini 1.5 Flash)**

* **Endpoint:** `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`
* **Purpose:** Used for both structured recipe generation and multimodal image analysis of food.

---

## Project Demo

### Video

[Link to your Loom or YouTube Demo]
*Demonstrates onboarding, the cycle-tracking dashboard, and the AI generating a kettle-specific recipe.*

---

## AI Tools Used

**Tool Used:** Gemini 1.5 Flash, ChatGPT

**Purpose:**
* **Gemini 1.5 Flash:** Core engine for recipe logic and image recognition.
* **ChatGPT:** Assisting with complex TypeScript interfaces and logic debugging.

**Key Prompts Used:**

* "Create a React service to fetch JSON from Gemini API using fetch and v1beta endpoint."
* "Calculate menstrual phase in JS given a start date and average 28-day cycle."
* "Style a Tailwind card with Coral and Cream colors for a female-centric health app."

**Percentage of AI-generated code:** Approximately 80%

**Human Contributions:**

* Product strategy and "Hostel Big Sister" branding.
* Prompt Engineering for specific Indian hostel constraints.
* UI/UX flow design and color palette selection.
* Integration of multiple AI streams into a cohesive dashboard.
* Debugging and making it all work!

---

## Team Contributions

* **Elsa Prasad:** Frontend development, Gemini API integration, and AI Prompt Engineering.
* **Elna Susan Kuriakose:** UI/UX Design, Logic for cycle phase calculations, and Documentation.

---

## License

This project is licensed under the MIT License.

---

Made with ❤️ by Elsa and Elna at TinkerHub
