export interface Book {
  id: string;
  userId?: string; 
  title: string;
  author: string;
  coverUrl: string;
  progress: number;
  totalPages?: number;
  totalTime?: string;
  content?: string; 
  isAnalyzed?: boolean; 
  isPremium?: boolean; // Nuevo: Para tienda de XP
  price?: number; // Costo en XP
}

export interface UserPreferences {
  dailyGoalMinutes: number;
  targetWPM: number;
  difficultyLevel: 'Básico' | 'Intermedio' | 'Avanzado';
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  themeColor?: string; // Nuevo: Personalización
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: number;
}

export interface Reward {
  id: string;
  type: 'avatar' | 'theme' | 'book';
  title: string;
  description: string;
  cost: number;
  value: string; // URL for avatar, hex for theme, ID for book
  icon: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  stats: UserStats;
  joinedDate: number;
  baselineWPM: number;
  level: string; 
  preferences: UserPreferences;
  achievements: Achievement[];
  unlockedRewards: string[]; // IDs de recompensas desbloqueadas
}

export interface UserStats {
  streak: number;
  tel: number; 
  lastActiveDate: number; 
  xp: number; 
  maxSchulteLevel?: number; 
  maxWordSpan?: number; 
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  timestamp: number;
  isRead: boolean;
}

export interface ReadingLog {
  id: string;
  userId: string;
  exerciseType: 'schulte' | 'reading_session' | 'rsvp' | 'word_span';
  levelOrSpeed: number; 
  durationSeconds: number;
  wpmCalculated?: number;
  comprehensionRate?: number; 
  telCalculated?: number; 
  timestamp: number;
}

export interface RetentionLog {
  id: string;
  userId: string;
  flashcardId: string;
  rating: number; 
  intervalDays: number;
  timestamp: number;
}

export interface Flashcard {
  id: string;
  userId?: string; 
  bookId?: string;
  front: string; 
  back: string;  
  interval: number; 
  repetition: number; 
  efactor: number; 
  dueDate: number; 
}

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation?: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  imageUrl?: string;
  options: QuizOption[];
}

export enum AppRoute {
  WELCOME = 'welcome',
  LOGIN = 'login',
  REGISTER = 'register',
  ASSESSMENT_INTRO = 'assessment_intro',
  ASSESSMENT_READING = 'assessment_reading',
  ASSESSMENT_QUIZ = 'assessment_quiz',
  ASSESSMENT_RESULTS = 'assessment_results',
  DASHBOARD = 'dashboard',
  LIBRARY = 'library',
  READING = 'reading',
  SCHULTE = 'schulte',
  WORD_SPAN = 'word_span',
  MEMORY_TRAINING = 'memory_training',
  LOCI_TRAINING = 'loci_training',
  SETTINGS = 'settings',
  EDIT_PROFILE = 'edit_profile',
  REWARDS = 'rewards', // Nueva ruta
}