import type { ScenePuzzle } from '../types';

interface Props {
  look: ScenePuzzle['look'];
  solved: boolean;
}

/** シーンに置かれた、ナゾのしるしになる「時計のような物体」。 */
export function PuzzleObject({ look, solved }: Props) {
  const face = solved ? '#e0d5bd' : '#f8efdb';
  const frame = solved ? '#7d7466' : '#6f5a41';
  const trim = solved ? '#9a9184' : '#c9a04a';

  return (
    <svg viewBox="0 0 120 200" className="streetpuzzle__art" aria-hidden="true">
      {look === 'clock' && (
        <g>
          {/* 台つきの大時計 */}
          <rect x="46" y="96" width="28" height="92" fill="#7a5b3e" />
          <rect x="30" y="182" width="60" height="14" rx="5" fill="#5c422c" />
          <circle cx="60" cy="62" r="42" fill={frame} />
          <circle cx="60" cy="62" r="34" fill={face} />
          <circle cx="60" cy="62" r="34" fill="none" stroke={trim} strokeWidth="3" />
          <path d="M60 62 L60 40" stroke="#4c3d2c" strokeWidth="5" strokeLinecap="round" />
          <path d="M60 62 L76 72" stroke="#4c3d2c" strokeWidth="5" strokeLinecap="round" />
          <circle cx="60" cy="62" r="4" fill="#4c3d2c" />
          <path d="M60 20 L60 12" stroke={frame} strokeWidth="6" strokeLinecap="round" />
        </g>
      )}

      {look === 'sundial' && (
        <g>
          {/* 日時計 */}
          <rect x="50" y="110" width="20" height="78" fill="#8a7a5e" />
          <rect x="26" y="182" width="68" height="14" rx="5" fill="#6b5c44" />
          <ellipse cx="60" cy="106" rx="50" ry="18" fill={frame} />
          <ellipse cx="60" cy="100" rx="46" ry="16" fill={face} />
          <path d="M60 100 L86 66 L64 100 Z" fill={trim} />
          {[-38, -22, -6, 10, 26, 40].map((dx, i) => (
            <line
              key={i}
              x1={60 + dx * 0.62}
              y1={100 - Math.abs(dx) * 0.12}
              x2={60 + dx}
              y2={100 - Math.abs(dx) * 0.06}
              stroke={frame}
              strokeWidth="2"
            />
          ))}
        </g>
      )}

      {look === 'pocketwatch' && (
        <g>
          {/* 台に置かれた懐中時計 */}
          <rect x="18" y="150" width="84" height="12" rx="4" fill="#6b5c44" />
          <path d="M28 150 L34 190 L44 190 L40 150 Z" fill="#5c4c38" />
          <path d="M92 150 L86 190 L76 190 L80 150 Z" fill="#5c4c38" />
          <path
            d="M60 40 C40 52 30 76 42 96"
            stroke={trim}
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx="66" cy="112" r="34" fill={frame} />
          <circle cx="66" cy="112" r="27" fill={face} />
          <circle cx="66" cy="112" r="27" fill="none" stroke={trim} strokeWidth="2.5" />
          <path d="M66 112 L66 95" stroke="#4c3d2c" strokeWidth="4" strokeLinecap="round" />
          <path d="M66 112 L79 119" stroke="#4c3d2c" strokeWidth="4" strokeLinecap="round" />
          <circle cx="66" cy="112" r="3.5" fill="#4c3d2c" />
          <rect x="60" y="72" width="12" height="9" rx="3" fill={frame} />
        </g>
      )}
    </svg>
  );
}
