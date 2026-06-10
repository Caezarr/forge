'use client';

import { UserProfile, Quest, DayLog, OnboardingData, SkillLevel } from './types';

const STORAGE_KEY = 'forge_profile';

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function defaultAttributes() {
  return [
    { key: 'athleticism', label: 'Athleticism', icon: '🏃', value: 50, delta: 0 },
    { key: 'strength', label: 'Strength', icon: '💪', value: 50, delta: 0 },
    { key: 'endurance', label: 'Endurance', icon: '❤️', value: 50, delta: 0 },
    { key: 'technical', label: 'Technical', icon: '🧠', value: 50, delta: 0 },
    { key: 'discipline', label: 'Discipline', icon: '🎯', value: 50, delta: 0 },
    { key: 'recovery', label: 'Recovery', icon: '🔄', value: 50, delta: 0 },
  ];
}

function dailyTarget(skill: SkillLevel): { label: string; value: number; unit: string } {
  const current = skill.currentLevel;
  const goal = skill.goal;

  switch (skill.id) {
    case 'pushups': {
      const weeklyInc = Math.max(1, Math.ceil((goal - current) / 12));
      const target = Math.min(current + weeklyInc, goal);
      return { label: `Pushups — ${target} reps`, value: target, unit: 'reps' };
    }
    case 'pullups': {
      const weeklyInc = Math.max(1, Math.ceil((goal - current) / 12));
      const target = Math.min(current + weeklyInc, goal);
      if (skill.assisted && current < 5) {
        return { label: `Pull-ups — ${target} assisted`, value: target, unit: 'reps' };
      }
      return { label: `Pull-ups — ${target} strict`, value: target, unit: 'reps' };
    }
    case 'dips': {
      const weeklyInc = Math.max(1, Math.ceil((goal - current) / 12));
      const target = Math.min(current + weeklyInc, goal);
      return { label: `Dips — ${target} reps`, value: target, unit: 'reps' };
    }
    case 'core': {
      const weeklyInc = Math.max(1, Math.ceil((goal - current) / 12));
      const target = Math.min(current + weeklyInc, goal);
      return { label: `Core — ${target} reps`, value: target, unit: 'reps' };
    }
    case 'running': {
      const vma = skill.estimatedVMA || current;
      if (vma > 0) {
        const zone2pace = Math.round(vma * 0.7);
        return { label: `Run 30' @ ${zone2pace} km/h (Z2)`, value: 30, unit: 'min' };
      }
      return { label: 'Run 30 min easy', value: 30, unit: 'min' };
    }
    case 'deepwork': {
      const target = Math.min(current + 15, goal);
      return { label: `Deep work ${target} min`, value: target, unit: 'min' };
    }
    case 'mobility': {
      return { label: `Mobility 15 min`, value: 15, unit: 'min' };
    }
    default:
      return { label: skill.id, value: current, unit: skill.unit };
  }
}

function generateQuests(onboarding: OnboardingData): Quest[] {
  const quests: Quest[] = [];
  let id = 0;

  for (const skill of onboarding.skills) {
    const target = dailyTarget(skill);
    const isBodyweight = ['pushups', 'pullups', 'dips', 'core'].includes(skill.id);
    const isCardio = skill.id === 'running';
    const xp = isBodyweight ? 80 : isCardio ? 90 : 120;

    quests.push({
      id: `q${id++}`,
      label: target.label,
      type: 'main',
      xp,
      done: false,
      target: target.value,
      progress: 0,
      unit: target.unit,
    });
  }

  if (quests.length === 0) {
    quests.push({ id: `q${id++}`, label: 'Deep work 60 min', type: 'main', xp: 120, done: false, target: 60, progress: 0, unit: 'min' });
  }

  quests.push({ id: `q${id++}`, label: 'Read 20 pages', type: 'side', xp: 40, done: false });
  quests.push({ id: `q${id++}`, label: 'Room reset', type: 'side', xp: 20, done: false });
  quests.push({ id: `q${id++}`, label: '8k steps', type: 'side', xp: 30, done: false });

  if (onboarding.poisons.includes('alcohol')) {
    quests.push({ id: `q${id++}`, label: 'No Alcohol', type: 'clean', category: 'body', xp: 0, done: false });
  }
  if (onboarding.poisons.includes('junkfood')) {
    quests.push({ id: `q${id++}`, label: 'No Junk Food', type: 'clean', category: 'body', xp: 0, done: false });
  }
  if (onboarding.poisons.includes('nicotine')) {
    quests.push({ id: `q${id++}`, label: 'No Nicotine', type: 'clean', category: 'body', xp: 0, done: false });
  }
  if (onboarding.poisons.includes('porn')) {
    quests.push({ id: `q${id++}`, label: 'No Porn', type: 'clean', category: 'mind', xp: 0, done: false });
  }
  if (onboarding.poisons.includes('instagram')) {
    quests.push({ id: `q${id++}`, label: 'No Instagram', type: 'clean', category: 'mind', xp: 0, done: false });
  }
  if (onboarding.poisons.includes('tiktok')) {
    quests.push({ id: `q${id++}`, label: 'No TikTok', type: 'clean', category: 'mind', xp: 0, done: false });
  }
  if (onboarding.poisons.includes('shorts')) {
    quests.push({ id: `q${id++}`, label: 'No Shorts', type: 'clean', category: 'mind', xp: 0, done: false });
  }
  if (onboarding.poisons.includes('soda')) {
    quests.push({ id: `q${id++}`, label: 'No Soda', type: 'clean', category: 'body', xp: 0, done: false });
  }

  quests.push({ id: `q${id++}`, label: 'No Phone in Bed', type: 'clean', category: 'recovery', xp: 0, done: false });
  quests.push({ id: `q${id++}`, label: 'Sleep Before 23:30', type: 'clean', category: 'recovery', xp: 0, done: false });
  quests.push({ id: `q${id++}`, label: '2L Water', type: 'clean', category: 'body', xp: 0, done: false });

  return quests;
}

function computeDayScores(quests: Quest[]) {
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

export function loadProfile(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveProfile(profile: UserProfile) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export function createProfile(onboarding: OnboardingData): UserProfile {
  const quests = generateQuests(onboarding);
  const today = todayKey();
  const scores = computeDayScores(quests);

  const dayLog: DayLog = { date: today, quests, ...scores };

  return {
    onboarding,
    currentDay: 1,
    currentStreak: 1,
    bestStreak: 1,
    overallLevel: 1,
    totalXp: 0,
    attributes: defaultAttributes(),
    logs: { [today]: dayLog },
    focusLockActive: true,
    unlockedApps: [],
  };
}

export function getTodayLog(profile: UserProfile): DayLog {
  const today = todayKey();
  if (profile.logs[today]) return profile.logs[today];

  const quests = generateQuests(profile.onboarding);
  const scores = computeDayScores(quests);
  const dayLog: DayLog = { date: today, quests, ...scores };
  profile.logs[today] = dayLog;
  return dayLog;
}

export function toggleQuest(profile: UserProfile, questId: string): UserProfile {
  const today = todayKey();
  const log = getTodayLog(profile);
  const quest = log.quests.find(q => q.id === questId);
  if (!quest) return profile;

  quest.done = !quest.done;
  const scores = computeDayScores(log.quests);
  Object.assign(log, scores);
  profile.logs[today] = log;

  const totalXp = Object.values(profile.logs).reduce((sum, l) => sum + l.xpEarned, 0);
  profile.totalXp = totalXp;
  profile.overallLevel = Math.floor(totalXp / 500) + 1;

  const days = Object.keys(profile.logs).sort();
  profile.currentDay = days.length;

  let streak = 0;
  const d = new Date();
  while (true) {
    const key = d.toISOString().slice(0, 10);
    const dayLog = profile.logs[key];
    if (dayLog && dayLog.monkScore >= 50) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }
  profile.currentStreak = Math.max(streak, 1);
  profile.bestStreak = Math.max(profile.bestStreak, profile.currentStreak);

  return { ...profile };
}

export function isAppUnlocked(profile: UserProfile): boolean {
  const log = getTodayLog(profile);
  const mainQuests = log.quests.filter(q => q.type === 'main');
  const mainDone = mainQuests.filter(q => q.done).length;
  return mainDone >= Math.min(2, mainQuests.length);
}

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
