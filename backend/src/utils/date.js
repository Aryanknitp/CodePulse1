export function dayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setUTCHours(0,0,0,0);
  return d;
}

export function periodStart(period) {
  const now = new Date();
  const days = { '7d': 7, '30d': 30, '90d': 90, all: null, week: 7, month: 30, quarter: 90 };
  const n = days[period] ?? 30;
  if (n === null) return null;
  return new Date(now.getTime() - n * 86400000);
}
