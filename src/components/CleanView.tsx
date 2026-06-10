'use client';

import { UserProfile } from '@/lib/types';
import { getTodayLog } from '@/lib/store';

interface Props {
  profile: UserProfile;
  onToggle: (questId: string) => void;
}

export default function CleanView({ profile, onToggle }: Props) {
  const log = getTodayLog(profile);
  const cleanQuests = log.quests.filter((q) => q.type === 'clean');

  const bodyQuests = cleanQuests.filter((q) => q.category === 'body');
  const mindQuests = cleanQuests.filter((q) => q.category === 'mind');
  const recoveryQuests = cleanQuests.filter((q) => q.category === 'recovery');

  const totalClean = cleanQuests.filter((q) => q.done).length;
  const integrityPct = cleanQuests.length > 0 ? Math.round((totalClean / cleanQuests.length) * 100) : 100;

  const categoryScore = (quests: typeof cleanQuests) =>
    quests.length > 0 ? Math.round((quests.filter((q) => q.done).length / quests.length) * 100) : 100;

  const categories = [
    { label: 'Body', quests: bodyQuests, score: categoryScore(bodyQuests) },
    { label: 'Mind', quests: mindQuests, score: categoryScore(mindQuests) },
    { label: 'Recovery', quests: recoveryQuests, score: categoryScore(recoveryQuests) },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Clean Mode.</h2>
        <p className="text-forge-muted text-sm">Protect your integrity.</p>
      </div>

      <div className="bg-forge-surface border border-forge-border rounded-lg p-4 text-center">
        <p className="text-[10px] tracking-widest text-forge-muted uppercase mb-2">Integrity Score</p>
        <p className="text-5xl font-black">{integrityPct}%</p>
        <div className="w-full h-1.5 bg-forge-border rounded-full overflow-hidden mt-3">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              integrityPct >= 80 ? 'bg-forge-green' : integrityPct >= 50 ? 'bg-yellow-500' : 'bg-forge-red'
            }`}
            style={{ width: `${integrityPct}%` }}
          />
        </div>
        <p className="text-xs text-forge-muted mt-2">
          {totalClean} / {cleanQuests.length} clean
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {categories.map((cat) => (
          <div key={cat.label} className="bg-forge-surface border border-forge-border rounded-lg p-3 text-center">
            <p className="text-[10px] tracking-widest text-forge-muted uppercase">{cat.label}</p>
            <p
              className={`text-2xl font-bold ${
                cat.score >= 80 ? 'text-forge-green' : cat.score >= 50 ? 'text-yellow-500' : 'text-forge-red'
              }`}
            >
              {cat.score}%
            </p>
          </div>
        ))}
      </div>

      {categories.map(
        (cat) =>
          cat.quests.length > 0 && (
            <div key={cat.label} className="bg-forge-surface border border-forge-border rounded-lg p-4">
              <p className="text-[10px] tracking-widest text-forge-muted uppercase mb-3">{cat.label} Integrity</p>
              <div className="space-y-2">
                {cat.quests.map((q) => (
                  <button
                    key={q.id}
                    onClick={() => onToggle(q.id)}
                    className="flex items-center justify-between w-full py-1"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded border flex items-center justify-center text-xs ${
                          q.done
                            ? 'border-forge-green text-forge-green bg-forge-green/10'
                            : 'border-forge-border text-transparent'
                        }`}
                      >
                        ✓
                      </div>
                      <span className={`text-sm ${q.done ? 'text-forge-green' : 'text-forge-text'}`}>
                        {q.label}
                      </span>
                    </div>
                    <span className={`text-xs ${q.done ? 'text-forge-green' : 'text-forge-muted'}`}>
                      {q.done ? 'CLEAN' : 'PENDING'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )
      )}

      <div className="bg-forge-surface border border-forge-border rounded-lg p-4">
        <p className="text-[10px] tracking-widest text-forge-muted uppercase mb-2">Clean Multiplier</p>
        <div className="flex items-center justify-between">
          <p className="text-2xl font-bold">x{log.cleanMultiplier.toFixed(2)}</p>
          <p className="text-xs text-forge-muted">Applied to all XP earned today</p>
        </div>
      </div>
    </div>
  );
}
