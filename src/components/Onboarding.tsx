import { useState } from 'react';
import { APPLIANCES, GOALS } from '@/lib/cravecare-data';
import { UserProfile } from '@/lib/cravecare-data';
import { ChefHat, ArrowRight, ArrowLeft, Sparkles, Coins } from 'lucide-react';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
  /** When set (Supabase auth flow), profile is saved to Supabase by the parent; no localStorage. */
  userId?: string;
}

const BUDGET_PRESETS = [100, 150, 200, 300];

const Onboarding = ({ onComplete, userId }: OnboardingProps) => {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [appliances, setAppliances] = useState<string[]>([]);
  const [lastPeriodDate, setLastPeriodDate] = useState('');
  const [hasPCOS, setHasPCOS] = useState(false);
  const [primaryGoal, setPrimaryGoal] = useState('');
  const [dailyBudget, setDailyBudget] = useState(200);
  const [customBudget, setCustomBudget] = useState('');

  const toggleAppliance = (id: string) => {
    setAppliances(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
  };

  const canProceed = () => {
    if (step === 0) return name.trim().length > 0;
    if (step === 1) return appliances.length > 0;
    if (step === 2) return lastPeriodDate && primaryGoal;
    if (step === 3) return dailyBudget > 0;
    return true;
  };

  const handleFinish = () => {
    const profile: UserProfile = {
      name, appliances, lastPeriodDate, hasPCOS, primaryGoal,
      dailyBudget, cheatDayProgress: 0,
    };
    if (!userId) {
      localStorage.setItem('cravecare-profile', JSON.stringify(profile));
    }
    onComplete(profile);
  };

  const handleCustomBudget = (val: string) => {
    setCustomBudget(val);
    const parsed = parseInt(val);
    if (!isNaN(parsed) && parsed > 0) setDailyBudget(parsed);
  };

  const TOTAL_STEPS = 4;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress */}
      <div className="px-6 pt-8 pb-4">
        <div className="flex gap-2">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= step ? 'gradient-coral' : 'bg-muted'}`} />
          ))}
        </div>
      </div>

      <div className="flex-1 px-6 flex flex-col animate-fade-in" key={step}>
        {step === 0 && (
          <>
            <div className="mt-8 mb-6">
              <div className="w-16 h-16 rounded-3xl gradient-coral flex items-center justify-center mb-6">
                <ChefHat className="text-primary-foreground" size={32} />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Hey, queen! 👋</h1>
              <p className="text-muted-foreground text-lg">Let's set up your CraveCare profile. What should we call you?</p>
            </div>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name, sis..."
              className="w-full px-5 py-4 rounded-2xl bg-card border border-border text-foreground text-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </>
        )}

        {step === 1 && (
          <>
            <div className="mt-8 mb-6">
              <h1 className="text-3xl font-bold text-foreground mb-2">Your kitchen arsenal 🍳</h1>
              <p className="text-muted-foreground text-lg">What appliances do you have? We'll find recipes that actually work for you.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {APPLIANCES.map(a => (
                <button
                  key={a.id}
                  onClick={() => toggleAppliance(a.id)}
                  className={`p-5 rounded-2xl border-2 text-left transition-all duration-200 ${
                    appliances.includes(a.id)
                      ? 'border-primary bg-coral-light/30'
                      : 'border-border bg-card hover:border-primary/40'
                  }`}
                >
                  <span className="text-3xl mb-2 block">{a.emoji}</span>
                  <span className="font-semibold text-foreground">{a.name}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="mt-8 mb-6">
              <h1 className="text-3xl font-bold text-foreground mb-2">Health profile 💖</h1>
              <p className="text-muted-foreground text-lg">This helps us sync recipes to your cycle. Everything stays private!</p>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Last period start date</label>
                <input
                  type="date"
                  value={lastPeriodDate}
                  onChange={e => setLastPeriodDate(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl bg-card border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border">
                <div>
                  <p className="font-semibold text-foreground">PCOS</p>
                  <p className="text-sm text-muted-foreground">We'll tailor nutrition accordingly</p>
                </div>
                <button
                  onClick={() => setHasPCOS(!hasPCOS)}
                  className={`w-14 h-8 rounded-full transition-all duration-200 ${hasPCOS ? 'gradient-coral' : 'bg-muted'}`}
                >
                  <div className={`w-6 h-6 rounded-full bg-primary-foreground shadow-md transition-transform duration-200 ${hasPCOS ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Primary goal</label>
                <div className="flex flex-wrap gap-2">
                  {GOALS.map(g => (
                    <button
                      key={g.id}
                      onClick={() => setPrimaryGoal(g.id)}
                      className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                        primaryGoal === g.id
                          ? 'gradient-coral text-primary-foreground'
                          : 'bg-card border border-border text-foreground hover:border-primary/40'
                      }`}
                    >
                      {g.emoji} {g.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="mt-8 mb-6">
              <div className="w-16 h-16 rounded-3xl gradient-coral flex items-center justify-center mb-6">
                <Coins className="text-primary-foreground" size={32} />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Set your daily budget 💰</h1>
              <p className="text-muted-foreground text-lg">
                Stay under it to earn <span className="text-primary font-semibold">Cheat Day tokens</span>. Choose healthy hostel-made meals over ordering out to earn tokens — collect 5 tokens = 1 guilt-free cheat day! 🎉
              </p>
            </div>

            {/* Presets */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {BUDGET_PRESETS.map(b => (
                <button
                  key={b}
                  onClick={() => { setDailyBudget(b); setCustomBudget(''); }}
                  className={`py-3 rounded-xl text-sm font-semibold transition-all ${
                    dailyBudget === b && !customBudget
                      ? 'gradient-coral text-primary-foreground'
                      : 'bg-card border border-border text-foreground'
                  }`}
                >
                  ₹{b}
                </button>
              ))}
            </div>

            {/* Custom input */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">₹</span>
              <input
                type="number"
                value={customBudget}
                onChange={e => handleCustomBudget(e.target.value)}
                placeholder="Custom amount..."
                className="w-full pl-8 pr-5 py-4 rounded-2xl bg-card border border-border text-foreground text-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* How tokens work */}
            <div className="mt-6 bg-coral-light/30 rounded-2xl p-4 border border-primary/20 space-y-2">
              <p className="text-sm font-bold text-foreground">How you earn tokens 🪙</p>
              <p className="text-sm text-muted-foreground">💰 Stay under your daily budget → +1 token</p>
              <p className="text-sm text-muted-foreground">🥗 Cook a healthy meal → +1 token (max 2/day)</p>
              <p className="text-sm text-muted-foreground">📊 Log 3+ meals in a day → +1 token</p>
              <p className="text-sm font-semibold text-primary mt-2">5 tokens = 1 Cheat Day unlocked! 🎊</p>
            </div>
          </>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="px-6 pb-8 pt-4 flex gap-3">
        {step > 0 && (
          <button
            onClick={() => setStep(s => s - 1)}
            className="px-6 py-4 rounded-2xl border border-border text-foreground font-medium"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <button
          onClick={() => step < TOTAL_STEPS - 1 ? setStep(s => s + 1) : handleFinish()}
          disabled={!canProceed()}
          className="flex-1 py-4 rounded-2xl gradient-coral text-primary-foreground font-semibold text-lg flex items-center justify-center gap-2 disabled:opacity-40 transition-opacity"
        >
          {step < TOTAL_STEPS - 1 ? (
            <>Continue <ArrowRight size={20} /></>
          ) : (
            <>Let's Cook! <Sparkles size={20} /></>
          )}
        </button>
      </div>
    </div>
  );
};

export default Onboarding;