'use client';

import { useEffect, useMemo, useState } from 'react';
import { MorningReadiness, MorningRitualLog, ReadinessMood, RitualBlock, UserProfile } from '@/lib/types';
import { completeRitual, createMorningRitual, getMorningStats, ritualModeLabel, updateRitualBlock } from '@/lib/morning';
import { getTodayMorningRitual, saveMorningRitual } from '@/lib/store';
import { LocalMorningCoach, MORNING_COACH_CONTRACT } from '@/lib/coach';
import { hapticLight, hapticSuccess } from '@/lib/haptics';

interface Props {
  profile: UserProfile;
  onUpdate: (profile: UserProfile) => void;
  onOpenToday?: () => void;
}

const blockIcons: Record<string, string> = {
  wake: '☼',
  hydrate: '◌',
  mobility: '↻',
  breath: '≈',
  training: '▲',
  cold: '✦',
  journal: '✎',
  planning: '⌁',
  clean: '□',
  prime: '→',
};

const moodOptions: { id: ReadinessMood; label: string }[] = [
  { id: 'flat', label: 'Flat' },
  { id: 'steady', label: 'Steady' },
  { id: 'charged', label: 'Charged' },
];

const moodHints: Record<ReadinessMood, string> = {
  flat: 'Low drive',
  steady: 'Normal',
  charged: 'Ready',
};

function StatPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-forge-border/75 bg-forge-bg/35 px-3 py-2">
      <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-forge-muted">{label}</p>
      <p className="mt-1 text-lg font-black tabular-nums text-forge-text">{value}</p>
    </div>
  );
}

function Slider({
  label,
  value,
  onChange,
  low,
  high,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  low: string;
  high: string;
}) {
  return (
    <label className="block rounded-xl border border-forge-border/75 bg-forge-bg/30 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-forge-muted">{label}</span>
        <span className="font-mono text-sm font-black text-forge-green">{value}</span>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full"
      />
      <div className="mt-1 flex justify-between text-[9px] text-forge-muted">
        <span>{low}</span>
        <span>{high}</span>
      </div>
    </label>
  );
}

function formatTime(seconds: number): string {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function nextOpenBlock(blocks: RitualBlock[]): RitualBlock | undefined {
  return blocks.find((block) => !block.done);
}

function coachDirective(block?: RitualBlock): string {
  if (!block) return 'Ritual done. Open Today and lock the first real task before any feed.';
  if (block.kind === 'training') {
    return 'Do the circuit exactly as written. This is a warm-up primer, not a workout PR.';
  }
  if (block.kind === 'planning') {
    return 'Choose one task that makes the day count. Start that task before checking messages.';
  }
  if (block.kind === 'breath') {
    return 'Slow the system down first. The goal is control, not intensity.';
  }
  return block.cue;
}

function ReadinessPanel({
  readiness,
  onGenerate,
}: {
  readiness: MorningReadiness;
  onGenerate: (input: {
    sleep: number;
    energy: number;
    soreness: number;
    stress: number;
    timeAvailable: number;
    mood: ReadinessMood;
    motivation: number;
  }) => void;
}) {
  const [sleep, setSleep] = useState(readiness.sleep);
  const [energy, setEnergy] = useState(readiness.energy);
  const [soreness, setSoreness] = useState(readiness.soreness);
  const [stress, setStress] = useState(readiness.stress);
  const [timeAvailable, setTimeAvailable] = useState(readiness.timeAvailable);
  const [mood, setMood] = useState<ReadinessMood>(readiness.mood);
  const [motivation, setMotivation] = useState(readiness.motivation);

  return (
    <section className="forge-card rounded-2xl p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-forge-muted">Readiness check</p>
          <h3 className="mt-1 text-lg font-black">Tell Forge what you can handle.</h3>
          <p className="mt-1 text-xs leading-relaxed text-forge-muted">
            Adjust the sliders, set your available minutes, then Forge builds the right ritual for this morning.
          </p>
        </div>
        <div className="rounded-full border border-forge-green/50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-forge-green">
          20 sec
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Slider label="Sleep" value={sleep} onChange={setSleep} low="bad" high="deep" />
        <Slider label="Energy" value={energy} onChange={setEnergy} low="low" high="high" />
        <Slider label="Soreness" value={soreness} onChange={setSoreness} low="fresh" high="heavy" />
        <Slider label="Stress" value={stress} onChange={setStress} low="calm" high="wired" />
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1.2fr]">
        <label className="rounded-xl border border-forge-border/75 bg-forge-bg/30 p-3">
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-forge-muted">Minutes available</span>
          <input
            type="number"
            min={5}
            max={90}
            value={timeAvailable}
            onChange={(event) => setTimeAvailable(Number(event.target.value))}
            className="mt-2 w-full bg-transparent text-2xl font-black text-forge-text outline-none"
          />
          <span className="mt-1 block text-[9px] leading-snug text-forge-muted">How long you can give before the day starts.</span>
        </label>
        <div className="rounded-xl border border-forge-border/75 bg-forge-bg/30 p-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-forge-muted">Mood</p>
          <div className="mt-2 grid grid-cols-3 gap-1">
            {moodOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setMood(option.id)}
                className={`min-w-0 rounded-lg border px-1 py-2 text-center transition-colors ${
                  mood === option.id ? 'border-forge-green bg-forge-green/10 text-forge-green' : 'border-forge-border text-forge-muted'
                }`}
              >
                <span className="block truncate text-[10px] font-black uppercase tracking-[0.04em]">{option.label}</span>
                <span className="mt-0.5 block truncate text-[9px] normal-case tracking-normal opacity-75">{moodHints[option.id]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3">
        <Slider label="Motivation" value={motivation} onChange={setMotivation} low="none" high="locked" />
      </div>

      <button
        onClick={() => {
          hapticLight();
          onGenerate({ sleep, energy, soreness, stress, timeAvailable, mood, motivation });
        }}
        className="mt-4 w-full rounded-xl bg-forge-green px-4 py-3 text-sm font-black uppercase tracking-[0.18em] text-forge-bg active:scale-[0.99]"
      >
        Build my morning plan
      </button>
    </section>
  );
}

function RitualBlockRow({
  block,
  active,
  onToggle,
}: {
  block: RitualBlock;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`forge-rail w-full pl-4 text-left transition-all ${active ? 'scale-[1.01]' : ''}`}
    >
      <div className={`rounded-xl border p-3 ${
        block.done
          ? 'border-forge-green/35 bg-forge-green/5'
          : active
            ? 'border-forge-amber/60 bg-forge-amber/8'
            : 'border-forge-border/75 bg-forge-bg/30'
      }`}>
        <div className="flex items-start gap-3">
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border font-black ${
            block.done ? 'border-forge-green text-forge-green' : active ? 'border-forge-amber text-forge-amber' : 'border-forge-border text-forge-muted'
          }`}>
            {block.done ? '✓' : blockIcons[block.kind]}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-black text-forge-text">{block.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-forge-muted">{block.cue}</p>
              </div>
              <span className="rounded-full border border-forge-border px-2 py-1 text-[10px] font-black text-forge-muted">
                {block.durationMin}m
              </span>
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-forge-muted/80">{block.why}</p>
          </div>
        </div>
      </div>
    </button>
  );
}

export default function MorningView({ profile, onUpdate, onOpenToday }: Props) {
  const ritual = getTodayMorningRitual(profile);
  const stats = getMorningStats(profile);
  const activeBlock = useMemo(() => nextOpenBlock(ritual.blocks), [ritual.blocks]);
  const [timer, setTimer] = useState<{ blockId: string | null; secondsLeft: number; running: boolean }>({
    blockId: activeBlock?.id || null,
    secondsLeft: (activeBlock?.durationMin || 0) * 60,
    running: false,
  });
  const coach = useMemo(() => new LocalMorningCoach(), []);
  const [coachLine, setCoachLine] = useState(ritual.coachNote);

  useEffect(() => {
    if (!timer.running || !activeBlock || timer.blockId !== activeBlock.id) return;
    const interval = window.setInterval(() => {
      setTimer((value) => {
        if (value.secondsLeft <= 1) {
          window.clearInterval(interval);
          const next = updateRitualBlock(ritual, activeBlock.id, true);
          onUpdate(saveMorningRitual(profile, next));
          hapticSuccess();
          return { ...value, secondsLeft: 0, running: false };
        }
        return { ...value, secondsLeft: value.secondsLeft - 1 };
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [activeBlock, onUpdate, profile, ritual, timer.blockId, timer.running]);

  useEffect(() => {
    coach.recommendMorningRitual({ profile, readiness: ritual.readiness, currentRitual: ritual })
      .then((result) => setCoachLine(result.rationale))
      .catch(() => setCoachLine(ritual.coachNote));
  }, [coach, profile, ritual]);

  const saveRitual = (next: MorningRitualLog) => {
    onUpdate(saveMorningRitual(profile, next));
  };

  const completed = Boolean(ritual.completedAt || ritual.quality >= 80);
  const activeIndex = activeBlock ? ritual.blocks.findIndex((block) => block.id === activeBlock.id) : ritual.blocks.length - 1;
  const displayedSeconds = timer.blockId === activeBlock?.id ? timer.secondsLeft : (activeBlock?.durationMin || 0) * 60;
  const timerRunning = Boolean(activeBlock && timer.blockId === activeBlock.id && timer.running);

  return (
    <div className="space-y-4">
      <section className="forge-ember-border relative overflow-hidden rounded-2xl p-5">
        <div className="absolute -right-20 top-0 h-56 w-56 rounded-full bg-forge-green/10 blur-3xl" />
        <div className="relative">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-forge-green">Morning OS</p>
          <div className="mt-2 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-4xl font-black leading-none tracking-[-0.05em]">
                Be operational.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-forge-muted">
                A 45 minute launch ritual that adapts to sleep, stress, soreness, time and yesterday&apos;s signal.
              </p>
            </div>
            <div className="text-right">
              <p className="text-5xl font-black tabular-nums text-forge-green">{ritual.readiness.score}</p>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-forge-muted">readiness</p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-4 gap-2">
            <StatPill label="Mode" value={ritualModeLabel(ritual.mode)} />
            <StatPill label="Target" value={`${ritual.targetDurationMin}m`} />
            <StatPill label="Done" value={`${ritual.completedDurationMin}m`} />
            <StatPill label="Quality" value={`${ritual.quality}%`} />
          </div>

          <div className="mt-4 rounded-xl border border-forge-border/75 bg-forge-bg/45 p-3">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-forge-muted">Coach note</p>
            <p className="mt-1 text-sm leading-relaxed text-forge-text">{coachLine}</p>
          </div>
        </div>
      </section>

      <section className="forge-card rounded-2xl p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-forge-muted">Now</p>
            <h3 className="mt-1 text-xl font-black">{activeBlock ? activeBlock.title : 'Ritual complete'}</h3>
            <p className="mt-1 text-xs text-forge-muted">
              {activeBlock ? `Block ${activeIndex + 1}/${ritual.blocks.length}` : 'Lock the first real task before opening feeds.'}
            </p>
          </div>
          <div className="text-right">
            <p className="font-mono text-4xl font-black tabular-nums text-forge-text">{formatTime(displayedSeconds)}</p>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-forge-muted">timer</p>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-forge-green/35 bg-forge-green/10 p-3">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-forge-green">Coach says now</p>
          <p className="mt-1 text-sm font-semibold leading-relaxed text-forge-text">{coachDirective(activeBlock)}</p>
          {activeBlock && (
            <p className="mt-2 text-xs leading-relaxed text-forge-muted">{activeBlock.cue}</p>
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            disabled={!activeBlock || completed}
            onClick={() => {
              hapticLight();
              if (!activeBlock) return;
              setTimer((value) => ({
                blockId: activeBlock.id,
                secondsLeft: value.blockId === activeBlock.id ? value.secondsLeft : activeBlock.durationMin * 60,
                running: value.blockId === activeBlock.id ? !value.running : true,
              }));
            }}
            className="rounded-xl bg-forge-red px-4 py-3 text-sm font-black uppercase tracking-[0.18em] text-white disabled:opacity-40"
          >
            {timerRunning ? 'Pause' : 'Start block'}
          </button>
          <button
            onClick={() => {
              hapticSuccess();
              saveRitual(completeRitual(ritual));
            }}
            className="rounded-xl border border-forge-green/50 px-4 py-3 text-sm font-black uppercase tracking-[0.18em] text-forge-green"
          >
            Finish ritual
          </button>
        </div>

        {activeBlock?.kind === 'training' && onOpenToday && (
          <button
            onClick={() => {
              hapticLight();
              onOpenToday();
            }}
            className="mt-2 w-full rounded-xl border border-forge-border/80 bg-forge-bg/35 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-forge-text"
          >
            Open today&apos;s tasks after primer
          </button>
        )}
      </section>

      <ReadinessPanel
        readiness={ritual.readiness}
        onGenerate={(input) => saveRitual(createMorningRitual(profile, input))}
      />

      <section className="space-y-3">
        {ritual.blocks.map((block) => (
          <RitualBlockRow
            key={block.id}
            block={block}
            active={activeBlock?.id === block.id}
            onToggle={() => {
              hapticLight();
              saveRitual(updateRitualBlock(ritual, block.id, !block.done));
            }}
          />
        ))}
      </section>

      <section className="forge-card rounded-2xl p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-forge-muted">Progression</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <StatPill label="Morning streak" value={stats.streak} />
          <StatPill label="Avg quality" value={`${stats.avgQuality}%`} />
          <StatPill label="Avg readiness" value={`${stats.avgReadiness}%`} />
          <StatPill label="Day impact" value={stats.averageDayScoreAfterRitual ? `${stats.averageDayScoreAfterRitual}%` : 'new'} />
        </div>
        <div className="mt-3 rounded-xl border border-forge-border/75 bg-forge-bg/35 p-3">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-forge-muted">Insight</p>
          <p className="mt-1 text-sm leading-relaxed text-forge-text">
            {stats.missedKind
              ? `${blockIcons[stats.missedKind]} ${stats.missedKind} is the block most often missed. Forge will keep it visible until it stabilizes.`
              : 'Complete three mornings and Forge will start detecting which block makes or breaks the day.'}
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-forge-border/75 bg-forge-bg/30 p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-forge-muted">Claude-ready contract</p>
        <p className="mt-2 text-xs leading-relaxed text-forge-muted">
          Local coach now, Claude later. The API layer will receive readiness, last 14 rituals and day outcomes, then return mode,
          timed blocks, one coach note and safe adjustments.
        </p>
        <p className="mt-2 text-[10px] leading-relaxed text-forge-muted/75">
          Guardrail: {MORNING_COACH_CONTRACT.guardrails[3]}
        </p>
      </section>
    </div>
  );
}
