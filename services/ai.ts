import { GoogleGenAI, Type } from "@google/genai";
import { Flashcard, ReadingLog, UserStats } from "../types";

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

// --- 1. VISION: Analizar Imágenes (gemini-3-pro-preview) ---
export const analyzeImageToText = async (base64Image: string): Promise<string> => {
  if (!API_KEY) return "Error: API Key no configurada.";

  try {
    // Remove header data if present (e.g., "data:image/jpeg;base64,")
    const base64Data = base64Image.split(',')[1] || base64Image;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg', 
              data: base64Data
            }
          },
          {
            text: "Transcribe el texto visible en esta imagen con alta precisión. Ignora números de página o encabezados irrelevantes. Devuelve solo el texto limpio."
          }
        ]
      }
    });

    return response.text || "No se pudo extraer texto de la imagen.";
  } catch (error) {
    console.error("Vision Error:", error);
    return "Error al procesar la imagen.";
  }
};

// --- 2. THINKING MODE: Plan de Entrenamiento (gemini-3-pro-preview) ---
export const generatePersonalizedPlan = async (userStats: UserStats, logs: ReadingLog[]): Promise<string> => {
  if (!API_KEY) return "Error: API Key no configurada.";

  try {
    const context = `
      Estadísticas del usuario:
      - WPM Base: ${userStats.tel} (TEL)
      - Racha: ${userStats.streak} días
      - XP: ${userStats.xp}
      - Historial reciente: ${logs.length} sesiones.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Analiza profundamente el rendimiento de este lector y crea un plan de 3 pasos específico para mejorar su TEL (Tasa de Eficiencia Lectora).
      ${context}
      
      Piensa paso a paso:
      1. Identifica el cuello de botella (velocidad vs comprensión).
      2. Determina si falta consistencia o desafío.
      3. Diseña 3 ejercicios concretos.
      
      Devuelve el plan en formato Markdown limpio.`,
      config: {
        thinkingConfig: { thinkingBudget: 32768 }, // Max thinking budget
        // Do not set maxOutputTokens when using thinking
      }
    });

    return response.text || "No se pudo generar el plan.";
  } catch (error) {
    console.error("Thinking Error:", error);
    return "Error generando plan inteligente.";
  }
};

// --- 3. FAST AI: Asistente de Lectura (gemini-2.5-flash-lite) ---
export const getQuickDefinition = async (textChunk: string): Promise<string> => {
    if (!API_KEY) return "Configura tu API Key.";

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-lite-latest', // Low latency model
            contents: `Define brevemente o resume el siguiente texto en una frase corta y sencilla: "${textChunk}"`
        });
        return response.text || "Sin respuesta.";
    } catch (error) {
        return "Error de conexión.";
    }
};

// --- Existing Flashcard Generator (Updated to use standard Flash model) ---
export const generateFlashcardsFromText = async (bookId: string, textContext: string): Promise<Flashcard[]> => {
  if (!API_KEY) return generateMockFlashcards(bookId);

  try {
    const truncatedText = textContext.substring(0, 30000); 

    const prompt = `
      Actúa como un experto en aprendizaje acelerado. Extrae 3 conceptos clave del texto.
      Devuelve SOLO JSON válido.
      Texto: "${truncatedText}..."
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
              front: { type: Type.STRING },
              back: { type: Type.STRING }
            },
            required: ["front", "back"]
          }
        }
      }
    });

    let generatedData = [];
    if (response.text) generatedData = JSON.parse(response.text);

    return generatedData.map((item: any, index: number) => ({
      id: `${bookId}-card-${Date.now()}-${index}`,
      bookId: bookId,
      front: item.front,
      back: item.back,
      interval: 0,
      repetition: 0,
      efactor: 2.5,
      dueDate: Date.now(),
    }));

  } catch (error) {
    console.error("AI Generation Error:", error);
    return generateMockFlashcards(bookId);
  }
};

const generateMockFlashcards = (bookId: string): Flashcard[] => {
  return [
    {
      id: `${bookId}-mock-1`,
      bookId,
      front: "¿Cuál es la idea principal? (Mock)",
      back: "Verifica tu API Key para contenido real.",
      interval: 0,
      repetition: 0,
      efactor: 2.5,
      dueDate: Date.now()
    }
  ];
};