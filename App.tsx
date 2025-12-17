
import React, { useState, useEffect } from 'react';
import { AppRoute, Achievement } from './types';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { PRACTICE_LIBRARY } from './constants';

// Pages
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Register from './pages/Register';
import AssessmentIntro from './pages/AssessmentIntro';
import AssessmentReading from './pages/AssessmentReading';
import AssessmentQuiz from './pages/AssessmentQuiz';
import AssessmentResults from './pages/AssessmentResults';
import Dashboard from './pages/Dashboard';
import Library from './pages/Library';
import ReadingSession from './pages/ReadingSession';
import Quiz from './pages/Quiz'; 
import SchulteTable from './pages/SchulteTable';
import WordSpan from './pages/WordSpan';
import MemoryTraining from './pages/MemoryTraining';
import LociTraining from './pages/LociTraining';
import Settings from './pages/Settings';
import EditProfile from './pages/EditProfile';
import Rewards from './pages/Rewards';
import TrainingsList from './pages/TrainingsList'; // New
import BottomNav from './components/BottomNav';
import Header from './components/Header';
import AchievementModal from './components/AchievementModal';

const MainLayout: React.FC = () => {
  const { user, loading, notifications, setNotifications, books, flashcards, updateFlashcard, logReading, updateUser, logout } = useAuth();
  const { showToast } = useToast();
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(AppRoute.WELCOME);
  const [currentBookId, setCurrentBookId] = useState<string>('');
  const [assessmentData, setAssessmentData] = useState({wpm: 0, comprehension: 0});
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);

  // Simple Router (Navigate)
  const navigate = (route: AppRoute) => {
      setCurrentRoute(route);
      window.scrollTo(0,0);
  };

  // Redirect if logged in on init
  useEffect(() => {
      if (!loading && user && (currentRoute === AppRoute.WELCOME || currentRoute === AppRoute.LOGIN)) {
          navigate(AppRoute.DASHBOARD);
      }
  }, [user, loading]);

  // Redirect to Welcome on Logout (Fix for blank screen)
  useEffect(() => {
      if (!loading && !user && currentRoute !== AppRoute.LOGIN && currentRoute !== AppRoute.REGISTER && currentRoute !== AppRoute.WELCOME) {
          navigate(AppRoute.WELCOME);
      }
  }, [user, loading, currentRoute]);

  if (loading) {
      return (
        <div className="flex h-screen w-full items-center justify-center bg-[#112116]">
             <div className="size-16 rounded-full border-4 border-[#19e65e] border-t-transparent animate-spin"></div>
        </div>
      );
  }

  const showBottomNav = user && [
      AppRoute.DASHBOARD, AppRoute.LIBRARY, AppRoute.SCHULTE, 
      AppRoute.WORD_SPAN, AppRoute.MEMORY_TRAINING, AppRoute.LOCI_TRAINING, 
      AppRoute.REWARDS, AppRoute.SETTINGS, AppRoute.TRAININGS
  ].includes(currentRoute);

  const renderContent = () => {
    switch (currentRoute) {
      case AppRoute.WELCOME: return <Welcome onNavigate={navigate} />;
      case AppRoute.LOGIN: return <Login onLogin={() => {}} onNavigate={navigate} />;
      case AppRoute.REGISTER: return <Register onRegister={() => {}} onNavigate={navigate} />;
      
      // Assessment Flow
      case AppRoute.ASSESSMENT_INTRO: return <AssessmentIntro onNavigate={navigate} onBack={() => navigate(AppRoute.WELCOME)} />;
      case AppRoute.ASSESSMENT_READING: return <AssessmentReading onFinishReading={(wpm) => { setAssessmentData(p => ({...p, wpm})); navigate(AppRoute.ASSESSMENT_QUIZ); }} onBack={() => navigate(AppRoute.ASSESSMENT_INTRO)} />;
      case AppRoute.ASSESSMENT_QUIZ: return <AssessmentQuiz onFinishQuiz={(s) => { setAssessmentData(p => ({...p, comprehension: s})); navigate(AppRoute.ASSESSMENT_RESULTS); }} />;
      case AppRoute.ASSESSMENT_RESULTS: return <AssessmentResults wpm={assessmentData.wpm} comprehension={assessmentData.comprehension} onContinue={() => navigate(AppRoute.REGISTER)} />;
      
      // Main App
      case AppRoute.DASHBOARD: return user ? <> <Header user={user} notifications={notifications} onClearNotifications={() => setNotifications([])} /> <Dashboard onNavigate={navigate} /> </> : <Login onLogin={() => {}} onNavigate={navigate} />;
      case AppRoute.TRAININGS: return <TrainingsList onNavigate={navigate} onBack={() => navigate(AppRoute.DASHBOARD)} />;
      case AppRoute.LIBRARY: return <Library onNavigate={navigate} onSelectBook={(id) => { setCurrentBookId(id); navigate(AppRoute.READING); }} />;
      case AppRoute.READING: 
        // Search in User Books OR Practice Library
        const selectedBook = books.find(b => b.id === currentBookId) || PRACTICE_LIBRARY.find(b => b.id === currentBookId) || books[0];
        
        if (!selectedBook) return <Library onNavigate={navigate} onSelectBook={(id) => { setCurrentBookId(id); navigate(AppRoute.READING); }} />;
        return (
          <ReadingSession 
            book={selectedBook} 
            onBack={() => navigate(AppRoute.LIBRARY)} 
            onComplete={async (metrics) => {
              await logReading(metrics);
            }} 
          />
        );
      
      // Exercises
      case AppRoute.SCHULTE: return <SchulteTable onBack={() => navigate(AppRoute.DASHBOARD)} />;
      case AppRoute.WORD_SPAN: return (
        <WordSpan 
          onBack={() => navigate(AppRoute.DASHBOARD)} 
          onComplete={async (score) => {
            // Logic handled inside WordSpan, but we can add global hooks here if needed
          }}
        />
      );
      case AppRoute.MEMORY_TRAINING: return (
        <MemoryTraining 
          onNavigate={navigate} 
          flashcards={flashcards}
          onUpdateCard={updateFlashcard}
        />
      );
      case AppRoute.LOCI_TRAINING: return <LociTraining onBack={() => navigate(AppRoute.DASHBOARD)} />;
      
      // Misc
      case AppRoute.SETTINGS: return user ? (
        <Settings 
          onBack={() => navigate(AppRoute.DASHBOARD)} 
          user={user} 
          onLogout={logout} 
          onNavigate={navigate}
          onUpdatePreferences={(prefs) => updateUser({ preferences: { ...user.preferences, ...prefs } })}
        />
      ) : null;
      case AppRoute.EDIT_PROFILE: return user ? (
        <EditProfile 
          user={user} 
          onBack={() => navigate(AppRoute.SETTINGS)} 
          onUpdateUser={updateUser} 
        />
      ) : null;
      
      case AppRoute.REWARDS: return user ? (
        <Rewards 
          onBack={() => navigate(AppRoute.DASHBOARD)} 
        />
      ) : null;

      default: return <Welcome onNavigate={navigate} />;
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col max-w-md mx-auto border-x border-[#244730] shadow-2xl overflow-hidden bg-background-light dark:bg-background-dark">
        {renderContent()}
        {newAchievement && <AchievementModal achievement={newAchievement} onClose={() => setNewAchievement(null)} />}
        {showBottomNav && <BottomNav currentRoute={currentRoute} onNavigate={navigate} />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ToastProvider>
        <AuthProvider>
            <MainLayout />
        </AuthProvider>
    </ToastProvider>
  );
};

export default App;
