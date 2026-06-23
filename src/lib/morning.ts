import {
  MorningReadiness,
  MorningRitualLog,
  ReadinessMood,
  RitualBlock,
  RitualBlockKind,
  RitualMode,
  UserProfile,
} from './types';

export interface ReadinessInput {
  sleep: number;
  energy: number;
  soreness: number;
  stress: number;
  timeAvailable: number;
  mood: ReadinessMood;
  motivation: number;
  notes?: string;
}

interface BlockTemplate {
  kind: RitualBlockKind;
  title: string;
  cue: string;
  why: string;
  durationMin: number;
  intensity: 1 | 2 | 3 | 4 | 5;
}

const modeLabels: Record<RitualMode, string> = {
  push: 'Push',
  normal: 'Normal',
  grounded: 'Grounded',
  minimum: 'Minimum viable',
  recovery: 'Recovery',
};

const fullRitual: BlockTemplate[] = [
  {
    kind: 'wake',
    title: 'Wake clean',
    cue: 'Water, light, no phone. Stand up before thinking.',
    why: 'The first win is environmental, not motivational.',
    durationMin: 3,
    intensity: 2,
  },
  {
    kind: 'hydrate',
    title: 'Hydrate + minerals',
    cue: '500ml water. Add salt or electrolytes if you train hard.',
    why: 'Rehydrates the system before caffeine or screens.',
    durationMin: 3,
    intensity: 1,
  },
  {
    kind: 'breath',
    title: 'Downshift breath',
    cue: 'Nasal breathing. 4 seconds in, 6 seconds out.',
    why: 'Sets calm control before intensity.',
    durationMin: 5,
    intensity: 2,
  },
  {
    kind: 'mobility',
    title: 'Mobility scan',
    cue: 'Neck, hips, ankles, spine. Move where the body resists.',
    why: 'Turns soreness into signal instead of excuse.',
    durationMin: 8,
    intensity: 2,
  },
  {
    kind: 'training',
    title: 'Primer circuit',
    cue: 'Push, pull or hinge, core. Stop fresh, not destroyed.',
    why: 'Builds heat and confidence without hijacking the day.',
    durationMin: 10,
    intensity: 3,
  },
  {
    kind: 'cold',
    title: 'Cold exposure',
    cue: 'Cold shower finish or face dunk. Breathe slow.',
    why: 'A controlled hard thing before the world asks for one.',
    durationMin: 3,
    intensity: 4,
  },
  {
    kind: 'journal',
    title: 'Journal the signal',
    cue: 'One line: what matters, what could derail, what you will do anyway.',
    why: 'Turns vague pressure into named choices.',
    durationMin: 5,
    intensity: 1,
  },
  {
    kind: 'planning',
    title: 'Plan the strike',
    cue: 'Choose the first 90-minute block and the one task that earns the day.',
    why: 'Makes focus concrete before notifications compete.',
    durationMin: 5,
    intensity: 2,
  },
  {
    kind: 'clean',
    title: 'Clean reset',
    cue: 'Clear the surface, make the bed, remove one trap.',
    why: 'Environment is the quiet half of discipline.',
    durationMin: 3,
    intensity: 1,
  },
];

const compactBlocks: RitualBlockKind[] = ['wake', 'hydrate', 'breath', 'mobility', 'planning', 'prime'];

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function moodScore(mood: ReadinessMood): number {
  if (mood === 'charged') return 88;
  if (mood === 'steady') return 68;
  return 42;
}

export function computeReadiness(input: ReadinessInput): MorningReadiness {
  const timeScore = input.timeAvailable >= 45 ? 100 : input.timeAvailable >= 20 ? 72 : input.timeAvailable >= 7 ? 45 : 20;
  const recoveryPenalty = input.soreness * 7 + input.stress * 6;
  const base = input.sleep * 12 + input.energy * 11 + input.motivation * 7 + moodScore(input.mood) * 0.2 + timeScore * 0.12;
  const score = Math.round(clamp(base - recoveryPenalty, 0, 100));
  let mode: RitualMode = 'normal';

  if (input.timeAvailable < 12 || score < 35) mode = 'minimum';
  else if (input.soreness >= 8 || input.stress >= 8) mode = 'recovery';
  else if (score >= 78 && input.timeAvailable >= 35) mode = 'push';
  else if (score < 58) mode = 'grounded';

  return {
    ...input,
    sleep: clamp(input.sleep, 1, 10),
    energy: clamp(input.energy, 1, 10),
    soreness: clamp(input.soreness, 1, 10),
    stress: clamp(input.stress, 1, 10),
    motivation: clamp(input.motivation, 1, 10),
    timeAvailable: clamp(input.timeAvailable, 5, 90),
    score,
    mode,
    checkedAt: new Date().toISOString(),
  };
}

function completionRate(profile: UserProfile, days: number): number {
  const logs = Object.values(profile.morningLogs || {})
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-days);
  if (logs.length === 0) return 0;
  return logs.filter((log) => log.completedAt).length / logs.length;
}

function mostMissedKind(profile: UserProfile): RitualBlockKind | null {
  const missed: Partial<Record<RitualBlockKind, number>> = {};
  for (const log of Object.values(profile.morningLogs || {}).slice(-14)) {
    for (const block of log.blocks) {
      if (!block.done) missed[block.kind] = (missed[block.kind] || 0) + 1;
    }
  }
  const entries = Object.entries(missed) as [RitualBlockKind, number][];
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0]?.[0] || null;
}

function buildBlocks(profile: UserProfile, readiness: MorningReadiness): RitualBlock[] {
  const missedKind = mostMissedKind(profile);
  let templates = fullRitual;

  if (readiness.mode === 'minimum') {
    templates = fullRitual
      .filter((block) => ['wake', 'hydrate', 'breath', 'planning'].includes(block.kind))
      .map((block) => ({ ...block, durationMin: block.kind === 'planning' ? 2 : block.kind === 'breath' ? 2 : 1 }));
  } else if (readiness.mode === 'grounded' || readiness.timeAvailable < 35) {
    templates = fullRitual
      .filter((block) => ['wake', 'hydrate', 'breath', 'mobility', 'journal', 'planning'].includes(block.kind))
      .map((block) => ({ ...block, durationMin: block.kind === 'mobility' ? 5 : block.durationMin }));
  } else if (readiness.mode === 'recovery') {
    templates = fullRitual
      .filter((block) => ['wake', 'hydrate', 'breath', 'mobility', 'journal', 'planning', 'clean'].includes(block.kind))
      .map((block) => ({
        ...block,
        title: block.kind === 'mobility' ? 'Recovery mobility' : block.title,
        durationMin: block.kind === 'mobility' ? 12 : block.durationMin,
        intensity: block.kind === 'mobility' ? 1 : block.intensity,
      }));
  }

  if (readiness.mode === 'push') {
    templates = templates.map((block) =>
      block.kind === 'training'
        ? { ...block, title: 'Primer circuit+', durationMin: 12, intensity: 4 }
        : block
    );
  }

  const total = templates.reduce((sum, block) => sum + block.durationMin, 0);
  const cap = readiness.mode === 'minimum' ? Math.min(readiness.timeAvailable, 7) : Math.min(readiness.timeAvailable, readiness.timeAvailable >= 45 ? 45 : 20);
  let blocks = templates;
  if (total > cap) {
    if (cap >= 40) {
      const scale = cap / total;
      blocks = templates.map((block) => ({ ...block, durationMin: Math.max(1, Math.round(block.durationMin * scale)) }));
      const drift = cap - blocks.reduce((sum, block) => sum + block.durationMin, 0);
      if (drift !== 0) {
        blocks = blocks.map((block) => block.kind === 'planning' ? { ...block, durationMin: Math.max(1, block.durationMin + drift) } : block);
      }
    } else {
      const keep = new Set(compactBlocks);
      blocks = templates.filter((block) => keep.has(block.kind) || block.kind === missedKind);
      const compactTotal = blocks.reduce((sum, block) => sum + block.durationMin, 0);
      if (compactTotal > cap) {
        const scale = cap / compactTotal;
        blocks = blocks.map((block) => ({ ...block, durationMin: Math.max(1, Math.round(block.durationMin * scale)) }));
        const drift = cap - blocks.reduce((sum, block) => sum + block.durationMin, 0);
        if (drift !== 0) {
          blocks = blocks.map((block) => block.kind === 'planning' ? { ...block, durationMin: Math.max(1, block.durationMin + drift) } : block);
        }
      }
    }
  }

  return blocks.map((block, index) => ({
    id: `${block.kind}-${index}`,
    kind: block.kind,
    title: block.title,
    cue: block.cue,
    why: block.why,
    durationMin: block.durationMin,
    intensity: block.intensity,
    optional: block.kind === 'cold' && readiness.mode !== 'push',
    done: false,
  }));
}

function coachNote(profile: UserProfile, readiness: MorningReadiness, blocks: RitualBlock[]): string {
  const recentRate = completionRate(profile, 7);
  const duration = blocks.reduce((sum, block) => sum + block.durationMin, 0);
  const mode = modeLabels[readiness.mode];
  if (readiness.mode === 'minimum') {
    return `Mode ${mode}: protect the chain. ${duration} minutes is enough today if it happens before the phone wins.`;
  }
  if (readiness.mode === 'recovery') {
    return `Mode ${mode}: your job is to leave the ritual calmer than you entered. No hero reps this morning.`;
  }
  if (recentRate >= 0.8 && readiness.mode === 'push') {
    return `Mode ${mode}: consistency is high. Add heat, finish fresh, then take the first deep-work block immediately.`;
  }
  if (recentRate < 0.4) {
    return `Mode ${mode}: reduce drama. Complete the first three blocks and the day has a spine again.`;
  }
  return `Mode ${mode}: ${duration} minutes to wake the body, clear the head, and choose the first strike.`;
}

export function createMorningRitual(profile: UserProfile, input: ReadinessInput): MorningRitualLog {
  const readiness = computeReadiness(input);
  const blocks = buildBlocks(profile, readiness);
  return {
    id: `${todayKey()}-morning`,
    date: todayKey(),
    mode: readiness.mode,
    targetDurationMin: blocks.reduce((sum, block) => sum + block.durationMin, 0),
    completedDurationMin: 0,
    quality: 0,
    readiness,
    blocks,
    coachNote: coachNote(profile, readiness, blocks),
  };
}

export function defaultMorningRitual(profile: UserProfile): MorningRitualLog {
  const previous = Object.values(profile.morningLogs || {}).sort((a, b) => b.date.localeCompare(a.date))[0];
  return createMorningRitual(profile, {
    sleep: previous?.readiness.sleep || 7,
    energy: previous?.readiness.energy || 6,
    soreness: previous?.readiness.soreness || 3,
    stress: previous?.readiness.stress || 4,
    timeAvailable: 45,
    mood: previous?.readiness.mood || 'steady',
    motivation: previous?.readiness.motivation || 6,
  });
}

export function updateRitualBlock(log: MorningRitualLog, blockId: string, done: boolean): MorningRitualLog {
  const blocks = log.blocks.map((block) => block.id === blockId ? { ...block, done } : block);
  const completedDurationMin = blocks.filter((block) => block.done).reduce((sum, block) => sum + block.durationMin, 0);
  const quality = log.targetDurationMin > 0 ? Math.round((completedDurationMin / log.targetDurationMin) * 100) : 0;
  return {
    ...log,
    blocks,
    completedDurationMin,
    quality,
    completedAt: quality >= 80 ? (log.completedAt || new Date().toISOString()) : undefined,
  };
}

export function completeRitual(log: MorningRitualLog): MorningRitualLog {
  const blocks = log.blocks.map((block) => ({ ...block, done: true }));
  return {
    ...log,
    blocks,
    completedDurationMin: log.targetDurationMin,
    quality: 100,
    completedAt: new Date().toISOString(),
  };
}

export function getMorningStats(profile: UserProfile) {
  const logs = Object.values(profile.morningLogs || {}).sort((a, b) => a.date.localeCompare(b.date));
  const last14 = logs.slice(-14);
  const completed = logs.filter((log) => log.completedAt);
  const avgQuality = last14.length > 0 ? Math.round(last14.reduce((sum, log) => sum + log.quality, 0) / last14.length) : 0;
  const avgReadiness = last14.length > 0 ? Math.round(last14.reduce((sum, log) => sum + log.readiness.score, 0) / last14.length) : 0;
  const missedKind = mostMissedKind(profile);

  let streak = 0;
  const cursor = new Date();
  while (true) {
    const key = cursor.toISOString().slice(0, 10);
    const log = profile.morningLogs?.[key];
    if (log?.completedAt || (log?.quality || 0) >= 80) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  const impactLogs = logs.filter((log) => profile.logs[log.date]);
  const completedImpact = impactLogs.filter((log) => log.completedAt && profile.logs[log.date]);
  const averageDayScoreAfterRitual = completedImpact.length > 0
    ? Math.round(completedImpact.reduce((sum, log) => sum + profile.logs[log.date].monkScore, 0) / completedImpact.length)
    : 0;

  return {
    total: logs.length,
    completed: completed.length,
    streak,
    avgQuality,
    avgReadiness,
    missedKind,
    averageDayScoreAfterRitual,
  };
}

export function ritualModeLabel(mode: RitualMode): string {
  return modeLabels[mode];
}
