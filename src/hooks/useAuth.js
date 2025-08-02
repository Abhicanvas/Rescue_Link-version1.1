import { useState, useEffect } from 'react';
import { authService } from '../services/auth';

export function useAuth() {
  const [authState, setAuthState] = useState({
    isAuthenticated: authService.isAuthenticated(),
    user: authService.getCurrentUser(),
    isLoading: false,
  });

  useEffect(() => {
    const unsubscribe = authService.subscribe(({ isAuthenticated, user }) => {
      setAuthState(prev => ({
        ...prev,
        isAuthenticated,
        user,
      }));
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    try {
      const result = await authService.login(email, password);
      return result;
    } catch (error) {
      throw error;
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const logout = async () => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    try {
      await authService.logout();
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  return {
    ...authState,
    login,
    logout,
    hasRole: authService.hasRole.bind(authService),
    isAdmin: authService.isAdmin.bind(authService),
    isOperator: authService.isOperator.bind(authService),
  };
}