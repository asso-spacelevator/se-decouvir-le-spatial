import { useState, useEffect } from 'react';
import { SessionProvider, useSession } from './contexts/SessionContext';
import { StartPage } from './components/StartPage';
import { GeopoliticalSection } from './components/GeopoliticalSection';
import { TechnicalSection } from './components/TechnicalSection';
import { ManufacturingSection } from './components/ManufacturingSection';
import { OperationsSection } from './components/OperationsSection';
import { QuestionZone } from './components/QuestionZone';
import { CompletionPage } from './components/CompletionPage';
import type { Section } from './lib/supabase';

function AppContent() {
  const { session, loading, updateSection, completeSection } = useSession();
  const [currentView, setCurrentView] = useState<Section>('start');

  useEffect(() => {
    if (session && session.current_section) {
      setCurrentView(session.current_section);
    }
  }, [session]);

  const handleStartJourney = async () => {
    setCurrentView('geopolitical');
    await updateSection('geopolitical');
  };

  const handleSectionComplete = async (nextSection: Section) => {
    await completeSection(currentView);
    setCurrentView(nextSection);
    await updateSection(nextSection);
  };

  const handleRestart = async () => {
    setCurrentView('start');
    await updateSection('start');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <>
      {currentView === 'start' && <StartPage onStart={handleStartJourney} />}
      {currentView === 'geopolitical' && (
        <GeopoliticalSection onComplete={() => handleSectionComplete('technical')} />
      )}
      {currentView === 'technical' && (
        <TechnicalSection onComplete={() => handleSectionComplete('manufacturing')} />
      )}
      {currentView === 'manufacturing' && (
        <ManufacturingSection onComplete={() => handleSectionComplete('operations')} />
      )}
      {currentView === 'operations' && (
        <OperationsSection onComplete={() => handleSectionComplete('questions')} />
      )}
      {currentView === 'questions' && (
        <QuestionZone onComplete={() => handleSectionComplete('completed')} />
      )}
      {currentView === 'completed' && <CompletionPage onRestart={handleRestart} />}
    </>
  );
}

function App() {
  return (
    <SessionProvider>
      <AppContent />
    </SessionProvider>
  );
}

export default App;
