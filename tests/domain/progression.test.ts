import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { computeTarget } from '@/lib/domain/progression';
import type { DayLog } from '@/lib/domain/types';
import { quest, skill } from '../fixtures';

function log(date: string, done: boolean, target = 10): DayLog {
  return {
    id: date, date, monkScore: 0, xpEarned: 0, cleanMultiplier: 1, bodyIntegrity: 100, focusIntegrity: 100, recoveryScore: 100,
    quests: [quest({ label: 'pushups set', done, target })],
  };
}

describe('computeTarget', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-10T08:00:00Z'));
  });
  afterEach(() => vi.useRealTimers());

  it('returns 1 for boolean skills', () => {
    expect(computeTarget({ skill: skill({ type: 'boolean', name: 'Meditate' }), logs: [], currentWeek: 1 })).toEqual({ target: 1, label: 'Meditate' });
  });

  it('holds the current level once the goal is reached', () => {
    const res = computeTarget({ skill: skill({ currentLevel: 40, goal: 34 }), logs: [], currentWeek: 1 });
    expect(res.target).toBe(40);
  });

  it('progresses bodyweight skills on a damped curve, halved when nothing was completed', () => {
    // gap 24 / 12 weeks * (1 - 10/34 * 0.6) = 1.65 -> ceil 2; no history -> rate 0 -> floor(2 * 0.5) = 1
    const res = computeTarget({ skill: skill(), logs: [], currentWeek: 1 });
    expect(res.target).toBe(11);
    expect(res.label).toBe('Push-ups — 11 reps');
  });

  it('boosts the increment by 15% after a near-perfect week', () => {
    const logs = ['2026-03-04', '2026-03-05', '2026-03-06', '2026-03-07', '2026-03-08', '2026-03-09', '2026-03-10'].map(d => log(d, true));
    const res = computeTarget({ skill: skill(), logs, currentWeek: 1 });
    expect(res.target).toBe(13); // ceil(2 * 1.15) = 3
  });

  it('deloads to 70% every fourth week', () => {
    // first log 22 days ago -> week ceil(22/7) = 4
    const res = computeTarget({ skill: skill({ currentLevel: 20 }), logs: [log('2026-02-16', true)], currentWeek: 4 });
    expect(res.target).toBe(14);
    expect(res.hint).toMatch(/Deload/);
  });

  it('drops volume on a plateau (14+ entries, <50% completion)', () => {
    const logs = Array.from({ length: 14 }, (_, i) => log(`2026-03-${String(i + 1).padStart(2, '0')}`, i % 4 === 0));
    const res = computeTarget({ skill: skill({ currentLevel: 20 }), logs, currentWeek: 2 });
    expect(res.target).toBe(17); // round(20 * 0.85)
    expect(res.hint).toMatch(/Plateau/);
  });
});
