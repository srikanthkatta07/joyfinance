import { createContext, useContext, useEffect, useState } from "react";
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [loading, setLoading] = useState(true);

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
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signUp,
      signIn,
      signOut,
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