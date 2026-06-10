'use client';

import { UserProfile } from '@/lib/types';

interface Props {
  profile: UserProfile;
}

export default function SkillsView({ profile }: Props) {
  const ovr = Math.round(
    profile.attributes.reduce((sum, a) => sum + a.value, 0) / profile.attributes.length
  );
  const xpToNext = 500 - (profile.totalXp % 500);
  const levelProgress = ((profile.totalXp % 500) / 500) * 100;

  const focusItems = [
    { label: 'Running Base', icon: '🏃', done: 3, target: 4 },
    { label: 'Pull-up Strength', icon: '💪', done: 2, target: 4 },
    { label: 'AI Product Shipping', icon: '💻', done: 5, target: 7 },
  ];

  const recentGains = [
    { label: 'Endurance', icon: '❤️', xp: 90 },
    { label: 'Technical', icon: '🧠', xp: 120 },
    { label: 'Discipline', icon: '🎯', xp: 45 },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Attributes.</h2>
        <p className="text-forge-muted text-sm">Level the real character.</p>
      </div>

      <div className="bg-forge-surface border border-forge-border rounded-lg p-4">
        <p className="text-[10px] tracking-widest text-forge-muted uppercase mb-2">Overall</p>
        <div className="flex items-center justify-between mb-2">
          <span className="text-4xl font-black">{ovr}</span>
          <div className="text-right">
            <span className="text-sm text-forge-muted">To next level: </span>
            <span className="text-sm font-bold text-forge-red">{xpToNext} XP</span>
          </div>
        </div>
        <div className="w-full h-1.5 bg-forge-border rounded-full overflow-hidden">
          <div
            className="h-full bg-forge-red rounded-full transition-all"
            style={{ width: `${levelProgress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {profile.attributes.map((attr) => (
          <div key={attr.key} className="bg-forge-surface border border-forge-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{attr.icon}</span>
              <span className="text-[10px] tracking-widest text-forge-muted uppercase">{attr.label}</span>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-black">{attr.value}</span>
              <span
                className={`text-sm font-bold ${
                  attr.delta > 0 ? 'text-forge-green' : attr.delta < 0 ? 'text-forge-red' : 'text-forge-muted'
                }`}
              >
                {attr.delta > 0 ? '+' : ''}{attr.delta}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-forge-surface border border-forge-border rounded-lg p-4">
        <p className="text-[10px] tracking-widest text-forge-muted uppercase mb-3">Current Focus</p>
        <div className="grid grid-cols-3 gap-2">
          {focusItems.map((f) => (
            <div key={f.label} className="bg-forge-bg rounded-lg p-3">
              <div className="flex items-center gap-1 mb-1">
                <span className="text-sm">{f.icon}</span>
                <span className="text-[9px] text-forge-muted leading-tight">{f.label}</span>
              </div>
              <p className="text-sm font-bold">
                <span className="text-forge-red">{f.done}</span>
                <span className="text-forge-muted"> / {f.target} sessions</span>
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-forge-surface border border-forge-border rounded-lg p-4">
        <p className="text-[10px] tracking-widest text-forge-muted uppercase mb-3">Recent Gains</p>
        <div className="grid grid-cols-3 gap-2">
          {recentGains.map((g) => (
            <div key={g.label} className="bg-forge-bg rounded-lg p-3 text-center">
              <span className="text-lg">{g.icon}</span>
              <p className="text-lg font-bold text-forge-green">+{g.xp}</p>
              <p className="text-[9px] text-forge-muted">{g.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
