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
  authError: string | null;
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

const AUTH_TIMEOUT_MS = 10000;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [readingLogs, setReadingLogs] = useState<ReadingLog[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  
  const isSyncing = useRef(false);
  const updateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingUpdates = useRef<Partial<User>>({});
  const hasInitialized = useRef(false);

  // Dynamic theme system
  useEffect(() => {
    try {
        const themeColor = user?.preferences?.themeColor ?? DEFAULT_THEME_CONFIG.primaryColor;
        document.documentElement.style.setProperty('--primary', themeColor);
        const darkColor = themeColor === DEFAULT_THEME_CONFIG.primaryColor ? '#10b981' : themeColor;
        document.documentElement.style.setProperty('--primary-dark', darkColor);
    } catch (e) {
        document.documentElement.style.setProperty('--primary', DEFAULT_THEME_CONFIG.primaryColor);
        document.documentElement.style.setProperty('--primary-dark', '#10b981');
    }
  }, [user?.preferences?.themeColor]);

  const syncToBackend = useCallback(async (userId: string, updates: Partial<User>) => {
    if (isGuest || !userId) return;
    try {
        await dbService.updateFullProfile(userId, updates);
    } catch (e) {
        console.error("[Sync] Error persisting changes:", e);
    }
  }, [isGuest]);

  const loadUserData = useCallback(async (userId: string, email: string, metadata?: any) => {
    if (isSyncing.current || !userId) return;
    isSyncing.current = true;
    setAuthError(null);
    
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
            difficultyLevel: 'Basico' as any,
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
      
    } catch (err: any) {
      console.error("[Auth] Error loading user:", err);
      setAuthError("Error al cargar tu perfil. Intenta de nuevo.");
    } finally {
      isSyncing.current = false;
      setLoading(false);
    }
  }, []);

  // Main auth listener - handles INITIAL_SESSION, SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED
  useEffect(() => {
    // Safety timeout: if Supabase never responds, stop loading
    const timeoutId = setTimeout(() => {
      if (loading && !hasInitialized.current) {
        hasInitialized.current = true;
        setLoading(false);
        console.warn("[Auth] Timeout: Supabase did not respond in time. Check env vars.");
      }
    }, AUTH_TIMEOUT_MS);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      hasInitialized.current = true;
      clearTimeout(timeoutId);

      if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
        setUser(null);
        setBooks([]);
        setReadingLogs([]);
        setFlashcards([]);
        setIsGuest(false);
        setLoading(false);
        return;
      }

      if (session?.user) {
        setIsGuest(false);
        setAuthError(null);
        await loadUserData(session.user.id, session.user.email!, session.user.user_metadata);
      } else if (event === 'INITIAL_SESSION') {
        // No session found on initial load - user is not logged in
        setLoading(false);
      }
    });

    return () => {
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [loadUserData]);

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
    setBooks(prev => prev.filter(b => b.id !== bookId));
    if (!isGuest && user) {
        try {
            await dbService.deleteUserBook(bookId);
        } catch (e) {
            console.error("[DB] Error deleting book:", e);
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
    setAuthError(null);
    setUser({
        id: 'guest',
        name: 'Invitado',
        email: 'guest@lector.app',
        avatarUrl: AVATARS[1],
        stats: { streak: 1, tel: 200, xp: 100, lastActiveDate: Date.now(), maxSchulteLevel: 1, maxWordSpan: 3 },
        joinedDate: Date.now(),
        baselineWPM: 200,
        level: "Visitante",
        preferences: { dailyGoalMinutes: 15, targetWPM: 250, difficultyLevel: 'Basico' as any, notificationsEnabled: false, soundEnabled: true, themeColor: DEFAULT_THEME_CONFIG.primaryColor, unlockedRewards: [] },
        achievements: [],
        learningProgress: []
    });
    setLoading(false);
  };

  const logout = async () => {
    setLoading(true);
    // Flush pending updates before logout
    if (updateTimerRef.current) {
        clearTimeout(updateTimerRef.current);
        if (user && user.id !== 'guest' && Object.keys(pendingUpdates.current).length > 0) {
            await syncToBackend(user.id, pendingUpdates.current);
        }
        pendingUpdates.current = {};
    }
    try { 
      if (user && user.id !== 'guest') await supabase.auth.signOut(); 
    } catch (err) {
      console.error("[Auth] Logout error:", err);
    } finally { 
        setIsGuest(false); 
        setUser(null); 
        setBooks([]); 
        setReadingLogs([]); 
        setFlashcards([]); 
        setAuthError(null);
        setLoading(false); 
    }
  };

  const refreshUser = useCallback(async () => {
    if (!user || user.id === 'guest') return;
    await loadUserData(user.id, user.email);
  }, [user, loadUserData]);

  return (
    <AuthContext.Provider value={{
      user, loading, isGuest, books, flashcards, readingLogs, notifications, authError,
      refreshUser, updateUser, logReading, addBook, removeBook, 
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
