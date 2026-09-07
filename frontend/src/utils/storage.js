const PREFIX = 'cf_insights_';

export const storage = {
  get(key) {
    try {
      const item = localStorage.getItem(PREFIX + key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch {}
  },
  remove(key) {
    try {
      localStorage.removeItem(PREFIX + key);
    } catch {}
  },
  clear() {
    try {
      Object.keys(localStorage)
        .filter(k => k.startsWith(PREFIX))
        .forEach(k => localStorage.removeItem(k));
    } catch {}
  },
};
