'use client';

const SYNC_KEY = 'forge_last_sync';
const DIRTY_KEY = 'forge_dirty';

export function markDirty() {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DIRTY_KEY, 'true');
}

export function isDirty(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(DIRTY_KEY) === 'true';
}

export function clearDirty() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(DIRTY_KEY);
}

export function getLastSync(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(SYNC_KEY);
}

export function setLastSync(time: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SYNC_KEY, time);
}

export async function pushToServer(profile: Record<string, unknown>): Promise<boolean> {
  try {
    const res = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
    if (!res.ok) return false;
    const data = await res.json();
    if (data.serverTime) setLastSync(data.serverTime);
    clearDirty();
    return true;
  } catch {
    return false;
  }
}

export async function pullFromServer(since?: string | null): Promise<Record<string, unknown> | null> {
  try {
    const url = since ? `/api/sync?since=${since}` : '/api/sync';
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

let syncTimeout: ReturnType<typeof setTimeout> | null = null;

export function scheduleSyncPush(profile: Record<string, unknown>, delayMs = 2000) {
  markDirty();
  if (syncTimeout) clearTimeout(syncTimeout);
  syncTimeout = setTimeout(() => {
    pushToServer(profile);
  }, delayMs);
}
