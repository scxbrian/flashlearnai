import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiCall } from '../api/client';

interface User {
  id: string;
  email: string;
  name: string;
  subscription: {
    tier: string;
    status: string;
  };
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock user for demo purposes
  useEffect(() => {
    // Simulate checking for existing session
    const mockUser = {
      id: '1',
      email: 'demo@flashlearn.ai',
      name: 'Demo User',
      subscription: {
        tier: 'Flash Core',
        status: 'active',
      },
    };
    
    // Auto-login demo user after 1 second
    setTimeout(() => {
      setUser(mockUser);
      setIsLoading(false);
    }, 1000);
  }, []);
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      validateToken();
    } else {
      // Keep loading state for demo auto-login
    }
  }, []);

  const validateToken = async () => {
    try {
      const response = await apiCall('/api/user/profile');
      setUser(response.data);
    } catch (error) {
      localStorage.removeItem('token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await apiCall('/api/auth/login', {
        method: 'POST',
        data: { email, password },
      });
      
      localStorage.setItem('token', response.token);
      setUser(response.data);
    } catch (error) {
      // Fallback to mock for demo if backend not available
      console.warn('Backend not available, using mock login');
      const mockUser = {
        id: '1',
        email: email,
        name: 'Demo User',
        subscription: {
          tier: 'Flash Core',
          status: 'active',
        },
      };
      
      localStorage.setItem('token', 'demo-token');
      setUser(mockUser);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      const response = await apiCall('/api/auth/signup', {
        method: 'POST',
        data: { email, password, name },
      });
      
      localStorage.setItem('token', response.token);
      setUser(response.data);
    } catch (error) {
      // Fallback to mock for demo if backend not available
      console.warn('Backend not available, using mock signup');
      const mockUser = {
        id: '1',
        email: email,
        name: name,
        subscription: {
          tier: 'Flash Lite',
          status: 'active',
        },
      };
      
      localStorage.setItem('token', 'demo-token');
      setUser(mockUser);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    login,
    signup,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};