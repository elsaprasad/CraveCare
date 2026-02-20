import { useState, useMemo } from 'react';
import { UserProfile, getCurrentPhase, PHASES, MOCK_RECIPES, MOM_TIPS, getFallbackRecipe, Recipe } from '@/lib/cravecare-data';
import { generateRecipeWithGemini } from '@/lib/gemini-service';
import { Sparkles, Search, Clock, Flame, X, Loader2 } from 'lucide-react';

interface DashboardProps {
  profile: UserProfile;
}

const Dashboard = ({ profile }: DashboardProps) => {
  const [search, setSearch] = useState('');
  const [filterAppliance, setFilterAppliance] = useState<string | null>(null);
  const [aiRecipe, setAiRecipe] = useState<Recipe | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const phase = getCurrentPhase(profile.lastPeriodDate);
  const phaseInfo = PHASES[phase];
  const momTip = useMemo(() => MOM_TIPS[Math.floor(Math.random() * MOM_TIPS.length)], []);

  const recipes = MOCK_RECIPES.filter(r => {
    const matchesAppliance = !filterAppliance || r.appliance === filterAppliance;
    const ownsAppliance = profile.appliances.includes(r.appliance);
    const matchesSearch = !search || r.name.toLowerCase().includes(search.toLowerCase());
    return matchesAppliance && ownsAppliance && matchesSearch;
  });

  const handleGenerateAI = async () => {
    const appliance = filterAppliance || profile.appliances[0] || 'kettle';
    setIsGenerating(true);
    setGenerationError(null);
    setAiRecipe(null);

    try {
      // Try to generate with Gemini AI
      const geminiRecipe = await generateRecipeWithGemini({
        appliance,
        phase,
        userPreferences: {
          hasPCOS: profile.hasPCOS,
          primaryGoal: profile.primaryGoal,
          budget: profile.dailyBudget,
        },
      });

      if (geminiRecipe) {
        setAiRecipe(geminiRecipe);
      } else {
        // Fallback to hard-coded recipe
        const fallbackRecipe = getFallbackRecipe(appliance, phase);
        setAiRecipe(fallbackRecipe);
        setGenerationError('Using fallback recipe. Add VITE_GEMINI_API_KEY to .env for AI-generated recipes.');
      }
    } catch (error) {
      console.error('Error generating recipe:', error);
      // Use fallback recipe on error
      const fallbackRecipe = getFallbackRecipe(appliance, phase);
      setAiRecipe(fallbackRecipe);
      setGenerationError('Failed to generate AI recipe. Using fallback recipe.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="pb-24">
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
          >
            All
          </button>
          {profile.appliances.map(a => {
            const appliance = { kettle: '☕ Kettle', induction: '🍳 Induction', 'sandwich-maker': '🥪 Sandwich', fridge: '❄️ Fridge' }[a];
            return (
              <button
                key={a}
                onClick={() => setFilterAppliance(a === filterAppliance ? null : a)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  filterAppliance === a ? 'gradient-coral text-primary-foreground' : 'bg-card border border-border text-foreground'
                }`}
              >
                {appliance}
              </button>
            );
          })}
        </div>

        {/* AI Generate */}
        <button
          onClick={handleGenerateAI}
          disabled={isGenerating}
          className="w-full py-3.5 rounded-2xl border-2 border-dashed border-primary/40 text-primary font-semibold flex items-center justify-center gap-2 hover:bg-coral-light/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <Loader2 size={18} className="animate-spin" /> Generating...
            </>
          ) : (
            <>
              <Sparkles size={18} /> Generate AI Recipe
            </>
          )}
        </button>

        {/* Error message */}
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
            <p className="text-sm text-foreground mt-3">
              <strong>Ingredients:</strong> {aiRecipe.ingredients.join(', ')}
            </p>
            <div className="mt-3">
              <strong className="text-sm text-foreground">Steps:</strong>
              <ol className="list-decimal list-inside text-sm text-muted-foreground mt-1 space-y-1">
                {aiRecipe.steps.map((s, i) => <li key={i}>{s}</li>)}
              </ol>
            </div>
          </div>
        )}

        {/* Recipe List */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-foreground">Recipes for You</h2>
          {recipes.length === 0 && (
            <p className="text-muted-foreground text-sm py-4 text-center">No recipes match your filters. Try the AI generator! ✨</p>
          )}
          {recipes.map(recipe => (
            <button
              key={recipe.id}
              onClick={() => setSelectedRecipe(recipe)}
              className="w-full bg-card rounded-2xl p-4 border border-border hover:border-primary/30 transition-all text-left"
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl">{recipe.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground">{recipe.name}</p>
                  <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock size={12} /> {recipe.time}</span>
                    <span className="flex items-center gap-1"><Flame size={12} /> {recipe.calories} cal</span>
                    <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{recipe.keyNutrient}</span>
                  </div>
                </div>
              </div>
            </button>
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
            <button
              onClick={() => setSelectedRecipe(null)}
              className="w-full mt-6 py-3.5 rounded-2xl gradient-coral text-primary-foreground font-semibold"
            >
              Got it, let's cook! 🍳
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
