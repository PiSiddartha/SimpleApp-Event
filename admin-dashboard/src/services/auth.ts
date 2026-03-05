// Authentication service using AWS Amplify
import { signIn, signOut, getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';

class AuthService {
  async login(email: string, password: string) {
    try {
      const result = await signIn({
        username: email,
        password,
      });
      
      // Get tokens (use ID token for API so backend gets cognito:groups for admin role)
      const session = await fetchAuthSession();
      const idToken = session.tokens?.idToken?.toString();
      const token = idToken || session.tokens?.accessToken?.toString();
      
      if (token) {
        localStorage.setItem('auth_token', token);
      }
      
      return { success: true, user: result };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Login failed' 
      };
    }
  }

  /** Remove all auth-related keys from localStorage (ours + Amplify/Cognito). */
  clearAuthStorage() {
    if (typeof window === 'undefined') return;
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      if (
        key === 'auth_token' ||
        key === 'authToken' ||
        key === 'idToken' ||
        key === 'refresh_token' ||
        key.startsWith('CognitoIdentityServiceProvider.')
      ) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  }

  async logout() {
    try {
      await signOut();
    } catch (_) {}
    if (typeof window !== 'undefined') {
      this.clearAuthStorage();
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const domain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN || 'payintelli-442042527593';
      const region = process.env.NEXT_PUBLIC_COGNITO_REGION || 'ap-south-1';
      const clientId = process.env.NEXT_PUBLIC_COGNITO_APP_CLIENT_ID || '';
      // Must match Cognito app client "Sign out URL(s)" (logout_urls) exactly
      const signOutUrl = `${appUrl}/logout`;
      const logoutUri = encodeURIComponent(signOutUrl);
      const redirectUri = encodeURIComponent(signOutUrl);
      window.location.href = `https://${domain}.auth.${region}.amazoncognito.com/logout?client_id=${clientId}&logout_uri=${logoutUri}&redirect_uri=${redirectUri}&response_type=code`;
    }
    return { success: true };
  }

  async getCurrentUser() {
    try {
      const user = await getCurrentUser();
      return { success: true, user };
    } catch (error) {
      return { success: false, user: null };
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      await getCurrentUser();
      return true;
    } catch {
      return false;
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }
}

export const authService = new AuthService();
export default authService;
