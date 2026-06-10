'use client';

import { useState, useEffect, useRef } from 'react';
import { OnboardingData, Archetype, SkillLevel, SkillId, Intensity, Poison } from '@/lib/types';

interface Props {
  onComplete: (data: OnboardingData) => void;
}

const archetypes: { id: Archetype; label: string; icon: string; desc: string }[] = [
  { id: 'athlete', label: 'Athlete', icon: '🏃', desc: 'Body first. Performance is identity.' },
  { id: 'builder', label: 'Builder', icon: '🛠️', desc: 'Ship daily. Build what matters.' },
  { id: 'monk', label: 'Monk', icon: '🧘', desc: 'Silence the noise. Master the self.' },
  { id: 'operator', label: 'Operator', icon: '⚡', desc: 'Execute fast. Zero friction.' },
];

const skillDefs: { id: SkillId; label: string; icon: string; unit: string; placeholder: string; defaultGoal: number; goalLabel: string }[] = [
  { id: 'pushups', label: 'Push-ups', icon: '💪', unit: 'reps', placeholder: 'e.g. 10', defaultGoal: 50, goalLabel: 'reps' },
  { id: 'pullups', label: 'Pull-ups', icon: '🏋️', unit: 'reps', placeholder: 'e.g. 3', defaultGoal: 15, goalLabel: 'strict reps' },
  { id: 'dips', label: 'Dips', icon: '🤸', unit: 'reps', placeholder: 'e.g. 5', defaultGoal: 30, goalLabel: 'reps' },
  { id: 'core', label: 'Core', icon: '🎯', unit: 'reps', placeholder: 'e.g. 20', defaultGoal: 60, goalLabel: 'reps' },
  { id: 'running', label: 'Running', icon: '👟', unit: 'min', placeholder: 'e.g. 15', defaultGoal: 45, goalLabel: 'min' },
  { id: 'deepwork', label: 'Deep Work', icon: '🧠', unit: 'min', placeholder: 'e.g. 30', defaultGoal: 120, goalLabel: 'min' },
  { id: 'mobility', label: 'Mobility', icon: '🧘', unit: 'min', placeholder: 'e.g. 5', defaultGoal: 20, goalLabel: 'min' },
];

const intensities: { id: Intensity; label: string; icon: string; desc: string; mult: string }[] = [
  { id: 'balanced', label: 'Balanced', icon: '⚖️', desc: 'Sustainable pace. Room to breathe.', mult: 'x1.0' },
  { id: 'monk', label: 'Monk', icon: '🧘', desc: 'Serious commitment. Cut the noise.', mult: 'x1.15' },
  { id: 'savage', label: 'Savage', icon: '🔥', desc: 'All in. No mercy. No excuses.', mult: 'x1.3' },
];

const poisons: { id: Poison; label: string; icon: string }[] = [
  { id: 'instagram', label: 'Instagram', icon: '📸' },
  { id: 'tiktok', label: 'TikTok', icon: '🎵' },
  { id: 'shorts', label: 'Shorts', icon: '📱' },
  { id: 'alcohol', label: 'Alcohol', icon: '🍷' },
  { id: 'junkfood', label: 'Junk Food', icon: '🍔' },
  { id: 'porn', label: 'Porn', icon: '🚫' },
  { id: 'nicotine', label: 'Nicotine', icon: '🚬' },
  { id: 'soda', label: 'Soda', icon: '🥤' },
];

function Stepper({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-0 w-full max-w-[240px] mx-auto">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center flex-1 last:flex-none">
          <div
            className={`w-3 h-3 rounded-full border-2 transition-all duration-500 shrink-0 ${
              i < current
                ? 'bg-forge-red border-forge-red'
                : i === current
                ? 'bg-transparent border-forge-red shadow-[0_0_8px_rgba(220,38,38,0.4)]'
                : 'bg-transparent border-forge-border'
            }`}
          />
          {i < total - 1 && (
            <div className="flex-1 h-[1px] mx-1">
              <div
                className={`h-full transition-all duration-700 ${
                  i < current ? 'bg-forge-red' : 'bg-forge-border'
                }`}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function SplashScreen({ onStart }: { onStart: () => void }) {
  const [visible, setVisible] = useState(false);
  const [tagline, setTagline] = useState(false);
  const [btnVisible, setBtnVisible] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 200);
    const t2 = setTimeout(() => setTagline(true), 900);
    const t3 = setTimeout(() => setBtnVisible(true), 1500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div className="min-h-screen bg-forge-bg flex flex-col items-center justify-center px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(220,38,38,0.06)_0%,transparent_70%)]" />

      <div className="relative z-10 flex flex-col items-center">
        <div
          className={`transition-all duration-1000 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h1 className="text-5xl font-black tracking-[0.3em] text-forge-text text-center">
            FORGE
          </h1>
          <div className="flex justify-center mt-2">
            <div className="h-[1px] w-16 bg-forge-red" />
          </div>
          <p className="text-[11px] tracking-[0.4em] text-forge-red font-bold text-center mt-3">
            MONK MODE
          </p>
        </div>

        <div
          className={`mt-12 transition-all duration-1000 delay-200 ${
            tagline ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <p className="text-lg text-center text-forge-text/70 leading-relaxed max-w-[260px]">
            Build the protocol.<br />
            <span className="text-forge-text/40">Become the man.</span>
          </p>
        </div>

        <div
          className={`mt-16 w-full max-w-[280px] transition-all duration-700 ${
            btnVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <button
            onClick={onStart}
            className="w-full py-4 bg-forge-red text-white font-bold tracking-[0.2em] text-sm rounded-lg
                       hover:bg-red-600 active:scale-[0.98] transition-all duration-200
                       shadow-[0_0_30px_rgba(220,38,38,0.15)]"
          >
            BEGIN
          </button>
          <p className="text-center text-[10px] text-forge-muted mt-4 tracking-wider">
            2 MINUTES TO SET UP YOUR PROTOCOL
          </p>
        </div>
      </div>
    </div>
  );
}

function GeneratingScreen({ data, onDone }: { data: OnboardingData; onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  const [currentLine, setCurrentLine] = useState(0);

  const lines = [
    `Archetype: ${data.archetype?.toUpperCase()}`,
    `Skills assessed: ${data.skills.length}`,
    `Intensity: ${data.intensity?.toUpperCase()}`,
    `Poisons blocked: ${data.poisons.length}`,
    'Building progression plan...',
    'Generating daily quests...',
    'Calibrating XP system...',
    'Protocol locked.',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(onDone, 600);
          return 100;
        }
        return p + 2;
      });
    }, 40);
    return () => clearInterval(interval);
  }, [onDone]);

  useEffect(() => {
    const lineInterval = setInterval(() => {
      setCurrentLine((l) => (l < lines.length - 1 ? l + 1 : l));
    }, 250);
    return () => clearInterval(lineInterval);
  }, [lines.length]);

  return (
    <div className="min-h-screen bg-forge-bg flex flex-col items-center justify-center px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(220,38,38,0.08)_0%,transparent_70%)]" />

      <div className="relative z-10 w-full max-w-[300px]">
        <h1 className="text-2xl font-black tracking-[0.25em] text-forge-text text-center mb-1">
          FORGE
        </h1>
        <p className="text-[10px] tracking-[0.35em] text-forge-red font-bold text-center mb-12">
          MONK MODE
        </p>

        <div className="space-y-2 mb-10 font-mono text-[11px] h-[200px]">
          {lines.slice(0, currentLine + 1).map((line, i) => (
            <div
              key={i}
              className={`flex items-center gap-2 transition-all duration-300 ${
                i <= currentLine ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <span className={i < currentLine ? 'text-forge-green' : 'text-forge-red'}>
                {i < currentLine ? '✓' : '›'}
              </span>
              <span className={i < currentLine ? 'text-forge-muted' : 'text-forge-text'}>
                {line}
              </span>
            </div>
          ))}
        </div>

        <div className="w-full">
          <div className="flex justify-between text-[10px] text-forge-muted mb-2 tracking-wider">
            <span>GENERATING PROTOCOL</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full h-1 bg-forge-border rounded-full overflow-hidden">
            <div
              className="h-full bg-forge-red rounded-full transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Onboarding({ onComplete }: Props) {
  const [phase, setPhase] = useState<'splash' | 'wizard' | 'generating'>('splash');
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const [animating, setAnimating] = useState(false);
  const [name, setName] = useState('');
  const [archetype, setArchetype] = useState<Archetype | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<Set<SkillId>>(new Set());
  const [skillLevels, setSkillLevels] = useState<Record<string, { current: string; assisted: boolean }>>({});
  const [intensity, setIntensity] = useState<Intensity | null>(null);
  const [selectedPoisons, setSelectedPoisons] = useState<Poison[]>([]);
  const [timeBudget, setTimeBudget] = useState(150);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (phase === 'wizard' && step === 0 && nameInputRef.current) {
      setTimeout(() => nameInputRef.current?.focus(), 400);
    }
  }, [phase, step]);

  const toggleSkill = (id: SkillId) => {
    setSelectedSkills((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const updateSkillLevel = (id: SkillId, value: string) => {
    setSkillLevels((prev) => ({
      ...prev,
      [id]: { ...prev[id], current: value, assisted: prev[id]?.assisted ?? false },
    }));
  };

  const toggleAssisted = (id: SkillId) => {
    setSkillLevels((prev) => ({
      ...prev,
      [id]: { ...prev[id], current: prev[id]?.current ?? '', assisted: !prev[id]?.assisted },
    }));
  };

  const togglePoison = (p: Poison) => {
    setSelectedPoisons((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  };

  const buildSkills = (): SkillLevel[] => {
    return Array.from(selectedSkills).map((id) => {
      const def = skillDefs.find((s) => s.id === id)!;
      const level = skillLevels[id];
      const current = parseInt(level?.current || '0') || 0;
      const assisted = id === 'pullups' ? (level?.assisted ?? false) : undefined;

      let goal = def.defaultGoal;
      if (current >= goal) goal = Math.ceil(current * 1.5);

      return { id, currentLevel: current, assisted, goal, unit: def.unit };
    });
  };

  const canNext = () => {
    if (step === 0) return name.trim().length > 0 && archetype !== null;
    if (step === 1) {
      if (selectedSkills.size === 0) return false;
      for (const id of selectedSkills) {
        const level = skillLevels[id];
        if (!level || !level.current || parseInt(level.current) < 0) return false;
      }
      return true;
    }
    if (step === 2) return intensity !== null;
    if (step === 3) return selectedPoisons.length > 0;
    return false;
  };

  const goNext = () => {
    if (animating || !canNext()) return;
    setAnimating(true);
    setDirection('forward');
    setTimeout(() => {
      if (step < 3) {
        setStep((s) => s + 1);
      } else {
        setPhase('generating');
      }
      setAnimating(false);
    }, 300);
  };

  const goBack = () => {
    if (animating || step === 0) return;
    setAnimating(true);
    setDirection('back');
    setTimeout(() => {
      setStep((s) => s - 1);
      setAnimating(false);
    }, 300);
  };

  const handleFinish = () => {
    onComplete({
      name: name.trim(),
      archetype,
      skills: buildSkills(),
      intensity,
      poisons: selectedPoisons,
      dailyTimeBudget: timeBudget,
    });
  };

  const stepTitles = [
    { title: 'Who are you?', sub: 'Choose your path and identity.' },
    { title: 'Where are you?', sub: 'Assess your current level.' },
    { title: 'How hard?', sub: 'Set your commitment level.' },
    { title: 'What do you cut?', sub: 'Remove what holds you back.' },
  ];

  if (phase === 'splash') {
    return <SplashScreen onStart={() => setPhase('wizard')} />;
  }

  if (phase === 'generating') {
    return (
      <GeneratingScreen
        data={{ name, archetype, skills: buildSkills(), intensity, poisons: selectedPoisons, dailyTimeBudget: timeBudget }}
        onDone={handleFinish}
      />
    );
  }

  const slideClass = animating
    ? direction === 'forward'
      ? 'opacity-0 translate-x-8'
      : 'opacity-0 -translate-x-8'
    : 'opacity-100 translate-x-0';

  return (
    <div className="min-h-screen bg-forge-bg flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(220,38,38,0.04)_0%,transparent_50%)]" />

      <div className="relative z-10 flex flex-col flex-1 px-6 pt-[env(safe-area-inset-top)]">
        {/* Header */}
        <div className="pt-4 pb-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-lg font-black tracking-[0.25em] text-forge-text">FORGE</h1>
              <p className="text-[8px] tracking-[0.35em] text-forge-red font-bold">MONK MODE</p>
            </div>
            <span className="text-[10px] text-forge-muted tracking-wider font-mono">
              {step + 1}/4
            </span>
          </div>

          <Stepper current={step} total={4} />

          <div className={`mt-8 transition-all duration-300 ${slideClass}`}>
            <h2 className="text-[28px] font-bold leading-tight">{stepTitles[step].title}</h2>
            <p className="text-forge-muted text-sm mt-1">{stepTitles[step].sub}</p>
          </div>
        </div>

        {/* Content */}
        <div className={`flex-1 pb-4 overflow-y-auto transition-all duration-300 ${slideClass}`}>
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <label className="text-[10px] tracking-[0.2em] text-forge-muted uppercase block mb-2">
                  Your name
                </label>
                <input
                  ref={nameInputRef}
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full bg-forge-surface border border-forge-border rounded-xl px-4 py-3.5
                           text-forge-text text-base placeholder:text-forge-muted/40
                           focus:border-forge-red/50 focus:outline-none focus:bg-forge-surface
                           transition-all duration-200"
                />
              </div>

              <div>
                <label className="text-[10px] tracking-[0.2em] text-forge-muted uppercase block mb-3">
                  Archetype
                </label>
                <div className="space-y-2">
                  {archetypes.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => setArchetype(a.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 text-left
                        ${archetype === a.id
                          ? 'border-forge-red bg-forge-red/[0.06] shadow-[0_0_20px_rgba(220,38,38,0.08)]'
                          : 'border-forge-border bg-forge-surface hover:border-forge-muted/50'
                        }`}
                    >
                      <span className="text-3xl w-10 text-center">{a.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold tracking-wide ${
                          archetype === a.id ? 'text-forge-text' : 'text-forge-text/80'
                        }`}>
                          {a.label}
                        </p>
                        <p className="text-[11px] text-forge-muted mt-0.5">{a.desc}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${
                        archetype === a.id
                          ? 'border-forge-red bg-forge-red'
                          : 'border-forge-border'
                      }`}>
                        {archetype === a.id && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-3">
              <label className="text-[10px] tracking-[0.2em] text-forge-muted uppercase block mb-1">
                Select skills & enter your current max
              </label>
              {skillDefs.map((s) => {
                const active = selectedSkills.has(s.id);
                const level = skillLevels[s.id];
                const current = parseInt(level?.current || '0') || 0;
                const goal = current >= s.defaultGoal ? Math.ceil(current * 1.5) : s.defaultGoal;

                return (
                  <div key={s.id} className="space-y-0">
                    <button
                      onClick={() => toggleSkill(s.id)}
                      className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-200 text-left
                        ${active
                          ? 'border-forge-red bg-forge-red/[0.06] rounded-b-none'
                          : 'border-forge-border bg-forge-surface hover:border-forge-muted/50'
                        }`}
                    >
                      <span className="text-xl w-7 text-center">{s.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold tracking-wide ${
                          active ? 'text-forge-text' : 'text-forge-text/80'
                        }`}>
                          {s.label}
                        </p>
                      </div>
                      <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border-2 transition-all duration-200 ${
                        active
                          ? 'border-forge-red bg-forge-red'
                          : 'border-forge-border'
                      }`}>
                        {active && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </button>

                    {active && (
                      <div className="border border-t-0 border-forge-red/30 bg-forge-surface rounded-b-xl px-4 py-3 space-y-2">
                        <div className="flex items-center gap-3">
                          <label className="text-[10px] text-forge-muted tracking-wider whitespace-nowrap w-16">
                            CURRENT
                          </label>
                          <input
                            type="number"
                            inputMode="numeric"
                            min={0}
                            value={level?.current ?? ''}
                            onChange={(e) => updateSkillLevel(s.id, e.target.value)}
                            placeholder={s.placeholder}
                            className="flex-1 bg-forge-bg border border-forge-border rounded-lg px-3 py-2
                                     text-forge-text text-sm placeholder:text-forge-muted/40 tabular-nums
                                     focus:border-forge-red/50 focus:outline-none transition-all duration-200"
                          />
                          <span className="text-[10px] text-forge-muted tracking-wider w-8">{s.unit}</span>
                        </div>

                        {s.id === 'pullups' && (
                          <button
                            onClick={() => toggleAssisted(s.id)}
                            className="flex items-center gap-2 ml-[76px]"
                          >
                            <div className={`w-4 h-4 rounded border transition-all duration-200 flex items-center justify-center ${
                              level?.assisted ? 'border-forge-red bg-forge-red' : 'border-forge-border'
                            }`}>
                              {level?.assisted && (
                                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <span className="text-[11px] text-forge-muted">Assisted (bands/machine)</span>
                          </button>
                        )}

                        {level?.current && parseInt(level.current) >= 0 && (
                          <div className="flex items-center gap-2 ml-[76px]">
                            <span className="text-[10px] text-forge-muted tracking-wider">GOAL</span>
                            <span className="text-sm font-bold text-forge-red tabular-nums">{goal}</span>
                            <span className="text-[10px] text-forge-muted">{s.goalLabel}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {selectedSkills.size > 0 && (
                <p className="text-center text-[11px] text-forge-red/70 mt-2 tracking-wide">
                  {selectedSkills.size} skill{selectedSkills.size > 1 ? 's' : ''} selected
                </p>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="text-[10px] tracking-[0.2em] text-forge-muted uppercase block mb-3">
                  Intensity level
                </label>
                <div className="space-y-2">
                  {intensities.map((i) => (
                    <button
                      key={i.id}
                      onClick={() => setIntensity(i.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 text-left
                        ${intensity === i.id
                          ? 'border-forge-red bg-forge-red/[0.06] shadow-[0_0_20px_rgba(220,38,38,0.08)]'
                          : 'border-forge-border bg-forge-surface hover:border-forge-muted/50'
                        }`}
                    >
                      <span className="text-3xl w-10 text-center">{i.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold tracking-wide ${
                          intensity === i.id ? 'text-forge-text' : 'text-forge-text/80'
                        }`}>
                          {i.label}
                        </p>
                        <p className="text-[11px] text-forge-muted mt-0.5">{i.desc}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`text-xs font-mono font-bold ${
                          intensity === i.id ? 'text-forge-red' : 'text-forge-muted'
                        }`}>
                          {i.mult}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-forge-surface border border-forge-border rounded-xl p-5">
                <div className="flex justify-between items-center mb-5">
                  <label className="text-[10px] tracking-[0.2em] text-forge-muted uppercase">
                    Daily time budget
                  </label>
                  <span className="text-lg font-bold text-forge-text tabular-nums">
                    {Math.floor(timeBudget / 60)}h{timeBudget % 60 > 0 ? ` ${timeBudget % 60}m` : ''}
                  </span>
                </div>
                <input
                  type="range"
                  min={60}
                  max={300}
                  step={30}
                  value={timeBudget}
                  onChange={(e) => setTimeBudget(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between mt-2">
                  <span className="text-[9px] text-forge-muted">1h</span>
                  <span className="text-[9px] text-forge-muted">5h</span>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <label className="text-[10px] tracking-[0.2em] text-forge-muted uppercase block mb-3">
                Tap to remove from your life
              </label>
              <div className="grid grid-cols-2 gap-2">
                {poisons.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => togglePoison(p.id)}
                    className={`relative flex flex-col items-center gap-2 py-5 px-3 rounded-xl border transition-all duration-200 overflow-hidden
                      ${selectedPoisons.includes(p.id)
                        ? 'border-forge-red bg-forge-red/[0.06]'
                        : 'border-forge-border bg-forge-surface hover:border-forge-muted/50'
                      }`}
                  >
                    {selectedPoisons.includes(p.id) && (
                      <div className="absolute top-2 right-2">
                        <div className="w-4 h-4 rounded-full bg-forge-red flex items-center justify-center">
                          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                      </div>
                    )}
                    <span className={`text-3xl transition-all duration-200 ${
                      selectedPoisons.includes(p.id) ? 'grayscale-0' : ''
                    }`}>{p.icon}</span>
                    <span className={`text-xs tracking-wide font-medium ${
                      selectedPoisons.includes(p.id) ? 'text-forge-red' : 'text-forge-muted'
                    }`}>
                      {p.label}
                    </span>
                    {selectedPoisons.includes(p.id) && (
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-forge-red/30 -rotate-12" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
              {selectedPoisons.length > 0 && (
                <p className="text-center text-[11px] text-forge-red/70 mt-4 tracking-wide">
                  {selectedPoisons.length} poison{selectedPoisons.length > 1 ? 's' : ''} blocked
                </p>
              )}
            </div>
          )}
        </div>

        {/* Bottom actions */}
        <div className="pb-8 pt-2 pb-[calc(2rem+env(safe-area-inset-bottom))]">
          <button
            onClick={goNext}
            disabled={!canNext()}
            className={`w-full py-4 rounded-xl font-bold tracking-[0.15em] text-sm transition-all duration-300 ${
              canNext()
                ? 'bg-forge-red text-white shadow-[0_0_30px_rgba(220,38,38,0.15)] active:scale-[0.98]'
                : 'bg-forge-surface border border-forge-border text-forge-muted cursor-not-allowed'
            }`}
          >
            {step < 3 ? 'CONTINUE' : 'GENERATE PROTOCOL'}
          </button>

          {step > 0 ? (
            <button
              onClick={goBack}
              className="w-full py-3 mt-2 text-forge-muted text-xs tracking-[0.15em] font-medium
                       hover:text-forge-text transition-colors"
            >
              BACK
            </button>
          ) : (
            <div className="h-[44px]" />
          )}
        </div>
      </div>
    </div>
  );
}
