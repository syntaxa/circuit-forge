import React from 'react';
import { Button } from './Button';
import { APP_VERSION } from '../constants';

interface ScreenAboutProps {
  onBack: () => void;
}

const ABOUT_TEXT = `Circuit Forge — интервальные тренировки (HIIT) дома с собственным весом и стулом, без инвентаря.

Каждый раз подбираются 3 группы мышц: 2 из прошлой тренировки и 1 новая — так нагрузка остаётся разнообразной и сбалансированной.

В приложении есть встроенные упражнения, а также своя база: можно добавлять, редактировать и удалять упражнения; всё хранится локально на устройстве.

Названия упражнений на английском. Так они короче и это удобнее для голосовых подсказок.`;

export const ScreenAbout: React.FC<ScreenAboutProps> = ({ onBack }) => {
  return (
    <div className="flex flex-col h-screen min-h-0 overflow-hidden p-4 sm:p-6 animate-fade-in max-w-lg mx-auto">
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <button
          onClick={onBack}
          className="p-1.5 text-slate-400 hover:text-white transition-colors"
          aria-label="Назад"
        >
          ←
        </button>
        <h1 className="text-lg font-bold text-slate-300">О приложении</h1>
        <div className="w-9" aria-hidden />
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto pr-2 custom-scrollbar flex flex-col">
        <div className="flex-shrink-0 flex flex-col items-center pt-2 pb-5">
          <img
            src={`${import.meta.env.BASE_URL}icon-192.png`}
            alt="Иконка приложения Circuit Forge"
            className="w-16 h-16 rounded-2xl shadow-lg ring-1 ring-slate-600/50"
          />
          <span className="mt-3 text-slate-400 font-semibold text-sm tracking-wide">
            Circuit Forge
          </span>
          <span className="mt-1 text-slate-500 text-xs font-normal">
            v. {APP_VERSION}
          </span>
        </div>
        <div className="bg-surface rounded-xl p-4 sm:p-5 border border-slate-700 shadow-xl">
          <p className="text-slate-200 whitespace-pre-line leading-relaxed text-sm sm:text-base">
            {ABOUT_TEXT}
          </p>
        </div>
      </div>

      <div className="flex-shrink-0 pt-4">
        <Button fullWidth variant="secondary" onClick={onBack}>
          Назад
        </Button>
      </div>
    </div>
  );
};
