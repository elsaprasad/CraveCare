import { Recipe, MenstrualPhase, PHASES } from './cravecare-data';

// --- Helper Functions ---

const getApplianceName = (appliance: string): string => {
  const names: Record<string, string> = {
    kettle: 'electric kettle',
    induction: 'induction cooktop',
    'sandwich-maker': 'sandwich maker/panini press',
    fridge: 'refrigerator',
  };
  return names[appliance] || appliance;
};

const getEmojiForRecipe = (name: string, phase: MenstrualPhase): string => {
  const nameLower = name.toLowerCase();
  if (nameLower.includes('soup') || nameLower.includes('broth')) return '🥣';
  if (nameLower.includes('tea') || nameLower.includes('latte') || nameLower.includes('drink')) return '🍵';
  if (nameLower.includes('sandwich') || nameLower.includes('toast')) return '🥪';
  if (nameLower.includes('egg') || nameLower.includes('bhurji')) return '🍳';
  if (nameLower.includes('pancake') || nameLower.includes('dosa')) return '🥞';
  if (nameLower.includes('rice') || nameLower.includes('pulao')) return '🍚';
  if (nameLower.includes('dal') || nameLower.includes('curry')) return '🍲';
  if (nameLower.includes('chocolate') || nameLower.includes('cocoa')) return '🍫';
  if (nameLower.includes('salad') || nameLower.includes('bowl')) return '🥗';
  if (nameLower.includes('noodles') || nameLower.includes('maggi')) return '🍜';

  const phaseEmojis: Record<MenstrualPhase, string> = {
    menstrual: '🌙',
    follicular: '🌱',
    ovulatory: '☀️',
    luteal: '🍫',
  };
  return phaseEmojis[phase] || '✨';
};

// --- Rate Limit Helpers ---

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Models tried in order — flash-lite has a higher free-tier quota
const MODEL_FALLBACK_CHAIN = [
  "gemini-2.5-flash",
  "gemini-2.5-pro",
];

const MAX_RETRIES = 4;
const BASE_RETRY_DELAY_MS = 2000;

const getRetryDelay = (attempt: number) =>
  BASE_RETRY_DELAY_MS * Math.pow(2, attempt - 1) + Math.random() * 1000;  // wait 3s before retrying

// --- Internal API Caller ---

async function callGemini(
  modelId: string,
  prompt: string,
  apiKey: string
): Promise<string | null> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    console.log(`🚀 Calling ${modelId} (attempt ${attempt}/${MAX_RETRIES})...`);

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) return rawText;
      console.error("❌ Empty response body from Gemini:", data);
      return null;
    }

    const errorData = await response.json();

if (response.status === 429) {
  if (attempt < MAX_RETRIES) {
    const waitMs = getRetryDelay(attempt);
    console.warn(`⚠️ Rate limited on ${modelId}. Retrying in ${(waitMs / 1000).toFixed(1)}s... (attempt ${attempt}/${MAX_RETRIES})`);
    await delay(waitMs);
    continue;
  }
  console.warn(`⚠️ Rate limited on ${modelId}. No retries left — falling back.`);
  return null;
}

    // Any other error (400, 403, 500…) — no point retrying
    console.error(`❌ Gemini API Error ${response.status} on ${modelId}:`, errorData);
    return null;
  }

  return null;
}

// --- Multimodal (image + text) API caller for dish analysis ---

async function callGeminiWithImage(
  modelId: string,
  prompt: string,
  imageBase64: string,
  mimeType: string,
  apiKey: string
): Promise<string | null> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    console.log(`🚀 Calling ${modelId} with image (attempt ${attempt}/${MAX_RETRIES})...`);

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            { inlineData: { mimeType, data: imageBase64 } },
            { text: prompt },
          ],
        }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.5,
        },
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) return rawText;
      console.error("❌ Empty response body from Gemini:", data);
      return null;
    }

    const errorData = await response.json();

    if (response.status === 429) {
      if (attempt < MAX_RETRIES) {
        const waitMs = getRetryDelay(attempt);
        console.warn(`⚠️ Rate limited on ${modelId}. Retrying in ${(waitMs / 1000).toFixed(1)}s... (attempt ${attempt}/${MAX_RETRIES})`);
        await delay(waitMs);
        continue;
      }
      console.warn(`⚠️ Rate limited on ${modelId}. No retries left — falling back.`);
      return null;
    }

    console.error(`❌ Gemini API Error ${response.status} on ${modelId}:`, errorData);
    return null;
  }

  return null;
}

// --- Main Service ---

export interface GenerateRecipeParams {
  appliance: string;
  phase: MenstrualPhase;
  userPreferences?: {
    hasPCOS?: boolean;
    primaryGoal?: string;
    budget?: number;
  };
}

export async function generateRecipeWithGemini(
  params: GenerateRecipeParams
): Promise<Recipe | null> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    console.error("❌ VITE_GEMINI_API_KEY missing from .env");
    return null;
  }

  const { appliance, phase, userPreferences } = params;
  const phaseInfo = PHASES[phase];
  const applianceName = getApplianceName(appliance);

  const prompt = `You are a helpful nutritionist creating recipes for women's health.
Create a simple recipe that:
- Uses ONLY a ${applianceName}
- Suitable for the ${phaseInfo.name} phase (Days ${phaseInfo.days})
- Focuses on ${phaseInfo.nutrient}
- Budget-friendly Indian ingredients
- Takes 5-10 minutes
- 100% of suggested recipes must cost under ₹60 per serving
${userPreferences?.hasPCOS ? '- Is PCOS-friendly' : ''}
${userPreferences?.primaryGoal ? `- Aligns with goal: ${userPreferences.primaryGoal}` : ''}

Return ONLY a valid JSON object in this exact format:
{
  "name": "Recipe Name",
  "time": "X min",
  "calories": 200,
  "keyNutrient": "${phaseInfo.nutrient}",
  "ingredients": ["item 1", "item 2"],
  "steps": ["step 1", "step 2"]
}`;

  // Try each model in order; move to next on rate-limit or failure
  for (const modelId of MODEL_FALLBACK_CHAIN) {
    const rawText = await callGemini(modelId, prompt, apiKey);

    if (!rawText) {
      console.warn(`⏭️ Falling back from ${modelId}...`);
      continue;
    }

    try {
      const cleanJson = rawText
        .replace(/```json\s*/gi, "")
        .replace(/```\s*/g, "")
        .trim();

      const recipeData = JSON.parse(cleanJson);
      console.log(`✅ Recipe generated using ${modelId}`);

      return {
        id: `gemini-${Date.now()}`,
        name: recipeData.name || "AI Recipe",
        appliance,
        phase,
        time: recipeData.time || "15 min",
        calories: Number(recipeData.calories) || 250,
        keyNutrient: recipeData.keyNutrient || phaseInfo.nutrient,
        ingredients: recipeData.ingredients || [],
        steps: recipeData.steps || [],
        emoji: getEmojiForRecipe(recipeData.name || "", phase),
      };
    } catch (err) {
      console.error(`❌ JSON parse failed for ${modelId} response:`, err);
      continue;
    }
  }

  console.error("❌ All models exhausted. Could not generate a recipe.");
  return null;
}

// --- Dish image analysis (Hostel Grade + upgrade tip) ---

export interface DishGradeResult {
  grade: string;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  calories?: number;
  verdict: string;
  upgradeTip: string;
}

const DISH_ANALYSIS_PROMPT = `You are a friendly nutrition coach for young women in India (hostel/college context). Look at this photo of a meal/dish.

Grade it on a "Hostel Grade" scale from A+ down to F: A+ = excellent, balanced, nutritious; A = great; B = good; C = okay; D = poor; F = very poor (e.g. only Maggi or junk). Consider: balance of protein, carbs, fat, fiber, veggies, and how filling/nutritious it looks.

Return ONLY a valid JSON object in this exact format:
{
  "grade": "A+" or "A" or "B" or "C" or "D" or "F",
  "protein": approximate grams (number),
  "carbs": approximate grams (number),
  "fat": approximate grams (number),
  "fiber": approximate grams (number),
  "calories": approximate calories for this plate (number),
  "verdict": "One short, warm, encouraging sentence (max 15 words) with an emoji.",
  "upgradeTip": "One specific, actionable tip to upgrade this exact dish for a better grade (e.g. add a side of cucumber, top with peanuts, swap white rice for brown). Keep it under 20 words."
}`;

export async function analyzeDishImage(
  imageBase64: string,
  mimeType: string = "image/jpeg"
): Promise<DishGradeResult | null> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    console.error("❌ VITE_GEMINI_API_KEY missing from .env");
    return null;
  }

  for (const modelId of MODEL_FALLBACK_CHAIN) {
    const rawText = await callGeminiWithImage(
      modelId,
      DISH_ANALYSIS_PROMPT,
      imageBase64,
      mimeType,
      apiKey
    );

    if (!rawText) {
      console.warn(`⏭️ Falling back from ${modelId}...`);
      continue;
    }

    try {
      const cleanJson = rawText
        .replace(/```json\s*/gi, "")
        .replace(/```\s*/g, "")
        .trim();

      const data = JSON.parse(cleanJson);
      console.log(`✅ Dish grade from ${modelId}`);

      return {
        grade: data.grade || "C",
        protein: Number(data.protein) || 0,
        carbs: Number(data.carbs) || 0,
        fat: Number(data.fat) || 0,
        fiber: Number(data.fiber) || 0,
        calories: Number(data.calories) || 0,
        verdict: data.verdict || "Looks like a meal!",
        upgradeTip: data.upgradeTip || "Add some veggies or protein to level up.",
      };
    } catch (err) {
      console.error(`❌ JSON parse failed for dish analysis:`, err);
      continue;
    }
  }

  console.error("❌ All models exhausted. Could not analyze dish image.");
  return null;
}