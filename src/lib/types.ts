export type Archetype = 'athlete' | 'builder' | 'monk' | 'operator';
export type Intensity = 'balanced' | 'monk' | 'savage';
export type Poison = 'instagram' | 'tiktok' | 'shorts' | 'alcohol' | 'junkfood' | 'porn' | 'nicotine' | 'soda';

export type SkillId = 'pushups' | 'pullups' | 'dips' | 'running' | 'deepwork' | 'mobility' | 'core';

export type RunningTestType = 'vma' | '5k' | '10k' | 'cooper' | 'none';

export interface SkillLevel {
  id: SkillId;
  currentLevel: number;
  assisted?: boolean;
  goal: number;
  unit: string;
  testType?: RunningTestType;
  testValue?: string;
  estimatedVMA?: number;
}

export interface OnboardingData {
  archetype: Archetype | null;
  skills: SkillLevel[];
  intensity: Intensity | null;
  poisons: Poison[];
  dailyTimeBudget: number;
  name: string;
}

export interface Quest {
  id: string;
  label: string;
  type: 'main' | 'side' | 'clean';
  category?: 'body' | 'mind' | 'recovery' | 'identity';
  xp: number;
  done: boolean;
  target?: number;
  progress?: number;
  unit?: string;
}

export interface DayLog {
  date: string;
  quests: Quest[];
  monkScore: number;
  xpEarned: number;
  cleanMultiplier: number;
  bodyIntegrity: number;
  focusIntegrity: number;
  recoveryScore: number;
}

export interface Attribute {
  key: string;
  label: string;
  icon: string;
  value: number;
  delta: number;
}

export interface UserProfile {
  onboarding: OnboardingData;
  currentDay: number;
  currentStreak: number;
  bestStreak: number;
  overallLevel: number;
  totalXp: number;
  attributes: Attribute[];
  logs: Record<string, DayLog>;
  focusLockActive: boolean;
  unlockedApps: string[];
}
