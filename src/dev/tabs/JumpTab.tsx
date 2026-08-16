import type { DevApi } from '../../types';
import { PLACES, getPlace } from '../../data/places';
import { STREETS } from '../../data/streets';
import { SCENARIOS } from '../../data/scenarios';
import { PUZZLES, puzzleNo } from '../../data/puzzles';

/**
 * 中身へ飛ぶ。
 * 書いたばかりの会話やナゾを、その場所まで歩かずに確かめるための欄。
 */
export function JumpTab({ api }: { api: DevApi }) {
  const { state, setState } = api;

  /** その場所の開放を入り切りする */
  const togglePlace = (id: string) => {
    const open = state.openPlaces.includes(id);
    setState({
      ...state,
      openPlaces: open ? state.openPlaces.filter((v) => v !== id) : [...state.openPlaces, id],
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
      <h3 className="dev__head">街並み</h3>
      <ul className="dev__list">
        {STREETS.map((s) => {
          const place = getPlace(s.placeId);
          const here = api.streetId === s.id;
          return (
            <li key={s.id} className={`dev__row${here ? ' dev__row--here' : ''}`}>
              <span className="dev__row-main">
                <strong>{place?.name ?? s.placeId}</strong>
                <code>{s.id}</code>
              </span>
              <span className="dev__row-note">
                人 {s.npcs.length} ／ ナゾ {s.puzzles.length} ／ 品 {s.sparkles.length} ／ 出口{' '}
                {s.exits.length}
              </span>
              <button type="button" className="dev__go" onClick={() => api.goToStreet(s.id)}>
                {here ? '入りなおす' : '飛ぶ'}
              </button>
            </li>
          );
        })}
      </ul>

      <h3 className="dev__head">場所の開放</h3>
      <div className="dev__chips">
        {PLACES.map((p) => {
          const open = state.openPlaces.includes(p.id);
          return (
            <button
              key={p.id}
              type="button"
              className={`dev__chip${open ? ' dev__chip--on' : ''}`}
              onClick={() => togglePlace(p.id)}
              title={open ? '閉じる' : '開く'}
            >
              {p.name}
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
