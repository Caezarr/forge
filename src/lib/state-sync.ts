'use client';

import { UserProfile } from './types';

const STATE_SYNC_TOKEN_KEY = 'forge_sync_token';
const STATE_SYNC_UPDATED_AT_KEY = 'forge_state_updated_at';
const LOCAL_STATE_UPDATED_AT_KEY = 'forge_local_updated_at';

export type StateSyncStatus = 'disabled' | 'ready';

function getConfiguredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STATE_SYNC_TOKEN_KEY) || process.env.NEXT_PUBLIC_FORGE_SYNC_TOKEN || null;
}

export function getStateSyncStatus(): StateSyncStatus {
  return getConfiguredToken() ? 'ready' : 'disabled';
}

export function getStateSyncToken(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(STATE_SYNC_TOKEN_KEY) || '';
}

export function setStateSyncToken(token: string) {
  if (typeof window === 'undefined') return;
  const trimmed = token.trim();
  if (trimmed) {
    localStorage.setItem(STATE_SYNC_TOKEN_KEY, trimmed);
  } else {
    localStorage.removeItem(STATE_SYNC_TOKEN_KEY);
  }
}

export function getStateSyncUpdatedAt(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STATE_SYNC_UPDATED_AT_KEY);
}

function setStateSyncUpdatedAt(updatedAt: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STATE_SYNC_UPDATED_AT_KEY, updatedAt);
}

export function getLocalStateUpdatedAt(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(LOCAL_STATE_UPDATED_AT_KEY);
}

export function markLocalStateUpdated(updatedAt = new Date().toISOString()) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_STATE_UPDATED_AT_KEY, updatedAt);
}

export async function pullStateProfile(): Promise<{ profile: UserProfile | null; updatedAt: string | null } | null> {
  const token = getConfiguredToken();
  if (!token) return null;

  try {
    const res = await fetch('/api/state', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.updatedAt) setStateSyncUpdatedAt(data.updatedAt);
    return {
      profile: data.profile || null,
      updatedAt: data.updatedAt || null,
    };
  } catch {
    return null;
  }
}

export async function pushStateProfile(profile: UserProfile): Promise<string | null> {
  const token = getConfiguredToken();
  if (!token) return null;

  try {
    const res = await fetch('/api/state', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ profile }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.updatedAt) setStateSyncUpdatedAt(data.updatedAt);
    return data.updatedAt || null;
  } catch {
    return null;
  }
}

let pushTimeout: ReturnType<typeof setTimeout> | null = null;

export function scheduleStatePush(profile: UserProfile, delayMs = 1200) {
  if (!getConfiguredToken()) return;
  if (pushTimeout) clearTimeout(pushTimeout);
  pushTimeout = setTimeout(() => {
    pushStateProfile(profile);
  }, delayMs);
}
