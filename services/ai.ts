import { GoogleGenAI, Type } from "@google/genai";
import { Flashcard } from "../types";

// NOTE: In a real production app, this should be handled by a backend proxy 
// to keep the API KEY secure. For this demo/MVP, we use client-side logic 
// assuming the environment variable is injected by the bundler/environment.

const API_KEY = process.env.API_KEY || ''; // Fallback for dev if not set
const ai = new GoogleGenAI({ apiKey: API_KEY });

/**
 * Indexes text content and extracts key concepts into Flashcards.
 * This simulates a RAG-lite approach by asking the LLM to act as the extractor.
 */
export const generateFlashcardsFromText = async (bookId: string, textContext: string): Promise<Flashcard[]> => {
  if (!API_KEY) {
    console.warn("No API KEY provided. Returning mock data.");
    return generateMockFlashcards(bookId);
  }

  try {
    // Limit context length for MVP to avoid token limits on basic models
    const truncatedText = textContext.substring(0, 8000);

    const prompt = `
      Analyze the following text and extract 3 to 5 core concepts, facts, or insights that are critical for understanding the material.
      Transform these concepts into Flashcards with a 'front' (Question or Trigger) and a 'back' (Answer or Explanation).
      The questions should be contextualized and test deep understanding, not just surface recall.
      
      Text to analyze:
      "${truncatedText}..."
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              front: { type: Type.STRING, description: "The question or concept trigger" },
              back: { type: Type.STRING, description: "The detailed answer or explanation" }
            },
            required: ["front", "back"]
          }
        }
      }
    });

    const generatedData = JSON.parse(response.text || '[]');

    return generatedData.map((item: any, index: number) => ({
      id: `${bookId}-card-${Date.now()}-${index}`,
      bookId: bookId,
      front: item.front,
      back: item.back,
      interval: 0,
      repetition: 0,
      efactor: 2.5, // Standard SM-2 start value
      dueDate: Date.now(), // Due immediately
    }));

  } catch (error) {
    console.error("AI Generation Error:", error);
    return generateMockFlashcards(bookId);
  }
};

// Fallback for when API Key is missing or error occurs
const generateMockFlashcards = (bookId: string): Flashcard[] => {
  return [
    {
      id: `${bookId}-mock-1`,
      bookId,
      front: "What is the 'Compound Effect' in habit formation?",
      back: "Small, smart choices + consistency + time = radical difference. Habits multiply over time like compound interest.",
      interval: 0,
      repetition: 0,
      efactor: 2.5,
      dueDate: Date.now()
    },
    {
      id: `${bookId}-mock-2`,
      bookId,
      front: "Why is the 'Plateau of Latent Potential' discouraging?",
      back: "Because results often lag behind efforts. You expect linear progress, but results are exponential, creating a 'valley of disappointment' before the breakthrough.",
      interval: 0,
      repetition: 0,
      efactor: 2.5,
      dueDate: Date.now()
    },
     {
      id: `${bookId}-mock-3`,
      bookId,
      front: "How does identity influence habits?",
      back: "True behavior change is identity change. You might start a habit because of motivation, but you'll only stick with it if it becomes part of your identity.",
      interval: 0,
      repetition: 0,
      efactor: 2.5,
      dueDate: Date.now()
    }
  ];
};