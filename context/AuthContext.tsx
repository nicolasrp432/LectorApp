
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
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
  
  const isSyncing = useRef(false);
  const guestModeActive = useRef(false);

  const loadUserData = useCallback(async (userId: string, email: string, metadata?: any) => {
    if (isSyncing.current && user?.id === userId) return;
    isSyncing.current = true;
    
    try {
      console.log(`[AuthSystem] Iniciando sincronización profunda: ${email}`);
      
      let profile = await dbService.getUserProfile(userId);
      
      if (!profile) {
        console.log("[AuthSystem] Creando perfil nuevo para el usuario autenticado...");
        
        const savedAssessment = localStorage.getItem('pending_assessment');
        const assessmentData = savedAssessment ? JSON.parse(savedAssessment) : null;

        const initialStats: UserStats = { 
          streak: 1, 
          tel: assessmentData?.tel || 200, 
          xp: 100, 
          lastActiveDate: Date.now(), 
          maxSchulteLevel: 1, 
          maxWordSpan: 3 
        };

        const displayName = metadata?.full_name || metadata?.display_name || email.split('@')[0];
        const avatarUrl = metadata?.avatar_url || AVATARS[0];

        const newUser: User = {
          id: userId,
          name: displayName,
          email: email,
          avatarUrl: avatarUrl,
          stats: initialStats,
          joinedDate: Date.now(),
          baselineWPM: assessmentData?.wpm || 200,
          level: "Iniciado",
          preferences: {
            dailyGoalMinutes: 15,
            targetWPM: Math.max(300, (assessmentData?.wpm || 200) + 100),
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

      if (profile) {
        const [fetchedLogs, fetchedBooks, fetchedCards] = await Promise.allSettled([
          dbService.getReadingLogs(userId),
          dbService.getUserBooks(userId),
          dbService.getFlashcards(userId)
        ]);
        
        setReadingLogs(fetchedLogs.status === 'fulfilled' ? fetchedLogs.value : []);
        setBooks(fetchedBooks.status === 'fulfilled' && fetchedBooks.value.length > 0 ? fetchedBooks.value : SUGGESTED_BOOKS);
        setFlashcards(fetchedCards.status === 'fulfilled' ? fetchedCards.value : []);
        setNotifications(MOCK_NOTIFICATIONS);
        setUser(profile);
      }
    } catch (err) {
      console.error("[AuthSystem] Error crítico de carga:", err);
    } finally {
      isSyncing.current = false;
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    // Escuchar cambios de estado de Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`[SupabaseAuth] Evento: ${event}`);
      
      // Si estamos en modo invitado, ignoramos eventos SIGNED_OUT automáticos al inicio
      if (guestModeActive.current && !session) return;

      if (session?.user) {
        guestModeActive.current = false;
        await loadUserData(session.user.id, session.user.email!, session.user.user_metadata);
      } else if (event === 'SIGNED_OUT') {
        guestModeActive.current = false;
        setUser(null);
        setLoading(false);
      } else {
        // En la carga inicial, si no hay sesión y no estamos procesando un token de Google
        if (!window.location.hash.includes('access_token')) {
          setLoading(false);
        }
      }
    });

    // Verificación inicial rápida
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserData(session.user.id, session.user.email!, session.user.user_metadata);
      } else if (!window.location.hash.includes('access_token')) {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadUserData]);

  const loginAsGuest = () => {
    guestModeActive.current = true;
    const guestUser: User = {
        id: 'guest',
        name: 'Explorador Invitado',
        email: 'invitado@lector.app',
        avatarUrl: AVATARS[1],
        stats: { streak: 1, tel: 200, xp: 100, lastActiveDate: Date.now(), maxSchulteLevel: 1, maxWordSpan: 3 },
        joinedDate: Date.now(),
        baselineWPM: 200,
        level: "Visitante",
        preferences: { dailyGoalMinutes: 15, targetWPM: 250, difficultyLevel: 'Básico', notificationsEnabled: false, soundEnabled: true, unlockedRewards: [] },
        achievements: []
    };
    setUser(guestUser);
    setBooks(SUGGESTED_BOOKS);
    setReadingLogs([]);
    setFlashcards([]);
    setLoading(false);
  };

  const logout = async () => {
    setLoading(true);
    guestModeActive.current = false;
    await supabase.auth.signOut();
    setUser(null);
    setLoading(false);
  };

  const refreshUser = async () => {
    if (user?.id === 'guest') return;
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) await loadUserData(session.user.id, session.user.email!, session.user.user_metadata);
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    if (user.id !== 'guest') {
        if (updates.stats) await dbService.updateUserStats(user.id, updated.stats).catch(console.error);
        if (updates.preferences) await dbService.updateUserPreferences(user.id, updated.preferences).catch(console.error);
    }
  };

  const logReading = async (logData: Omit<ReadingLog, 'id' | 'userId' | 'timestamp'>) => {
    if (!user) return;
    const now = Date.now();
    const newLog: ReadingLog = { ...logData, id: `temp-${now}`, userId: user.id, timestamp: now };
    setReadingLogs(prev => [...prev, newLog]);
    if (user.id !== 'guest') await dbService.addReadingLog(newLog).catch(console.error);
  };

  const addBook = async (book: Book) => {
    if (!user) return null;
    const bookWithUser = { ...book, userId: user.id };
    let id = book.id;
    if (user.id !== 'guest') {
        const dbId = await dbService.addUserBook(bookWithUser).catch(() => null);
        if (dbId) id = dbId;
    }
    setBooks(prev => [{ ...bookWithUser, id }, ...prev]);
    return id;
  };

  const addFlashcards = async (cards: Flashcard[]) => {
    if (!user) return;
    if (user.id !== 'guest') await dbService.addFlashcards(cards.map(c => ({ ...c, userId: user.id }))).catch(console.error);
    setFlashcards(prev => [...cards, ...prev]);
  };

  const updateFlashcard = async (card: Flashcard) => {
    if (!user) return;
    if (user.id !== 'guest') await dbService.updateFlashcard(card).catch(console.error);
    setFlashcards(prev => prev.map(c => c.id === card.id ? card : c));
  };

  const equipReward = async (reward: Reward) => {
      if (!user) return;
      if (reward.type === 'theme') await updateUser({ preferences: { ...user.preferences, themeColor: reward.value } });
      else if (reward.type === 'avatar') await updateUser({ avatarUrl: reward.value });
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
