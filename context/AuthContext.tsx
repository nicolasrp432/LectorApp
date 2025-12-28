import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { User, ReadingLog, Book, Flashcard, Notification as AppNotification, Achievement, Reward, UserStats } from '../types.ts';
import { supabase } from '../utils/supabase.ts';
import { dbService } from '../services/db.ts';
import { SUGGESTED_BOOKS, MOCK_NOTIFICATIONS, AVATARS } from '../constants.ts';

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
  addFlashcards: (cards: Flashcard[]) => Promise<void>;
  updateFlashcard: (card: Flashcard) => Promise<void>;
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

  const loadUserData = useCallback(async (userId: string, email: string, metadata?: any) => {
    if (isSyncing.current) return;
    isSyncing.current = true;
    
    try {
      let profile = await dbService.getUserProfile(userId);
      
      if (!profile) {
        const initialStats: UserStats = { streak: 1, tel: 200, xp: 100, lastActiveDate: Date.now(), maxSchulteLevel: 1, maxWordSpan: 3 };
        const newUser: User = {
          id: userId,
          name: metadata?.full_name || email.split('@')[0],
          email: email,
          avatarUrl: metadata?.avatar_url || AVATARS[0],
          stats: initialStats,
          joinedDate: Date.now(),
          baselineWPM: 200,
          level: "Iniciado",
          preferences: {
            dailyGoalMinutes: 15,
            targetWPM: 300,
            difficultyLevel: 'Básico',
            notificationsEnabled: true,
            soundEnabled: true,
            unlockedRewards: []
          },
          achievements: []
        };
        await dbService.createUserProfile(newUser);
        profile = newUser;
      }

      const [logs, userBooks, cards] = await Promise.allSettled([
        dbService.getReadingLogs(userId),
        dbService.getUserBooks(userId),
        dbService.getFlashcards(userId)
      ]);
      
      setReadingLogs(logs.status === 'fulfilled' ? logs.value : []);
      setBooks(userBooks.status === 'fulfilled' && userBooks.value.length > 0 ? userBooks.value : SUGGESTED_BOOKS);
      setFlashcards(cards.status === 'fulfilled' ? cards.value : []);
      setNotifications(MOCK_NOTIFICATIONS);
      setUser(profile);
    } catch (err) {
      console.error("[AuthSystem] Error:", err);
    } finally {
      isSyncing.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setIsGuest(false);
        await loadUserData(session.user.id, session.user.email!, session.user.user_metadata);
      } else if (!isGuest) {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadUserData, isGuest]);

  const loginAsGuest = () => {
    setIsGuest(true);
    const guestUser: User = {
        id: 'guest',
        name: 'Explorador Invitado',
        email: 'guest@lector.app',
        avatarUrl: AVATARS[1],
        stats: { streak: 1, tel: 200, xp: 100, lastActiveDate: Date.now(), maxSchulteLevel: 1, maxWordSpan: 3 },
        joinedDate: Date.now(),
        baselineWPM: 200,
        level: "Visitante",
        preferences: { 
          dailyGoalMinutes: 15, 
          targetWPM: 250, 
          difficultyLevel: 'Básico', 
          notificationsEnabled: false, 
          soundEnabled: true, 
          unlockedRewards: [] 
        },
        achievements: []
    };
    setUser(guestUser);
    setBooks(SUGGESTED_BOOKS);
    setNotifications(MOCK_NOTIFICATIONS);
    setLoading(false);
  };

  const logout = async () => {
    setLoading(true);
    try {
        if (user && user.id !== 'guest') {
            await supabase.auth.signOut();
        }
    } catch (err) {
        console.error("Error signing out:", err);
    } finally {
        setIsGuest(false);
        setUser(null);
        setBooks([]);
        setReadingLogs([]);
        setFlashcards([]);
        setNotifications([]);
        setLoading(false);
    }
  };

  const refreshUser = async () => {
    if (isGuest) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) await loadUserData(session.user.id, session.user.email!, session.user.user_metadata);
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    if (!isGuest) {
        if (updates.stats) await dbService.updateUserStats(user.id, updated.stats).catch(console.error);
        if (updates.preferences) await dbService.updateUserPreferences(user.id, updated.preferences).catch(console.error);
    }
  };

  const logReading = async (logData: Omit<ReadingLog, 'id' | 'userId' | 'timestamp'>) => {
    if (!user) return;
    const now = Date.now();
    const newLog: ReadingLog = { ...logData, id: `temp-${now}`, userId: user.id, timestamp: now };
    setReadingLogs(prev => [...prev, newLog]);
    if (!isGuest) await dbService.addReadingLog(newLog).catch(console.error);
  };

  const addBook = async (book: Book) => {
    if (!user) return null;
    const bookWithUser = { ...book, userId: user.id };
    let id = book.id;
    if (!isGuest) {
        const dbId = await dbService.addUserBook(bookWithUser).catch(() => null);
        if (dbId) id = dbId;
    }
    setBooks(prev => [{ ...bookWithUser, id }, ...prev]);
    return id;
  };

  const addFlashcards = async (cards: Flashcard[]) => {
    if (!user) return;
    if (!isGuest) await dbService.addFlashcards(cards.map(c => ({ ...c, userId: user.id }))).catch(console.error);
    setFlashcards(prev => [...cards, ...prev]);
  };

  const updateFlashcard = async (card: Flashcard) => {
    if (!user) return;
    if (!isGuest) await dbService.updateFlashcard(card).catch(console.error);
    setFlashcards(prev => prev.map(c => c.id === card.id ? card : c));
  };

  const equipReward = async (reward: Reward) => {
      if (!user) return;
      if (reward.type === 'theme') await updateUser({ preferences: { ...user.preferences, themeColor: reward.value } });
      else if (reward.type === 'avatar') await updateUser({ avatarUrl: reward.value });
  };

  return (
    <AuthContext.Provider value={{
      user, loading, isGuest, books, flashcards, readingLogs, notifications,
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