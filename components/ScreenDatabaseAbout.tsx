import React from 'react';
import { Button } from './Button';

interface ScreenDatabaseAboutProps {
  onBack: () => void;
}

const DATABASE_ABOUT_TEXT = `Здесь собраны все упражнения: встроенная база и ваши собственные.

Фильтры «Все», «База», «Моё» — переключают источник. Поиск и группа мышц сужают список. Счётчики под заголовком показывают, сколько упражнений в каждой группе.

Упражнения из базы нельзя править напрямую: нажатие «Редактировать» создаёт вашу копию в «Моё» и отключает оригинал в подборке. Свои упражнения можно редактировать и удалять.

Добавляйте свои упражнения кнопкой «+ Добавить упражнение» — они попадут в общий пул и могут быть выбраны генератором плана. Всё хранится только на устройстве.`;

export const ScreenDatabaseAbout: React.FC<ScreenDatabaseAboutProps> = ({ onBack }) => {
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
        <h1 className="text-lg font-bold text-slate-300">База упражнений</h1>
        <div className="w-9" aria-hidden />
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto pr-2 custom-scrollbar">
        <div className="bg-surface rounded-xl p-4 sm:p-5 border border-slate-700 shadow-xl">
          <p className="text-slate-200 whitespace-pre-line leading-relaxed text-sm sm:text-base">
            {DATABASE_ABOUT_TEXT}
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
