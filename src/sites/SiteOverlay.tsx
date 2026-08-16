import { useEffect } from 'react';
import type { SiteDef } from '../types';
import { playSe } from '../audio/audio';
import { useText } from '../i18n/text';
import { UI } from '../i18n/ui';

interface Props {
  site: SiteDef;
  onClose: () => void;
}

/**
 * ホームページを画面いっぱいにかぶせる枠。
 *
 * 中身（`site.page()`）には手を出さない。**この枠が持つのは
 * 「ゲームに戻る」ための細い帯と、外側の余白だけ**で、
 * それぞれのサイトは枠の中で好きに作ってよい
 * （見出しも配色も動きも、サイトごとに別々でかまわない）。
 */
export function SiteOverlay({ site, onClose }: Props) {
  const t = useText();
  const Page = site.page;

  // Escape でも戻れる。ゲームのほうと同じ約束にしておく。
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="siteview">
      <div className="siteview__bar">
        <button
          type="button"
          className="siteview__back"
          onClick={() => {
            playSe('click');
            onClose();
          }}
        >
          ↰ {t(UI.siteBack)}
        </button>
        <span className="siteview__name">{t(site.name)}</span>
      </div>

      {/* 中身。ここから下はサイトごとの世界。 */}
      <div className="siteview__page">
        <Page />
      </div>
    </div>
  );
}
