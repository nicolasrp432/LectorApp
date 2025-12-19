
import { Flashcard } from "../types";

/**
 * Algoritmo de Repetición Espaciada SM-2 Refinado
 * @param quality Calidad de respuesta: 0 (Fallo), 3 (Difícil), 4 (Media), 5 (Fácil)
 */
export const calculateSM2 = (card: Flashcard, quality: number): Partial<Flashcard> => {
  let { interval, repetition, efactor } = card;

  // 1. Actualización del Factor de Facilidad (EF)
  // Lógica: q=5 (+0.1), q=4 (0), q=3 (-0.15), q=0 (-0.8)
  let newEfactor = efactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (newEfactor < 1.3) newEfactor = 1.3;

  // 2. Cálculo del Intervalo y Repeticiones
  let newRepetition = repetition;
  let newInterval = interval;

  if (quality >= 3) {
    // Respuesta correcta (Fácil, Media o Difícil)
    if (repetition === 0) {
      newInterval = 1;
    } else if (repetition === 1) {
      newInterval = 6;
    } else {
      // Ajuste de intervalo basado en facilidad
      newInterval = Math.round(interval * newEfactor);
    }
    newRepetition++;
  } else {
    // Fallo (Rating 0): Reinicio de la curva de aprendizaje
    newRepetition = 0;
    newInterval = 1;
    // Penalización adicional de facilidad por fallo
    newEfactor = Math.max(1.3, newEfactor - 0.2);
  }

  // Límites de seguridad
  if (newInterval > 365) newInterval = 365; // Máximo 1 año entre repasos

  // 3. Próxima revisión
  const now = Date.now();
  const newDueDate = now + (newInterval * 24 * 60 * 60 * 1000);

  // 4. Determinación de Nivel de Dominio (0-5)
  let mastery = 0;
  if (newInterval > 30) mastery = 5; // Dominada
  else if (newInterval > 14) mastery = 4; // Avanzada
  else if (newInterval > 5) mastery = 3; // En Progreso
  else if (newInterval > 1) mastery = 2; // Familiar
  else mastery = 1; // Aprendiendo

  return {
    interval: newInterval,
    repetition: newRepetition,
    efactor: newEfactor,
    dueDate: newDueDate,
    lastReviewed: now,
    masteryLevel: mastery
  };
};
