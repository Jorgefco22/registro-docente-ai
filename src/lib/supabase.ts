import { createClient } from '@supabase/supabase-js';

// Cache values of credentials to detect changes and rebuild the client
let currentUrl = localStorage.getItem('rd_supabase_url') || import.meta.env.VITE_SUPABASE_URL || '';
let currentAnonKey = localStorage.getItem('rd_supabase_anon_key') || import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export let supabase = createClient(
  currentUrl || 'https://placeholder-project.supabase.co', 
  currentAnonKey || 'placeholder-anon-key'
);

export const isSupabaseConfigured = (): boolean => {
  return !!(currentUrl && currentAnonKey);
};

export const getSupabaseConfig = () => {
  return {
    url: localStorage.getItem('rd_supabase_url') || import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: localStorage.getItem('rd_supabase_anon_key') || import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  };
};

export const setSupabaseConfig = (url: string, anonKey: string) => {
  const cleanUrl = url.trim();
  const cleanKey = anonKey.trim();
  
  if (cleanUrl) {
    localStorage.setItem('rd_supabase_url', cleanUrl);
  } else {
    localStorage.removeItem('rd_supabase_url');
  }
  
  if (cleanKey) {
    localStorage.setItem('rd_supabase_anon_key', cleanKey);
  } else {
    localStorage.removeItem('rd_supabase_anon_key');
  }
  
  currentUrl = cleanUrl || import.meta.env.VITE_SUPABASE_URL || '';
  currentAnonKey = cleanKey || import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  
  supabase = createClient(
    currentUrl || 'https://placeholder-project.supabase.co',
    currentAnonKey || 'placeholder-anon-key'
  );
};

export const clearSupabaseConfig = () => {
  localStorage.removeItem('rd_supabase_url');
  localStorage.removeItem('rd_supabase_anon_key');
  
  currentUrl = import.meta.env.VITE_SUPABASE_URL || '';
  currentAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  
  supabase = createClient(
    currentUrl || 'https://placeholder-project.supabase.co',
    currentAnonKey || 'placeholder-anon-key'
  );
};
