import { MorningReadiness, MorningRitualLog, UserProfile } from './types';

export interface CoachContext {
  profile: UserProfile;
  readiness: MorningReadiness;
  currentRitual: MorningRitualLog;
}

export interface CoachRecommendation {
  headline: string;
  rationale: string;
  adjustments: {
    blockId: string;
    instruction: string;
  }[];
}

export interface CoachIntelligence {
  recommendMorningRitual(ctx: CoachContext): Promise<CoachRecommendation>;
  reviewMorningWeek(profile: UserProfile): Promise<string>;
}

export const MORNING_COACH_CONTRACT = {
  system:
    'You are Forge Morning Coach. You adapt a local-first morning ritual without shame, fake certainty, or medical claims. Optimize for waking clarity, consistency, and the first deep-work action.',
  inputs: [
    'user goals and selected domains',
    'readiness check: sleep, energy, soreness, stress, time available, mood, motivation',
    'last 14 morning ritual logs',
    'day outcomes: clean score, focus score, quests completed',
  ],
  outputs: [
    'ritual mode: push, normal, grounded, minimum, or recovery',
    'timed ritual blocks with cues and reasons',
    'one coach note under 35 words',
    'safe adjustment after missed, painful, tired, or late mornings',
  ],
  guardrails: [
    'Do not require cloud access for the app to work.',
    'Do not claim diagnosis or medical advice.',
    'Do not increase intensity when soreness or stress is high.',
    'Prefer a completed 7 minute ritual over a skipped 45 minute ritual.',
  ],
} as const;

export class LocalMorningCoach implements CoachIntelligence {
  async recommendMorningRitual(ctx: CoachContext): Promise<CoachRecommendation> {
    const weakest = ctx.currentRitual.blocks.find((block) => !block.done);
    return {
      headline: `${ctx.currentRitual.mode} ritual is enough today`,
      rationale: ctx.currentRitual.coachNote,
      adjustments: weakest
        ? [{
            blockId: weakest.id,
            instruction: `Start with ${weakest.title.toLowerCase()}. Do not renegotiate the whole ritual before this block is complete.`,
          }]
        : [],
    };
  }

  async reviewMorningWeek(profile: UserProfile): Promise<string> {
    const logs = Object.values(profile.morningLogs || {}).slice(-7);
    if (logs.length === 0) return 'No morning data yet. Run the ritual once before reviewing the week.';
    const avgQuality = Math.round(logs.reduce((sum, log) => sum + log.quality, 0) / logs.length);
    const completed = logs.filter((log) => log.completedAt).length;
    return `Morning quality averaged ${avgQuality}% with ${completed}/${logs.length} completed rituals. Keep the first block frictionless.`;
  }
}
