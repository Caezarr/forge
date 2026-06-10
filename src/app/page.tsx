'use client';

import { useState, useEffect, useCallback } from 'react';
import { UserProfile } from '@/lib/types';
import { loadProfile, saveProfile, createProfile, toggleQuest } from '@/lib/store';
import BottomNav, { TabId } from '@/components/BottomNav';
import Header from '@/components/Header';
import Onboarding from '@/components/Onboarding';
import TodayView from '@/components/TodayView';
import ProofView from '@/components/ProofView';
import SkillsView from '@/components/SkillsView';
import CleanView from '@/components/CleanView';
import LockView from '@/components/LockView';
import ReviewView from '@/components/ReviewView';
import type { OnboardingData } from '@/lib/types';

export default function Home() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('today');

  useEffect(() => {
    const p = loadProfile();
    setProfile(p);
    setLoaded(true);
  }, []);

  const handleOnboardingComplete = useCallback((data: OnboardingData) => {
    const p = createProfile(data);
    saveProfile(p);
    setProfile(p);
  }, []);

  const handleToggle = useCallback(
    (questId: string) => {
      if (!profile) return;
      const updated = toggleQuest(profile, questId);
      saveProfile(updated);
      setProfile(updated);
    },
    [profile]
  );

  if (!loaded) {
    return (
      <div className="min-h-screen bg-forge-bg flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-black tracking-[0.25em] text-forge-text">FORGE</h1>
          <p className="text-[10px] tracking-[0.35em] text-forge-red font-bold mt-1">MONK MODE</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen bg-forge-bg">
      <Header />
      <main className="px-5 pb-24 pt-2">
        {activeTab === 'today' && <TodayView profile={profile} onToggle={handleToggle} />}
        {activeTab === 'proof' && <ProofView profile={profile} />}
        {activeTab === 'skills' && <SkillsView profile={profile} />}
        {activeTab === 'clean' && <CleanView profile={profile} onToggle={handleToggle} />}
        {activeTab === 'lock' && <LockView profile={profile} />}
        {activeTab === 'review' && <ReviewView profile={profile} />}
      </main>
      <BottomNav active={activeTab} onChange={setActiveTab} />
    </div>
  );
}
