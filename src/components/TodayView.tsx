'use client';

import { useState } from 'react';
import { UserProfile, Quest, LIFE_DOMAINS, LifeDomainId } from '@/lib/types';
import { getTodayLog } from '@/lib/store';
import { hapticLight, hapticSuccess } from '@/lib/haptics';

interface Props {
  profile: UserProfile;
  onToggle: (questId: string) => void;
}

// ── Helpers ──────────────────────────────────────────────────────────

function getLast7Days(profile: UserProfile): { date: string; score: number; xp: number }[] {
  const result: { date: string; score: number; xp: number }[] = [];
  const d = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(d);
    date.setDate(date.getDate() - i);
    const key = date.toISOString().slice(0, 10);
    const log = profile.logs[key];
    result.push({ date: key, score: log?.monkScore || 0, xp: log?.xpEarned || 0 });
  }
  return result;
}

function getWeekComparison(profile: UserProfile): { label: string; now: number; prev: number }[] {
  const thisWeek: { score: number; xp: number; mainDone: number; cleanDone: number } = { score: 0, xp: 0, mainDone: 0, cleanDone: 0 };
  const lastWeek: typeof thisWeek = { score: 0, xp: 0, mainDone: 0, cleanDone: 0 };
  let twDays = 0, lwDays = 0;
  const d = new Date();

  for (let i = 0; i < 14; i++) {
    const date = new Date(d);
    date.setDate(date.getDate() - i);
    const key = date.toISOString().slice(0, 10);
    const log = profile.logs[key];
    if (!log) continue;
    const bucket = i < 7 ? thisWeek : lastWeek;
    if (i < 7) twDays++; else lwDays++;
    bucket.score += log.monkScore;
    bucket.xp += log.xpEarned;
    bucket.mainDone += log.quests.filter(q => q.type === 'main' && q.done).length;
    bucket.cleanDone += log.quests.filter(q => q.type === 'clean' && q.done).length;
  }

  return [
    { label: 'Monk Score', now: twDays > 0 ? Math.round(thisWeek.score / twDays) : 0, prev: lwDays > 0 ? Math.round(lastWeek.score / lwDays) : 0 },
    { label: 'XP', now: thisWeek.xp, prev: lastWeek.xp },
    { label: 'Main Done', now: thisWeek.mainDone, prev: lastWeek.mainDone },
    { label: 'Clean', now: thisWeek.cleanDone, prev: lastWeek.cleanDone },
  ];
}

function getDomainProgress(profile: UserProfile): { id: LifeDomainId; name: string; icon: string; done: number; total: number }[] {
  const domains = profile.onboarding.domains;
  if (!domains || domains.length === 0) return [];

  const log = getTodayLog(profile);
  const skills = profile.onboarding.skills;

  const domainSkillMap: Record<string, LifeDomainId> = {};
  for (const s of skills) {
    if (['pushups', 'pullups', 'dips', 'core', 'running', 'mobility'].includes(s.id)) domainSkillMap[s.id] = 'body';
    else if (['reading', 'meditation', 'journaling'].includes(s.id)) domainSkillMap[s.id] = 'mind';
    else if (['deepwork', 'shipping', 'learning'].includes(s.id)) domainSkillMap[s.id] = 'career';
  }

  return domains.map(d => {
    const info = LIFE_DOMAINS[d];
    let quests: Quest[];
    if (d === 'discipline') {
      quests = log.quests.filter(q => q.type === 'clean');
    } else {
      const relevantSkillIds = Object.entries(domainSkillMap).filter(([, dom]) => dom === d).map(([id]) => id);
      quests = log.quests.filter(q => {
        if (q.templateId) {
          const template = profile.questTemplates.find(t => t.id === q.templateId);
          if (template?.skillId && relevantSkillIds.includes(template.skillId)) return true;
        }
        // Fallback label matching
        const label = q.label.toLowerCase();
        if (d === 'body') return ['push', 'pull', 'dip', 'core', 'run', 'mobil', 'step'].some(k => label.includes(k));
        if (d === 'mind') return ['read', 'meditat', 'journal', 'focus'].some(k => label.includes(k));
        if (d === 'career') return ['deep work', 'ship', 'learn'].some(k => label.includes(k));
        return false;
      });
    }

    return {
      id: d,
      name: info.name,
      icon: info.icon,
      done: quests.filter(q => q.done).length,
      total: quests.length,
    };
  }).filter(d => d.total > 0);
}

const SHORT_DAYS = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

function nextQuest(quests: Quest[]): Quest | undefined {
  return quests.find(q => !q.done);
}

// ── Sub-components ──────────────────────────────────────────────────

function WeekChart({ data }: { data: { date: string; score: number }[] }) {
  const max = Math.max(...data.map(d => d.score), 1);
  return (
    <div className="bg-forge-surface border border-forge-border rounded-lg p-4">
      <p className="text-[10px] tracking-widest text-forge-muted uppercase mb-3">This week</p>
      <div className="flex items-end gap-1.5 h-[80px]">
        {data.map((d, i) => {
          const h = Math.max(4, (d.score / max) * 100);
          const isToday = i === data.length - 1;
          const dayIdx = new Date(d.date).getDay();
          return (
            <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex flex-col justify-end" style={{ height: '60px' }}>
                <div
                  className={`w-full rounded-sm transition-all duration-500 ${
                    d.score >= 70 ? 'bg-forge-green' : d.score >= 40 ? 'bg-yellow-500' : d.score > 0 ? 'bg-forge-red' : 'bg-forge-border'
                  } ${isToday ? 'ring-1 ring-forge-text/20' : ''}`}
                  style={{ height: `${h}%`, minHeight: '3px' }}
                />
              </div>
              <span className={`text-[9px] ${isToday ? 'text-forge-text font-bold' : 'text-forge-muted'}`}>
                {SHORT_DAYS[dayIdx]}
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-2 pt-2 border-t border-forge-border/50">
        <span className="text-[10px] text-forge-muted">
          Avg: <span className="text-forge-text font-bold">{Math.round(data.reduce((s, d) => s + d.score, 0) / Math.max(data.filter(d => d.score > 0).length, 1))}%</span>
        </span>
        <span className="text-[10px] text-forge-muted">
          Best: <span className="text-forge-green font-bold">{Math.max(...data.map(d => d.score))}%</span>
        </span>
      </div>
    </div>
  );
}

function DomainCards({ domains }: { domains: { id: string; name: string; icon: string; done: number; total: number }[] }) {
  if (domains.length === 0) return null;
  return (
    <div className={`grid gap-2 ${domains.length <= 2 ? 'grid-cols-2' : domains.length === 3 ? 'grid-cols-3' : 'grid-cols-4'}`}>
      {domains.map(d => {
        const pct = d.total > 0 ? Math.round((d.done / d.total) * 100) : 0;
        return (
          <div key={d.id} className="bg-forge-surface border border-forge-border rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-sm">{d.icon}</span>
              <span className="text-[9px] tracking-widest text-forge-muted uppercase">{d.name}</span>
            </div>
            <p className={`text-xl font-black tabular-nums ${pct >= 80 ? 'text-forge-green' : pct >= 40 ? 'text-forge-text' : 'text-forge-muted'}`}>{pct}%</p>
            <div className="w-full h-1 bg-forge-border rounded-full overflow-hidden mt-1.5">
              <div className={`h-full rounded-full transition-all duration-500 ${pct >= 80 ? 'bg-forge-green' : pct >= 40 ? 'bg-forge-red' : 'bg-forge-muted'}`}
                style={{ width: `${pct}%` }} />
            </div>
            <p className="text-[9px] text-forge-muted mt-1">{d.done}/{d.total}</p>
          </div>
        );
      })}
    </div>
  );
}

function TrendBadges({ comparison }: { comparison: { label: string; now: number; prev: number }[] }) {
  return (
    <div className="bg-forge-surface border border-forge-border rounded-lg p-4">
      <p className="text-[10px] tracking-widest text-forge-muted uppercase mb-3">vs last week</p>
      <div className="grid grid-cols-4 gap-2">
        {comparison.map(c => {
          const delta = c.now - c.prev;
          const trend = delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat';
          return (
            <div key={c.label} className="text-center">
              <p className="text-[9px] text-forge-muted tracking-wider">{c.label}</p>
              <p className="text-sm font-bold tabular-nums">{c.now}</p>
              <p className={`text-[10px] font-bold ${trend === 'up' ? 'text-forge-green' : trend === 'down' ? 'text-forge-red' : 'text-forge-muted'}`}>
                {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '='}{Math.abs(delta) > 0 ? Math.abs(delta) : ''}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProtocolHero({
  name,
  score,
  progressPct,
  totalDone,
  totalQuests,
  xp,
  streak,
  next,
  motivation,
}: {
  name: string;
  score: number;
  progressPct: number;
  totalDone: number;
  totalQuests: number;
  xp: number;
  streak: number;
  next?: Quest;
  motivation?: string;
}) {
  const grade = score >= 80 ? 'tempered' : score >= 50 ? 'heating' : 'cold';
  const scoreColor = score >= 70 ? 'text-forge-green' : score >= 40 ? 'text-forge-text' : 'text-forge-red';

  return (
    <section className="forge-ember-border rounded-2xl p-5 overflow-hidden relative">
      <div className="absolute -right-16 -top-20 h-44 w-44 rounded-full bg-forge-red/10 blur-3xl" />
      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold tracking-[0.26em] text-forge-green uppercase">Today&apos;s protocol</p>
            <h2 className="mt-2 text-3xl font-black leading-none tracking-[-0.03em]">
              Do the day{name ? `, ${name}` : ''}.
            </h2>
          </div>
          <div className="text-right">
            <p className={`text-4xl font-black tabular-nums leading-none ${scoreColor}`}>{score}</p>
            <p className="mt-1 text-[9px] font-bold tracking-[0.2em] text-forge-muted uppercase">monk score</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-[1fr_auto] gap-3 rounded-xl border border-forge-border/80 bg-forge-bg/50 p-3">
          <div>
            <p className="text-[10px] font-bold tracking-[0.22em] text-forge-muted uppercase">Next action</p>
            <p className="mt-1 text-sm font-semibold text-forge-text">{next ? next.label : 'Protocol complete. Review the day.'}</p>
          </div>
          <div className="rounded-lg border border-forge-border bg-forge-surface px-3 py-2 text-center">
            <p className="text-lg font-black tabular-nums">{totalDone}/{totalQuests}</p>
            <p className="text-[9px] tracking-[0.18em] text-forge-muted uppercase">logged</p>
          </div>
        </div>

        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[10px] tracking-[0.22em] text-forge-muted uppercase">protocol state: {grade}</p>
            <p className="text-xs font-bold text-forge-red">{progressPct}%</p>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-forge-border">
            <div
              className="h-full rounded-full bg-gradient-to-r from-forge-green via-forge-amber to-forge-red transition-all duration-700"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-xl border border-forge-border/70 bg-forge-bg/35 p-3">
            <p className="text-[9px] tracking-[0.18em] text-forge-muted uppercase">Streak</p>
            <p className="mt-1 text-xl font-black tabular-nums">{streak}</p>
          </div>
          <div className="rounded-xl border border-forge-border/70 bg-forge-bg/35 p-3">
            <p className="text-[9px] tracking-[0.18em] text-forge-muted uppercase">Today XP</p>
            <p className="mt-1 text-xl font-black tabular-nums">{xp}</p>
          </div>
          <div className="rounded-xl border border-forge-border/70 bg-forge-bg/35 p-3">
            <p className="text-[9px] tracking-[0.18em] text-forge-muted uppercase">Storage</p>
            <p className="mt-1 text-sm font-black text-forge-green">LOCAL</p>
          </div>
        </div>

        {motivation && (
          <p className="mt-4 border-l border-forge-red/60 pl-3 text-sm italic leading-relaxed text-forge-muted">
            &quot;{motivation.length > 96 ? motivation.slice(0, 96) + '...' : motivation}&quot;
          </p>
        )}
      </div>
    </section>
  );
}

function StatusStrip({
  body,
  focus,
  recovery,
  cleanMultiplier,
}: {
  body: number;
  focus: number;
  recovery: number;
  cleanMultiplier: number;
}) {
  const items = [
    { label: 'Body', value: `${body}%`, hot: body >= 80 },
    { label: 'Focus', value: `${focus}%`, hot: focus >= 80 },
    { label: 'Recovery', value: `${recovery}%`, hot: recovery >= 80 },
    { label: 'Multiplier', value: `${cleanMultiplier.toFixed(2)}x`, hot: cleanMultiplier >= 1.15 },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {items.map(item => (
        <div key={item.label} className="forge-card rounded-xl p-3">
          <p className="text-[9px] tracking-[0.2em] text-forge-muted uppercase">{item.label}</p>
          <p className={`mt-1 text-xl font-black tabular-nums ${item.hot ? 'text-forge-green' : 'text-forge-text'}`}>{item.value}</p>
        </div>
      ))}
      <div className="col-span-2 rounded-xl border border-forge-green/35 bg-forge-green/5 p-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[9px] tracking-[0.2em] text-forge-muted uppercase">Focus setup</p>
            <p className="mt-1 text-sm text-forge-text">
              FORGE tracks the gate. Apple Screen Time and Shortcuts handle real blocking.
            </p>
          </div>
          <span className="shrink-0 rounded-full border border-forge-green px-3 py-1 text-[10px] font-black tracking-[0.16em] text-forge-green">
            HONEST
          </span>
        </div>
      </div>
    </div>
  );
}

function QuestRow({ quest, onToggle }: { quest: Quest; onToggle: () => void }) {
  const [justCompleted, setJustCompleted] = useState(false);
  const [showXp, setShowXp] = useState(false);

  const handleToggle = () => {
    if (!quest.done) {
      setJustCompleted(true);
      if (quest.xp > 0) setShowXp(true);
      hapticSuccess();
      setTimeout(() => setJustCompleted(false), 300);
      setTimeout(() => setShowXp(false), 800);
    } else {
      hapticLight();
    }
    onToggle();
  };

  return (
    <button onClick={handleToggle}
      className={`flex items-center justify-between w-full py-2 group relative ${justCompleted ? 'animate-quest-complete' : ''}`}>
      <div className="flex items-center gap-3">
        <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
          quest.done ? 'border-forge-green bg-forge-green/10 text-forge-green' : 'border-forge-border text-forge-muted'
        } ${justCompleted ? 'animate-check-pop' : ''}`}>
          {quest.done ? '✓' : <span className="text-[10px]">·</span>}
        </div>
        <span className={`text-sm ${quest.done ? 'text-forge-muted line-through' : 'text-forge-text'}`}>
          {quest.label}
        </span>
      </div>
      <div className="text-xs text-forge-muted relative">
        {showXp && quest.xp > 0 && (
          <span className="absolute -top-4 right-0 text-forge-green font-bold text-xs animate-xp-float">+{quest.xp} XP</span>
        )}
        {quest.done ? (
          <span className="text-forge-green font-bold">DONE</span>
        ) : quest.target ? (
          `${quest.progress || 0}/${quest.target} ${quest.unit || ''}`
        ) : quest.xp > 0 ? (
          `+${quest.xp}`
        ) : (
          quest.category ? quest.category.charAt(0).toUpperCase() + quest.category.slice(1) : 'Integrity'
        )}
      </div>
    </button>
  );
}

function findIcon(label: string, iconMap?: Record<string, string>): string {
  if (!iconMap) return '⊘';
  if (iconMap[label]) return iconMap[label];
  const lbl = label.toLowerCase();
  for (const [key, icon] of Object.entries(iconMap)) {
    if (lbl.includes(key.toLowerCase())) return icon;
  }
  return '⊘';
}

function QuestGrid({ quests, onToggle, iconMap }: { quests: Quest[]; onToggle: (id: string) => void; iconMap?: Record<string, string> }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {quests.map(q => {
        const foundIcon = findIcon(q.label, iconMap);
        const icon = foundIcon !== '⊘' ? foundIcon : (q.category === 'body' ? '💪' : q.category === 'mind' ? '🧠' : q.category === 'recovery' ? '🌙' : '⊘');
        return (
          <button key={q.id}
            onClick={() => { if (q.done) hapticLight(); else hapticSuccess(); onToggle(q.id); }}
            className={`flex flex-col items-center gap-1 py-3 px-2 rounded-lg border transition-all ${
              q.done ? 'border-forge-green/30 text-forge-green bg-forge-green/5' : 'border-forge-border text-forge-muted'
            }`}>
            <span className="text-lg">{icon}</span>
            <span className="text-[9px] tracking-wider text-center leading-tight">{q.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── Clean quest icon map ────────────────────────────────────────────

const cleanIcons: Record<string, string> = {
  'No Alcohol': '🚫', 'No Junk Food': '🍔', 'No Phone in Bed': '📵',
  'Sleep Before 23:30': '🌙', '2L Water': '💧', 'No Porn': '🚫',
  'No Instagram': '📷', 'No TikTok': '🎵', 'No Shorts': '📱',
  'No Nicotine': '🚬', 'No Soda': '🥤',
};

const sideIcons: Record<string, string> = {
  'Read': '📖', 'Room': '🏠', 'step': '👣',
  'Ship': '🚀', 'Journal': '✍️', 'Meditation': '🪷', 'Learning': '📚',
};

// ── Main TodayView ──────────────────────────────────────────────────

export default function TodayView({ profile, onToggle }: Props) {
  const log = getTodayLog(profile);
  const mainQuests = log.quests.filter(q => q.type === 'main');
  const sideQuests = log.quests.filter(q => q.type === 'side');
  const cleanQuests = log.quests.filter(q => q.type === 'clean');

  const totalDone = log.quests.filter(q => q.done).length;
  const totalQuests = log.quests.length;
  const progressPct = totalQuests > 0 ? Math.round((totalDone / totalQuests) * 100) : 0;
  const next = nextQuest([...mainQuests, ...sideQuests, ...cleanQuests]);

  const weekData = getLast7Days(profile);
  const comparison = getWeekComparison(profile);
  const domainProgress = getDomainProgress(profile);
  const hasHistory = Object.keys(profile.logs).length > 1;

  return (
    <div className="space-y-4">
      <ProtocolHero
        name={profile.onboarding.name}
        score={log.monkScore}
        progressPct={progressPct}
        totalDone={totalDone}
        totalQuests={totalQuests}
        xp={log.xpEarned}
        streak={profile.currentStreak}
        next={next}
        motivation={profile.onboarding.motivation}
      />

      <StatusStrip
        body={log.bodyIntegrity}
        focus={log.focusIntegrity}
        recovery={log.recoveryScore}
        cleanMultiplier={log.cleanMultiplier}
      />

      {/* Weekly chart */}
      <WeekChart data={weekData} />

      {/* Domain progress */}
      {domainProgress.length > 0 && <DomainCards domains={domainProgress} />}

      {/* Week comparison */}
      {hasHistory && <TrendBadges comparison={comparison} />}

      {/* Main Quests */}
      <div className="forge-card rounded-xl p-4">
        <p className="text-[10px] tracking-widest text-forge-muted uppercase mb-3">Main Quests</p>
        <div className="divide-y divide-forge-border/30">
          {mainQuests.map(q => <QuestRow key={q.id} quest={q} onToggle={() => onToggle(q.id)} />)}
        </div>
      </div>

      {/* Side Quests */}
      {sideQuests.length > 0 && (
        <div className="forge-card rounded-xl p-4">
          <p className="text-[10px] tracking-widest text-forge-muted uppercase mb-3">Side Quests</p>
          <QuestGrid quests={sideQuests} onToggle={onToggle} iconMap={sideIcons} />
        </div>
      )}

      {/* Clean Quests */}
      {cleanQuests.length > 0 && (
        <div className="forge-card rounded-xl p-4">
          <p className="text-[10px] tracking-widest text-forge-muted uppercase mb-3">Clean Quests</p>
          <QuestGrid quests={cleanQuests} onToggle={onToggle} iconMap={cleanIcons} />
        </div>
      )}
    </div>
  );
}
