import { v4 as uuid } from 'uuid';
import { UserProfile, DayLog, OnboardingData, SkillLevel, QuestTemplate, MorningRitualLog } from './types';
import { defaultMorningRitual } from './morning';
import { todayKey } from './dates';
import { computeDayScores } from './scoring';
import { generateDefaultTemplates, generateQuests, generateQuestsFromTemplates, migrateSkill } from './quests';

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

export function migrateProfile(raw: Record<string, unknown>): UserProfile {
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
