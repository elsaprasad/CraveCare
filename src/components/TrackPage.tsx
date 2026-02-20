import { useState } from 'react';
import { Camera, IndianRupee, Plus, TrendingUp } from 'lucide-react';

const TrackPage = () => {
  const [tab, setTab] = useState<'budget' | 'snap'>('budget');
  const [spendInput, setSpendInput] = useState('');
  const [spends, setSpends] = useState<{ label: string; amount: number }[]>(() => {
    try {
      const stored = localStorage.getItem('cravecare-spends');
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });
  const [cheatDay, setCheatDay] = useState(() => {
    try { return parseInt(localStorage.getItem('cravecare-cheatday') || '0'); } catch { return 0; }
  });
  const [spendLabel, setSpendLabel] = useState('');
  const [snapGrade, setSnapGrade] = useState<null | { grade: string; protein: number; carbs: number; fat: number; fiber: number; verdict: string }>(null);

  const totalSpend = spends.reduce((a, b) => a + b.amount, 0);

  const addSpend = () => {
    const amount = parseFloat(spendInput);
    if (isNaN(amount) || amount <= 0) return;
    const newSpends = [...spends, { label: spendLabel || 'Food', amount }];
    setSpends(newSpends);
    localStorage.setItem('cravecare-spends', JSON.stringify(newSpends));
    setSpendInput('');
    setSpendLabel('');
  };

  const cookHealthy = () => {
    const next = Math.min(cheatDay + 1, 7);
    setCheatDay(next);
    localStorage.setItem('cravecare-cheatday', String(next));
  };

  const mockSnap = () => {
    const grades = [
      { grade: 'A', protein: 28, carbs: 45, fat: 12, fiber: 8, verdict: 'Amazing! You\'re eating like a nutritionist, sis! 🌟' },
      { grade: 'B', protein: 18, carbs: 55, fat: 20, fiber: 5, verdict: 'Pretty solid! Maybe add some protein next time 💪' },
      { grade: 'C', protein: 10, carbs: 65, fat: 25, fiber: 3, verdict: 'Not bad, but your body deserves better fuel! 🔥' },
      { grade: 'D', protein: 5, carbs: 70, fat: 30, fiber: 2, verdict: 'Hmm... was this Maggi at 2AM? We\'ve all been there 😅' },
      { grade: 'F', protein: 2, carbs: 80, fat: 35, fiber: 1, verdict: 'Okay sis, this is a cry for help. Let me suggest a recipe! 🆘' },
    ];
    setSnapGrade(grades[Math.floor(Math.random() * grades.length)]);
  };

  const gradeColors: Record<string, string> = {
    A: 'text-sage', B: 'text-sage', C: 'text-primary', D: 'text-accent', F: 'text-destructive',
  };

  return (
    <div className="pb-24 px-5">
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
          {/* Daily spend */}
          <div className="bg-card rounded-2xl p-5 border border-border">
            <p className="text-sm text-muted-foreground mb-1">Today's Food Spend</p>
            <p className="text-3xl font-bold text-foreground">₹{totalSpend}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {totalSpend > 200
                ? "Don't go bankrupt on Zomato today, sis! 😬"
                : totalSpend > 100
                ? 'Keeping it reasonable! 👍'
                : 'Budget queen energy! 💰'}
            </p>
          </div>

          {/* Add spend */}
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
                  placeholder="Amount"
                  className="w-full pl-7 pr-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>
              <button onClick={addSpend} className="px-5 py-3 rounded-xl gradient-coral text-primary-foreground font-semibold">
                <Plus size={18} />
              </button>
            </div>
          </div>

          {/* Spend list */}
          {spends.length > 0 && (
            <div className="space-y-2">
              {spends.map((s, i) => (
                <div key={i} className="flex justify-between items-center bg-card rounded-xl px-4 py-3 border border-border">
                  <span className="text-sm text-foreground">{s.label}</span>
                  <span className="text-sm font-semibold text-foreground">₹{s.amount}</span>
                </div>
              ))}
            </div>
          )}

          {/* Cheat Day Progress */}
          <div className="bg-card rounded-2xl p-5 border border-border">
            <div className="flex justify-between items-center mb-3">
              <div>
                <p className="font-semibold text-foreground flex items-center gap-2"><TrendingUp size={16} /> Cheat Day Meter</p>
                <p className="text-xs text-muted-foreground mt-1">Cook 7 healthy meals to earn a guilt-free cheat day!</p>
              </div>
              <span className="text-sm font-bold text-primary">{cheatDay}/7</span>
            </div>
            <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full gradient-coral rounded-full transition-all duration-500"
                style={{ width: `${(cheatDay / 7) * 100}%` }}
              />
            </div>
            {cheatDay >= 7 ? (
              <p className="text-sm text-primary font-semibold mt-3">🎉 You earned a cheat day! Treat yourself, queen!</p>
            ) : (
              <button
                onClick={cookHealthy}
                className="mt-3 w-full py-3 rounded-xl border-2 border-dashed border-primary/40 text-primary text-sm font-semibold hover:bg-coral-light/20 transition-colors"
              >
                I cooked a healthy meal! 🍳
              </button>
            )}
          </div>
        </div>
      )}

      {tab === 'snap' && (
        <div className="space-y-5 animate-fade-in">
          <div className="bg-card rounded-2xl p-6 border border-border text-center">
            <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Camera className="text-muted-foreground" size={36} />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Snap & Grade</h2>
            <p className="text-sm text-muted-foreground mb-5">Upload a photo of your meal and get a Hostel Grade!</p>
            <button
              onClick={mockSnap}
              className="w-full py-3.5 rounded-2xl gradient-coral text-primary-foreground font-semibold"
            >
              📸 Snap My Meal
            </button>
          </div>

          {snapGrade && (
            <div className="bg-card rounded-2xl p-5 border border-border animate-fade-in">
              <div className="text-center mb-4">
                <p className="text-sm text-muted-foreground mb-1">Hostel Grade</p>
                <p className={`text-6xl font-black ${gradeColors[snapGrade.grade] || 'text-foreground'}`}>{snapGrade.grade}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { label: 'Protein', value: snapGrade.protein, color: 'bg-primary' },
                  { label: 'Carbs', value: snapGrade.carbs, color: 'bg-accent' },
                  { label: 'Fat', value: snapGrade.fat, color: 'bg-sage' },
                  { label: 'Fiber', value: snapGrade.fiber, color: 'bg-muted-foreground' },
                ].map(macro => (
                  <div key={macro.label} className="bg-muted/50 rounded-xl p-3">
                    <p className="text-xs text-muted-foreground">{macro.label}</p>
                    <div className="flex items-end gap-1 mt-1">
                      <span className="text-xl font-bold text-foreground">{macro.value}</span>
                      <span className="text-xs text-muted-foreground mb-0.5">g</span>
                    </div>
                    <div className="w-full h-1.5 bg-muted rounded-full mt-2">
                      <div className={`h-full rounded-full ${macro.color}`} style={{ width: `${Math.min(macro.value, 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-sm text-foreground text-center">{snapGrade.verdict}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TrackPage;
