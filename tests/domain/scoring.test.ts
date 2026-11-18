import { describe, expect, it } from 'vitest';
import { computeDayScores } from '@/lib/domain/scoring';
import { quest } from '../fixtures';

describe('computeDayScores', () => {
  it('weights main 50% / side 15% / clean 35% and applies the clean XP multiplier', () => {
    const scores = computeDayScores([
      quest({ type: 'main', xp: 80, done: true }),
      quest({ type: 'main', xp: 120, done: false }),
      quest({ type: 'side', xp: 40, done: true }),
      quest({ type: 'clean', category: 'body', done: true }),
      quest({ type: 'clean', category: 'body', done: false }),
      quest({ type: 'clean', category: 'mind', done: true }),
    ]);

    // main 1/2, side 1/1, clean 2/3 -> 0.25 + 0.15 + 0.2333 = 63
    expect(scores.monkScore).toBe(63);
    // base XP 120 * (1 + 2/3 * 0.2)
    expect(scores.xpEarned).toBe(136);
    expect(scores.cleanMultiplier).toBeCloseTo(1.1333, 3);
    expect(scores.bodyIntegrity).toBe(50);
    expect(scores.focusIntegrity).toBe(100);
    expect(scores.recoveryScore).toBe(100); // no recovery quests -> neutral 100
  });

  it('returns a zero score for an empty day', () => {
    const scores = computeDayScores([]);
    expect(scores.monkScore).toBe(0);
    expect(scores.xpEarned).toBe(0);
    expect(scores.cleanMultiplier).toBe(1);
  });
});
