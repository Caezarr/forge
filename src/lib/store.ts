'use client';

import { UserProfile, Quest, DayLog, OnboardingData, SkillLevel, QuestTemplate, PRESET_SKILLS, MorningRitualLog } from './types';
import { v4 as uuid } from 'uuid';
import { markDirty } from './sync';
import { markLocalStateUpdated, scheduleStatePush } from './state-sync';
import { computeTarget } from './progression';
import { defaultMorningRitual } from './morning';

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
  const name = skill.name || skill.id;

  if (skill.type === 'boolean') {
    return { label: name, value: 1, unit: '' };
  }

  if (skill.category === 'bodyweight' || skill.type === 'reps') {
    const weeklyInc = Math.max(1, Math.ceil((goal - current) / 12));
    const target = Math.min(current + weeklyInc, goal);
    const suffix = skill.id === 'pullups' && skill.assisted && current < 5 ? ' assisted' : '';
    return { label: `${name} — ${target}${suffix} ${skill.unit}`, value: target, unit: skill.unit };
  }

  if (skill.id === 'running' && skill.category === 'cardio') {
    const vma = skill.estimatedVMA || current;
    if (vma > 0) {
      const zone2pace = Math.round(vma * 0.7);
      return { label: `Run 30' @ ${zone2pace} km/h (Z2)`, value: 30, unit: 'min' };
    }
    return { label: 'Run 30 min easy', value: 30, unit: 'min' };
  }

  if (skill.type === 'duration') {
    const target = goal > 0 ? Math.min(current + 15, goal) : current || 30;
    return { label: `${name} ${target} ${skill.unit}`, value: target, unit: skill.unit };
  }

  if (skill.type === 'numeric') {
    const target = goal > 0 ? goal : current;
    return { label: `${name} — ${target} ${skill.unit}`, value: target, unit: skill.unit };
  }

  return { label: name, value: current, unit: skill.unit };
}

function migrateSkill(s: Record<string, unknown>, idx: number): SkillLevel {
  const id = s.id as string;
  const preset = PRESET_SKILLS[id];
  return {
    id,
    name: (s.name as string) || preset?.name || id,
    icon: (s.icon as string) || preset?.icon || '🎯',
    type: (s.type as SkillLevel['type']) || preset?.type || 'reps',
    category: (s.category as SkillLevel['category']) || preset?.category || 'custom',
    currentLevel: (s.currentLevel as number) || 0,
    goal: (s.goal as number) || 0,
    unit: (s.unit as string) || preset?.unit || '',
    assisted: s.assisted as boolean | undefined,
    testType: s.testType as SkillLevel['testType'],
    testValue: s.testValue as string | undefined,
    estimatedVMA: s.estimatedVMA as number | undefined,
    sortOrder: (s.sortOrder as number) ?? idx,
    archived: (s.archived as boolean) ?? false,
  };
}

function generateQuestsFromTemplates(templates: QuestTemplate[], skills?: SkillLevel[], logs?: DayLog[]): Quest[] {
  const allLogs = logs || [];
  return templates
    .filter(t => t.active)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(t => {
      let label = t.label;
      let target = t.defaultTarget;
      let unit = t.unit;

      if (t.skillId && skills) {
        const skill = skills.find(s => s.id === t.skillId);
        if (skill) {
          const prog = computeTarget({ skill, logs: allLogs, currentWeek: 1 });
          label = prog.label;
          target = prog.target;
          unit = skill.unit;
        }
      }

      return {
        id: uuid(),
        templateId: t.id,
        label,
        type: t.type,
        category: t.category,
        xp: t.xp,
        done: false,
        target,
        progress: 0,
        unit,
      };
    });
}

function generateDefaultTemplates(onboarding: OnboardingData): QuestTemplate[] {
  const templates: QuestTemplate[] = [];
  let order = 0;
  const domains = new Set(onboarding.domains || []);
  const skillIds = new Set(onboarding.skills.map(s => s.id));

  // Main quests from skills
  for (const skill of onboarding.skills) {
    const target = dailyTarget(skill);
    const isBodyweight = skill.category === 'bodyweight';
    const isCardio = skill.category === 'cardio';
    const isBoolean = skill.type === 'boolean';
    const xp = isBoolean ? 40 : isBodyweight ? 80 : isCardio ? 90 : 120;

    templates.push({
      id: uuid(),
      skillId: skill.id,
      label: target.label,
      type: isBoolean ? 'side' : 'main',
      xp,
      targetType: skill.type,
      defaultTarget: target.value,
      unit: target.unit,
      icon: skill.icon,
      active: true,
      sortOrder: order++,
    });
  }

  // Default quest if nothing configured
  if (templates.filter(t => t.type === 'main').length === 0) {
    templates.push({
      id: uuid(), label: 'Deep work 60 min', type: 'main', xp: 120,
      targetType: 'duration', defaultTarget: 60, unit: 'min', icon: '🧠', active: true, sortOrder: order++,
    });
  }

  // Side quests — contextual to domains
  if (!skillIds.has('reading')) {
    templates.push({ id: uuid(), label: 'Read 20 pages', type: 'side', xp: 40, targetType: 'boolean', icon: '📖', active: true, sortOrder: order++ });
  }
  templates.push({ id: uuid(), label: 'Room reset', type: 'side', xp: 20, targetType: 'boolean', icon: '🏠', active: true, sortOrder: order++ });
  if (domains.has('body') || domains.size === 0) {
    templates.push({ id: uuid(), label: '8k steps', type: 'side', xp: 30, targetType: 'numeric', defaultTarget: 8000, unit: 'steps', icon: '👣', active: true, sortOrder: order++ });
  }

  // Clean quests — poisons
  const poisonMap: Record<string, { label: string; category: 'body' | 'mind' | 'recovery' }> = {
    alcohol: { label: 'No Alcohol', category: 'body' },
    junkfood: { label: 'No Junk Food', category: 'body' },
    nicotine: { label: 'No Nicotine', category: 'body' },
    soda: { label: 'No Soda', category: 'body' },
    porn: { label: 'No Porn', category: 'mind' },
    instagram: { label: 'No Instagram', category: 'mind' },
    tiktok: { label: 'No TikTok', category: 'mind' },
    shorts: { label: 'No Shorts', category: 'mind' },
  };

  for (const poison of onboarding.poisons) {
    const p = poisonMap[poison];
    if (p) {
      templates.push({
        id: uuid(), label: p.label, type: 'clean', category: p.category, xp: 0,
        targetType: 'boolean', active: true, sortOrder: order++,
      });
    }
  }

  // Recovery clean quests — always present
  templates.push({ id: uuid(), label: 'No Phone in Bed', type: 'clean', category: 'recovery', xp: 0, targetType: 'boolean', active: true, sortOrder: order++ });
  templates.push({ id: uuid(), label: 'Sleep Before 23:30', type: 'clean', category: 'recovery', xp: 0, targetType: 'boolean', active: true, sortOrder: order++ });
  templates.push({ id: uuid(), label: '2L Water', type: 'clean', category: 'body', xp: 0, targetType: 'boolean', active: true, sortOrder: order++ });

  return templates;
}

function generateQuests(onboarding: OnboardingData, templates?: QuestTemplate[], logs?: DayLog[]): Quest[] {
  if (templates && templates.length > 0) {
    return generateQuestsFromTemplates(templates, onboarding.skills, logs);
  }

  // Legacy path — no templates yet
  const quests: Quest[] = [];
  let id = 0;

  for (const skill of onboarding.skills) {
    const target = dailyTarget(skill);
    const isBodyweight = skill.category === 'bodyweight' || ['pushups', 'pullups', 'dips', 'core'].includes(skill.id);
    const isCardio = skill.category === 'cardio' || skill.id === 'running';
    const xp = isBodyweight ? 80 : isCardio ? 90 : 120;

    quests.push({
      id: `q${id++}`, label: target.label, type: 'main', xp, done: false,
      target: target.value, progress: 0, unit: target.unit,
    });
  }

  if (quests.length === 0) {
    quests.push({ id: `q${id++}`, label: 'Deep work 60 min', type: 'main', xp: 120, done: false, target: 60, progress: 0, unit: 'min' });
  }

  quests.push({ id: `q${id++}`, label: 'Read 20 pages', type: 'side', xp: 40, done: false });
  quests.push({ id: `q${id++}`, label: 'Room reset', type: 'side', xp: 20, done: false });
  quests.push({ id: `q${id++}`, label: '8k steps', type: 'side', xp: 30, done: false });

  const poisonMap: Record<string, { label: string; category: 'body' | 'mind' }> = {
    alcohol: { label: 'No Alcohol', category: 'body' },
    junkfood: { label: 'No Junk Food', category: 'body' },
    nicotine: { label: 'No Nicotine', category: 'body' },
    soda: { label: 'No Soda', category: 'body' },
    porn: { label: 'No Porn', category: 'mind' },
    instagram: { label: 'No Instagram', category: 'mind' },
    tiktok: { label: 'No TikTok', category: 'mind' },
    shorts: { label: 'No Shorts', category: 'mind' },
  };

  for (const poison of onboarding.poisons) {
    const p = poisonMap[poison];
    if (p) quests.push({ id: `q${id++}`, label: p.label, type: 'clean', category: p.category, xp: 0, done: false });
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

function migrateProfile(raw: Record<string, unknown>): UserProfile {
  const profile = raw as unknown as UserProfile;

  // Migrate skills to new format
  if (profile.onboarding?.skills) {
    profile.onboarding.skills = profile.onboarding.skills.map((s, i) => migrateSkill(s as unknown as Record<string, unknown>, i));
  }

  // Add questTemplates if missing
  if (!profile.questTemplates) {
    profile.questTemplates = generateDefaultTemplates(profile.onboarding);
  }

  if (!profile.morningLogs) {
    profile.morningLogs = {};
  }

  // Add id to dayLogs if missing
  for (const log of Object.values(profile.logs)) {
    if (!log.id) {
      log.id = uuid();
    }
  }

  return profile;
}

export function loadProfile(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return migrateProfile(parsed);
  } catch {
    return null;
  }
}

export function saveProfile(profile: UserProfile) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  markLocalStateUpdated();
  markDirty();
}

export function saveAndSync(profile: UserProfile) {
  saveProfile(profile);
  scheduleStatePush(profile);
}

export function createProfile(onboarding: OnboardingData): UserProfile {
  const migratedSkills = onboarding.skills.map((s, i) => migrateSkill(s as unknown as Record<string, unknown>, i));
  const migratedOnboarding = { ...onboarding, skills: migratedSkills };
  const templates = generateDefaultTemplates(migratedOnboarding);
  const quests = generateQuestsFromTemplates(templates, migratedSkills, []);
  const today = todayKey();
  const scores = computeDayScores(quests);

  const dayLog: DayLog = { id: uuid(), date: today, quests, ...scores };

  return {
    onboarding: migratedOnboarding,
    questTemplates: templates,
    currentDay: 1,
    currentStreak: 1,
    bestStreak: 1,
    overallLevel: 1,
    totalXp: 0,
    attributes: defaultAttributes(),
    logs: { [today]: dayLog },
    morningLogs: {},
    focusLockActive: true,
    unlockedApps: [],
  };
}

export function getTodayLog(profile: UserProfile): DayLog {
  const today = todayKey();
  if (profile.logs[today]) return profile.logs[today];

  const existingLogs = Object.values(profile.logs);
  const quests = generateQuests(profile.onboarding, profile.questTemplates, existingLogs);
  const scores = computeDayScores(quests);
  const dayLog: DayLog = { id: uuid(), date: today, quests, ...scores };
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

export function getTodayMorningRitual(profile: UserProfile): MorningRitualLog {
  const today = todayKey();
  if (!profile.morningLogs) profile.morningLogs = {};
  if (!profile.morningLogs[today]) {
    profile.morningLogs[today] = defaultMorningRitual(profile);
  }
  return profile.morningLogs[today];
}

export function saveMorningRitual(profile: UserProfile, ritual: MorningRitualLog): UserProfile {
  const morningLogs = { ...(profile.morningLogs || {}), [ritual.date]: ritual };
  const updated = { ...profile, morningLogs };

  if (ritual.completedAt || ritual.quality >= 80) {
    const log = getTodayLog(updated);
    const alreadyHasRitualQuest = log.quests.some((quest) => quest.templateId === 'morning-ritual');
    if (!alreadyHasRitualQuest) {
      log.quests.unshift({
        id: uuid(),
        templateId: 'morning-ritual',
        label: `Morning ritual ${ritual.completedDurationMin}/${ritual.targetDurationMin} min`,
        type: 'main',
        category: 'identity',
        xp: 100,
        done: true,
        target: ritual.targetDurationMin,
        progress: ritual.completedDurationMin,
        unit: 'min',
      });
      const scores = computeDayScores(log.quests);
      Object.assign(log, scores);
      updated.logs[log.date] = log;
      updated.totalXp = Object.values(updated.logs).reduce((sum, l) => sum + l.xpEarned, 0);
      updated.overallLevel = Math.floor(updated.totalXp / 500) + 1;
    }
  }

  return updated;
}

// --- Quest Template CRUD ---

export function addQuestTemplate(profile: UserProfile, template: Omit<QuestTemplate, 'id' | 'sortOrder'>): UserProfile {
  const maxOrder = profile.questTemplates.reduce((max, t) => Math.max(max, t.sortOrder), -1);
  const newTemplate: QuestTemplate = {
    ...template,
    id: uuid(),
    sortOrder: maxOrder + 1,
  };
  return { ...profile, questTemplates: [...profile.questTemplates, newTemplate] };
}

export function updateQuestTemplate(profile: UserProfile, templateId: string, updates: Partial<QuestTemplate>): UserProfile {
  return {
    ...profile,
    questTemplates: profile.questTemplates.map(t =>
      t.id === templateId ? { ...t, ...updates } : t
    ),
  };
}

export function removeQuestTemplate(profile: UserProfile, templateId: string): UserProfile {
  return {
    ...profile,
    questTemplates: profile.questTemplates.map(t =>
      t.id === templateId ? { ...t, active: false } : t
    ),
  };
}

export function reorderQuestTemplates(profile: UserProfile, templateIds: string[]): UserProfile {
  const reordered = profile.questTemplates.map(t => {
    const idx = templateIds.indexOf(t.id);
    return idx >= 0 ? { ...t, sortOrder: idx } : t;
  });
  return { ...profile, questTemplates: reordered };
}

// --- Custom Skill CRUD ---

export function addSkill(profile: UserProfile, skill: Omit<SkillLevel, 'sortOrder'>): UserProfile {
  const maxOrder = profile.onboarding.skills.reduce((max, s) => Math.max(max, s.sortOrder), -1);
  const newSkill: SkillLevel = { ...skill, sortOrder: maxOrder + 1 };
  return {
    ...profile,
    onboarding: {
      ...profile.onboarding,
      skills: [...profile.onboarding.skills, newSkill],
    },
  };
}

export function updateSkill(profile: UserProfile, skillId: string, updates: Partial<SkillLevel>): UserProfile {
  return {
    ...profile,
    onboarding: {
      ...profile.onboarding,
      skills: profile.onboarding.skills.map(s =>
        s.id === skillId ? { ...s, ...updates } : s
      ),
    },
  };
}

export function removeSkill(profile: UserProfile, skillId: string): UserProfile {
  return {
    ...profile,
    onboarding: {
      ...profile.onboarding,
      skills: profile.onboarding.skills.map(s =>
        s.id === skillId ? { ...s, archived: true } : s
      ),
    },
    questTemplates: profile.questTemplates.map(t =>
      t.skillId === skillId ? { ...t, active: false } : t
    ),
  };
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
