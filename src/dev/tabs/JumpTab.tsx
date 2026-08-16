import type { DevApi } from '../../types';
import { AREAS } from '../../data/areas';
import { SCENES, scenesOfArea } from '../../data/scenes';
import { SCENARIOS } from '../../data/scenarios';
import { PUZZLES, puzzleNo } from '../../data/puzzles';

/**
 * 中身へ飛ぶ。
 * 書いたばかりのシーン・会話・ナゾを、そこまで歩かずに確かめるための欄。
 */
export function JumpTab({ api }: { api: DevApi }) {
  const { state, setState } = api;

  /** そのエリアの開放を入り切りする */
  const toggleArea = (id: string) => {
    const open = state.openAreas.includes(id);
    setState({
      ...state,
      openAreas: open ? state.openAreas.filter((v) => v !== id) : [...state.openAreas, id],
    });
  };

  /** 会話の読了を入り切りする（開放や調査メモは動かさない） */
  const toggleScenario = (id: string) => {
    const done = state.clearedScenarios.includes(id);
    setState({
      ...state,
      clearedScenarios: done
        ? state.clearedScenarios.filter((v) => v !== id)
        : [...state.clearedScenarios, id],
    });
  };

  /** ナゾの正解を入り切りする（ピカラットは動かさない） */
  const toggleSolved = (id: string) => {
    const done = state.solvedPuzzles.includes(id);
    setState({
      ...state,
      solvedPuzzles: done
        ? state.solvedPuzzles.filter((v) => v !== id)
        : [...state.solvedPuzzles, id],
      foundPuzzles: state.foundPuzzles.includes(id)
        ? state.foundPuzzles
        : [...state.foundPuzzles, id],
    });
  };

  return (
    <div className="dev__body">
      <h3 className="dev__head">シーン</h3>
      <p className="dev__note">
        エリアごとにまとめてある。シーン {SCENES.length} 面 ／ エリア {AREAS.length} 区画。
      </p>
      {AREAS.map((area) => (
        <div key={area.id} className="dev__slot">
          <h4 className="dev__slot-head">
            {area.name} <code>{area.id}</code>
          </h4>
          <ul className="dev__list">
            {scenesOfArea(area.id).map((sc) => {
              const here = api.sceneId === sc.id;
              const isEntry = area.entrySceneId === sc.id;
              return (
                <li key={sc.id} className={`dev__row${here ? ' dev__row--here' : ''}`}>
                  <span className="dev__row-main">
                    <strong>{sc.name}</strong>
                    <code>{sc.id}</code>
                  </span>
                  <span className="dev__row-note">
                    {sc.kind}
                    {isEntry && ' ／ 入口'} ／ 人 {sc.npcs.length} ／ ナゾ {sc.puzzles.length} ／
                    品 {sc.sparkles.length} ／ 出口 {sc.exits.length}
                  </span>
                  <button type="button" className="dev__go" onClick={() => api.goToScene(sc.id)}>
                    {here ? '入りなおす' : '飛ぶ'}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      <h3 className="dev__head">エリアの開放</h3>
      <div className="dev__chips">
        {AREAS.map((area) => {
          const open = state.openAreas.includes(area.id);
          return (
            <button
              key={area.id}
              type="button"
              className={`dev__chip${open ? ' dev__chip--on' : ''}`}
              onClick={() => toggleArea(area.id)}
              title={open ? '閉じる' : '開く'}
            >
              {area.name}
            </button>
          );
        })}
      </div>

      <h3 className="dev__head">会話</h3>
      <ul className="dev__list">
        {SCENARIOS.map((sc) => {
          const done = state.clearedScenarios.includes(sc.id);
          return (
            <li key={sc.id} className="dev__row">
              <span className="dev__row-main">
                <strong>{sc.title}</strong>
                <code>{sc.id}</code>
              </span>
              <span className="dev__row-note">
                {sc.kind === 'main' ? '本筋' : '立ち話'} ／ {sc.lines.length} 行 ／ コイン{' '}
                {sc.coin}
              </span>
              <button
                type="button"
                className={`dev__chip dev__chip--slim${done ? ' dev__chip--on' : ''}`}
                onClick={() => toggleScenario(sc.id)}
                title="読了の入り切り"
              >
                {done ? '読了' : '未読'}
              </button>
              <button type="button" className="dev__go" onClick={() => api.playScenario(sc.id)}>
                読む
              </button>
            </li>
          );
        })}
      </ul>

      <h3 className="dev__head">ナゾ</h3>
      <ul className="dev__list">
        {PUZZLES.map((p) => {
          const done = state.solvedPuzzles.includes(p.id);
          return (
            <li key={p.id} className="dev__row">
              <span className="dev__row-main">
                <strong>
                  {puzzleNo(p)}・{p.title}
                </strong>
                <code>{p.id}</code>
              </span>
              <span className="dev__row-note">
                {p.answer.kind} ／ {p.picarat[0]} P ／ ヒント {p.hints.length}
              </span>
              <button
                type="button"
                className={`dev__chip dev__chip--slim${done ? ' dev__chip--on' : ''}`}
                onClick={() => toggleSolved(p.id)}
                title="正解の入り切り"
              >
                {done ? '正解' : '未解'}
              </button>
              <button type="button" className="dev__go" onClick={() => api.openPuzzle(p.id)}>
                開く
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
