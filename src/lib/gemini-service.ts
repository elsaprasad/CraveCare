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
    console.error("❌ VITE_GEMINI_API_KEY missing");
    return null;
  }

  const { appliance, phase, userPreferences } = params;
  const phaseInfo = PHASES[phase];
  const applianceName = getApplianceName(appliance);

  // Use current stable Gemini REST endpoint (v1) for gemini-1.5-flash
  // Docs: https://ai.google.dev/gemini-api/docs/models
  const modelId = "gemini-1.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1/models/${modelId}:generateContent?key=${apiKey}`;

  const prompt = `You are a helpful nutritionist creating recipes for women's health, specifically for menstrual cycle phases.

Create a simple, practical recipe that:
- Can be made using ONLY a ${applianceName} (no oven, no complex equipment)
- Is suitable for the ${phaseInfo.name} phase (Days ${phaseInfo.days})
- Focuses on ${phaseInfo.nutrient} which is needed during this phase
- Is budget-friendly and uses common Indian ingredients
- Takes 5-20 minutes to prepare
- Is suitable for hostel/college students with limited kitchen access
${userPreferences?.hasPCOS ? '- Is PCOS-friendly (low glycemic index, anti-inflammatory)' : ''}
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

  try {
    console.log(`🚀 Calling Gemini model ${modelId} via v1 REST API...`);

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          // Ask Gemini to respond as raw JSON
          responseMimeType: "application/json",
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      let errorBody: unknown = null;
      try {
        errorBody = await response.json();
      } catch {
        // ignore JSON parse errors
      }
      console.error(
        "❌ Gemini API Error:",
        response.status,
        response.statusText,
        errorBody
      );
      return null;
    }

    const data = await response.json();
    let text: string | undefined =
      data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      console.error("⚠️ Gemini response had no text content:", data);
      return null;
    }

    // Clean up potential markdown fences if the model ignored responseMimeType
    text = text.replace(/```json/gi, "").replace(/```/g, "").trim();

    const recipeData = JSON.parse(text);

    // Basic validation
    if (
      !recipeData.name ||
      !Array.isArray(recipeData.ingredients) ||
      !Array.isArray(recipeData.steps)
    ) {
      console.error("⚠️ Gemini returned invalid recipe payload:", recipeData);
      return null;
    }

    return {
      id: `gemini-${Date.now()}`,
      name: recipeData.name || "AI Recipe",
      appliance,
      phase,
      time: recipeData.time || "15 min",
      calories: Number(recipeData.calories) || 250,
      keyNutrient: recipeData.keyNutrient || phaseInfo.nutrient,
      ingredients: recipeData.ingredients,
      steps: recipeData.steps,
      emoji: getEmojiForRecipe(recipeData.name, phase),
    };
  } catch (err) {
    console.error("❌ Gemini fetch failed:", err);
    return null;
  }
}
