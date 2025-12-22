
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { User, ReadingLog, Book, Flashcard, Notification, Achievement, Reward, UserStats } from '../types';
import { supabase } from '../utils/supabase';
import { dbService } from '../services/db';
import { SUGGESTED_BOOKS, MOCK_NOTIFICATIONS, AVATARS } from '../constants';

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
  
  const initializingRef = useRef(false);

  const loadUserData = async (userId: string, email: string, metadata?: any) => {
    if (initializingRef.current) return;
    initializingRef.current = true;
    
    console.log(`[Auth] Cargando datos para: ${email}`);
    
    try {
      setLoading(true);
      let profile = await dbService.getUserProfile(userId);
      
      const savedAssessment = localStorage.getItem('pending_assessment');
      const assessmentData = savedAssessment ? JSON.parse(savedAssessment) : null;

      const calculateLevel = (tel: number) => {
        if (tel > 400) return "Maestro Cognitivo";
        if (tel > 250) return "Lector Ágil";
        if (tel > 150) return "Lector Promedio";
        return "Iniciado";
      };

      if (!profile) {
        console.log("[Auth] Perfil no encontrado. Creando nuevo perfil...");
        const initialStats: UserStats = { 
          streak: 1, 
          tel: assessmentData?.tel || 200, 
          xp: 100, 
          lastActiveDate: Date.now(), 
          maxSchulteLevel: 1, 
          maxWordSpan: 3 
        };

        const displayName = metadata?.full_name || metadata?.display_name || email.split('@')[0];

        const newUser: User = {
          id: userId,
          name: displayName,
          email: email,
          avatarUrl: metadata?.avatar_url || AVATARS[0],
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
        
        if (assessmentData) {
            console.log("[Auth] Vinculando resultados del test previo...");
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
            localStorage.removeItem('pending_assessment');
        }
        console.log("[Auth] Perfil creado con éxito.");
      } else {
        console.log("[Auth] Perfil existente recuperado.");
      }

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
      console.error("[Auth] Error critico en AuthContext:", err);
    } finally {
      setLoading(false);
      initializingRef.current = false;
    }
  };

  useEffect(() => {
    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await loadUserData(session.user.id, session.user.email || '', session.user.user_metadata);
      } else {
        setLoading(false);
      }
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`[Auth] Evento: ${event}`);
      if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session?.user) {
        await loadUserData(session.user.id, session.user.email || '', session.user.user_metadata);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loginAsGuest = () => {
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
    setLoading(false);
  };

  const refreshUser = async () => {
    if (user && user.id !== 'guest') {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) await loadUserData(session.user.id, session.user.email || '', session.user.user_metadata);
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    if (user.id !== 'guest') {
        if (updates.stats) await dbService.updateUserStats(user.id, updated.stats);
        if (updates.preferences) await dbService.updateUserPreferences(user.id, updated.preferences);
    }
  };

  const logReading = async (logData: Omit<ReadingLog, 'id' | 'userId' | 'timestamp'>) => {
    if (!user) return;
    const now = Date.now();
    const newLog: ReadingLog = { ...logData, id: `temp-${now}`, userId: user.id, timestamp: now };
    setReadingLogs(prev => [...prev, newLog]);
    if (user.id !== 'guest') await dbService.addReadingLog(newLog);
  };

  const addBook = async (book: Book) => {
    if (!user) return null;
    const bookWithUser = { ...book, userId: user.id };
    let id = book.id;
    if (user.id !== 'guest') {
        const dbId = await dbService.addUserBook(bookWithUser);
        if (dbId) id = dbId;
    }
    setBooks(prev => [{ ...bookWithUser, id }, ...prev]);
    return id;
  };

  const addFlashcards = async (cards: Flashcard[]) => {
    if (!user) return;
    if (user.id !== 'guest') await dbService.addFlashcards(cards.map(c => ({ ...c, userId: user.id })));
    setFlashcards(prev => [...cards, ...prev]);
  };

  const updateFlashcard = async (card: Flashcard) => {
    if (!user) return;
    if (user.id !== 'guest') await dbService.updateFlashcard(card);
    setFlashcards(prev => prev.map(c => c.id === card.id ? card : c));
  };

  const equipReward = async (reward: Reward) => {
      if (!user) return;
      if (reward.type === 'theme') await updateUser({ preferences: { ...user.preferences, themeColor: reward.value } });
      else if (reward.type === 'avatar') await updateUser({ avatarUrl: reward.value });
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
