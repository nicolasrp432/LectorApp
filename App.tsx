import React, { useState, useEffect } from 'react';
import { AppRoute, Book, User, Flashcard, ReadingLog, RetentionLog, Notification, Achievement, UserPreferences } from './types';
import { RECENT_BOOKS, SUGGESTED_BOOKS, MOCK_USER_STATS, MOCK_NOTIFICATIONS, ACHIEVEMENTS_LIST, AVATARS } from './constants';
import { generateFlashcardsFromText } from './services/ai';

import Welcome from './pages/Welcome';
import Login from './pages/Login';
import AssessmentIntro from './pages/AssessmentIntro';
import Dashboard from './pages/Dashboard';
import Library from './pages/Library';
import ReadingSession from './pages/ReadingSession';
import Quiz from './pages/Quiz'; 
import SchulteTable from './pages/SchulteTable';
import MemoryTraining from './pages/MemoryTraining';
import LociTraining from './pages/LociTraining';
import Settings from './pages/Settings';
import EditProfile from './pages/EditProfile';
import BottomNav from './components/BottomNav';
import Header from './components/Header';
import AchievementModal from './components/AchievementModal';

const INITIAL_BOOKS = [...RECENT_BOOKS, ...SUGGESTED_BOOKS];

const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(AppRoute.WELCOME);
  const [user, setUser] = useState<User | null>(null);
  
  // States / "Database"
  const [books, setBooks] = useState<Book[]>(INITIAL_BOOKS);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [readingLogs, setReadingLogs] = useState<ReadingLog[]>([]);
  const [retentionLogs, setRetentionLogs] = useState<RetentionLog[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // UX States
  const [currentBookId, setCurrentBookId] = useState<string>(INITIAL_BOOKS[0].id);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);

  // Initialize Mock Data
  useEffect(() => {
    if (user && readingLogs.length === 0) {
        setReadingLogs([
            { id: '1', userId: user.id, exerciseType: 'reading_session', levelOrSpeed: 250, durationSeconds: 600, wpmCalculated: 250, comprehensionRate: 80, telCalculated: 200, timestamp: Date.now() - 86400000 * 2 },
            { id: '2', userId: user.id, exerciseType: 'schulte', levelOrSpeed: 3, durationSeconds: 15, timestamp: Date.now() - 86400000 },
        ]);
        setNotifications(MOCK_NOTIFICATIONS);
    }
  }, [user]);

  const navigate = (route: AppRoute) => {
    setCurrentRoute(route);
    window.scrollTo(0, 0);
  };

  // --- Gamification Logic ---
  const checkAchievements = (currentUser: User, updatedLogs: ReadingLog[]) => {
      const unlockedIds = new Set(currentUser.achievements.map(a => a.id));
      let newlyUnlocked: Achievement | null = null;

      // 1. First Step
      if (!unlockedIds.has('first_step') && updatedLogs.length > 0) {
          newlyUnlocked = ACHIEVEMENTS_LIST.find(a => a.id === 'first_step') || null;
      }
      // 2. Speed Demon
      if (!unlockedIds.has('speed_demon') && updatedLogs.some(l => (l.wpmCalculated || 0) > 500)) {
           newlyUnlocked = ACHIEVEMENTS_LIST.find(a => a.id === 'speed_demon') || null;
      }
      // 3. Focus Master (Schulte 5x5 under 30s implies > level 3)
      // Simplified check: just checking if they completed a level 5 Schulte
      if (!unlockedIds.has('focus_master') && updatedLogs.some(l => l.exerciseType === 'schulte' && l.levelOrSpeed === 5)) {
           newlyUnlocked = ACHIEVEMENTS_LIST.find(a => a.id === 'focus_master') || null;
      }
      // 4. Scholar (XP)
      if (!unlockedIds.has('scholar') && currentUser.stats.xp >= 1000) {
          newlyUnlocked = ACHIEVEMENTS_LIST.find(a => a.id === 'scholar') || null;
      }

      if (newlyUnlocked) {
          setNewAchievement(newlyUnlocked);
          setUser(prev => prev ? {
              ...prev,
              achievements: [...prev.achievements, newlyUnlocked!]
          } : null);
      }
  };

  // --- Auth & User Management ---
  const handleLogin = () => {
    setUser({
        id: 'user_1',
        name: 'Alex Rivera',
        email: 'alex@example.com',
        avatarUrl: AVATARS[0],
        stats: { ...MOCK_USER_STATS, xp: 800, lastActiveDate: Date.now() },
        joinedDate: Date.now() - 100000000,
        baselineWPM: 230,
        level: 'Lector Iniciado',
        preferences: {
            dailyGoalMinutes: 15,
            targetWPM: 400,
            difficultyLevel: 'Intermedio',
            notificationsEnabled: true,
            soundEnabled: false
        },
        achievements: []
    });
    navigate(AppRoute.DASHBOARD);
  };

  const handleUpdateUser = (updatedFields: Partial<User>) => {
      setUser(prev => prev ? { ...prev, ...updatedFields } : null);
  };

  const handleUpdatePreferences = (prefs: Partial<UserPreferences>) => {
      setUser(prev => prev ? { 
          ...prev, 
          preferences: { ...prev.preferences, ...prefs } 
      } : null);
  };

  const handleLogout = () => {
    setUser(null);
    navigate(AppRoute.WELCOME);
  };

  // --- Core Logic Handlers ---
  const handleImportBook = async (title: string, content: string) => {
    setIsProcessingAI(true);
    const newBook: Book = {
      id: Date.now().toString(),
      title: title,
      author: "Documento Importado",
      coverUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCnGTdGY77cGTpyrFtEjC1uOTG3Zj1mXdsGaYOGx9q46Nmk1N00JaXQHhaWkl-m7EGGO4Y4dX7gGruuPNBZWiJ2tWs9M397bWZeDY9w2nSMaL_QpsRxSq-kSsL5Si_yn8EM2dNG_uZOktYpvudDVCui_MUHwMxF8j2OELU3TkAX3ZtweNAXSrxnxUj-r8c-UQZzU7--gxOyC38MikZzdT5nlJXpodHPRry0ozc9lq6-rlwm8cv8DysWzp_7Dq2KyS-aPML8qDmgeuLM", 
      progress: 0,
      content: content,
      totalPages: Math.ceil(content.length / 2000),
      isAnalyzed: true
    };
    const newCards = await generateFlashcardsFromText(newBook.id, content);
    setBooks([newBook, ...books]);
    setFlashcards(prev => [...prev, ...newCards]);
    setCurrentBookId(newBook.id);
    setIsProcessingAI(false);
    navigate(AppRoute.READING);
    
    // Notify
    setNotifications(prev => [{
        id: Date.now().toString(),
        title: "Libro Procesado",
        message: `Se han generado tarjetas de memoria para "${title}".`,
        type: 'success',
        timestamp: Date.now(),
        isRead: false
    }, ...prev]);
  };

  const handleLogReading = (log: Omit<ReadingLog, 'id' | 'userId' | 'timestamp'>) => {
    if (!user) return;
    const newLog: ReadingLog = {
        ...log,
        id: Date.now().toString(),
        userId: user.id,
        timestamp: Date.now()
    };
    
    const updatedLogs = [...readingLogs, newLog];
    setReadingLogs(updatedLogs);
    
    // Add XP
    const xpGained = log.exerciseType === 'schulte' ? 25 : 50;
    const updatedUser = { 
        ...user, 
        stats: { ...user.stats, xp: user.stats.xp + xpGained } 
    };
    setUser(updatedUser);

    // Check Achievements
    checkAchievements(updatedUser, updatedLogs);
  };

  const handleUpdateCard = (updatedCard: Flashcard, rating: number) => {
    setFlashcards(prev => prev.map(c => c.id === updatedCard.id ? updatedCard : c));
    if (user) {
        setRetentionLogs(prev => [...prev, {
            id: Date.now().toString(),
            userId: user.id,
            flashcardId: updatedCard.id,
            rating,
            intervalDays: updatedCard.interval,
            timestamp: Date.now()
        }]);
    }
  };

  const handleBookSelect = (bookId: string) => {
    setCurrentBookId(bookId);
    navigate(AppRoute.READING);
  };

  const handleClearNotifications = () => {
      setNotifications([]);
  };

  const activeBook = books.find(b => b.id === currentBookId) || books[0];
  const showBottomNav = [AppRoute.DASHBOARD, AppRoute.LIBRARY, AppRoute.SCHULTE, AppRoute.MEMORY_TRAINING, AppRoute.SETTINGS, AppRoute.EDIT_PROFILE].includes(currentRoute) && !!user;

  const renderContent = () => {
    switch (currentRoute) {
      case AppRoute.WELCOME: return <Welcome onNavigate={navigate} />;
      case AppRoute.LOGIN: return <Login onLogin={handleLogin} onNavigate={navigate} />;
      case AppRoute.ASSESSMENT_INTRO: return <AssessmentIntro onNavigate={navigate} onBack={() => navigate(AppRoute.WELCOME)} />;
      case AppRoute.ASSESSMENT_QUIZ: return <Quiz onNavigate={navigate} onBack={() => navigate(AppRoute.ASSESSMENT_INTRO)} />;
      case AppRoute.DASHBOARD: return user ? ( <> <Header user={user} notifications={notifications} onClearNotifications={handleClearNotifications} /> <Dashboard onNavigate={navigate} logs={readingLogs} retentionLogs={retentionLogs} user={user} /> </> ) : <Login onLogin={handleLogin} onNavigate={navigate} />;
      case AppRoute.LIBRARY: return <Library onNavigate={navigate} books={books} onSelectBook={handleBookSelect} onImportBook={handleImportBook} />;
      case AppRoute.READING: return <ReadingSession book={activeBook} onBack={() => navigate(AppRoute.LIBRARY)} onComplete={handleLogReading} />;
      case AppRoute.SCHULTE: return <SchulteTable onBack={() => navigate(AppRoute.DASHBOARD)} onComplete={(metrics) => handleLogReading({ exerciseType: 'schulte', ...metrics })} />;
      case AppRoute.MEMORY_TRAINING: return <MemoryTraining onNavigate={navigate} flashcards={flashcards} onUpdateCard={handleUpdateCard} />;
      case AppRoute.LOCI_TRAINING: return <LociTraining onBack={() => navigate(AppRoute.DASHBOARD)} />;
      case AppRoute.SETTINGS: return user ? <Settings onBack={() => navigate(AppRoute.DASHBOARD)} user={user} onLogout={handleLogout} onNavigate={navigate} onUpdatePreferences={handleUpdatePreferences} /> : null;
      case AppRoute.EDIT_PROFILE: return user ? <EditProfile user={user} onBack={() => navigate(AppRoute.SETTINGS)} onUpdateUser={handleUpdateUser} /> : null;
      default: return <Welcome onNavigate={navigate} />;
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col max-w-md mx-auto border-x border-[#244730] shadow-2xl overflow-hidden bg-background-light dark:bg-background-dark">
      {renderContent()}
      
      {/* Loading Overlay */}
      {isProcessingAI && (
          <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
              <div className="size-16 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4"></div>
              <h3 className="text-xl font-bold text-white mb-2">Analizando Córtex Neural...</h3>
              <p className="text-gray-300">Extrayendo conceptos y generando nodos de memoria.</p>
          </div>
      )}

      {/* Gamification Modal */}
      {newAchievement && (
          <AchievementModal 
            achievement={newAchievement} 
            onClose={() => setNewAchievement(null)} 
          />
      )}

      {showBottomNav && <BottomNav currentRoute={currentRoute} onNavigate={navigate} />}
    </div>
  );
};

export default App;