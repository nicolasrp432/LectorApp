import React from 'react';

export type MascotMood = 'idle' | 'happy' | 'thinking' | 'celebrating' | 'sad' | 'sleeping';

interface LectoMascotProps {
  mood?: MascotMood;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZES = { sm: 72, md: 100, lg: 140 };

const LectoMascot: React.FC<LectoMascotProps> = ({ mood = 'idle', size = 'md', className = '' }) => {
  const px = SIZES[size];

  return (
    <svg
      viewBox="0 0 120 120"
      width={px}
      height={px}
      className={`lecto-mascot lecto-${mood} ${className}`}
      aria-label={`Lecto la mascota, estado: ${mood}`}
      role="img"
    >
      <defs>
        {/* Book cover gradient */}
        <linearGradient id="bookCover" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--primary)" />
          <stop offset="100%" stopColor="var(--primary-dark, #10b981)" />
        </linearGradient>
        {/* Page shadow */}
        <linearGradient id="pageShadow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e8e8e8" />
        </linearGradient>
        {/* Soft glow for celebrating */}
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* === BODY: Open book shape === */}
      <g className="lecto-body">
        {/* Book spine / shadow underneath */}
        <ellipse cx="60" cy="88" rx="38" ry="6" fill="rgba(0,0,0,0.2)" className="lecto-shadow" />

        {/* Left cover */}
        <path
          d="M60 35 L60 85 Q40 90 18 82 L18 32 Q40 25 60 35Z"
          fill="url(#bookCover)"
          stroke="var(--primary-dark, #10b981)"
          strokeWidth="1.5"
          className="lecto-cover-left"
        />

        {/* Right cover */}
        <path
          d="M60 35 L60 85 Q80 90 102 82 L102 32 Q80 25 60 35Z"
          fill="url(#bookCover)"
          stroke="var(--primary-dark, #10b981)"
          strokeWidth="1.5"
          className="lecto-cover-right"
        />

        {/* Left pages */}
        <path
          d="M58 38 L58 82 Q42 87 24 80 L24 36 Q42 30 58 38Z"
          fill="url(#pageShadow)"
          className="lecto-page-left"
        />

        {/* Right pages */}
        <path
          d="M62 38 L62 82 Q78 87 96 80 L96 36 Q78 30 62 38Z"
          fill="#ffffff"
          className="lecto-page-right"
        />

        {/* Page lines (left) */}
        <g opacity="0.15" className="lecto-lines-left">
          <line x1="32" y1="48" x2="54" y2="45" stroke="#333" strokeWidth="1" strokeLinecap="round" />
          <line x1="30" y1="56" x2="54" y2="53" stroke="#333" strokeWidth="1" strokeLinecap="round" />
          <line x1="29" y1="64" x2="54" y2="61" stroke="#333" strokeWidth="1" strokeLinecap="round" />
          <line x1="28" y1="72" x2="54" y2="69" stroke="#333" strokeWidth="1" strokeLinecap="round" />
        </g>

        {/* Page lines (right) */}
        <g opacity="0.15" className="lecto-lines-right">
          <line x1="66" y1="45" x2="88" y2="48" stroke="#333" strokeWidth="1" strokeLinecap="round" />
          <line x1="66" y1="53" x2="90" y2="56" stroke="#333" strokeWidth="1" strokeLinecap="round" />
          <line x1="66" y1="61" x2="91" y2="64" stroke="#333" strokeWidth="1" strokeLinecap="round" />
          <line x1="66" y1="69" x2="92" y2="72" stroke="#333" strokeWidth="1" strokeLinecap="round" />
        </g>

        {/* Spine center line */}
        <line x1="60" y1="35" x2="60" y2="85" stroke="var(--primary-dark, #10b981)" strokeWidth="2" opacity="0.4" />
      </g>

      {/* === FACE === */}
      <g className="lecto-face">
        {/* --- EYES --- */}
        <g className="lecto-eyes">
          {/* Left eye */}
          <g className="lecto-eye-left">
            {mood === 'sleeping' ? (
              <>
                <line x1="40" y1="48" x2="50" y2="48" stroke="#333" strokeWidth="2.5" strokeLinecap="round" />
                <text x="35" y="42" fontSize="8" fill="var(--primary)" opacity="0.6" className="lecto-zzz">z</text>
                <text x="30" y="35" fontSize="6" fill="var(--primary)" opacity="0.4" className="lecto-zzz-2">z</text>
              </>
            ) : mood === 'sad' ? (
              <>
                <ellipse cx="45" cy="49" rx="6" ry="5.5" fill="white" stroke="#333" strokeWidth="1.2" />
                <circle cx="45" cy="50" r="2.5" fill="#333" />
                <line x1="39" y1="42" x2="48" y2="44" stroke="#333" strokeWidth="1.5" strokeLinecap="round" />
              </>
            ) : mood === 'thinking' ? (
              <>
                <line x1="40" y1="49" x2="50" y2="49" stroke="#333" strokeWidth="2.5" strokeLinecap="round" />
              </>
            ) : mood === 'celebrating' ? (
              <>
                <path d="M40 50 L43 46 L46 50" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="43" cy="46" r="1.5" fill="var(--primary)" className="lecto-star-1" />
              </>
            ) : (
              <>
                <ellipse cx="45" cy="49" rx="6" ry="5.5" fill="white" stroke="#333" strokeWidth="1.2" />
                <circle cx="45" cy="49" r="2.5" fill="#333" className="lecto-pupil" />
                <circle cx="43.5" cy="47.5" r="1" fill="white" />
              </>
            )}
          </g>

          {/* Right eye */}
          <g className="lecto-eye-right">
            {mood === 'sleeping' ? (
              <line x1="70" y1="48" x2="80" y2="48" stroke="#333" strokeWidth="2.5" strokeLinecap="round" />
            ) : mood === 'sad' ? (
              <>
                <ellipse cx="75" cy="49" rx="6" ry="5.5" fill="white" stroke="#333" strokeWidth="1.2" />
                <circle cx="75" cy="50" r="2.5" fill="#333" />
                <line x1="72" y1="44" x2="81" y2="42" stroke="#333" strokeWidth="1.5" strokeLinecap="round" />
              </>
            ) : mood === 'thinking' ? (
              <>
                <ellipse cx="75" cy="49" rx="6" ry="5.5" fill="white" stroke="#333" strokeWidth="1.2" />
                <circle cx="76" cy="49" r="2.5" fill="#333" />
                <circle cx="74.5" cy="47.5" r="1" fill="white" />
              </>
            ) : mood === 'celebrating' ? (
              <>
                <path d="M70 50 L73 46 L76 50" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="73" cy="46" r="1.5" fill="var(--primary)" className="lecto-star-2" />
              </>
            ) : (
              <>
                <ellipse cx="75" cy="49" rx="6" ry="5.5" fill="white" stroke="#333" strokeWidth="1.2" />
                <circle cx="75" cy="49" r="2.5" fill="#333" className="lecto-pupil" />
                <circle cx="73.5" cy="47.5" r="1" fill="white" />
              </>
            )}
          </g>
        </g>

        {/* --- BLUSH (happy / celebrating) --- */}
        {(mood === 'happy' || mood === 'celebrating') && (
          <g className="lecto-blush" opacity="0.35">
            <ellipse cx="36" cy="56" rx="5" ry="3" fill="#ff9999" />
            <ellipse cx="84" cy="56" rx="5" ry="3" fill="#ff9999" />
          </g>
        )}

        {/* --- MOUTH --- */}
        <g className="lecto-mouth">
          {mood === 'happy' || mood === 'celebrating' ? (
            <path d="M50 58 Q60 67 70 58" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" />
          ) : mood === 'sad' ? (
            <path d="M50 62 Q60 56 70 62" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" />
          ) : mood === 'thinking' ? (
            <ellipse cx="62" cy="60" rx="3" ry="2.5" fill="none" stroke="#333" strokeWidth="1.8" />
          ) : mood === 'sleeping' ? (
            <ellipse cx="60" cy="58" rx="4" ry="3" fill="none" stroke="#333" strokeWidth="1.5" />
          ) : (
            <line x1="52" y1="59" x2="68" y2="59" stroke="#333" strokeWidth="2" strokeLinecap="round" />
          )}
        </g>
      </g>

      {/* === EXTRAS based on mood === */}

      {/* Thinking: question marks */}
      {mood === 'thinking' && (
        <g className="lecto-thinking-dots">
          <text x="90" y="30" fontSize="14" fill="var(--primary)" opacity="0.7" className="lecto-question">?</text>
        </g>
      )}

      {/* Celebrating: sparkles */}
      {mood === 'celebrating' && (
        <g className="lecto-sparkles" filter="url(#glow)">
          <circle cx="20" cy="25" r="2" fill="var(--primary)" className="lecto-sparkle-1" />
          <circle cx="100" cy="20" r="2.5" fill="var(--primary)" className="lecto-sparkle-2" />
          <circle cx="15" cy="55" r="1.5" fill="var(--primary)" className="lecto-sparkle-3" />
          <circle cx="105" cy="55" r="2" fill="var(--primary)" className="lecto-sparkle-4" />
          <circle cx="50" cy="15" r="1.5" fill="var(--primary)" className="lecto-sparkle-5" />
          <circle cx="75" cy="12" r="2" fill="var(--primary)" className="lecto-sparkle-6" />
        </g>
      )}

      {/* Happy: little hearts or waves */}
      {mood === 'happy' && (
        <g className="lecto-happy-extras">
          <text x="95" y="32" fontSize="10" className="lecto-heart">{'<3'}</text>
        </g>
      )}
    </svg>
  );
};

export default LectoMascot;
