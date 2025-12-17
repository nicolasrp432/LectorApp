import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, ReadingLog, Book, Flashcard, RetentionLog, Notification, Achievement, Reward } from '../types';
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
  equipReward: (reward: Reward) => Promise<void>; // New
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

  // Initial Load
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) loadUserData(session.user.id, session.user.email);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
         if (!user || user.id !== session.user.id) loadUserData(session.user.id, session.user.email);
      } else if (!user || user.id !== 'guest') {
         // Only reset if we are not in guest mode
         setUser(null);
         setBooks([]);
         setReadingLogs([]);
         setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserData = async (userId: string, email?: string) => {
    setLoading(true);
    let profile = await dbService.getUserProfile(userId);

    // First time user? Create mock profile
    if (!profile && email) {
       const defaultUser: User = {
          id: userId,
          name: email.split('@')[0], 
          email: email,
          avatarUrl: AVATARS[0],
          stats: { ...MOCK_USER_STATS, xp: 0, tel: 200, streak: 1, lastActiveDate: Date.now(), maxSchulteLevel: 1, maxWordSpan: 3 },
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
    setLoading(false);
  };

  const loginAsGuest = () => {
    setLoading(true);
    const guestUser: User = {
        id: 'guest',
        name: 'Invitado',
        email: 'guest@lector.app',
        avatarUrl: AVATARS[1],
        stats: { ...MOCK_USER_STATS, xp: 100, streak: 1, lastActiveDate: Date.now() },
        joinedDate: Date.now(),
        baselineWPM: 200,
        level: "Explorador",
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
    setReadingLogs([]);
    setFlashcards([]);
    setNotifications([
        { id: 'g1', title: 'Modo Invitado', message: 'Los datos no se guardarán al salir.', type: 'info', timestamp: Date.now(), isRead: false }
    ]);
    setLoading(false);
  };

  const refreshUser = async () => {
    if (user && user.id !== 'guest') await loadUserData(user.id, user.email);
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated); // Optimistic UI
    
    if (user.id === 'guest') return; // Skip DB calls for guest

    // Split updates to DB services
    if (updates.stats) await dbService.updateUserStats(user.id, updates.stats);
    if (updates.preferences) await dbService.updateUserPreferences(user.id, updates.preferences);
    // General update fallback if needed in dbService
    await dbService.createUserProfile(updated); 
  };

  const equipReward = async (reward: Reward) => {
      if (!user) return;
      
      let updates: Partial<User> = {};

      if (reward.type === 'theme') {
          updates = { preferences: { ...user.preferences, themeColor: reward.value } };
      } else if (reward.type === 'avatar') {
          updates = { avatarUrl: reward.value };
      } else if (reward.type === 'book') {
          // Add logic to unlock specific book content if needed
      }

      await updateUser(updates);
  };

  const logReading = async (logData: Omit<ReadingLog, 'id' | 'userId' | 'timestamp'>) => {
    if (!user) return;
    const now = Date.now();
    const newLog: ReadingLog = { ...logData, id: `temp-${now}`, userId: user.id, timestamp: now };
    
    // Optimistic Update Log List
    setReadingLogs(prev => [...prev, newLog]);

    // Calculate XP & Stats
    const xpGained = logData.exerciseType === 'schulte' ? 25 : (logData.exerciseType === 'word_span' ? 15 : 50);
    const updatedStats = { ...user.stats, xp: user.stats.xp + xpGained, lastActiveDate: now };
    
    // --- Logic for Schulte/TEL Max updates (Progression System) ---
    if (logData.telCalculated && logData.telCalculated > (user.stats.tel || 0)) {
       updatedStats.tel = logData.telCalculated;
    }

    // Auto-update max level for Schulte
    if (logData.exerciseType === 'schulte' && logData.levelOrSpeed > (user.stats.maxSchulteLevel || 1)) {
        updatedStats.maxSchulteLevel = Math.min(9, logData.levelOrSpeed);
    }

    // Auto-update max level for Word/Number Span
    if (logData.exerciseType === 'word_span' && logData.levelOrSpeed > (user.stats.maxWordSpan || 3)) {
        updatedStats.maxWordSpan = logData.levelOrSpeed;
    }
    
    await updateUser({ stats: updatedStats });
    
    if (user.id !== 'guest') {
        await dbService.addReadingLog(newLog);
    }
    
    // Check achievements (Phase 3 logic)
    const newAchievements = checkAchievements(user, [...readingLogs, newLog]);
    if (newAchievements.length > user.achievements.length) {
        updateUser({ achievements: newAchievements });
    }
  };

  const checkAchievements = (currentUser: User, currentLogs: ReadingLog[]) => {
      let acts = [...currentUser.achievements];
      const hasFirst = acts.some(a => a.id === 'first_step');
      if (!hasFirst && currentLogs.length > 0) {
          const ach = ACHIEVEMENTS_LIST.find(a => a.id === 'first_step');
          if (ach) acts.push(ach);
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
          setBooks(prev => [{...book, id}, ...prev]);
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
    if (user?.id === 'guest') {
        setUser(null);
        setBooks([]);
        setReadingLogs([]);
        return;
    }
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