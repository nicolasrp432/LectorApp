
import { GoogleGenAI, Type } from "@google/genai";
import { Flashcard, ReadingLog, UserStats, ImageSize, QuizQuestion } from "../types.ts";

// --- COACH IA: Chat con Gemini 3 Pro ---
export const startCoachChat = (history: {role: 'user' | 'model', parts: {text: string}[]}[]) => {
    // Fix: Always use process.env.API_KEY directly when initializing the @google/genai client
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return ai.chats.create({
        model: 'gemini-3-pro-preview',
        history: history,
        config: {
            systemInstruction: `Eres el "Lector Coach", un experto en neurociencia cognitiva, lectura rápida y técnicas de supermemoria. 
            Tu misión es ayudar al usuario a mejorar su Tasa de Eficiencia Lectora (TEL) y su retención.
            REGLAS:
            1. No generes planes de entrenamiento automáticos con listas de días.
            2. Da consejos prácticos: cómo evitar la subvocalización, cómo usar el palacio de la memoria, cómo mejorar el enfoque.
            3. Sé un mentor cercano, motivador y directo.
            4. Responde de forma concisa pero útil.
            5. Si te preguntan sobre su progreso, anímalos a revisar su Dashboard.`,
        },
    });
};

// --- MEMORIA: Generador de Escenas Bizarras ---
export const generateBizarreStory = async (concept: string, location: string, method: string, context?: string): Promise<string> => {
  // Fix: Always use process.env.API_KEY directly when initializing the @google/genai client
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const prompt = `
      Actúa como un maestro de mnemotecnia y aprendizaje acelerado.
      OBJETIVO: Crear una escena mental para recordar el concepto "${concept}" en la ubicación "${location}" usando el método de "${method}".
      
      CONTEXTO DEL LUGAR: ${context || 'Ambiente estándar'}

      REGLAS CRÍTICAS PARA LA MEMORIA:
      1. EXAGERACIÓN: Haz que los objetos sean gigantes o minúsculos.
      2. ACCIÓN BIZARRA: Debe ocurrir algo ridículo, violento, cómico o imposible.
      3. EMOCIÓN/SENTIDOS: Incluye olores, sonidos fuertes o una emoción intensa (miedo, risa, asco).
      4. BREVEDAD: Máximo 3 frases.
      
      EJEMPLO: Si es "Dopamina" en "Cocina", di: "Un grifo gigante escupe helado de arcoíris explosivo que te hace bailar sin parar mientras la nevera aplaude con manos humanas".
      
      Respuesta:
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.9,
        topP: 0.95
      }
    });

    return response.text || "Imagina una conexión impactante aquí.";
  } catch (error) {
    console.error("AI Memory Story Error:", error);
    return "Imagina este concepto cobrando vida propia en este lugar.";
  }
};

// --- IMAGEN: Generador de Imágenes Mnemotécnicas ---
export const generateMemoryImage = async (story: string, location: string, size: ImageSize = '1K'): Promise<string | null> => {
  // Fix: Always use process.env.API_KEY directly when initializing the @google/genai client
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const prompt = `Una escena mental de mnemotecnia bizarra y exagerada. 
    Descripción: ${story}. 
    Ubicación: ${location}. 
    Estilo visual: Surrealista, hiperrealista, colores vibrantes, dramático.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: size
        }
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const base64EncodeString: string = part.inlineData.data;
        return `data:image/png;base64,${base64EncodeString}`;
      }
    }
    return null;
  } catch (error: any) {
    console.error("Image Generation Error:", error);
    throw error;
  }
};

// --- EVALUACIÓN: Generar cuestionario de comprensión con IA ---
export const generateReadingQuiz = async (content: string): Promise<QuizQuestion[]> => {
  // Fix: Always use process.env.API_KEY directly when initializing the @google/genai client
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const prompt = `
      Genera un cuestionario de comprensión lectora de 3 preguntas para el siguiente texto.
      Devuelve la respuesta estrictamente en formato JSON con la siguiente estructura:
      [
        {
          "id": 1,
          "question": "¿Pregunta?",
          "options": [
            { "id": "a", "text": "opcion 1", "isCorrect": true, "explanation": "..." },
            { "id": "b", "text": "opcion 2", "isCorrect": false, "explanation": "..." },
            { "id": "c", "text": "opcion 3", "isCorrect": false, "explanation": "..." }
          ]
        }
      ]
      TEXTO:
      ${content.substring(0, 4000)}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("AI Reading Quiz Error:", error);
    return [];
  }
};

// --- VISION: Analizar Imágenes ---
export const analyzeImageToText = async (base64Image: string): Promise<string> => {
  // Fix: Always use process.env.API_KEY directly when initializing the @google/genai client
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const base64Data = base64Image.split(',')[1] || base64Image;
    // Fix: Use gemini-3-flash-preview for basic multimodal transcription tasks (image-to-text) as per task guidelines.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Data } },
          { text: "Transcribe el texto visible en esta imagen con alta precisión. Ignora números de página o encabezados irrelevantes. Devuelve solo el texto limpio." }
        ]
      }
    });
    return response.text || "No se pudo extraer texto de la imagen.";
  } catch (error) {
    return "No se pudo procesar la imagen.";
  }
};

// --- FLASHCARDS: Generación con Gemini ---
export const generateFlashcardsFromText = async (userId: string, sourceText: string, isTopic: boolean = false): Promise<Flashcard[]> => {
  // Fix: Always use process.env.API_KEY directly when initializing the @google/genai client
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const prompt = isTopic 
      ? `Genera 5 flashcards educativas sobre el tema: "${sourceText}". Cada flashcard debe tener un frente (pregunta/concepto) y un dorso (respuesta/explicación). Devuelve solo el JSON.`
      : `Extrae 5 conceptos clave del siguiente texto y conviértelos en flashcards (pregunta en frente, respuesta en dorso): "${sourceText.substring(0, 4000)}". Devuelve solo el JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
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

    const data = JSON.parse(response.text || '[]');
    return data.map((item: any, index: number) => ({
      id: `ai-${Date.now()}-${index}`,
      userId,
      front: item.front,
      back: item.back,
      interval: 0,
      repetition: 0,
      efactor: 2.5,
      dueDate: Date.now()
    }));
  } catch (error) {
    console.error("AI Flashcard Error:", error);
    return [];
  }
};

export const editImage = async (base64Image: string, prompt: string): Promise<string | null> => {
  // Fix: Always use process.env.API_KEY directly when initializing the @google/genai client
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const matches = base64Image.match(/^data:([^;]+);base64,(.+)$/);
    const mimeType = matches ? matches[1] : 'image/png';
    const base64Data = matches ? matches[2] : base64Image;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: mimeType } },
          { text: prompt },
        ],
      },
    });

    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Image Edit Error:", error);
    return null;
  }
};
