
import React, { useState, useEffect } from 'react';
import { AppRoute, Achievement, LearningModule } from './types.ts';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { ToastProvider, useToast } from './context/ToastContext.tsx';
import { PRACTICE_LIBRARY, LEARNING_MODULES } from './constants.ts';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';

// Pages
import Welcome from './pages/Welcome.tsx';
import Login from './pages/Login.tsx';
import Register from './pages/Register.tsx';
import ResetPassword from './pages/ResetPassword.tsx';
import AssessmentIntro from './pages/AssessmentIntro.tsx';
import AssessmentReading from './pages/AssessmentReading.tsx';
import AssessmentQuiz from './pages/AssessmentQuiz.tsx';
import AssessmentResults from './pages/AssessmentResults.tsx';
import Dashboard from './pages/Dashboard.tsx';
import Library from './pages/Library.tsx';
import ReadingSession from './pages/ReadingSession.tsx';
import Quiz from './pages/Quiz.tsx'; 
import SchulteTable from './pages/SchulteTable.tsx';
import WordSpan from './pages/WordSpan.tsx';
import MemoryTraining from './pages/MemoryTraining.tsx';
import LociTraining from './pages/LociTraining.tsx';
import Settings from './pages/Settings.tsx';
import EditProfile from './pages/EditProfile.tsx';
import Rewards from './pages/Rewards.tsx';
import TrainingsList from './pages/TrainingsList.tsx';
import LearningModuleViewer from './pages/LearningModuleViewer.tsx';
import BottomNav from './components/BottomNav.tsx';
import Header from './components/Header.tsx';
import AchievementModal from './components/AchievementModal.tsx';

const MainLayout: React.FC = () => {
  const { user, loading, notifications, setNotifications, books, logReading, updateUser, logout } = useAuth();
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(AppRoute.WELCOME);
  const [currentBookId, setCurrentBookId] = useState<string>('');
  const [currentModuleId, setCurrentModuleId] = useState<string>('');
  const [assessmentData, setAssessmentData] = useState({wpm: 0, comprehension: 0});
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);

  useEffect(() => {
    if (user?.preferences?.themeColor) {
        document.documentElement.style.setProperty('--primary', user.preferences.themeColor);
    }
  }, [user?.preferences?.themeColor]);

  const navigate = (route: AppRoute, params?: any) => {
      if (route === AppRoute.LEARNING_MODULE && params?.moduleId) {
          setCurrentModuleId(params.moduleId);
      }
      setCurrentRoute(route);
      window.scrollTo(0,0);
  };

  useEffect(() => {
      const publicRoutes = [
          AppRoute.WELCOME, AppRoute.LOGIN, AppRoute.REGISTER, 
          AppRoute.RESET_PASSWORD, AppRoute.ASSESSMENT_INTRO, 
          AppRoute.ASSESSMENT_READING, AppRoute.ASSESSMENT_QUIZ, 
          AppRoute.ASSESSMENT_RESULTS
      ];
      
      if (!loading && !user && !publicRoutes.includes(currentRoute)) {
          navigate(AppRoute.WELCOME);
      }
  }, [user, loading, currentRoute]);

  useEffect(() => {
      if (!loading && user && (currentRoute === AppRoute.WELCOME || currentRoute === AppRoute.LOGIN || currentRoute === AppRoute.REGISTER)) {
          navigate(AppRoute.DASHBOARD);
      }
  }, [user, loading, currentRoute]);

  if (loading) {
      return (
        <div className="flex h-screen w-full items-center justify-center bg-[#112116]">
             <div className="flex flex-col items-center gap-4">
                 <div className="size-16 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                 <p className="text-primary text-xs font-bold uppercase tracking-widest">Sincronizando...</p>
             </div>
        </div>
      );
  }

  const showBottomNav = user && [
      AppRoute.DASHBOARD, AppRoute.LIBRARY, AppRoute.SCHULTE, 
      AppRoute.WORD_SPAN, AppRoute.MEMORY_TRAINING, AppRoute.LOCI_TRAINING, 
      AppRoute.REWARDS, AppRoute.SETTINGS, AppRoute.TRAININGS, AppRoute.READING
  ].includes(currentRoute);

  const renderContent = () => {
    switch (currentRoute) {
      case AppRoute.WELCOME: return <Welcome onNavigate={navigate} />;
      case AppRoute.LOGIN: return <Login onLogin={() => {}} onNavigate={navigate} />;
      case AppRoute.REGISTER: return <Register onRegister={() => {}} onNavigate={navigate} />;
      case AppRoute.RESET_PASSWORD: return <ResetPassword onNavigate={navigate} />;
      
      case AppRoute.ASSESSMENT_INTRO: return <AssessmentIntro onNavigate={navigate} onBack={() => user ? navigate(AppRoute.SETTINGS) : navigate(AppRoute.WELCOME)} />;
      case AppRoute.ASSESSMENT_READING: return <AssessmentReading onFinishReading={(wpm) => { setAssessmentData(p => ({...p, wpm})); navigate(AppRoute.ASSESSMENT_QUIZ); }} onBack={() => navigate(AppRoute.ASSESSMENT_INTRO)} />;
      case AppRoute.ASSESSMENT_QUIZ: return <AssessmentQuiz onFinishQuiz={(s) => { setAssessmentData(p => ({...p, comprehension: s})); navigate(AppRoute.ASSESSMENT_RESULTS); }} />;
      case AppRoute.ASSESSMENT_RESULTS: return <AssessmentResults wpm={assessmentData.wpm} comprehension={assessmentData.comprehension} onContinue={() => navigate(AppRoute.DASHBOARD)} />;
      
      case AppRoute.DASHBOARD: return user ? <> <Header user={user} notifications={notifications} onClearNotifications={() => setNotifications([])} /> <Dashboard onNavigate={navigate} /> </> : <Welcome onNavigate={navigate} />;
      case AppRoute.TRAININGS: return <TrainingsList onNavigate={navigate} onBack={() => navigate(AppRoute.DASHBOARD)} />;
      case AppRoute.LIBRARY: return <Library onNavigate={navigate} onSelectBook={(id) => { setCurrentBookId(id); navigate(AppRoute.READING); }} />;
      case AppRoute.READING: 
        const selectedBook = [...books, ...PRACTICE_LIBRARY].find(b => b.id === currentBookId);
        return (
          <ReadingSession 
            initialBook={selectedBook} 
            onBack={() => navigate(AppRoute.DASHBOARD)} 
            onComplete={async (metrics) => {
              await logReading(metrics);
            }} 
          />
        );
      
      case AppRoute.SCHULTE: return <SchulteTable onBack={() => navigate(AppRoute.DASHBOARD)} />;
      case AppRoute.WORD_SPAN: return <WordSpan onBack={() => navigate(AppRoute.DASHBOARD)} onComplete={async () => {}} />;
      case AppRoute.MEMORY_TRAINING: return <MemoryTraining onNavigate={navigate} />;
      case AppRoute.LOCI_TRAINING: return <LociTraining onBack={() => navigate(AppRoute.DASHBOARD)} />;
      
      case AppRoute.SETTINGS: return user ? (
        <Settings 
          onBack={() => navigate(AppRoute.DASHBOARD)} 
          user={user} 
          onLogout={logout} 
          onNavigate={navigate}
          onUpdatePreferences={(prefs) => updateUser({ preferences: { ...user.preferences, ...prefs } })}
        />
      ) : <Welcome onNavigate={navigate} />;
      
      case AppRoute.EDIT_PROFILE: return user ? (
        <EditProfile 
          user={user} 
          onBack={() => navigate(AppRoute.SETTINGS)} 
          onUpdateUser={updateUser} 
        />
      ) : <Welcome onNavigate={navigate} />;
      
      case AppRoute.REWARDS: return user ? <Rewards onBack={() => navigate(AppRoute.DASHBOARD)} /> : <Welcome onNavigate={navigate} />;

      case AppRoute.LEARNING_MODULE:
          const module = LEARNING_MODULES.find(m => m.id === currentModuleId);
          if (!module) return <Dashboard onNavigate={navigate} />;
          return <LearningModuleViewer module={module} onBack={(target) => navigate(target || AppRoute.DASHBOARD)} />;
      
      default: return <Welcome onNavigate={navigate} />;
    }
  };

  return (
    <ErrorBoundary>
      <div className="relative flex min-h-screen w-full flex-col max-w-md mx-auto border-x border-[#244730] shadow-2xl overflow-hidden bg-background-dark">
          {renderContent()}
          {newAchievement && <AchievementModal achievement={newAchievement} onClose={() => setNewAchievement(null)} />}
          {showBottomNav && <BottomNav currentRoute={currentRoute} onNavigate={navigate} />}
      </div>
    </ErrorBoundary>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ToastProvider>
          <AuthProvider>
              <MainLayout />
          </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
};

export default App;
