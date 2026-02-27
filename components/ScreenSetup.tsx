import React, { useEffect, useState } from 'react';
import { MuscleGroup, Exercise, AppScreen } from '../types';
import { WorkoutGenerator } from '../services/workoutGenerator';
import { StorageService } from '../services/storageService';
import { Button } from './Button';

interface ScreenSetupProps {
  onStart: (playlist: Exercise[], muscles: MuscleGroup[]) => void;
  onNavigate: (screen: AppScreen) => void;
  onOpenExerciseDetail: (exercise: Exercise) => void;
}

function getDisplayMuscles(muscles: MuscleGroup[]): { group: MuscleGroup; fromPrevious: boolean }[] {
  const lastLog = StorageService.getLastLog();
  if (!lastLog?.muscleGroupsUsed?.length) {
    return muscles.map(m => ({ group: m, fromPrevious: false }));
  }
  const previousGroups = lastLog.muscleGroupsUsed;
  const fromPreviousInCurrent = muscles.filter(m => previousGroups.includes(m));
  fromPreviousInCurrent.sort((a, b) => previousGroups.indexOf(a) - previousGroups.indexOf(b));
  const rest = muscles.filter(m => !previousGroups.includes(m));
  const displayOrder = [...fromPreviousInCurrent, ...rest];
  return displayOrder.map(m => ({ group: m, fromPrevious: previousGroups.includes(m) }));
}

export const ScreenSetup: React.FC<ScreenSetupProps> = ({ onStart, onNavigate, onOpenExerciseDetail }) => {
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

  const displayMuscles = getDisplayMuscles(muscles);
  const fromPreviousGroups = displayMuscles.filter(m => m.fromPrevious);
  const newGroups = displayMuscles.filter(m => !m.fromPrevious);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      // Новый выбор групп мышц с учётом последней тренировки (2 из прошлых + 1 новая)
      const selectedMuscles = WorkoutGenerator.selectMuscleGroups();
      setMuscles(selectedMuscles);
      const settings = StorageService.getSettings();
      const newPlaylist = WorkoutGenerator.generatePlaylist(selectedMuscles, settings.exercisesPerCycle);
      setPlaylist(newPlaylist);
      setLoading(false);
    }, 300);
  };

  const handleForgetHistoryAndRefresh = () => {
    StorageService.clearHistory();
    handleRefresh();
  };

  return (
    <div className="flex flex-col h-screen min-h-0 overflow-hidden p-4 sm:p-6 animate-fade-in max-w-lg mx-auto">
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <div className="flex justify-between items-center mb-2 sm:mb-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate(AppScreen.ABOUT)}
              className="text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
              aria-label="О приложении"
            >
              <h1 className="text-2xl sm:text-3xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                CIRCUIT FORGE
              </h1>
            </button>
            <button
              type="button"
              onClick={() => onNavigate(AppScreen.ABOUT)}
              className="shrink-0 w-[15px] h-[15px] rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700/50 border border-slate-600 hover:border-slate-500 transition-colors text-xs font-bold"
              aria-label="О приложении"
              title="О приложении"
            >
              i
            </button>
          </div>
          <button onClick={() => onNavigate(AppScreen.SETTINGS)} className="p-1.5 text-slate-400 hover:text-white">
            ⚙️
          </button>
        </div>

        <div className="bg-surface rounded-xl p-3 sm:p-4 border border-slate-700 shadow-xl mb-2 sm:mb-3">
          <div className="flex justify-between items-end gap-2 w-4/5 mx-auto mb-3">
             <div>
               <p className="text-2xl font-bold text-white">{playlist.length}</p>
               <p className="text-xs text-slate-400">Упражнений</p>
             </div>
             <div>
                <p className="text-2xl font-bold text-white">{StorageService.getSettings().cycleCount}</p>
                <p className="text-xs text-slate-400">Круга</p>
             </div>
             <div>
                <p className="text-2xl font-bold text-white">~{Math.ceil((playlist.length * StorageService.getSettings().exerciseDuration * StorageService.getSettings().cycleCount) / 60)}</p>
                <p className="text-xs text-slate-400">Минут</p>
             </div>
          </div>

          <div className="flex flex-wrap items-end gap-x-10 gap-y-1 w-fit mx-auto">
            {fromPreviousGroups.length > 0 && (
              <div className="flex flex-col gap-1 min-w-0">
                <p className="uppercase tracking-wider text-amber-400/80 text-center" style={{ fontSize: '9px' }}>из последней тренировки</p>
                <div className="flex items-center justify-center gap-2">
                  {fromPreviousGroups.map(({ group }) => (
                    <span
                      key={group}
                      className="shrink-0 px-3 py-3 rounded-lg font-bold text-xs border bg-amber-500/15 text-amber-400 border-amber-400/40 ring-1 ring-amber-400/30"
                      title="Было в прошлой тренировке"
                    >
                      {group.toUpperCase()}
                    </span>
                  ))}
                  <button
                    type="button"
                    onClick={handleForgetHistoryAndRefresh}
                    className="shrink-0 px-2 py-2 rounded-lg border border-slate-700 bg-dark/40 text-slate-200 hover:bg-slate-800/60 hover:border-slate-600 transition-colors"
                    title="Забыть историю и сгенерировать полностью случайно"
                    aria-label="Забыть историю тренировок и сгенерировать новую тренировку"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            )}
            {newGroups.length > 0 && (
              <div className="flex flex-col gap-1 min-w-0">
                {fromPreviousGroups.length > 0 && (
                  <p className="uppercase tracking-wider text-primary text-center" style={{ fontSize: '9px' }}>новое</p>
                )}
                <div className="flex flex-wrap gap-1">
                  {newGroups.map(({ group }) => (
                    <span
                      key={group}
                      className="px-3 py-3 rounded-lg font-bold text-xs border bg-primary/10 text-primary border-primary/20"
                    >
                      {group.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            {playlist.length === 0 ? (
                 <div className="text-center text-red-400 p-4 border border-red-900/50 rounded-lg bg-red-900/10">
                    Не найдено упражнений для этих групп мышц. Добавьте их в базу!
                 </div>
            ) : (
                <div className="flex-1 min-h-0 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                {playlist.map((ex, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => onOpenExerciseDetail(ex)}
                      className="w-full text-left bg-dark/50 p-3 rounded-lg flex justify-between items-center border border-slate-800 hover:border-slate-600 hover:bg-slate-800/50 transition-colors cursor-pointer"
                      aria-label={`Подробнее об упражнении ${ex.name}`}
                    >
                      <span className="font-medium text-slate-200">{idx + 1}. {ex.name} <span className="text-slate-400 text-sm font-normal">ⓘ</span></span>
                      <span className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-400">{ex.difficulty}</span>
                    </button>
                ))}
                </div>
            )}
        </div>
      </div>

      <div className="flex-shrink-0 space-y-2 sm:space-y-3 pt-2 sm:pt-4">
        <Button 
            fullWidth 
            onClick={() => onStart(playlist, muscles)}
            disabled={playlist.length === 0}
            className="text-lg py-3 sm:py-4 shadow-emerald-500/20"
        >
            Начать тренировку
        </Button>
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <Button variant="secondary" onClick={handleRefresh}>↻ Обновить план</Button>
            <Button variant="secondary" onClick={() => onNavigate(AppScreen.DATABASE)}>База упражнений</Button>
        </div>
      </div>
    </div>
  );
};