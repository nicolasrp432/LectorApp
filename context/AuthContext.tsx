
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, ReadingLog, Book, Flashcard, Notification, Achievement, Reward } from '../types';
import { supabase } from '../utils/supabase';
import { dbService } from '../services/db';
import { MOCK_USER_STATS, SUGGESTED_BOOKS, MOCK_NOTIFICATIONS, ACHIEVEMENTS_LIST, AVATARS } from '../constants';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  books: Book[];
  flashcards: Flashcard[];
  readingLogs: ReadingLog[];
  notifications: Notification[];
  refreshUser: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  logReading: (log: Omit<ReadingLog, 'id' | 'userId' | 'timestamp'>) => Promise<void>;
  addBook: (book: Book) => Promise<string | null>;
  addFlashcards: (cards: Flashcard[]) => Promise<void>;
  updateFlashcard: (card: Flashcard) => Promise<void>;
  equipReward: (reward: Reward) => Promise<void>;
  loginAsGuest: () => void;
  logout: () => Promise<void>;
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [books, setBooks] = useState<Book[]>([]);
  const [readingLogs, setReadingLogs] = useState<ReadingLog[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    let mounted = true;
    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          if (error.message.includes('Refresh Token Not Found') || error.message.includes('invalid_refresh_token')) {
            await supabase.auth.signOut();
          }
          if (mounted) setLoading(false);
          return;
        }
        if (session?.user && mounted) {
          await loadUserData(session.user.id, session.user.email);
        } else {
          if (mounted) {
            setLoading(false);
            setBooks(SUGGESTED_BOOKS);
          }
        }
      } catch (err) {
        if (mounted) setLoading(false);
      }
    };
    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      if (event === 'SIGNED_IN' && session?.user) {
        if (!user || user.id !== session.user.id) {
          await loadUserData(session.user.id, session.user.email);
        }
      } else if (event === 'SIGNED_OUT') {
        if (user?.id !== 'guest') {
            setUser(null);
            setBooks(SUGGESTED_BOOKS);
            setReadingLogs([]);
            setFlashcards([]);
            setLoading(false);
        }
      }
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const loadUserData = async (userId: string, email?: string) => {
    try {
      setLoading(true);
      let profile = await dbService.getUserProfile(userId);
      if (!profile && email) {
        const defaultUser: User = {
          id: userId,
          name: email.split('@')[0],
          email: email,
          avatarUrl: AVATARS[0],
          stats: { streak: 1, tel: 200, xp: 0, lastActiveDate: Date.now(), maxSchulteLevel: 1, maxWordSpan: 3 },
          joinedDate: Date.now(),
          baselineWPM: 200,
          level: "Lector Iniciado",
          preferences: {
            dailyGoalMinutes: 15,
            targetWPM: 300,
            difficultyLevel: 'Básico',
            notificationsEnabled: true,
            soundEnabled: false,
            unlockedRewards: []
          },
          achievements: []
        };
        await dbService.createUserProfile(defaultUser);
        profile = defaultUser;
      }
      if (profile) {
        // Validar racha al cargar
        const now = new Date();
        const lastActive = new Date(profile.stats.lastActiveDate);
        const diffDays = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays > 1) {
            profile.stats.streak = 0; 
        }

        setUser(profile);
        const [fetchedLogs, fetchedBooks, fetchedCards] = await Promise.all([
          dbService.getReadingLogs(userId),
          dbService.getUserBooks(userId),
          dbService.getFlashcards(userId)
        ]);
        setReadingLogs(fetchedLogs);
        setBooks(fetchedBooks.length > 0 ? fetchedBooks : SUGGESTED_BOOKS);
        setFlashcards(fetchedCards);
        setNotifications(MOCK_NOTIFICATIONS);
      }
    } catch (err) {
      console.error("Error loading user data:", err);
    } finally {
      setLoading(false);
    }
  };

  const loginAsGuest = () => {
    setLoading(true);
    const guestUser: User = {
        id: 'guest',
        name: 'Invitado',
        email: 'guest@lector.app',
        avatarUrl: AVATARS[1],
        stats: { streak: 1, tel: 200, xp: 100, lastActiveDate: Date.now(), maxSchulteLevel: 1, maxWordSpan: 3 },
        joinedDate: Date.now(),
        baselineWPM: 200,
        level: "Explorador",
        preferences: { dailyGoalMinutes: 15, targetWPM: 250, difficultyLevel: 'Básico', notificationsEnabled: false, soundEnabled: true, unlockedRewards: [] },
        achievements: []
    };
    setUser(guestUser);
    setBooks(SUGGESTED_BOOKS);
    setReadingLogs([]);
    setFlashcards([]);
    setNotifications([{ id: 'g1', title: 'Modo Invitado', message: 'Los datos no se guardarán al salir.', type: 'info', timestamp: Date.now(), isRead: false }]);
    setLoading(false);
  };

  const refreshUser = async () => {
    if (user && user.id !== 'guest') await loadUserData(user.id, user.email);
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    if (user.id === 'guest') return;
    if (updates.stats) await dbService.updateUserStats(user.id, updates.stats);
    if (updates.preferences) await dbService.updateUserPreferences(user.id, updates.preferences);
    if (updates.achievements) {
        // Opcional: Persistir logros en una tabla separada o como JSON en perfil
        await supabase.from('profiles').update({ achievements: updates.achievements }).eq('id', user.id);
    }
  };

  const equipReward = async (reward: Reward) => {
      if (!user) return;
      let updates: Partial<User> = {};
      if (reward.type === 'theme') {
          updates = { preferences: { ...user.preferences, themeColor: reward.value } };
      } else if (reward.type === 'avatar') {
          updates = { avatarUrl: reward.value };
      }
      await updateUser(updates);
  };

  const logReading = async (logData: Omit<ReadingLog, 'id' | 'userId' | 'timestamp'>) => {
    if (!user) return;
    const now = new Date();
    const lastActive = new Date(user.stats.lastActiveDate);
    
    // Lógica de racha persistente
    let newStreak = user.stats.streak;
    const isSameDay = now.toDateString() === lastActive.toDateString();
    const isNextDay = new Date(now.getTime() - 86400000).toDateString() === lastActive.toDateString();

    if (!isSameDay) {
        if (isNextDay) {
            newStreak += 1;
        } else {
            newStreak = 1;
        }
    }

    const newLog: ReadingLog = { ...logData, id: `temp-${now.getTime()}`, userId: user.id, timestamp: now.getTime() };
    setReadingLogs(prev => [...prev, newLog]);

    // Cálculo de XP por tipo de ejercicio
    let xpGained = 10;
    if (logData.exerciseType === 'schulte') xpGained = 25;
    else if (logData.exerciseType === 'word_span') xpGained = 30;
    else if (logData.exerciseType === 'loci') xpGained = 50;
    else if (logData.telCalculated) xpGained = Math.round(logData.telCalculated / 10);

    const updatedStats = { 
        ...user.stats, 
        xp: user.stats.xp + xpGained, 
        lastActiveDate: now.getTime(),
        streak: newStreak
    };
    
    if (logData.telCalculated && logData.telCalculated > (user.stats.tel || 0)) {
       updatedStats.tel = logData.telCalculated;
    }
    if (logData.exerciseType === 'schulte' && logData.levelOrSpeed > (user.stats.maxSchulteLevel || 1)) {
        updatedStats.maxSchulteLevel = Math.min(9, logData.levelOrSpeed);
    }
    if (logData.exerciseType === 'word_span' && logData.levelOrSpeed > (user.stats.maxWordSpan || 3)) {
        updatedStats.maxWordSpan = logData.levelOrSpeed;
    }
    
    const newAchievements = checkAchievements({ ...user, stats: updatedStats }, [...readingLogs, newLog], newStreak);
    
    await updateUser({ 
        stats: updatedStats,
        achievements: newAchievements
    });

    if (user.id !== 'guest') {
        await dbService.addReadingLog(newLog);
    }
  };

  const checkAchievements = (currentUser: User, currentLogs: ReadingLog[], streak: number) => {
      let acts = [...currentUser.achievements];
      const getAch = (id: string) => ACHIEVEMENTS_LIST.find(a => a.id === id);

      // 1. Primer Paso
      if (!acts.some(a => a.id === 'first_step') && currentLogs.length > 0) {
          const ach = getAch('first_step');
          if (ach) acts.push({ ...ach, unlockedAt: Date.now() });
      }

      // 2. Demonios Veloz (> 500 WPM)
      if (!acts.some(a => a.id === 'speed_demon')) {
          const hasSpeed = currentLogs.some(l => (l.wpmCalculated || 0) >= 500);
          if (hasSpeed) {
              const ach = getAch('speed_demon');
              if (ach) acts.push({ ...ach, unlockedAt: Date.now() });
          }
      }

      // 3. Maestro del Foco (Schulte Lvl 5)
      if (!acts.some(a => a.id === 'focus_master') && (currentUser.stats.maxSchulteLevel || 0) >= 5) {
          const ach = getAch('focus_master');
          if (ach) acts.push({ ...ach, unlockedAt: Date.now() });
      }

      // 4. Rachas (3 y 7 días)
      if (!acts.some(a => a.id === 'streak_3') && streak >= 3) {
          const ach = getAch('streak_3');
          if (ach) acts.push({ ...ach, unlockedAt: Date.now() });
      }
      if (!acts.some(a => a.id === 'streak_7') && streak >= 7) {
          const ach = getAch('streak_7');
          if (ach) acts.push({ ...ach, unlockedAt: Date.now() });
      }

      // 5. Cerebro de Oro (5000 XP)
      if (!acts.some(a => a.id === 'gold_brain') && currentUser.stats.xp >= 5000) {
          const ach = getAch('gold_brain');
          if (ach) acts.push({ ...ach, unlockedAt: Date.now() });
      }

      // 6. Memoria Infinita (Word Span Lvl 10)
      if (!acts.some(a => a.id === 'span_god') && (currentUser.stats.maxWordSpan || 0) >= 10) {
          const ach = getAch('span_god');
          if (ach) acts.push({ ...ach, unlockedAt: Date.now() });
      }

      return acts;
  };

  const addBook = async (book: Book) => {
      if (!user) return null;
      if (user.id === 'guest') {
          const mockId = `guest-book-${Date.now()}`;
          setBooks(prev => [{...book, id: mockId}, ...prev]);
          return mockId;
      }
      const id = await dbService.addUserBook(book);
      if (id) {
          setBooks(prev => [{...book, id, category: 'user'}, ...prev]);
      }
      return id;
  };

  const addFlashcards = async (cards: Flashcard[]) => {
      setFlashcards(prev => [...prev, ...cards]);
      if (user && user.id !== 'guest') {
         await dbService.addFlashcards(cards);
      }
  };

  const updateFlashcard = async (card: Flashcard) => {
      setFlashcards(prev => prev.map(c => c.id === card.id ? card : c));
      if (user && user.id !== 'guest') {
          await dbService.updateFlashcard(card);
      }
  };

  const logout = async () => {
    if (user?.id !== 'guest') await supabase.auth.signOut();
    setUser(null);
    setBooks(SUGGESTED_BOOKS);
    setReadingLogs([]);
  };

  return (
    <AuthContext.Provider value={{
      user, loading, books, flashcards, readingLogs, notifications,
      refreshUser, updateUser, logReading, addBook, addFlashcards, updateFlashcard, equipReward, loginAsGuest, logout, setNotifications
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
