import React from 'react';
import { AppRoute } from '../types';

interface WelcomeProps {
  onNavigate: (route: AppRoute) => void;
}

const Welcome: React.FC<WelcomeProps> = ({ onNavigate }) => {
  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden max-w-md mx-auto shadow-2xl bg-background-light dark:bg-background-dark">
      {/* Header / Logo */}
      <header className="w-full pt-8 pb-4 px-6 flex justify-center z-10">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-3xl">auto_stories</span>
          <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Lector</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
        {/* Hero Visual */}
        <div className="w-full max-w-[320px] aspect-square relative mb-8 flex items-center justify-center">
          <div className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full"></div>
          <div
            className="w-full h-full bg-center bg-no-repeat bg-contain relative z-10"
            style={{
              backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDBjCorMlblD8otxACDdlK2RK9eP06nVZ-wxQlfBj0xaGEG9qUe2JlwZfkm5O0fHBLrMlK-TQZa3WIgPTIOTLrdXzkKnFDOL3zw7sTeUeNHRN0OUc8sqaiMAdHG0_YfcAQJiX7Z4GZO-Ki3Gmqbj-qsaM8-kjh9xYHHIXIWQuVjWEYS_D0_-xxsF0Z0REG3o8EukSwIAnJ88PkAKGT0yUBiRCAofo4rIXKjqzLG45_ZE64kXUwvNIT69P9Tj4FumgnQl-JCmLYqkT-3")',
              maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)',
              opacity: 0.9,
            }}
          ></div>
        </div>

        {/* Headline */}
        <h1 className="text-slate-900 dark:text-white tracking-tight text-[32px] font-bold leading-[1.1] text-center mb-4">
          Lee Más Rápido.<br />
          <span className="text-primary">Recuerda Más.</span>
        </h1>

        {/* Body Text */}
        <p className="text-slate-600 dark:text-gray-300 text-base font-normal leading-relaxed text-center max-w-[320px] mb-8">
          Únete al programa científicamente diseñado para triplicar tu velocidad de lectura y construir una supermemoria en solo 15 minutos al día.
        </p>

        {/* Social Proof */}
        <div className="flex items-center gap-3 mb-8 bg-white/5 dark:bg-white/5 rounded-full px-4 py-2 backdrop-blur-sm border border-black/5 dark:border-white/10">
          <div className="flex -space-x-2 overflow-hidden">
            <img alt="User 1" className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-[#112116] object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBEoLjZFZXTLiQSo188ILO6Na4Cpn4-7LmpuCHvqo6goOMRjvX0VmWwXOMll3z4PqO9UYiyQ08VZ1thX0Rf62iYNRCMgVg0hcJc7t6EGtHU7K7g_IzQ93m6wl8QPIyj39Nz_myTN8nThhczZfVJkjKsI3WMXSLP4gPzaUW7VJKC_0P44EwmUE3cA8xWi7B1ydAv8EqGcePypsS4loLT2fD8F3VnJEAMyrtDd64AypLjnt7mytizALjqvIJ68wIOhqILuPizDFIpQXEm" />
            <img alt="User 2" className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-[#112116] object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBwzsZ9KTJmKtsRa3isnHGovU9F564dHbuZKbrmclrwqJaAUybYCdiNxE2ebB12wMs7eT-zeIhTLw36UuhUfbETnHNDE9dVkpWHjqfe-pYpAPiM1HQ_0qoAHW8ZMF3J0UgsaIn5975ZzTVNPD3vSVDXo7-C40uvRg1HnqWueFTu0Pbhc-Gzs235iXcuywuN6QKm7_PDOGUBsdSU5fg5J9hu7Tdcwo34Zu8MBImmLFdzEjHF_mVjgznYTwx68iptkWmTC65PJpChGW9_" />
            <img alt="User 3" className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-[#112116] object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDJYrxtUqOxhpgTd4Gjy756xue2zyXlU1IBlsnjskQNbgfRDWoDWnmkNXeRWnJU3V7RrXl1S_hhHs2hujyGT-RcMTrlq7JGsfPL9Uuua2OQqctqwaTB73IWee-hjU6bjziuC3f2VApkr0H_PnJjOC_zrUsimWpQGjDrs3FPdBEQ0FE_seqbEpMPAEUtXOwimDM4KwYSPqM1kaZDsTiETKlNEWlZisBAqR8Hiq4js2npZFjMwI4i6apL98UJgCMdzirxkgZDdKluu7As" />
          </div>
          <span className="text-xs font-medium text-slate-600 dark:text-gray-400">Confiado por +10k estudiantes</span>
        </div>
      </main>

      {/* Footer / CTA Section */}
      <footer className="w-full px-6 pb-10 pt-4 relative z-10">
        <button
            onClick={() => onNavigate(AppRoute.LOGIN)}
            className="group relative flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 bg-primary text-[#112217] text-lg font-bold leading-normal tracking-[0.015em] transition-transform active:scale-[0.98] shadow-[0_0_20px_rgba(25,230,94,0.3)] hover:shadow-[0_0_30px_rgba(25,230,94,0.5)]"
        >
          <span className="mr-2">Iniciar Sesión</span>
          <span className="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-1">login</span>
        </button>
        <div className="mt-6 text-center">
          <button onClick={() => onNavigate(AppRoute.ASSESSMENT_INTRO)} className="text-slate-500 dark:text-[#93c8a5] text-sm font-medium leading-normal hover:text-primary dark:hover:text-primary transition-colors">
            ¿Nuevo aquí? <span className="underline decoration-1 underline-offset-4">Toma el Test Inicial</span>
          </button>
        </div>
      </footer>
    </div>
  );
};

export default Welcome;