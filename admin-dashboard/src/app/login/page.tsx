'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { signInWithRedirect } from 'aws-amplify/auth';
import { Loader2, LogIn } from 'lucide-react';
import '@/app/amplify-config';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const redirected = useRef(false);

  useEffect(() => {
    if (searchParams.get('error') === 'access_denied') {
      setError('Access denied. Your account must be in the Admins group to use the dashboard.');
      setLoading(false);
      return;
    }
    if (redirected.current) return;
    redirected.current = true;
    signInWithRedirect()
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : 'Could not redirect to sign in');
        setLoading(false);
      });
  }, [searchParams]);

  const handleSignInWithCognito = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithRedirect();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Could not redirect to sign in');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full p-8 sm:p-10 bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-primary-600">PayIntelli</h1>
          <p className="text-gray-500 mt-1">Admin Dashboard</p>
        </div>

        {error && (
          <div className="mb-5 p-4 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
            {error}
          </div>
        )}

        {!error && (
          <p className="text-sm text-gray-600 mb-6 text-center">
            Sign in with Cognito for login, sign up, forgot password, and change password.
          </p>
        )}

        {(error || !loading) && (
          <button
            type="button"
            onClick={handleSignInWithCognito}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            {loading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <LogIn size={20} />
            )}
            {loading ? 'Redirecting…' : 'Sign in with Cognito'}
          </button>
        )}

        {!error && loading && (
          <div className="flex flex-col items-center gap-4 py-6">
            <Loader2 size={32} className="animate-spin text-primary-500" />
            <p className="text-sm text-gray-500">Redirecting to sign in…</p>
          </div>
        )}
      </div>
    </div>
  );
}
