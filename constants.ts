
import { Book, QuizQuestion, Notification, Achievement, Reward, TrainingModule, AppRoute, Flashcard, LearningModule } from "./types.ts";

export const AVATARS = [
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Zack",
    "https://api.dicebear.com/7.x/bottts/svg?seed=LectorBot1&backgroundColor=19e65e",
    "https://api.dicebear.com/7.x/bottts/svg?seed=MegaBrain&backgroundColor=ffdfbf",
    "https://api.dicebear.com/7.x/notionists/svg?seed=Owl&backgroundColor=e1fdfb",
];

export const DEFAULT_THEME_CONFIG = {
    id: 'default',
    primaryColor: '#19e65e',
    animationKey: 'default',
    difficulty: 'Básico' as const
};

export const LEARNING_MODULES: LearningModule[] = [
    {
        id: 'fast_reading_101',
        title: 'Mundo 1: Fundamentos',
        duration: '5 min',
        icon: 'rocket_launch',
        description: 'Elimina el "freno de mano" de tu lectura: la subvocalización.',
        color: 'from-green-500 to-emerald-700',
        relatedTrainingRoute: AppRoute.READING,
        steps: [
            {
                title: "El Susurro Mental",
                text: "La subvocalización es pronunciar mentalmente cada palabra. Tu cerebro es 10x más rápido que tu lengua. ¡Deja de hablar mientras lees!",
                icon: "voice_over_off",
                visualType: "animation",
                animationKey: "voice_wave"
            },
            {
                title: "Fijación Visual",
                text: "Tus ojos no se deslizan, saltan. Cada salto es una 'fijación'. Aprenderemos a captar 3 palabras por salto.",
                icon: "visibility",
                visualType: "animation",
                animationKey: "focus_points"
            },
            {
                title: "Confianza Cognitiva",
                text: "La regresión (volver atrás) mata la velocidad. Tu cerebro captó la idea, confía en él y sigue adelante.",
                icon: "forward",
                visualType: "animation",
                animationKey: "no_return"
            }
        ],
        checkpointQuestion: {
            id: 1,
            question: "¿Cuál es el principal factor que limita la velocidad de lectura?",
            options: [
                { id: "a", text: "La luz ambiental", isCorrect: false },
                { id: "b", text: "La subvocalización", isCorrect: true },
                { id: "c", text: "El tamaño del libro", isCorrect: false }
            ]
        }
    },
    {
        id: 'peripheral_mastery',
        title: 'Mundo 2: Campo Visual',
        duration: '8 min',
        icon: 'grid_view',
        description: 'Expande tu visión periférica para captar líneas enteras de un vistazo.',
        color: 'from-blue-500 to-indigo-700',
        relatedTrainingRoute: AppRoute.SCHULTE,
        steps: [
            {
                title: "Visión Periférica",
                text: "Solemos leer con visión túnel. Vamos a entrenar tus bastones oculares para detectar información lateral.",
                icon: "filter_center_focus",
                visualType: "animation",
                animationKey: "tunnel_vision"
            },
            {
                title: "El Punto Rojo",
                text: "En la Tabla Schulte, el secreto es NO mover los ojos. Deja que la información entre por los lados.",
                icon: "center_focus_strong",
                visualType: "animation",
                animationKey: "center_dot"
            }
        ],
        checkpointQuestion: {
            id: 2,
            question: "En una Tabla Schulte, ¿dónde debe estar fija la mirada?",
            options: [
                { id: "a", text: "En el número 1", isCorrect: false },
                { id: "b", text: "En el centro exacto", isCorrect: true },
                { id: "c", text: "Moviéndose rápido", isCorrect: false }
            ]
        }
    },
    {
        id: 'rhythm_flow',
        title: 'Mundo 3: Ritmo y Flujo',
        duration: '6 min',
        icon: 'speed',
        description: 'Crea un ritmo constante para evitar bloqueos y fatiga mental.',
        color: 'from-orange-500 to-red-600',
        relatedTrainingRoute: AppRoute.READING,
        steps: [
            {
                title: "El Metrónomo Mental",
                text: "La lectura errática cansa al cerebro. Mantener un ritmo constante (WPM) crea un estado de 'flow'.",
                icon: "timer",
                visualType: "animation",
                animationKey: "rhythm_bar"
            },
            {
                title: "El Guía Visual",
                text: "Usar un puntero (como el foco rojo de la app) ayuda al ojo a no perderse y mantener la inercia.",
                icon: "ads_click",
                visualType: "animation",
                animationKey: "tracking_dot"
            }
        ],
        checkpointQuestion: {
            id: 3,
            question: "¿Por qué es importante mantener un ritmo constante al leer?",
            options: [
                { id: "a", text: "Para terminar antes", isCorrect: false },
                { id: "b", text: "Para entrar en estado de flow y reducir fatiga", isCorrect: true },
                { id: "c", text: "Para gastar menos XP", isCorrect: false }
            ]
        }
    },
    {
        id: 'deep_comprehension',
        title: 'Mundo 4: Comprensión',
        duration: '10 min',
        icon: 'psychology',
        description: 'Aprende a leer ideas y conceptos, no solo letras y palabras.',
        color: 'from-purple-500 to-violet-800',
        relatedTrainingRoute: AppRoute.READING,
        steps: [
            {
                title: "Lectura por Bloques",
                text: "Tu cerebro no entiende 'P-E-R-R-O', entiende el concepto de perro. Lee bloques de significado.",
                icon: "extension",
                visualType: "animation",
                animationKey: "chunking_visual"
            },
            {
                title: "Palabras Clave",
                text: "El 60% de un texto es 'relleno' gramatical. Identifica sustantivos y verbos de acción.",
                icon: "auto_awesome",
                visualType: "animation",
                animationKey: "keyword_highlight"
            }
        ],
        checkpointQuestion: {
            id: 4,
            question: "¿Qué es el 'Chunking'?",
            options: [
                { id: "a", text: "Agrupar palabras en bloques de ideas", isCorrect: true },
                { id: "b", text: "Comer mientras lees", isCorrect: false },
                { id: "c", text: "Subvocalizar más fuerte", isCorrect: false }
            ]
        }
    },
    {
        id: 'super_memory',
        title: 'Mundo 5: Retención',
        duration: '12 min',
        icon: 'castle',
        description: 'Vence a la Curva del Olvido con Mnemotecnia Visual y Palacios Mentales.',
        color: 'from-pink-500 to-rose-700',
        relatedTrainingRoute: AppRoute.LOCI_TRAINING,
        steps: [
            {
                title: "Imágenes Bizarras",
                text: "Recordamos lo absurdo, gigante y emocional. Convierte los datos aburridos en escenas de película.",
                icon: "movie",
                visualType: "animation",
                animationKey: "bizarre_visual"
            },
            {
                title: "Palacio de Loci",
                text: "Ubica tus recuerdos en una casa que conozcas. Tu memoria espacial es evolutivamente superior.",
                icon: "home_work",
                visualType: "animation",
                animationKey: "memory_grid"
            }
        ],
        checkpointQuestion: {
            id: 5,
            question: "¿Qué tipo de escenas recuerda mejor el cerebro humano?",
            options: [
                { id: "a", text: "Listas de texto ordenadas", isCorrect: false },
                { id: "b", text: "Escenas bizarras, exageradas y emocionales", isCorrect: true },
                { id: "c", text: "Datos estadísticos puros", isCorrect: false }
            ]
        }
    },
    {
        id: 'advanced_skimming',
        title: 'Mundo 6: Maestría',
        duration: '15 min',
        icon: 'workspace_premium',
        description: 'Técnicas de escaneo avanzado y lectura en capas para expertos.',
        color: 'from-amber-400 to-yellow-700',
        relatedTrainingRoute: AppRoute.TRAININGS,
        steps: [
            {
                title: "Skimming Estratégico",
                text: "Vuela sobre el texto buscando la estructura. Lee el primer y último párrafo de cada sección.",
                icon: "radar",
                visualType: "animation",
                animationKey: "scanning_radar"
            },
            {
                title: "Lectura por Capas",
                text: "Primera capa: contexto. Segunda capa: detalles clave. Tercera capa: síntesis. ¡Eres un maestro!",
                icon: "layers",
                visualType: "animation",
                animationKey: "final_mastery"
            }
        ],
        checkpointQuestion: {
            id: 6,
            question: "¿En qué consiste la lectura por capas?",
            options: [
                { id: "a", text: "En leer tres libros a la vez", isCorrect: false },
                { id: "b", text: "En abordar el texto con diferentes objetivos en cada pasada", isCorrect: true },
                { id: "c", text: "En usar gafas de sol", isCorrect: false }
            ]
        }
    }
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
        description: 'Sigiloso y veloc.',
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
        title: 'La Neurociencia del Enfoque',
        author: 'Entrenamiento Nivel 1',
        coverUrl: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?q=80&w=300",
        progress: 0,
        category: 'practice',
        difficulty: 'Fácil',
        content: `La atención no es un recurso infinito. En el mundo moderno, estamos constantemente bombardeados por estímulos que compiten por nuestra capacidad cognitiva. Para leer más rápido, debemos primero aprender a silenciar el ruido externo y, lo más importante, el ruido interno. La subvocalización es el principal freno: ese pequeño susurro mental que repite cada palabra. Al eliminarlo, permitimos que el cerebro procese imágenes visuales de grupos de palabras (chunking), lo que dispara la velocidad de comprensión.`,
        questions: [
            { id: 1, question: "¿Qué es la subvocalización?", options: [{id: 'a', text: 'Leer en voz alta', isCorrect: false}, {id: 'b', text: 'El susurro mental interno', isCorrect: true}, {id: 'c', text: 'Un tipo de memoria', isCorrect: false}] }
        ]
    },
    {
        id: 'drill_med_1',
        title: 'Estrategias de Aprendizaje Acelerado',
        author: 'Entrenamiento Nivel 2',
        coverUrl: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=300",
        progress: 0,
        category: 'practice',
        difficulty: 'Medio',
        content: `Richard Feynman decía que si no puedes explicar algo de forma sencilla, no lo has entendido lo suficiente. El aprendizaje acelerado se basa en la recuperación activa y la repetición espaciada. En lugar de leer diez veces lo mismo, léelo una vez y trata de recordarlo sin mirar el papel. Este esfuerzo de "evocación" es lo que fortalece las conexiones neuronales. Combinado con la mnemotecnia visual, como el palacio de la memoria, podemos almacenar datos complejos en lugares familiares de nuestra mente, aprovechando millones de años de evolución espacial.`,
        questions: [
            { id: 1, question: "¿En qué se basa el aprendizaje acelerado?", options: [{id: 'a', text: 'Repetir mecánicamente', isCorrect: false}, {id: 'b', text: 'Recuperación activa y evocación', isCorrect: true}] }
        ]
    },
    {
        id: 'drill_hard_1',
        title: 'Filosofía Estoica y Memoria',
        author: 'Entrenamiento Avanzado',
        coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=300",
        progress: 0,
        category: 'practice',
        difficulty: 'Difícil',
        content: `Marco Aurelio escribía sus Meditaciones para sí mismo, no para la posteridad. Su práctica era una forma de entrenamiento cognitivo: el examen de conciencia matutino y vespertino. Para un estoico, la memoria era una herramienta de juicio. Recordar los principios fundamentales en el momento de la crisis requería una retención profunda. La lectura rápida en textos filosóficos no busca terminar el libro, sino identificar la estructura lógica del argumento y anclarla en el 'hegemonikon' o centro director del alma. Aquí, la velocidad se une a la profundidad absoluta.`,
        questions: [
            { id: 1, question: "¿Cuál era el objetivo de la memoria para los estoicos?", options: [{id: 'a', text: 'Aprobar exámenes', isCorrect: false}, {id: 'b', text: 'Servir como herramienta de juicio', isCorrect: true}] }
        ]
    }
];

export const ASSESSMENT_TEXT_CONTENT = `La memoria no es como una grabadora que registra eventos de forma pasiva; es un proceso reconstructivo y dinámico. Cuando recordamos, nuestro cerebro no reproduce un video, sino que ensambla fragmentos de información almacenados en diferentes regiones. Este proceso está influenciado por nuestras expectativas, emociones y conocimientos previos. Las "falsas memorias" ocurren cuando este rompecabezas se arma con piezas que no pertenecen al evento original. Entender que nuestra memoria es falible es el primer paso para entrenarla mediante técnicas de visualización bizarra y asociaciones espaciales, las cuales crean anclas mucho más resistentes al paso del tiempo y a las distorsiones cognitivas comunes.`;

export const ASSESSMENT_QUESTIONS: QuizQuestion[] = [
    {
        id: 1,
        question: "¿Cómo funciona la memoria según el texto?",
        options: [
            { id: "a", text: "Como una grabadora pasiva.", isCorrect: false },
            { id: "b", text: "Como un proceso reconstructivo y dinámico.", isCorrect: true },
            { id: "c", text: "Como un disco duro infalible.", isCorrect: false }
        ]
    },
    {
        id: 2,
        question: "¿Qué causa las 'falsas memorias'?",
        options: [
            { id: "a", text: "La falta de sueño.", isCorrect: false },
            { id: "b", text: "Ensamblar fragmentos con piezas que no pertenecen al evento.", isCorrect: true },
            { id: "c", text: "Olvidar nombres de personas.", isCorrect: false }
        ]
    }
];

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
  streak: 0,
  tel: 0,
  lastActiveDate: Date.now(),
  xp: 0,
  maxSchulteLevel: 1,
  maxWordSpan: 3
};

export const MOCK_NOTIFICATIONS: Notification[] = [];

export const SUGGESTED_BOOKS: Book[] = [];
