import { useState, useMemo } from 'react';

export interface SpendEntry {
  id: string;
  label: string;
  amount: number;
  timestamp: number; // epoch ms
  date: string; // YYYY-MM-DD
}

export interface CheatToken {
  id: string;
  reason: string; // e.g. "Under budget", "Healthy meal", "Logging streak"
  earnedAt: number; // epoch ms
}

export interface CheatDay {
  id: string;
  unlockedAt: number;
  tokensSpent: number;
}

export interface UserProfile {
  name: string;
  appliances: string[];
  lastPeriodDate: string;
  hasPCOS: boolean;
  primaryGoal: string;
  dailyBudget: number;
  cheatDayProgress: number; // legacy, kept for backwards compat
}

// Token system constants — collect 5 tokens to unlock one guilt-free Cheat Day
export const TOKENS_PER_CHEAT_DAY = 5;
export const TOKEN_REWARDS = {
  UNDER_BUDGET: { tokens: 1, label: '💰 Under budget!' },
  HEALTHY_MEAL: { tokens: 1, label: '🥗 Healthy meal cooked' },
  LOGGING_STREAK: { tokens: 1, label: '📊 Logged 3+ meals today' },
} as const;
export const MAX_HEALTHY_MEAL_TOKENS_PER_DAY = 2;

// Helpers
export function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

export function loadSpends(): SpendEntry[] {
  try {
    const stored = localStorage.getItem('cravecare-spends-v2');
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}

export function saveSpends(spends: SpendEntry[]) {
  localStorage.setItem('cravecare-spends-v2', JSON.stringify(spends));
}

export function loadTokens(): CheatToken[] {
  try {
    const stored = localStorage.getItem('cravecare-tokens');
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}

export function saveTokens(tokens: CheatToken[]) {
  localStorage.setItem('cravecare-tokens', JSON.stringify(tokens));
}

export function loadCheatDays(): CheatDay[] {
  try {
    const stored = localStorage.getItem('cravecare-cheatdays');
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}

export function saveCheatDays(days: CheatDay[]) {
  localStorage.setItem('cravecare-cheatdays', JSON.stringify(days));
}

export function getSpendsByDate(spends: SpendEntry[], date: string): SpendEntry[] {
  return spends.filter(s => s.date === date);
}

export function getTodaySpends(spends: SpendEntry[]): SpendEntry[] {
  return getSpendsByDate(spends, todayStr());
}

export function countHealthyMealTokensToday(tokens: CheatToken[]): number {
  const today = todayStr();
  return tokens.filter(t =>
    t.reason === TOKEN_REWARDS.HEALTHY_MEAL.label &&
    new Date(t.earnedAt).toISOString().split('T')[0] === today
  ).length;
}

export function hasEarnedUnderBudgetTokenToday(tokens: CheatToken[]): boolean {
  const today = todayStr();
  return tokens.some(t =>
    t.reason === TOKEN_REWARDS.UNDER_BUDGET.label &&
    new Date(t.earnedAt).toISOString().split('T')[0] === today
  );
}

export function hasEarnedLoggingStreakTokenToday(tokens: CheatToken[]): boolean {
  const today = todayStr();
  return tokens.some(t =>
    t.reason === TOKEN_REWARDS.LOGGING_STREAK.label &&
    new Date(t.earnedAt).toISOString().split('T')[0] === today
  );
}

export interface Recipe {
  id: string;
  name: string;
  appliance: string;
  phase: string;
  time: string;
  calories: number;
  keyNutrient: string;
  ingredients: string[];
  steps: string[];
  emoji: string;
}

export type MenstrualPhase = 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';

export interface PhaseInfo {
  name: string;
  emoji: string;
  color: string;
  nutrient: string;
  tip: string;
  days: string;
}

export const PHASES: Record<MenstrualPhase, PhaseInfo> = {
  menstrual: {
    name: 'Menstrual',
    emoji: '🌙',
    color: 'bg-rose',
    nutrient: 'Iron & Vitamin C',
    tip: 'Your body is shedding. Focus on iron-rich comfort foods, sis!',
    days: 'Days 1-5',
  },
  follicular: {
    name: 'Follicular',
    emoji: '🌱',
    color: 'bg-sage',
    nutrient: 'Protein & B Vitamins',
    tip: 'Energy is rising! Time for fresh, light meals that fuel your hustle.',
    days: 'Days 6-13',
  },
  ovulatory: {
    name: 'Ovulatory',
    emoji: '☀️',
    color: 'bg-primary',
    nutrient: 'Fiber & Antioxidants',
    tip: 'You\'re glowing, queen! Keep it light and veggie-forward.',
    days: 'Days 14-16',
  },
  luteal: {
    name: 'Luteal',
    emoji: '🍫',
    color: 'bg-accent',
    nutrient: 'Magnesium & Complex Carbs',
    tip: 'Cravings incoming! Let\'s channel them into something nourishing.',
    days: 'Days 17-28',
  },
};

export function getCurrentPhase(lastPeriodDate: string): MenstrualPhase {
  const last = new Date(lastPeriodDate);
  const today = new Date();
  const diffDays = Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24)) % 28;

  if (diffDays <= 5) return 'menstrual';
  if (diffDays <= 13) return 'follicular';
  if (diffDays <= 16) return 'ovulatory';
  return 'luteal';
}

export const APPLIANCES = [
  { id: 'kettle', name: 'Kettle', emoji: '☕' },
  { id: 'induction', name: 'Induction', emoji: '🍳' },
  { id: 'sandwich-maker', name: 'Sandwich Maker', emoji: '🥪' },
  { id: 'fridge', name: 'Fridge', emoji: '❄️' },
];

export const GOALS = [
  { id: 'weight-loss', name: 'Weight Loss', emoji: '🏃‍♀️' },
  { id: 'pcos-management', name: 'PCOS Management', emoji: '💪' },
  { id: 'exam-focus', name: 'Exam Focus', emoji: '📚' },
  { id: 'budget-eating', name: 'Budget Eating', emoji: '💰' },
  { id: 'muscle-gain', name: 'Muscle Gain', emoji: '🏋️‍♀️' },
];

export const MOM_TIPS = [
  "Add a pinch of turmeric to your milk before bed — Mom's secret sleep potion! 🌙",
  "Soak your oats overnight. Morning-you will thank evening-you, sis! 🌅",
  "A banana + peanut butter = the hostel protein combo nobody told you about 🍌",
  "Drink warm water with lemon first thing. Your gut will send you a thank-you card 💌",
  "Roasted chana > chips. Your wallet AND waist agree! 💰",
  "Curd rice isn't boring — it's a probiotic powerhouse in disguise 🦸‍♀️",
  "Jaggery in your tea instead of sugar. Small swap, big difference! 🍵",
  "Sprouts don't need cooking — just soak overnight. Lazy girl protein hack! 🌱",
  "Feeling low? Dark chocolate (70%+) boosts serotonin. Science says treat yourself! 🍫",
  "Coconut water > that expensive cold coffee. Stay hydrated, queen! 🥥",
];

export const MOCK_RECIPES: Recipe[] = [
  {
    id: '1', name: 'Iron-Rich Spinach Soup', appliance: 'kettle', phase: 'menstrual',
    time: '10 min', calories: 180, keyNutrient: 'Iron',
    ingredients: ['Instant spinach soup mix', 'Lemon juice', 'Sesame seeds'],
    steps: ['Boil water in kettle', 'Mix soup powder', 'Add lemon and seeds'],
    emoji: '🥣',
  },
  {
    id: '2', name: 'Protein Egg Bhurji', appliance: 'induction', phase: 'follicular',
    time: '12 min', calories: 250, keyNutrient: 'Protein',
    ingredients: ['2 eggs', 'Onion', 'Tomato', 'Turmeric', 'Oil'],
    steps: ['Heat oil', 'Sauté onion & tomato', 'Add eggs & scramble', 'Season well'],
    emoji: '🍳',
  },
  {
    id: '3', name: 'Veggie Grilled Sandwich', appliance: 'sandwich-maker', phase: 'ovulatory',
    time: '8 min', calories: 220, keyNutrient: 'Fiber',
    ingredients: ['Whole wheat bread', 'Capsicum', 'Corn', 'Cheese slice', 'Chutney'],
    steps: ['Layer veggies on bread', 'Add cheese & chutney', 'Grill until golden'],
    emoji: '🥪',
  },
  {
    id: '4', name: 'Dark Chocolate Oats', appliance: 'kettle', phase: 'luteal',
    time: '7 min', calories: 280, keyNutrient: 'Magnesium',
    ingredients: ['Instant oats', 'Dark chocolate chips', 'Banana', 'Honey'],
    steps: ['Boil water', 'Add oats & chocolate', 'Top with banana slices'],
    emoji: '🍫',
  },
  {
    id: '5', name: 'Masala Maggi Upgrade', appliance: 'induction', phase: 'menstrual',
    time: '10 min', calories: 320, keyNutrient: 'Iron',
    ingredients: ['Maggi', 'Spinach', 'Egg', 'Peanuts'],
    steps: ['Cook Maggi per pack', 'Add chopped spinach', 'Drop in an egg', 'Top with peanuts'],
    emoji: '🍜',
  },
  {
    id: '6', name: 'Peanut Butter Toast Stack', appliance: 'sandwich-maker', phase: 'follicular',
    time: '5 min', calories: 310, keyNutrient: 'Protein',
    ingredients: ['Bread', 'Peanut butter', 'Banana', 'Honey', 'Chia seeds'],
    steps: ['Spread PB on bread', 'Add banana slices', 'Drizzle honey', 'Grill lightly'],
    emoji: '🥜',
  },
  {
    id: '7', name: 'Quick Poha Bowl', appliance: 'induction', phase: 'ovulatory',
    time: '15 min', calories: 240, keyNutrient: 'Fiber',
    ingredients: ['Poha', 'Peanuts', 'Onion', 'Lemon', 'Curry leaves'],
    steps: ['Rinse poha', 'Sauté peanuts & onion', 'Add poha & spices', 'Squeeze lemon'],
    emoji: '🥣',
  },
  {
    id: '8', name: 'Midnight Turmeric Latte', appliance: 'kettle', phase: 'luteal',
    time: '5 min', calories: 120, keyNutrient: 'Magnesium',
    ingredients: ['Milk', 'Turmeric', 'Honey', 'Cinnamon'],
    steps: ['Heat milk in kettle', 'Add turmeric & cinnamon', 'Sweeten with honey'],
    emoji: '🥛',
  },
];

// Fallback recipes when Gemini API is unavailable or fails
const FALLBACK_RECIPES: Record<string, Record<string, Recipe>> = {
  kettle: {
    menstrual: { id: 'fallback-1', name: 'Beetroot Ginger Tea', appliance: 'kettle', phase: 'menstrual', time: '5 min', calories: 60, keyNutrient: 'Iron', ingredients: ['Beetroot powder', 'Ginger', 'Honey'], steps: ['Boil water', 'Add beetroot powder & ginger', 'Sweeten'], emoji: '🫖' },
    follicular: { id: 'fallback-2', name: 'Green Tea Protein Shake', appliance: 'kettle', phase: 'follicular', time: '5 min', calories: 150, keyNutrient: 'Protein', ingredients: ['Green tea', 'Protein powder', 'Honey'], steps: ['Brew green tea', 'Cool slightly', 'Mix in protein'], emoji: '🍵' },
    ovulatory: { id: 'fallback-3', name: 'Lemon Detox Water', appliance: 'kettle', phase: 'ovulatory', time: '3 min', calories: 20, keyNutrient: 'Vitamin C', ingredients: ['Lemon', 'Mint', 'Cucumber'], steps: ['Boil water', 'Cool', 'Add lemon, mint, cucumber'], emoji: '🍋' },
    luteal: { id: 'fallback-4', name: 'Hot Cocoa Comfort', appliance: 'kettle', phase: 'luteal', time: '5 min', calories: 200, keyNutrient: 'Magnesium', ingredients: ['Cocoa powder', 'Milk', 'Jaggery'], steps: ['Heat milk', 'Mix cocoa & jaggery', 'Stir well'], emoji: '☕' },
  },
  induction: {
    menstrual: { id: 'fallback-5', name: 'Dal Tadka Express', appliance: 'induction', phase: 'menstrual', time: '20 min', calories: 280, keyNutrient: 'Iron', ingredients: ['Moong dal', 'Tomato', 'Cumin', 'Ghee'], steps: ['Pressure cook dal', 'Make tadka', 'Mix together'], emoji: '🍲' },
    follicular: { id: 'fallback-6', name: 'Egg Fried Rice', appliance: 'induction', phase: 'follicular', time: '15 min', calories: 350, keyNutrient: 'Protein', ingredients: ['Leftover rice', 'Eggs', 'Soy sauce', 'Veggies'], steps: ['Scramble eggs', 'Add rice & veggies', 'Season with soy sauce'], emoji: '🍚' },
    ovulatory: { id: 'fallback-7', name: 'Stir-Fry Veggie Bowl', appliance: 'induction', phase: 'ovulatory', time: '12 min', calories: 200, keyNutrient: 'Fiber', ingredients: ['Mixed veggies', 'Sesame oil', 'Garlic', 'Soy sauce'], steps: ['Heat oil', 'Add garlic & veggies', 'Season & serve'], emoji: '🥗' },
    luteal: { id: 'fallback-8', name: 'Banana Pancakes', appliance: 'induction', phase: 'luteal', time: '15 min', calories: 300, keyNutrient: 'Magnesium', ingredients: ['Banana', 'Oats', 'Egg', 'Cinnamon'], steps: ['Mash banana', 'Mix with oats & egg', 'Pan-fry small pancakes'], emoji: '🥞' },
  },
  'sandwich-maker': {
    menstrual: { id: 'fallback-9', name: 'Spinach Cheese Melt', appliance: 'sandwich-maker', phase: 'menstrual', time: '7 min', calories: 260, keyNutrient: 'Iron', ingredients: ['Bread', 'Spinach', 'Cheese', 'Garlic butter'], steps: ['Spread garlic butter', 'Layer spinach & cheese', 'Grill'], emoji: '🧀' },
    follicular: { id: 'fallback-10', name: 'Paneer Tikka Sandwich', appliance: 'sandwich-maker', phase: 'follicular', time: '8 min', calories: 290, keyNutrient: 'Protein', ingredients: ['Bread', 'Paneer', 'Tikki paste', 'Onion'], steps: ['Marinate paneer', 'Layer on bread', 'Grill until crispy'], emoji: '🫓' },
    ovulatory: { id: 'fallback-11', name: 'Corn & Capsicum Grill', appliance: 'sandwich-maker', phase: 'ovulatory', time: '8 min', calories: 210, keyNutrient: 'Fiber', ingredients: ['Bread', 'Sweet corn', 'Capsicum', 'Mayo'], steps: ['Mix corn & capsicum', 'Spread on bread', 'Grill'], emoji: '🌽' },
    luteal: { id: 'fallback-12', name: 'Nutella Banana Toastie', appliance: 'sandwich-maker', phase: 'luteal', time: '5 min', calories: 340, keyNutrient: 'Magnesium', ingredients: ['Bread', 'Nutella', 'Banana', 'Walnuts'], steps: ['Spread Nutella', 'Add banana & walnuts', 'Grill lightly'], emoji: '🍌' },
  },
};

export function getFallbackRecipe(appliance: string, phase: MenstrualPhase): Recipe {
  const phaseInfo = PHASES[phase];
  return FALLBACK_RECIPES[appliance]?.[phase] || {
    id: 'fallback-default', name: `${phaseInfo.name} Special`, appliance, phase,
    time: '10 min', calories: 200, keyNutrient: phaseInfo.nutrient,
    ingredients: ['Check pantry'], steps: ['Get creative!'], emoji: '✨',
  };
}