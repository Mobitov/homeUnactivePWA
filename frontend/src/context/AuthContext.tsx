"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL_CHECK_AUTH, API_URL_LOGOUT } from '../../config/config';

interface User {
  id: number;
  username: string;
  message?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
  isOfflineMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Storage keys for offline auth
const OFFLINE_AUTH_KEY = 'homeunactive_auth';
const OFFLINE_USER_KEY = 'homeunactive_user';

// Auth helper class to avoid React reference issues
class AuthHelper {
  // Check if browser is online
  static isOnline(): boolean {
    return typeof navigator !== 'undefined' && navigator.onLine;
  }
  
  // Save auth state to localStorage
  static saveAuthState(isAuth: boolean, userData: User | null): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(OFFLINE_AUTH_KEY, JSON.stringify(isAuth));
      if (userData) {
        localStorage.setItem(OFFLINE_USER_KEY, JSON.stringify(userData));
      } else {
        localStorage.removeItem(OFFLINE_USER_KEY);
      }
    } catch (error) {
      console.error('Error saving auth state locally:', error);
    }
  }
  
  // Load auth state from localStorage
  static loadAuthState(): { isAuthenticated: boolean; user: User | null } {
    if (typeof window === 'undefined') {
      return { isAuthenticated: false, user: null };
    }
    
    try {
      const authState = localStorage.getItem(OFFLINE_AUTH_KEY);
      const userData = localStorage.getItem(OFFLINE_USER_KEY);
      
      return {
        isAuthenticated: authState ? JSON.parse(authState) : false,
        user: userData ? JSON.parse(userData) : null
      };
    } catch (error) {
      console.error('Error loading auth state from local storage:', error);
      return { isAuthenticated: false, user: null };
    }
  }
  
  // Check authentication with the server
  static async checkAuthWithServer(): Promise<User | null> {
    try {
      const response = await fetch(API_URL_CHECK_AUTH, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        AuthHelper.saveAuthState(true, data);
        return data;
      } else {
        AuthHelper.saveAuthState(false, null);
        return null;
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      return null;
    }
  }
  
  // Logout from the server
  static async logoutFromServer(): Promise<boolean> {
    AuthHelper.saveAuthState(false, null);
    
    try {
      await fetch(API_URL_LOGOUT, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        },
      });
      return true;
    } catch (error) {
      console.error('Logout API call failed:', error);
      return false;
    }
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState({
    isAuthenticated: false,
    user: null as User | null,
    loading: true,
    isOfflineMode: !AuthHelper.isOnline()
  });
  
  // Reference to keep track of functions without causing dependency issues
  const authFunctions = useRef({
    checkAuth: async () => {
      setState(prev => ({ ...prev, loading: true }));
      
      // If we're offline, use the cached auth state
      if (!AuthHelper.isOnline()) {
        console.log('Offline mode: using cached authentication state');
        const { isAuthenticated, user } = AuthHelper.loadAuthState();
        if (isAuthenticated && user) {
          setState(prev => ({
            ...prev,
            isAuthenticated: true,
            user,
            isOfflineMode: true,
            loading: false
          }));
          return;
        }
      }
      
      try {
        const userData = await AuthHelper.checkAuthWithServer();
        if (userData) {
          setState(prev => ({
            ...prev,
            isAuthenticated: true,
            user: userData,
            loading: false
          }));
        } else {
          setState(prev => ({
            ...prev,
            isAuthenticated: false,
            user: null,
            loading: false
          }));
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        
        // Try cached credentials on error
        const { isAuthenticated, user } = AuthHelper.loadAuthState();
        if (isAuthenticated && user) {
          console.log('Network error: using cached authentication');
          setState(prev => ({
            ...prev,
            isAuthenticated: true,
            user,
            isOfflineMode: true,
            loading: false
          }));
        } else {
          setState(prev => ({
            ...prev,
            isAuthenticated: false,
            user: null,
            loading: false
          }));
        }
      }
    },
    
    logout: async () => {
      // Clear local storage auth data
      AuthHelper.saveAuthState(false, null);
      
      if (!AuthHelper.isOnline()) {
        // If offline, just clear local state
        setState(prev => ({
          ...prev,
          isAuthenticated: false,
          user: null
        }));
        router.push('/login');
        return;
      }
      
      try {
        await AuthHelper.logoutFromServer();
      } finally {
        setState(prev => ({
          ...prev,
          isAuthenticated: false,
          user: null
        }));
        router.push('/login');
      }
    }
  }).current;
  
  // Initialize from localStorage and set up event listeners
  useEffect(() => {
    // Load from localStorage first for instant UI
    const { isAuthenticated, user } = AuthHelper.loadAuthState();
    if (isAuthenticated && user) {
      setState(prev => ({
        ...prev,
        isAuthenticated,
        user,
        loading: false
      }));
    }
    
    // Then check with server
    authFunctions.checkAuth();
    
    // Set up network listeners
    const handleOnline = () => {
      setState(prev => ({ ...prev, isOfflineMode: false }));
      authFunctions.checkAuth();
    };
    
    const handleOffline = () => {
      setState(prev => ({ ...prev, isOfflineMode: true }));
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [authFunctions, router]);
  
  // Create the context value
  const contextValue: AuthContextType = {
    isAuthenticated: state.isAuthenticated,
    user: state.user,
    loading: state.loading,
    isOfflineMode: state.isOfflineMode,
    checkAuth: authFunctions.checkAuth,
    logout: authFunctions.logout
  };
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
