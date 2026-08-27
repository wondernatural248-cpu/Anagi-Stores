import { supabase, isSupabaseConfigured } from './supabase';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';

export interface AuthResult {
  success: boolean;
  user?: User | null;
  session?: Session | null;
  error?: string;
}

const LOCAL_ADMIN_AUTH_KEY = 'anagi_admin_session_v1';

class AuthService {
  // Sign in with email and password
  async signIn(email: string, password: string): Promise<AuthResult> {
    if (!isSupabaseConfigured()) {
      // In development mode when Supabase credentials are not yet configured in .env:
      // Allow entering the visual admin area with demo credentials so the UI can be previewed
      if (email.trim() && password.trim()) {
        const mockUser: any = {
          id: 'mock-admin-user',
          email: email.trim(),
          user_metadata: { role: 'admin', name: 'Anagi Administrator' }
        };
        localStorage.setItem(LOCAL_ADMIN_AUTH_KEY, JSON.stringify(mockUser));
        return {
          success: true,
          user: mockUser,
          error: undefined
        };
      }
      return {
        success: false,
        error: 'කරුණාකර වලංගු විද්‍යුත් තැපැල් ලිපිනයක් සහ මුරපදයක් ඇතුළත් කරන්න.'
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) {
        return {
          success: false,
          error: this.translateAuthError(error.message)
        };
      }

      return {
        success: true,
        user: data.user,
        session: data.session
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'පිවිසීමේදී දෝෂයක් ඇති විය. කරුණාකර නැවත උත්සාහ කරන්න.'
      };
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error('Supabase signOut error:', err);
      }
    }
    localStorage.removeItem(LOCAL_ADMIN_AUTH_KEY);
  }

  // Check current session
  async getSession(): Promise<Session | null> {
    if (isSupabaseConfigured()) {
      try {
        const { data } = await supabase.auth.getSession();
        return data.session;
      } catch {
        return null;
      }
    }

    const localStored = localStorage.getItem(LOCAL_ADMIN_AUTH_KEY);
    if (localStored) {
      return { user: JSON.parse(localStored) } as any;
    }
    return null;
  }

  // Check if authenticated
  async isAuthenticated(): Promise<boolean> {
    const session = await this.getSession();
    return !!session;
  }

  // Auth state change listener
  onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    if (isSupabaseConfigured()) {
      return supabase.auth.onAuthStateChange(callback);
    }
    return { data: { subscription: { unsubscribe: () => {} } } };
  }

  // Helper to translate Supabase errors to Sinhala
  private translateAuthError(errMsg: string): string {
    if (errMsg.includes('Invalid login credentials')) {
      return 'විද්‍යුත් තැපැල් ලිපිනය හෝ මුරපදය වැරදියි. කරුණාකර පරීක්ෂා කරන්න.';
    }
    if (errMsg.includes('Email not confirmed')) {
      return 'ඔබගේ විද්‍යුත් තැපැල් ලිපිනය තහවුරු කර නොමැත. කරුණාකර තහවුරු කිරීමේ ඊමේල් පණිවිඩය පරීක්ෂා කරන්න.';
    }
    if (errMsg.includes('Network') || errMsg.includes('Failed to fetch')) {
      return 'ජාල සම්බන්ධතාවයේ දෝෂයක්. කරුණාකර ඔබගේ අන්තර්ජාල සම්බන්ධතාවය පරීක්ෂා කරන්න.';
    }
    return errMsg;
  }
}

export const authService = new AuthService();
