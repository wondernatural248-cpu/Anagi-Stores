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
        error: this.translateAuthError(err?.message || '')
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
    const lower = (errMsg || '').toLowerCase();

    if (lower.includes('invalid login credentials') || lower.includes('invalid credentials')) {
      return 'විද්‍යුත් තැපැල් ලිපිනය හෝ මුරපදය වැරදියි. කරුණාකර නිවැරදි දත්ත ඇතුළත් කරන්න.';
    }
    if (lower.includes('email not confirmed')) {
      return 'ඔබගේ විද්‍යුත් තැපැල් ලිපිනය තහවුරු කර නොමැත. කරුණාකර තහවුරු කිරීමේ ඊමේල් පණිවිඩය (Verification Email) පරීක්ෂා කරන්න.';
    }
    if (lower.includes('user not found')) {
      return 'මෙම විද්‍යුත් තැපැල් ලිපිනයෙන් ලියාපදිංචි පරිශීලකයෙකු සොයාගත නොහැක.';
    }
    if (lower.includes('rate limit') || lower.includes('too many requests')) {
      return 'ඉල්ලීම් සීමාව ඉක්මවා ඇත. කරුණාකර සුළු මොහොතකින් නැවත උත්සාහ කරන්න.';
    }
    if (
      lower.includes('failed to fetch') || 
      lower.includes('network') || 
      lower.includes('enotfound') || 
      lower.includes('fetch failed') ||
      lower.includes('typeerror')
    ) {
      return 'Supabase සේවාදායකය හා සම්බන්ධ වීමට නොහැක (Failed to fetch). ඔබගේ Supabase Project URL (VITE_SUPABASE_URL) හෝ Project Status (Active/Paused) පරීක්ෂා කරන්න.';
    }
    if (lower.includes('api key') || lower.includes('jwt') || lower.includes('apikey')) {
      return 'Supabase API Key (VITE_SUPABASE_ANON_KEY) අගය වලංගු නොවේ. කරුණාකර නිවැරදි Anon Key එක ලබාදෙන්න.';
    }
    return errMsg || 'පිවිසීමේදී දෝෂයක් ඇති විය. කරුණාකර නැවත උත්සාහ කරන්න.';
  }
}

export const authService = new AuthService();
