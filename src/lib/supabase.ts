import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Section = 'start' | 'introduction' | 'impact_terrestre' | 'rockets' | 'social' | 'session_break' | 'satellites' | 'exploration' | 'entreprises_spatiales' | 'accompagnement' | 'faq_questions' | 'completed';

export interface StudentSession {
  id: string;
  user_id: string;
  created_at: string;
  last_active: string;
  current_section: Section;
  completed_sections: string[];
  total_time_spent: number;
  school_name: string | null;
  abandoned_at: string | null;
  session1_completed_at: string | null;
  session2_completed_at: string | null;
}

export interface StudentResponse {
  id: string;
  session_id: string;
  section: string;
  question_id: string;
  response_text: string;
  created_at: string;
}

export interface StudentQuestion {
  id: string;
  session_id: string;
  category: 'career' | 'technical' | 'geopolitics' | 'general';
  question_text: string;
  is_anonymous: boolean;
  created_at: string;
}
