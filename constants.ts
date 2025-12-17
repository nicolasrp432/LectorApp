

import { Book, QuizQuestion, Notification, Achievement, Reward, TrainingModule, AppRoute, Flashcard } from "./types";

export const AVATARS = [
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Zack",
    "https://api.dicebear.com/7.x/bottts/svg?seed=LectorBot1&backgroundColor=19e65e",
    "https://api.dicebear.com/7.x/bottts/svg?seed=MegaBrain&backgroundColor=ffdfbf",
    "https://api.dicebear.com/7.x/notionists/svg?seed=Owl&backgroundColor=e1fdfb",
];

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
        route: AppRoute.WORD_SPAN, // Links to WordSpan but user chooses Numbers inside
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
            { label: 'Tarjetas', key: 'totalSessions' }, // Using sessions as proxy or fetch distinct
            { label: 'Racha', key: 'maxLevel' } // Reusing maxLevel field for streak if applicable or generic
        ]
    }
];

export const REWARDS_LIST: Reward[] = [
    // THEMES
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
        icon: 'palette'
    },
    // AVATARS
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
        icon: 'face'
    },
    {
        id: 'avatar_ninja',
        type: 'avatar',
        title: 'Ninja Lector',
        description: 'Sigiloso y veloz.',
        cost: 1000,
        value: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ninja&clothing=graphicShirt',
        icon: 'face'
    },
    // BOOKS/CONTENT
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

export const PRESET_FLASHCARD_SETS: { id: string, title: string, cards: Partial<Flashcard>[] }[] = [
    {
        id: 'set_capitals',
        title: 'Capitales de Europa',
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
        title: 'Conceptos de Neurociencia',
        cards: [
            { front: 'Neuroplasticidad', back: 'Capacidad del cerebro para cambiar y adaptarse mediante la experiencia.' },
            { front: 'Sinapsis', back: 'Conexión entre dos neuronas que permite la transmisión de impulsos.' },
            { front: 'Hipocampo', back: 'Región del cerebro asociada con la memoria y la navegación espacial.' },
            { front: 'Dopamina', back: 'Neurotransmisor clave en el sistema de recompensa y motivación.' }
        ]
    }
];

// --- New Practice Content ---
export const PRACTICE_LIBRARY: Book[] = [
    {
        id: 'drill_easy_1',
        title: 'La Historia del Café',
        author: 'Ejercicio Nivel Fácil',
        coverUrl: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=300',
        progress: 0,
        category: 'practice',
        difficulty: 'Fácil',
        content: `La historia del café se remonta al siglo XIII, aunque el origen del café sigue sin esclarecerse. Se cree que los ancestros etíopes del actual pueblo oromo fueron los primeros en descubrir y reconocer el efecto energizante de los granos de la planta del café; sin embargo, no se ha hallado ninguna prueba directa que indique en qué parte de África crecía o qué nativos lo habrían usado como estimulante o incluso conocieran su existencia antes del siglo XVII.
        
        La leyenda más popular sobre el descubrimiento del café involucra a un pastor de cabras llamado Kaldi. Se dice que Kaldi notó que sus cabras se volvían muy enérgicas y no podían dormir por la noche después de comer las bayas de cierto árbol. Kaldi informó de sus hallazgos al abad del monasterio local, quien preparó una bebida con las bayas y descubrió que lo mantenía alerta durante las largas horas de oración vespertina. El abad compartió su descubrimiento con los otros monjes del monasterio, y el conocimiento de las energizantes bayas comenzó a extenderse.`,
        questions: [
            {
                id: 1,
                question: '¿Quién descubrió el efecto del café según la leyenda?',
                options: [
                    { id: '1a', text: 'Un pastor llamado Kaldi.', isCorrect: true, explanation: 'Correcto, observó a sus cabras comer las bayas.' },
                    { id: '1b', text: 'Los monjes del siglo XIII.', isCorrect: false, explanation: 'Ellos prepararon la bebida después, pero no fueron los primeros en notar el efecto.' },
                    { id: '1c', text: 'El pueblo Oromo.', isCorrect: false, explanation: 'Fueron los primeros en usarlo, pero la leyenda popular habla de Kaldi.' }
                ]
            }
        ]
    },
    {
        id: 'drill_medium_1',
        title: 'Inteligencia Artificial',
        author: 'Ejercicio Nivel Medio',
        coverUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=300',
        progress: 0,
        category: 'practice',
        difficulty: 'Medio',
        content: `La inteligencia artificial (IA) es la inteligencia expresada por máquinas, sus procesadores y sus softwares, que serían los análogos al cuerpo, el cerebro y la mente, respectivamente, a diferencia de la inteligencia natural demostrada por humanos y ciertos animales con cerebros complejos. En las ciencias de la computación, una máquina «inteligente» ideal es un agente flexible que percibe su entorno y lleva a cabo acciones que maximicen sus posibilidades de éxito en algún objetivo o tarea.
        
        Coloquialmente, el término inteligencia artificial se aplica a menudo a las máquinas o las computadoras que imitan funciones «cognitivas» que los humanos asocian con otras mentes humanas, como «aprender» y «resolver problemas». A medida que las máquinas se vuelven cada vez más capaces, tecnología que alguna vez se pensó que requería de inteligencia se elimina de la definición. Por ejemplo, el reconocimiento óptico de caracteres ya no se percibe como un ejemplo de la «inteligencia artificial» habiéndose convertido en una tecnología común.`,
        questions: [
            {
                id: 1,
                question: '¿Qué define a una máquina inteligente ideal?',
                options: [
                    { id: '2a', text: 'Un agente que maximiza sus posibilidades de éxito.', isCorrect: true, explanation: 'Un agente flexible que percibe su entorno y actúa para maximizar éxito.' },
                    { id: '2b', text: 'Que puede sentir emociones humanas.', isCorrect: false, explanation: 'El texto no menciona emociones, sino funciones cognitivas.' },
                    { id: '2c', text: 'Que tiene cuerpo biológico.', isCorrect: false, explanation: 'Es análoga, pero artificial.' }
                ]
            }
        ]
    },
    {
        id: 'drill_hard_1',
        title: 'Mecánica Cuántica',
        author: 'Ejercicio Nivel Difícil',
        coverUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=300',
        progress: 0,
        category: 'practice',
        difficulty: 'Difícil',
        content: `La mecánica cuántica es la rama de la física que estudia la naturaleza a escalas espaciales pequeñas, los sistemas atómicos, subatómicos, sus interacciones con la radiación electromagnética y otras fuerzas, en términos de cantidades observables. Se basa en la observación de que todas las formas de energía se liberan en unidades discretas o paquetes llamados cuantos. Sorprendentemente, la teoría cuántica solo permite normalmente cálculos probabilísticos o estadísticos de las características observadas de las partículas elementales, entendidos en términos de funciones de onda.
        
        La ecuación de Schrödinger desempeña el papel en la mecánica cuántica que las leyes de Newton y la conservación de la energía desempeñan en la mecánica clásica. Es decir, predice el comportamiento futuro de un sistema dinámico y es una ecuación de onda en términos de la función de onda la cual predice analíticamente la probabilidad precisa de los eventos o resultados.`,
        questions: [
            {
                id: 1,
                question: '¿Qué predice la ecuación de Schrödinger?',
                options: [
                    { id: '3a', text: 'La probabilidad precisa de eventos futuros.', isCorrect: true, explanation: 'En términos de la función de onda.' },
                    { id: '3b', text: 'La posición exacta de un electrón.', isCorrect: false, explanation: 'Solo predice probabilidades, no posiciones exactas deterministas.' },
                    { id: '3c', text: 'La gravedad a escala macroscópica.', isCorrect: false, explanation: 'Eso corresponde a la relatividad general o mecánica clásica.' }
                ]
            }
        ]
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