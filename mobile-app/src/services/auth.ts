// Simple token-based authentication service
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

class AuthService {
  async login(email: string, password: string) {
    try {
      // Call your Cognito API endpoint for login
      // This should be a Lambda function that handles Cognito authentication
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message || 'Login failed' };
      }

      const data = await response.json();
      
      // Store token securely
      await SecureStore.setItemAsync(TOKEN_KEY, data.token);
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(data.user));
      
      return { success: true, user: data.user };
    } catch (error: any) {
      // For demo purposes, allow mock login if API is not available
      if (error.message?.includes('Network request failed')) {
        // Mock login for development
        const mockToken = `mock_token_${Date.now()}`;
        const mockUser = { id: 'user_123', email };
        await SecureStore.setItemAsync(TOKEN_KEY, mockToken);
        await SecureStore.setItemAsync(USER_KEY, JSON.stringify(mockUser));
        return { success: true, user: mockUser };
      }
      return { success: false, error: error.message || 'Login failed' };
    }
  }

  async logout() {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_KEY);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async getCurrentUser() {
    try {
      const userData = await SecureStore.getItemAsync(USER_KEY);
      if (userData) {
        return { success: true, user: JSON.parse(userData) };
      }
      return { success: false, user: null };
    } catch {
      return { success: false, user: null };
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      return !!token;
    } catch {
      return false;
    }
  }

  async getToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch {
      return null;
    }
  }
}

export const authService = new AuthService();
export default authService;
