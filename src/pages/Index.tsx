import { useState, useEffect } from 'react';
import { UserProfile } from '@/lib/cravecare-data';
import Onboarding from '@/components/Onboarding';
import Dashboard from '@/components/Dashboard';
import TrackPage from '@/components/TrackPage';
import ProfilePage from '@/components/ProfilePage';
import BottomNav from '@/components/BottomNav';

const Index = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('cravecare-profile');
      if (stored) setProfile(JSON.parse(stored));
    } catch {}
  }, []);

  const handleOnboardingComplete = (p: UserProfile) => {
    setProfile(p);
  };

  const handleLogout = () => {
    localStorage.clear();
    setProfile(null);
    setActiveTab('home');
  };

  if (!profile) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto">
      {activeTab === 'home' && <Dashboard profile={profile} />}
      {activeTab === 'track' && <TrackPage />}
      {activeTab === 'profile' && <ProfilePage profile={profile} onLogout={handleLogout} />}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
