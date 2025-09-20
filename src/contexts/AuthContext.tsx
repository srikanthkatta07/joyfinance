import { createContext, useContext, useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

interface CustomUser {
  id: string;
  username: string;
  mobile_number: string;
  display_name?: string;
  created_at: string;
}

interface AuthContextType {
  user: CustomUser | null;
  loading: boolean;
  signUp: (username: string, mobileNumber: string, password: string, displayName?: string) => Promise<{ error: any }>;
  signIn: (username: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<{ error: any }>;
  autoLogoutSettings: {
    logoutOnVisibilityChange: boolean;
    logoutOnScreenLock: boolean;
    idleTimeoutMinutes: number;
  };
  updateAutoLogoutSettings: (settings: Partial<AuthContextType['autoLogoutSettings']>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoLogoutSettings, setAutoLogoutSettings] = useState({
    logoutOnVisibilityChange: true,
    logoutOnScreenLock: true,
    idleTimeoutMinutes: 15
  });
  
  const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  useEffect(() => {
    // Check for existing session in localStorage
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem('joyfinance_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        localStorage.removeItem('joyfinance_user');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Load auto-logout settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('joyfinance_auto_logout_settings');
    if (savedSettings) {
      try {
        setAutoLogoutSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Error loading auto-logout settings:', error);
      }
    }
  }, []);

  // Auto-logout functionality
  useEffect(() => {
    if (!user) return;

    const resetIdleTimeout = () => {
      lastActivityRef.current = Date.now();
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }
      
      if (autoLogoutSettings.idleTimeoutMinutes > 0) {
        idleTimeoutRef.current = setTimeout(() => {
          console.log('Auto-logout: Idle timeout reached');
          signOut();
        }, autoLogoutSettings.idleTimeoutMinutes * 60 * 1000);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && autoLogoutSettings.logoutOnVisibilityChange) {
        console.log('Auto-logout: App became hidden');
        signOut();
      } else if (!document.hidden) {
        resetIdleTimeout();
      }
    };

    const handleScreenLock = () => {
      if (autoLogoutSettings.logoutOnScreenLock) {
        console.log('Auto-logout: Screen locked');
        signOut();
      }
    };

    const handleUserActivity = () => {
      resetIdleTimeout();
    };

    // Set up event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('keydown', handleUserActivity);
    document.addEventListener('mousedown', handleUserActivity);
    document.addEventListener('touchstart', handleUserActivity);
    document.addEventListener('scroll', handleUserActivity);

    // Screen lock detection (for mobile)
    if ('wakeLock' in navigator) {
      navigator.wakeLock?.request('screen').then(wakeLock => {
        wakeLock.addEventListener('release', handleScreenLock);
      });
    }

    // Initial idle timeout setup
    resetIdleTimeout();

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('keydown', handleUserActivity);
      document.removeEventListener('mousedown', handleUserActivity);
      document.removeEventListener('touchstart', handleUserActivity);
      document.removeEventListener('scroll', handleUserActivity);
      
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }
    };
  }, [user, autoLogoutSettings]);

  const signUp = async (username: string, mobileNumber: string, password: string, displayName?: string) => {
    try {
      // Simple password hashing (in production, use a proper library)
      const passwordHash = btoa(password + 'salt');
      
      const { data, error } = await supabase
        .from('custom_users')
        .insert({
          username,
          password_hash: passwordHash,
          mobile_number: mobileNumber,
          display_name: displayName || username
        })
        .select()
        .single();

      if (error) {
        console.error('Registration error:', error);
        return { error };
      }

      if (data) {
        setUser(data);
        localStorage.setItem('joyfinance_user', JSON.stringify(data));
        return { error: null };
      }

      return { error: { message: 'Registration failed' } };
    } catch (error) {
      console.error('Registration exception:', error);
      return { error };
    }
  };

  const signIn = async (username: string, password: string) => {
    try {
      // Simple password hashing (in production, use a proper library)
      const passwordHash = btoa(password + 'salt');
      
      const { data, error } = await supabase
        .from('custom_users')
        .select('*')
        .eq('username', username)
        .eq('password_hash', passwordHash)
        .single();

      if (error) {
        console.error('Authentication error:', error);
        return { error: { message: 'Invalid username or password' } };
      }

      if (data) {
        setUser(data);
        localStorage.setItem('joyfinance_user', JSON.stringify(data));
        return { error: null };
      }

      return { error: { message: 'Invalid username or password' } };
    } catch (error) {
      console.error('Authentication exception:', error);
      return { error: { message: 'Invalid username or password' } };
    }
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem('joyfinance_user');
    
    // Clear any active timeouts
    if (idleTimeoutRef.current) {
      clearTimeout(idleTimeoutRef.current);
    }
  };

  const updateAutoLogoutSettings = (settings: Partial<AuthContextType['autoLogoutSettings']>) => {
    const newSettings = { ...autoLogoutSettings, ...settings };
    setAutoLogoutSettings(newSettings);
    localStorage.setItem('joyfinance_auto_logout_settings', JSON.stringify(newSettings));
  };

  const changePassword = async (oldPassword: string, newPassword: string) => {
    if (!user) {
      return { error: { message: 'User not authenticated' } };
    }

    try {
      // Verify old password
      const oldPasswordHash = btoa(oldPassword + 'salt');
      
      const { data: userData, error: verifyError } = await supabase
        .from('custom_users')
        .select('*')
        .eq('id', user.id)
        .eq('password_hash', oldPasswordHash)
        .single();

      if (verifyError || !userData) {
        return { error: { message: 'Current password is incorrect' } };
      }

      // Hash new password
      const newPasswordHash = btoa(newPassword + 'salt');

      // Update password
      const { error: updateError } = await supabase
        .from('custom_users')
        .update({ password_hash: newPasswordHash })
        .eq('id', user.id);

      if (updateError) {
        console.error('Password update error:', updateError);
        return { error: { message: 'Failed to update password' } };
      }

      return { error: null };
    } catch (error) {
      console.error('Password change exception:', error);
      return { error: { message: 'An error occurred while changing password' } };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signUp,
      signIn,
      signOut,
      changePassword,
      autoLogoutSettings,
      updateAutoLogoutSettings,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}