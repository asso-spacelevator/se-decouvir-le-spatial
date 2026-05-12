import { useState, useEffect } from 'react';
import { SessionProvider, useSession } from './contexts/SessionContext';
import { StartPage } from './components/StartPage';
import { IntroductionPage } from './components/IntroductionPage';
import { ImpactTerrestreSection } from './components/ImpactTerrestreSection';
import { RocketSection } from './components/RocketSection';
import { SocialReferencesSection } from './components/SocialReferencesSection';
import { SessionBreakPage } from './components/SessionBreakPage';
import { SatelliteSection } from './components/SatelliteSection';
import { ExplorationSection } from './components/ExplorationSection';
import { AccompagnementSection } from './components/AccompagnementSection';
import { FAQQuestionsSection } from './components/FAQQuestionsSection';
import { CompletionPage } from './components/CompletionPage';
import { ProgressBar } from './components/ProgressBar';
import type { Section } from './lib/supabase';

const SESSION1_STEPS = [
  { name: 'Impact Terre', icon: '🌍', section: 'impact_terrestre' as Section },
  { name: 'Lanceurs', icon: '🚀', section: 'rockets' as Section },
  { name: 'Social', icon: '📱', section: 'social' as Section },
];

const SESSION2_STEPS = [
  { name: 'Orbite', icon: '🛰️', section: 'satellites' as Section },
  { name: 'Au-delà', icon: '🌌', section: 'exploration' as Section },
  { name: 'Accompagnement', icon: '🤝', section: 'accompagnement' as Section },
  { name: 'FAQ & Questions', icon: '💬', section: 'faq_questions' as Section },
];

const SESSION1_SECTIONS: Section[] = ['introduction', 'impact_terrestre', 'rockets', 'social', 'session_break'];
const SESSION2_SECTIONS: Section[] = ['satellites', 'exploration', 'accompagnement', 'faq_questions', 'completed'];

const sectionOrder: Section[] = [
  'start', 'introduction',
  'impact_terrestre', 'rockets', 'social',
  'session_break',
  'satellites', 'exploration', 'accompagnement', 'faq_questions',
  'completed',
];

function AppContent() {
  const { session, loading, updateSection, completeSection } = useSession();
  const [currentView, setCurrentView] = useState<Section>('start');

  useEffect(() => {
    if (session && session.current_section) {
      setCurrentView(session.current_section);
    }
  }, [session]);

  const isSession1 = SESSION1_STEPS.some(s => s.section === currentView);
  const isSession2 = SESSION2_STEPS.some(s => s.section === currentView);

  const getCurrentStepIndex = () => {
    if (isSession1) return SESSION1_STEPS.findIndex(s => s.section === currentView);
    if (isSession2) return SESSION2_STEPS.findIndex(s => s.section === currentView);
    return -1;
  };

  const navigate = async (section: Section) => {
    setCurrentView(section);
    await updateSection(section);
  };

  const handleSectionComplete = async (nextSection: Section) => {
    await completeSection(currentView);
    await navigate(nextSection);
  };

  const handleBack = async () => {
    const currentIndex = sectionOrder.indexOf(currentView);
    if (currentIndex > 0) {
      await navigate(sectionOrder[currentIndex - 1]);
    }
  };

  const handleHome = async () => navigate('start');

  // End of session 1 → back to home
  const handleSession1End = async () => {
    await completeSection(currentView);
    await navigate('start');
  };

  // End of session 2 → completed page, then back to home
  const handleSession2End = async () => {
    await completeSection(currentView);
    await navigate('completed');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Chargement...</div>
      </div>
    );
  }

  const steps = isSession1 ? SESSION1_STEPS : SESSION2_STEPS;
  const sessionLabel = isSession1 ? 'Session 1 / 2' : 'Session 2 / 2';
  const stepIndex = getCurrentStepIndex();

  return (
    <>
      {(isSession1 || isSession2) && (
        <ProgressBar
          currentStep={stepIndex}
          totalSteps={steps.length}
          steps={steps}
          sessionLabel={sessionLabel}
        />
      )}

      {currentView === 'start' && (
        <StartPage
          onStartSession1={() => navigate('introduction')}
          onStartSession2={() => navigate('satellites')}
        />
      )}

      {currentView === 'introduction' && (
        <IntroductionPage
          onContinue={() => navigate('impact_terrestre')}
          onHome={handleHome}
          onBack={handleBack}
        />
      )}

      {/* Session 1 */}
      {currentView === 'impact_terrestre' && (
        <ImpactTerrestreSection
          onComplete={() => handleSectionComplete('rockets')}
          onHome={handleHome}
          onBack={handleBack}
        />
      )}
      {currentView === 'rockets' && (
        <RocketSection
          onComplete={() => handleSectionComplete('social')}
          onHome={handleHome}
          onBack={handleBack}
        />
      )}
      {currentView === 'social' && (
        <SocialReferencesSection
          onComplete={() => handleSectionComplete('session_break')}
          onHome={handleHome}
          onBack={handleBack}
        />
      )}

      {/* Fin de session 1 → retour accueil */}
      {currentView === 'session_break' && (
        <SessionBreakPage
          onContinue={handleHome}
          onHome={handleHome}
        />
      )}

      {/* Session 2 */}
      {currentView === 'satellites' && (
        <SatelliteSection
          onComplete={() => handleSectionComplete('exploration')}
          onHome={handleHome}
          onBack={handleBack}
        />
      )}
      {currentView === 'exploration' && (
        <ExplorationSection
          onComplete={() => handleSectionComplete('accompagnement')}
          onHome={handleHome}
          onBack={handleBack}
        />
      )}
      {currentView === 'accompagnement' && (
        <AccompagnementSection
          onComplete={() => handleSectionComplete('faq_questions')}
          onHome={handleHome}
          onBack={handleBack}
        />
      )}
      {currentView === 'faq_questions' && (
        <FAQQuestionsSection
          onComplete={handleSession2End}
          onHome={handleHome}
          onBack={handleBack}
        />
      )}

      {currentView === 'completed' && <CompletionPage onRestart={handleHome} />}
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
