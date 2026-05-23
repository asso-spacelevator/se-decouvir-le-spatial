import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase, StudentSession, Section } from '../lib/supabase';

interface SessionContextType {
  session: StudentSession | null;
  loading: boolean;
  updateSection: (section: Section) => Promise<void>;
  completeSection: (section: string) => Promise<void>;
  saveResponse: (section: string, questionId: string, response: string) => Promise<void>;
  getResponses: (section: string) => Promise<Record<string, string>>;
  submitQuestion: (category: string, questionText: string, isAnonymous: boolean) => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<StudentSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeSession();
  }, []);

  useEffect(() => {
    if (!session) return;

    const interval = setInterval(() => {
      updateLastActive();
    }, 30000);

    return () => clearInterval(interval);
  }, [session]);

  const initializeSession = async () => {
    const savedSessionId = localStorage.getItem('space_education_session_id');

    if (savedSessionId) {
      const { data, error } = await supabase
        .from('student_sessions')
        .select('*')
        .eq('id', savedSessionId)
        .maybeSingle();

      if (data && !error) {
        setSession(data);
        setLoading(false);
        return;
      }
    }

    const { data: newSession, error } = await supabase
      .from('student_sessions')
      .insert({})
      .select()
      .single();

    if (newSession && !error) {
      setSession(newSession);
      localStorage.setItem('space_education_session_id', newSession.id);
    }

    setLoading(false);
  };

  const updateLastActive = async () => {
    if (!session) return;

    await supabase
      .from('student_sessions')
      .update({ last_active: new Date().toISOString() })
      .eq('id', session.id);
  };

  const updateSection = async (section: Section) => {
    if (!session) return;

    const { data, error } = await supabase
      .from('student_sessions')
      .update({
        current_section: section,
        last_active: new Date().toISOString()
      })
      .eq('id', session.id)
      .select()
      .single();

    if (data && !error) {
      setSession(data);
    }
  };

  const completeSection = async (sectionName: string) => {
    if (!session) return;

    const completedSections = [...session.completed_sections];
    if (!completedSections.includes(sectionName)) {
      completedSections.push(sectionName);
    }

    const { data, error } = await supabase
      .from('student_sessions')
      .update({
        completed_sections: completedSections,
        last_active: new Date().toISOString()
      })
      .eq('id', session.id)
      .select()
      .single();

    if (data && !error) {
      setSession(data);
    }
  };

  const saveResponse = async (section: string, questionId: string, response: string) => {
    if (!session) return;

    const { data: existing } = await supabase
      .from('student_responses')
      .select('id')
      .eq('session_id', session.id)
      .eq('section', section)
      .eq('question_id', questionId)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('student_responses')
        .update({ response_text: response })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('student_responses')
        .insert({
          session_id: session.id,
          section,
          question_id: questionId,
          response_text: response
        });
    }
  };

  const getResponses = async (section: string): Promise<Record<string, string>> => {
    if (!session) return {};

    const { data, error } = await supabase
      .from('student_responses')
      .select('question_id, response_text')
      .eq('session_id', session.id)
      .eq('section', section);

    if (error || !data) return {};

    const responses: Record<string, string> = {};
    data.forEach((item) => {
      responses[item.question_id] = item.response_text;
    });

    return responses;
  };

  const submitQuestion = async (category: string, questionText: string, isAnonymous: boolean) => {
    if (!session) return;

    await supabase
      .from('student_questions')
      .insert({
        session_id: session.id,
        category,
        question_text: questionText,
        is_anonymous: isAnonymous
      });
  };

  return (
    <SessionContext.Provider value={{ session, loading, updateSection, completeSection, saveResponse, getResponses, submitQuestion }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
