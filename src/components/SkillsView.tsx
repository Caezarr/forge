'use client';

import { UserProfile, SkillLevel, PRESET_SKILLS } from '@/lib/types';
import { getTodayLog } from '@/lib/store';

interface Props {
  profile: UserProfile;
}

export default function SkillsView({ profile }: Props) {
  const ovr = Math.round(
    profile.attributes.reduce((sum, a) => sum + a.value, 0) / profile.attributes.length
  );
  const xpToNext = 500 - (profile.totalXp % 500);
  const levelProgress = ((profile.totalXp % 500) / 500) * 100;

  const skills: SkillLevel[] = profile.onboarding.skills;
  const todayLog = getTodayLog(profile);
  const doneQuests = todayLog.quests.filter((q) => q.done);

  const focusItems = skills
    .filter((s) => !s.archived && s.goal > s.currentLevel)
    .slice(0, 3)
    .map((s) => {
      const preset = PRESET_SKILLS[s.id];
      return {
        label: s.name || preset?.name || s.id,
        icon: s.icon || preset?.icon || '◈',
        done: s.currentLevel,
        target: s.goal,
      };
    });

  const recentGains: { label: string; icon: string; xp: number }[] = [];
  const attrXpMap: Record<string, number> = {};
  for (const q of doneQuests) {
    if (q.xp > 0) {
      const cat = q.category || 'discipline';
      attrXpMap[cat] = (attrXpMap[cat] || 0) + q.xp;
    }
  }
  for (const [cat, xp] of Object.entries(attrXpMap)) {
    const attr = profile.attributes.find(
      (a) => a.key.toLowerCase() === cat.toLowerCase()
    );
    recentGains.push({
      label: attr?.label || cat.charAt(0).toUpperCase() + cat.slice(1),
      icon: attr?.icon || '◈',
      xp,
    });
  }

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

      {skills.length > 0 && (
        <div className="bg-forge-surface border border-forge-border rounded-lg p-4">
          <p className="text-[10px] tracking-widest text-forge-muted uppercase mb-3">Skills</p>
          <div className="space-y-3">
            {skills.filter((s) => !s.archived).map((s) => {
              const preset = PRESET_SKILLS[s.id];
              const name = s.name || preset?.name || s.id;
              const icon = s.icon || preset?.icon || '◈';
              const progress = s.goal ? Math.min(100, Math.round((s.currentLevel / s.goal) * 100)) : 0;
              return (
                <div key={s.id}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{icon}</span>
                      <span className="text-sm text-forge-text">{name}</span>
                    </div>
                    <span className="text-xs text-forge-muted">
                      Lv.{s.currentLevel}{s.goal ? ` / ${s.goal}` : ''}
                    </span>
                  </div>
                  {s.goal > 0 && (
                    <div className="w-full h-1 bg-forge-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-forge-red rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {focusItems.length > 0 && (
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
                  <span className="text-forge-muted"> / {f.target}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {recentGains.length > 0 && (
        <div className="bg-forge-surface border border-forge-border rounded-lg p-4">
          <p className="text-[10px] tracking-widest text-forge-muted uppercase mb-3">Today&apos;s Gains</p>
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
      )}
    </div>
  );
}
