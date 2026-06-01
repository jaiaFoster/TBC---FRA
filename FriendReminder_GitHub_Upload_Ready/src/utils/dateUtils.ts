export function startOfLocalDay(date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function isoNow(): string {
  return new Date().toISOString();
}

export function isoToday(): string {
  return startOfLocalDay().toISOString();
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function daysBetween(fromIso: string, to = new Date()): number {
  const from = startOfLocalDay(new Date(fromIso)).getTime();
  const until = startOfLocalDay(to).getTime();
  return Math.floor((until - from) / 86400000);
}

export function formatShortDate(iso: string | null): string {
  if (!iso) return "Never";
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(new Date(iso));
}

export function relativeContactText(iso: string | null): string {
  if (!iso) return "Never contacted";
  const days = daysBetween(iso);
  if (days <= 0) return "Contacted today";
  if (days === 1) return "Contacted yesterday";
  return `Contacted ${days} days ago`;
}

export function reminderDateFromLastContact(lastContactedAt: string | null, cadenceDays: number): Date | null {
  if (!lastContactedAt) return null;
  const due = addDays(startOfLocalDay(new Date(lastContactedAt)), cadenceDays);
  due.setHours(9, 0, 0, 0);
  return due;
}
