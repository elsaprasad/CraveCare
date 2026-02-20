import { UserProfile, PHASES, getCurrentPhase, APPLIANCES, GOALS } from '@/lib/cravecare-data';
import { User, Heart, Target, LogOut } from 'lucide-react';

interface ProfilePageProps {
  profile: UserProfile;
  onLogout: () => void;
}

const ProfilePage = ({ profile, onLogout }: ProfilePageProps) => {
  const phase = getCurrentPhase(profile.lastPeriodDate);
  const phaseInfo = PHASES[phase];
  const goal = GOALS.find(g => g.id === profile.primaryGoal);

  return (
    <div className="pb-24 px-5">
      <div className="pt-8 mb-6">
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>
      </div>

      <div className="space-y-4">
        {/* User card */}
        <div className="bg-card rounded-2xl p-6 border border-border text-center">
          <div className="w-20 h-20 rounded-3xl gradient-coral flex items-center justify-center mx-auto mb-3">
            <User className="text-primary-foreground" size={36} />
          </div>
          <h2 className="text-xl font-bold text-foreground">{profile.name}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {phaseInfo.emoji} {phaseInfo.name} Phase • {phaseInfo.days}
          </p>
        </div>

        {/* Appliances */}
        <div className="bg-card rounded-2xl p-5 border border-border">
          <p className="font-semibold text-foreground mb-3 flex items-center gap-2">
            🍳 My Appliances
          </p>
          <div className="flex flex-wrap gap-2">
            {profile.appliances.map(a => {
              const app = APPLIANCES.find(ap => ap.id === a);
              return (
                <span key={a} className="px-3 py-1.5 rounded-full bg-muted text-sm text-foreground">
                  {app?.emoji} {app?.name}
                </span>
              );
            })}
          </div>
        </div>

        {/* Health */}
        <div className="bg-card rounded-2xl p-5 border border-border space-y-3">
          <p className="font-semibold text-foreground flex items-center gap-2">
            <Heart size={16} className="text-accent" /> Health Profile
          </p>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">PCOS</span>
            <span className="text-foreground font-medium">{profile.hasPCOS ? 'Yes' : 'No'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Last Period</span>
            <span className="text-foreground font-medium">{new Date(profile.lastPeriodDate).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Goal */}
        <div className="bg-card rounded-2xl p-5 border border-border">
          <p className="font-semibold text-foreground flex items-center gap-2">
            <Target size={16} className="text-primary" /> Primary Goal
          </p>
          <p className="text-sm text-muted-foreground mt-2">{goal?.emoji} {goal?.name}</p>
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="w-full py-3.5 rounded-2xl border border-destructive/30 text-destructive font-semibold flex items-center justify-center gap-2 hover:bg-destructive/5 transition-colors"
        >
          <LogOut size={18} /> Reset Profile
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
