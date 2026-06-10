'use client';

import { UserProfile } from '@/lib/types';
import { getTodayLog, isAppUnlocked } from '@/lib/store';

interface Props {
  profile: UserProfile;
}

export default function LockView({ profile }: Props) {
  const log = getTodayLog(profile);
  const unlocked = isAppUnlocked(profile);
  const mainQuests = log.quests.filter((q) => q.type === 'main');
  const mainDone = mainQuests.filter((q) => q.done).length;
  const required = Math.min(2, mainQuests.length);

  const lockedApps = profile.onboarding.poisons
    .filter((p) => ['instagram', 'tiktok', 'shorts'].includes(p))
    .map((p) => ({
      id: p,
      label: p.charAt(0).toUpperCase() + p.slice(1),
      icon: p === 'instagram' ? '📷' : p === 'tiktok' ? '🎵' : '📱',
    }));

  if (lockedApps.length === 0) {
    lockedApps.push({ id: 'instagram', label: 'Instagram', icon: '📷' });
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Access Lock.</h2>
        <p className="text-forge-muted text-sm">Earn your distractions.</p>
      </div>

      <div
        className={`bg-forge-surface border rounded-lg p-6 text-center ${
          unlocked ? 'border-forge-green' : 'border-forge-red'
        }`}
      >
        <div className="text-6xl mb-4">{unlocked ? '🔓' : '🔒'}</div>
        <p className="text-2xl font-bold mb-2">{unlocked ? 'Unlocked' : 'Locked'}</p>
        <p className="text-sm text-forge-muted">
          {unlocked
            ? 'You earned your access. Stay disciplined.'
            : `Complete ${required - mainDone} more Main Quest${required - mainDone > 1 ? 's' : ''} to unlock.`}
        </p>
      </div>

      <div className="bg-forge-surface border border-forge-border rounded-lg p-4">
        <p className="text-[10px] tracking-widest text-forge-muted uppercase mb-3">Unlock Requirements</p>
        {mainQuests.map((q) => (
          <div key={q.id} className="flex items-center justify-between py-2 border-b border-forge-border/30 last:border-0">
            <div className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs ${
                  q.done ? 'border-forge-green text-forge-green' : 'border-forge-border text-transparent'
                }`}
              >
                ✓
              </div>
              <span className={`text-sm ${q.done ? 'text-forge-green' : 'text-forge-text'}`}>{q.label}</span>
            </div>
            <span className={`text-xs font-bold ${q.done ? 'text-forge-green' : 'text-forge-red'}`}>
              {q.done ? 'DONE' : 'PENDING'}
            </span>
          </div>
        ))}
      </div>

      <div className="bg-forge-surface border border-forge-border rounded-lg p-4">
        <p className="text-[10px] tracking-widest text-forge-muted uppercase mb-3">Locked Apps</p>
        <div className="space-y-3">
          {lockedApps.map((app) => (
            <div key={app.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{app.icon}</span>
                <span className="text-sm">{app.label}</span>
              </div>
              <span
                className={`text-xs font-bold px-3 py-1 rounded border ${
                  unlocked ? 'text-forge-green border-forge-green' : 'text-forge-red border-forge-red'
                }`}
              >
                {unlocked ? 'UNLOCKED' : 'LOCKED'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-forge-surface border border-forge-border rounded-lg p-4">
        <p className="text-[10px] tracking-widest text-forge-muted uppercase mb-2">Focus Lock</p>
        <div className="flex items-center justify-between">
          <p className="text-sm text-forge-muted">Auto-lock until quests are done</p>
          <div
            className={`w-12 h-6 rounded-full p-0.5 transition-all ${
              profile.focusLockActive ? 'bg-forge-red' : 'bg-forge-border'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                profile.focusLockActive ? 'translate-x-6' : ''
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
