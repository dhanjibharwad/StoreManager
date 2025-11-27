'use client';

import { useAuth } from '@/lib/authContext';
import { useEffect, useState } from 'react';

export function useAuthStatus() {
  const { isAuthenticated, loading, user } = useAuth();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!loading) {
      setIsReady(true);
    }
  }, [loading]);

  return {
    isAuthenticated,
    loading,
    user,
    isReady
  };
}