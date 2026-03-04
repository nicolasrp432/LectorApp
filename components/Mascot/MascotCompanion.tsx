import React, { useState, useEffect, useMemo } from 'react';
import { AppRoute, User } from '../../types.ts';
import LectoMascot from './LectoMascot.tsx';
import SpeechBubble from './SpeechBubble.tsx';
import { getMascotState } from './mascotMessages.ts';

interface MascotCompanionProps {
  currentRoute: AppRoute;
  user: User | null;
}

const MascotCompanion: React.FC<MascotCompanionProps> = ({ currentRoute, user }) => {
  const [showBubble, setShowBubble] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [prevRoute, setPrevRoute] = useState<AppRoute | null>(null);

  const mascotState = useMemo(
    () => getMascotState(currentRoute, user),
    [currentRoute, user?.stats?.streak, user?.stats?.lastActiveDate]
  );

  // Reset bubble visibility on route change
  useEffect(() => {
    if (currentRoute !== prevRoute) {
      setPrevRoute(currentRoute);
      setShowBubble(true);
    }
  }, [currentRoute, prevRoute]);

  // Animate in
  useEffect(() => {
    if (mascotState) {
      const timer = setTimeout(() => setIsVisible(true), 200);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [mascotState]);

  // Auto-dismiss bubble after 8 seconds
  useEffect(() => {
    if (showBubble && mascotState?.message) {
      const timer = setTimeout(() => setShowBubble(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [showBubble, mascotState?.message]);

  if (!mascotState) return null;

  const { mood, message } = mascotState;

  // On Welcome page, render inline (not floating)
  if (currentRoute === AppRoute.WELCOME) {
    return (
      <div className={`flex flex-col items-center gap-2 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <LectoMascot mood={mood} size="lg" />
        {showBubble && message && (
          <div className="lecto-speech-bubble relative bg-surface-dark border border-card-border rounded-2xl px-4 py-3 max-w-[240px] shadow-card text-center">
            <p className="text-xs text-gray-200 leading-relaxed font-display">{message}</p>
          </div>
        )}
      </div>
    );
  }

  // Floating position for all other screens
  return (
    <div
      className={`
        fixed z-30 flex flex-col items-start gap-2
        bottom-24 left-4
        transition-all duration-500 ease-out
        ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-75'}
      `}
      style={{ pointerEvents: 'auto' }}
    >
      {/* Speech bubble above the mascot */}
      {showBubble && message && (
        <SpeechBubble
          message={message}
          onDismiss={() => setShowBubble(false)}
          className="lecto-bubble-enter"
        />
      )}

      {/* Mascot itself - tap to toggle bubble */}
      <button
        onClick={() => setShowBubble(!showBubble)}
        className="active:scale-90 transition-transform focus:outline-none focus-visible:outline-2 focus-visible:outline-primary"
        aria-label={showBubble ? 'Ocultar mensaje de Lecto' : 'Ver mensaje de Lecto'}
      >
        <LectoMascot mood={mood} size="sm" />
      </button>
    </div>
  );
};

export default MascotCompanion;
