
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { User, ReadingLog, Book, Flashcard, Notification as AppNotification, Achievement, Reward, UserStats, LearningProgress } from '../types.ts';
import { supabase } from '../utils/supabase.ts';
import { dbService } from '../services/db.ts';
import { SUGGESTED_BOOKS, AVATARS, DEFAULT_THEME_CONFIG } from '../constants.ts';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isGuest: boolean;
  books: Book[];
  flashcards: Flashcard[];
  readingLogs: ReadingLog[];
  notifications: AppNotification[];
  refreshUser: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  logReading: (log: Omit<ReadingLog, 'id' | 'userId' | 'timestamp'>) => Promise<void>;
  addBook: (book: Book) => Promise<string | null>;
  removeBook: (bookId: string) => Promise<void>;
  updateLearningProgress: (moduleId: string, steps: number, isCompleted: boolean) => Promise<void>;
  equipReward: (reward: Reward) => Promise<void>;
  loginAsGuest: () => void;
  logout: () => Promise<void>;
  setNotifications: React.Dispatch<React.SetStateAction<AppNotification[]>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);
  const [readingLogs, setReadingLogs] = useState<ReadingLog[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  
  const isSyncing = useRef(false);
  const updateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingUpdates = useRef<Partial<User>>({});

  // SISTEMA DINÁMICO DE TEMAS
  useEffect(() => {
    try {
        const themeColor = user?.preferences?.themeColor ?? DEFAULT_THEME_CONFIG.primaryColor;
        document.documentElement.style.setProperty('--primary', themeColor);
        const darkColor = themeColor === DEFAULT_THEME_CONFIG.primaryColor ? '#14b84b' : themeColor;
        document.documentElement.style.setProperty('--primary-dark', darkColor);
    } catch (e) {
        document.documentElement.style.setProperty('--primary', DEFAULT_THEME_CONFIG.primaryColor);
        document.documentElement.style.setProperty('--primary-dark', '#14b84b');
    }
  }, [user?.preferences?.themeColor, user]);

  const syncToBackend = useCallback(async (userId: string, updates: Partial<User>) => {
    if (isGuest || !userId) return;
    try {
        await dbService.updateFullProfile(userId, updates);
    } catch (e) {
        if (process.env.NODE_ENV !== 'production') console.error("[Sync] Error persistiendo cambios:", e);
    }
  }, [isGuest]);

  const loadUserData = useCallback(async (userId: string, email: string, metadata?: any) => {
    if (isSyncing.current || !userId) return;
    isSyncing.current = true;
    
    try {
      const profile = await dbService.getUserProfile(userId);
      
      if (!profile) {
        const newUser: User = {
          id: userId,
          name: metadata?.full_name || email.split('@')[0] || 'Usuario',
          email: email || '',
          avatarUrl: metadata?.avatar_url || AVATARS[0],
          stats: { streak: 1, tel: 200, xp: 100, lastActiveDate: Date.now(), maxSchulteLevel: 1, maxWordSpan: 3 },
          joinedDate: Date.now(),
          baselineWPM: 200,
          level: "Iniciado",
          preferences: {
            dailyGoalMinutes: 15,
            targetWPM: 300,
            difficultyLevel: 'Básico',
            notificationsEnabled: true,
            soundEnabled: true,
            themeColor: DEFAULT_THEME_CONFIG.primaryColor,
            unlockedRewards: []
          },
          achievements: [],
          learningProgress: []
        };
        await dbService.createUserProfile(newUser);
        setUser(newUser);
      } else {
        const normalizedProfile = {
            ...profile,
            preferences: {
                ...DEFAULT_THEME_CONFIG,
                ...(profile.preferences ?? {}),
                themeColor: profile.preferences?.themeColor ?? DEFAULT_THEME_CONFIG.primaryColor
            },
            stats: profile.stats ?? { streak: 0, tel: 0, xp: 0, lastActiveDate: Date.now() },
            learningProgress: profile.learningProgress ?? []
        };
        setUser(normalizedProfile);
      }

      const results = await Promise.allSettled([
        dbService.getReadingLogs(userId),
        dbService.getUserBooks(userId)
      ]);
      
      if (results[0].status === 'fulfilled') setReadingLogs(results[0].value || []);
      if (results[1].status === 'fulfilled') setBooks((results[1].value && results[1].value.length > 0) ? results[1].value : SUGGESTED_BOOKS);
      
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') console.error("[Auth] Error cargando usuario:", err);
    } finally {
      isSyncing.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setIsGuest(false);
        loadUserData(session.user.id, session.user.email!, session.user.user_metadata);
      } else if (!isGuest) {
        setUser(null);
        setLoading(false);
      }
    });
    return () => subscription.unsubscribe();
  }, [loadUserData, isGuest]);

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;
    const updatedUser = { 
        ...user, 
        ...updates,
        preferences: {
            ...(user.preferences ?? DEFAULT_THEME_CONFIG),
            ...(updates.preferences ?? {})
        }
    };
    setUser(updatedUser);
    if (isGuest) return;
    pendingUpdates.current = { ...pendingUpdates.current, ...updates };
    if (updateTimerRef.current) clearTimeout(updateTimerRef.current);
    updateTimerRef.current = setTimeout(() => {
        syncToBackend(user.id, pendingUpdates.current);
        pendingUpdates.current = {};
    }, 2000);
  };

  const updateLearningProgress = async (moduleId: string, steps: number, isCompleted: boolean) => {
    if (!user || !moduleId) return;
    const currentProgress = user.learningProgress || [];
    const index = currentProgress.findIndex(p => p.moduleId === moduleId);
    let newProgress = [...currentProgress];
    const progressUpdate = { 
        moduleId, 
        completedSteps: steps, 
        isCompleted: isCompleted || (index >= 0 ? newProgress[index].isCompleted : false), 
        lastAccessed: Date.now() 
    };
    if (index >= 0) newProgress[index] = progressUpdate;
    else newProgress.push(progressUpdate);
    const updates: Partial<User> = { learningProgress: newProgress };
    if (isCompleted && (index === -1 || !currentProgress[index].isCompleted)) {
        updates.stats = { ...user.stats, xp: (user.stats?.xp ?? 0) + 50 };
    }
    await updateUser(updates);
  };

  const equipReward = async (reward: Reward) => {
    if (!user || !reward) return;
    if (reward.type === 'theme') {
        const newColor = user.preferences?.themeColor === reward.value 
            ? DEFAULT_THEME_CONFIG.primaryColor 
            : reward.value;
        await updateUser({ preferences: { ...user.preferences, themeColor: newColor } });
    } else if (reward.type === 'avatar') {
        await updateUser({ avatarUrl: reward.value });
    }
  };

  const addBook = async (book: Book) => {
    if (!user || !book) return null;
    const bookWithUser = { ...book, userId: user.id };
    try {
        const dbId = isGuest ? null : await dbService.addUserBook(bookWithUser);
        const finalBook = { ...bookWithUser, id: dbId || book.id };
        setBooks(prev => [finalBook, ...prev]);
        return finalBook.id;
    } catch (e) { 
        setBooks(prev => [bookWithUser, ...prev]);
        return book.id; 
    }
  };

  const removeBook = async (bookId: string) => {
    if (!bookId) return;
    // UI REACTIVA: Eliminar inmediatamente del estado local
    setBooks(prev => prev.filter(b => b.id !== bookId));
    
    // PERSISTENCIA: Solo si no es invitado
    if (!isGuest && user) {
        try {
            await dbService.deleteUserBook(bookId);
        } catch (e) {
            if (process.env.NODE_ENV !== 'production') console.error("[DB] Error al borrar libro persistente:", e);
        }
    }
  };

  const logReading = async (logData: Omit<ReadingLog, 'id' | 'userId' | 'timestamp'>) => {
    if (!user) return;
    const now = Date.now();
    const newLog: ReadingLog = { ...logData, id: `log-${now}`, userId: user.id, timestamp: now };
    setReadingLogs(prev => [newLog, ...(prev || []).slice(0, 49)]);

    const xpGained = 25 + (logData.telCalculated ? Math.floor(logData.telCalculated / 10) : 0);
    await updateUser({ 
        stats: {
            ...(user.stats ?? {}),
            xp: (user.stats?.xp ?? 0) + xpGained,
            tel: logData.telCalculated || user.stats?.tel || 0,
            lastActiveDate: now
        } as UserStats
    });
    if (!isGuest) dbService.addReadingLog(newLog).catch(() => {});
  };

  const loginAsGuest = () => {
    setIsGuest(true);
    setUser({
        id: 'guest',
        name: 'Invitado',
        email: 'guest@lector.app',
        avatarUrl: AVATARS[1],
        stats: { streak: 1, tel: 200, xp: 100, lastActiveDate: Date.now(), maxSchulteLevel: 1, maxWordSpan: 3 },
        joinedDate: Date.now(),
        baselineWPM: 200,
        level: "Visitante",
        preferences: { dailyGoalMinutes: 15, targetWPM: 250, difficultyLevel: 'Básico', notificationsEnabled: false, soundEnabled: true, themeColor: DEFAULT_THEME_CONFIG.primaryColor, unlockedRewards: [] },
        achievements: [],
        learningProgress: []
    });
    setLoading(false);
  };

  const logout = async () => {
    setLoading(true);
    if (updateTimerRef.current) {
        clearTimeout(updateTimerRef.current);
        if (user && Object.keys(pendingUpdates.current).length > 0) {
            await syncToBackend(user.id, pendingUpdates.current);
        }
    }
    try { if (user && user.id !== 'guest') await supabase.auth.signOut(); } catch (err) {}
    finally { 
        setIsGuest(false); setUser(null); setBooks([]); setReadingLogs([]); 
        setFlashcards([]); setLoading(false); 
    }
  };

  return (
    <AuthContext.Provider value={{
      user, loading, isGuest, books, flashcards, readingLogs, notifications,
      refreshUser: () => loadUserData(user?.id || '', user?.email || ''), 
      updateUser, logReading, addBook, removeBook, 
      updateLearningProgress, equipReward, loginAsGuest, logout, setNotifications
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
