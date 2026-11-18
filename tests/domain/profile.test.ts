import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createProfile, getTodayLog, migrateProfile, removeSkill, saveMorningRitual, toggleQuest } from '@/lib/domain/profile';
import { completeRitual, defaultMorningRitual } from '@/lib/domain/morning';
import { getWeeklyStats } from '@/lib/domain/stats';
import { onboarding } from '../fixtures';

describe('profile lifecycle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-10T08:00:00Z'));
  });
  afterEach(() => vi.useRealTimers());

  it('creates templates from skills, poisons and domains', () => {
    const profile = createProfile(onboarding());
    const labels = profile.questTemplates.map(t => t.label);

    expect(labels).toEqual(expect.arrayContaining(['Read 20 pages', 'Room reset', '8k steps', 'No Alcohol', 'No TikTok', 'No Phone in Bed', '2L Water']));
    expect(profile.questTemplates.find(t => t.skillId === 'pushups')?.type).toBe('main');
    expect(Object.keys(profile.logs)).toEqual(['2026-03-10']);
    expect(profile.currentStreak).toBe(1);
  });

  it('falls back to a deep-work main quest when no skills are configured', () => {
    const profile = createProfile(onboarding({ skills: [], poisons: [] }));
    expect(profile.questTemplates.filter(t => t.type === 'main').map(t => t.label)).toEqual(['Deep work 60 min']);
  });

  it('toggling quests updates XP, level and streak', () => {
    let profile = createProfile(onboarding());
    // yesterday was a good day -> streak should chain
    profile.logs['2026-03-09'] = { ...getTodayLog(profile), id: 'y', date: '2026-03-09', monkScore: 70, xpEarned: 600 };

    const today = getTodayLog(profile);
    for (const q of today.quests) profile = toggleQuest(profile, q.id);

    const log = profile.logs['2026-03-10'];
    expect(log.monkScore).toBe(100);
    expect(profile.totalXp).toBe(600 + log.xpEarned);
    expect(profile.overallLevel).toBe(Math.floor(profile.totalXp / 500) + 1);
    expect(profile.currentStreak).toBe(2);
    expect(profile.bestStreak).toBe(2);
  });

  it('ignores unknown quest ids', () => {
    const profile = createProfile(onboarding());
    expect(toggleQuest(profile, 'missing')).toBe(profile);
  });

  it('adds a single morning-ritual main quest once the ritual is completed', () => {
    const profile = createProfile(onboarding());
    const ritual = completeRitual(defaultMorningRitual(profile));

    const once = saveMorningRitual(profile, ritual);
    const twice = saveMorningRitual(once, ritual);
    const ritualQuests = getTodayLog(twice).quests.filter(q => q.templateId === 'morning-ritual');

    expect(ritualQuests).toHaveLength(1);
    expect(ritualQuests[0]).toMatchObject({ done: true, xp: 100, type: 'main' });
  });

  it('archives a skill and deactivates its templates instead of deleting', () => {
    const profile = removeSkill(createProfile(onboarding()), 'pushups');
    expect(profile.onboarding.skills[0].archived).toBe(true);
    expect(profile.questTemplates.find(t => t.skillId === 'pushups')?.active).toBe(false);
  });

  it('migrates a legacy stored profile (no templates, no ids, sparse skills)', () => {
    const legacy = {
      onboarding: { ...onboarding({ poisons: [] }), skills: [{ id: 'pushups', currentLevel: 5, goal: 20 }] },
      logs: { '2026-03-01': { date: '2026-03-01', quests: [], monkScore: 0, xpEarned: 0 } },
    };
    const profile = migrateProfile(legacy as unknown as Record<string, unknown>);

    expect(profile.onboarding.skills[0]).toMatchObject({ id: 'pushups', name: 'Push-ups', type: 'reps', sortOrder: 0, archived: false });
    expect(profile.questTemplates.length).toBeGreaterThan(0);
    expect(profile.morningLogs).toEqual({});
    expect(profile.logs['2026-03-01'].id).toBeTruthy();
  });

  it('computes weekly stats over the last 7 days', () => {
    const profile = createProfile(onboarding());
    profile.logs['2026-03-10'].monkScore = 80;
    profile.logs['2026-03-01'] = { ...profile.logs['2026-03-10'], date: '2026-03-01', monkScore: 10 }; // outside window
    expect(getWeeklyStats(profile).monkScore).toBe(80);
  });
});
