import React from 'react';

interface SpeechBubbleProps {
  message: string;
  onDismiss?: () => void;
  className?: string;
}

const SpeechBubble: React.FC<SpeechBubbleProps> = ({ message, onDismiss, className = '' }) => {
  if (!message) return null;

  return (
    <div
      className={`lecto-speech-bubble relative bg-surface-dark border border-card-border rounded-2xl px-4 py-3 max-w-[220px] shadow-card cursor-pointer ${className}`}
      onClick={onDismiss}
      role="status"
      aria-live="polite"
    >
      <p className="text-xs text-gray-200 leading-relaxed font-display">{message}</p>

      {/* Tail pointing down-left toward the mascot */}
      <svg
        className="absolute -bottom-2 left-5"
        width="16"
        height="10"
        viewBox="0 0 16 10"
        fill="none"
      >
        <path
          d="M0 0 L8 10 L16 0"
          fill="var(--surface-dark)"
          stroke="var(--card-border)"
          strokeWidth="1"
        />
        {/* Cover the top border line so it blends with the bubble */}
        <line x1="0" y1="0" x2="16" y2="0" stroke="var(--surface-dark)" strokeWidth="2" />
      </svg>
    </div>
  );
};

export default SpeechBubble;
