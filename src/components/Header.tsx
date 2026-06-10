'use client';

export default function Header() {
  return (
    <header className="pt-2 pb-1 px-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-[0.25em] text-forge-text">FORGE</h1>
          <p className="text-[10px] tracking-[0.35em] text-forge-red font-bold">MONK MODE</p>
        </div>
        <button className="text-forge-muted text-2xl">☰</button>
      </div>
    </header>
  );
}
