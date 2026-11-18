/** Calendar key (UTC, YYYY-MM-DD) used to index day logs. */
export function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}
