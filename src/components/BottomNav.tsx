'use client';

const tabs = [
  { id: 'morning', label: 'Morning', shortLabel: 'Morn', icon: '☼' },
  { id: 'today', label: 'Today', icon: '⊕' },
  { id: 'proof', label: 'Proof', icon: '▊' },
  { id: 'skills', label: 'Skills', shortLabel: 'Skill', icon: '◈' },
  { id: 'clean', label: 'Clean', icon: '⊘' },
  { id: 'focus', label: 'Focus', icon: '⌁' },
  { id: 'review', label: 'Review', shortLabel: 'Rev', icon: '▤' },
] as const;

export type TabId = (typeof tabs)[number]['id'];

export default function BottomNav({ active, onChange }: { active: TabId; onChange: (t: TabId) => void }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 pointer-events-none">
      <div className="pointer-events-auto mx-auto grid h-16 max-w-lg grid-cols-7 items-center rounded-2xl border border-forge-border/90 bg-forge-bg/95 px-1 shadow-[0_-20px_60px_rgba(0,0,0,0.38)] backdrop-blur-xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            aria-label={`Open ${tab.label}`}
            aria-current={active === tab.id ? 'page' : undefined}
            className={`relative flex min-w-0 flex-col items-center gap-0.5 rounded-xl px-0.5 py-2 uppercase leading-none transition-all active:scale-95 ${
              active === tab.id ? 'text-forge-text' : 'text-forge-muted'
            }`}
          >
            {active === tab.id && <span className="absolute inset-x-3 top-0 h-px bg-forge-green shadow-[0_0_14px_rgba(143,214,201,0.82)]" />}
            <span className={`text-lg ${active === tab.id ? 'text-forge-green' : ''}`}>{tab.icon}</span>
            <span className="block max-w-full truncate text-[8px] font-bold tracking-[0.01em]">
              {'shortLabel' in tab ? tab.shortLabel : tab.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
}
