
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { User, ReadingLog, Book, Flashcard, Notification, Achievement, Reward, UserStats } from '../types';
import { supabase } from '../utils/supabase';
import { dbService } from '../services/db';
import { SUGGESTED_BOOKS, MOCK_NOTIFICATIONS, ACHIEVEMENTS_LIST, AVATARS } from '../constants';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  books: Book[];
  flashcards: Flashcard[];
  readingLogs: ReadingLog[];
  notifications: Notification[];
  refreshUser: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
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
  
  // Usar una referencia para evitar llamadas duplicadas durante la fase de carga inicial
  const sessionLoadingRef = useRef(false);

  const loadUserData = async (userId: string, email: string) => {
    if (sessionLoadingRef.current && user) return;
    sessionLoadingRef.current = true;
    
    try {
      setLoading(true);
      
      // 1. Recuperar perfil de la DB
      let profile = await dbService.getUserProfile(userId);
      
      // 2. Revisar si hay un test pendiente en localStorage
      const savedAssessment = localStorage.getItem('pending_assessment');
      const assessmentData = savedAssessment ? JSON.parse(savedAssessment) : null;

      const calculateLevel = (tel: number) => {
        if (tel > 400) return "Maestro Cognitivo";
        if (tel > 250) return "Lector Ágil";
        if (tel > 150) return "Lector Promedio";
        return "Iniciado";
      };

      if (!profile) {
        // --- REGISTRO AUTOMÁTICO DE NUEVO USUARIO ---
        const initialStats: UserStats = { 
          streak: 1, 
          tel: assessmentData?.tel || 200, 
          xp: 100, 
          lastActiveDate: Date.now(), 
          maxSchulteLevel: 1, 
          maxWordSpan: 3 
        };

        const newUser: User = {
          id: userId,
          name: email.split('@')[0],
          email: email,
          avatarUrl: AVATARS[0],
          stats: initialStats,
          joinedDate: Date.now(),
          baselineWPM: assessmentData?.wpm || 200,
          level: calculateLevel(initialStats.tel),
          preferences: {
            dailyGoalMinutes: 15,
            targetWPM: Math.max(300, (assessmentData?.wpm || 200) + 100),
            difficultyLevel: assessmentData?.tel > 250 ? 'Intermedio' : 'Básico',
            notificationsEnabled: true,
            soundEnabled: true,
            unlockedRewards: []
          },
          achievements: []
        };
        
        await dbService.createUserProfile(newUser);
        profile = newUser;
        
        // Registrar log inicial del test
        if (assessmentData) {
            await dbService.addReadingLog({
                id: `init-${Date.now()}`,
                userId: userId,
                exerciseType: 'reading_session',
                levelOrSpeed: assessmentData.wpm,
                durationSeconds: 60,
                wpmCalculated: assessmentData.wpm,
                comprehensionRate: assessmentData.comprehension,
                telCalculated: assessmentData.tel,
                timestamp: Date.now()
            });
        }
      } else if (assessmentData) {
        // --- ACTUALIZAR PUNTO DE PARTIDA ---
        const updatedStats = { ...profile.stats, tel: Math.max(profile.stats.tel, assessmentData.tel) };
        await dbService.updateUserStats(userId, updatedStats);
        profile = { ...profile, stats: updatedStats, level: calculateLevel(updatedStats.tel) };
      }

      // Limpiar rastro del test
      if (assessmentData) localStorage.removeItem('pending_assessment');

      if (profile) {
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
      sessionLoadingRef.current = false;
    }
  };

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          if (error.message.includes('Refresh Token Not Found')) {
            await supabase.auth.signOut();
          }
          if (mounted) setLoading(false);
          return;
        }
        if (session?.user && mounted) {
          await loadUserData(session.user.id, session.user.email || '');
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
      if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session?.user) {
        await loadUserData(session.user.id, session.user.email || '');
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setBooks(SUGGESTED_BOOKS);
        setReadingLogs([]);
        setFlashcards([]);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

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
    
    if (updates.stats) await dbService.updateUserStats(user.id, updated.stats);
    if (updates.preferences) await dbService.updateUserPreferences(user.id, updated.preferences);
    
    if (updates.achievements || updates.avatarUrl || updates.name) {
        await supabase.from('profiles').update({ 
            achievements: updated.achievements,
            avatar_url: updated.avatarUrl,
            name: updated.name,
            level: updated.level
        }).eq('id', user.id);
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

  const addBook = async (book: Book): Promise<string | null> => {
    if (!user) return null;
    const bookWithUser = { ...book, userId: user.id };
    let finalId = book.id;
    
    if (user.id !== 'guest') {
      const dbId = await dbService.addUserBook(bookWithUser);
      if (dbId) finalId = dbId;
    }
    
    setBooks(prev => [{ ...bookWithUser, id: finalId }, ...prev.filter(b => !SUGGESTED_BOOKS.some(sb => sb.id === b.id))]);
    return finalId;
  };

  const addFlashcards = async (cards: Flashcard[]) => {
    if (!user) return;
    const cardsWithUser = cards.map(c => ({ ...c, userId: user.id }));
    if (user.id !== 'guest') await dbService.addFlashcards(cardsWithUser);
    setFlashcards(prev => [...cardsWithUser, ...prev]);
  };

  const updateFlashcard = async (card: Flashcard) => {
    if (!user) return;
    if (user.id !== 'guest') await dbService.updateFlashcard(card);
    setFlashcards(prev => prev.map(c => c.id === card.id ? card : c));
  };

  const logReading = async (logData: Omit<ReadingLog, 'id' | 'userId' | 'timestamp'>) => {
    if (!user) return;
    const now = Date.now();
    const newLog: ReadingLog = { ...logData, id: `temp-${now}`, userId: user.id, timestamp: now };
    setReadingLogs(prev => [...prev, newLog]);
    
    const updatedStats = { 
        ...user.stats, 
        xp: user.stats.xp + 25, 
        lastActiveDate: now,
        tel: Math.max(user.stats.tel, logData.telCalculated || 0)
    };
    
    await updateUser({ stats: updatedStats });
    if (user.id !== 'guest') await dbService.addReadingLog(newLog);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
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
