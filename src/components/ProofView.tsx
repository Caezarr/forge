'use client';

import { UserProfile } from '@/lib/types';
import { getConsistencyData } from '@/lib/store';
import { HeatmapGreen } from './Heatmap';

interface Props {
  profile: UserProfile;
}

function StatBar({ label, icon, pct }: { label: string; icon: string; pct: number }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <span className="text-lg w-8">{icon}</span>
      <span className="text-sm w-24">{label}</span>
      <div className="flex-1 flex gap-[2px]">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className={`h-4 flex-1 rounded-[1px] ${
              i / 30 < pct / 100 ? 'bg-green-600' : 'bg-forge-surface'
            }`}
          />
        ))}
      </div>
      <span className="text-sm font-bold w-10 text-right">{pct}%</span>
    </div>
  );
}

export default function ProofView({ profile }: Props) {
  const consistency = getConsistencyData(profile);
  const totalDays = Object.keys(profile.logs).length;
  const daysWithScore = Object.values(profile.logs).filter((l) => l.monkScore >= 50).length;
  const consistencyPct = totalDays > 0 ? Math.round((daysWithScore / Math.max(totalDays, 1)) * 100) : 0;

  const logs = Object.values(profile.logs);
  const runDays = logs.filter((l) => l.quests.some((q) => q.label.toLowerCase().includes('run') && q.done)).length;
  const strengthDays = logs.filter((l) => l.quests.some((q) => (q.label.toLowerCase().includes('push') || q.label.toLowerCase().includes('strength')) && q.done)).length;
  const deepWorkDays = logs.filter((l) => l.quests.some((q) => q.label.toLowerCase().includes('deep work') && q.done)).length;
  const cleanDays = logs.filter((l) => l.bodyIntegrity >= 80).length;

  const runPct = totalDays > 0 ? Math.round((runDays / totalDays) * 100) : 0;
  const strengthPct = totalDays > 0 ? Math.round((strengthDays / totalDays) * 100) : 0;
  const deepWorkPct = totalDays > 0 ? Math.round((deepWorkDays / totalDays) * 100) : 0;
  const cleanPct = totalDays > 0 ? Math.round((cleanDays / totalDays) * 100) : 0;

  const weekLogs = logs.slice(-7);
  const weekRuns = weekLogs.filter((l) => l.quests.some((q) => q.label.toLowerCase().includes('run') && q.done)).length;
  const weekStrength = weekLogs.filter((l) => l.quests.some((q) => (q.label.toLowerCase().includes('push') || q.label.toLowerCase().includes('strength')) && q.done)).length;
  const weekDeepWork = weekLogs.filter((l) => l.quests.some((q) => q.label.toLowerCase().includes('deep work') && q.done)).length;
  const weekClean = weekLogs.filter((l) => l.bodyIntegrity >= 80).length;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Year of discipline.</h2>
        <p className="text-forge-muted text-sm">Proof compounds.</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="bg-forge-surface border border-forge-border rounded-lg p-3 text-center">
          <p className="text-[10px] tracking-widest text-forge-muted uppercase">Consistency</p>
          <p className="text-2xl font-bold">{consistencyPct}%</p>
          <p className="text-[9px] text-forge-muted">of year</p>
        </div>
        <div className="bg-forge-surface border border-forge-border rounded-lg p-3 text-center">
          <p className="text-[10px] tracking-widest text-forge-muted uppercase">Current Streak</p>
          <p className="text-2xl font-bold">{profile.currentStreak}</p>
          <p className="text-[9px] text-forge-muted">days</p>
        </div>
        <div className="bg-forge-surface border border-forge-border rounded-lg p-3 text-center">
          <p className="text-[10px] tracking-widest text-forge-muted uppercase">Best Streak</p>
          <p className="text-2xl font-bold">{profile.bestStreak}</p>
          <p className="text-[9px] text-forge-muted">days</p>
        </div>
      </div>

      <HeatmapGreen data={consistency} weeks={52} label="Life Consistency" />

      <div className="bg-forge-surface border border-forge-border rounded-lg p-4 space-y-1">
        <StatBar label="Running" icon="🏃" pct={runPct} />
        <StatBar label="Strength" icon="💪" pct={strengthPct} />
        <StatBar label="Deep Work" icon="📖" pct={deepWorkPct} />
        <StatBar label="No Social" icon="📵" pct={cleanPct} />
      </div>

      <div className="bg-forge-surface border border-forge-border rounded-lg p-4">
        <p className="text-[10px] tracking-widest text-forge-muted uppercase mb-3">This Week</p>
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Runs', value: weekRuns, target: 3, icon: '🏃' },
            { label: 'Strength', value: weekStrength, target: 3, icon: '💪' },
            { label: 'Deep Work', value: weekDeepWork, target: 5, icon: '📖' },
            { label: 'Clean Days', value: weekClean, target: 7, icon: '🔴' },
          ].map((s) => (
            <div key={s.label} className="bg-forge-bg rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <span className="text-sm">{s.icon}</span>
                <span className="text-[9px] text-forge-muted">{s.label}</span>
              </div>
              <p className="text-xl font-bold">
                {s.value}<span className="text-forge-muted text-sm">/{s.target}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
