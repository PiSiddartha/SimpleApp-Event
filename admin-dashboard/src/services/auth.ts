// Authentication service using AWS Amplify
import { signIn, signOut, getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';

class AuthService {
  async login(email: string, password: string) {
    try {
      const result = await signIn({
        username: email,
        password,
      });
      
      // Get tokens
      const session = await fetchAuthSession();
      const token = session.tokens?.accessToken?.toString();
      
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

  async logout() {
    try {
      await signOut();
      localStorage.removeItem('auth_token');
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Logout failed' 
      };
    }
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
