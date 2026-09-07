import { useState, useEffect } from 'react';
import { codeforcesApi } from '../services/codeforcesApi.js';

export function useCodeforcesProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    codeforcesApi.getProfile()
      .then(data => { if (!cancelled) { setProfile(data); setLoading(false); } })
      .catch(err => { if (!cancelled) { setError(err); setLoading(false); } });
    return () => { cancelled = true; };
  }, []);

  return { profile, loading, error };
}
