import { v4 as uuid } from 'uuid';
import { Quest, DayLog, OnboardingData, SkillLevel, QuestTemplate, PRESET_SKILLS } from './types';
import { computeTarget } from './progression';

export function dailyTarget(skill: SkillLevel): { label: string; value: number; unit: string } {
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

export function migrateSkill(s: Record<string, unknown>, idx: number): SkillLevel {
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

export function generateQuestsFromTemplates(templates: QuestTemplate[], skills?: SkillLevel[], logs?: DayLog[]): Quest[] {
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

export function generateDefaultTemplates(onboarding: OnboardingData): QuestTemplate[] {
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

export function generateQuests(onboarding: OnboardingData, templates?: QuestTemplate[], logs?: DayLog[]): Quest[] {
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
