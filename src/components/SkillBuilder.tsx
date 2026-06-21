'use client';

import { useState } from 'react';
import { SkillLevel, SkillType, SkillCategory, UserProfile } from '@/lib/types';
import { addSkill, updateSkill, removeSkill } from '@/lib/store';
import { v4 as uuid } from 'uuid';

interface Props {
  profile: UserProfile;
  onUpdate: (profile: UserProfile) => void;
  onClose: () => void;
}

const SKILL_ICONS = ['🏃', '💪', '🧠', '📖', '🧘', '🎯', '🧊', '🔥', '💻', '🎨', '🎵', '📝', '🏋️', '🤸', '⚡', '🍎', '💤', '🗣️', '✍️', '🎸'];

const CATEGORIES: { id: SkillCategory; label: string; icon: string }[] = [
  { id: 'bodyweight', label: 'Bodyweight', icon: '💪' },
  { id: 'cardio', label: 'Cardio', icon: '🏃' },
  { id: 'mental', label: 'Mental', icon: '🧠' },
  { id: 'recovery', label: 'Recovery', icon: '🧘' },
  { id: 'custom', label: 'Custom', icon: '⚡' },
];

function SkillForm({ initial, onSave, onCancel }: {
  initial?: Partial<SkillLevel>;
  onSave: (data: Omit<SkillLevel, 'sortOrder'>) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name || '');
  const [icon, setIcon] = useState(initial?.icon || '🎯');
  const [type, setType] = useState<SkillType>(initial?.type || 'reps');
  const [category, setCategory] = useState<SkillCategory>(initial?.category || 'custom');
  const [currentLevel, setCurrentLevel] = useState(initial?.currentLevel ?? 0);
  const [goal, setGoal] = useState(initial?.goal ?? 0);
  const [unit, setUnit] = useState(initial?.unit || '');
  const [showIcons, setShowIcons] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setShowIcons(!showIcons)}
          className="w-12 h-12 bg-forge-bg border border-forge-border rounded-lg flex items-center justify-center text-2xl shrink-0"
        >
          {icon}
        </button>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Skill name..."
          className="flex-1 bg-forge-bg border border-forge-border rounded-lg px-3 py-2.5 text-forge-text text-sm placeholder:text-forge-muted/40 focus:border-forge-red/50 focus:outline-none"
          autoFocus
        />
      </div>

      {showIcons && (
        <div className="grid grid-cols-10 gap-1 bg-forge-bg border border-forge-border rounded-lg p-2">
          {SKILL_ICONS.map((ic) => (
            <button
              key={ic}
              onClick={() => { setIcon(ic); setShowIcons(false); }}
              className={`w-8 h-8 rounded flex items-center justify-center text-lg ${icon === ic ? 'bg-forge-red/20 border border-forge-red/50' : 'hover:bg-forge-surface'}`}
            >
              {ic}
            </button>
          ))}
        </div>
      )}

      <div>
        <p className="text-[10px] tracking-widest text-forge-muted uppercase mb-2">Category</p>
        <div className="grid grid-cols-5 gap-1">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`py-2 rounded-lg text-[10px] tracking-wider border transition-all flex flex-col items-center gap-0.5 ${
                category === c.id
                  ? 'border-forge-red text-forge-red bg-forge-red/5'
                  : 'border-forge-border text-forge-muted'
              }`}
            >
              <span className="text-sm">{c.icon}</span>
              <span>{c.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[10px] tracking-widest text-forge-muted uppercase mb-2">Tracking Type</p>
        <div className="grid grid-cols-4 gap-2">
          {([
            { id: 'reps', label: 'Reps', hint: 'pushups, sets...' },
            { id: 'duration', label: 'Time', hint: 'minutes, hours...' },
            { id: 'boolean', label: 'Yes/No', hint: 'did it or not' },
            { id: 'numeric', label: 'Number', hint: 'calories, pages...' },
          ] as const).map((tt) => (
            <button
              key={tt.id}
              onClick={() => setType(tt.id)}
              className={`py-2 rounded-lg text-[11px] tracking-wider border transition-all ${
                type === tt.id
                  ? 'border-forge-red text-forge-red bg-forge-red/5'
                  : 'border-forge-border text-forge-muted'
              }`}
            >
              {tt.label}
            </button>
          ))}
        </div>
      </div>

      {type !== 'boolean' && (
        <>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="text-[10px] text-forge-muted tracking-wider block mb-1">CURRENT LEVEL</label>
              <input
                type="number"
                inputMode="numeric"
                value={currentLevel || ''}
                onChange={(e) => setCurrentLevel(parseInt(e.target.value) || 0)}
                placeholder="0"
                className="w-full bg-forge-bg border border-forge-border rounded-lg px-3 py-2 text-forge-text text-sm focus:border-forge-red/50 focus:outline-none"
              />
            </div>
            <div className="flex-1">
              <label className="text-[10px] text-forge-muted tracking-wider block mb-1">GOAL</label>
              <input
                type="number"
                inputMode="numeric"
                value={goal || ''}
                onChange={(e) => setGoal(parseInt(e.target.value) || 0)}
                placeholder="0"
                className="w-full bg-forge-bg border border-forge-border rounded-lg px-3 py-2 text-forge-text text-sm focus:border-forge-red/50 focus:outline-none"
              />
            </div>
            <div className="flex-1">
              <label className="text-[10px] text-forge-muted tracking-wider block mb-1">UNIT</label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="reps, min..."
                className="w-full bg-forge-bg border border-forge-border rounded-lg px-3 py-2 text-forge-text text-sm focus:border-forge-red/50 focus:outline-none"
              />
            </div>
          </div>

          {currentLevel > 0 && goal > 0 && (
            <div className="bg-forge-bg border border-forge-border rounded-lg p-3">
              <div className="flex justify-between text-[10px] text-forge-muted mb-1">
                <span>PROGRESS</span>
                <span>{Math.round((currentLevel / goal) * 100)}%</span>
              </div>
              <div className="w-full h-1.5 bg-forge-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-forge-red rounded-full"
                  style={{ width: `${Math.min(100, (currentLevel / goal) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </>
      )}

      <div className="flex gap-3 pt-2">
        <button onClick={onCancel} className="flex-1 py-3 border border-forge-border text-forge-muted font-bold tracking-wider rounded-lg text-sm">
          CANCEL
        </button>
        <button
          onClick={() => {
            if (!name.trim()) return;
            onSave({
              id: initial?.id || uuid(),
              name: name.trim(),
              icon,
              type,
              category,
              currentLevel,
              goal,
              unit: type === 'boolean' ? '' : unit,
            });
          }}
          disabled={!name.trim()}
          className="flex-1 py-3 bg-forge-red text-white font-bold tracking-wider rounded-lg text-sm disabled:opacity-30"
        >
          {initial?.name ? 'UPDATE' : 'ADD'}
        </button>
      </div>
    </div>
  );
}

export default function SkillBuilder({ profile, onUpdate, onClose }: Props) {
  const [mode, setMode] = useState<'list' | 'add' | 'edit'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);

  const skills = profile.onboarding.skills.filter(s => !s.archived);
  const editingSkill = editingId ? skills.find(s => s.id === editingId) : undefined;

  const handleAdd = (data: Omit<SkillLevel, 'sortOrder'>) => {
    onUpdate(addSkill(profile, data));
    setMode('list');
  };

  const handleEdit = (data: Omit<SkillLevel, 'sortOrder'>) => {
    if (!editingId) return;
    onUpdate(updateSkill(profile, editingId, data));
    setMode('list');
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    onUpdate(removeSkill(profile, id));
  };

  if (mode === 'add') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">New Skill</h2>
          <button onClick={() => setMode('list')} className="text-forge-muted text-2xl">×</button>
        </div>
        <SkillForm onSave={handleAdd} onCancel={() => setMode('list')} />
      </div>
    );
  }

  if (mode === 'edit' && editingSkill) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Edit Skill</h2>
          <button onClick={() => { setMode('list'); setEditingId(null); }} className="text-forge-muted text-2xl">×</button>
        </div>
        <SkillForm initial={editingSkill} onSave={handleEdit} onCancel={() => { setMode('list'); setEditingId(null); }} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Skills</h2>
          <p className="text-forge-muted text-xs">{skills.length} active skills</p>
        </div>
        <button onClick={onClose} className="text-forge-muted text-2xl">×</button>
      </div>

      <div className="bg-forge-surface border border-forge-border rounded-lg p-3">
        {skills.length === 0 ? (
          <p className="text-center text-forge-muted text-sm py-4">No skills yet</p>
        ) : (
          <div className="divide-y divide-forge-border/30">
            {skills.map((s) => (
              <div key={s.id} className="flex items-center gap-3 py-2.5">
                <span className="text-lg w-7 text-center">{s.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-forge-text truncate">{s.name}</p>
                  <p className="text-[10px] text-forge-muted">
                    {s.category.toUpperCase()} · {s.type}
                    {s.goal > 0 && ` · ${s.currentLevel}/${s.goal} ${s.unit}`}
                  </p>
                </div>
                {s.goal > 0 && (
                  <div className="w-12 h-1 bg-forge-border rounded-full overflow-hidden shrink-0">
                    <div className="h-full bg-forge-red rounded-full" style={{ width: `${Math.min(100, (s.currentLevel / s.goal) * 100)}%` }} />
                  </div>
                )}
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => { setEditingId(s.id); setMode('edit'); }} className="w-8 h-8 flex items-center justify-center text-forge-muted text-sm">✎</button>
                  <button onClick={() => handleDelete(s.id)} className="w-8 h-8 flex items-center justify-center text-forge-red/60 text-sm">✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={() => setMode('add')}
        className="w-full py-3 border-2 border-dashed border-forge-border text-forge-muted font-bold tracking-wider rounded-lg text-sm hover:border-forge-red/50 hover:text-forge-red transition-all"
      >
        + ADD SKILL
      </button>
    </div>
  );
}
