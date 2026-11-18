'use client';

import { UserProfile } from '../domain/types';
import { migrateProfile } from '../domain/profile';
import { markLocalStateUpdated, scheduleStatePush } from './state-sync';

const STORAGE_KEY = 'forge_profile';

export function loadProfile(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return migrateProfile(parsed);
  } catch {
    return null;
  }
}

export function saveProfile(profile: UserProfile) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  markLocalStateUpdated();
}

export function saveAndSync(profile: UserProfile) {
  saveProfile(profile);
  scheduleStatePush(profile);
}
