
export type ImageSize = '1K' | '2K' | '4K';
export type ReadingMode = 'focal' | 'campo_visual' | 'expansion' | 'lectura_profunda';

export interface LearningStep {
  title: string;
  text: string;
  icon: string;
  visualType: 'animation' | 'image' | 'text';
  animationKey?: string;
}

export interface LearningModule {
  id: string;
  title: string;
  duration: string;
  icon: string;
  description: string;
  color: string;
  steps: LearningStep[];
  checkpointQuestion?: QuizQuestion;
  relatedTrainingRoute?: AppRoute;
}

export interface LearningProgress {
  moduleId: string;
  completedSteps: number;
  isCompleted: boolean;
  score?: number;
  lastAccessed: number;
}

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
  isPremium?: boolean; 
  price?: number; 
  category?: 'practice' | 'user';
  difficulty?: 'Fácil' | 'Medio' | 'Difícil';
  questions?: QuizQuestion[];
}

export interface UserPreferences {
  dailyGoalMinutes: number;
  targetWPM: number;
  difficultyLevel: 'Básico' | 'Intermedio' | 'Avanzado';
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  themeColor?: string;
  unlockedRewards?: string[];
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
  value: string;
  icon: string;
  requiredAchievementId?: string;
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
  learningProgress?: LearningProgress[];
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
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: number;
  isRead: boolean;
}

export interface ReadingLog {
  id: string;
  userId: string;
  exerciseType: 'schulte' | 'reading_session' | 'focal' | 'campo_visual' | 'expansion' | 'word_span' | 'loci' | 'lectura_profunda';
  levelOrSpeed: number; 
  durationSeconds: number;
  wpmCalculated?: number;
  comprehensionRate?: number; 
  telCalculated?: number; 
  fixationTimeAvg?: number; 
  errors?: number; 
  contentCategory?: 'fiction' | 'non_fiction' | 'technical';
  timestamp: number;
}

export interface MemoryPalace {
  id: string;
  userId: string;
  name: string;
  method: 'loci' | 'body' | 'color';
  description?: string;
  items: {
    concept: string;
    station: string;
    story: string;
    imageUrl?: string;
  }[];
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
  lastReviewed?: number;
  masteryLevel?: number;
  conceptId?: string;
}

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
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

export interface TrainingModule {
    id: string;
    title: string;
    description: string;
    icon: string;
    route: AppRoute;
    colorClass: string; 
    metrics: {
        label: string;
        key: 'maxLevel' | 'avgTime' | 'totalSessions' | 'bestScore';
        unit?: string;
    }[];
}

export enum AppRoute {
  WELCOME = 'welcome',
  LOGIN = 'login',
  REGISTER = 'register',
  RESET_PASSWORD = 'reset-password',
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
  REWARDS = 'rewards',
  TRAININGS = 'trainings',
  LEARNING_MODULE = 'learning_module'
}
