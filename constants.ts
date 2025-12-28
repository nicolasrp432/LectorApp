
import { Book, QuizQuestion, Notification, Achievement, Reward, TrainingModule, AppRoute, Flashcard } from "./types.ts";

export const AVATARS = [
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Zack",
    "https://api.dicebear.com/7.x/bottts/svg?seed=LectorBot1&backgroundColor=19e65e",
    "https://api.dicebear.com/7.x/bottts/svg?seed=MegaBrain&backgroundColor=ffdfbf",
    "https://api.dicebear.com/7.x/notionists/svg?seed=Owl&backgroundColor=e1fdfb",
];

export const TRAINING_GUIDES = {
    schulte: {
        title: "Tabla Schulte",
        skill: "Visión Periférica",
        difficulty: "Media",
        why: "Entrena al cerebro para procesar información visual sin mover los ojos, reduciendo los saltos oculares innecesarios.",
        steps: [
            "Fija tu mirada en el punto central.",
            "No muevas los ojos hacia los números.",
            "Localiza la secuencia usando tu visión lateral.",
            "Pulsa los números en orden lo más rápido posible."
        ],
        errors: [
            "Seguir cada número con la mirada (lectura tradicional).",
            "Mover la cabeza.",
            "Subvocalizar los números al encontrarlos."
        ],
        proTip: "Imagina que tu mirada es una luz de gran angular que ilumina toda la tabla a la vez."
    },
    word_span: {
        title: "Cadenas Secuenciales",
        skill: "Memoria de Trabajo",
        difficulty: "Alta",
        why: "Aumenta la 'RAM' de tu cerebro, permitiéndote sostener más información mientras procesas nuevos datos.",
        steps: [
            "Observa los elementos que aparecen.",
            "Crea una historia mental rápida que los una.",
            "Al finalizar, reconstruye el orden exacto.",
            "Sube de nivel para añadir más elementos."
        ],
        errors: [
            "Intentar repetir la lista mecánicamente sin asociar.",
            "Distraerse con el elemento anterior.",
            "Dudar demasiado al elegir."
        ],
        proTip: "Usa el 'Chunking': agrupa los elementos de 3 en 3 como si fueran números de teléfono."
    },
    reading: {
        title: "Lectura Adaptativa",
        skill: "Velocidad de Procesamiento",
        difficulty: "Variable",
        why: "Desacopla la vista del habla. Te permite entender conceptos a la velocidad de la luz, no a la velocidad de la voz.",
        steps: [
            "Sigue el marcador visual (foco rojo).",
            "Mantén un ritmo constante sin retroceder.",
            "Enfócate en captar 'ideas', no palabras sueltas.",
            "Responde el test final para validar tu retención."
        ],
        errors: [
            "Releer frases (regresión).",
            "Pronunciar mentalmente cada palabra.",
            "Perder la concentración en textos largos."
        ],
        proTip: "Si sientes que vas demasiado rápido para entender, mantén la velocidad 5 segundos más; tu cerebro suele adaptarse."
    },
    loci: {
        title: "Palacio de la Memoria",
        skill: "Codificación Espacial",
        difficulty: "Alta",
        why: "Aprovecha la evolución humana: recordamos mejor 'dónde' estuvimos que 'qué' leímos.",
        steps: [
            "Elige un lugar que conozcas a la perfección.",
            "Recorre mentalmente las 'estaciones' asignadas.",
            "Visualiza una escena bizarra para cada concepto.",
            "Usa la imagen generada por IA para anclar el recuerdo."
        ],
        errors: [
            "Imágenes demasiado comunes o aburridas.",
            "No seguir un orden lógico en el recorrido.",
            "Intentar memorizar demasiados datos sin repasar."
        ],
        proTip: "Cuanto más ridícula, gigante o emocional sea la imagen de la IA, más imposible será olvidarla."
    },
    flashcards: {
        title: "Supermemoria (SRS)",
        skill: "Retención a Largo Plazo",
        difficulty: "Baja",
        why: "Utiliza el algoritmo SM-2 para vencer la curva del olvido, preguntándote justo antes de que se te borre el dato.",
        steps: [
            "Lee el frente de la tarjeta y evoca la respuesta.",
            "Revela la solución.",
            "Evalúa tu honestidad: ¿fue fácil o difícil?",
            "Confía en el algoritmo para la próxima revisión."
        ],
        errors: [
            "Ser demasiado indulgente con uno mismo.",
            "Saltarse días de repaso (rompe la curva).",
            "Poner demasiada información en una sola tarjeta."
        ],
        proTip: "Si una tarjeta te falla 3 veces seguidas, bórrala y redáctala de una forma más sencilla o visual."
    }
};

export const TRAINING_MODULES: TrainingModule[] = [
    {
        id: 'schulte',
        title: 'Tabla Schulte',
        description: 'Expande tu visión periférica y mejora el enfoque sostenido.',
        icon: 'grid_view',
        route: AppRoute.SCHULTE,
        colorClass: 'text-blue-500 bg-blue-500/10',
        metrics: [
            { label: 'Nivel Máx', key: 'maxLevel' },
            { label: 'Tiempo Prom', key: 'avgTime', unit: 's' }
        ]
    },
    {
        id: 'rsvp',
        title: 'Lectura Rápida',
        description: 'Presentación Visual Rápida para eliminar la subvocalización.',
        icon: 'speed',
        route: AppRoute.READING,
        colorClass: 'text-green-500 bg-green-500/10',
        metrics: [
            { label: 'Sesiones', key: 'totalSessions' },
            { label: 'Mejor WPM', key: 'bestScore', unit: 'wpm' }
        ]
    },
    {
        id: 'word_span',
        title: 'Cadenas Secuenciales',
        description: 'Potencia tu memoria de trabajo recordando secuencias completas.',
        icon: 'pin',
        route: AppRoute.WORD_SPAN, 
        colorClass: 'text-pink-500 bg-pink-500/10',
        metrics: [
            { label: 'Span Máx', key: 'maxLevel' },
            { label: 'Intentos', key: 'totalSessions' }
        ]
    },
    {
        id: 'loci',
        title: 'Palacio de la Memoria',
        description: 'Técnica avanzada para memorizar listas y conceptos complejos.',
        icon: 'castle',
        route: AppRoute.LOCI_TRAINING,
        colorClass: 'text-purple-500 bg-purple-500/10',
        metrics: [
            { label: 'Precisión', key: 'bestScore', unit: '%' },
            { label: 'Palacios', key: 'totalSessions' }
        ]
    },
    {
        id: 'flashcards',
        title: 'Supermemoria',
        description: 'Repaso espaciado (SRS) para retención a largo plazo.',
        icon: 'psychology',
        route: AppRoute.MEMORY_TRAINING,
        colorClass: 'text-orange-500 bg-orange-500/10',
        metrics: [
            { label: 'Tarjetas', key: 'totalSessions' }, 
            { label: 'Racha', key: 'maxLevel' } 
        ]
    }
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
        id: 'theme_orange',
        type: 'theme',
        title: 'Atardecer Solar',
        description: 'Tonos cálidos para lectura nocturna.',
        cost: 600,
        value: '#f97316',
        icon: 'palette'
    },
    {
        id: 'theme_ocean',
        type: 'theme',
        title: 'Profundidad Oceánica',
        description: 'Azul profundo para máxima concentración.',
        cost: 750,
        value: '#0ea5e9',
        icon: 'palette',
        requiredAchievementId: 'streak_7' 
    },
    {
        id: 'theme_crimson',
        type: 'theme',
        title: 'Furia Escarlata',
        description: 'Rojo vibrante para sesiones de alta energía.',
        cost: 1000,
        value: '#ef4444',
        icon: 'palette',
        requiredAchievementId: 'speed_demon' 
    },
    {
        id: 'theme_emerald',
        type: 'theme',
        title: 'Bosque Esmeralda',
        description: 'Verde bosque para calma profunda.',
        cost: 800,
        value: '#10b981',
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
        id: 'avatar_wizard',
        type: 'avatar',
        title: 'Archimago',
        description: 'Para los maestros de la memoria.',
        cost: 1200,
        value: 'https://api.dicebear.com/7.x/notionists/svg?seed=Wizard',
        icon: 'face',
        requiredAchievementId: 'focus_master'
    },
    {
        id: 'avatar_ninja',
        type: 'avatar',
        title: 'Ninja Lector',
        description: 'Sigiloso y veloz.',
        cost: 1000,
        value: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ninja&clothing=graphicShirt',
        icon: 'face',
        requiredAchievementId: 'streak_7'
    },
    {
        id: 'avatar_god',
        type: 'avatar',
        title: 'Deidad Cognitiva',
        description: 'El avatar definitivo.',
        cost: 5000,
        value: 'https://api.dicebear.com/7.x/bottts/svg?seed=GoldenGod&backgroundColor=f59e0b',
        icon: 'face',
        requiredAchievementId: 'gold_brain'
    },
    {
        id: 'book_art_war',
        type: 'book',
        title: 'El Arte de la Guerra',
        description: 'Texto clásico de estrategia desbloqueado en librería.',
        cost: 300,
        value: 'book_id_art_war',
        icon: 'menu_book'
    },
    {
        id: 'book_sherlock',
        type: 'book',
        title: 'Estudio en Escarlata',
        description: 'La primera aventura de Sherlock Holmes.',
        cost: 450,
        value: 'book_id_sherlock',
        icon: 'local_library'
    }
];

export const ACHIEVEMENTS_LIST: Achievement[] = [
    { id: 'first_step', title: 'Primer Paso', description: 'Completa tu primera sesión de lectura.', icon: 'footprint' },
    { id: 'speed_demon', title: 'Demonio Veloz', description: 'Lee a más de 500 WPM.', icon: 'speed' },
    { id: 'focus_master', title: 'Maestro del Foco', description: 'Completa una Tabla Schulte Nivel 5.', icon: 'visibility' },
    { id: 'streak_3', title: 'Compromiso Inicial', description: 'Mantén una racha de 3 días.', icon: 'local_fire_department' },
    { id: 'streak_7', title: 'Constancia Pura', description: 'Mantén una racha de 7 días.', icon: 'local_fire_department' },
    { id: 'gold_brain', title: 'Cerebro de Oro', description: 'Acumula más de 5000 XP.', icon: 'workspace_premium' },
    { id: 'span_god', title: 'Memoria Infinita', description: 'Alcanza un Word Span de Nivel 10.', icon: 'pin' },
];

export const PRESET_FLASHCARD_SETS: { id: string, title: string, icon: string, color: string, cards: Partial<Flashcard>[] }[] = [
    {
        id: 'set_capitals',
        title: 'Capitales de Europa',
        icon: 'public',
        color: 'bg-blue-500',
        cards: [
            { front: 'Capital de Francia', back: 'París' },
            { front: 'Capital de Alemania', back: 'Berlín' },
            { front: 'Capital de Italia', back: 'Roma' },
            { front: 'Capital de España', back: 'Madrid' },
            { front: 'Capital de Portugal', back: 'Lisboa' }
        ]
    },
    {
        id: 'set_neuroscience',
        title: 'Neurociencia',
        icon: 'psychology',
        color: 'bg-purple-500',
        cards: [
            { front: 'Neuroplasticidad', back: 'Capacidad del cerebro para cambiar y adaptarse mediante la experiencia.' },
            { front: 'Sinapsis', back: 'Conexión entre dos neuronas que permite la transmisión de impulsos.' },
            { front: 'Hipocampo', back: 'Región del cerebro asociada con la memoria y la navegación espacial.' },
            { front: 'Dopamina', back: 'Neurotransmisor clave en el sistema de recompensa y motivación.' }
        ]
    },
    {
        id: 'set_periodic_table',
        title: 'Tabla Periódica',
        icon: 'science',
        color: 'bg-emerald-500',
        cards: [
            { front: 'H', back: 'Hidrógeno (1)' },
            { front: 'He', back: 'Helio (2)' },
            { front: 'Li', back: 'Litio (3)' },
            { front: 'Be', back: 'Berilio (4)' },
            { front: 'B', back: 'Boro (5)' },
            { front: 'C', back: 'Carbono (6)' },
            { front: 'N', back: 'Nitrógeno (7)' },
            { front: 'O', back: 'Oxígeno (8)' },
            { front: 'F', back: 'Flúor (9)' },
            { front: 'Ne', back: 'Neón (10)' }
        ]
    }
];

export const PRACTICE_LIBRARY: Book[] = [
    {
        id: 'drill_easy_1',
        title: 'La Historia del Café',
        author: 'Ejercicio Nivel Fácil',
        coverUrl: "https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=300",
        progress: 0,
        category: 'practice',
        difficulty: 'Fácil',
        content: `La historia del café se remonta al siglo XIII...`,
        questions: []
    }
];

export const ASSESSMENT_TEXT_CONTENT = `La memoria no es como una grabadora...`;

export const ASSESSMENT_QUESTIONS: QuizQuestion[] = [];

export const MOCK_QUIZ_QUESTION: QuizQuestion = {
    id: 101,
    question: "¿Qué técnica ayuda a reducir la subvocalización?",
    imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1000",
    options: [
        { id: "a", text: "Leer en voz alta.", isCorrect: false },
        { id: "b", text: "Presentación Visual Rápida (RSVP).", isCorrect: true, explanation: "Fuerza al cerebro a procesar visualmente sin tiempo para pronunciar." },
        { id: "c", text: "Releer cada párrafo dos veces.", isCorrect: false }
    ]
};

export const MOCK_USER_STATS = {
  streak: 12,
  tel: 450,
  lastActiveDate: Date.now(),
  xp: 1250,
  maxSchulteLevel: 1,
  maxWordSpan: 3
};

export const MOCK_NOTIFICATIONS: Notification[] = [];

export const SUGGESTED_BOOKS: Book[] = [];
