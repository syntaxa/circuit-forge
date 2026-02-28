import React, { useEffect, useState } from 'react';
import { MuscleGroup, Exercise, AppScreen } from '../types';
import { WorkoutGenerator } from '../services/workoutGenerator';
import { StorageService } from '../services/storageService';
import { Button } from './Button';
import { getDifficultyStyles } from '../utils/difficultyStyles';

interface ScreenSetupProps {
  /** null = нужна генерация. Если передано — используется без пересборки. */
  playlist?: Exercise[] | null;
  muscles?: MuscleGroup[] | null;
  /** Вызывается после генерации плейлиста (для сохранения в родителе при переходах между экранами). */
  onPlaylistReady?: (playlist: Exercise[], muscles: MuscleGroup[]) => void;
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

export const ScreenSetup: React.FC<ScreenSetupProps> = ({
  playlist: propPlaylist,
  muscles: propMuscles,
  onPlaylistReady,
  onStart,
  onNavigate,
  onOpenExerciseDetail,
}) => {
  const [localMuscles, setLocalMuscles] = useState<MuscleGroup[]>(propMuscles ?? []);
  const [localPlaylist, setLocalPlaylist] = useState<Exercise[]>(propPlaylist ?? []);
  const [loading, setLoading] = useState(propPlaylist == null && propMuscles == null);

  const needToGenerate = propPlaylist == null || propMuscles == null;
  const muscles = propMuscles ?? localMuscles;
  const playlist = propPlaylist ?? localPlaylist;

  useEffect(() => {
    if (!needToGenerate) {
      setLoading(false);
      return;
    }
    const selectedMuscles = WorkoutGenerator.selectMuscleGroups();
    const settings = StorageService.getSettings();
    const generatedPlaylist = WorkoutGenerator.generatePlaylist(selectedMuscles, settings.exercisesPerCycle);
    setLocalMuscles(selectedMuscles);
    setLocalPlaylist(generatedPlaylist);
    setLoading(false);
    onPlaylistReady?.(generatedPlaylist, selectedMuscles);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- onPlaylistReady: нужен только при смене needToGenerate
  }, [needToGenerate]);

  const displayMuscles = getDisplayMuscles(muscles);
  const fromPreviousGroups = displayMuscles.filter(m => m.fromPrevious);
  const newGroups = displayMuscles.filter(m => !m.fromPrevious);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      const selectedMuscles = WorkoutGenerator.selectMuscleGroups();
      const settings = StorageService.getSettings();
      const newPlaylist = WorkoutGenerator.generatePlaylist(selectedMuscles, settings.exercisesPerCycle);
      setLocalMuscles(selectedMuscles);
      setLocalPlaylist(newPlaylist);
      setLoading(false);
      onPlaylistReady?.(newPlaylist, selectedMuscles);
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

        <div className="bg-surface rounded-xl border border-slate-700 shadow-xl mb-2 sm:mb-3 overflow-hidden">
          {/* ВЕРХНЯЯ ЧАСТЬ: Статистика */}
          <div className="flex justify-between items-center px-4 py-4 sm:px-6 sm:py-5">
            <div className="flex flex-col items-center flex-1">
              <span className="text-[14px] text-slate-400 font-semibold mb-1">Упражнений</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-50 tracking-tight">{playlist.length}</span>
            </div>
            <div className="flex flex-col items-center flex-1">
              <span className="text-[14px] text-slate-400 font-semibold mb-1">Кругов</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-50 tracking-tight">{StorageService.getSettings().cycleCount}</span>
            </div>
            <div className="flex flex-col items-center flex-1">
              <span className="text-[14px] text-slate-400 font-semibold mb-1">Минут</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-50 tracking-tight">
                ~{Math.ceil((playlist.length * StorageService.getSettings().exerciseDuration * StorageService.getSettings().cycleCount) / 60)}
              </span>
            </div>
          </div>

          {/* Разделитель */}
          <div className="h-px w-full bg-slate-700/50"></div>

          {/* НИЖНЯЯ ЧАСТЬ: Теги мышц */}
          <div className="flex flex-wrap items-center px-4 py-3 sm:px-6 sm:py-4 gap-2 sm:gap-2.5 min-h-[60px]">
            
            {/* Группа прошлой тренировки */}
            {fromPreviousGroups.length > 0 && (
              <div className="flex items-center bg-white/5 border border-white/10 rounded-full pl-3 pr-1 py-1 gap-1.5 sm:gap-2">
                <span className="text-[9px] sm:text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                  Прошлая:
                </span>
                {fromPreviousGroups.map(({ group }) => (
                  <span
                    key={group}
                    className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wide bg-amber-500/15 text-amber-500"
                    title="Было в прошлой тренировке"
                  >
                    {group}
                  </span>
                ))}
                
                {/* Кнопка сброса истории (Крестик) */}
                <button
                  type="button"
                  onClick={handleForgetHistoryAndRefresh}
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-colors ml-0.5"
                  title="Не учитывать прошлую тренировку"
                  aria-label="Забыть историю тренировок"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            )}

            {/* Лейбл для полностью новых мышц (показывается только если нет истории) */}
            {fromPreviousGroups.length === 0 && newGroups.length > 0 && (
               <span className="text-[11px] sm:text-xs font-medium text-slate-400 mr-1">
                 Мышцы:
               </span>
            )}

            {/* Новые группы мышц */}
            {newGroups.map(({ group }) => (
              <span
                key={group}
                className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wide bg-emerald-500 text-emerald-950 shadow-[0_0_10px_rgba(16,185,129,0.15)]"
              >
                {group}
              </span>
            ))}
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
                      <span className={`text-xs px-2 py-1 rounded ${getDifficultyStyles(ex.difficulty)}`}>{ex.difficulty}</span>
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