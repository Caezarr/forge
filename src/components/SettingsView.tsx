'use client';

import { useState } from 'react';
import { UserProfile } from '@/lib/types';
import {
  NotificationSettings,
  getNotificationSettings,
  saveNotificationSettings,
  requestNotificationPermission,
  registerServiceWorker,
} from '@/lib/notifications';
import {
  getStateSyncStatus,
  getStateSyncToken,
  getStateSyncUpdatedAt,
  pushStateProfile,
  setStateSyncToken,
} from '@/lib/state-sync';

interface Props {
  profile: UserProfile;
  onClose: () => void;
  onResetProfile: () => void;
}

export default function SettingsView({ profile, onClose, onResetProfile }: Props) {
  const [settings, setSettings] = useState<NotificationSettings>(getNotificationSettings());
  const [syncToken, setSyncToken] = useState(getStateSyncToken());
  const [syncStatus, setSyncStatus] = useState(getStateSyncStatus());
  const [lastSync, setLastSync] = useState(getStateSyncUpdatedAt());
  const [syncMessage, setSyncMessage] = useState('');
  const [permissionState, setPermissionState] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) return Notification.permission;
    return 'default';
  });
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleToggleEnabled = async () => {
    if (!settings.enabled) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        setPermissionState(Notification.permission);
        return;
      }
      await registerServiceWorker();
      setPermissionState('granted');
    }
    const updated = { ...settings, enabled: !settings.enabled };
    setSettings(updated);
    saveNotificationSettings(updated);
  };

  const updateSetting = (key: keyof NotificationSettings, value: unknown) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    saveNotificationSettings(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Settings</h2>
        <button onClick={onClose} className="text-forge-muted text-2xl">×</button>
      </div>

      {/* Notifications */}
      <div className="bg-forge-surface border border-forge-border rounded-lg p-4">
        <p className="text-[10px] tracking-widest text-forge-muted uppercase mb-3">Notifications</p>

        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm text-forge-text">Enable Notifications</p>
            <p className="text-[10px] text-forge-muted">
              {permissionState === 'denied' ? 'Blocked in browser settings' : 'Daily reminders and alerts'}
            </p>
          </div>
          <button
            onClick={handleToggleEnabled}
            disabled={permissionState === 'denied'}
            className={`w-12 h-6 rounded-full p-0.5 transition-all ${
              settings.enabled ? 'bg-forge-red' : 'bg-forge-border'
            } ${permissionState === 'denied' ? 'opacity-30' : ''}`}
          >
            <div className={`w-5 h-5 rounded-full bg-white transition-transform ${settings.enabled ? 'translate-x-6' : ''}`} />
          </button>
        </div>

        {settings.enabled && (
          <div className="space-y-3 mt-3 border-t border-forge-border pt-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-forge-text">Morning Reminder</p>
                <p className="text-[10px] text-forge-muted">Start your day</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={settings.morningTime}
                  onChange={(e) => updateSetting('morningTime', e.target.value)}
                  className="bg-forge-bg border border-forge-border rounded px-2 py-1 text-xs text-forge-text"
                />
                <button
                  onClick={() => updateSetting('morningReminder', !settings.morningReminder)}
                  className={`w-10 h-5 rounded-full p-0.5 transition-all ${settings.morningReminder ? 'bg-forge-green' : 'bg-forge-border'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${settings.morningReminder ? 'translate-x-5' : ''}`} />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-forge-text">Evening Clean Check</p>
                <p className="text-[10px] text-forge-muted">Mark clean quests</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={settings.eveningTime}
                  onChange={(e) => updateSetting('eveningTime', e.target.value)}
                  className="bg-forge-bg border border-forge-border rounded px-2 py-1 text-xs text-forge-text"
                />
                <button
                  onClick={() => updateSetting('eveningReminder', !settings.eveningReminder)}
                  className={`w-10 h-5 rounded-full p-0.5 transition-all ${settings.eveningReminder ? 'bg-forge-green' : 'bg-forge-border'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${settings.eveningReminder ? 'translate-x-5' : ''}`} />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-forge-text">Inactivity Alert</p>
                <p className="text-[10px] text-forge-muted">If no quests done</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={settings.inactivityTime}
                  onChange={(e) => updateSetting('inactivityTime', e.target.value)}
                  className="bg-forge-bg border border-forge-border rounded px-2 py-1 text-xs text-forge-text"
                />
                <button
                  onClick={() => updateSetting('inactivityReminder', !settings.inactivityReminder)}
                  className={`w-10 h-5 rounded-full p-0.5 transition-all ${settings.inactivityReminder ? 'bg-forge-green' : 'bg-forge-border'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${settings.inactivityReminder ? 'translate-x-5' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Cloud Backup */}
      <div className="bg-forge-surface border border-forge-border rounded-lg p-4">
        <p className="text-[10px] tracking-widest text-forge-muted uppercase mb-3">Cloud Backup</p>
        <p className="text-xs leading-relaxed text-forge-muted mb-3">
          Optional SQLite backup for this one-user Life OS. Local storage stays the offline source of truth.
        </p>

        <label className="block">
          <span className="text-[10px] tracking-widest text-forge-muted uppercase">Sync token</span>
          <input
            type="password"
            value={syncToken}
            onChange={(event) => setSyncToken(event.target.value)}
            placeholder="Paste FORGE_SYNC_TOKEN"
            className="mt-2 w-full rounded-lg border border-forge-border bg-forge-bg px-3 py-2 text-sm text-forge-text outline-none"
          />
        </label>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              setStateSyncToken(syncToken);
              setSyncStatus(getStateSyncStatus());
              setSyncMessage(syncToken.trim() ? 'Token saved on this device.' : 'Token removed.');
            }}
            className="py-2.5 border border-forge-border text-forge-text font-bold tracking-wider rounded-lg text-xs"
          >
            SAVE TOKEN
          </button>
          <button
            onClick={async () => {
              setSyncMessage('Pushing...');
              const updatedAt = await pushStateProfile(profile);
              if (updatedAt) {
                setLastSync(updatedAt);
                setSyncMessage('Backup saved.');
              } else {
                setSyncMessage('Backup failed or disabled.');
              }
            }}
            disabled={syncStatus === 'disabled'}
            className="py-2.5 bg-forge-green text-forge-bg font-black tracking-wider rounded-lg text-xs disabled:opacity-40"
          >
            PUSH NOW
          </button>
        </div>

        <div className="mt-3 rounded-lg border border-forge-border/70 bg-forge-bg/35 p-3">
          <p className="text-[10px] uppercase tracking-widest text-forge-muted">Status</p>
          <p className="mt-1 text-xs text-forge-text">
            {syncStatus === 'ready' ? 'Ready on this device' : 'Disabled until a token is set'}
          </p>
          <p className="mt-1 text-[10px] text-forge-muted">
            Last backup: {lastSync ? new Date(lastSync).toLocaleString() : 'never'}
          </p>
          {syncMessage && <p className="mt-2 text-[10px] text-forge-green">{syncMessage}</p>}
        </div>
      </div>

      {/* Data */}
      <div className="bg-forge-surface border border-forge-border rounded-lg p-4">
        <p className="text-[10px] tracking-widest text-forge-muted uppercase mb-3">Data</p>

        <button
          onClick={() => {
            const data = localStorage.getItem('forge_profile');
            if (data) {
              const blob = new Blob([data], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `forge-backup-${new Date().toISOString().slice(0, 10)}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }
          }}
          className="w-full py-2.5 border border-forge-border text-forge-text font-bold tracking-wider rounded-lg text-sm mb-2"
        >
          EXPORT DATA (JSON)
        </button>

        <label className="w-full py-2.5 border border-forge-border text-forge-text font-bold tracking-wider rounded-lg text-sm flex items-center justify-center cursor-pointer">
          IMPORT DATA
          <input
            type="file"
            accept=".json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => {
                try {
                  JSON.parse(reader.result as string);
                  localStorage.setItem('forge_profile', reader.result as string);
                  window.location.reload();
                } catch {
                  alert('Invalid backup file');
                }
              };
              reader.readAsText(file);
            }}
          />
        </label>
      </div>

      {/* Danger Zone */}
      <div className="bg-forge-surface border border-forge-red/20 rounded-lg p-4">
        <p className="text-[10px] tracking-widest text-forge-red uppercase mb-3">Danger Zone</p>
        {!showResetConfirm ? (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="w-full py-2.5 border border-forge-red/50 text-forge-red font-bold tracking-wider rounded-lg text-sm"
          >
            RESET ALL DATA
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-forge-text">This will delete all your data permanently. Are you sure?</p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2 border border-forge-border text-forge-muted font-bold tracking-wider rounded-lg text-sm"
              >
                CANCEL
              </button>
              <button
                onClick={onResetProfile}
                className="flex-1 py-2 bg-forge-red text-white font-bold tracking-wider rounded-lg text-sm"
              >
                CONFIRM
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
