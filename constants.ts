import { Book, QuizQuestion, Notification, Achievement, Reward } from "./types";

export const AVATARS = [
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Zack",
    "https://api.dicebear.com/7.x/bottts/svg?seed=LectorBot1&backgroundColor=19e65e",
    "https://api.dicebear.com/7.x/bottts/svg?seed=MegaBrain&backgroundColor=ffdfbf",
    "https://api.dicebear.com/7.x/notionists/svg?seed=Owl&backgroundColor=e1fdfb",
];

export const REWARDS_LIST: Reward[] = [
    {
        id: 'theme_purple',
        type: 'theme',
        title: 'Tema Neón Púrpura',
        description: 'Interfaz futurista en tonos morados.',
        cost: 500,
        value: '#a855f7',
        icon: 'palette'
    },
    {
        id: 'avatar_cyborg',
        type: 'avatar',
        title: 'Avatar Cyborg',
        description: 'Imagen de perfil exclusiva.',
        cost: 800,
        value: 'https://api.dicebear.com/7.x/bottts/svg?seed=CyborgX&backgroundColor=a855f7',
        icon: 'face'
    },
    {
        id: 'book_art_war',
        type: 'book',
        title: 'El Arte de la Guerra',
        description: 'Texto clásico de estrategia.',
        cost: 300,
        value: 'book_id_art_war',
        icon: 'menu_book'
    }
];

export const ASSESSMENT_TEXT_CONTENT = `
La memoria no es como una grabadora que reproduce fielmente el pasado. Es más bien un proceso reconstructivo, similar a armar un rompecabezas con piezas que a veces faltan o cambian de forma. Cada vez que recordamos algo, nuestro cerebro reescribe ligeramente esa memoria, mezclando detalles originales con información nueva o emociones actuales.

Los neurocientíficos han descubierto que el acto de olvidar es tan importante como el de recordar. El olvido permite al cerebro eliminar información irrelevante para centrarse en lo que es vital para la supervivencia y la toma de decisiones. Sin esta capacidad de poda sináptica, nuestro sistema cognitivo se saturaría de ruido, dificultando el aprendizaje de nuevos conceptos.

Existen técnicas para mejorar la retención, como la repetición espaciada y el método de loci. Estas estrategias aprovechan la forma natural en que el cerebro codifica la información espacial y temporal, fortaleciendo las conexiones neuronales antes de que se debiliten. En resumen, la memoria es una habilidad entrenable, no un rasgo fijo e inmutable.
`;

export const ASSESSMENT_QUESTIONS: QuizQuestion[] = [
    {
        id: 1,
        question: "¿Cómo describe el texto el funcionamiento de la memoria?",
        options: [
            { id: "a", text: "Como una grabadora fiel.", isCorrect: false },
            { id: "b", text: "Como un proceso reconstructivo.", isCorrect: true, explanation: "El texto la compara con armar un rompecabezas." },
            { id: "c", text: "Como un archivo digital permanente.", isCorrect: false }
        ]
    },
    {
        id: 2,
        question: "¿Por qué es importante el olvido según los neurocientíficos?",
        options: [
            { id: "a", text: "Elimina información irrelevante para evitar saturación.", isCorrect: true, explanation: "Permite centrarse en lo vital." },
            { id: "b", text: "Es un fallo del sistema cognitivo.", isCorrect: false },
            { id: "c", text: "Provoca la pérdida de recuerdos de la infancia.", isCorrect: false }
        ]
    },
    {
        id: 3,
        question: "¿Qué técnicas se mencionan para mejorar la retención?",
        options: [
            { id: "a", text: "Lectura rápida y subrayado.", isCorrect: false },
            { id: "b", text: "Hipnosis y meditación.", isCorrect: false },
            { id: "c", text: "Repetición espaciada y método de loci.", isCorrect: true, explanation: "Aprovechan la codificación espacial y temporal." }
        ]
    }
];

export const MOCK_QUIZ_QUESTION: QuizQuestion = {
    id: 101,
    question: "¿Qué técnica ayuda a reducir la subvocalización?",
    imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1000&auto=format&fit=crop",
    options: [
        { id: "a", text: "Leer en voz alta.", isCorrect: false },
        { id: "b", text: "Presentación Visual Rápida (RSVP).", isCorrect: true, explanation: "Fuerza al cerebro a procesar visualmente sin tiempo para pronunciar." },
        { id: "c", text: "Releer cada párrafo dos veces.", isCorrect: false }
    ]
};

export const ACHIEVEMENTS_LIST: Achievement[] = [
    { id: 'first_step', title: 'Primer Paso', description: 'Completa tu primera sesión de lectura.', icon: 'footprint' },
    { id: 'speed_demon', title: 'Demonio Veloz', description: 'Lee a más de 500 WPM.', icon: 'speed' },
    { id: 'focus_master', title: 'Maestro del Foco', description: 'Completa una Tabla Schulte 5x5 en menos de 30s.', icon: 'visibility' },
];

export const MOCK_USER_STATS = {
  streak: 12,
  tel: 450,
  lastActiveDate: Date.now(),
  xp: 1250,
  maxSchulteLevel: 1,
  maxWordSpan: 3
};

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    title: "¡Racha en peligro!",
    message: "No has entrenado hoy. Completa una sesión rápida.",
    type: "warning",
    timestamp: Date.now() - 3600000,
    isRead: false
  },
  {
    id: "2",
    title: "Análisis completado",
    message: "La IA ha extraído 5 nuevos conceptos clave.",
    type: "success",
    timestamp: Date.now() - 86400000,
    isRead: false
  }
];

export const SUGGESTED_BOOKS: Book[] = [
  {
    id: "1",
    title: "El Gran Gatsby",
    author: "F. Scott Fitzgerald",
    coverUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop",
    progress: 45,
    content: "En mis años mozos y más vulnerables mi padre me dio un consejo que no ha dejado de darme vueltas en la cabeza..."
  },
  {
    id: "2",
    title: "Hábitos Atómicos",
    author: "James Clear",
    coverUrl: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=800&auto=format&fit=crop",
    progress: 12,
    content: "Los cambios pequeños a menudo parecen no tener importancia hasta que se acumulan..."
  },
  {
    id: "3",
    title: "Pensar rápido, pensar despacio",
    author: "Daniel Kahneman",
    coverUrl: "https://images.unsplash.com/photo-1555449372-88091d349692?q=80&w=800&auto=format&fit=crop",
    progress: 0,
    content: "Durante décadas, la mayoría de los psicólogos creyeron que los seres humanos eran racionales..."
  },
  {
    id: "4",
    title: "Sapiens",
    author: "Yuval Noah Harari",
    coverUrl: "https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=800&auto=format&fit=crop",
    progress: 0,
    content: "Hace 100.000 años, al menos seis especies de humanos habitaban la Tierra..."
  },
  {
    id: "5",
    title: "Don Quijote",
    author: "Miguel de Cervantes",
    coverUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Title_page_first_edition_Don_Quijote.jpg/800px-Title_page_first_edition_Don_Quijote.jpg",
    progress: 0,
    content: "En un lugar de la Mancha, de cuyo nombre no quiero acordarme..."
  }
];