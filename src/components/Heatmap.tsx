'use client';

import { useState } from 'react';
import { DayLog } from '@/lib/types';

interface HeatmapProps {
  data: { date: string; score: number }[];
  weeks?: number;
  label?: string;
  logs?: Record<string, DayLog>;
}

function DayDetail({ date, log, onClose }: { date: string; log?: DayLog; onClose: () => void }) {
  const d = new Date(date);
  const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
  const monthDay = `${d.getDate()} ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()]}`;

  if (!log) {
    return (
      <div className="mt-3 bg-forge-bg border border-forge-border rounded-lg p-3">
        <div className="flex justify-between items-center">
          <p className="text-xs text-forge-muted">{dayName} {monthDay} — No data</p>
          <button onClick={onClose} className="text-forge-muted text-sm">×</button>
        </div>
      </div>
    );
  }

  const mainQuests = log.quests.filter(q => q.type === 'main');
  const sideQuests = log.quests.filter(q => q.type === 'side');
  const cleanQuests = log.quests.filter(q => q.type === 'clean');

  return (
    <div className="mt-3 bg-forge-bg border border-forge-border rounded-lg p-3 space-y-2">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm font-bold">{dayName} {monthDay}</p>
          <p className="text-[10px] text-forge-muted">
            Score: <span className={log.monkScore >= 70 ? 'text-forge-green' : log.monkScore >= 40 ? 'text-yellow-500' : 'text-forge-red'}>{log.monkScore}%</span>
            {' · '}{log.xpEarned} XP
          </p>
        </div>
        <button onClick={onClose} className="text-forge-muted text-sm">×</button>
      </div>

      {mainQuests.length > 0 && (
        <div>
          <p className="text-[9px] tracking-widest text-forge-muted uppercase mb-1">Main</p>
          {mainQuests.map(q => (
            <div key={q.id} className="flex items-center gap-2 py-0.5">
              <span className={`text-[10px] ${q.done ? 'text-forge-green' : 'text-forge-red'}`}>{q.done ? '✓' : '✗'}</span>
              <span className="text-[11px] text-forge-text">{q.label}</span>
            </div>
          ))}
        </div>
      )}

      {sideQuests.length > 0 && (
        <div>
          <p className="text-[9px] tracking-widest text-forge-muted uppercase mb-1">Side</p>
          <div className="flex gap-1 flex-wrap">
            {sideQuests.map(q => (
              <span key={q.id} className={`text-[10px] px-1.5 py-0.5 rounded ${q.done ? 'text-forge-green bg-forge-green/10' : 'text-forge-muted bg-forge-surface'}`}>
                {q.done ? '✓' : '✗'} {q.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {cleanQuests.length > 0 && (
        <div>
          <p className="text-[9px] tracking-widest text-forge-muted uppercase mb-1">Clean {log.bodyIntegrity}% body · {log.focusIntegrity}% focus · {log.recoveryScore}% recovery</p>
          <div className="flex gap-1 flex-wrap">
            {cleanQuests.map(q => (
              <span key={q.id} className={`text-[10px] px-1.5 py-0.5 rounded ${q.done ? 'text-forge-green bg-forge-green/10' : 'text-forge-red/60 bg-forge-red/5'}`}>
                {q.done ? '✓' : '✗'} {q.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Heatmap({ data, weeks = 8, label, logs }: HeatmapProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const totalDays = weeks * 7;
  const sliced = data.slice(-totalDays);

  const columns: { date: string; score: number }[][] = [];
  for (let i = 0; i < sliced.length; i += 7) {
    columns.push(sliced.slice(i, i + 7));
  }

  function scoreColor(score: number): string {
    if (score === 0) return 'bg-forge-surface';
    if (score < 30) return 'bg-red-950';
    if (score < 50) return 'bg-red-900';
    if (score < 70) return 'bg-red-700';
    if (score < 85) return 'bg-red-600';
    return 'bg-red-500';
  }

  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <div className="bg-forge-surface border border-forge-border rounded-lg p-4">
      {label && (
        <div className="flex justify-between items-center mb-3">
          <p className="text-[10px] tracking-widest text-forge-muted uppercase">{label}</p>
          {logs && <p className="text-[10px] text-forge-muted">Tap a day for details</p>}
        </div>
      )}
      <div className="flex gap-[2px]">
        <div className="flex flex-col gap-[2px] mr-1">
          {dayLabels.map((d, i) => (
            <div key={i} className="w-3 h-3 text-[8px] text-forge-muted flex items-center justify-center">
              {d}
            </div>
          ))}
        </div>
        {columns.map((col, ci) => (
          <div key={ci} className="flex flex-col gap-[2px]">
            {col.map((cell, ri) => (
              <button
                key={ri}
                onClick={() => logs && setSelectedDate(selectedDate === cell.date ? null : cell.date)}
                className={`w-3 h-3 rounded-[2px] transition-all ${scoreColor(cell.score)} ${
                  selectedDate === cell.date ? 'ring-1 ring-forge-text' : ''
                } ${logs ? 'cursor-pointer' : 'cursor-default'}`}
                title={`${cell.date}: ${cell.score}%`}
              />
            ))}
            {col.length < 7 &&
              Array.from({ length: 7 - col.length }).map((_, i) => (
                <div key={`e${i}`} className="w-3 h-3 rounded-[2px] bg-forge-surface" />
              ))}
          </div>
        ))}
      </div>

      {selectedDate && logs && (
        <DayDetail date={selectedDate} log={logs[selectedDate]} onClose={() => setSelectedDate(null)} />
      )}
    </div>
  );
}

export function HeatmapGreen({ data, weeks = 52, label, logs }: HeatmapProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const totalDays = weeks * 7;
  const sliced = data.slice(-totalDays);

  const columns: { date: string; score: number }[][] = [];
  for (let i = 0; i < sliced.length; i += 7) {
    columns.push(sliced.slice(i, i + 7));
  }

  function scoreColor(score: number): string {
    if (score === 0) return 'bg-forge-surface';
    if (score < 30) return 'bg-green-950';
    if (score < 50) return 'bg-green-900';
    if (score < 70) return 'bg-green-800';
    if (score < 85) return 'bg-green-600';
    return 'bg-green-500';
  }

  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  return (
    <div className="bg-forge-surface border border-forge-border rounded-lg p-4">
      {label && (
        <div className="flex justify-between items-center mb-3">
          <p className="text-[10px] tracking-widest text-forge-muted uppercase">{label}</p>
          <p className="text-xs text-forge-green">{new Date().getFullYear()}</p>
        </div>
      )}
      <div className="flex gap-[2px] overflow-x-auto">
        <div className="flex flex-col gap-[2px] mr-1 shrink-0">
          {dayLabels.map((d, i) => (
            <div key={i} className="w-3 h-3 text-[8px] text-forge-muted flex items-center justify-center">
              {d}
            </div>
          ))}
        </div>
        {columns.map((col, ci) => (
          <div key={ci} className="flex flex-col gap-[2px]">
            {col.map((cell, ri) => (
              <button
                key={ri}
                onClick={() => logs && setSelectedDate(selectedDate === cell.date ? null : cell.date)}
                className={`w-[7px] h-3 rounded-[1px] transition-all ${scoreColor(cell.score)} ${
                  selectedDate === cell.date ? 'ring-1 ring-forge-text' : ''
                } ${logs ? 'cursor-pointer' : 'cursor-default'}`}
                title={`${cell.date}: ${cell.score}%`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-2 px-4">
        {months.map((m) => (
          <span key={m} className="text-[7px] text-forge-muted">{m}</span>
        ))}
      </div>

      {selectedDate && logs && (
        <DayDetail date={selectedDate} log={logs[selectedDate]} onClose={() => setSelectedDate(null)} />
      )}
    </div>
  );
}
