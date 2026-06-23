'use client';

import { UserProfile } from '@/lib/types';
import { getWeeklyStats } from '@/lib/store';
import { detectPatterns, getWeekComparison, getDailyBreakdown } from '@/lib/analytics';

interface Props {
  profile: UserProfile;
}

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="w-full h-1 bg-forge-border rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function ReviewView({ profile }: Props) {
  const stats = getWeeklyStats(profile);
  const patterns = detectPatterns(profile);
  const comparison = getWeekComparison(profile);
  const daily = getDailyBreakdown(profile, 7);

  const warnings = patterns.filter(p => p.severity === 'critical' || p.severity === 'warning');
  const positives = patterns.filter(p => p.severity === 'info');

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Weekly review.</h2>
        <p className="text-forge-muted text-sm">Data-driven adjustments.</p>
      </div>

      <div className="grid grid-cols-5 gap-1">
        {[
          { label: 'Monk Score', value: `${stats.monkScore}%`, icon: '⊕' },
          { label: 'XP Earned', value: stats.xpEarned.toLocaleString(), icon: '▲' },
          { label: 'Clean Days', value: `${stats.cleanDays}/7`, icon: '📅' },
          { label: 'Runs', value: `${stats.runs}/3`, icon: '🏃' },
          { label: 'Deep Work', value: `${stats.deepWorkHours}h${stats.deepWorkMins > 0 ? ` ${stats.deepWorkMins}m` : ''}`, icon: '🧠' },
        ].map((s) => (
          <div key={s.label} className="bg-forge-surface border border-forge-border rounded-lg p-2 text-center">
            <span className="text-sm">{s.icon}</span>
            <p className="text-[8px] tracking-widest text-forge-muted uppercase mt-1">{s.label}</p>
            <p className="text-sm font-bold text-forge-red">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Week vs Week */}
      <div className="bg-forge-surface border border-forge-border rounded-lg p-4">
        <p className="text-[10px] tracking-widest text-forge-muted uppercase mb-3">Week vs Last Week</p>
        <div className="space-y-3">
          {comparison.map((m) => (
            <div key={m.label} className="flex items-center justify-between">
              <span className="text-sm text-forge-text w-28">{m.label}</span>
              <div className="flex items-center gap-3 flex-1 justify-end">
                <span className="text-xs text-forge-muted">{m.lastWeek}</span>
                <span className="text-xs text-forge-muted">→</span>
                <span className="text-sm font-bold text-forge-text">{m.thisWeek}</span>
                <span className={`text-xs font-bold min-w-[40px] text-right ${
                  m.trend === 'up' ? 'text-forge-green' : m.trend === 'down' ? 'text-forge-red' : 'text-forge-muted'
                }`}>
                  {m.delta > 0 ? `+${m.delta}` : m.delta === 0 ? '=' : m.delta}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Breakdown */}
      <div className="bg-forge-surface border border-forge-border rounded-lg p-4">
        <p className="text-[10px] tracking-widest text-forge-muted uppercase mb-3">Daily Breakdown</p>
        <div className="space-y-2">
          {daily.map((d) => (
            <div key={d.date} className="flex items-center gap-3">
              <span className="text-[10px] text-forge-muted w-8 shrink-0">{d.dayName}</span>
              <div className="flex-1 space-y-0.5">
                <MiniBar value={d.monkScore} max={100} color={d.monkScore >= 70 ? 'bg-forge-green' : d.monkScore >= 40 ? 'bg-yellow-500' : 'bg-forge-red'} />
              </div>
              <span className={`text-xs font-bold w-10 text-right ${
                d.monkScore >= 70 ? 'text-forge-green' : d.monkScore >= 40 ? 'text-yellow-500' : d.monkScore > 0 ? 'text-forge-red' : 'text-forge-muted'
              }`}>
                {d.monkScore > 0 ? `${d.monkScore}%` : '—'}
              </span>
              <div className="text-[9px] text-forge-muted w-20 text-right shrink-0">
                {d.mainDone > 0 || d.mainTotal > 0 ? `${d.mainDone}/${d.mainTotal}M` : ''}
                {d.cleanDone > 0 ? ` ${d.cleanDone}C` : ''}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pattern Detection */}
      {warnings.length > 0 && (
        <div className="bg-forge-surface border border-forge-red/30 rounded-lg p-4">
          <p className="text-[10px] tracking-widest text-forge-red uppercase mb-3">Issues Detected</p>
          <div className="space-y-2">
            {warnings.map((p, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className={`text-sm mt-0.5 ${p.severity === 'critical' ? 'text-forge-red' : 'text-yellow-500'}`}>
                  {p.severity === 'critical' ? '⚠' : '△'}
                </span>
                <span className="text-sm text-forge-text leading-tight">{p.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {positives.length > 0 && (
        <div className="bg-forge-surface border border-forge-green/30 rounded-lg p-4">
          <p className="text-[10px] tracking-widest text-forge-green uppercase mb-3">Working Well</p>
          <div className="space-y-2">
            {positives.map((p, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-sm text-forge-green mt-0.5">✓</span>
                <span className="text-sm text-forge-text leading-tight">{p.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {warnings.length === 0 && positives.length === 0 && (
        <div className="bg-forge-surface border border-forge-border rounded-lg p-4 text-center">
          <p className="text-forge-muted text-sm">Not enough data yet. Keep logging for pattern detection.</p>
        </div>
      )}
    </div>
  );
}
