import React, { useState, useEffect } from 'react';
import { AppRoute, Book, User, Flashcard, ReadingLog, RetentionLog, Notification, Achievement, UserPreferences, Reward } from './types';
import { SUGGESTED_BOOKS, MOCK_USER_STATS, MOCK_NOTIFICATIONS, ACHIEVEMENTS_LIST, AVATARS } from './constants';
import { generateFlashcardsFromText } from './services/ai';
import { dbService } from './services/db';
import { supabase } from './utils/supabase';

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
import BottomNav from './components/BottomNav';
import Header from './components/Header';
import AchievementModal from './components/AchievementModal';

const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(AppRoute.WELCOME);
  const [user, setUser] = useState<User | null>(null);
  
  // Data States
  const [books, setBooks] = useState<Book[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [readingLogs, setReadingLogs] = useState<ReadingLog[]>([]);
  const [retentionLogs, setRetentionLogs] = useState<RetentionLog[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // UX States
  const [currentBookId, setCurrentBookId] = useState<string>('');
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);
  const [assessmentData, setAssessmentData] = useState<{wpm: number, comprehension: number}>({ wpm: 0, comprehension: 0 });

  // 1. Session & Auth Management
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
        if (session && session.user) {
            loadUser(session.user.id, session.user.email);
        }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session && session.user) {
             if (!user || user.id !== session.user.id) {
                 loadUser(session.user.id, session.user.email);
             }
        } else {
            setUser(null);
            setBooks([]);
            setReadingLogs([]);
            setFlashcards([]);
            setCurrentRoute(AppRoute.WELCOME);
        }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Load Full User Data
  const loadUser = async (userId: string, userEmail?: string) => {
      let profile = await dbService.getUserProfile(userId);
      
      if (!profile && userEmail) {
          const defaultUser: User = {
            id: userId,
            name: userEmail.split('@')[0], 
            email: userEmail,
            avatarUrl: AVATARS[0],
            stats: { ...MOCK_USER_STATS, xp: 0, tel: 200, streak: 1, lastActiveDate: Date.now(), maxSchulteLevel: 1, maxWordSpan: 3 },
            joinedDate: Date.now(),
            baselineWPM: 200,
            level: "Lector Iniciado",
            preferences: { dailyGoalMinutes: 15, targetWPM: 300, difficultyLevel: 'Básico', notificationsEnabled: true, soundEnabled: false },
            achievements: [],
            unlockedRewards: []
          };
          await dbService.createUserProfile(defaultUser);
          profile = defaultUser;
      }

      if (!profile) return;
      
      setUser(profile);
      
      const logs = await dbService.getReadingLogs(userId);
      setReadingLogs(logs);

      // Load Retention Logs
      const userBooks = await dbService.getUserBooks(userId);
      if (userBooks.length > 0) {
          setBooks(userBooks);
          setCurrentBookId(userBooks[0].id);
      } else {
          setBooks(SUGGESTED_BOOKS); 
      }

      const cards = await dbService.getFlashcards(userId);
      setFlashcards(cards);
      setNotifications(MOCK_NOTIFICATIONS);
      
      if (currentRoute === AppRoute.WELCOME || currentRoute === AppRoute.LOGIN || currentRoute === AppRoute.REGISTER) {
          setCurrentRoute(AppRoute.DASHBOARD);
      }
  };

  const navigate = (route: AppRoute) => {
    setCurrentRoute(route);
    window.scrollTo(0, 0);
  };

  // --- Logic ---
  const handlePurchaseReward = (reward: Reward) => {
      if (!user) return;
      if (user.stats.xp < reward.cost) return;

      const updatedUser = {
          ...user,
          stats: {
              ...user.stats,
              xp: user.stats.xp - reward.cost
          },
          unlockedRewards: [...(user.unlockedRewards || []), reward.id]
      };

      // If avatar reward, equip immediately for gratification
      if (reward.type === 'avatar') {
          updatedUser.avatarUrl = reward.value;
      }

      setUser(updatedUser);
      dbService.createUserProfile(updatedUser);
      
      // Show notification
      setNotifications(prev => [{
          id: Date.now().toString(),
          title: "¡Compra Exitosa!",
          message: `Has adquirido: ${reward.title}`,
          type: "success",
          timestamp: Date.now(),
          isRead: false
      }, ...prev]);
  };

  const checkAchievements = (currentUser: User, updatedLogs: ReadingLog[]) => {
      const unlockedIds = new Set(currentUser.achievements.map(a => a.id));
      let newlyUnlocked: Achievement | null = null;

      if (!unlockedIds.has('first_step') && updatedLogs.length > 0) {
          newlyUnlocked = ACHIEVEMENTS_LIST.find(a => a.id === 'first_step') || null;
      }
      if (!unlockedIds.has('speed_demon') && updatedLogs.some(l => (l.wpmCalculated || 0) > 500)) {
           newlyUnlocked = ACHIEVEMENTS_LIST.find(a => a.id === 'speed_demon') || null;
      }
      if (!unlockedIds.has('focus_master') && updatedLogs.some(l => l.exerciseType === 'schulte' && l.levelOrSpeed === 5)) {
           newlyUnlocked = ACHIEVEMENTS_LIST.find(a => a.id === 'focus_master') || null;
      }
      
      if (newlyUnlocked) {
          setNewAchievement(newlyUnlocked);
          const updatedAchievements = [...currentUser.achievements, newlyUnlocked!];
          setUser(prev => prev ? { ...prev, achievements: updatedAchievements } : null);
          dbService.createUserProfile({ ...currentUser, achievements: updatedAchievements });
      }
  };

  const handleRegister = async (name: string, email: string) => {
      const session = await supabase.auth.getSession();
      if (!session.data.session) return; 

      const userId = session.data.session.user.id;
      const tel = Math.round(assessmentData.wpm * (assessmentData.comprehension / 100));
      
      const newUser: User = {
        id: userId,
        name: name,
        email: email,
        avatarUrl: AVATARS[0],
        stats: { ...MOCK_USER_STATS, xp: 0, tel: tel, streak: 1, lastActiveDate: Date.now(), maxSchulteLevel: 1, maxWordSpan: 3 },
        joinedDate: Date.now(),
        baselineWPM: assessmentData.wpm,
        level: "Lector Iniciado",
        preferences: { dailyGoalMinutes: 15, targetWPM: 400, difficultyLevel: 'Intermedio', notificationsEnabled: true, soundEnabled: false },
        achievements: [],
        unlockedRewards: []
    };
    
    await dbService.createUserProfile(newUser);
    loadUser(userId, email); 
    navigate(AppRoute.DASHBOARD);
  };

  const handleLogin = () => {
    // Auth handled by useEffect
  };

  const handleUpdateUser = (updatedFields: Partial<User>) => {
      setUser(prev => {
          if(!prev) return null;
          const updated = { ...prev, ...updatedFields };
          // Creating a new object reference to ensure React detects change
          const newUserState = JSON.parse(JSON.stringify(updated));
          dbService.createUserProfile(newUserState); 
          return newUserState;
      });
  };

  const handleUpdatePreferences = (prefs: Partial<UserPreferences>) => {
      setUser(prev => {
          if (!prev) return null;
          const updated = { ...prev, preferences: { ...prev.preferences, ...prefs } };
          dbService.updateUserPreferences(prev.id, updated.preferences);
          return updated;
      });
  };

  const handleLogReading = async (log: Omit<ReadingLog, 'id' | 'userId' | 'timestamp'>) => {
    if (!user) return;
    
    const now = Date.now();
    const newLog: ReadingLog = {
        ...log,
        id: 'temp_id', 
        userId: user.id,
        timestamp: now
    };
    
    const updatedLogs = [...readingLogs, newLog];
    setReadingLogs(updatedLogs);
    
    const xpGained = log.exerciseType === 'schulte' ? 25 : (log.exerciseType === 'word_span' ? 15 : 50);
    
    let updatedStats = { ...user.stats };
    updatedStats.xp += xpGained;
    
    const lastActive = new Date(updatedStats.lastActiveDate);
    const today = new Date(now);
    const isSameDay = lastActive.getDate() === today.getDate() && 
                      lastActive.getMonth() === today.getMonth() &&
                      lastActive.getFullYear() === today.getFullYear();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = lastActive.getDate() === yesterday.getDate() &&
                        lastActive.getMonth() === yesterday.getMonth() &&
                        lastActive.getFullYear() === yesterday.getFullYear();
    
    if (!isSameDay) {
        if (isYesterday) {
            updatedStats.streak += 1; 
        } else {
            updatedStats.streak = 1; 
        }
    }
    updatedStats.lastActiveDate = now;

    if (log.exerciseType === 'schulte') {
        if (log.levelOrSpeed > (user.stats.maxSchulteLevel || 1)) {
            updatedStats.maxSchulteLevel = log.levelOrSpeed;
        }
    }
    if (log.exerciseType === 'word_span') {
        if (log.levelOrSpeed > (user.stats.maxWordSpan || 3)) {
            updatedStats.maxWordSpan = log.levelOrSpeed;
        }
    }
    if (log.telCalculated && log.telCalculated > 0) {
        updatedStats.tel = log.telCalculated;
    }

    const updatedUser: User = { ...user, stats: updatedStats };
    setUser(updatedUser);
    
    await dbService.addReadingLog(newLog); 
    await dbService.updateUserStats(user.id, updatedStats);

    checkAchievements(updatedUser, updatedLogs);
  };

  const handleImportBook = async (title: string, content: string) => {
      if (!user) return;
      setIsProcessingAI(true);
      
      const newBook: Book = {
          id: '', 
          userId: user.id,
          title,
          author: 'Documento Importado',
          coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCnGTdGY77cGTpyrFtEjC1uOTG3Zj1mXdsGaYOGx9q46Nmk1N00JaXQHhaWkl-m7EGGO4Y4dX7gGruuPNBZWiJ2tWs9M397bWZeDY9w2nSMaL_QpsRxSq-kSsL5Si_yn8EM2dNG_uZOktYpvudDVCui_MUHwMxF8j2OELU3TkAX3ZtweNAXSrxnxUj-r8c-UQZzU7--gxOyC38MikZzdT5nlJXpodHPRry0ozc9lq6-rlwm8cv8DysWzp_7Dq2KyS-aPML8qDmgeuLM',
          content,
          progress: 0,
          isAnalyzed: true
      };

      const bookId = await dbService.addUserBook(newBook);
      
      if(bookId) {
          const createdBook = { ...newBook, id: bookId };
          setBooks(prev => [createdBook, ...prev]);
          setCurrentBookId(bookId);
          
          const newCards = await generateFlashcardsFromText(bookId, content);
          const cardsWithUser = newCards.map(c => ({ ...c, userId: user.id }));
          
          await dbService.addFlashcards(cardsWithUser);
          setFlashcards(prev => [...prev, ...cardsWithUser]);
          
          setNotifications(prev => [{
              id: Date.now().toString(),
              title: "Flashcards Generadas",
              message: `Se crearon ${newCards.length} conceptos clave de "${title}".`,
              type: "success",
              timestamp: Date.now(),
              isRead: false
          }, ...prev]);

          navigate(AppRoute.READING);
      }
      setIsProcessingAI(false);
  };

  const handleUpdateCard = async (updatedCard: Flashcard) => {
      if(!user) return;
      setFlashcards(prev => prev.map(c => c.id === updatedCard.id ? updatedCard : c));
      
      const retentionLog: RetentionLog = {
          id: 'temp', 
          userId: user.id,
          flashcardId: updatedCard.id,
          rating: 4, 
          intervalDays: updatedCard.interval,
          timestamp: Date.now()
      };
      setRetentionLogs(prev => [...prev, retentionLog]);

      await dbService.updateFlashcard(updatedCard);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const showBottomNav = [AppRoute.DASHBOARD, AppRoute.LIBRARY, AppRoute.SCHULTE, AppRoute.WORD_SPAN, AppRoute.MEMORY_TRAINING, AppRoute.LOCI_TRAINING, AppRoute.SETTINGS, AppRoute.EDIT_PROFILE, AppRoute.REWARDS].includes(currentRoute) && !!user;
  const activeBook = books.find(b => b.id === currentBookId) || books[0];

  const renderContent = () => {
    switch (currentRoute) {
      case AppRoute.WELCOME: return <Welcome onNavigate={navigate} />;
      case AppRoute.LOGIN: return <Login onLogin={handleLogin} onNavigate={navigate} />;
      case AppRoute.REGISTER: return <Register onRegister={handleRegister} onNavigate={navigate} />;
      case AppRoute.ASSESSMENT_INTRO: return <AssessmentIntro onNavigate={navigate} onBack={() => navigate(AppRoute.WELCOME)} />;
      case AppRoute.ASSESSMENT_READING: return <AssessmentReading onFinishReading={(wpm) => { setAssessmentData(p => ({...p, wpm})); navigate(AppRoute.ASSESSMENT_QUIZ); }} onBack={() => navigate(AppRoute.ASSESSMENT_INTRO)} />;
      case AppRoute.ASSESSMENT_QUIZ: return <AssessmentQuiz onFinishQuiz={(s) => { setAssessmentData(p => ({...p, comprehension: s})); navigate(AppRoute.ASSESSMENT_RESULTS); }} />;
      case AppRoute.ASSESSMENT_RESULTS: return <AssessmentResults wpm={assessmentData.wpm} comprehension={assessmentData.comprehension} onContinue={() => navigate(AppRoute.REGISTER)} />;
      
      case AppRoute.DASHBOARD: return user ? ( <> <Header user={user} notifications={notifications} onClearNotifications={() => setNotifications([])} /> <Dashboard onNavigate={navigate} logs={readingLogs} retentionLogs={retentionLogs} user={user} /> </> ) : <Login onLogin={handleLogin} onNavigate={navigate} />;
      case AppRoute.LIBRARY: return <Library onNavigate={navigate} books={books} onSelectBook={(id) => { setCurrentBookId(id); navigate(AppRoute.READING); }} onImportBook={handleImportBook} />;
      case AppRoute.READING: return <ReadingSession book={activeBook} onBack={() => navigate(AppRoute.LIBRARY)} onComplete={handleLogReading} />;
      
      case AppRoute.SCHULTE: return <SchulteTable onBack={() => navigate(AppRoute.DASHBOARD)} onComplete={(m) => handleLogReading({ exerciseType: 'schulte', ...m })} savedMaxLevel={user?.stats.maxSchulteLevel || 1} />;
      case AppRoute.WORD_SPAN: return <WordSpan onBack={() => navigate(AppRoute.DASHBOARD)} onComplete={(score) => handleLogReading({ exerciseType: 'word_span', levelOrSpeed: score, durationSeconds: 60, comprehensionRate: 100 })} savedMaxSpan={user?.stats.maxWordSpan || 3} />;
      
      case AppRoute.MEMORY_TRAINING: return <MemoryTraining onNavigate={navigate} flashcards={flashcards} onUpdateCard={handleUpdateCard} />;
      // LOCI Integration
      case AppRoute.LOCI_TRAINING: return <LociTraining onBack={() => navigate(AppRoute.DASHBOARD)} onComplete={(score) => handleLogReading({ exerciseType: 'schulte', levelOrSpeed: score, durationSeconds: 120, comprehensionRate: score })} />;
      
      case AppRoute.SETTINGS: return user ? <Settings onBack={() => navigate(AppRoute.DASHBOARD)} user={user} onLogout={handleLogout} onNavigate={navigate} onUpdatePreferences={handleUpdatePreferences} /> : null;
      case AppRoute.EDIT_PROFILE: return user ? <EditProfile user={user} onBack={() => navigate(AppRoute.SETTINGS)} onUpdateUser={handleUpdateUser} /> : null;
      case AppRoute.REWARDS: return user ? <Rewards onBack={() => navigate(AppRoute.DASHBOARD)} user={user} onPurchase={handlePurchaseReward} /> : null;

      default: return <Welcome onNavigate={navigate} />;
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col max-w-md mx-auto border-x border-[#244730] shadow-2xl overflow-hidden bg-background-light dark:bg-background-dark">
      {renderContent()}
      {isProcessingAI && (
          <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
              <div className="size-16 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4"></div>
              <h3 className="text-xl font-bold text-white mb-2">IA Trabajando...</h3>
              <p className="text-gray-300">Generando Flashcards del texto...</p>
          </div>
      )}
      {newAchievement && (
          <AchievementModal achievement={newAchievement} onClose={() => setNewAchievement(null)} />
      )}
      {showBottomNav && <BottomNav currentRoute={currentRoute} onNavigate={navigate} />}
    </div>
  );
};

export default App;