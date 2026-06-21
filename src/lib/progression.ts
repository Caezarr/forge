'use client';

import { SkillLevel, DayLog } from './types';

interface ProgressionContext {
  skill: SkillLevel;
  logs: DayLog[];
  currentWeek: number;
}

function getSkillHistory(skillId: string, logs: DayLog[]): { date: string; completed: boolean; target: number }[] {
  const history: { date: string; completed: boolean; target: number }[] = [];
  for (const log of logs) {
    const quest = log.quests.find(q =>
      q.templateId?.includes(skillId) ||
      q.label.toLowerCase().includes(skillId.toLowerCase())
    );
    if (quest) {
      history.push({
        date: log.date,
        completed: quest.done,
        target: quest.target || 0,
      });
    }
  }
  return history.sort((a, b) => a.date.localeCompare(b.date));
}

function getRecentCompletionRate(history: { completed: boolean }[], days: number): number {
  const recent = history.slice(-days);
  if (recent.length === 0) return 0;
  return recent.filter(h => h.completed).length / recent.length;
}

function getWeekNumber(logs: DayLog[]): number {
  if (logs.length === 0) return 1;
  const dates = logs.map(l => l.date).sort();
  const first = new Date(dates[0]);
  const now = new Date();
  const diffMs = now.getTime() - first.getTime();
  return Math.max(1, Math.ceil(diffMs / (7 * 24 * 60 * 60 * 1000)));
}

function isDeloadWeek(weekNumber: number): boolean {
  return weekNumber > 0 && weekNumber % 4 === 0;
}

function detectPlateau(history: { completed: boolean; target: number }[]): boolean {
  if (history.length < 14) return false;
  const last14 = history.slice(-14);
  const completionRate = last14.filter(h => h.completed).length / last14.length;
  if (completionRate < 0.5) return true;
  const targets = last14.map(h => h.target).filter(t => t > 0);
  if (targets.length < 2) return false;
  const avg = targets.reduce((s, t) => s + t, 0) / targets.length;
  const variance = targets.reduce((s, t) => s + (t - avg) ** 2, 0) / targets.length;
  return variance < 1 && completionRate < 0.7;
}

export function computeTarget(ctx: ProgressionContext): { target: number; label: string; hint?: string } {
  const { skill, logs } = ctx;
  const history = getSkillHistory(skill.id, logs);
  const weekNum = getWeekNumber(logs);
  const current = skill.currentLevel;
  const goal = skill.goal;

  if (skill.type === 'boolean') {
    return { target: 1, label: skill.name };
  }

  if (goal <= 0 || current >= goal) {
    return { target: current, label: `${skill.name} — ${current} ${skill.unit}` };
  }

  const deload = isDeloadWeek(weekNum);
  const plateau = detectPlateau(history);
  const recentRate = getRecentCompletionRate(history, 7);

  if (deload) {
    const deloadTarget = Math.round(current * 0.7);
    return {
      target: deloadTarget,
      label: `${skill.name} — ${deloadTarget} ${skill.unit}`,
      hint: 'Deload week — recover and consolidate',
    };
  }

  if (plateau) {
    const maintainTarget = Math.max(Math.round(current * 0.85), 1);
    return {
      target: maintainTarget,
      label: `${skill.name} — ${maintainTarget} ${skill.unit}`,
      hint: 'Plateau detected — dropping volume to break through',
    };
  }

  const gap = goal - current;
  const weeksToGoal = 12;
  let baseIncrement: number;

  if (skill.category === 'bodyweight' || skill.type === 'reps') {
    // Logarithmic curve: fast early gains, slower as you approach goal
    const progressRatio = current / goal;
    const factor = 1 - progressRatio * 0.6;
    baseIncrement = Math.max(1, Math.ceil((gap / weeksToGoal) * factor));
  } else if (skill.type === 'duration') {
    // Duration: 10-15% increments, capped
    baseIncrement = Math.max(5, Math.round(current * 0.12));
  } else {
    // Numeric: linear progression
    baseIncrement = Math.max(1, Math.ceil(gap / weeksToGoal));
  }

  // Adjust based on recent performance
  let adjustedIncrement = baseIncrement;
  if (recentRate >= 0.9) {
    adjustedIncrement = Math.ceil(baseIncrement * 1.15);
  } else if (recentRate >= 0.7) {
    adjustedIncrement = baseIncrement;
  } else if (recentRate >= 0.4) {
    adjustedIncrement = Math.max(1, Math.floor(baseIncrement * 0.75));
  } else {
    adjustedIncrement = Math.max(1, Math.floor(baseIncrement * 0.5));
  }

  const target = Math.min(current + adjustedIncrement, goal);

  // Special running logic
  if (skill.id === 'running' && skill.estimatedVMA && skill.estimatedVMA > 0) {
    const vma = skill.estimatedVMA;
    const zone2pace = Math.round(vma * 0.7);
    return {
      target: 30,
      label: `Run 30' @ ${zone2pace} km/h (Z2)`,
      hint: recentRate < 0.5 ? 'Try walk-run intervals if needed' : undefined,
    };
  }

  const suffix = skill.id === 'pullups' && skill.assisted && current < 5 ? ' assisted' : '';

  return {
    target,
    label: `${skill.name} — ${target}${suffix} ${skill.unit}`,
  };
}

export function getProgressionInsights(skill: SkillLevel, logs: DayLog[]): {
  completionRate7d: number;
  completionRate30d: number;
  isOnPlateau: boolean;
  isDeload: boolean;
  weekNumber: number;
  estimatedWeeksToGoal: number;
  trend: 'improving' | 'stable' | 'declining';
} {
  const history = getSkillHistory(skill.id, logs);
  const weekNum = getWeekNumber(logs);
  const rate7 = getRecentCompletionRate(history, 7);
  const rate30 = getRecentCompletionRate(history, 30);

  const gap = Math.max(0, skill.goal - skill.currentLevel);
  const weeklyRate = rate7 > 0 ? Math.max(1, gap / 12) * rate7 : 0;
  const estimatedWeeks = weeklyRate > 0 ? Math.ceil(gap / weeklyRate) : 99;

  let trend: 'improving' | 'stable' | 'declining' = 'stable';
  if (history.length >= 14) {
    const first7 = getRecentCompletionRate(history.slice(-14, -7), 7);
    const last7 = rate7;
    if (last7 > first7 + 0.15) trend = 'improving';
    else if (last7 < first7 - 0.15) trend = 'declining';
  }

  return {
    completionRate7d: Math.round(rate7 * 100),
    completionRate30d: Math.round(rate30 * 100),
    isOnPlateau: detectPlateau(history),
    isDeload: isDeloadWeek(weekNum),
    weekNumber: weekNum,
    estimatedWeeksToGoal: estimatedWeeks,
    trend,
  };
}
