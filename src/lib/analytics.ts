'use client';

import { UserProfile, DayLog } from './types';

interface PatternInsight {
  type: 'skip_day' | 'never_done' | 'always_done' | 'weekend_dip' | 'streak_break' | 'consistency_gap';
  label: string;
  severity: 'info' | 'warning' | 'critical';
}

interface WeekComparison {
  label: string;
  thisWeek: number;
  lastWeek: number;
  delta: number;
  trend: 'up' | 'down' | 'flat';
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getLogsInRange(profile: UserProfile, daysBack: number): DayLog[] {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - daysBack);
  return Object.values(profile.logs)
    .filter(l => l.date >= start.toISOString().slice(0, 10) && l.date <= end.toISOString().slice(0, 10))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function detectPatterns(profile: UserProfile): PatternInsight[] {
  const insights: PatternInsight[] = [];
  const logs30 = getLogsInRange(profile, 30);
  const logs7 = getLogsInRange(profile, 7);

  if (logs7.length < 3) return insights;

  // Detect which days are weakest
  const dayScores: Record<number, number[]> = {};
  for (const log of logs30) {
    const day = new Date(log.date).getDay();
    if (!dayScores[day]) dayScores[day] = [];
    dayScores[day].push(log.monkScore);
  }

  for (const [dayNum, scores] of Object.entries(dayScores)) {
    const avg = scores.reduce((s, v) => s + v, 0) / scores.length;
    if (avg < 30 && scores.length >= 2) {
      insights.push({
        type: 'skip_day',
        label: `${DAY_NAMES[parseInt(dayNum)]}s are your weakest — avg ${Math.round(avg)}% monk score`,
        severity: 'warning',
      });
    }
  }

  // Weekend dip
  const weekdayScores = logs30.filter(l => {
    const d = new Date(l.date).getDay();
    return d >= 1 && d <= 5;
  }).map(l => l.monkScore);
  const weekendScores = logs30.filter(l => {
    const d = new Date(l.date).getDay();
    return d === 0 || d === 6;
  }).map(l => l.monkScore);

  if (weekdayScores.length >= 5 && weekendScores.length >= 2) {
    const wdAvg = weekdayScores.reduce((s, v) => s + v, 0) / weekdayScores.length;
    const weAvg = weekendScores.reduce((s, v) => s + v, 0) / weekendScores.length;
    if (wdAvg - weAvg > 25) {
      insights.push({
        type: 'weekend_dip',
        label: `Weekend dip: ${Math.round(weAvg)}% vs ${Math.round(wdAvg)}% on weekdays`,
        severity: 'warning',
      });
    }
  }

  // Quests never completed
  const questCompletionMap: Record<string, { total: number; done: number }> = {};
  for (const log of logs30) {
    for (const q of log.quests) {
      const key = q.label;
      if (!questCompletionMap[key]) questCompletionMap[key] = { total: 0, done: 0 };
      questCompletionMap[key].total++;
      if (q.done) questCompletionMap[key].done++;
    }
  }

  for (const [label, stats] of Object.entries(questCompletionMap)) {
    if (stats.total >= 7 && stats.done === 0) {
      insights.push({
        type: 'never_done',
        label: `"${label}" — never completed in 30 days. Remove or adjust?`,
        severity: 'critical',
      });
    } else if (stats.total >= 7 && stats.done / stats.total >= 0.95) {
      insights.push({
        type: 'always_done',
        label: `"${label}" — ${Math.round(stats.done / stats.total * 100)}% completion. Consider leveling up.`,
        severity: 'info',
      });
    }
  }

  // Perceived vs actual consistency
  const activeDays = logs30.filter(l => l.monkScore >= 50).length;
  const totalDays = 30;
  const actualRate = Math.round((activeDays / totalDays) * 100);
  if (actualRate < 50 && logs30.length >= 10) {
    insights.push({
      type: 'consistency_gap',
      label: `Actual consistency: ${actualRate}% of last 30 days. ${activeDays} days above 50% monk score.`,
      severity: actualRate < 30 ? 'critical' : 'warning',
    });
  }

  return insights;
}

export function getWeekComparison(profile: UserProfile): WeekComparison[] {
  const thisWeekLogs = getLogsInRange(profile, 7);
  const lastWeekStart = new Date();
  lastWeekStart.setDate(lastWeekStart.getDate() - 14);
  const lastWeekEnd = new Date();
  lastWeekEnd.setDate(lastWeekEnd.getDate() - 7);
  const lastWeekLogs = Object.values(profile.logs)
    .filter(l => l.date >= lastWeekStart.toISOString().slice(0, 10) && l.date < lastWeekEnd.toISOString().slice(0, 10));

  function avg(logs: DayLog[], fn: (l: DayLog) => number): number {
    if (logs.length === 0) return 0;
    return Math.round(logs.reduce((s, l) => s + fn(l), 0) / logs.length);
  }

  function count(logs: DayLog[], fn: (l: DayLog) => boolean): number {
    return logs.filter(fn).length;
  }

  const metrics: WeekComparison[] = [
    {
      label: 'Monk Score',
      thisWeek: avg(thisWeekLogs, l => l.monkScore),
      lastWeek: avg(lastWeekLogs, l => l.monkScore),
      delta: 0, trend: 'flat',
    },
    {
      label: 'XP Earned',
      thisWeek: thisWeekLogs.reduce((s, l) => s + l.xpEarned, 0),
      lastWeek: lastWeekLogs.reduce((s, l) => s + l.xpEarned, 0),
      delta: 0, trend: 'flat',
    },
    {
      label: 'Clean Days',
      thisWeek: count(thisWeekLogs, l => l.bodyIntegrity >= 80 && l.recoveryScore >= 80),
      lastWeek: count(lastWeekLogs, l => l.bodyIntegrity >= 80 && l.recoveryScore >= 80),
      delta: 0, trend: 'flat',
    },
    {
      label: 'Main Quests Done',
      thisWeek: thisWeekLogs.reduce((s, l) => s + l.quests.filter(q => q.type === 'main' && q.done).length, 0),
      lastWeek: lastWeekLogs.reduce((s, l) => s + l.quests.filter(q => q.type === 'main' && q.done).length, 0),
      delta: 0, trend: 'flat',
    },
  ];

  for (const m of metrics) {
    m.delta = m.thisWeek - m.lastWeek;
    m.trend = m.delta > 0 ? 'up' : m.delta < 0 ? 'down' : 'flat';
  }

  return metrics;
}

export function getDailyBreakdown(profile: UserProfile, days: number = 7): {
  date: string;
  dayName: string;
  monkScore: number;
  mainDone: number;
  mainTotal: number;
  sideDone: number;
  sideTotal: number;
  cleanDone: number;
  cleanTotal: number;
  xp: number;
}[] {
  const result = [];
  const d = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(d);
    date.setDate(date.getDate() - i);
    const key = date.toISOString().slice(0, 10);
    const log = profile.logs[key];
    const dayName = SHORT_DAYS[date.getDay()];

    if (log) {
      result.push({
        date: key,
        dayName,
        monkScore: log.monkScore,
        mainDone: log.quests.filter(q => q.type === 'main' && q.done).length,
        mainTotal: log.quests.filter(q => q.type === 'main').length,
        sideDone: log.quests.filter(q => q.type === 'side' && q.done).length,
        sideTotal: log.quests.filter(q => q.type === 'side').length,
        cleanDone: log.quests.filter(q => q.type === 'clean' && q.done).length,
        cleanTotal: log.quests.filter(q => q.type === 'clean').length,
        xp: log.xpEarned,
      });
    } else {
      result.push({ date: key, dayName, monkScore: 0, mainDone: 0, mainTotal: 0, sideDone: 0, sideTotal: 0, cleanDone: 0, cleanTotal: 0, xp: 0 });
    }
  }
  return result;
}

export function getSkillProgressData(profile: UserProfile, skillLabel: string, days: number = 30): {
  date: string;
  completed: boolean;
  target: number;
}[] {
  const result = [];
  const d = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(d);
    date.setDate(date.getDate() - i);
    const key = date.toISOString().slice(0, 10);
    const log = profile.logs[key];
    const quest = log?.quests.find(q => q.label.toLowerCase().includes(skillLabel.toLowerCase()) && q.type === 'main');
    result.push({
      date: key,
      completed: quest?.done || false,
      target: quest?.target || 0,
    });
  }
  return result;
}
