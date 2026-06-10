'use client';

import { UserProfile } from '@/lib/types';
import { getWeeklyStats } from '@/lib/store';

interface Props {
  profile: UserProfile;
}

export default function ReviewView({ profile }: Props) {
  const stats = getWeeklyStats(profile);
  const logs = Object.values(profile.logs).slice(-7);

  const worked = [
    'Morning run',
    'Phone outside bedroom',
    'Short deep-work blocks',
  ];
  const broke = [
    'Late-night scrolling',
    'Friday junk food',
    'Missed mobility',
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Weekly review.</h2>
        <p className="text-forge-muted text-sm">Adjust. Continue.</p>
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

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-forge-surface border border-forge-border rounded-lg p-4">
          <p className="text-[10px] tracking-widest text-forge-muted uppercase mb-3">What Worked</p>
          {worked.map((w) => (
            <div key={w} className="flex items-center gap-2 py-1">
              <span className="text-forge-green text-sm">✓</span>
              <span className="text-sm">{w}</span>
            </div>
          ))}
        </div>
        <div className="bg-forge-surface border border-forge-border rounded-lg p-4">
          <p className="text-[10px] tracking-widest text-forge-muted uppercase mb-3">What Broke the Streak</p>
          {broke.map((b) => (
            <div key={b} className="flex items-center gap-2 py-1">
              <span className="text-forge-red text-sm">✗</span>
              <span className="text-sm">{b}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-forge-surface border border-forge-border rounded-lg p-4">
        <p className="text-[10px] tracking-widest text-forge-muted uppercase mb-3">Next Week Protocol</p>
        {[
          { label: 'Runs', icon: '🏃', target: 3 },
          { label: 'Strength Sessions', icon: '💪', target: 3 },
          { label: 'Deep Work Blocks', icon: '🧠', target: 5 },
          { label: 'Clean Evenings', icon: '🌙', target: 5 },
          { label: 'Sleep before 23:30', icon: '⏰', target: 5 },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between py-2 border-b border-forge-border/30 last:border-0">
            <div className="flex items-center gap-3">
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm">{item.label}</span>
            </div>
            <span className="text-sm font-bold text-forge-red">{item.target}</span>
          </div>
        ))}
      </div>

      <div className="bg-forge-surface border border-forge-border rounded-lg p-4">
        <p className="text-[10px] tracking-widest text-forge-muted uppercase mb-3">Adjustments</p>
        {[
          { icon: '⚙️', label: 'Lower friction on Tuesday' },
          { icon: '📅', label: 'Move coding before lunch' },
          { icon: '🔒', label: 'Keep Instagram locked until first deep work block' },
        ].map((a) => (
          <div key={a.label} className="flex items-center gap-3 py-2 border-b border-forge-border/30 last:border-0">
            <span className="text-lg">{a.icon}</span>
            <span className="text-sm">{a.label}</span>
          </div>
        ))}
      </div>

      <button className="w-full py-3 bg-forge-red text-white font-bold tracking-wider rounded-lg text-sm">
        LOCK NEXT WEEK
      </button>
    </div>
  );
}
