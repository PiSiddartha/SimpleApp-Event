'use client';

import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import '@/app/amplify-config';
import { authService } from '@/services/auth';

/**
 * Logout page: only loaded when Cognito redirects here after sign-out.
 * (Actual redirect to Cognito is done by authService.logout().)
 * Clear any leftover auth storage and send user to login.
 */
export default function LogoutPage() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    authService.clearAuthStorage();
    window.location.replace('/login');
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full p-8 sm:p-10 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col items-center gap-4 text-center">
        <Loader2 size={32} className="animate-spin text-primary-500" />
        <p className="text-gray-600">Signing out…</p>
      </div>
    </div>
  );
}
