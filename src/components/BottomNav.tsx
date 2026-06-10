'use client';

const tabs = [
  { id: 'today', label: 'Today', icon: '⊕' },
  { id: 'proof', label: 'Proof', icon: '▊' },
  { id: 'skills', label: 'Skills', icon: '◈' },
  { id: 'clean', label: 'Clean', icon: '⊘' },
  { id: 'lock', label: 'Lock', icon: '◧' },
  { id: 'review', label: 'Review', icon: '▤' },
] as const;

export type TabId = (typeof tabs)[number]['id'];

export default function BottomNav({ active, onChange }: { active: TabId; onChange: (t: TabId) => void }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-forge-bg border-t border-forge-border z-50">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-2 pb-[env(safe-area-inset-bottom)]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex flex-col items-center gap-0.5 text-[10px] tracking-widest uppercase transition-colors ${
              active === tab.id ? 'text-forge-red' : 'text-forge-muted'
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
