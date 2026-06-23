'use client';

import { UserProfile } from '@/lib/types';
import { getTodayLog } from '@/lib/store';

interface Props {
  profile: UserProfile;
}

const appleSteps = [
  {
    label: 'Screen Time',
    title: 'Put the traps behind App Limits',
    body: 'iPhone Settings -> Screen Time -> App Limits. Add Instagram, TikTok, Shorts, adult sites, or any poison you chose.',
  },
  {
    label: 'Focus Mode',
    title: 'Create a FORGE focus',
    body: 'Settings -> Focus -> +. Allow only tools you need for training, deep work, maps, calls, music, and FORGE.',
  },
  {
    label: 'Shortcuts',
    title: 'Automate the environment',
    body: 'Shortcuts -> Automation. At wake time, enable FORGE Focus, open this PWA, set volume, and start your first timer.',
  },
  {
    label: 'Home Screen',
    title: 'Make FORGE the first tap',
    body: 'Add FORGE to Home Screen and place it where the distraction app used to live. The ritual starts before the scroll.',
  },
];

export default function FocusView({ profile }: Props) {
  const log = getTodayLog(profile);
  const mainQuests = log.quests.filter((q) => q.type === 'main');
  const mainDone = mainQuests.filter((q) => q.done).length;
  const required = Math.min(2, mainQuests.length);
  const remaining = Math.max(0, required - mainDone);
  const poisons = profile.onboarding.poisons.filter((p) => ['instagram', 'tiktok', 'shorts', 'porn'].includes(p));

  return (
    <div className="space-y-4">
      <section className="forge-ember-border rounded-2xl p-5">
        <p className="text-[10px] font-bold tracking-[0.24em] text-forge-green uppercase">Focus setup</p>
        <h2 className="mt-2 text-3xl font-black tracking-[-0.04em]">Focus lives in iOS.</h2>
        <p className="mt-3 text-sm leading-relaxed text-forge-muted">
          Browser apps cannot enforce OS-level blocking. FORGE stays honest: it tracks the gate, then tells you exactly what to wire in
          Apple Screen Time, Focus Mode, and Shortcuts.
        </p>
      </section>

      <section className="forge-card rounded-2xl p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] tracking-[0.2em] text-forge-muted uppercase">Today&apos;s gate</p>
            <p className="mt-1 text-xl font-black">
              {remaining === 0 ? 'Earned. Stay sharp.' : `${remaining} main quest${remaining > 1 ? 's' : ''} before drift.`}
            </p>
          </div>
          <div className={`rounded-full border px-3 py-1 text-[10px] font-black tracking-[0.16em] ${
            remaining === 0 ? 'border-forge-green text-forge-green' : 'border-forge-red text-forge-red'
          }`}>
            {remaining === 0 ? 'OPEN' : 'CLOSED'}
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {mainQuests.map((q) => (
            <div key={q.id} className="flex items-center justify-between rounded-xl border border-forge-border/70 bg-forge-bg/35 px-3 py-2">
              <span className={q.done ? 'text-forge-green' : 'text-forge-text'}>{q.label}</span>
              <span className={`text-[10px] font-black tracking-[0.16em] ${q.done ? 'text-forge-green' : 'text-forge-muted'}`}>
                {q.done ? 'DONE' : 'PENDING'}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="forge-card rounded-2xl p-5">
        <p className="text-[10px] tracking-[0.2em] text-forge-muted uppercase">Apple automation recipe</p>
        <div className="mt-4 space-y-3">
          {appleSteps.map((step, index) => (
            <div key={step.label} className="forge-rail pl-4">
              <div className="rounded-xl border border-forge-border/70 bg-forge-bg/30 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black tracking-[0.18em] text-forge-green uppercase">{step.label}</p>
                  <span className="font-mono text-[10px] text-forge-muted">{String(index + 1).padStart(2, '0')}</span>
                </div>
                <p className="mt-1 text-sm font-bold text-forge-text">{step.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-forge-muted">{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="forge-card rounded-2xl p-5">
        <p className="text-[10px] tracking-[0.2em] text-forge-muted uppercase">Your current watchlist</p>
        {poisons.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {poisons.map((poison) => (
              <span key={poison} className="rounded-full border border-forge-border bg-forge-bg/40 px-3 py-1 text-xs font-bold text-forge-text">
                {poison}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-forge-muted">No distraction apps selected yet. Add them from Edit quests or restart onboarding.</p>
        )}
      </section>
    </div>
  );
}
