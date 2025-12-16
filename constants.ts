import { Book, QuizQuestion, Notification, Achievement } from "./types";

export const AVATARS = [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAT03pNCv9ZwChpYTLj_5VuX3XrImTjDLs7TOS2X6ej8eDOrvoYQXAH7BsHlqfrK7v2Rf89sbKz6RJ_HfhjWfHpE_gwXUmZVw758dL_7obHIhZfQQVfuTkeXIz0WZ_OXsLfG-HFMYwpxSHH5P_W6N1Xy-3Fb8oAdkZ4AKEv2HMn61G551SDqc70th7lpXgmbj9L1B20mo5GYyu9r_XMYp8_mijX9vO3WH1eYsNqpfkLEH8nfjVR-syfCGfrpsdYtwxIumFWlKBomnC_",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCn-7j-Lwj0QfWRsVZfT99wwLEHjLiD_qI04tOQ69MAvSacOwTkiBqlQGU4B6zvKQ26OUvhSekSRj4Sin_-6UstbYYrE3i96o1FhmNsaGEXN7TmCAif9zuEx_rs8FJh8uA-Fm2canVn7q-quzD4C99f3W73DWGYkovRdWu-qWg5ntyFP08TUNua5ffDJKxS_ushRT0CykCYCZAev8BKE09lCZs72qthNXNdiaKcZozqASUZ8eNPZ86DenwOwReYP5DNSl7DAXlkqwYq",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBEoLjZFZXTLiQSo188ILO6Na4Cpn4-7LmpuCHvqo6goOMRjvX0VmWwXOMll3z4PqO9UYiyQ08VZ1thX0Rf62iYNRCMgVg0hcJc7t6EGtHU7K7g_IzQ93m6wl8QPIyj39Nz_myTN8nThhczZfVJkjKsI3WMXSLP4gPzaUW7VJKC_0P44EwmUE3cA8xWi7B1ydAv8EqGcePypsS4loLT2fD8F3VnJEAMyrtDd64AypLjnt7mytizALjqvIJ68wIOhqILuPizDFIpQXEm",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBwzsZ9KTJmKtsRa3isnHGovU9F564dHbuZKbrmclrwqJaAUybYCdiNxE2ebB12wMs7eT-zeIhTLw36UuhUfbETnHNDE9dVkpWHjqfe-pYpAPiM1HQ_0qoAHW8ZMF3J0UgsaIn5975ZzTVNPD3vSVDXo7-C40uvRg1HnqWueFTu0Pbhc-Gzs235iXcuywuN6QKm7_PDOGUBsdSU5fg5J9hu7Tdcwo34Zu8MBImmLFdzEjHF_mVjgznYTwx68iptkWmTC65PJpChGW9_",
];

export const ACHIEVEMENTS_LIST: Achievement[] = [
    { id: 'first_step', title: 'Primer Paso', description: 'Completa tu primera sesión de lectura.', icon: 'footprint' },
    { id: 'speed_demon', title: 'Demonio Veloz', description: 'Lee a más de 500 WPM.', icon: 'speed' },
    { id: 'focus_master', title: 'Maestro del Foco', description: 'Completa una Tabla Schulte 5x5 en menos de 30s.', icon: 'visibility' },
    { id: 'memory_king', title: 'Rey de la Memoria', description: 'Mantén una racha de 3 días.', icon: 'crown' },
    { id: 'scholar', title: 'Erudito', description: 'Alcanza 1000 XP.', icon: 'school' },
];

export const MOCK_USER_STATS = {
  streak: 12,
  tel: 450,
  telChange: 12,
  wpm: 600,
  wpmChange: 20,
  comprehension: 85,
  comprehensionChange: -5,
  recall: 72,
  recallChange: 10,
  retention: 9.5,
};

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    title: "¡Racha en peligro!",
    message: "No has entrenado hoy. Completa una sesión rápida para mantener tu racha de 12 días.",
    type: "warning",
    timestamp: Date.now() - 3600000,
    isRead: false
  },
  {
    id: "2",
    title: "Análisis completado",
    message: "La IA ha extraído 5 nuevos conceptos clave de 'Hábitos Atómicos'.",
    type: "success",
    timestamp: Date.now() - 86400000,
    isRead: false
  }
];

export const RECENT_BOOKS: Book[] = [
  {
    id: "1",
    title: "El Gran Gatsby",
    author: "F. Scott Fitzgerald",
    coverUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDNqUhK293B9I40ve1kJxAKWMIV70ZA71Yt7ayop-Fre1Ln48VG-1S2y2umpH59exLAzJ9lAsthGDr_6kZD1r2mfccT-lfsRUiXrFw728xg-_WWNJFnbF8R34I6hckQ_CNFLzwza1kBxL4EH4WzhMj_dz9qQ_kXzeohg4gIdny-7fXoV0aA5EYT_k1Eo_jao1X3Ag-EA6na5XTBqEMQIUXq_V2tbDlyUD4EBm2W1AZIyAzuyf35YT_f06AapgPvQEr3LO-hOJMlnahl",
    progress: 45,
  },
  {
    id: "2",
    title: "Hábitos Atómicos",
    author: "James Clear",
    coverUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuA4GqR_Yf13wm8bjZvKegTMhVC_nqIctnVfPnn-D6KiHhZum4nklzS_Zv9VofQ23tp7Ug5zz2KROCbAjRKISAQcreeZgGCvTXSF4lysUO5dLP0ydjqyouxLJQrCiB3pnjxKb30Lgal1P6eRguwwbPQj9vvoIbsKZ9S3o5O2CUxa9zcL3QsEgqs2qAvhlWzmuOU9qw6DdhzrnKyZt9WxPGvTNkPYZ3uyWrMB985ubU-SIgAEplGT9Y3e1tvaIV_-M44wxJQj25W-I2ho",
    progress: 12,
  },
];

export const SUGGESTED_BOOKS: Book[] = [
  {
    id: "3",
    title: "Pensar rápido, pensar despacio",
    author: "Daniel Kahneman",
    coverUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAGwTjm9YPZmw04dOH46yIjSsoPgeTXYc3pznrOLfLpHTc0Km_yaOUMuLyXcA_-aqF6kZ0sQS8dXyQEyACEFmS8f5VSTBeqybFYtUUuGIJT4sTzsg2TBiWKikx81BgPAIaPgX5L6RD8oXAYaotXyXy-cZTuTqEp-vfrvCjh7kMSCalvOxyLN7lRnblWHxDyJBs4uBSr5fd_3I8k2BLcYHwKhRbUPeWPDCxx4Z2BEPhECr-OJfQ3ipmI_Wi-uJUPBEwhuqphWHkNvGPa",
    progress: 0,
    totalPages: 499,
  },
  {
    id: "4",
    title: "Sapiens: De animales a dioses",
    author: "Yuval Noah Harari",
    coverUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDHAVk-iSaHH-Xe458vvmukDQ3z4AnAjibN7VsdUw3Oblk8kA2LGqT-yMau93PtPR7nKr1V6KtnKBzZ2C7AtkTZnJSN3ta5oLK5-yEZEEuTEb8hLDVV1MujGCSpoDkRJiZbGgvY37ZPEtmCz-l_2LQ74Q9gEV5XNtlo1Ir1chd_R7RcuvbHu54pbccpVNorSyYZwZGmA_SzfTH8TM1R_cDKKgiKBZWsVesFC8t0t_DPTwv5dZWjK4mc3gpQMYTiJJoWxv90t4A2rnuz",
    progress: 0,
    totalPages: 443,
  },
];

export const MOCK_QUIZ_QUESTION: QuizQuestion = {
  id: 3,
  question: "¿Cuál fue el argumento principal sobre la neuroplasticidad en el texto?",
  imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDmNuNO8wU-beCT338Pp8eWK3DrYf-wuLUBUnHOsTRsv8fKbNmSTXjklvyUH1HLSSsCzXBEZpIrVWA01MCc2oyjQ8gy0Us4kp1Z9889WJ5iRZuoW0HTBjG3k1d3hLbJfJk7bb5u3PUs1RtC0a5GYJgqC0GTC1I83xArU-dtY_xW13HSNVnHLYBEY8ZhFtyejp2IwcKpPgfecayPiVVneKGLsnNumxqERfxgfGTv90c8EVZCV661YFFH8LANggKBPrp9kzXwcGGaXgy9",
  options: [
    {
      id: "opt1",
      text: "El cerebro es estático después de los 25 años.",
      isCorrect: false,
    },
    {
      id: "opt2",
      text: "La velocidad de lectura no afecta la retención.",
      isCorrect: false,
      explanation: "Incorrecto. El texto argumenta que la velocidad puede mejorar el enfoque.",
    },
    {
      id: "opt3",
      text: "El cerebro crea nuevas rutas a través de la repetición.",
      isCorrect: true,
      explanation: "¡Correcto! La plasticidad sináptica requiere repetición.",
    },
    {
      id: "opt4",
      text: "La memoria es puramente genética.",
      isCorrect: false,
    },
  ],
};

export const CHART_DATA = [
    { day: "Lun", value: 300 },
    { day: "Mar", value: 280 },
    { day: "Mié", value: 350 },
    { day: "Jue", value: 420 },
    { day: "Vie", value: 380 },
    { day: "Sáb", value: 460 },
    { day: "Dom", value: 450 },
];