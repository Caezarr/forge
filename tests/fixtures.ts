import type { OnboardingData, Quest, SkillLevel } from '@/lib/domain/types';

export function quest(overrides: Partial<Quest> = {}): Quest {
  return { id: Math.random().toString(36).slice(2), label: 'Quest', type: 'main', xp: 0, done: false, ...overrides };
}

export function skill(overrides: Partial<SkillLevel> = {}): SkillLevel {
  return {
    id: 'pushups',
    name: 'Push-ups',
    icon: '💪',
    type: 'reps',
    category: 'bodyweight',
    currentLevel: 10,
    goal: 34,
    unit: 'reps',
    sortOrder: 0,
    ...overrides,
  };
}

export function onboarding(overrides: Partial<OnboardingData> = {}): OnboardingData {
  return {
    archetype: 'athlete',
    skills: [skill()],
    intensity: 'balanced',
    poisons: ['alcohol', 'tiktok'],
    dailyTimeBudget: 90,
    name: 'Test',
    domains: ['body'],
    ...overrides,
  };
}
