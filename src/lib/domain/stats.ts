import { UserProfile } from './types';

export function getConsistencyData(profile: UserProfile): { date: string; score: number }[] {
  const data: { date: string; score: number }[] = [];
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 365);

  const d = new Date(start);
  while (d <= end) {
    const key = d.toISOString().slice(0, 10);
    const log = profile.logs[key];
    data.push({ date: key, score: log ? log.monkScore : 0 });
    d.setDate(d.getDate() + 1);
  }
  return data;
}

export function getWeeklyStats(profile: UserProfile) {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 6);

  let totalScore = 0;
  let totalXp = 0;
  let cleanDays = 0;
  let runs = 0;
  let deepWorkMin = 0;
  let days = 0;

  const d = new Date(start);
  while (d <= end) {
    const key = d.toISOString().slice(0, 10);
    const log = profile.logs[key];
    if (log) {
      days++;
      totalScore += log.monkScore;
      totalXp += log.xpEarned;
      if (log.bodyIntegrity >= 80 && log.recoveryScore >= 80) cleanDays++;
      const runQ = log.quests.find(q => q.label.toLowerCase().includes('run') && q.type === 'main');
      if (runQ?.done) runs++;
      const dwQ = log.quests.find(q => q.label.toLowerCase().includes('deep work'));
      if (dwQ?.done) deepWorkMin += dwQ.target || 90;
    }
    d.setDate(d.getDate() + 1);
  }

  return {
    monkScore: days > 0 ? Math.round(totalScore / days) : 0,
    xpEarned: totalXp,
    cleanDays,
    runs,
    deepWorkHours: Math.floor(deepWorkMin / 60),
    deepWorkMins: deepWorkMin % 60,
  };
}
