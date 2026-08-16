import type { SceneImage } from '../types';

interface Props {
  image: SceneImage;
  className: string;
  /** 画像が読めなかったとき。呼ばれた側は描いた背景に戻す。 */
  onFail: () => void;
}

/**
 * シーンの背景に敷く画像。
 *
 * 絵は基本すべてインライン SVG で描くが、シーンの背景だけは
 * 開発者が `src/data/images.ts` に登録した画像へ差しかえられる。
 * ここはその一枚を貼るだけの部品で、どの画像を使うかは data の側が決める。
 *
 * **読めなかったときは `onFail` を呼ぶ。** 画像の在りかを書きまちがえても、
 * 画面が真っ黒になって理由が分からない、という止まりかたをしないため。
 */
export function SceneImageArt({ image, className, onFail }: Props) {
  return (
    <img
      className={className}
      src={image.src}
      alt=""
      aria-hidden="true"
      draggable={false}
      style={{ objectFit: image.fit ?? 'cover' }}
      onError={() => {
        console.warn(`[CookieClaude] 背景画像 ${image.id} を読めなかった。描いた背景に戻す。`);
        onFail();
      }}
    />
  );
}
