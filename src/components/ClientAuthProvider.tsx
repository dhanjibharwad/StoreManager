'use client';

import { AuthProvider } from '@/lib/authContext';
import { useEffect, useState } from 'react';
import LoadingSpinner from './LoadingSpinner';

export default function ClientAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <LoadingSpinner />;
  }

  return <AuthProvider>{children}</AuthProvider>;
}