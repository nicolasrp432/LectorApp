import { Flashcard } from "../types";

/**
 * Calculates the new state of a flashcard based on the user's quality rating (0-5).
 * Based on the SM-2 Algorithm.
 * 
 * @param card Current flashcard state
 * @param quality User rating: 0 (Blackout) to 5 (Perfect recall)
 * @returns Updated partial flashcard properties
 */
export const calculateSM2 = (card: Flashcard, quality: number): Partial<Flashcard> => {
  let { interval, repetition, efactor } = card;

  // 1. Update Easiness Factor (EF)
  // Formula: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  // EF cannot go below 1.3
  let newEfactor = efactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (newEfactor < 1.3) newEfactor = 1.3;

  // 2. Update Repetition & Interval
  let newRepetition = repetition;
  let newInterval = interval;

  if (quality >= 3) {
    // Correct response
    if (repetition === 0) {
      newInterval = 1;
    } else if (repetition === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * efactor);
    }
    newRepetition++;
  } else {
    // Incorrect response - Reset interval
    newRepetition = 0;
    newInterval = 1;
  }

  // Calculate Due Date (Current Time + Interval in Days)
  const newDueDate = Date.now() + (newInterval * 24 * 60 * 60 * 1000);

  return {
    interval: newInterval,
    repetition: newRepetition,
    efactor: newEfactor,
    dueDate: newDueDate
  };
};