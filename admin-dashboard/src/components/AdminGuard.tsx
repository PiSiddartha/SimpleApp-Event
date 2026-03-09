'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { isIdToken } from '@/utils/jwt';

/**
 * Client guard: allow dashboard only when a valid ID token is present.
 * Role authorization is enforced by backend APIs.
 */
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('auth_id_token') || localStorage.getItem('auth_token');
    if (!token) {
      router.replace('/login');
      return;
    }
    if (!isIdToken(token)) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_id_token');
      router.replace('/login');
      return;
    }
    setAllowed(true);
  }, [router]);

  if (allowed === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <Loader2 size={32} className="animate-spin text-primary-500" />
          <p className="text-sm">Checking access…</p>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
