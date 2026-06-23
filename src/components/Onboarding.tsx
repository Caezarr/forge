'use client';

import { useState, useEffect, useRef } from 'react';
import { OnboardingData, SkillLevel, SkillId, RunningTestType, Intensity, Poison, PRESET_SKILLS, LifeDomainId, LIFE_DOMAINS } from '@/lib/types';

interface Props {
  onComplete: (data: OnboardingData) => void;
}

// ── Domain → Skill mapping ──────────────────────────────────────────

interface SkillDef {
  id: SkillId;
  label: string;
  icon: string;
  category: 'bodyweight' | 'cardio' | 'mental' | 'recovery' | 'custom';
  domain: LifeDomainId;
}

const ALL_SKILLS: SkillDef[] = [
  // Body
  { id: 'pushups', label: 'Push-ups', icon: '💪', category: 'bodyweight', domain: 'body' },
  { id: 'pullups', label: 'Pull-ups', icon: '🏋️', category: 'bodyweight', domain: 'body' },
  { id: 'dips', label: 'Dips', icon: '🤸', category: 'bodyweight', domain: 'body' },
  { id: 'core', label: 'Core', icon: '🎯', category: 'bodyweight', domain: 'body' },
  { id: 'running', label: 'Running', icon: '👟', category: 'cardio', domain: 'body' },
  { id: 'mobility', label: 'Mobility', icon: '🧘', category: 'recovery', domain: 'body' },
  // Mind
  { id: 'reading', label: 'Reading', icon: '📖', category: 'mental', domain: 'mind' },
  { id: 'meditation', label: 'Meditation', icon: '🪷', category: 'recovery', domain: 'mind' },
  { id: 'journaling', label: 'Journaling', icon: '✍️', category: 'mental', domain: 'mind' },
  // Career
  { id: 'deepwork', label: 'Deep Work', icon: '🧠', category: 'mental', domain: 'career' },
  { id: 'shipping', label: 'Daily Ship', icon: '🚀', category: 'custom', domain: 'career' },
  { id: 'learning', label: 'Learning', icon: '📚', category: 'mental', domain: 'career' },
];

const runningTests: { id: RunningTestType; label: string; placeholder: string; unit: string }[] = [
  { id: 'vma', label: 'VMA', placeholder: 'e.g. 12', unit: 'km/h' },
  { id: '5k', label: '5K time', placeholder: 'e.g. 28:00', unit: 'mm:ss' },
  { id: '10k', label: '10K time', placeholder: 'e.g. 58:00', unit: 'mm:ss' },
  { id: 'cooper', label: 'Cooper', placeholder: 'e.g. 2400', unit: 'm' },
  { id: 'none', label: 'No test', placeholder: 'e.g. 3', unit: 'runs/wk' },
];

const poisonList: { id: Poison; label: string; icon: string }[] = [
  { id: 'instagram', label: 'Instagram', icon: '📸' },
  { id: 'tiktok', label: 'TikTok', icon: '🎵' },
  { id: 'shorts', label: 'Shorts', icon: '📱' },
  { id: 'alcohol', label: 'Alcohol', icon: '🍷' },
  { id: 'junkfood', label: 'Junk Food', icon: '🍔' },
  { id: 'porn', label: 'Porn', icon: '🚫' },
  { id: 'nicotine', label: 'Nicotine', icon: '🚬' },
  { id: 'soda', label: 'Soda', icon: '🥤' },
];

// ── Helpers ──────────────────────────────────────────────────────────

function estimateVMA(testType: RunningTestType, value: string): number {
  const num = parseFloat(value);
  if (isNaN(num) || num <= 0) return 0;
  switch (testType) {
    case 'vma': return num;
    case '5k': { const parts = value.split(':'); const sec = parts.length === 2 ? parseInt(parts[0]) * 60 + parseInt(parts[1]) : num * 60; return Math.round(5 / (sec / 3600) / 0.85 * 10) / 10; }
    case '10k': { const parts = value.split(':'); const sec = parts.length === 2 ? parseInt(parts[0]) * 60 + parseInt(parts[1]) : num * 60; return Math.round(10 / (sec / 3600) / 0.82 * 10) / 10; }
    case 'cooper': return Math.round(((num - 504.9) / 44.73) * 10) / 10;
    default: return 0;
  }
}

function runGoal(vma: number): number {
  if (vma <= 0) return 3;
  if (vma < 10) return Math.ceil(vma + 2);
  if (vma < 14) return Math.ceil(vma + 1.5);
  if (vma < 18) return Math.ceil(vma + 1);
  return Math.ceil(vma + 0.5);
}

function deepworkGoal(maxMin: number): number {
  if (maxMin < 30) return 60;
  if (maxMin < 60) return 90;
  if (maxMin < 90) return 120;
  if (maxMin < 120) return 180;
  return 240;
}

interface SkillState {
  current: string;
  assisted: boolean;
  runTestType: RunningTestType;
  runTestValue: string;
}

const emptySkillState: SkillState = { current: '', assisted: false, runTestType: 'vma', runTestValue: '' };

// ── Sub-components ──────────────────────────────────────────────────

function Stepper({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-0 w-full max-w-[240px] mx-auto">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center flex-1 last:flex-none">
          <div className={`w-3 h-3 rounded-full border-2 transition-all duration-500 shrink-0 ${
            i < current ? 'bg-forge-red border-forge-red'
            : i === current ? 'bg-transparent border-forge-red shadow-[0_0_8px_rgba(220,38,38,0.4)]'
            : 'bg-transparent border-forge-border'
          }`} />
          {i < total - 1 && <div className="flex-1 h-[1px] mx-1"><div className={`h-full transition-all duration-700 ${i < current ? 'bg-forge-red' : 'bg-forge-border'}`} /></div>}
        </div>
      ))}
    </div>
  );
}

function SplashScreen({ onStart }: { onStart: () => void }) {
  const [visible, setVisible] = useState(false);
  const [tagline, setTagline] = useState(false);
  const [btn, setBtn] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 200);
    const t2 = setTimeout(() => setTagline(true), 900);
    const t3 = setTimeout(() => setBtn(true), 1500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div className="min-h-screen bg-forge-bg flex flex-col items-center justify-center px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(143,214,201,0.12)_0%,transparent_70%)]" />
      <div className="relative z-10 flex flex-col items-center">
        <div className={`transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="mx-auto mb-5 forge-mark text-lg">F</div>
          <h1 className="text-5xl font-black tracking-[0.24em] text-forge-text text-center">FORGE</h1>
          <div className="flex justify-center mt-2"><div className="h-[1px] w-20 bg-forge-green" /></div>
          <p className="text-[11px] tracking-[0.28em] text-forge-red font-bold text-center mt-3">DAILY PROTOCOL</p>
        </div>
        <div className={`mt-12 transition-all duration-1000 delay-200 ${tagline ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <p className="text-lg text-center text-forge-text/70 leading-relaxed max-w-[260px]">
            A local instrument for the day you said you would live.
          </p>
        </div>
        <div className={`mt-16 w-full max-w-[280px] transition-all duration-700 ${btn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <button onClick={onStart} className="w-full py-4 bg-forge-green text-forge-bg font-black tracking-[0.18em] text-sm rounded-xl active:scale-[0.98] transition-all duration-200 shadow-[0_0_30px_rgba(143,214,201,0.16)]">
            BUILD MY DAY
          </button>
          <p className="text-center text-[10px] text-forge-muted mt-4 tracking-wider">LOCAL-FIRST · NO ACCOUNT REQUIRED</p>
        </div>
      </div>
    </div>
  );
}

function GeneratingScreen({ data, onDone }: { data: OnboardingData; onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  const [line, setLine] = useState(0);

  const domainNames = (data.domains || []).map(d => LIFE_DOMAINS[d].name.toUpperCase());
  const lines = [
    `Domains: ${domainNames.join(' + ') || 'CUSTOM'}`,
    `Skills mapped: ${data.skills.length}`,
    `Intensity: ${data.intensity?.toUpperCase() || 'BALANCED'}`,
    data.poisons.length > 0 ? `Distractions tracked: ${data.poisons.length}` : 'Clean mode: active',
    `Motivation: "${(data.motivation || 'Discipline').slice(0, 40)}"`,
    'Building progression curve...',
    'Writing to local storage only...',
    'Your daily instrument is ready.',
  ];

  useEffect(() => {
    const iv = setInterval(() => {
      setProgress(p => { if (p >= 100) { clearInterval(iv); setTimeout(onDone, 600); return 100; } return p + 2; });
    }, 40);
    return () => clearInterval(iv);
  }, [onDone]);

  useEffect(() => {
    const iv = setInterval(() => setLine(l => l < lines.length - 1 ? l + 1 : l), 250);
    return () => clearInterval(iv);
  }, [lines.length]);

  return (
    <div className="min-h-screen bg-forge-bg flex flex-col items-center justify-center px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(143,214,201,0.12)_0%,transparent_70%)]" />
      <div className="relative z-10 w-full max-w-[300px]">
        <h1 className="text-2xl font-black tracking-[0.25em] text-forge-text text-center mb-1">FORGE</h1>
        <p className="text-[10px] tracking-[0.28em] text-forge-red font-bold text-center mb-12">DAILY PROTOCOL</p>
        <div className="space-y-2 mb-10 font-mono text-[11px] h-[200px]">
          {lines.slice(0, line + 1).map((l, i) => (
            <div key={i} className={`flex items-center gap-2 transition-all duration-300 ${i <= line ? 'opacity-100' : 'opacity-0'}`}>
              <span className={i < line ? 'text-forge-green' : 'text-forge-red'}>{i < line ? '✓' : '›'}</span>
              <span className={i < line ? 'text-forge-muted' : 'text-forge-text'}>{l}</span>
            </div>
          ))}
        </div>
        <div className="w-full">
          <div className="flex justify-between text-[10px] text-forge-muted mb-2 tracking-wider">
            <span>FORGING PROTOCOL</span><span>{progress}%</span>
          </div>
          <div className="w-full h-1 bg-forge-border rounded-full overflow-hidden">
            <div className="h-full bg-forge-red rounded-full transition-all duration-100" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Check({ className = 'w-3 h-3' }: { className?: string }) {
  return (
    <svg className={`${className} text-white`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

// ── Skill Assessment Panels ─────────────────────────────────────────

function BodyweightPanel({ skillId, state, onUpdate }: {
  skillId: string; state: SkillState; onUpdate: (p: Partial<SkillState>) => void;
}) {
  const current = parseInt(state.current || '0') || 0;
  const defaults: Record<string, number> = { pushups: 50, pullups: 15, dips: 30, core: 60 };
  const goal = current >= (defaults[skillId] || 50) ? Math.ceil(current * 1.5) : (defaults[skillId] || 50);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <label className="text-[10px] text-forge-muted tracking-wider w-16">MAX</label>
        <input type="number" inputMode="numeric" min={0} value={state.current ?? ''} onChange={e => onUpdate({ current: e.target.value })}
          placeholder="e.g. 10" className="flex-1 bg-forge-bg border border-forge-border rounded-lg px-3 py-2 text-forge-text text-sm placeholder:text-forge-muted/40 tabular-nums focus:border-forge-red/50 focus:outline-none" />
        <span className="text-[10px] text-forge-muted w-8">reps</span>
      </div>
      {skillId === 'pullups' && (
        <button onClick={() => onUpdate({ assisted: !state.assisted })} className="flex items-center gap-2 ml-[76px]">
          <div className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${state.assisted ? 'border-forge-red bg-forge-red' : 'border-forge-border'}`}>
            {state.assisted && <Check className="w-2.5 h-2.5" />}
          </div>
          <span className="text-[11px] text-forge-muted">Assisted</span>
        </button>
      )}
      {state.current && current >= 0 && (
        <div className="flex items-center gap-2 ml-[76px]">
          <span className="text-[10px] text-forge-muted tracking-wider">GOAL</span>
          <span className="text-sm font-bold text-forge-red tabular-nums">{goal} reps</span>
        </div>
      )}
    </div>
  );
}

function RunningPanel({ state, onUpdate }: { state: SkillState; onUpdate: (p: Partial<SkillState>) => void }) {
  const test = runningTests.find(t => t.id === state.runTestType)!;
  const vma = estimateVMA(state.runTestType, state.runTestValue);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {runningTests.map(t => (
          <button key={t.id} onClick={() => onUpdate({ runTestType: t.id })}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all ${
              state.runTestType === t.id ? 'border-forge-red bg-forge-red/10 text-forge-red' : 'border-forge-border text-forge-muted'
            }`}>{t.label}</button>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <label className="text-[10px] text-forge-muted tracking-wider w-16">VALUE</label>
        <input type={state.runTestType === '5k' || state.runTestType === '10k' ? 'text' : 'number'}
          inputMode={state.runTestType === '5k' || state.runTestType === '10k' ? 'text' : 'numeric'}
          value={state.runTestValue} onChange={e => onUpdate({ runTestValue: e.target.value })}
          placeholder={test.placeholder}
          className="flex-1 bg-forge-bg border border-forge-border rounded-lg px-3 py-2 text-forge-text text-sm placeholder:text-forge-muted/40 tabular-nums focus:border-forge-red/50 focus:outline-none" />
        <span className="text-[10px] text-forge-muted w-12 text-right">{test.unit}</span>
      </div>
      {state.runTestValue && vma > 0 && (
        <div className="flex items-center gap-3 ml-[76px]">
          <span className="text-[10px] text-forge-muted">VMA</span>
          <span className="text-sm font-bold tabular-nums">{vma}</span>
          <span className="text-[10px] text-forge-muted">→ GOAL</span>
          <span className="text-sm font-bold text-forge-red">{runGoal(vma)} km/h</span>
        </div>
      )}
    </div>
  );
}

function DurationPanel({ skillId, state, onUpdate, placeholder, unit, label }: {
  skillId: string; state: SkillState; onUpdate: (p: Partial<SkillState>) => void;
  placeholder: string; unit: string; label: string;
}) {
  const current = parseInt(state.current || '0') || 0;
  const goalVal = skillId === 'deepwork' ? deepworkGoal(current)
    : skillId === 'meditation' ? (current < 5 ? 10 : current < 10 ? 15 : current < 15 ? 20 : 30)
    : skillId === 'learning' ? (current < 15 ? 30 : current < 30 ? 45 : 60)
    : skillId === 'mobility' ? (current < 2 ? 5 : 7)
    : current + 15;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <label className="text-[10px] text-forge-muted tracking-wider w-16">{label}</label>
        <input type="number" inputMode="numeric" min={0} value={state.current ?? ''} onChange={e => onUpdate({ current: e.target.value })}
          placeholder={placeholder}
          className="flex-1 bg-forge-bg border border-forge-border rounded-lg px-3 py-2 text-forge-text text-sm placeholder:text-forge-muted/40 tabular-nums focus:border-forge-red/50 focus:outline-none" />
        <span className="text-[10px] text-forge-muted w-12 text-right">{unit}</span>
      </div>
      {state.current && current >= 0 && (
        <div className="flex items-center gap-2 ml-[76px]">
          <span className="text-[10px] text-forge-muted tracking-wider">GOAL</span>
          <span className="text-sm font-bold text-forge-red tabular-nums">{goalVal} {unit}</span>
        </div>
      )}
    </div>
  );
}

function SimpleGoalPanel({ state, onUpdate, placeholder, unit }: {
  state: SkillState; onUpdate: (p: Partial<SkillState>) => void;
  placeholder: string; unit: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <label className="text-[10px] text-forge-muted tracking-wider w-16">GOAL</label>
      <input type="number" inputMode="numeric" min={0} value={state.current ?? ''} onChange={e => onUpdate({ current: e.target.value })}
        placeholder={placeholder}
        className="flex-1 bg-forge-bg border border-forge-border rounded-lg px-3 py-2 text-forge-text text-sm placeholder:text-forge-muted/40 tabular-nums focus:border-forge-red/50 focus:outline-none" />
      <span className="text-[10px] text-forge-muted w-12 text-right">{unit}</span>
    </div>
  );
}

// ── Skill Assessment Router ─────────────────────────────────────────

function SkillAssessment({ skill, state, onUpdate }: {
  skill: SkillDef; state: SkillState; onUpdate: (p: Partial<SkillState>) => void;
}) {
  if (skill.category === 'bodyweight') return <BodyweightPanel skillId={skill.id} state={state} onUpdate={onUpdate} />;
  if (skill.id === 'running') return <RunningPanel state={state} onUpdate={onUpdate} />;
  if (skill.id === 'deepwork') return <DurationPanel skillId="deepwork" state={state} onUpdate={onUpdate} placeholder="e.g. 45" unit="min" label="MAX" />;
  if (skill.id === 'meditation') return <DurationPanel skillId="meditation" state={state} onUpdate={onUpdate} placeholder="e.g. 10" unit="min" label="NOW" />;
  if (skill.id === 'learning') return <DurationPanel skillId="learning" state={state} onUpdate={onUpdate} placeholder="e.g. 30" unit="min" label="NOW" />;
  if (skill.id === 'mobility') return <DurationPanel skillId="mobility" state={state} onUpdate={onUpdate} placeholder="e.g. 2" unit="x/wk" label="NOW" />;
  if (skill.id === 'reading') return <SimpleGoalPanel state={state} onUpdate={onUpdate} placeholder="e.g. 20" unit="pages/day" />;
  // Boolean skills (journaling, shipping) — no assessment needed
  return <p className="text-[11px] text-forge-muted ml-[76px]">Daily habit — tracked as done/not done</p>;
}

// ── Main Onboarding ─────────────────────────────────────────────────

export default function Onboarding({ onComplete }: Props) {
  const [phase, setPhase] = useState<'splash' | 'wizard' | 'generating'>('splash');
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const [animating, setAnimating] = useState(false);

  // Step 0: Identity
  const [name, setName] = useState('');
  const [motivation, setMotivation] = useState('');
  const nameRef = useRef<HTMLInputElement>(null);

  // Step 1: Domains
  const [domains, setDomains] = useState<Set<LifeDomainId>>(new Set());

  // Step 2: Configure
  const [selectedSkills, setSelectedSkills] = useState<Set<SkillId>>(new Set());
  const [skillStates, setSkillStates] = useState<Record<string, SkillState>>({});
  const [selectedPoisons, setSelectedPoisons] = useState<Poison[]>([]);

  // Step 3: Protocol
  const [intensity, setIntensity] = useState<Intensity | null>(null);
  const [timeBudget, setTimeBudget] = useState(150);

  useEffect(() => {
    if (phase === 'wizard' && step === 0 && nameRef.current) {
      setTimeout(() => nameRef.current?.focus(), 400);
    }
  }, [phase, step]);

  const toggleDomain = (d: LifeDomainId) => {
    setDomains(prev => {
      const next = new Set(prev);
      if (next.has(d)) {
        next.delete(d);
        // Remove skills from this domain
        const domainSkillIds = ALL_SKILLS.filter(s => s.domain === d).map(s => s.id);
        setSelectedSkills(prev2 => {
          const n = new Set(prev2);
          domainSkillIds.forEach(id => n.delete(id));
          return n;
        });
      } else {
        next.add(d);
      }
      return next;
    });
  };

  const toggleSkill = (id: SkillId) => {
    setSelectedSkills(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  };

  const getState = (id: SkillId): SkillState => skillStates[id] || { ...emptySkillState };
  const updateState = (id: SkillId, patch: Partial<SkillState>) => {
    setSkillStates(prev => ({ ...prev, [id]: { ...(prev[id] || { ...emptySkillState }), ...patch } }));
  };

  const togglePoison = (p: Poison) => {
    setSelectedPoisons(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  };

  const buildSkills = (): SkillLevel[] => {
    return Array.from(selectedSkills).map((id, idx) => {
      const state = getState(id);
      const current = parseInt(state.current || '0') || 0;
      const preset = PRESET_SKILLS[id];
      const base = {
        name: preset?.name || id,
        icon: preset?.icon || '🎯',
        type: preset?.type || ('boolean' as const),
        category: preset?.category || ('custom' as const),
        sortOrder: idx,
      };

      if (id === 'running') {
        const vma = estimateVMA(state.runTestType, state.runTestValue);
        return { ...base, id, currentLevel: vma > 0 ? Math.round(vma) : current, goal: runGoal(vma), unit: 'km/h', testType: state.runTestType, testValue: state.runTestValue, estimatedVMA: vma };
      }
      if (id === 'deepwork') {
        return { ...base, id, currentLevel: current, goal: deepworkGoal(current), unit: 'min' };
      }
      if (id === 'mobility') {
        return { ...base, id, currentLevel: current, goal: current < 2 ? 5 : 7, unit: 'x/week' };
      }
      if (id === 'meditation') {
        return { ...base, id, currentLevel: current, goal: current < 5 ? 10 : current < 10 ? 15 : current < 15 ? 20 : 30, unit: 'min' };
      }
      if (id === 'learning') {
        return { ...base, id, currentLevel: current, goal: current < 15 ? 30 : current < 30 ? 45 : 60, unit: 'min' };
      }
      if (id === 'reading') {
        const goal = current > 0 ? current : 20;
        return { ...base, id, currentLevel: 0, goal, unit: 'pages' };
      }
      if (id === 'journaling' || id === 'shipping') {
        return { ...base, id, currentLevel: 0, goal: 1, unit: '' };
      }
      // Bodyweight
      const defaults: Record<string, number> = { pushups: 50, pullups: 15, dips: 30, core: 60 };
      let goal = defaults[id] || 50;
      if (current >= goal) goal = Math.ceil(current * 1.5);
      return { ...base, id, currentLevel: current, goal, unit: 'reps', assisted: id === 'pullups' ? state.assisted : undefined };
    });
  };

  const TOTAL_STEPS = 4;

  const canNext = (): boolean => {
    switch (step) {
      case 0: return name.trim().length > 0;
      case 1: return domains.size > 0;
      case 2: {
        if (selectedSkills.size === 0) return true; // Can proceed with just domain defaults
        for (const id of selectedSkills) {
          const def = ALL_SKILLS.find(s => s.id === id);
          if (!def) continue;
          const state = getState(id);
          // Only require input for skills that need assessment
          if (def.category === 'bodyweight') {
            if (!state.current || parseInt(state.current) < 0) return false;
          }
          if (id === 'running' && !state.runTestValue) return false;
          if (id === 'deepwork' && !state.current) return false;
        }
        return true;
      }
      case 3: return intensity !== null;
      default: return false;
    }
  };

  const goNext = () => {
    if (animating || !canNext()) return;
    setAnimating(true);
    setDirection('forward');
    setTimeout(() => {
      if (step < TOTAL_STEPS - 1) setStep(s => s + 1);
      else setPhase('generating');
      setAnimating(false);
    }, 300);
  };

  const goBack = () => {
    if (animating || step === 0) return;
    setAnimating(true);
    setDirection('back');
    setTimeout(() => { setStep(s => s - 1); setAnimating(false); }, 300);
  };

  const handleCustomStart = () => {
    onComplete({ name: name.trim(), archetype: null, skills: [], intensity: 'balanced', poisons: [], dailyTimeBudget: 120, motivation: '', domains: [] });
  };

  const handleFinish = () => {
    const domainArr = Array.from(domains);
    onComplete({
      name: name.trim(),
      archetype: null,
      skills: buildSkills(),
      intensity,
      poisons: selectedPoisons,
      dailyTimeBudget: timeBudget,
      motivation: motivation.trim(),
      domains: domainArr,
    });
  };

  const stepMeta = [
    { title: 'Who are you?', sub: 'Name yourself. State your mission.' },
    { title: 'What do you forge?', sub: 'Pick your battlefields.' },
    { title: 'Where do you stand?', sub: 'Real levels. Real targets.' },
    { title: 'How hard do you go?', sub: 'Set the rules of your protocol.' },
  ];

  if (phase === 'splash') return <SplashScreen onStart={() => setPhase('wizard')} />;
  if (phase === 'generating') {
    return <GeneratingScreen data={{ name, archetype: null, skills: buildSkills(), intensity, poisons: selectedPoisons, dailyTimeBudget: timeBudget, motivation, domains: Array.from(domains) }} onDone={handleFinish} />;
  }

  const slideClass = animating
    ? direction === 'forward' ? 'opacity-0 translate-x-8' : 'opacity-0 -translate-x-8'
    : 'opacity-100 translate-x-0';

  const visibleSkills = ALL_SKILLS.filter(s => domains.has(s.domain));

  return (
    <div className="min-h-screen bg-forge-bg flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(220,38,38,0.04)_0%,transparent_50%)]" />
      <div className="relative z-10 flex flex-col flex-1 px-6 pt-[env(safe-area-inset-top)]">
        <div className="pt-4 pb-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-lg font-black tracking-[0.25em] text-forge-text">FORGE</h1>
              <p className="text-[8px] tracking-[0.35em] text-forge-green font-bold">DAILY PROTOCOL</p>
            </div>
            <span className="text-[10px] text-forge-muted tracking-wider font-mono">{step + 1}/{TOTAL_STEPS}</span>
          </div>
          <Stepper current={step} total={TOTAL_STEPS} />
          <div className={`mt-8 transition-all duration-300 ${slideClass}`}>
            <h2 className="text-[28px] font-bold leading-tight">{stepMeta[step].title}</h2>
            <p className="text-forge-muted text-sm mt-1">{stepMeta[step].sub}</p>
          </div>
        </div>

        <div className={`flex-1 pb-4 overflow-y-auto transition-all duration-300 ${slideClass}`}>

          {/* ── STEP 0: Identity ── */}
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <label className="text-[10px] tracking-[0.2em] text-forge-muted uppercase block mb-2">Your name</label>
                <input ref={nameRef} type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full bg-forge-surface border border-forge-border rounded-xl px-4 py-3.5 text-forge-text text-base placeholder:text-forge-muted/40 focus:border-forge-red/50 focus:outline-none transition-all" />
              </div>
              <div>
                <label className="text-[10px] tracking-[0.2em] text-forge-muted uppercase block mb-2">What&apos;s driving you?</label>
                <textarea value={motivation} onChange={e => setMotivation(e.target.value)}
                  placeholder="e.g. I want to get in the best shape of my life and launch my project before September"
                  rows={3}
                  className="w-full bg-forge-surface border border-forge-border rounded-xl px-4 py-3.5 text-forge-text text-sm placeholder:text-forge-muted/40 focus:border-forge-red/50 focus:outline-none transition-all resize-none leading-relaxed" />
                <p className="text-[10px] text-forge-muted/50 mt-1.5">This shapes your protocol. Be specific.</p>
              </div>
              <button onClick={handleCustomStart} disabled={!name.trim()}
                className="w-full mt-2 py-3 border border-dashed border-forge-border text-forge-muted text-sm tracking-wider rounded-lg hover:border-forge-red/50 hover:text-forge-red transition-all disabled:opacity-30">
                SKIP — BLANK PROTOCOL
              </button>
            </div>
          )}

          {/* ── STEP 1: Domains ── */}
          {step === 1 && (
            <div className="space-y-3">
              <p className="text-[10px] tracking-[0.2em] text-forge-muted uppercase mb-1">Choose your battlefields</p>
              {(Object.entries(LIFE_DOMAINS) as [LifeDomainId, typeof LIFE_DOMAINS[LifeDomainId]][]).map(([id, d]) => {
                const active = domains.has(id);
                return (
                  <button key={id} onClick={() => toggleDomain(id)}
                    className={`w-full rounded-xl border transition-all duration-200 text-left overflow-hidden ${
                      active ? 'border-forge-red bg-forge-red/[0.06] shadow-[0_0_20px_rgba(220,38,38,0.08)]' : 'border-forge-border bg-forge-surface hover:border-forge-muted/50'
                    }`}>
                    <div className="flex items-center gap-4 p-4">
                      <span className="text-3xl w-10 text-center">{d.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold tracking-wide ${active ? 'text-forge-text' : 'text-forge-text/80'}`}>{d.name}</p>
                        <p className="text-[11px] text-forge-muted mt-0.5">{d.description}</p>
                      </div>
                      <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border-2 transition-all ${
                        active ? 'border-forge-red bg-forge-red' : 'border-forge-border'
                      }`}>
                        {active && <Check />}
                      </div>
                    </div>
                    {active && (
                      <div className="px-4 pb-3 pt-0">
                        <div className="flex flex-wrap gap-1.5">
                          {d.tracks.map(t => (
                            <span key={t} className="text-[10px] text-forge-red/70 bg-forge-red/5 px-2 py-0.5 rounded-full">{t}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
              {domains.size > 0 && (
                <p className="text-center text-[11px] text-forge-red/70 mt-2 tracking-wide">
                  {domains.size} domain{domains.size > 1 ? 's' : ''} — your protocol adapts to these
                </p>
              )}
            </div>
          )}

          {/* ── STEP 2: Configure ── */}
          {step === 2 && (
            <div className="space-y-4">
              {Array.from(domains).map(domainId => {
                const domain = LIFE_DOMAINS[domainId];
                const domainSkills = visibleSkills.filter(s => s.domain === domainId);
                return (
                  <div key={domainId}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">{domain.icon}</span>
                      <span className="text-[10px] tracking-[0.2em] text-forge-muted uppercase font-bold">{domain.name}</span>
                      <div className="flex-1 h-[1px] bg-forge-border ml-2" />
                    </div>

                    <div className="space-y-2">
                      {domainSkills.map(skill => {
                        const active = selectedSkills.has(skill.id);
                        const state = getState(skill.id);
                        const isBoolean = skill.id === 'journaling' || skill.id === 'shipping';

                        return (
                          <div key={skill.id}>
                            <button onClick={() => toggleSkill(skill.id)}
                              className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                                active ? 'border-forge-red bg-forge-red/[0.06] rounded-b-none' : 'border-forge-border bg-forge-surface hover:border-forge-muted/50'
                              }`}>
                              <span className="text-lg w-7 text-center">{skill.icon}</span>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-semibold tracking-wide ${active ? 'text-forge-text' : 'text-forge-text/80'}`}>{skill.label}</p>
                                {!active && !isBoolean && (
                                  <p className="text-[10px] text-forge-muted/60 mt-0.5">Tap to add & assess</p>
                                )}
                                {!active && isBoolean && (
                                  <p className="text-[10px] text-forge-muted/60 mt-0.5">Daily habit</p>
                                )}
                              </div>
                              <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border-2 transition-all ${
                                active ? 'border-forge-red bg-forge-red' : 'border-forge-border'
                              }`}>
                                {active && <Check />}
                              </div>
                            </button>
                            {active && !isBoolean && (
                              <div className="border border-t-0 border-forge-red/30 bg-forge-surface rounded-b-xl px-4 py-3">
                                <SkillAssessment skill={skill} state={state} onUpdate={p => updateState(skill.id, p)} />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Poisons — always available */}
              {domains.has('discipline') && (
                <div>
                  <div className="flex items-center gap-2 mb-3 mt-2">
                    <span className="text-lg">🚫</span>
                    <span className="text-[10px] tracking-[0.2em] text-forge-muted uppercase font-bold">Cut</span>
                    <div className="flex-1 h-[1px] bg-forge-border ml-2" />
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {poisonList.map(p => (
                      <button key={p.id} onClick={() => togglePoison(p.id)}
                        className={`relative flex flex-col items-center gap-1 py-3 px-1 rounded-xl border transition-all ${
                          selectedPoisons.includes(p.id) ? 'border-forge-red bg-forge-red/[0.06]' : 'border-forge-border bg-forge-surface'
                        }`}>
                        {selectedPoisons.includes(p.id) && (
                          <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-forge-red flex items-center justify-center">
                            <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </div>
                        )}
                        <span className="text-xl">{p.icon}</span>
                        <span className={`text-[9px] tracking-wide font-medium ${selectedPoisons.includes(p.id) ? 'text-forge-red' : 'text-forge-muted'}`}>{p.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedSkills.size > 0 && (
                <p className="text-center text-[11px] text-forge-red/70 mt-2 tracking-wide">
                  {selectedSkills.size} skill{selectedSkills.size > 1 ? 's' : ''} configured
                  {selectedPoisons.length > 0 ? ` · ${selectedPoisons.length} poison${selectedPoisons.length > 1 ? 's' : ''} cut` : ''}
                </p>
              )}
            </div>
          )}

          {/* ── STEP 3: Protocol ── */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <label className="text-[10px] tracking-[0.2em] text-forge-muted uppercase block mb-3">Intensity</label>
                <div className="space-y-2">
                  {([
                    { id: 'balanced' as Intensity, label: 'Balanced', icon: '⚖️', desc: 'Sustainable. Room to breathe.', mult: 'x1.0' },
                    { id: 'monk' as Intensity, label: 'Monk', icon: '🧘', desc: 'Serious. Cut the noise.', mult: 'x1.15' },
                    { id: 'savage' as Intensity, label: 'Savage', icon: '🔥', desc: 'All in. No mercy.', mult: 'x1.3' },
                  ]).map(i => (
                    <button key={i.id} onClick={() => setIntensity(i.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                        intensity === i.id ? 'border-forge-red bg-forge-red/[0.06] shadow-[0_0_20px_rgba(220,38,38,0.08)]' : 'border-forge-border bg-forge-surface hover:border-forge-muted/50'
                      }`}>
                      <span className="text-3xl w-10 text-center">{i.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold tracking-wide ${intensity === i.id ? 'text-forge-text' : 'text-forge-text/80'}`}>{i.label}</p>
                        <p className="text-[11px] text-forge-muted mt-0.5">{i.desc}</p>
                      </div>
                      <span className={`text-xs font-mono font-bold ${intensity === i.id ? 'text-forge-red' : 'text-forge-muted'}`}>{i.mult}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-forge-surface border border-forge-border rounded-xl p-5">
                <div className="flex justify-between items-center mb-5">
                  <label className="text-[10px] tracking-[0.2em] text-forge-muted uppercase">Daily time budget</label>
                  <span className="text-lg font-bold text-forge-text tabular-nums">
                    {Math.floor(timeBudget / 60)}h{timeBudget % 60 > 0 ? ` ${timeBudget % 60}m` : ''}
                  </span>
                </div>
                <input type="range" min={60} max={300} step={30} value={timeBudget} onChange={e => setTimeBudget(Number(e.target.value))} className="w-full" />
                <div className="flex justify-between mt-2">
                  <span className="text-[9px] text-forge-muted">1h</span>
                  <span className="text-[9px] text-forge-muted">5h</span>
                </div>
              </div>

              {/* Poisons if discipline not selected (fallback) */}
              {!domains.has('discipline') && (
                <div>
                  <label className="text-[10px] tracking-[0.2em] text-forge-muted uppercase block mb-3">Cut from your life</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {poisonList.map(p => (
                      <button key={p.id} onClick={() => togglePoison(p.id)}
                        className={`relative flex flex-col items-center gap-1 py-3 px-1 rounded-xl border transition-all ${
                          selectedPoisons.includes(p.id) ? 'border-forge-red bg-forge-red/[0.06]' : 'border-forge-border bg-forge-surface'
                        }`}>
                        {selectedPoisons.includes(p.id) && (
                          <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-forge-red flex items-center justify-center">
                            <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </div>
                        )}
                        <span className="text-xl">{p.icon}</span>
                        <span className={`text-[9px] tracking-wide font-medium ${selectedPoisons.includes(p.id) ? 'text-forge-red' : 'text-forge-muted'}`}>{p.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Protocol summary */}
              <div className="bg-forge-bg border border-forge-border rounded-xl p-4">
                <p className="text-[10px] tracking-[0.2em] text-forge-muted uppercase mb-3">Your protocol</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-forge-muted">Domains</span>
                    <span className="font-medium">{Array.from(domains).map(d => LIFE_DOMAINS[d].icon).join(' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-forge-muted">Skills</span>
                    <span className="font-medium">{selectedSkills.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-forge-muted">Poisons tracked</span>
                    <span className="font-medium text-forge-red">{selectedPoisons.length}</span>
                  </div>
                  {motivation && (
                    <div className="pt-2 border-t border-forge-border">
                      <p className="text-[10px] text-forge-muted/70 italic">&quot;{motivation.slice(0, 80)}{motivation.length > 80 ? '...' : ''}&quot;</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Navigation ── */}
        <div className="pb-8 pt-2 pb-[calc(2rem+env(safe-area-inset-bottom))]">
          <button onClick={goNext} disabled={!canNext()}
            className={`w-full py-4 rounded-xl font-bold tracking-[0.15em] text-sm transition-all duration-300 ${
              canNext() ? 'bg-forge-red text-white shadow-[0_0_30px_rgba(220,38,38,0.15)] active:scale-[0.98]' : 'bg-forge-surface border border-forge-border text-forge-muted cursor-not-allowed'
            }`}>
            {step < TOTAL_STEPS - 1 ? 'CONTINUE' : 'FORGE MY PROTOCOL'}
          </button>
          {step > 0 ? (
            <button onClick={goBack} className="w-full py-3 mt-2 text-forge-muted text-xs tracking-[0.15em] font-medium hover:text-forge-text transition-colors">BACK</button>
          ) : <div className="h-[44px]" />}
        </div>
      </div>
    </div>
  );
}
