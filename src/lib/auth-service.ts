import { supabase } from './supabase';
import type { UserProfile } from './cravecare-data';

// ── Auth ──────────────────────────────────────────────────────
export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user;
}

// ── Profile (now linked to auth user) ────────────────────────
export async function createProfile(userId: string, data: {
  name: string;
  appliances: string[];
  last_period_date: string;
  has_pcos: boolean;
  primary_goal: string;
  daily_budget: number;
}) {
  const { data: profile, error } = await supabase
    .from('profiles')
    .insert({ id: userId, ...data })
    .select()
    .single();
  if (error) throw error;
  return profile;
}

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) return null;
  return data;
}

/** Map Supabase profile row (snake_case) to app UserProfile (camelCase). */
export function mapProfileToUserProfile(row: Record<string, unknown> | null): UserProfile | null {
  if (!row || typeof row.name !== 'string') return null;
  return {
    name: row.name as string,
    appliances: Array.isArray(row.appliances) ? (row.appliances as string[]) : [],
    lastPeriodDate: (row.last_period_date as string) ?? '',
    hasPCOS: Boolean(row.has_pcos),
    primaryGoal: (row.primary_goal as string) ?? '',
    dailyBudget: Number(row.daily_budget) || 200,
    cheatDayProgress: Number(row.cheat_day_progress) || 0,
  };
}