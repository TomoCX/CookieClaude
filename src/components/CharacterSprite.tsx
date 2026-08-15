import type { Character, Pose, Side } from '../types';

interface ArtProps {
  character: Character;
  pose: Pose;
  className?: string;
}

/**
 * 人物の絵そのもの（SVG）。外部画像は使っていない。
 * 会話画面の立ち絵にも、街並みに立っている人にもこれを使う。
 */
export function CharacterArt({ character, pose, className }: ArtProps) {
  const { coat, accent, skin, hair, hat } = character;

  return (
    <svg viewBox="0 0 200 300" className={className} aria-hidden="true">
      {/* 体 */}
      <path
        d="M100 150 C60 150 42 178 38 214 L30 300 L170 300 L162 214 C158 178 140 150 100 150 Z"
        fill={coat}
      />
      {/* 襟 */}
      <path d="M78 152 L100 186 L122 152 L100 144 Z" fill={accent} />
      {/* 腕 */}
      <path d="M46 196 L28 260 L48 266 L64 206 Z" fill={accent} />
      <path d="M154 196 L172 260 L152 266 L136 206 Z" fill={accent} />
      {/* 首 */}
      <rect x="88" y="128" width="24" height="28" rx="10" fill={skin} />
      {/* 顔 */}
      <ellipse cx="100" cy="98" rx="46" ry="48" fill={skin} />
      {/* 髪 */}
      <path
        d="M54 92 C54 54 74 40 100 40 C126 40 146 54 146 92 C146 74 126 68 100 68 C74 68 54 74 54 92 Z"
        fill={hair}
      />
      {/* 目 */}
      <ellipse cx="82" cy="100" rx="5" ry="6.5" fill="#2b2118" />
      <ellipse cx="118" cy="100" rx="5" ry="6.5" fill="#2b2118" />
      {/* まゆ */}
      <path d="M72 86 L92 84" stroke="#3b2c1e" strokeWidth="3" strokeLinecap="round" />
      <path
        d="M108 84 L128 86"
        stroke="#3b2c1e"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* 口（ポーズごとに形を変える） */}
      {pose === 'happy' && (
        <path
          d="M88 118 Q100 130 112 118"
          stroke="#7d4a34"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
      )}
      {pose === 'surprised' && <ellipse cx="100" cy="120" rx="7" ry="9" fill="#7d4a34" />}
      {pose === 'think' && (
        <path d="M90 121 L110 118" stroke="#7d4a34" strokeWidth="3" strokeLinecap="round" />
      )}
      {pose === 'normal' && (
        <path
          d="M91 119 Q100 124 109 119"
          stroke="#7d4a34"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
      )}
      {/* ほお */}
      <ellipse cx="66" cy="112" rx="9" ry="5" fill="#e79a86" opacity="0.5" />
      <ellipse cx="134" cy="112" rx="9" ry="5" fill="#e79a86" opacity="0.5" />

      {/* 帽子 */}
      {hat === 'tophat' && (
        <g>
          <rect x="38" y="52" width="124" height="12" rx="6" fill="#2f2a25" />
          <path d="M62 52 L62 4 L138 4 L138 52 Z" fill="#3a332c" />
          <rect x="62" y="34" width="76" height="10" fill={accent} />
        </g>
      )}
      {hat === 'cap' && (
        <g>
          <path d="M54 62 C54 30 74 18 100 18 C126 18 146 30 146 62 Z" fill={coat} />
          <path d="M146 58 L186 66 L146 70 Z" fill={accent} />
          <circle cx="100" cy="22" r="6" fill={accent} />
        </g>
      )}
      {hat === 'bonnet' && (
        <g>
          <path d="M50 66 C50 28 74 14 100 14 C126 14 150 28 150 66 Z" fill="#f2e6d4" />
          <path d="M50 66 L150 66 L150 74 L50 74 Z" fill="#e0cdb2" />
          <circle cx="140" cy="34" r="8" fill={coat} />
        </g>
      )}
      {hat === 'straw' && (
        <g>
          <ellipse cx="100" cy="56" rx="72" ry="14" fill="#d8b671" />
          <path d="M60 56 C60 26 78 16 100 16 C122 16 140 26 140 56 Z" fill="#e3c485" />
          <path d="M60 48 L140 48 L140 56 L60 56 Z" fill={accent} opacity="0.7" />
        </g>
      )}
      {hat === 'hood' && (
        <g>
          <path
            d="M46 96 C46 40 70 20 100 20 C130 20 154 40 154 96 L142 96 C142 56 124 44 100 44 C76 44 58 56 58 96 Z"
            fill={accent}
          />
          <path d="M46 96 L58 96 L52 128 L38 122 Z" fill={accent} />
          <path d="M154 96 L142 96 L148 128 L162 122 Z" fill={accent} />
        </g>
      )}
    </svg>
  );
}

interface Props {
  character: Character;
  side: Side;
  pose: Pose;
  /** 今しゃべっている人かどうか（暗くするかの判定に使う） */
  active: boolean;
}

/** 会話画面の立ち絵 */
export function CharacterSprite({ character, side, pose, active }: Props) {
  const className = [
    'sprite',
    `sprite--${side}`,
    active ? 'sprite--active' : 'sprite--dim',
    `sprite--${pose}`,
  ].join(' ');

  return (
    <div
      className={className}
      style={{ '--sprite-scale': character.scale ?? 1 } as React.CSSProperties}
      aria-hidden="true"
    >
      <CharacterArt character={character} pose={pose} className="sprite__svg" />

      {/* 考えているとき・おどろいたときのフキダシ */}
      {pose === 'think' && <span className="sprite__bubble">?</span>}
      {pose === 'surprised' && <span className="sprite__bubble">!</span>}
    </div>
  );
}
