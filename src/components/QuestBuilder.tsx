'use client';

import { useState } from 'react';
import { QuestTemplate, SkillType, UserProfile } from '@/lib/types';
import { addQuestTemplate, updateQuestTemplate, removeQuestTemplate } from '@/lib/store';

interface Props {
  profile: UserProfile;
  onUpdate: (profile: UserProfile) => void;
  onClose: () => void;
}

const QUEST_ICONS = ['🏃', '💪', '🧠', '📖', '🧘', '🎯', '💧', '🚫', '📵', '🌙', '⚡', '🔥', '👣', '🏋️', '🤸', '💻', '🎨', '🎵', '📝', '🧊'];

function QuestForm({ initial, onSave, onCancel }: {
  initial?: Partial<QuestTemplate>;
  onSave: (data: Omit<QuestTemplate, 'id' | 'sortOrder'>) => void;
  onCancel: () => void;
}) {
  const [label, setLabel] = useState(initial?.label || '');
  const [type, setType] = useState<'main' | 'side' | 'clean'>(initial?.type || 'main');
  const [category, setCategory] = useState<QuestTemplate['category']>(initial?.category);
  const [xp, setXp] = useState(initial?.xp ?? (type === 'clean' ? 0 : 80));
  const [targetType, setTargetType] = useState<SkillType>(initial?.targetType || 'boolean');
  const [defaultTarget, setDefaultTarget] = useState<number | undefined>(initial?.defaultTarget);
  const [unit, setUnit] = useState(initial?.unit || '');
  const [icon, setIcon] = useState(initial?.icon || '🎯');
  const [showIcons, setShowIcons] = useState(false);

  const handleTypeChange = (t: 'main' | 'side' | 'clean') => {
    setType(t);
    if (t === 'clean') setXp(0);
    else if (xp === 0) setXp(80);
  };

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
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Quest name..."
          className="flex-1 bg-forge-bg border border-forge-border rounded-lg px-3 py-2.5 text-forge-text text-sm placeholder:text-forge-muted/40 focus:border-forge-red/50 focus:outline-none"
          autoFocus
        />
      </div>

      {showIcons && (
        <div className="grid grid-cols-10 gap-1 bg-forge-bg border border-forge-border rounded-lg p-2">
          {QUEST_ICONS.map((ic) => (
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
        <p className="text-[10px] tracking-widest text-forge-muted uppercase mb-2">Quest Type</p>
        <div className="grid grid-cols-3 gap-2">
          {(['main', 'side', 'clean'] as const).map((t) => (
            <button
              key={t}
              onClick={() => handleTypeChange(t)}
              className={`py-2 rounded-lg text-xs font-bold tracking-wider border transition-all ${
                type === t
                  ? 'border-forge-red text-forge-red bg-forge-red/5'
                  : 'border-forge-border text-forge-muted'
              }`}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {type === 'clean' && (
        <div>
          <p className="text-[10px] tracking-widest text-forge-muted uppercase mb-2">Category</p>
          <div className="grid grid-cols-3 gap-2">
            {(['body', 'mind', 'recovery'] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`py-2 rounded-lg text-xs tracking-wider border transition-all ${
                  category === c
                    ? 'border-forge-green text-forge-green bg-forge-green/5'
                    : 'border-forge-border text-forge-muted'
                }`}
              >
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-[10px] tracking-widest text-forge-muted uppercase mb-2">Tracking</p>
        <div className="grid grid-cols-4 gap-2">
          {([
            { id: 'boolean', label: 'Yes/No' },
            { id: 'reps', label: 'Reps' },
            { id: 'duration', label: 'Time' },
            { id: 'numeric', label: 'Number' },
          ] as const).map((tt) => (
            <button
              key={tt.id}
              onClick={() => setTargetType(tt.id)}
              className={`py-2 rounded-lg text-[11px] tracking-wider border transition-all ${
                targetType === tt.id
                  ? 'border-forge-red text-forge-red bg-forge-red/5'
                  : 'border-forge-border text-forge-muted'
              }`}
            >
              {tt.label}
            </button>
          ))}
        </div>
      </div>

      {targetType !== 'boolean' && (
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="text-[10px] text-forge-muted tracking-wider block mb-1">TARGET</label>
            <input
              type="number"
              inputMode="numeric"
              value={defaultTarget ?? ''}
              onChange={(e) => setDefaultTarget(e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="e.g. 50"
              className="w-full bg-forge-bg border border-forge-border rounded-lg px-3 py-2 text-forge-text text-sm placeholder:text-forge-muted/40 focus:border-forge-red/50 focus:outline-none"
            />
          </div>
          <div className="flex-1">
            <label className="text-[10px] text-forge-muted tracking-wider block mb-1">UNIT</label>
            <input
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="reps, min, km..."
              className="w-full bg-forge-bg border border-forge-border rounded-lg px-3 py-2 text-forge-text text-sm placeholder:text-forge-muted/40 focus:border-forge-red/50 focus:outline-none"
            />
          </div>
        </div>
      )}

      {type !== 'clean' && (
        <div>
          <label className="text-[10px] text-forge-muted tracking-wider block mb-1">XP REWARD</label>
          <input
            type="number"
            inputMode="numeric"
            value={xp}
            onChange={(e) => setXp(parseInt(e.target.value) || 0)}
            className="w-full bg-forge-bg border border-forge-border rounded-lg px-3 py-2 text-forge-text text-sm focus:border-forge-red/50 focus:outline-none"
          />
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          onClick={onCancel}
          className="flex-1 py-3 border border-forge-border text-forge-muted font-bold tracking-wider rounded-lg text-sm"
        >
          CANCEL
        </button>
        <button
          onClick={() => {
            if (!label.trim()) return;
            onSave({
              label: label.trim(),
              type,
              category: type === 'clean' ? category : undefined,
              xp: type === 'clean' ? 0 : xp,
              targetType,
              defaultTarget: targetType === 'boolean' ? undefined : defaultTarget,
              unit: targetType === 'boolean' ? undefined : unit || undefined,
              icon,
              active: true,
            });
          }}
          disabled={!label.trim()}
          className="flex-1 py-3 bg-forge-red text-white font-bold tracking-wider rounded-lg text-sm disabled:opacity-30"
        >
          {initial?.label ? 'UPDATE' : 'ADD'}
        </button>
      </div>
    </div>
  );
}

function TemplateRow({ template, onEdit, onToggle, onDelete }: {
  template: QuestTemplate;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <div className={`flex items-center gap-3 py-2.5 ${!template.active ? 'opacity-40' : ''}`}>
      <span className="text-lg w-7 text-center">{template.icon || '🎯'}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-forge-text truncate">{template.label}</p>
        <p className="text-[10px] text-forge-muted">
          {template.type.toUpperCase()}
          {template.xp > 0 && ` · ${template.xp} XP`}
          {template.defaultTarget && ` · ${template.defaultTarget} ${template.unit || ''}`}
        </p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button onClick={onEdit} className="w-8 h-8 flex items-center justify-center text-forge-muted text-sm">
          ✎
        </button>
        <button onClick={onToggle} className="w-8 h-8 flex items-center justify-center text-forge-muted text-sm">
          {template.active ? '◉' : '○'}
        </button>
        <button onClick={onDelete} className="w-8 h-8 flex items-center justify-center text-forge-red/60 text-sm">
          ✕
        </button>
      </div>
    </div>
  );
}

export default function QuestBuilder({ profile, onUpdate, onClose }: Props) {
  const [mode, setMode] = useState<'list' | 'add' | 'edit'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'main' | 'side' | 'clean'>('all');

  const templates = profile.questTemplates
    .filter(t => filter === 'all' || t.type === filter)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const editingTemplate = editingId ? profile.questTemplates.find(t => t.id === editingId) : undefined;

  const handleAdd = (data: Omit<QuestTemplate, 'id' | 'sortOrder'>) => {
    onUpdate(addQuestTemplate(profile, data));
    setMode('list');
  };

  const handleEdit = (data: Omit<QuestTemplate, 'id' | 'sortOrder'>) => {
    if (!editingId) return;
    onUpdate(updateQuestTemplate(profile, editingId, data));
    setMode('list');
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    onUpdate(removeQuestTemplate(profile, id));
  };

  const handleToggle = (id: string) => {
    const tmpl = profile.questTemplates.find(t => t.id === id);
    if (tmpl) onUpdate(updateQuestTemplate(profile, id, { active: !tmpl.active }));
  };

  const mainCount = profile.questTemplates.filter(t => t.type === 'main' && t.active).length;
  const sideCount = profile.questTemplates.filter(t => t.type === 'side' && t.active).length;
  const cleanCount = profile.questTemplates.filter(t => t.type === 'clean' && t.active).length;

  if (mode === 'add') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">New Quest</h2>
          <button onClick={() => setMode('list')} className="text-forge-muted text-2xl">×</button>
        </div>
        <QuestForm onSave={handleAdd} onCancel={() => setMode('list')} />
      </div>
    );
  }

  if (mode === 'edit' && editingTemplate) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Edit Quest</h2>
          <button onClick={() => { setMode('list'); setEditingId(null); }} className="text-forge-muted text-2xl">×</button>
        </div>
        <QuestForm initial={editingTemplate} onSave={handleEdit} onCancel={() => { setMode('list'); setEditingId(null); }} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Quest Protocol</h2>
          <p className="text-forge-muted text-xs">{mainCount} main · {sideCount} side · {cleanCount} clean</p>
        </div>
        <button onClick={onClose} className="text-forge-muted text-2xl">×</button>
      </div>

      <div className="grid grid-cols-4 gap-1">
        {(['all', 'main', 'side', 'clean'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`py-1.5 rounded-lg text-[10px] font-bold tracking-wider border transition-all ${
              filter === f
                ? 'border-forge-red text-forge-red bg-forge-red/5'
                : 'border-forge-border text-forge-muted'
            }`}
          >
            {f.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="bg-forge-surface border border-forge-border rounded-lg p-3">
        {templates.length === 0 ? (
          <p className="text-center text-forge-muted text-sm py-4">No quests in this category</p>
        ) : (
          <div className="divide-y divide-forge-border/30">
            {templates.map((t) => (
              <TemplateRow
                key={t.id}
                template={t}
                onEdit={() => { setEditingId(t.id); setMode('edit'); }}
                onToggle={() => handleToggle(t.id)}
                onDelete={() => handleDelete(t.id)}
              />
            ))}
          </div>
        )}
      </div>

      <button
        onClick={() => setMode('add')}
        className="w-full py-3 border-2 border-dashed border-forge-border text-forge-muted font-bold tracking-wider rounded-lg text-sm hover:border-forge-red/50 hover:text-forge-red transition-all"
      >
        + ADD QUEST
      </button>
    </div>
  );
}
