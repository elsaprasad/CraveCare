import { useState, useRef, useEffect } from 'react';
import { Camera, IndianRupee, Loader2, Plus, Coins, Gift, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { analyzeDishImage, type DishGradeResult } from '@/lib/gemini-service';
import {
  SpendEntry, CheatToken, CheatDay,
  loadSpends, saveSpends, loadTokens, saveTokens, loadCheatDays, saveCheatDays,
  getTodaySpends, countHealthyMealTokensToday, hasEarnedUnderBudgetTokenToday,
  hasEarnedLoggingStreakTokenToday, todayStr,
  TOKENS_PER_CHEAT_DAY, TOKEN_REWARDS, MAX_HEALTHY_MEAL_TOKENS_PER_DAY,
} from '@/lib/cravecare-data';
import {
  getSpendEntries, addSpendEntry as addSpendEntrySupabase, deleteSpendEntry as deleteSpendEntrySupabase,
  getTokens as getTokensSupabase, awardToken as awardTokenSupabase,
  getCheatDays as getCheatDaysSupabase, redeemCheatDay as redeemCheatDaySupabase,
  saveMealSnap as saveMealSnapSupabase, getMealType, getMealEmoji,
} from '@/lib/supabase-service';

const SNAP_GRADE_KEY = 'cravecare-snap-grade';

function saveSnapGrade(result: DishGradeResult | null) {
  try {
    if (result) {
      sessionStorage.setItem(SNAP_GRADE_KEY, JSON.stringify(result));
    } else {
      sessionStorage.removeItem(SNAP_GRADE_KEY);
    }
  } catch {
    // ignore sessionStorage errors
  }
}

function loadSnapGrade(): DishGradeResult | null {
  try {
    const raw = sessionStorage.getItem(SNAP_GRADE_KEY);
    return raw ? (JSON.parse(raw) as DishGradeResult) : null;
  } catch {
    return null;
  }
}

interface TrackPageProps {
  dailyBudget: number;
  /** When set, data is read/written from Supabase; otherwise localStorage (legacy). */
  userId?: string | null;
}

const TrackPage = ({ dailyBudget = 200, userId }: TrackPageProps) => {
  const [tab, setTab] = useState<'budget' | 'snap'>('budget');
  const [spendInput, setSpendInput] = useState('');
  const [spendLabel, setSpendLabel] = useState('');
  const [spends, setSpends] = useState<SpendEntry[]>(() => (userId ? [] : loadSpends()));
  const [tokens, setTokens] = useState<CheatToken[]>(() => (userId ? [] : loadTokens()));
  const [cheatDays, setCheatDays] = useState<CheatDay[]>(() => (userId ? [] : loadCheatDays()));
  const [dataLoading, setDataLoading] = useState(!!userId);
  const [dataError, setDataError] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [redeemConfirm, setRedeemConfirm] = useState(false);

  const [snapGrade, setSnapGrade] = useState<DishGradeResult | null>(() => loadSnapGrade());
  const [snapMealType, setSnapMealType] = useState<string | null>(null);
  const [snapLoading, setSnapLoading] = useState(false);
  const [snapError, setSnapError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch spends, tokens, cheat days from Supabase when userId is set
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    setDataLoading(true);
    setDataError(null);
    (async () => {
      try {
        const [s, t, c] = await Promise.all([
          getSpendEntries(userId),
          getTokensSupabase(userId),
          getCheatDaysSupabase(userId),
        ]);
        if (!cancelled) {
          setSpends(s);
          setTokens(t);
          setCheatDays(c);
        }
      } catch (e) {
        if (!cancelled) setDataError(e instanceof Error ? e.message : 'Failed to load data');
      } finally {
        if (!cancelled) setDataLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [userId]);

  // If we rehydrated a grade from sessionStorage, jump straight to the snap tab
  useEffect(() => {
    if (loadSnapGrade()) {
      setTab('snap');
    }
  }, []);

  useEffect(() => {
    const onVisibility = () => {
      if (!document.hidden) {
        const saved = loadSnapGrade();
        if (saved) {
          setSnapGrade(saved);
          setTab('snap');
        }
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  const todaySpends = getTodaySpends(spends);
  const totalSpend = todaySpends.reduce((a, b) => a + b.amount, 0);
  const remaining = dailyBudget - totalSpend;
  const budgetPct = Math.min((totalSpend / dailyBudget) * 100, 100);
  const availableTokens = tokens.length - (cheatDays.reduce((a, b) => a + b.tokensSpent, 0));
  const canEarnHealthyMeal = countHealthyMealTokensToday(tokens) < MAX_HEALTHY_MEAL_TOKENS_PER_DAY;
  const canEarnUnderBudget = !hasEarnedUnderBudgetTokenToday(tokens);
  const canEarnLoggingStreak = !hasEarnedLoggingStreakTokenToday(tokens) && todaySpends.length >= 3;

  function showToast(msg: string) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  }

  async function awardToken(reason: string, label: string) {
    if (userId) {
      try {
        const newToken = await awardTokenSupabase(userId, reason);
        setTokens(prev => [newToken, ...prev]);
        showToast(`🎉 +1 token earned! ${label}`);
      } catch (e) {
        showToast(e instanceof Error ? e.message : 'Could not award token');
      }
      return;
    }
    const newToken: CheatToken = { id: Date.now().toString(), reason, earnedAt: Date.now() };
    const updated = [...tokens, newToken];
    setTokens(updated);
    saveTokens(updated);
    showToast(`🎉 +1 token earned! ${label}`);
  }

  const addSpend = async () => {
    const amount = parseFloat(spendInput);
    if (isNaN(amount) || amount <= 0) return;
    const label = spendLabel || 'Food';
    if (userId) {
      try {
        const newEntry = await addSpendEntrySupabase(userId, label, amount);
        setSpends(prev => [newEntry, ...prev]);
        setSpendInput('');
        setSpendLabel('');
        const updated = [newEntry, ...spends];
        const todayCount = getTodaySpends(updated).length;
        if (todayCount === 3 && !hasEarnedLoggingStreakTokenToday(tokens)) {
          setTimeout(() => awardToken(TOKEN_REWARDS.LOGGING_STREAK.label, TOKEN_REWARDS.LOGGING_STREAK.label), 400);
        }
      } catch (e) {
        showToast(e instanceof Error ? e.message : 'Could not add expense');
      }
      return;
    }
    const newEntry: SpendEntry = {
      id: Date.now().toString(),
      label,
      amount,
      timestamp: Date.now(),
      date: todayStr(),
    };
    const updated = [...spends, newEntry];
    setSpends(updated);
    saveSpends(updated);
    setSpendInput('');
    setSpendLabel('');
    const todayCount = getTodaySpends(updated).length;
    if (todayCount === 3 && !hasEarnedLoggingStreakTokenToday(tokens)) {
      setTimeout(() => awardToken(TOKEN_REWARDS.LOGGING_STREAK.label, TOKEN_REWARDS.LOGGING_STREAK.label), 400);
    }
  };

  const deleteSpend = async (id: string) => {
    if (userId) {
      try {
        await deleteSpendEntrySupabase(id);
        setSpends(prev => prev.filter(s => s.id !== id));
      } catch (e) {
        showToast(e instanceof Error ? e.message : 'Could not delete');
      }
      return;
    }
    const updated = spends.filter(s => s.id !== id);
    setSpends(updated);
    saveSpends(updated);
  };

  const claimUnderBudget = () => {
    if (!canEarnUnderBudget || totalSpend === 0) return;
    if (totalSpend > dailyBudget) {
      showToast('⚠️ You need to stay under budget first!');
      return;
    }
    awardToken(TOKEN_REWARDS.UNDER_BUDGET.label, TOKEN_REWARDS.UNDER_BUDGET.label);
  };

  const cookHealthy = () => {
    if (!canEarnHealthyMeal) {
      showToast('Max 2 healthy meal tokens per day, sis!');
      return;
    }
    awardToken(TOKEN_REWARDS.HEALTHY_MEAL.label, TOKEN_REWARDS.HEALTHY_MEAL.label);
  };

  const redeemCheatDay = async () => {
    if (availableTokens < TOKENS_PER_CHEAT_DAY) {
      showToast(`Need ${TOKENS_PER_CHEAT_DAY} tokens to unlock a cheat day!`);
      return;
    }
    if (userId) {
      try {
        const newCheatDay = await redeemCheatDaySupabase(userId, TOKENS_PER_CHEAT_DAY);
        setCheatDays(prev => [newCheatDay, ...prev]);
        showToast('🎉 Cheat Day unlocked! Treat yourself, queen!');
        setRedeemConfirm(false);
      } catch (e) {
        showToast(e instanceof Error ? e.message : 'Could not redeem');
      }
      return;
    }
    const newCheatDay: CheatDay = {
      id: Date.now().toString(),
      unlockedAt: Date.now(),
      tokensSpent: TOKENS_PER_CHEAT_DAY,
    };
    const updatedDays = [...cheatDays, newCheatDay];
    setCheatDays(updatedDays);
    saveCheatDays(updatedDays);
    showToast('🎉 Cheat Day unlocked! Treat yourself, queen!');
    setRedeemConfirm(false);
  };

  const updateSnapGrade = (result: DishGradeResult | null) => {
    setSnapGrade(result);
    saveSnapGrade(result);
  };

  const handleSnapSubmit = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setSnapError(null);
    updateSnapGrade(null);
    setSnapLoading(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.includes(',') ? result.split(',')[1] : result);
        };
        reader.onerror = () => reject(reader.error ?? new Error('FileReader error'));
        reader.readAsDataURL(file);
      });
      const result = await analyzeDishImage(base64, file.type || 'image/jpeg');
      if (result) {
        const mealTypeAtScan = getMealType();
        setSnapMealType(mealTypeAtScan);
        if (userId) {
          try {
            await saveMealSnapSupabase(
              userId,
              {
                grade: result.grade,
                protein: result.protein,
                carbs: result.carbs,
                fat: result.fat,
                fiber: result.fiber,
                verdict: result.verdict,
                upgrade_tip: result.upgradeTip,
                calories: result.calories ?? 0,
              },
              mealTypeAtScan
            );
          } catch {
            // ignore save failure; grade still shown locally
          }
        }
        updateSnapGrade(result); // ← persists to sessionStorage too
      } else {
        setSnapError('Could not analyze the image. Check your API key and try again.');
      }
    } catch (err) {
      setSnapError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSnapLoading(false);
      e.target.value = '';
    }
  };

  const gradeColors: Record<string, string> = {
    'A+': 'text-sage', A: 'text-sage', 'A-': 'text-sage',
    B: 'text-sage', 'B+': 'text-sage', 'B-': 'text-primary',
    C: 'text-primary', D: 'text-accent', F: 'text-destructive',
  };

  const historyByDate = spends.reduce<Record<string, SpendEntry[]>>((acc, s) => {
    acc[s.date] = acc[s.date] ? [...acc[s.date], s] : [s];
    return acc;
  }, {});
  const sortedDates = Object.keys(historyByDate).sort((a, b) => b.localeCompare(a));

  return (
    <div className="pb-24 px-5 relative">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-foreground text-background text-sm font-semibold px-5 py-3 rounded-2xl shadow-xl animate-fade-in">
          {toastMsg}
        </div>
      )}

      {/* Tab toggle */}
      <div className="pt-8 mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-4">Track</h1>
        <div className="flex bg-card rounded-2xl p-1 border border-border">
          <button
            onClick={() => setTab('budget')}
            className={`flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
              tab === 'budget' ? 'gradient-coral text-primary-foreground' : 'text-muted-foreground'
            }`}
          >
            <IndianRupee size={16} /> Budget
          </button>
          <button
            onClick={() => setTab('snap')}
            className={`flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
              tab === 'snap' ? 'gradient-coral text-primary-foreground' : 'text-muted-foreground'
            }`}
          >
            <Camera size={16} /> Snap & Grade
          </button>
        </div>
      </div>

      {tab === 'budget' && (
        <div className="space-y-5 animate-fade-in">
          {dataLoading && (
            <p className="text-sm text-muted-foreground text-center py-2">Loading your data…</p>
          )}
          {dataError && (
            <p className="text-sm text-destructive text-center py-2">{dataError}</p>
          )}

          {/* ── Token Wallet Hero ── */}
          <div className="gradient-coral rounded-2xl p-5 text-primary-foreground">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-primary-foreground/80 text-xs font-semibold uppercase tracking-wide">Token Wallet</p>
                <div className="flex items-end gap-2 mt-1">
                  <span className="text-5xl font-black">{availableTokens}</span>
                  <span className="text-primary-foreground/70 mb-1">/ tokens</span>
                </div>
                <p className="text-primary-foreground/80 text-xs mt-1">
                  {TOKENS_PER_CHEAT_DAY - (availableTokens % TOKENS_PER_CHEAT_DAY === 0 && availableTokens > 0 ? 0 : TOKENS_PER_CHEAT_DAY - (availableTokens % TOKENS_PER_CHEAT_DAY))} more to next cheat day
                </p>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                <Coins size={32} className="text-white" />
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              {Array.from({ length: TOKENS_PER_CHEAT_DAY }).map((_, i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded-full transition-all ${
                    i < (availableTokens % TOKENS_PER_CHEAT_DAY === 0 && availableTokens > 0
                      ? TOKENS_PER_CHEAT_DAY
                      : availableTokens % TOKENS_PER_CHEAT_DAY)
                      ? 'bg-white'
                      : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
            <p className="text-primary-foreground/70 text-xs mt-2">
              {cheatDays.length} cheat day{cheatDays.length !== 1 ? 's' : ''} unlocked so far 🎉
            </p>
            <p className="text-primary-foreground/80 text-[11px] mt-2 leading-snug">
              Choose healthy hostel-made meals over ordering out to earn tokens. Collect {TOKENS_PER_CHEAT_DAY} for a guilt-free Cheat Day.
            </p>
          </div>

          {/* ── Redeem Cheat Day ── */}
          {!redeemConfirm ? (
            <button
              onClick={() => availableTokens >= TOKENS_PER_CHEAT_DAY ? setRedeemConfirm(true) : showToast(`Need ${TOKENS_PER_CHEAT_DAY} tokens to unlock!`)}
              className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-semibold text-sm transition-all ${
                availableTokens >= TOKENS_PER_CHEAT_DAY
                  ? 'bg-accent text-accent-foreground hover:opacity-90'
                  : 'bg-card border-2 border-dashed border-border text-muted-foreground'
              }`}
            >
              <Gift size={18} />
              {availableTokens >= TOKENS_PER_CHEAT_DAY
                ? `Redeem ${TOKENS_PER_CHEAT_DAY} tokens → Cheat Day! 🎊`
                : `Earn ${TOKENS_PER_CHEAT_DAY} tokens to unlock a Cheat Day`}
            </button>
          ) : (
            <div className="bg-card border-2 border-accent rounded-2xl p-4 space-y-3">
              <p className="font-semibold text-foreground text-center">Spend {TOKENS_PER_CHEAT_DAY} tokens for a guilt-free cheat day?</p>
              <div className="flex gap-3">
                <button onClick={() => setRedeemConfirm(false)} className="flex-1 py-3 rounded-xl border border-border text-sm font-medium text-foreground">Cancel</button>
                <button onClick={redeemCheatDay} className="flex-1 py-3 rounded-xl bg-accent text-accent-foreground text-sm font-semibold">Yes, treat me! 🎉</button>
              </div>
            </div>
          )}

          {/* ── Daily Budget ── */}
          <div className="bg-card rounded-2xl p-5 border border-border">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-sm text-muted-foreground mb-0.5">Today's Spend</p>
                <p className="text-3xl font-bold text-foreground">₹{totalSpend}</p>
                <p className={`text-xs mt-1 font-medium ${remaining >= 0 ? 'text-sage' : 'text-destructive'}`}>
                  {remaining >= 0 ? `₹${remaining} left of ₹${dailyBudget}` : `₹${Math.abs(remaining)} over budget!`}
                </p>
              </div>
              {totalSpend > 0 && remaining >= 0 && canEarnUnderBudget && (
                <button
                  onClick={claimUnderBudget}
                  className="px-3 py-2 rounded-xl bg-sage/20 text-sage text-xs font-semibold border border-sage/30"
                >
                  Claim token 🪙
                </button>
              )}
              {!canEarnUnderBudget && (
                <span className="text-xs text-muted-foreground">✅ Token claimed</span>
              )}
            </div>
            <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${budgetPct >= 100 ? 'bg-destructive' : budgetPct >= 75 ? 'bg-accent' : 'gradient-coral'}`}
                style={{ width: `${budgetPct}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {totalSpend === 0
                ? "Log your first meal! 🍽️"
                : budgetPct >= 100
                ? "You've hit the limit, sis! 😬"
                : budgetPct >= 75
                ? 'Approaching budget — tread carefully! 👀'
                : 'Budget queen energy! 💰'}
            </p>
          </div>

          {/* ── Add expense ── */}
          <div className="bg-card rounded-2xl p-5 border border-border space-y-3">
            <p className="font-semibold text-foreground">Add expense</p>
            <input
              type="text"
              value={spendLabel}
              onChange={e => setSpendLabel(e.target.value)}
              placeholder="What did you eat?"
              className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                <input
                  type="number"
                  value={spendInput}
                  onChange={e => setSpendInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addSpend()}
                  placeholder="Amount"
                  className="w-full pl-7 pr-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>
              <button onClick={addSpend} className="px-5 py-3 rounded-xl gradient-coral text-primary-foreground font-semibold">
                <Plus size={18} />
              </button>
            </div>
            {todaySpends.length < 3 && (
              <p className="text-xs text-muted-foreground">
                Log {3 - todaySpends.length} more meal{3 - todaySpends.length !== 1 ? 's' : ''} today to earn a streak token! 📊
              </p>
            )}
            {canEarnLoggingStreak && (
              <p className="text-xs text-sage font-medium">🎉 3 meals logged! Token auto-awarded.</p>
            )}
          </div>

          {/* ── Today's spend list ── */}
          {todaySpends.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Today</p>
              {todaySpends.map((s) => (
                <div key={s.id} className="flex justify-between items-center bg-card rounded-xl px-4 py-3 border border-border">
                  <span className="text-sm text-foreground flex-1">{s.label}</span>
                  <span className="text-sm font-semibold text-foreground mr-3">₹{s.amount}</span>
                  <button onClick={() => deleteSpend(s.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* ── Earn Tokens Section ── */}
          <div className="bg-card rounded-2xl p-5 border border-border">
            <p className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Coins size={16} className="text-primary" /> Earn Tokens Today
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground font-medium">🥗 Cook a healthy meal</p>
                  <p className="text-xs text-muted-foreground">
                    {countHealthyMealTokensToday(tokens)}/{MAX_HEALTHY_MEAL_TOKENS_PER_DAY} claimed today
                  </p>
                </div>
                <button
                  onClick={cookHealthy}
                  disabled={!canEarnHealthyMeal}
                  className="px-4 py-2 rounded-xl gradient-coral text-primary-foreground text-xs font-semibold disabled:opacity-40"
                >
                  +1 🪙
                </button>
              </div>
              <div className="h-px bg-border" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground font-medium">💰 Stay under budget</p>
                  <p className="text-xs text-muted-foreground">Spend less than ₹{dailyBudget} today</p>
                </div>
                <button
                  onClick={claimUnderBudget}
                  disabled={!canEarnUnderBudget || totalSpend === 0 || totalSpend > dailyBudget}
                  className="px-4 py-2 rounded-xl gradient-coral text-primary-foreground text-xs font-semibold disabled:opacity-40"
                >
                  {canEarnUnderBudget ? '+1 🪙' : '✅'}
                </button>
              </div>
              <div className="h-px bg-border" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground font-medium">📊 Log 3 meals</p>
                  <p className="text-xs text-muted-foreground">{todaySpends.length}/3 logged today</p>
                </div>
                <span className={`px-4 py-2 rounded-xl text-xs font-semibold ${hasEarnedLoggingStreakTokenToday(tokens) ? 'bg-sage/20 text-sage' : 'bg-muted text-muted-foreground'}`}>
                  {hasEarnedLoggingStreakTokenToday(tokens) ? '✅' : todaySpends.length >= 3 ? '🪙 Auto!' : `${todaySpends.length}/3`}
                </span>
              </div>
            </div>
          </div>

          {/* ── Spend History ── */}
          {sortedDates.length > 1 && (
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="w-full flex items-center justify-between p-4 text-sm font-semibold text-foreground"
              >
                <span>Spend History</span>
                {showHistory ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {showHistory && (
                <div className="border-t border-border divide-y divide-border">
                  {sortedDates.filter(d => d !== todayStr()).map(date => {
                    const daySpends = historyByDate[date];
                    const dayTotal = daySpends.reduce((a, b) => a + b.amount, 0);
                    return (
                      <div key={date} className="px-4 py-3">
                        <div className="flex justify-between items-center mb-1.5">
                          <p className="text-xs font-semibold text-muted-foreground">{date}</p>
                          <p className={`text-xs font-bold ${dayTotal <= dailyBudget ? 'text-sage' : 'text-destructive'}`}>
                            ₹{dayTotal} {dayTotal <= dailyBudget ? '✅' : '⚠️'}
                          </p>
                        </div>
                        {daySpends.map(s => (
                          <div key={s.id} className="flex justify-between text-xs text-muted-foreground py-0.5">
                            <span>{s.label}</span>
                            <span>₹{s.amount}</span>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── Token History ── */}
          {tokens.length > 0 && (
            <div className="bg-card rounded-2xl p-4 border border-border">
              <p className="text-sm font-semibold text-foreground mb-3">🪙 Token History</p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {[...tokens].reverse().map(t => (
                  <div key={t.id} className="flex justify-between items-center text-xs">
                    <span className="text-foreground">{t.reason}</span>
                    <span className="text-muted-foreground">{new Date(t.earnedAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'snap' && (
        <div className="space-y-5 animate-fade-in">
          <div className="bg-card rounded-2xl p-6 border border-border text-center">
            <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Camera className="text-muted-foreground" size={36} />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Photo-to-Macro</h2>
            <p className="text-sm text-muted-foreground mb-5">Upload a photo of your mess plate. The AI identifies the food and gives a Hostel Grade (A+ to F) with macros & calories.</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleSnapSubmit}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={snapLoading}
              className="w-full py-3.5 rounded-2xl gradient-coral text-primary-foreground font-semibold disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {snapLoading ? <><Loader2 className="h-5 w-5 animate-spin" /> Analyzing…</> : <>📸 Snap My Meal</>}
            </button>
            {snapGrade && !snapLoading && (
              <button
                onClick={() => updateSnapGrade(null)}
                className="mt-3 text-xs text-muted-foreground underline"
              >
                Clear &amp; snap again
              </button>
            )}
            {snapError && <p className="text-sm text-destructive text-center mt-2">{snapError}</p>}
          </div>

          {snapGrade && (
            <div className="bg-card rounded-2xl p-5 border border-border animate-fade-in">
              <div className="text-center mb-4">
                {snapMealType && (
                  <p className="text-xs text-muted-foreground mb-1">
                    Logged as {getMealEmoji(snapMealType)} {snapMealType}
                  </p>
                )}
                <p className="text-sm text-muted-foreground mb-1">Hostel Grade</p>
                <p className={`text-6xl font-black ${gradeColors[snapGrade.grade] ?? gradeColors[snapGrade.grade.replace(/[+-]$/, '')] ?? 'text-foreground'}`}>{snapGrade.grade}</p>
              </div>
              {(snapGrade.calories != null && snapGrade.calories > 0) && (
                <p className="text-center text-sm font-semibold text-foreground mb-3">🔥 ~{snapGrade.calories} kcal</p>
              )}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { label: 'Protein', value: snapGrade.protein, color: 'bg-primary', unit: 'g' },
                  { label: 'Carbs', value: snapGrade.carbs, color: 'bg-accent', unit: 'g' },
                  { label: 'Fat', value: snapGrade.fat, color: 'bg-sage', unit: 'g' },
                  { label: 'Fiber', value: snapGrade.fiber, color: 'bg-muted-foreground', unit: 'g' },
                ].map(macro => (
                  <div key={macro.label} className="bg-muted/50 rounded-xl p-3">
                    <p className="text-xs text-muted-foreground">{macro.label}</p>
                    <div className="flex items-end gap-1 mt-1">
                      <span className="text-xl font-bold text-foreground">{macro.value}</span>
                      <span className="text-xs text-muted-foreground mb-0.5">{macro.unit}</span>
                    </div>
                    <div className="w-full h-1.5 bg-muted rounded-full mt-2">
                      <div className={`h-full rounded-full ${macro.color}`} style={{ width: `${Math.min(macro.value, 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-foreground text-center">{snapGrade.verdict}</p>
              {snapGrade.upgradeTip && (
                <div className="mt-4 p-3 rounded-xl bg-primary/10 border border-primary/20">
                  <p className="text-xs font-semibold text-primary mb-1">💡 Upgrade tip</p>
                  <p className="text-sm text-foreground">{snapGrade.upgradeTip}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TrackPage;