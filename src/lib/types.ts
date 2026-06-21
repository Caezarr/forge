export type Archetype = 'athlete' | 'builder' | 'monk' | 'operator';
export type Intensity = 'balanced' | 'monk' | 'savage';
export type Poison = 'instagram' | 'tiktok' | 'shorts' | 'alcohol' | 'junkfood' | 'porn' | 'nicotine' | 'soda';
export type LifeDomainId = 'body' | 'mind' | 'career' | 'discipline';

export type SkillType = 'reps' | 'duration' | 'boolean' | 'numeric';
export type SkillCategory = 'bodyweight' | 'cardio' | 'mental' | 'recovery' | 'custom';

export type SkillId = string;

export type RunningTestType = 'vma' | '5k' | '10k' | 'cooper' | 'none';

export interface SkillLevel {
  id: SkillId;
  name: string;
  icon: string;
  type: SkillType;
  category: SkillCategory;
  currentLevel: number;
  goal: number;
  unit: string;
  assisted?: boolean;
  testType?: RunningTestType;
  testValue?: string;
  estimatedVMA?: number;
  sortOrder: number;
  archived?: boolean;
}

export interface OnboardingData {
  archetype: Archetype | null;
  skills: SkillLevel[];
  intensity: Intensity | null;
  poisons: Poison[];
  dailyTimeBudget: number;
  name: string;
  motivation?: string;
  domains?: LifeDomainId[];
}

export interface QuestTemplate {
  id: string;
  skillId?: string | null;
  label: string;
  type: 'main' | 'side' | 'clean';
  category?: 'body' | 'mind' | 'recovery' | 'identity' | 'custom';
  xp: number;
  targetType: SkillType;
  defaultTarget?: number;
  unit?: string;
  icon?: string;
  active: boolean;
  sortOrder: number;
}

export interface Quest {
  id: string;
  templateId?: string | null;
  label: string;
  type: 'main' | 'side' | 'clean';
  category?: string;
  xp: number;
  done: boolean;
  target?: number;
  progress?: number;
  unit?: string;
}

export interface DayLog {
  id: string;
  date: string;
  quests: Quest[];
  monkScore: number;
  xpEarned: number;
  cleanMultiplier: number;
  bodyIntegrity: number;
  focusIntegrity: number;
  recoveryScore: number;
}

export type ReadinessMood = 'flat' | 'steady' | 'charged';
export type RitualMode = 'push' | 'normal' | 'grounded' | 'minimum' | 'recovery';
export type RitualBlockKind =
  | 'wake'
  | 'hydrate'
  | 'mobility'
  | 'breath'
  | 'training'
  | 'cold'
  | 'journal'
  | 'planning'
  | 'clean'
  | 'prime';

export interface MorningReadiness {
  sleep: number;
  energy: number;
  soreness: number;
  stress: number;
  timeAvailable: number;
  mood: ReadinessMood;
  motivation: number;
  notes?: string;
  score: number;
  mode: RitualMode;
  checkedAt: string;
}

export interface RitualBlock {
  id: string;
  kind: RitualBlockKind;
  title: string;
  cue: string;
  why: string;
  durationMin: number;
  intensity: 1 | 2 | 3 | 4 | 5;
  optional?: boolean;
  done: boolean;
}

export interface MorningRitualLog {
  id: string;
  date: string;
  mode: RitualMode;
  targetDurationMin: number;
  completedDurationMin: number;
  quality: number;
  readiness: MorningReadiness;
  blocks: RitualBlock[];
  completedAt?: string;
  skippedReason?: string;
  coachNote: string;
}

export interface Attribute {
  key: string;
  label: string;
  icon: string;
  value: number;
  delta: number;
}

export interface UserProfile {
  onboarding: OnboardingData;
  questTemplates: QuestTemplate[];
  currentDay: number;
  currentStreak: number;
  bestStreak: number;
  overallLevel: number;
  totalXp: number;
  attributes: Attribute[];
  logs: Record<string, DayLog>;
  morningLogs: Record<string, MorningRitualLog>;
  focusLockActive: boolean;
  unlockedApps: string[];
}

export const PRESET_SKILLS: Record<string, Omit<SkillLevel, 'currentLevel' | 'goal' | 'sortOrder'>> = {
  pushups: { id: 'pushups', name: 'Push-ups', icon: '💪', type: 'reps', category: 'bodyweight', unit: 'reps' },
  pullups: { id: 'pullups', name: 'Pull-ups', icon: '🏋️', type: 'reps', category: 'bodyweight', unit: 'reps' },
  dips: { id: 'dips', name: 'Dips', icon: '🤸', type: 'reps', category: 'bodyweight', unit: 'reps' },
  core: { id: 'core', name: 'Core', icon: '🎯', type: 'reps', category: 'bodyweight', unit: 'reps' },
  running: { id: 'running', name: 'Running', icon: '👟', type: 'duration', category: 'cardio', unit: 'min' },
  deepwork: { id: 'deepwork', name: 'Deep Work', icon: '🧠', type: 'duration', category: 'mental', unit: 'min' },
  mobility: { id: 'mobility', name: 'Mobility', icon: '🧘', type: 'duration', category: 'recovery', unit: 'min' },
  reading: { id: 'reading', name: 'Reading', icon: '📖', type: 'numeric', category: 'mental', unit: 'pages' },
  meditation: { id: 'meditation', name: 'Meditation', icon: '🪷', type: 'duration', category: 'recovery', unit: 'min' },
  journaling: { id: 'journaling', name: 'Journaling', icon: '✍️', type: 'boolean', category: 'mental', unit: '' },
  shipping: { id: 'shipping', name: 'Daily Ship', icon: '🚀', type: 'boolean', category: 'custom', unit: '' },
  learning: { id: 'learning', name: 'Learning', icon: '📚', type: 'duration', category: 'mental', unit: 'min' },
};

export const LIFE_DOMAINS: Record<LifeDomainId, { name: string; icon: string; description: string; tracks: string[] }> = {
  body: { name: 'Body', icon: '🏃', description: 'Strength, endurance, physique', tracks: ['Bodyweight skills', 'Cardio', 'Mobility'] },
  mind: { name: 'Mind', icon: '🧠', description: 'Focus, learning, mental clarity', tracks: ['Reading', 'Meditation', 'Deep focus'] },
  career: { name: 'Career', icon: '🚀', description: 'Deep work, shipping, growth', tracks: ['Deep work sessions', 'Daily shipping', 'Learning'] },
  discipline: { name: 'Discipline', icon: '🔥', description: 'Clean living, habits, recovery', tracks: ['Cut poisons', 'Sleep hygiene', 'Hydration'] },
};
