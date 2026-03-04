import { AppRoute, User } from '../../types.ts';
import { MascotMood } from './LectoMascot.tsx';

interface MascotState {
  mood: MascotMood;
  message: string;
}

/**
 * Determines mood and message based on current route + user data.
 * Returns null for routes where the mascot should not appear.
 */
export function getMascotState(route: AppRoute, user: User | null): MascotState | null {
  // Routes where mascot should NOT appear
  const hiddenRoutes: AppRoute[] = [
    AppRoute.LOGIN,
    AppRoute.REGISTER,
    AppRoute.RESET_PASSWORD,
    AppRoute.SETTINGS,
    AppRoute.EDIT_PROFILE,
    // Active exercises - don't distract the user
    AppRoute.READING,
    AppRoute.SCHULTE,
    AppRoute.WORD_SPAN,
    AppRoute.ASSESSMENT_READING,
    AppRoute.ASSESSMENT_QUIZ,
  ];

  if (hiddenRoutes.includes(route)) return null;

  // Welcome screen - first contact
  if (route === AppRoute.WELCOME) {
    return {
      mood: 'happy',
      message: 'Hola, soy Lecto! Tu companero de lectura. Vamos a entrenar juntos.',
    };
  }

  // Assessment intro
  if (route === AppRoute.ASSESSMENT_INTRO) {
    return {
      mood: 'thinking',
      message: 'Vamos a medir tu velocidad actual. Relax, no es un examen!',
    };
  }

  // Assessment results
  if (route === AppRoute.ASSESSMENT_RESULTS) {
    return {
      mood: 'celebrating',
      message: 'Genial! Ya tenemos tu base. A partir de aqui, solo mejoras.',
    };
  }

  // Dashboard - most contextual logic
  if (route === AppRoute.DASHBOARD && user) {
    const { stats } = user;
    const now = Date.now();
    const daysSinceActive = stats.lastActiveDate
      ? Math.floor((now - stats.lastActiveDate) / (1000 * 60 * 60 * 24))
      : 999;

    // Inactive for 3+ days
    if (daysSinceActive >= 3) {
      return {
        mood: 'sleeping',
        message: 'Te echaba de menos! Llevas ' + daysSinceActive + ' dias sin entrenar. Vamos?',
      };
    }

    // Lost streak (was active yesterday but streak is 0 or 1)
    if (daysSinceActive >= 1 && stats.streak <= 1) {
      return {
        mood: 'sad',
        message: 'Se perdio la racha... Pero hoy es un nuevo dia! Vamos a por ella.',
      };
    }

    // Good streak going
    if (stats.streak >= 7) {
      return {
        mood: 'celebrating',
        message: 'Increible! ' + stats.streak + ' dias seguidos. Eres imparable!',
      };
    }

    if (stats.streak >= 3) {
      return {
        mood: 'happy',
        message: 'Llevas ' + stats.streak + ' dias de racha. Sigue asi!',
      };
    }

    // First visit of the day (active today)
    if (daysSinceActive === 0) {
      const greetings = [
        'Listo para entrenar? Cada sesion cuenta!',
        'Buen momento para una lectura rapida.',
        'Que ejercicio hacemos hoy?',
        'Tu cerebro esta listo para mas!',
      ];
      return {
        mood: 'happy',
        message: greetings[Math.floor(Math.random() * greetings.length)],
      };
    }

    // Default
    return {
      mood: 'idle',
      message: 'Bienvenido de vuelta! Elige un ejercicio para empezar.',
    };
  }

  // Trainings list
  if (route === AppRoute.TRAININGS) {
    return {
      mood: 'thinking',
      message: 'Cada ejercicio entrena una habilidad diferente. Elige el que mas te llame.',
    };
  }

  // Library
  if (route === AppRoute.LIBRARY) {
    return {
      mood: 'happy',
      message: 'Leer es el mejor entrenamiento. Escoge algo que te guste!',
    };
  }

  // Memory training
  if (route === AppRoute.MEMORY_TRAINING) {
    return {
      mood: 'thinking',
      message: 'La memoria se entrena como un musculo. Repasa tus tarjetas!',
    };
  }

  // Loci training
  if (route === AppRoute.LOCI_TRAINING) {
    return {
      mood: 'thinking',
      message: 'El Palacio de la Memoria es una tecnica poderosa. Visualiza cada estacion.',
    };
  }

  // Rewards
  if (route === AppRoute.REWARDS) {
    return {
      mood: 'celebrating',
      message: 'Tus logros merecen premios! Mira lo que has desbloqueado.',
    };
  }

  // Learning modules
  if (route === AppRoute.LEARNING_MODULE) {
    return {
      mood: 'thinking',
      message: 'Aprender la teoria te ayuda a mejorar mas rapido. Presta atencion!',
    };
  }

  // Default: show mascot in idle state for any unhandled route
  return { mood: 'idle', message: '' };
}
