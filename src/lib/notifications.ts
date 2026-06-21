'use client';

const NOTIF_SETTINGS_KEY = 'forge_notification_settings';

export interface NotificationSettings {
  enabled: boolean;
  morningReminder: boolean;
  morningTime: string;
  eveningReminder: boolean;
  eveningTime: string;
  inactivityReminder: boolean;
  inactivityTime: string;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: false,
  morningReminder: true,
  morningTime: '07:00',
  eveningReminder: true,
  eveningTime: '21:00',
  inactivityReminder: true,
  inactivityTime: '14:00',
};

export function getNotificationSettings(): NotificationSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  const raw = localStorage.getItem(NOTIF_SETTINGS_KEY);
  if (!raw) return DEFAULT_SETTINGS;
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveNotificationSettings(settings: NotificationSettings) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(NOTIF_SETTINGS_KEY, JSON.stringify(settings));
  if (settings.enabled) {
    scheduleLocalNotifications(settings);
  } else {
    clearScheduledNotifications();
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.register('/sw.js');
    return reg;
  } catch {
    return null;
  }
}

let scheduledTimers: ReturnType<typeof setTimeout>[] = [];

function clearScheduledNotifications() {
  for (const timer of scheduledTimers) clearTimeout(timer);
  scheduledTimers = [];
}

function scheduleLocalNotifications(settings: NotificationSettings) {
  clearScheduledNotifications();
  if (!settings.enabled || Notification.permission !== 'granted') return;

  const now = new Date();
  const today = now.toISOString().slice(0, 10);

  function scheduleAt(timeStr: string, title: string, body: string) {
    const target = new Date(today + 'T' + timeStr + ':00');
    if (target <= now) return;
    const delay = target.getTime() - now.getTime();
    if (delay > 24 * 60 * 60 * 1000) return;

    const timer = setTimeout(() => {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then((reg) => {
          reg.showNotification(title, {
            body,
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            tag: 'forge-scheduled',
          });
        });
      } else {
        new Notification(title, { body, icon: '/icon-192.png' });
      }
    }, delay);
    scheduledTimers.push(timer);
  }

  if (settings.morningReminder) {
    scheduleAt(settings.morningTime, 'FORGE', 'Start the day. Your protocol is waiting.');
  }
  if (settings.eveningReminder) {
    scheduleAt(settings.eveningTime, 'FORGE · Clean Check', 'Time to mark your clean quests before bed.');
  }
  if (settings.inactivityReminder) {
    scheduleAt(settings.inactivityTime, 'FORGE', 'No quests completed today yet. Start now.');
  }
}

export function initNotifications() {
  const settings = getNotificationSettings();
  if (settings.enabled) {
    registerServiceWorker();
    scheduleLocalNotifications(settings);
  }
}
