import { supabase } from './supabase';
import type { SpendEntry, CheatToken, CheatDay } from './cravecare-data';

// ── Meal type (matches DB check constraint) ─────────────────────
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export function getMealType(): MealType {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 11) return 'breakfast';
  if (hour >= 11 && hour < 15) return 'lunch';
  if (hour >= 18 && hour < 22) return 'dinner';
  return 'snack';
}

export function getMealEmoji(mealType: string) {
  return { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '🍿' }[mealType] ?? '🍽️';
}

// ── Mappers: DB row → app types ───────────────────────────────
function mapSpendRow(row: Record<string, unknown>): SpendEntry {
  const createdAt = row.created_at as string;
  const date = (row.date as string) ?? (createdAt?.split('T')[0] ?? '');
  return {
    id: String(row.id),
    label: String(row.label),
    amount: Number(row.amount),
    timestamp: createdAt ? new Date(createdAt).getTime() : Date.now(),
    date,
  };
}

function mapTokenRow(row: Record<string, unknown>): CheatToken {
  const earnedAt = row.earned_at as string;
  return {
    id: String(row.id),
    reason: String(row.reason),
    earnedAt: earnedAt ? new Date(earnedAt).getTime() : Date.now(),
  };
}

function mapCheatDayRow(row: Record<string, unknown>): CheatDay {
  const unlockedAt = row.unlocked_at as string;
  return {
    id: String(row.id),
    unlockedAt: unlockedAt ? new Date(unlockedAt).getTime() : Date.now(),
    tokensSpent: Number(row.tokens_spent) || 0,
  };
}

// ── Spend entries ───────────────────────────────────────────────
export async function addSpendEntry(
  profileId: string,
  label: string,
  amount: number,
  mealType?: MealType
): Promise<SpendEntry> {
  const date = new Date().toISOString().split('T')[0];
  const meal_type = mealType ?? getMealType();
  const { data, error } = await supabase
    .from('spend_entries')
    .insert({ profile_id: profileId, label, amount, date, meal_type })
    .select()
    .single();
  if (error) throw error;
  return mapSpendRow(data);
}

export async function getSpendEntries(profileId: string): Promise<SpendEntry[]> {
  const { data, error } = await supabase
    .from('spend_entries')
    .select('*')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapSpendRow);
}

export async function deleteSpendEntry(id: string): Promise<void> {
  const { error } = await supabase.from('spend_entries').delete().eq('id', id);
  if (error) throw error;
}

// ── Tokens ──────────────────────────────────────────────────────
export async function awardToken(profileId: string, reason: string): Promise<CheatToken> {
  const { data, error } = await supabase
    .from('tokens')
    .insert({ profile_id: profileId, reason })
    .select()
    .single();
  if (error) throw error;
  return mapTokenRow(data);
}

export async function getTokens(profileId: string): Promise<CheatToken[]> {
  const { data, error } = await supabase
    .from('tokens')
    .select('*')
    .eq('profile_id', profileId)
    .order('earned_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapTokenRow);
}

// ── Cheat days ──────────────────────────────────────────────────
export async function redeemCheatDay(profileId: string, tokensSpent: number): Promise<CheatDay> {
  const { data, error } = await supabase
    .from('cheat_days')
    .insert({ profile_id: profileId, tokens_spent: tokensSpent })
    .select()
    .single();
  if (error) throw error;
  return mapCheatDayRow(data);
}

export async function getCheatDays(profileId: string): Promise<CheatDay[]> {
  const { data, error } = await supabase
    .from('cheat_days')
    .select('*')
    .eq('profile_id', profileId)
    .order('unlocked_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapCheatDayRow);
}

// ── Meal snaps (hostel grade, macros, calories, meal type) ───────
export async function saveMealSnap(
  profileId: string,
  snap: {
    grade: string;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    verdict: string;
    upgrade_tip?: string;
    image_url?: string;
    calories?: number;
  },
  mealType?: MealType
): Promise<Record<string, unknown>> {
  const meal_type = mealType ?? getMealType();
  const row: Record<string, unknown> = {
    profile_id: profileId,
    meal_type,
    grade: snap.grade,
    protein: snap.protein,
    carbs: snap.carbs,
    fat: snap.fat,
    fiber: snap.fiber,
    verdict: snap.verdict,
    ...(snap.upgrade_tip != null && { upgrade_tip: snap.upgrade_tip }),
    ...(snap.image_url != null && { image_url: snap.image_url }),
    ...(snap.calories != null && snap.calories > 0 && { calories: snap.calories }),
  };
  const { data, error } = await supabase
    .from('meal_snaps')
    .insert(row)
    .select()
    .single();
  if (error) throw error;
  return data as Record<string, unknown>;
}

export async function getMealSnaps(profileId: string): Promise<Record<string, unknown>[]> {
  const { data, error } = await supabase
    .from('meal_snaps')
    .select('*')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Record<string, unknown>[];
}

// ── Helpers (for use with app types; todayStr also in cravecare-data) ─
export function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}
// ── Grocery List ────────────────────────────────────────────────

export interface GroceryItem {
  id: string;
  name: string;
  checked: boolean;
  sourceRecipeName?: string;
  sourceRecipeEmoji?: string;
  quantity?: string;
  createdAt: number;
}

function mapGroceryRow(row: Record<string, unknown>): GroceryItem {
  return {
    id: String(row.id),
    name: String(row.name),
    checked: Boolean(row.checked),
    sourceRecipeName: row.source_recipe_name ? String(row.source_recipe_name) : undefined,
    sourceRecipeEmoji: row.source_recipe_emoji ? String(row.source_recipe_emoji) : undefined,
    quantity: row.quantity ? String(row.quantity) : undefined,
    createdAt: row.created_at ? new Date(String(row.created_at)).getTime() : Date.now(),
  };
}

export async function getGroceryList(profileId: string): Promise<GroceryItem[]> {
  const { data, error } = await supabase
    .from('grocery_list')
    .select('*')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapGroceryRow);
}

export async function addGroceryItems(
  profileId: string,
  items: { name: string; sourceRecipeName?: string; sourceRecipeEmoji?: string; quantity?: string }[]
): Promise<GroceryItem[]> {
  const rows = items.map(item => ({
    profile_id: profileId,
    name: item.name,
    checked: false,
    source_recipe_name: item.sourceRecipeName ?? null,
    source_recipe_emoji: item.sourceRecipeEmoji ?? null,
    quantity: item.quantity ?? null,
  }));
  const { data, error } = await supabase
    .from('grocery_list')
    .insert(rows)
    .select();
  if (error) throw error;
  return (data ?? []).map(mapGroceryRow);
}

export async function toggleGroceryItem(id: string, checked: boolean): Promise<void> {
  const { error } = await supabase
    .from('grocery_list')
    .update({ checked })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteGroceryItem(id: string): Promise<void> {
  const { error } = await supabase.from('grocery_list').delete().eq('id', id);
  if (error) throw error;
}

export async function clearCheckedItems(profileId: string): Promise<void> {
  const { error } = await supabase
    .from('grocery_list')
    .delete()
    .eq('profile_id', profileId)
    .eq('checked', true);
  if (error) throw error;
}