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
import { EntreprisesSpatialesSection } from './components/EntreprisesSpatialesSection';
import { AccompagnementSection } from './components/AccompagnementSection';
import { FAQQuestionsSection } from './components/FAQQuestionsSection';
import { CompletionPage } from './components/CompletionPage';
import type { Section } from './lib/supabase';

const sectionOrder: Section[] = [
  'start', 'introduction',
  'impact_terrestre', 'rockets', 'social',
  'session_break',
  'satellites', 'exploration', 'entreprises_spatiales', 'accompagnement', 'faq_questions',
  'completed',
];

const SESSION1_SECTIONS: Section[] = ['introduction', 'impact_terrestre', 'rockets', 'social', 'session_break'];
const SESSION2_SECTIONS: Section[] = ['satellites', 'exploration', 'entreprises_spatiales', 'accompagnement', 'faq_questions'];

function AppContent() {
  const { session, loading, updateSection, completeSection, markSession1Complete, markSession2Complete } = useSession();
  const [currentView, setCurrentView] = useState<Section>('start');

  useEffect(() => {
    if (session && session.current_section) {
      setCurrentView(session.current_section);
    }
  }, [session]);


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

  // Smart resume: goes back to the last section visited within the session,
  // or to the session's entry point when no in-progress section is found.
  const handleStartSession1 = async () => {
    const resumeTo = session && SESSION1_SECTIONS.includes(session.current_section)
      ? session.current_section
      : 'introduction';
    await navigate(resumeTo);
  };

  const handleStartSession2 = async () => {
    const resumeTo = session && SESSION2_SECTIONS.includes(session.current_section)
      ? session.current_section
      : 'satellites';
    await navigate(resumeTo);
  };

  // Séance 1 done: mark completion then go home so the student can start séance 2
  const handleSession1End = async () => {
    await markSession1Complete();
    await navigate('start');
  };

  // Séance 2 done: mark séance 2 (and full journey) complete
  const handleSession2End = async () => {
    await completeSection(currentView);
    await markSession2Complete();
    await navigate('completed');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deepspace">
      {currentView === 'start' && (
        <StartPage
          onStartSession1={handleStartSession1}
          onStartSession2={handleStartSession2}
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

      {/* Fin de session 1 → marque séance 1 complète + retour accueil */}
      {currentView === 'session_break' && (
        <SessionBreakPage
          onContinue={handleSession1End}
          onHome={handleSession1End}
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
          onComplete={() => handleSectionComplete('entreprises_spatiales')}
          onHome={handleHome}
          onBack={handleBack}
        />
      )}
      {currentView === 'entreprises_spatiales' && (
        <EntreprisesSpatialesSection
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
    </div>
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
