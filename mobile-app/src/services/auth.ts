// Authentication service using AWS Amplify (Cognito)
import { signIn, signOut, getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'auth_token';
const ID_TOKEN_KEY = 'auth_id_token';
const USER_KEY = 'user_data';

/** Map Cognito/Amplify errors to user-friendly messages and surface the real error when possible. */
function getLoginErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const msg = (error as Error & { name?: string; code?: string }).message ?? '';
    const name = (error as Error & { name?: string }).name ?? '';
    const code = (error as Error & { code?: string }).code ?? '';

    // Cognito error names/codes
    if (
      name === 'UserNotFoundException' ||
      code === 'UserNotFoundException' ||
      /user.*not.*found|incorrect.*username/i.test(msg)
    ) {
      return 'No account found with this email. Please sign up or check the email address.';
    }
    if (
      name === 'NotAuthorizedException' ||
      code === 'NotAuthorizedException' ||
      /not authorized|incorrect.*password/i.test(msg)
    ) {
      return 'Incorrect password. Please try again.';
    }
    if (
      name === 'UserNotConfirmedException' ||
      code === 'UserNotConfirmedException' ||
      /user.*not confirmed|confirm.*sign.?up/i.test(msg)
    ) {
      return 'Please verify your email before signing in. Check your inbox for the verification link.';
    }
    if (
      name === 'NetworkError' ||
      code === 'NetworkError' ||
      /network|fetch|failed to load/i.test(msg)
    ) {
      return 'Network error. Check your connection and try again.';
    }
    if (/unknown error|occurred/i.test(msg) && !msg.includes('.')) {
      return 'Sign-in failed. Check your email and password, and that the app is configured for this Cognito user pool.';
    }
    // Return the actual message when it's meaningful
    if (msg && msg !== 'Login failed') return msg;
  }
  return 'Login failed. Please try again.';
}

type UnauthorizedCallback = () => void;

class AuthService {
  private onUnauthorized: UnauthorizedCallback | null = null;

  setOnUnauthorized(callback: UnauthorizedCallback | null) {
    this.onUnauthorized = callback;
  }

  async login(email: string, password: string) {
    try {
      await signIn({
        username: email,
        password,
      });

      const session = await fetchAuthSession();
      const idToken = session.tokens?.idToken?.toString();

      if (!idToken) {
        return {
          success: false,
          error: 'Could not obtain ID token from Cognito session',
        };
      }

      await SecureStore.setItemAsync(ID_TOKEN_KEY, idToken);
      await SecureStore.setItemAsync(TOKEN_KEY, idToken);

      const user = await getCurrentUser();
      const userData = {
        id: user?.userId ?? '',
        email: user?.signInDetails?.loginId ?? email,
      };
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(userData));

      return { success: true, user: userData };
    } catch (error: unknown) {
      // Log full error for debugging (Cognito/Amplify often wrap the real cause)
      console.error('[Auth] login error:', error);

      const message = getLoginErrorMessage(error);
      return {
        success: false,
        error: message,
      };
    }
  }

  async logout() {
    try {
      await signOut();
    } catch (_) {
      // ignore
    }
    await this.clearStorage();
    return { success: true };
  }

  async clearStorage() {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(ID_TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_KEY);
    } catch (_) {
      // ignore
    }
    this.onUnauthorized?.();
  }

  async getCurrentUser() {
    try {
      const userData = await SecureStore.getItemAsync(USER_KEY);
      if (userData) {
        return { success: true, user: JSON.parse(userData) };
      }
      const user = await getCurrentUser();
      if (user) {
        const data = {
          id: user.userId,
          email: user.signInDetails?.loginId ?? '',
        };
        return { success: true, user: data };
      }
      return { success: false, user: null };
    } catch {
      return { success: false, user: null };
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await SecureStore.getItemAsync(ID_TOKEN_KEY) ?? await SecureStore.getItemAsync(TOKEN_KEY);
      return !!token;
    } catch {
      return false;
    }
  }

  async getToken(): Promise<string | null> {
    try {
      const idToken = await SecureStore.getItemAsync(ID_TOKEN_KEY);
      if (idToken) return idToken;
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch {
      return null;
    }
  }
}

export const authService = new AuthService();
export default authService;
