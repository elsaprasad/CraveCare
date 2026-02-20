import { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { supabase } from '@/lib/supabase';
import { getProfile, getSession, signOut, createProfile, mapProfileToUserProfile } from '@/lib/auth-service';
import type { UserProfile } from '@/lib/cravecare-data';
import AuthPage from '@/components/AuthPage';
import Onboarding from '@/components/Onboarding';
import Dashboard from '@/components/Dashboard';
import TrackPage from '@/components/TrackPage';
import GroceryListPage from '@/components/GroceryListPage';
import ProfilePage from '@/components/ProfilePage';
import BottomNav from '@/components/BottomNav';
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

type AppState = 'loading' | 'auth' | 'onboarding' | 'app';
type Tab = 'home' | 'track' | 'grocery' | 'profile';

function AppContent() {
  const [appState, setAppState] = useState<AppState>('loading');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('home');

  useEffect(() => {
    const initAuth = async () => {
      try {
        const session = await getSession();
        if (!session) { setAppState('auth'); return; }
        const uid = session.user.id;
        setUserId(uid);
        const row = await getProfile(uid);
        const mapped = row ? mapProfileToUserProfile(row) : null;
        if (!mapped) { setAppState('onboarding'); }
        else { setProfile(mapped); setAppState('app'); }
      } catch { setAppState('auth'); }
    };
    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setProfile(null); setUserId(null); setAppState('auth'); return;
      }
      if (event === 'SIGNED_IN') {
        try {
          const uid = session.user.id;
          setUserId(uid);
          const row = await getProfile(uid);
          const mapped = row ? mapProfileToUserProfile(row) : null;
          if (!mapped) { setAppState('onboarding'); }
          else { setProfile(mapped); setAppState('app'); }
        } catch { setAppState('auth'); }
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleAuth = async () => {
    try {
      const session = await getSession();
      if (!session) return;
      const uid = session.user.id;
      setUserId(uid);
      const row = await getProfile(uid);
      const mapped = row ? mapProfileToUserProfile(row) : null;
      if (!mapped) { setAppState('onboarding'); }
      else { setProfile(mapped); setAppState('app'); }
    } catch { setAppState('auth'); }
  };

  const handleOnboardingComplete = async (newProfile: UserProfile) => {
    if (!userId) return;
    try {
      await createProfile(userId, {
        name: newProfile.name,
        appliances: newProfile.appliances,
        last_period_date: newProfile.lastPeriodDate,
        has_pcos: newProfile.hasPCOS,
        primary_goal: newProfile.primaryGoal,
        daily_budget: newProfile.dailyBudget,
      });
      const row = await getProfile(userId);
      const mapped = row ? mapProfileToUserProfile(row) : newProfile;
      setProfile(mapped);
      setAppState('app');
    } catch (e) {
      console.error('Onboarding createProfile failed', e);
      setProfile(newProfile);
      setAppState('app');
    }
  };

  const handleLogout = async () => {
    await signOut();
    setProfile(null);
    setUserId(null);
    setActiveTab('home');
    setAppState('auth');
  };

  if (appState === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 rounded-full gradient-coral animate-pulse" />
      </div>
    );
  }

  if (appState === 'auth') return <AuthPage onAuth={handleAuth} />;
  if (appState === 'onboarding') return <Onboarding userId={userId!} onComplete={handleOnboardingComplete} />;

  if (appState === 'app' && profile) {
    return (
      <div className="min-h-screen bg-background max-w-lg mx-auto">
        {activeTab === 'home' && (
          <Dashboard
            profile={profile}
            userId={userId}
            onNavigateToGrocery={() => setActiveTab('grocery')}
          />
        )}
        {activeTab === 'track' && (
          <TrackPage dailyBudget={profile.dailyBudget} userId={userId} />
        )}
        {activeTab === 'grocery' && userId && (
          <GroceryListPage userId={userId} />
        )}
        {activeTab === 'profile' && (
          <ProfilePage profile={profile} onLogout={handleLogout} />
        )}
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  }

  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppContent />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;