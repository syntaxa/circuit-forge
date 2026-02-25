import React from 'react';
import { Exercise } from '../types';
import { Button } from './Button';

interface ScreenExerciseDetailProps {
  exercise: Exercise;
  onBack: () => void;
}

export const ScreenExerciseDetail: React.FC<ScreenExerciseDetailProps> = ({ exercise, onBack }) => {
  return (
    <div className="h-full w-full flex flex-col bg-dark text-white overflow-auto">
      <div className="flex flex-col p-6 max-w-lg mx-auto w-full flex-1">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" onClick={onBack} className="shrink-0" aria-label="Назад">
            ← Назад
          </Button>
        </div>

        <h1 className="text-2xl font-black text-white mb-4 leading-tight">
          {exercise.name}
        </h1>

        <div className="inline-flex items-center gap-2 mb-6">
          <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300">
            {exercise.muscleGroup} • {exercise.difficulty}
          </span>
        </div>

        {/* Placeholder for square illustration (images not ready yet) */}
        <div
          className="w-full max-w-[280px] mx-auto aspect-square rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 text-sm mb-6"
          aria-hidden
        >
          Иллюстрация
        </div>

        <div className="space-y-4">
          {exercise.description && (
            <p className="text-slate-300 leading-relaxed">
              {exercise.description}
            </p>
          )}
          {exercise.steps && (
            <div className="text-slate-400 text-sm">
              <h2 className="text-slate-300 font-bold mb-2 text-base">Как выполнять</h2>
              <p className="whitespace-pre-line leading-relaxed">{exercise.steps}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
