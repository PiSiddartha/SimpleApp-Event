'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { isAdminFromToken } from '@/utils/jwt';

/**
 * Client guard: only render children if the stored token has Admins group.
 * Redirects to /login if not admin or no token.
 */
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.replace('/login');
      return;
    }
    if (!isAdminFromToken(token)) {
      localStorage.removeItem('auth_token');
      router.replace('/login?error=access_denied');
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
