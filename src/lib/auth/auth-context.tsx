"use client"
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  error: Error | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, options?: { data?: { firstName?: string; lastName?: string } }) => Promise<{ error: Error | null }>;
  supabase: SupabaseClient;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [supabase] = useState(() =>
    createClient(
      import.meta.env.VITE_SUPABASE_URL!, // Use import.meta.env
      import.meta.env.VITE_SUPABASE_ANON_KEY! // Use import.meta.env
    )
  );
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL; // Use import.meta.env
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY; // Use import.meta.env
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('[AuthContext] Missing Supabase URL or Anon Key:', { supabaseUrl, supabaseAnonKey });
      setError(new Error('Missing Supabase configuration'));
      setIsLoading(false);
      return;
    }

    console.log('[AuthContext] Initializing Supabase auth...');
    
    // Get the initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('[AuthContext] Error getting session:', error);
        setError(error);
      } else {
        console.log('[AuthContext] Initial session:', session);
        setSession(session);
        setUser(session?.user || null);
      }
      setIsLoading(false);
    });

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        console.log('[AuthContext] Auth state changed:', _event, session?.user?.email);
        setSession(session);
        setUser(session?.user || null);
      }
    );

    // Clean up subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('[AuthContext] Sign in error:', error);
        return { error };
      }
      
      return { error: null };
    } catch (err) {
      console.error('[AuthContext] Sign in exception:', err);
      return { error: err instanceof Error ? err : new Error(String(err)) };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('[AuthContext] Sign out error:', err);
    }
  };

  const signUp = async (email: string, password: string, options?: { data?: { firstName?: string; lastName?: string } }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: options?.data
        }
      });
      
      if (error) {
        console.error('[AuthContext] Sign up error:', error);
        return { error };
      }

      // If sign-up is successful, insert user into public.users table
      if (data.user) {
        console.log(`[AuthContext] Attempting to insert user ${data.user.id} into public.users`); // Roo: Log before insert
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            name: `${options?.data?.firstName || ''} ${options?.data?.lastName || ''}`.trim(),
            role: 'teacher' // Default role for new users
          });

        if (insertError) {
          console.error(`[AuthContext] Error inserting user ${data.user.id} into public.users:`, JSON.stringify(insertError, null, 2)); // Roo: Log insertError with user ID
          // Consider rolling back the auth.users creation or handling this error appropriately
          // For now, we'll just log it and proceed, as the auth user is created.
          return { error: insertError };
        }
        console.log(`[AuthContext] Successfully inserted user ${data.user.id} into public.users`); // Roo: Log successful insert
      }
      
      return { error: null };
    } catch (err) {
      console.error('[AuthContext] Sign up exception:', err);
      return { error: err instanceof Error ? err : new Error(String(err)) };
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, error, isLoading, signIn, signOut, signUp, supabase }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};