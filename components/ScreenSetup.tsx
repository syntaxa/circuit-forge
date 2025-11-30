import React, { useEffect, useState } from 'react';
import { MuscleGroup, Exercise, AppScreen } from '../types';
import { WorkoutGenerator } from '../services/workoutGenerator';
import { StorageService } from '../services/storageService';
import { Button } from './Button';

interface ScreenSetupProps {
  onStart: (playlist: Exercise[], muscles: MuscleGroup[]) => void;
  onNavigate: (screen: AppScreen) => void;
}

export const ScreenSetup: React.FC<ScreenSetupProps> = ({ onStart, onNavigate }) => {
  const [muscles, setMuscles] = useState<MuscleGroup[]>([]);
  const [playlist, setPlaylist] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Generate new workout logic
    const selectedMuscles = WorkoutGenerator.selectMuscleGroups();
    setMuscles(selectedMuscles);
    
    const settings = StorageService.getSettings();
    const generatedPlaylist = WorkoutGenerator.generatePlaylist(selectedMuscles, settings.exercisesPerCycle);
    setPlaylist(generatedPlaylist);
    setLoading(false);
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      // Force random re-selection logic manually or just re-run algo
      // Ideally we might want a 'force refresh' method, but calling the algo again usually yields different results if random seeds involved
      // For MVP, we stick to the algo, maybe shuffle the playlist
      const settings = StorageService.getSettings();
      // Keep muscles, just regen playlist for variety
      const newPlaylist = WorkoutGenerator.generatePlaylist(muscles, settings.exercisesPerCycle);
      setPlaylist(newPlaylist);
      setLoading(false);
    }, 300);
  };

  return (
    <div className="flex flex-col h-full p-6 animate-fade-in max-w-lg mx-auto">
      <div className="flex-1">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
            CIRCUIT FORGE
          </h1>
          <button onClick={() => onNavigate(AppScreen.SETTINGS)} className="p-2 text-slate-400 hover:text-white">
            ⚙️
          </button>
        </div>

        <div className="bg-surface rounded-2xl p-6 border border-slate-700 shadow-xl mb-6">
          <h2 className="text-sm uppercase tracking-widest text-slate-400 font-bold mb-4">Цель на сегодня</h2>
          <div className="flex flex-wrap gap-2 mb-6">
            {muscles.map(m => (
              <span key={m} className="px-4 py-2 rounded-lg bg-primary/10 text-primary border border-primary/20 font-bold text-sm">
                {m.toUpperCase()}
              </span>
            ))}
          </div>
          
          <div className="flex justify-between items-end">
             <div>
               <p className="text-3xl font-bold text-white">{playlist.length}</p>
               <p className="text-xs text-slate-400">Упражнений</p>
             </div>
             <div>
                <p className="text-3xl font-bold text-white">{StorageService.getSettings().cycleCount}</p>
                <p className="text-xs text-slate-400">Круга</p>
             </div>
             <div>
                <p className="text-3xl font-bold text-white">~{Math.ceil((playlist.length * StorageService.getSettings().exerciseDuration * StorageService.getSettings().cycleCount) / 60)}</p>
                <p className="text-xs text-slate-400">Минут</p>
             </div>
          </div>
        </div>

        <div className="space-y-2 mb-8">
            <h3 className="text-slate-400 text-sm font-bold mb-2">Предпросмотр:</h3>
            {playlist.length === 0 ? (
                 <div className="text-center text-red-400 p-4 border border-red-900/50 rounded-lg bg-red-900/10">
                    Не найдено упражнений для этих групп мышц. Добавьте их в базу!
                 </div>
            ) : (
                <div className="max-h-60 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                {playlist.map((ex, idx) => (
                    <div key={idx} className="bg-dark/50 p-3 rounded-lg flex justify-between items-center border border-slate-800">
                    <span className="font-medium text-slate-200">{idx + 1}. {ex.name}</span>
                    <span className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-400">{ex.difficulty}</span>
                    </div>
                ))}
                </div>
            )}
        </div>
      </div>

      <div className="space-y-3">
        <Button 
            fullWidth 
            onClick={() => onStart(playlist, muscles)}
            disabled={playlist.length === 0}
            className="text-lg py-4 shadow-emerald-500/20"
        >
            Начать тренировку
        </Button>
        <div className="grid grid-cols-2 gap-3">
            <Button variant="secondary" onClick={handleRefresh}>↻ Обновить план</Button>
            <Button variant="secondary" onClick={() => onNavigate(AppScreen.DATABASE)}>База упражнений</Button>
        </div>
      </div>
    </div>
  );
};