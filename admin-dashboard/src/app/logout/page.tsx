'use client';

import { useEffect } from 'react';
import { signOut } from 'aws-amplify/auth';
import { Loader2 } from 'lucide-react';
import '@/app/amplify-config';
import { authService } from '@/services/auth';

/**
 * Logout page: clear all auth storage and redirect to Cognito Hosted UI logout
 * so the user is fully signed out (then Cognito redirects back to login).
 */
export default function LogoutPage() {
  useEffect(() => {
    const run = async () => {
      try {
        await signOut();
      } catch (_) {}
      if (typeof window !== 'undefined') {
        authService.clearAuthStorage();
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const domain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN || 'payintelli-442042527593';
        const region = process.env.NEXT_PUBLIC_COGNITO_REGION || 'ap-south-1';
        const clientId = process.env.NEXT_PUBLIC_COGNITO_APP_CLIENT_ID || '';
        const loginUrl = `${appUrl}/login`;
        const logoutUri = encodeURIComponent(loginUrl);
        const redirectUri = encodeURIComponent(loginUrl);
        window.location.href = `https://${domain}.auth.${region}.amazoncognito.com/logout?client_id=${clientId}&logout_uri=${logoutUri}&redirect_uri=${redirectUri}`;
      }
    };
    run();
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
