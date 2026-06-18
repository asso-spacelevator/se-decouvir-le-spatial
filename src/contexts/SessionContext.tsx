import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase, StudentSession, Section } from '../lib/supabase';

interface SessionContextType {
  session: StudentSession | null;
  loading: boolean;
  updateSection: (section: Section) => Promise<void>;
  completeSection: (section: string) => Promise<void>;
  saveResponse: (section: string, questionId: string, response: string) => Promise<void>;
  getResponses: (section: string) => Promise<Record<string, string>>;
  submitQuestion: (category: string, questionText: string, isAnonymous: boolean, sourceSection?: string) => Promise<void>;
  recordQuizScore: (section: string, questionId: string, isCorrect: boolean) => Promise<void>;
  logVideoView: (section: string, videoId: string, videoTitle: string) => Promise<void>;
  logChapterTime: (section: string, pageIndex: number, elapsedSec: number) => Promise<void>;
  saveSchoolName: (name: string) => Promise<void>;
  restartSession: () => Promise<void>;
  markSession1Complete: () => Promise<void>;
  markSession2Complete: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<StudentSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeSession();

    const { data: subscription } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') setSession(null);
    });
    return () => subscription.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;

    const interval = setInterval(() => {
      updateLastActive();
    }, 30000);

    return () => clearInterval(interval);
  }, [session]);

  const initializeSession = async () => {
    localStorage.removeItem('space_education_session_id');

    let { data: { session: authSession } } = await supabase.auth.getSession();
    if (!authSession) {
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error || !data.session) {
        console.error('Anonymous sign-in failed', error);
        setLoading(false);
        return;
      }
      authSession = data.session;
    }
    const userId = authSession.user.id;

    const { data: existing } = await supabase
      .from('student_sessions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) {
      setSession(existing);
      setLoading(false);
      return;
    }

    const { data: created, error } = await supabase
      .from('student_sessions')
      .insert({ user_id: userId })
      .select()
      .single();

    if (created && !error) {
      setSession(created);
    } else {
      const { data: retry } = await supabase
        .from('student_sessions')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      if (retry) setSession(retry);
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

  const submitQuestion = async (category: string, questionText: string, isAnonymous: boolean, sourceSection?: string) => {
    if (!session) return;

    await supabase
      .from('student_questions')
      .insert({
        session_id: session.id,
        category,
        question_text: questionText,
        is_anonymous: isAnonymous,
        ...(sourceSection ? { source_section: sourceSection } : {}),
      });
  };

  const recordQuizScore = async (section: string, questionId: string, isCorrect: boolean) => {
    if (!session) return;

    await supabase
      .from('quiz_scores')
      .insert({
        session_id: session.id,
        section,
        question_id: questionId,
        is_correct: isCorrect
      });
  };

  const logVideoView = async (section: string, videoId: string, videoTitle: string) => {
    if (!session) return;

    await supabase
      .from('video_views')
      .insert({
        session_id: session.id,
        section,
        video_id: videoId,
        video_title: videoTitle,
      });
  };

  const logChapterTime = async (section: string, pageIndex: number, elapsedSec: number) => {
    if (!session) return;

    await supabase
      .from('chapter_time_logs')
      .insert({
        session_id: session.id,
        section,
        page_index: pageIndex,
        elapsed_sec: elapsedSec,
      });
  };

  const saveSchoolName = async (name: string) => {
    if (!session) return;

    const { data, error } = await supabase
      .from('student_sessions')
      .update({ school_name: name })
      .eq('id', session.id)
      .select()
      .single();

    if (data && !error) {
      setSession(data);
    }
  };

  const markSession1Complete = async () => {
    if (!session) return;
    const { data, error } = await supabase
      .from('student_sessions')
      .update({ session1_completed_at: new Date().toISOString() })
      .eq('id', session.id)
      .select()
      .single();
    if (data && !error) setSession(data);
  };

  const markSession2Complete = async () => {
    if (!session) return;
    const { data, error } = await supabase
      .from('student_sessions')
      .update({ session2_completed_at: new Date().toISOString() })
      .eq('id', session.id)
      .select()
      .single();
    if (data && !error) setSession(data);
  };

  const restartSession = async () => {
    // Mark current session as abandoned so it's preserved in analytics
    if (session) {
      await supabase
        .from('student_sessions')
        .update({ abandoned_at: new Date().toISOString() })
        .eq('id', session.id);
    }

    // Sign out — clears the supabase-js JWT from localStorage
    setLoading(true);
    setSession(null);
    await supabase.auth.signOut();

    // Re-initialize: new anonymous user + new session row
    await initializeSession();
  };

  return (
    <SessionContext.Provider value={{ session, loading, updateSection, completeSection, saveResponse, getResponses, submitQuestion, recordQuizScore, logVideoView, logChapterTime, saveSchoolName, restartSession, markSession1Complete, markSession2Complete }}>
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
