'use client';

import { useState } from 'react';

interface Props {
  onOpenQuests: () => void;
  onOpenSkills: () => void;
  onOpenSettings: () => void;
  online?: boolean;
  installed?: boolean;
}

export default function Header({ onOpenQuests, onOpenSkills, onOpenSettings, online = true, installed = false }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 px-5 pt-[max(0.5rem,env(safe-area-inset-top))] pb-2 bg-forge-bg/86 backdrop-blur-xl border-b border-forge-border/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="forge-mark text-sm">F</span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-[0.2em] text-forge-text">FORGE</h1>
              <span className="h-2 w-2 rounded-full bg-forge-green shadow-[0_0_18px_rgba(143,214,201,0.72)]" />
            </div>
            <div className="mt-1 flex items-center gap-2">
              <p className="text-[10px] tracking-[0.24em] text-forge-red font-bold">DAILY PROTOCOL</p>
              <span className="text-[9px] tracking-[0.16em] text-forge-muted">
                {installed ? 'INSTALLED' : online ? 'LOCAL-FIRST' : 'OFFLINE'}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Open command menu"
          aria-expanded={menuOpen}
          className="grid h-11 w-11 place-items-center rounded-full border border-forge-border bg-forge-surface/80 text-forge-muted text-xl active:scale-95 transition"
        >
          ☰
        </button>
      </div>

      {menuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
          <div className="absolute right-5 top-[calc(100%-0.25rem)] z-50 forge-card rounded-xl overflow-hidden min-w-[220px]">
            <div className="px-4 py-3 border-b border-forge-border/60">
              <p className="text-[10px] tracking-[0.22em] text-forge-muted uppercase">Command Deck</p>
              <p className="mt-1 text-xs text-forge-text">Your data stays on this device.</p>
            </div>
            <button
              onClick={() => { onOpenQuests(); setMenuOpen(false); }}
              className="w-full text-left px-4 py-3 text-sm text-forge-text hover:bg-forge-bg transition-colors flex items-center gap-3"
            >
              <span className="text-forge-green">⊕</span> Edit quests
            </button>
            <div className="h-[1px] bg-forge-border" />
            <button
              onClick={() => { onOpenSkills(); setMenuOpen(false); }}
              className="w-full text-left px-4 py-3 text-sm text-forge-text hover:bg-forge-bg transition-colors flex items-center gap-3"
            >
              <span className="text-forge-green">◈</span> Edit skills
            </button>
            <div className="h-[1px] bg-forge-border" />
            <button
              onClick={() => { onOpenSettings(); setMenuOpen(false); }}
              className="w-full text-left px-4 py-3 text-sm text-forge-text hover:bg-forge-bg transition-colors flex items-center gap-3"
            >
              <span>⚙</span> Settings
            </button>
          </div>
        </>
      )}
    </header>
  );
}
