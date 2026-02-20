import { useState, useMemo, useEffect } from 'react';
import {
  UserProfile, getCurrentPhase, PHASES, MOCK_RECIPES,
  MOM_TIPS, getFallbackRecipe, Recipe,
  loadTokens, loadCheatDays, loadSpends, getTodaySpends, TOKENS_PER_CHEAT_DAY,
} from '@/lib/cravecare-data';
import {
  getSpendEntries, getTokens, getCheatDays, addGroceryItems,
} from '@/lib/supabase-service';
import { generateRecipeWithGemini } from '@/lib/gemini-service';
import { Sparkles, Search, Clock, Flame, X, Loader2, Coins, ShoppingCart } from 'lucide-react';

interface DashboardProps {
  profile: UserProfile;
  userId?: string | null;
  onNavigateToGrocery?: () => void;
}

const Dashboard = ({ profile, userId, onNavigateToGrocery }: DashboardProps) => {
  const [search, setSearch] = useState('');
  const [filterAppliance, setFilterAppliance] = useState<string | null>(null);
  const [aiRecipe, setAiRecipe] = useState<Recipe | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [addingToGrocery, setAddingToGrocery] = useState<string | null>(null);
  const [groceryToast, setGroceryToast] = useState<string | null>(null);

  const [spends, setSpends] = useState<any[]>(() => (userId ? [] : loadSpends()));
  const [tokens, setTokens] = useState<any[]>(() => (userId ? [] : loadTokens()));
  const [cheatDays, setCheatDays] = useState<any[]>(() => (userId ? [] : loadCheatDays()));

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      try {
        const [s, t, c] = await Promise.all([
          getSpendEntries(userId), getTokens(userId), getCheatDays(userId),
        ]);
        if (!cancelled) { setSpends(s); setTokens(t); setCheatDays(c); }
      } catch { /* keep empty */ }
    })();
    return () => { cancelled = true; };
  }, [userId]);

  const phase = getCurrentPhase(profile.lastPeriodDate);
  const phaseInfo = PHASES[phase];
  const momTip = useMemo(() => MOM_TIPS[Math.floor(Math.random() * MOM_TIPS.length)], []);

  const todaySpends = getTodaySpends(spends);
  const todayTotal = todaySpends.reduce((a: number, b: any) => a + b.amount, 0);
  const tokensSpentTotal = cheatDays.reduce((a: number, b: any) => a + (b.tokensSpent ?? 0), 0);
  const availableTokens = tokens.length - tokensSpentTotal;
  const remaining = profile.dailyBudget - todayTotal;

  const recipes = MOCK_RECIPES.filter(r => {
    const matchesAppliance = !filterAppliance || r.appliance === filterAppliance;
    const ownsAppliance = profile.appliances.includes(r.appliance);
    const matchesSearch = !search || r.name.toLowerCase().includes(search.toLowerCase());
    return matchesAppliance && ownsAppliance && matchesSearch;
  });

  function showGroceryToast(msg: string) {
    setGroceryToast(msg);
    setTimeout(() => setGroceryToast(null), 3500);
  }

  const handleAddToGrocery = async (recipe: Recipe) => {
    if (!userId) return;
    setAddingToGrocery(recipe.id);
    try {
      await addGroceryItems(
        userId,
        recipe.ingredients.map(ing => ({
          name: ing,
          sourceRecipeName: recipe.name,
          sourceRecipeEmoji: recipe.emoji,
        }))
      );
      showGroceryToast(`🛒 ${recipe.ingredients.length} items added!`);
    } catch {
      showGroceryToast('Could not add to list. Try again.');
    } finally {
      setAddingToGrocery(null);
    }
  };

  const handleGenerateAI = async () => {
    const appliance = filterAppliance || profile.appliances[0] || 'kettle';
    setIsGenerating(true);
    setGenerationError(null);
    setAiRecipe(null);
    try {
      const geminiRecipe = await generateRecipeWithGemini({
        appliance, phase,
        userPreferences: { hasPCOS: profile.hasPCOS, primaryGoal: profile.primaryGoal, budget: profile.dailyBudget },
      });
      if (geminiRecipe) {
        setAiRecipe(geminiRecipe);
      } else {
        setAiRecipe(getFallbackRecipe(appliance, phase));
        setGenerationError('Using fallback recipe. Add VITE_GEMINI_API_KEY to .env for AI-generated recipes.');
      }
    } catch {
      setAiRecipe(getFallbackRecipe(appliance, phase));
      setGenerationError('Failed to generate AI recipe. Using fallback recipe.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="pb-24">
      {/* Grocery toast */}
      {groceryToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-foreground text-background text-sm font-semibold px-5 py-3 rounded-2xl shadow-xl animate-fade-in flex items-center gap-3 max-w-xs text-center">
          <span>{groceryToast}</span>
          {onNavigateToGrocery && (
            <button onClick={onNavigateToGrocery} className="underline whitespace-nowrap text-xs opacity-80">
              View →
            </button>
          )}
        </div>
      )}

      {/* Header */}
      <div className="gradient-coral px-6 pt-8 pb-6 rounded-b-3xl">
        <p className="text-primary-foreground/80 text-sm font-medium">Hey, {profile.name}! 👋</p>
        <h1 className="text-2xl font-bold text-primary-foreground mt-1">Your {phaseInfo.name} Phase</h1>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-2xl">{phaseInfo.emoji}</span>
          <span className="text-primary-foreground/90 text-sm">{phaseInfo.days}</span>
        </div>
      </div>

      <div className="px-5 -mt-4 space-y-5">
        {/* Phase Card */}
        <div className="bg-card rounded-2xl p-5 shadow-lg border border-border">
          <p className="text-sm font-medium text-muted-foreground mb-1">Current Need</p>
          <p className="text-lg font-bold text-foreground">You need {phaseInfo.nutrient} 💪</p>
          <p className="text-sm text-muted-foreground mt-2">{phaseInfo.tip}</p>
        </div>

        {/* Budget + Token Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card rounded-2xl p-4 border border-border">
            <p className="text-xs text-muted-foreground mb-1">Today's Budget</p>
            <p className="text-xl font-bold text-foreground">₹{todayTotal}</p>
            <p className={`text-xs mt-1 font-medium ${remaining >= 0 ? 'text-sage' : 'text-destructive'}`}>
              {remaining >= 0 ? `₹${remaining} left` : `₹${Math.abs(remaining)} over`}
            </p>
            <div className="w-full h-1.5 bg-muted rounded-full mt-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${remaining < 0 ? 'bg-destructive' : 'gradient-coral'}`}
                style={{ width: `${Math.min((todayTotal / profile.dailyBudget) * 100, 100)}%` }}
              />
            </div>
          </div>
          <div className="bg-card rounded-2xl p-4 border border-border">
            <p className="text-xs text-muted-foreground mb-1">Cheat Tokens</p>
            <div className="flex items-center gap-1.5">
              <Coins size={18} className="text-primary" />
              <p className="text-xl font-bold text-foreground">{availableTokens}</p>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {availableTokens >= TOKENS_PER_CHEAT_DAY
                ? '🎉 Ready to redeem!'
                : `${TOKENS_PER_CHEAT_DAY - (availableTokens % TOKENS_PER_CHEAT_DAY)} to next cheat day`}
            </p>
            <div className="flex gap-1 mt-2">
              {Array.from({ length: TOKENS_PER_CHEAT_DAY }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full ${
                    i < (availableTokens % TOKENS_PER_CHEAT_DAY) ||
                    (availableTokens >= TOKENS_PER_CHEAT_DAY && availableTokens % TOKENS_PER_CHEAT_DAY === 0)
                      ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Mom's Tip */}
        <div className="bg-rose-light/40 rounded-2xl p-4 border border-rose/20">
          <p className="text-xs font-semibold text-accent mb-1">🧡 Mom's Secret</p>
          <p className="text-sm text-foreground">{momTip}</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search recipes..."
            className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Appliance filter */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setFilterAppliance(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              !filterAppliance ? 'gradient-coral text-primary-foreground' : 'bg-card border border-border text-foreground'
            }`}
          >All</button>
          {profile.appliances.map(a => {
            const label: Record<string, string> = { kettle: '☕ Kettle', induction: '🍳 Induction', 'sandwich-maker': '🥪 Sandwich', fridge: '❄️ Fridge' };
            return (
              <button
                key={a}
                onClick={() => setFilterAppliance(a === filterAppliance ? null : a)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  filterAppliance === a ? 'gradient-coral text-primary-foreground' : 'bg-card border border-border text-foreground'
                }`}
              >{label[a]}</button>
            );
          })}
        </div>

        {/* AI Generate */}
        <button
          onClick={handleGenerateAI}
          disabled={isGenerating}
          className="w-full py-3.5 rounded-2xl border-2 border-dashed border-primary/40 text-primary font-semibold flex items-center justify-center gap-2 hover:bg-coral-light/20 transition-colors disabled:opacity-50"
        >
          {isGenerating ? <><Loader2 size={18} className="animate-spin" /> Generating...</> : <><Sparkles size={18} /> Generate AI Recipe</>}
        </button>

        {generationError && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-3 text-sm text-yellow-800 dark:text-yellow-200">
            {generationError}
          </div>
        )}

        {/* AI Recipe */}
        {aiRecipe && (
          <div className="bg-coral-light/30 rounded-2xl p-5 border border-primary/20 animate-fade-in">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-primary mb-1">✨ AI Suggestion</p>
                <p className="text-lg font-bold text-foreground">{aiRecipe.emoji} {aiRecipe.name}</p>
              </div>
              <button onClick={() => setAiRecipe(null)} className="text-muted-foreground"><X size={18} /></button>
            </div>
            <div className="flex gap-4 mt-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Clock size={14} /> {aiRecipe.time}</span>
              <span className="flex items-center gap-1"><Flame size={14} /> {aiRecipe.calories} cal</span>
            </div>
            <p className="text-sm text-foreground mt-3"><strong>Ingredients:</strong> {aiRecipe.ingredients.join(', ')}</p>
            <div className="mt-3">
              <strong className="text-sm text-foreground">Steps:</strong>
              <ol className="list-decimal list-inside text-sm text-muted-foreground mt-1 space-y-1">
                {aiRecipe.steps.map((s, i) => <li key={i}>{s}</li>)}
              </ol>
            </div>
            {userId && (
              <button
                onClick={() => handleAddToGrocery(aiRecipe)}
                disabled={addingToGrocery === aiRecipe.id}
                className="mt-4 w-full py-2.5 rounded-xl border border-primary/30 text-primary text-sm font-semibold flex items-center justify-center gap-2 hover:bg-primary/5 transition-colors disabled:opacity-50"
              >
                {addingToGrocery === aiRecipe.id ? <Loader2 size={14} className="animate-spin" /> : <ShoppingCart size={14} />}
                Add ingredients to grocery list
              </button>
            )}
          </div>
        )}

        {/* Recipe List */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-foreground">Recipes for You</h2>
          {recipes.length === 0 && (
            <p className="text-muted-foreground text-sm py-4 text-center">No recipes match your filters. Try the AI generator! ✨</p>
          )}
          {recipes.map(recipe => (
            <div key={recipe.id} className="bg-card rounded-2xl border border-border hover:border-primary/30 transition-all overflow-hidden">
              <button onClick={() => setSelectedRecipe(recipe)} className="w-full p-4 text-left">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{recipe.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground">{recipe.name}</p>
                    <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock size={12} /> {recipe.time}</span>
                      <span className="flex items-center gap-1"><Flame size={12} /> {recipe.calories} cal</span>
                      <span className="px-2 py-0.5 rounded-full bg-muted">{recipe.keyNutrient}</span>
                    </div>
                  </div>
                </div>
              </button>
              {userId && (
                <div className="border-t border-border/60 px-4 py-2.5 flex justify-end">
                  <button
                    onClick={() => handleAddToGrocery(recipe)}
                    disabled={addingToGrocery === recipe.id}
                    className="text-xs font-semibold text-primary flex items-center gap-1.5 hover:opacity-70 transition-opacity disabled:opacity-40"
                  >
                    {addingToGrocery === recipe.id ? <Loader2 size={12} className="animate-spin" /> : <ShoppingCart size={12} />}
                    Add to grocery list
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <div className="fixed inset-0 bg-foreground/40 z-50 flex items-end" onClick={() => setSelectedRecipe(null)}>
          <div className="bg-background w-full rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-4" />
            <div className="text-4xl mb-3">{selectedRecipe.emoji}</div>
            <h2 className="text-2xl font-bold text-foreground">{selectedRecipe.name}</h2>
            <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Clock size={14} /> {selectedRecipe.time}</span>
              <span className="flex items-center gap-1"><Flame size={14} /> {selectedRecipe.calories} cal</span>
              <span className="px-2 py-0.5 rounded-full bg-muted">{selectedRecipe.keyNutrient}</span>
            </div>
            <div className="mt-5">
              <h3 className="font-semibold text-foreground mb-2">Ingredients</h3>
              <ul className="space-y-1">
                {selectedRecipe.ingredients.map((ing, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full gradient-coral" /> {ing}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-5">
              <h3 className="font-semibold text-foreground mb-2">Steps</h3>
              <ol className="space-y-2">
                {selectedRecipe.steps.map((s, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex gap-3">
                    <span className="w-6 h-6 rounded-full gradient-coral text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                    {s}
                  </li>
                ))}
              </ol>
            </div>
            <div className="flex gap-3 mt-6">
              {userId && (
                <button
                  onClick={() => { handleAddToGrocery(selectedRecipe); setSelectedRecipe(null); }}
                  disabled={addingToGrocery === selectedRecipe.id}
                  className="flex-1 py-3.5 rounded-2xl border-2 border-primary text-primary font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <ShoppingCart size={16} /> Add to list
                </button>
              )}
              <button
                onClick={() => setSelectedRecipe(null)}
                className="flex-1 py-3.5 rounded-2xl gradient-coral text-primary-foreground font-semibold"
              >
                Let's cook! 🍳
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;