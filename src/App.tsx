import { useState, useEffect } from 'react';
import { SessionProvider, useSession } from './contexts/SessionContext';
import { StartPage } from './components/StartPage';
import { GeopoliticalSection } from './components/GeopoliticalSection';
import { RocketSection } from './components/RocketSection';
import { SatelliteSection } from './components/SatelliteSection';
import { ExplorationSection } from './components/ExplorationSection';
import { SocialReferencesSection } from './components/SocialReferencesSection';
import { AssociationsSection } from './components/AssociationsSection';
import { FAQSection } from './components/FAQSection';
import { SchoolResourcesSection } from './components/SchoolResourcesSection';
import { QuestionZone } from './components/QuestionZone';
import { CompletionPage } from './components/CompletionPage';
import { ProgressBar } from './components/ProgressBar';
import type { Section } from './lib/supabase';

function AppContent() {
  const { session, loading, updateSection, completeSection } = useSession();
  const [currentView, setCurrentView] = useState<Section>('start');

  useEffect(() => {
    if (session && session.current_section) {
      setCurrentView(session.current_section);
    }
  }, [session]);

  const sectionOrder: Section[] = ['start', 'geopolitical', 'rockets', 'satellites', 'exploration', 'social', 'associations', 'faq', 'resources', 'questions', 'completed'];

  const progressSteps = [
    { name: 'Terre', icon: '🌍' },
    { name: 'Fusées', icon: '🚀' },
    { name: 'Orbite', icon: '🛰️' },
    { name: 'Au-delà', icon: '🌌' },
    { name: 'Social', icon: '📱' },
    { name: 'Accompagnement', icon: '🤝' },
    { name: 'FAQ', icon: '💭' },
    { name: 'Ressources', icon: '📚' },
    { name: 'Questions', icon: '❓' }
  ];

  const getCurrentStepIndex = () => {
    const view = currentView;
    if (view === 'start' || view === 'completed') return -1;
    if (view === 'geopolitical') return 0;
    if (view === 'rockets') return 1;
    if (view === 'satellites') return 2;
    if (view === 'exploration') return 3;
    if (view === 'social') return 4;
    if (view === 'associations') return 5;
    if (view === 'faq') return 6;
    if (view === 'resources') return 7;
    if (view === 'questions') return 8;
    return -1;
  };

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

  const handleBack = async () => {
    const currentIndex = sectionOrder.indexOf(currentView);
    if (currentIndex > 0) {
      const previousSection = sectionOrder[currentIndex - 1];
      setCurrentView(previousSection);
      await updateSection(previousSection);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Chargement...</div>
      </div>
    );
  }

  const stepIndex = getCurrentStepIndex();

  return (
    <>
      {stepIndex >= 0 && (
        <ProgressBar
          currentStep={stepIndex}
          totalSteps={progressSteps.length}
          steps={progressSteps}
        />
      )}
      {currentView === 'start' && <StartPage onStart={handleStartJourney} />}
      {currentView === 'geopolitical' && (
        <GeopoliticalSection
          onComplete={() => handleSectionComplete('rockets')}
          onHome={handleRestart}
          onBack={handleBack}
        />
      )}
      {currentView === 'rockets' && (
        <RocketSection
          onComplete={() => handleSectionComplete('satellites')}
          onHome={handleRestart}
          onBack={handleBack}
        />
      )}
      {currentView === 'satellites' && (
        <SatelliteSection
          onComplete={() => handleSectionComplete('exploration')}
          onHome={handleRestart}
          onBack={handleBack}
        />
      )}
      {currentView === 'exploration' && (
        <ExplorationSection
          onComplete={() => handleSectionComplete('social')}
          onHome={handleRestart}
          onBack={handleBack}
        />
      )}
      {currentView === 'social' && (
        <SocialReferencesSection
          onComplete={() => handleSectionComplete('associations')}
          onHome={handleRestart}
          onBack={handleBack}
        />
      )}
      {currentView === 'associations' && (
        <AssociationsSection
          onComplete={() => handleSectionComplete('faq')}
          onHome={handleRestart}
          onBack={handleBack}
        />
      )}
      {currentView === 'faq' && (
        <FAQSection
          onComplete={() => handleSectionComplete('resources')}
          onHome={handleRestart}
          onBack={handleBack}
        />
      )}
      {currentView === 'resources' && (
        <SchoolResourcesSection
          onComplete={() => handleSectionComplete('questions')}
          onHome={handleRestart}
          onBack={handleBack}
        />
      )}
      {currentView === 'questions' && (
        <QuestionZone
          onComplete={() => handleSectionComplete('completed')}
          onHome={handleRestart}
          onBack={handleBack}
        />
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
