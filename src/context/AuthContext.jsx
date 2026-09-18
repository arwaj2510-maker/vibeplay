import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  loginUserCloud,
  registerUserCloud,
  getActiveUserSession,
  logoutUserCloud
} from '../services/cloudStorage';
import confetti from 'canvas-confetti';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Initialize session on mount
  useEffect(() => {
    const sessionUser = getActiveUserSession();
    if (sessionUser) {
      setUser(sessionUser);
    }
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    setAuthError('');
    try {
      const res = await loginUserCloud(email, password);
      setUser(res.user);
      setIsAuthModalOpen(false);
      
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.7 }
      });
      return res;
    } catch (err) {
      setAuthError(err.message || 'Login failed.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setIsLoading(true);
    setAuthError('');
    try {
      const res = await registerUserCloud(name, email, password);
      setUser(res.user);
      setIsAuthModalOpen(false);

      confetti({
        particleCount: 50,
        spread: 80,
        origin: { y: 0.7 }
      });
      return res;
    } catch (err) {
      setAuthError(err.message || 'Registration failed.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsDemo = async () => {
    return login('demo@vibeplay.com', 'password123');
  };

  const logout = () => {
    logoutUserCloud();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthModalOpen,
      authError,
      isLoading,
      setIsAuthModalOpen,
      setAuthError,
      login,
      register,
      loginAsDemo,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
