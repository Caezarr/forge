'use client';

interface HeatmapProps {
  data: { date: string; score: number }[];
  weeks?: number;
  label?: string;
}

export default function Heatmap({ data, weeks = 8, label }: HeatmapProps) {
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
          <button className="text-xs text-forge-green">More</button>
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
              <div
                key={ri}
                className={`w-3 h-3 rounded-[2px] ${scoreColor(cell.score)}`}
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
    </div>
  );
}

export function HeatmapGreen({ data, weeks = 52, label }: HeatmapProps) {
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
              <div
                key={ri}
                className={`w-[7px] h-3 rounded-[1px] ${scoreColor(cell.score)}`}
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
    </div>
  );
}
