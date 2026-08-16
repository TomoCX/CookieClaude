import type { Area } from '../types';
import { useText } from '../i18n/text';
import { UI } from '../i18n/ui';


interface Props {
  areas: Area[];
  openAreas: string[];
  clearedScenarios: string[];
  currentAreaId: string;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

/**
 * 町の俯瞰図。行けるようになったエリアにだけピンが立つ。
 * ナゾは地図ではなく、それぞれのシーンの中に置いてある。
 */
export function TownMap({
  areas,
  openAreas,
  clearedScenarios,
  currentAreaId,
  selectedId,
  onSelect,
}: Props) {
  const t = useText();
  return (
    <div className="map" onClick={() => onSelect(null)} role="presentation">
      <svg
        className="map__art"
        viewBox="0 0 400 300"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="map-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#b9d7e4" />
            <stop offset="55%" stopColor="#e6dcc0" />
            <stop offset="100%" stopColor="#c2a878" />
          </linearGradient>
        </defs>
        <rect width="400" height="300" fill="url(#map-sky)" />

        {/* 遠くの丘 */}
        <path
          d="M0 96 Q80 62 160 92 Q240 118 320 88 Q368 72 400 88 L400 300 L0 300 Z"
          fill="#9db785"
        />
        <path
          d="M0 128 Q100 104 200 130 Q300 156 400 126 L400 300 L0 300 Z"
          fill="#8caa76"
        />

        {/* 町の地面 */}
        <path d="M0 160 Q200 138 400 162 L400 300 L0 300 Z" fill="#d8c49a" />

        {/* 大通り */}
        <path
          d="M60 292 Q120 236 180 214 Q260 184 340 132"
          stroke="#efe0bf"
          strokeWidth="20"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M60 292 Q120 236 180 214 Q260 184 340 132"
          stroke="#c9b088"
          strokeWidth="20"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="4 14"
        />

        {/* 家並み */}
        <g>
          {[
            [40, 210, '#c56b52'],
            [96, 178, '#d2a05c'],
            [148, 250, '#b3654e'],
            [212, 236, '#c89a58'],
            [268, 200, '#bd6a4f'],
            [318, 232, '#cfa262'],
            [356, 186, '#b8654d'],
            [128, 152, '#cf9d5d'],
            [232, 148, '#c06b51'],
          ].map(([x, y, color], i) => (
            <g key={i} transform={`translate(${x as number} ${y as number})`}>
              <rect x="-16" y="-2" width="32" height="26" fill="#e8d6b4" />
              <path d="M-21 -2 L21 -2 L0 -22 Z" fill={color as string} />
              <rect x="-6" y="8" width="12" height="16" fill="#7a5b3e" />
            </g>
          ))}
        </g>

        {/* 時計塔 */}
        <g transform="translate(300 74)">
          <path d="M-13 60 L-9 0 L9 0 L13 60 Z" fill="#a68f6c" />
          <path d="M-11 0 L0 -18 L11 0 Z" fill="#7c5d45" />
          <circle cx="0" cy="18" r="9" fill="#f6ecd6" stroke="#6f5a41" strokeWidth="2.5" />
          <path d="M0 18 L0 12" stroke="#4c3d2c" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M0 18 L5 21" stroke="#4c3d2c" strokeWidth="1.6" strokeLinecap="round" />
        </g>

        {/* 木 */}
        <g fill="#6f9459">
          <circle cx="70" cy="168" r="10" />
          <circle cx="186" cy="186" r="8" />
          <circle cx="352" cy="258" r="11" />
          <circle cx="248" cy="272" r="9" />
        </g>
      </svg>

      {/*
        行き先ピン。
        まだ開いていないエリアは、影も名前も出さない（存在を伏せる）。
        いまいるエリアだけは、形も色も変えて一目で分かるようにする。
      */}
      {areas
        .filter((area) => openAreas.includes(area.id))
        .map((area) => {
          const cleared = clearedScenarios.includes(area.mainScenarioId);
          const isHere = area.id === currentAreaId;
          const isSelected = area.id === selectedId;
          const cls = ['pin', 'pin--open']
            .concat(cleared ? 'pin--cleared' : [])
            .concat(isHere ? 'pin--here' : [])
            .concat(isSelected ? 'pin--selected' : [])
            .join(' ');

          return (
            <button
              key={area.id}
              type="button"
              className={cls}
              style={{ left: `${area.x}%`, top: `${area.y}%` }}
              aria-label={isHere ? `${t(area.name)}${t(UI.hereSuffix)}` : t(area.name)}
              aria-current={isHere ? 'location' : undefined}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(isSelected ? null : area.id);
              }}
            >
              {isHere && (
                <span className="pin__here" aria-hidden="true">
                  {t(UI.here)}
                </span>
              )}
              <span className="pin__marker" aria-hidden="true">
                {/* いまいる場所は、探偵の帽子を置いて他と区別する */}
                {isHere ? (
                  <svg viewBox="0 0 24 24" className="pin__hat">
                    <path d="M6.5 15.5 Q4 15 3 14.2 L3 16 Q7 18.4 12 18.4 Q17 18.4 21 16 L21 14.2 Q20 15 17.5 15.5 Z" />
                    <path d="M7.6 6.4 Q7.2 4.6 9 4.4 L15 4.4 Q16.8 4.6 16.4 6.4 L15.6 15.4 Q12 16.3 8.4 15.4 Z" />
                    <rect x="7.2" y="11.4" width="9.6" height="2.6" rx="0.6" opacity="0.45" />
                  </svg>
                ) : (
                  <i className="pin__glyph">{cleared ? '✓' : '!'}</i>
                )}
              </span>
              <span className="pin__name">{t(area.name)}</span>
            </button>
          );
        })}
    </div>
  );
}
