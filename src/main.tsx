import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { reportContentProblems } from './data/registry';

// 中身（場所・人物・会話・ナゾ・アイテム）のつながりを起動時に検査する
reportContentProblems();

const container = document.getElementById('root');
if (!container) throw new Error('#root が見つかりません');

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
