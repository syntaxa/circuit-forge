import React, { useState, useEffect } from 'react';
import { Exercise } from '../types';
import { Button } from './Button';
import { getDifficultyPillStyles } from '../utils/difficultyStyles';

const getExerciseImageUrl = (id: string) => `${import.meta.env.BASE_URL}exercise-images/${id}.png`;

interface ScreenExerciseDetailProps {
  exercise: Exercise;
  onBack: () => void;
}

export const ScreenExerciseDetail: React.FC<ScreenExerciseDetailProps> = ({ exercise, onBack }) => {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [exercise.id]);

  const imageUrl = getExerciseImageUrl(exercise.id);
  const showPlaceholder = imageError;

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
          <span className={`px-3 py-1 rounded-full border text-xs font-bold ${getDifficultyPillStyles(exercise.difficulty)}`}>
            {exercise.muscleGroup} • {exercise.difficulty}
          </span>
        </div>

        {/* Illustration: image from public/exercise-images/{id}.png or placeholder if missing */}
        <div
          className="w-full max-w-[280px] mx-auto aspect-square rounded-xl bg-slate-800 border border-slate-700 flex flex-col items-center justify-center text-slate-500 text-sm mb-6 overflow-hidden"
          aria-hidden
        >
          {showPlaceholder ? (
            <>
              <span>Иллюстрация</span>
              <span>появится позже</span>
            </>
          ) : (
            <img
              src={imageUrl}
              alt=""
              className="w-full h-full object-cover rounded-xl"
              onError={() => setImageError(true)}
            />
          )}
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
