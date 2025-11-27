'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, verifySession, signOut } from './auth';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';

// Define the auth context type
interface AuthContextType {
  user: User | null;
  loading: boolean;
  token: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const router = useRouter();

  // Initialize auth state from local storage
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check if we're in the browser
        if (typeof window === 'undefined') {
          setLoading(false);
          setInitializing(false);
          return;
        }

        const storedToken = localStorage.getItem('authToken');
        
        if (storedToken) {
          // Set token immediately to prevent flash
          setToken(storedToken);
          setIsAuthenticated(true);
          
          // Verify the session token in background
          const { data, error } = await verifySession(storedToken);
          
          if (error || !data) {
            // Invalid or expired session
            localStorage.removeItem('authToken');
            document.cookie = 'authToken=; path=/; max-age=0; SameSite=Lax';
            setToken(null);
            setUser(null);
            setIsAuthenticated(false);
          } else {
            // Valid session - update user data
            setUser(data.user);
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // On error, clear everything
        localStorage.removeItem('authToken');
        document.cookie = 'authToken=; path=/; max-age=0; SameSite=Lax';
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
        setInitializing(false);
      }
    };

    initAuth();
  }, []);

  // Function to handle logout
  const logout = async () => {
    try {
      if (token) {
        await signOut(token);
      }
      
      // Clear from localStorage
      localStorage.removeItem('authToken');
      
      // Clear from cookies
      document.cookie = 'authToken=; path=/; max-age=0; SameSite=Lax';
      
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      router.push('/user/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Update isAuthenticated whenever user or token changes
  useEffect(() => {
    setIsAuthenticated(!!user && !!token);
  }, [user, token]);

  // Context value
  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    setUser,
    setToken,
    logout
  };

  // Show loading spinner during initial auth check
  if (initializing) {
    return <LoadingSpinner />;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for using the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

// Save authentication data to local storage and cookies
export function saveAuthData(token: string, tokenKey: string = 'authToken') {
  // Check if we're in the browser
  if (typeof window === 'undefined') return;
  
  // Save to localStorage for client-side access
  localStorage.setItem(tokenKey, token);
  
  // Save to cookies for middleware access
  document.cookie = `${tokenKey}=${token}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
} 