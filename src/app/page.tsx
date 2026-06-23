'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { UserProfile } from '@/lib/types';
import { loadProfile, saveProfile, createProfile, toggleQuest } from '@/lib/store';
import { initNotifications } from '@/lib/notifications';
import { registerServiceWorker } from '@/lib/notifications';
import BottomNav, { TabId } from '@/components/BottomNav';
import Header from '@/components/Header';
import Onboarding from '@/components/Onboarding';
import MorningView from '@/components/MorningView';
import TodayView from '@/components/TodayView';
import ProofView from '@/components/ProofView';
import SkillsView from '@/components/SkillsView';
import CleanView from '@/components/CleanView';
import FocusView from '@/components/FocusView';
import ReviewView from '@/components/ReviewView';
import QuestBuilder from '@/components/QuestBuilder';
import SkillBuilder from '@/components/SkillBuilder';
import SettingsView from '@/components/SettingsView';
import { hapticLight } from '@/lib/haptics';
import type { OnboardingData } from '@/lib/types';

const TAB_ORDER: TabId[] = ['morning', 'today', 'proof', 'skills', 'clean', 'focus', 'review'];
const TAB_SET = new Set<TabId>(TAB_ORDER);

export type ModalView = 'none' | 'quest-builder' | 'skill-builder' | 'settings';

function isStandaloneMode(): boolean {
  if (typeof window === 'undefined') return false;
  const nav = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia('(display-mode: standalone)').matches || Boolean(nav.standalone);
}

export default function Home() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('morning');
  const [modal, setModal] = useState<ModalView>('none');
  const [online, setOnline] = useState(true);
  const [installed, setInstalled] = useState(false);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const handleSwipe = useCallback((direction: 'left' | 'right') => {
    if (modal !== 'none') return;
    const idx = TAB_ORDER.indexOf(activeTab);
    if (direction === 'left' && idx < TAB_ORDER.length - 1) {
      hapticLight();
      setActiveTab(TAB_ORDER[idx + 1]);
    } else if (direction === 'right' && idx > 0) {
      hapticLight();
      setActiveTab(TAB_ORDER[idx - 1]);
    }
  }, [activeTab, modal]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      handleSwipe(dx < 0 ? 'left' : 'right');
    }
  }, [handleSwipe]);

  useEffect(() => {
    queueMicrotask(() => {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab === 'lock') setActiveTab('focus');
      else if (tab && TAB_SET.has(tab as TabId)) setActiveTab(tab as TabId);
      const p = loadProfile();
      setProfile(p);
      setLoaded(true);
      setOnline(navigator.onLine);
      setInstalled(isStandaloneMode());
    });
    registerServiceWorker();
    initNotifications();
  }, []);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    const handleDisplayMode = () => setInstalled(isStandaloneMode());
    const media = window.matchMedia('(display-mode: standalone)');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    media.addEventListener('change', handleDisplayMode);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      media.removeEventListener('change', handleDisplayMode);
    };
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

  const handleProfileUpdate = useCallback((updated: UserProfile) => {
    saveProfile(updated);
    setProfile(updated);
  }, []);

  const handleResetProfile = useCallback(() => {
    localStorage.removeItem('forge_profile');
    localStorage.removeItem('forge_last_sync');
    localStorage.removeItem('forge_dirty');
    localStorage.removeItem('forge_notification_settings');
    setProfile(null);
    setModal('none');
  }, []);

  if (!loaded) {
    return (
      <div className="min-h-screen bg-forge-bg flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-black tracking-[0.25em] text-forge-text">FORGE</h1>
          <p className="text-[10px] tracking-[0.28em] text-forge-red font-bold mt-1">DAILY PROTOCOL</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="forge-shell">
      <Header
        onOpenQuests={() => setModal('quest-builder')}
        onOpenSkills={() => setModal('skill-builder')}
        onOpenSettings={() => setModal('settings')}
        online={online}
        installed={installed}
      />
      <main className="px-5 pb-40 pt-4 max-w-xl mx-auto w-full" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        {!online && modal === 'none' && (
          <div className="mb-4 rounded-xl border border-forge-amber/35 bg-forge-amber/10 px-4 py-3">
            <p className="text-[10px] tracking-[0.22em] text-forge-amber uppercase font-bold">Offline mode</p>
            <p className="mt-1 text-xs text-forge-muted">Your local protocol still works. Sync is optional later.</p>
          </div>
        )}
        {modal === 'quest-builder' && (
          <QuestBuilder profile={profile} onUpdate={handleProfileUpdate} onClose={() => setModal('none')} />
        )}
        {modal === 'skill-builder' && (
          <SkillBuilder profile={profile} onUpdate={handleProfileUpdate} onClose={() => setModal('none')} />
        )}
        {modal === 'settings' && (
          <SettingsView onClose={() => setModal('none')} onResetProfile={handleResetProfile} />
        )}
        {modal === 'none' && (
          <>
            {activeTab === 'morning' && <MorningView profile={profile} onUpdate={handleProfileUpdate} />}
            {activeTab === 'today' && <TodayView profile={profile} onToggle={handleToggle} />}
            {activeTab === 'proof' && <ProofView profile={profile} />}
            {activeTab === 'skills' && <SkillsView profile={profile} />}
            {activeTab === 'clean' && <CleanView profile={profile} onToggle={handleToggle} />}
            {activeTab === 'focus' && <FocusView profile={profile} />}
            {activeTab === 'review' && <ReviewView profile={profile} />}
          </>
        )}
      </main>
      <BottomNav active={activeTab} onChange={(t) => { setModal('none'); setActiveTab(t); }} />
    </div>
  );
}
