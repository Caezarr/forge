'use client';

import { UserProfile, Quest } from '@/lib/types';
import { getTodayLog, isAppUnlocked } from '@/lib/store';
import Heatmap from './Heatmap';
import { getConsistencyData } from '@/lib/store';

interface Props {
  profile: UserProfile;
  onToggle: (questId: string) => void;
}

function QuestRow({ quest, onToggle }: { quest: Quest; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center justify-between w-full py-2 group"
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
            quest.done
              ? 'border-forge-green bg-forge-green/10 text-forge-green'
              : 'border-forge-border text-forge-muted'
          }`}
        >
          {quest.done ? '✓' : quest.type === 'main' ? (
            <span className="text-[10px]">{quest.xp > 0 ? Math.ceil(quest.xp / 30) : '·'}</span>
          ) : (
            <span className="text-[10px]">·</span>
          )}
        </div>
        <span className={`text-sm ${quest.done ? 'text-forge-muted line-through' : 'text-forge-text'}`}>
          {quest.label}
        </span>
      </div>
      <div className="text-xs text-forge-muted">
        {quest.done ? (
          <span className="text-forge-green font-bold">DONE</span>
        ) : quest.target ? (
          `${quest.progress || 0} / ${quest.target} ${quest.unit || ''}`
        ) : quest.xp > 0 ? (
          `+${quest.xp}`
        ) : (
          quest.category ? quest.category.charAt(0).toUpperCase() + quest.category.slice(1) : 'Integrity'
        )}
      </div>
    </button>
  );
}

export default function TodayView({ profile, onToggle }: Props) {
  const log = getTodayLog(profile);
  const mainQuests = log.quests.filter((q) => q.type === 'main');
  const sideQuests = log.quests.filter((q) => q.type === 'side');
  const cleanQuests = log.quests.filter((q) => q.type === 'clean');
  const consistency = getConsistencyData(profile);
  const unlocked = isAppUnlocked(profile);

  const totalDone = log.quests.filter((q) => q.done).length;
  const totalQuests = log.quests.length;
  const progressPct = totalQuests > 0 ? Math.round((totalDone / totalQuests) * 100) : 0;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Lock in, {profile.onboarding.name}.</h2>
        <p className="text-forge-muted text-sm">Full focus. No drift.</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="bg-forge-surface border border-forge-border rounded-lg p-3 text-center">
          <p className="text-[10px] tracking-widest text-forge-muted uppercase">Day</p>
          <p className="text-2xl font-bold">{profile.currentDay}</p>
        </div>
        <div className="bg-forge-surface border border-forge-border rounded-lg p-3 text-center">
          <p className="text-[10px] tracking-widest text-forge-muted uppercase">Streak</p>
          <p className="text-2xl font-bold">
            {profile.currentStreak} <span className="text-sm">🔥</span>
          </p>
        </div>
        <div className="bg-forge-surface border border-forge-border rounded-lg p-3 text-center">
          <p className="text-[10px] tracking-widest text-forge-muted uppercase">Focus Lock</p>
          <p className={`text-sm font-bold ${profile.focusLockActive ? 'text-forge-green' : 'text-forge-red'}`}>
            {profile.focusLockActive ? 'ACTIVE' : 'OFF'}
          </p>
        </div>
      </div>

      <Heatmap data={consistency.slice(-56)} weeks={8} label="Consistency · Last 8 weeks" />

      <div className="bg-forge-surface border border-forge-border rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <p className="text-[10px] tracking-widest text-forge-muted uppercase">Today&apos;s protocol</p>
          <p className="text-sm font-bold text-forge-red">{progressPct}%</p>
        </div>
        <div className="w-full h-1.5 bg-forge-border rounded-full overflow-hidden">
          <div
            className="h-full bg-forge-red rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <div className="bg-forge-surface border border-forge-border rounded-lg p-4">
        <p className="text-[10px] tracking-widest text-forge-muted uppercase mb-3">Main Quests</p>
        <div className="divide-y divide-forge-border/30">
          {mainQuests.map((q) => (
            <QuestRow key={q.id} quest={q} onToggle={() => onToggle(q.id)} />
          ))}
        </div>
      </div>

      <div className="bg-forge-surface border border-forge-border rounded-lg p-4">
        <p className="text-[10px] tracking-widest text-forge-muted uppercase mb-3">Side Quests</p>
        <div className="grid grid-cols-3 gap-2">
          {sideQuests.map((q) => (
            <button
              key={q.id}
              onClick={() => onToggle(q.id)}
              className={`flex flex-col items-center gap-1 py-3 px-2 rounded-lg border transition-all ${
                q.done
                  ? 'border-forge-green/30 text-forge-green bg-forge-green/5'
                  : 'border-forge-border text-forge-muted'
              }`}
            >
              <span className="text-lg">{q.label.includes('Mobility') ? '🧘' : q.label.includes('Read') ? '📖' : '🏠'}</span>
              <span className="text-[10px] tracking-wider text-center">{q.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-forge-surface border border-forge-border rounded-lg p-4">
        <p className="text-[10px] tracking-widest text-forge-muted uppercase mb-3">Clean Quests</p>
        <div className="grid grid-cols-3 gap-2">
          {cleanQuests.map((q) => (
            <button
              key={q.id}
              onClick={() => onToggle(q.id)}
              className={`flex flex-col items-center gap-1 py-3 px-2 rounded-lg border transition-all ${
                q.done
                  ? 'border-forge-green/30 text-forge-green bg-forge-green/5'
                  : 'border-forge-border text-forge-muted'
              }`}
            >
              <span className="text-lg">
                {q.label.includes('Alcohol') ? '🚫' : q.label.includes('Junk') ? '🍔' : q.label.includes('Phone') ? '📵' :
                 q.label.includes('Sleep') ? '🌙' : q.label.includes('Water') ? '💧' : q.label.includes('Porn') ? '🚫' :
                 q.label.includes('Instagram') ? '📷' : q.label.includes('TikTok') ? '🎵' : q.label.includes('Shorts') ? '📱' :
                 q.label.includes('Nicotine') ? '🚬' : q.label.includes('Soda') ? '🥤' : '⊘'}
              </span>
              <span className="text-[9px] tracking-wider text-center leading-tight">{q.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-forge-surface border border-forge-border rounded-lg p-4">
        <p className="text-[10px] tracking-widest text-forge-muted uppercase mb-2">Access Lock</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📷</span>
            <div>
              <p className="text-sm font-medium">Instagram remains locked.</p>
              <p className="text-[10px] text-forge-muted">Complete Main Quests to unlock.</p>
            </div>
          </div>
          <span
            className={`text-xs font-bold px-3 py-1 rounded border ${
              unlocked
                ? 'text-forge-green border-forge-green'
                : 'text-forge-red border-forge-red'
            }`}
          >
            {unlocked ? 'UNLOCKED' : 'LOCKED'}
          </span>
        </div>
      </div>
    </div>
  );
}
