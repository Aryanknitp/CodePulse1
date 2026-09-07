import { useState } from 'react';
import { codeforcesApi } from '../services/codeforcesApi.js';
import { useApp } from '../context/AppContext.jsx';

export function useSync() {
  const [syncing, setSyncing] = useState(false);
  const { toast } = useApp();

  const syncNow = async () => {
    if (syncing) return;
    setSyncing(true);
    try {
      await codeforcesApi.syncAccount();
      toast.success('Sync started. This may take a few minutes.');
    } catch (err) {
      const msg = err?.message || 'Sync failed. Please try again.';
      toast.error(msg);
    } finally {
      setSyncing(false);
    }
  };

  return { syncing, syncNow };
}
