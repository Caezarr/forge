import { Quest } from './types';

export type DayScores = ReturnType<typeof computeDayScores>;

export function computeDayScores(quests: Quest[]) {
  const mainQuests = quests.filter(q => q.type === 'main');
  const sideQuests = quests.filter(q => q.type === 'side');
  const cleanQuests = quests.filter(q => q.type === 'clean');

  const mainDone = mainQuests.filter(q => q.done).length;
  const sideDone = sideQuests.filter(q => q.done).length;
  const cleanDone = cleanQuests.filter(q => q.done).length;

  const mainScore = mainQuests.length > 0 ? mainDone / mainQuests.length : 0;
  const sideScore = sideQuests.length > 0 ? sideDone / sideQuests.length : 0;
  const cleanScore = cleanQuests.length > 0 ? cleanDone / cleanQuests.length : 0;

  const cleanMultiplier = 1 + cleanScore * 0.2;
  const baseXp = quests.filter(q => q.done && q.xp > 0).reduce((sum, q) => sum + q.xp, 0);
  const xpEarned = Math.round(baseXp * cleanMultiplier);

  const bodyClean = cleanQuests.filter(q => q.category === 'body');
  const mindClean = cleanQuests.filter(q => q.category === 'mind');
  const recoveryClean = cleanQuests.filter(q => q.category === 'recovery');

  const bodyIntegrity = bodyClean.length > 0 ? Math.round((bodyClean.filter(q => q.done).length / bodyClean.length) * 100) : 100;
  const focusIntegrity = mindClean.length > 0 ? Math.round((mindClean.filter(q => q.done).length / mindClean.length) * 100) : 100;
  const recoveryScore = recoveryClean.length > 0 ? Math.round((recoveryClean.filter(q => q.done).length / recoveryClean.length) * 100) : 100;

  const monkScore = Math.round((mainScore * 0.5 + sideScore * 0.15 + cleanScore * 0.35) * 100);

  return { monkScore, xpEarned, cleanMultiplier, bodyIntegrity, focusIntegrity, recoveryScore };
}
