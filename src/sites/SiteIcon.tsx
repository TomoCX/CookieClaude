import type { SiteIconId } from '../types';

/**
 * ホームページのアイコン。
 * メインメニューの下に小さく並べるので、細部は描かず輪郭だけで見分ける。
 */
export function SiteIcon({ id }: { id: SiteIconId }) {
  return (
    <svg viewBox="0 0 24 24" className="siteicon__art" aria-hidden="true">
      {id === 'lantern' && (
        <g>
          {/* 提灯。古風な個人サイトの目じるし。 */}
          <path d="M12 2 V4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <rect x="7" y="4" width="10" height="2" rx="1" fill="currentColor" />
          <path
            d="M8 6 Q4.5 12 8 18 L16 18 Q19.5 12 16 6 Z"
            fill="currentColor"
            opacity="0.24"
            stroke="currentColor"
            strokeWidth="1.4"
          />
          <path d="M5.6 10 H18.4 M5.6 14 H18.4" stroke="currentColor" strokeWidth="1.1" />
          <rect x="9" y="18" width="6" height="2" rx="1" fill="currentColor" />
          <path d="M12 20 V22" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </g>
      )}
      {id === 'bounce' && (
        <g>
          {/* 弾む球と、その下の影。商品ページの目じるし。 */}
          <circle cx="12" cy="8.5" r="5.5" fill="currentColor" opacity="0.28" />
          <circle cx="12" cy="8.5" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M9.4 6.6 Q12 5.2 14.6 6.6" stroke="currentColor" strokeWidth="1.2" fill="none" />
          <ellipse cx="12" cy="19" rx="7" ry="2.2" fill="currentColor" opacity="0.35" />
          <path
            d="M4.5 15.5 Q6 13 7.5 15.5"
            stroke="currentColor"
            strokeWidth="1.3"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M16.5 15.5 Q18 13 19.5 15.5"
            stroke="currentColor"
            strokeWidth="1.3"
            fill="none"
            strokeLinecap="round"
          />
        </g>
      )}
      {id === 'disc' && (
        <g>
          {/* レコード盤。ポータルの目じるし。 */}
          <circle cx="12" cy="12" r="9.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" strokeWidth="0.9" opacity="0.7" />
          <circle cx="12" cy="12" r="3.6" fill="currentColor" opacity="0.3" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
          <path d="M17.4 6.6 A7.6 7.6 0 0 1 18.6 9.4" stroke="currentColor" strokeWidth="1" fill="none" />
        </g>
      )}
    </svg>
  );
}
