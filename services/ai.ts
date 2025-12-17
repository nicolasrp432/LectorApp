import { GoogleGenAI, Type } from "@google/genai";
import { Flashcard } from "../types";

// Acceso seguro a la variable de entorno
const getApiKey = () => {
    try {
        // @ts-ignore
        if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
            // @ts-ignore
            return process.env.API_KEY;
        }
    } catch (e) {
        console.warn("Could not access process.env");
    }
    return '';
};

const API_KEY = getApiKey();
const ai = new GoogleGenAI({ apiKey: API_KEY });

/**
 * Procesa el texto del libro usando Gemini para extraer conceptos clave.
 */
export const generateFlashcardsFromText = async (bookId: string, textContext: string): Promise<Flashcard[]> => {
  if (!API_KEY) {
    console.warn("No API KEY provided. Returning mock data.");
    return generateMockFlashcards(bookId);
  }

  try {
    // Truncamos el texto si es inmensamente largo para respetar el límite de tokens inicial
    // Gemini 2.5 Flash tiene una ventana de contexto grande, pero por seguridad en MVP:
    const truncatedText = textContext.substring(0, 30000); 

    const prompt = `
      Actúa como un experto en aprendizaje acelerado y comprensión lectora.
      Analiza el siguiente texto y extrae 5 conceptos fundamentales, hechos clave o "insights".
      
      Genera una lista de Flashcards. 
      - 'front': Una pregunta desafiante o el término clave.
      - 'back': La explicación concisa, la respuesta o el significado profundo.
      
      El objetivo es que el usuario memorice lo más importante de este texto.
      Devuelve SOLO JSON válido.

      Texto a analizar:
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
              front: { type: Type.STRING, description: "La pregunta o concepto" },
              back: { type: Type.STRING, description: "La respuesta o explicación detallada" }
            },
            required: ["front", "back"]
          }
        }
      }
    });

    let generatedData = [];
    
    // Parseo seguro de la respuesta JSON
    if (response.text) {
        generatedData = JSON.parse(response.text);
    }

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
    // Fallback a datos mock si la API falla o no hay cuota
    return generateMockFlashcards(bookId);
  }
};

// Fallback por si falla la API
const generateMockFlashcards = (bookId: string): Flashcard[] => {
  return [
    {
      id: `${bookId}-mock-1`,
      bookId,
      front: "¿Cuál es la idea principal de este texto?",
      back: "La IA no pudo procesar el texto real, así que esta es una tarjeta de ejemplo. Verifica tu API Key.",
      interval: 0,
      repetition: 0,
      efactor: 2.5,
      dueDate: Date.now()
    }
  ];
};