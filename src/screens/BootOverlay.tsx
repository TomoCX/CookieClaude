import { hasSave } from '../state/gameState';
import { EffectLayer } from '../components/EffectLayer';
import { useText } from '../i18n/text';
import { UI } from '../i18n/ui';

/** 起動したときの表紙。ここから「最初から」か「続きから」を選ぶ。 */
export function BootOverlay({
  onNewGame,
  onContinue,
}: {
  onNewGame: () => void;
  onContinue: () => void;
}) {
  const t = useText();
  const canContinue = hasSave();

  return (
    <div className="overlay overlay--boot">
      <EffectLayer slot="boot.front" />
      <div className="boot">
        <p className="boot__sub">{t(UI.bootSub)}</p>
        <h1 className="boot__title">
          {t(UI.bootTitle1)}
          <br />
          {t(UI.bootTitle2)}
        </h1>
        <p className="boot__lead">{t(UI.bootLead)}</p>
        <div className="boot__buttons">
          <button type="button" className="boot__btn" onClick={onNewGame}>
            {t(UI.newGame)}
          </button>
          <button
            type="button"
            className="boot__btn boot__btn--sub"
            onClick={onContinue}
            disabled={!canContinue}
          >
            {t(UI.loadGame)}
          </button>
        </div>
        {!canContinue && <p className="boot__note">{t(UI.noSave)}</p>}
      </div>
    </div>
  );
}
