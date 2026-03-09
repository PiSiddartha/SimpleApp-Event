// Authentication service using AWS Amplify (Cognito)
import { signIn, signOut, signUp, confirmSignUp, resendSignUpCode, getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
import * as SecureStore from 'expo-secure-store';

export type SignUpOptions = { givenName?: string; familyName?: string };

const TOKEN_KEY = 'auth_token';
const ID_TOKEN_KEY = 'auth_id_token';
const USER_KEY = 'user_data';

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
      const err = error as Record<string, unknown>;
      if (err && typeof err === 'object') {
        try {
          console.error('[Auth] error name:', err.name, 'code:', err.code, 'message:', err.message);
          if (err.underlyingError) console.error('[Auth] underlyingError:', err.underlyingError);
          if (err.cause) console.error('[Auth] cause:', err.cause);
          // Amplify can put the real message in a nested structure
          const safeKeys = Object.keys(err).filter((k) => typeof (err as Record<string, unknown>)[k] !== 'function');
          console.error('[Auth] error keys:', safeKeys.join(', '));
        } catch (_) {}
      }

      const msg = error instanceof Error ? (error as Error & { name?: string; code?: string }).message ?? '' : '';
      const name = error instanceof Error ? (error as Error & { name?: string }).name ?? '' : '';
      const code = error instanceof Error ? (error as Error & { code?: string }).code ?? '' : '';

      let message = 'Login failed. Please try again.';
      if (name === 'UserNotFoundException' || code === 'UserNotFoundException' || /user.*not.*found|incorrect.*username/i.test(msg)) {
        message = 'No account found with this email. Please sign up or check the email address.';
      } else if (name === 'NotAuthorizedException' || code === 'NotAuthorizedException' || /not authorized|incorrect.*password/i.test(msg)) {
        message = 'Incorrect password. Please try again.';
      } else if (name === 'UserNotConfirmedException' || code === 'UserNotConfirmedException' || /user.*not confirmed|confirm.*sign.?up/i.test(msg)) {
        message = 'Please verify your email before signing in. Check your inbox for the verification link.';
      } else if (name === 'NetworkError' || code === 'NetworkError' || /network|fetch|failed to load/i.test(msg)) {
        message = 'Network error. Check your connection and try again.';
      } else if (/unknown error|occurred/i.test(msg)) {
        message = 'Sign-in failed. Cognito often returns this for an incorrect password. Try again or use "Forgot password" if you’re unsure.';
      } else if (msg && msg !== 'Login failed') {
        message = msg;
      }

      return {
        success: false,
        error: message,
      };
    }
  }

  async signUp(email: string, password: string, options?: SignUpOptions) {
    try {
      const userAttributes: Record<string, string> = { email };
      if (options?.givenName) userAttributes.given_name = options.givenName;
      if (options?.familyName) userAttributes.family_name = options.familyName;

      const result = await signUp({
        username: email,
        password,
        options: {
          userAttributes: userAttributes,
        },
      });

      const nextStep = result.nextStep?.signInStep;
      const destination = (result.nextStep as { codeDeliveryDetails?: { destination?: string } })?.codeDeliveryDetails?.destination;
      return {
        success: true,
        userId: result.userId,
        nextStep: nextStep ?? 'CONFIRM_SIGN_UP',
        destination: destination ?? undefined,
      };
    } catch (error: unknown) {
      console.error('[Auth] signUp error:', error);
      const msg = error instanceof Error ? (error as Error & { name?: string; code?: string }).message ?? '' : '';
      const name = error instanceof Error ? (error as Error & { name?: string }).name ?? '' : '';
      const code = (error as Error & { code?: string }).code ?? '';

      let message = 'Sign up failed. Please try again.';
      if (name === 'UsernameExistsException' || code === 'UsernameExistsException' || /already exists|already registered/i.test(msg)) {
        message = 'An account with this email already exists. Sign in or use a different email.';
      } else if (/InvalidPasswordException|password/i.test(msg) || /too short|uppercase|lowercase|number|symbol/i.test(msg)) {
        message = 'Password must be at least 8 characters with uppercase, lowercase, a number, and a symbol.';
      } else if (/InvalidParameterException|invalid/i.test(msg)) {
        message = 'Please enter a valid email address.';
      } else if (msg && msg !== 'Sign up failed. Please try again.') {
        message = msg;
      }
      return { success: false, error: message };
    }
  }

  async confirmSignUp(email: string, confirmationCode: string) {
    try {
      await confirmSignUp({
        username: email,
        confirmationCode: confirmationCode.trim(),
      });
      return { success: true };
    } catch (error: unknown) {
      console.error('[Auth] confirmSignUp error:', error);
      const msg = error instanceof Error ? (error as Error & { name?: string; code?: string }).message ?? '' : '';
      const name = (error as Error & { name?: string }).name ?? '';
      const code = (error as Error & { code?: string }).code ?? '';

      let message = 'Verification failed. Please check the code and try again.';
      if (name === 'CodeMismatchException' || code === 'CodeMismatchException' || /invalid.*code|code.*invalid/i.test(msg)) {
        message = 'Invalid or expired code. Please check the code from your email or request a new one.';
      } else if (name === 'ExpiredCodeException' || code === 'ExpiredCodeException') {
        message = 'This code has expired. Please request a new code.';
      } else if (msg && !msg.includes('Verification failed')) {
        message = msg;
      }
      return { success: false, error: message };
    }
  }

  async resendSignUpCode(email: string) {
    try {
      const result = await resendSignUpCode({ username: email });
      const destination = (result as { codeDeliveryDetails?: { destination?: string } })?.codeDeliveryDetails?.destination;
      return { success: true, destination };
    } catch (error: unknown) {
      console.error('[Auth] resendSignUpCode error:', error);
      const msg = error instanceof Error ? (error as Error & { name?: string }).message ?? '' : '';
      const name = (error as Error & { name?: string }).name ?? '';
      let message = 'Could not resend code. Please try again.';
      if (name === 'LimitExceededException' || /limit|too many/i.test(msg)) {
        message = 'Too many attempts. Please wait a few minutes before requesting another code.';
      } else if (msg) message = msg;
      return { success: false, error: message };
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
