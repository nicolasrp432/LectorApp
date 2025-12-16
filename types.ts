export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  progress: number;
  totalPages?: number;
  totalTime?: string;
  content?: string; // Contenido para el lector
  isAnalyzed?: boolean; // Si la IA lo ha procesado
}

export interface UserPreferences {
  dailyGoalMinutes: number;
  targetWPM: number;
  difficultyLevel: 'Básico' | 'Intermedio' | 'Avanzado';
  notificationsEnabled: boolean;
  soundEnabled: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: number; // Timestamp
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  stats: UserStats;
  joinedDate: number;
  baselineWPM: number;
  level: string; // Ej: "Iniciado", "Lector Ágil", "Maestro Cognitivo"
  preferences: UserPreferences;
  achievements: Achievement[];
}

export interface UserStats {
  streak: number;
  tel: number; // Tasa de Eficiencia Lectora
  lastActiveDate: number; 
  xp: number; 
  // Estadísticas opcionales para UI
  telChange?: number;
  wpm?: number;
  wpmChange?: number;
  comprehension?: number;
  comprehensionChange?: number;
  recall?: number;
  recallChange?: number;
  retention?: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  timestamp: number;
  isRead: boolean;
}

// DB Table: Metricas_Lectura
export interface ReadingLog {
  id: string;
  userId: string;
  exerciseType: 'schulte' | 'reading_session' | 'rsvp';
  levelOrSpeed: number; // Tamaño rejilla o WPM
  durationSeconds: number;
  wpmCalculated?: number;
  comprehensionRate?: number; // 0-100
  telCalculated?: number; // WPM * (Comprensión/100)
  timestamp: number;
}

// DB Table: Metricas_Retencion
export interface RetentionLog {
  id: string;
  userId: string;
  flashcardId: string;
  rating: number; // 0-5
  intervalDays: number;
  timestamp: number;
}

export interface Flashcard {
  id: string;
  bookId: string;
  front: string; // Pregunta / Concepto
  back: string;  // Respuesta / Definición
  interval: number; // Días hasta el próximo repaso
  repetition: number; 
  efactor: number; // Factor de Facilidad (SM-2)
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
  ASSESSMENT_INTRO = 'assessment_intro',
  ASSESSMENT_QUIZ = 'assessment_quiz',
  DASHBOARD = 'dashboard',
  LIBRARY = 'library',
  READING = 'reading',
  SCHULTE = 'schulte',
  MEMORY_TRAINING = 'memory_training',
  LOCI_TRAINING = 'loci_training',
  SETTINGS = 'settings',
  EDIT_PROFILE = 'edit_profile',
}