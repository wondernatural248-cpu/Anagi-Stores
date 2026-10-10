import { supabase, isSupabaseConfigured } from './supabase';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';

export interface AuthResult {
  success: boolean;
  user?: User | null;
  session?: Session | null;
  error?: string;
}

class AuthService {
  // Sign in with email and password via real Supabase Auth
  async signIn(email: string, password: string): Promise<AuthResult> {
    const cleanEmail = (email || '').trim();
    const cleanPassword = (password || '').trim();

    if (!cleanEmail || !cleanPassword) {
      return {
        success: false,
        error: 'කරුණාකර ඔබගේ විද්‍යුත් තැපැල් ලිපිනය සහ මුරපදය ඇතුළත් කරන්න.'
      };
    }

    if (!isSupabaseConfigured()) {
      return {
        success: false,
        error: 'Supabase සේවාදායකය වින්‍යාස කර නොමැත. කරුණාකර පද්ධති පරිපාලක අමතන්න.'
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      });

      if (error || !data?.session || !data?.user) {
        return {
          success: false,
          error: this.translateAuthError(error?.message || 'invalid credentials')
        };
      }

      // Cleanup any legacy mock session in localStorage if existed previously
      try {
        localStorage.removeItem('anagi_admin_session_v1');
      } catch {
        // ignore
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

  // Sign out from Supabase
  async signOut(): Promise<void> {
    try {
      if (isSupabaseConfigured()) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.error('Supabase signOut error:', err);
    } finally {
      try {
        localStorage.removeItem('anagi_admin_session_v1');
      } catch {
        // ignore
      }
    }
  }

  // Retrieve current active session from Supabase
  async getSession(): Promise<Session | null> {
    if (!isSupabaseConfigured()) {
      return null;
    }

    try {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data?.session) {
        return null;
      }
      return data.session;
    } catch {
      return null;
    }
  }

  // Check if currently authenticated with Supabase
  async isAuthenticated(): Promise<boolean> {
    const session = await this.getSession();
    return !!(session && session.user && session.user.id);
  }

  // Get current authenticated user
  async getUser(): Promise<User | null> {
    if (!isSupabaseConfigured()) {
      return null;
    }

    try {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        return null;
      }
      return data.user;
    } catch {
      return null;
    }
  }

  // Auth state change listener from Supabase
  onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    if (isSupabaseConfigured()) {
      return supabase.auth.onAuthStateChange(callback);
    }
    return { data: { subscription: { unsubscribe: () => {} } } };
  }

  // Translate Supabase errors to natural Sinhala
  private translateAuthError(errMsg: string): string {
    const lower = (errMsg || '').toLowerCase();

    if (
      lower.includes('invalid login credentials') || 
      lower.includes('invalid credentials') ||
      lower.includes('invalid_grant') ||
      lower.includes('wrong password')
    ) {
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
      return 'Supabase සේවාදායකය හා සම්බන්ධ වීමට නොහැක (Network Error). කරුණාකර අන්තර්ජාල සම්බන්ධතාවය පරීක්ෂා කරන්න.';
    }
    if (lower.includes('api key') || lower.includes('jwt') || lower.includes('apikey')) {
      return 'Supabase API Key (VITE_SUPABASE_ANON_KEY) අගය වලංගු නොවේ. කරුණාකර නිවැරදි Anon Key එක ලබාදෙන්න.';
    }
    return 'පිවිසීමේදී දෝෂයක් ඇති විය. කරුණාකර නැවත උත්සාහ කරන්න.';
  }
}

export const authService = new AuthService();
