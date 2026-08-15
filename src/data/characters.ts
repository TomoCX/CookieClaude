import type { Character } from '../types';

/** 登場人物の定義 */
export const CHARACTERS: Record<string, Character> = {
  claude: {
    id: 'claude',
    name: 'クロード',
    side: 'right',
    hat: 'tophat',
    coat: '#c8763a',
    accent: '#7a3f18',
    skin: '#f6d6b8',
    hair: '#4a3524',
  },
  cookie: {
    id: 'cookie',
    name: 'クッキー',
    side: 'left',
    hat: 'cap',
    coat: '#3f6ea8',
    accent: '#26456b',
    skin: '#f9dcc0',
    hair: '#8a5a2b',
  },
  martha: {
    id: 'martha',
    name: 'マーサ',
    side: 'left',
    hat: 'bonnet',
    coat: '#a34f6d',
    accent: '#6e2f45',
    skin: '#f7d9bd',
    hair: '#6b4a3a',
  },
  gear: {
    id: 'gear',
    name: 'ギアじいさん',
    side: 'left',
    hat: 'none',
    coat: '#5f7a52',
    accent: '#3d5134',
    skin: '#eecfaf',
    hair: '#d9d4c8',
  },
  mint: {
    id: 'mint',
    name: 'ミント',
    side: 'left',
    hat: 'none',
    coat: '#6fae9a',
    accent: '#3f7f6b',
    skin: '#fadfc6',
    hair: '#c98b3f',
  },
};

/** id から登場人物を取得する（未定義なら undefined） */
export function getCharacter(id: string | undefined): Character | undefined {
  return id ? CHARACTERS[id] : undefined;
}
