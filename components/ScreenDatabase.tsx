import React, { useState, useCallback } from 'react';
import { Exercise, MuscleGroup, Difficulty } from '../types';
import { StorageService } from '../services/storageService';
import { Button } from './Button';
import { ALL_MUSCLE_GROUPS } from '../constants';
import { getDifficultyStyles } from '../utils/difficultyStyles';

type FilterSource = 'all' | 'base' | 'user';

interface ScreenDatabaseProps {
  onBack: () => void;
  onOpenInfo: () => void;
  onOpenExerciseDetail?: (exercise: Exercise) => void;
}

const CLONE_WARNING_MESSAGE =
  'Будет создана копия упражнения в «Моё» и это упражнение в базе будет отключено. Вы сможете править только свою копию.';

export const ScreenDatabase: React.FC<ScreenDatabaseProps> = ({ onBack, onOpenInfo, onOpenExerciseDetail }) => {
  const [exercises, setExercises] = useState<Exercise[]>(() => StorageService.getExercises());
  const [deactivatedIds, setDeactivatedIds] = useState<string[]>(() =>
    StorageService.getDeactivatedBaseIds()
  );
  const [isEditing, setIsEditing] = useState(false);
  const [currentEx, setCurrentEx] = useState<Partial<Exercise>>({});
  const [filterName, setFilterName] = useState('');
  const [filterMuscleGroup, setFilterMuscleGroup] = useState<MuscleGroup | ''>('');
  const [filterSource, setFilterSource] = useState<FilterSource>('all');
  const [showCloneWarning, setShowCloneWarning] = useState(false);
  const [cloneWarningDontShow, setCloneWarningDontShow] = useState(false);
  const [pendingEditAfterClone, setPendingEditAfterClone] = useState<Exercise | null>(null);

  const refresh = useCallback(() => {
    setExercises(StorageService.getExercises());
    setDeactivatedIds(StorageService.getDeactivatedBaseIds());
  }, []);

  const filteredBySource = React.useMemo(() => {
    if (filterSource === 'all') return exercises;
    if (filterSource === 'base') return exercises.filter(e => e.source === 'base');
    return exercises.filter(e => e.source === 'user');
  }, [exercises, filterSource]);

  const filteredAndSorted = React.useMemo(() => {
    let list = filteredBySource;
    if (filterName.trim()) {
      const q = filterName.trim().toLowerCase();
      list = list.filter(e => e.name.toLowerCase().includes(q));
    }
    if (filterMuscleGroup) {
      list = list.filter(e => e.muscleGroup === filterMuscleGroup);
    }
    return [...list].sort((a, b) => a.name.localeCompare(b.name, 'en'));
  }, [filteredBySource, filterName, filterMuscleGroup]);

  const statsByGroup = React.useMemo(() => {
    const counts: Record<string, number> = {};
    ALL_MUSCLE_GROUPS.forEach(g => {
      counts[g] = 0;
    });
    filteredAndSorted.forEach(e => {
      counts[e.muscleGroup] = (counts[e.muscleGroup] ?? 0) + 1;
    });
    return counts;
  }, [filteredAndSorted]);

  const handleDelete = (id: string) => {
    if (confirm('Удалить упражнение?')) {
      const userExercises = StorageService.getUserExercises().filter(e => e.id !== id);
      StorageService.saveUserExercises(userExercises);
      refresh();
    }
  };

  const startEditBase = (ex: Exercise) => {
    if (StorageService.getHideCloneWarning()) {
      doCloneAndEdit(ex);
      return;
    }
    setPendingEditAfterClone(ex);
    setShowCloneWarning(true);
  };

  const doCloneAndEdit = (baseEx: Exercise) => {
    const clone: Exercise = {
      ...baseEx,
      id: `user_${Date.now()}`,
      source: 'user',
    };
    const userExercises = [...StorageService.getUserExercises(), clone];
    StorageService.saveUserExercises(userExercises);
    StorageService.setDeactivatedBaseIds([
      ...StorageService.getDeactivatedBaseIds(),
      baseEx.id,
    ]);
    if (cloneWarningDontShow) {
      StorageService.setHideCloneWarning(true);
    }
    setShowCloneWarning(false);
    setPendingEditAfterClone(null);
    setCloneWarningDontShow(false);
    refresh();
    setCurrentEx(clone);
    setIsEditing(true);
  };

  const handleConfirmCloneWarning = () => {
    if (pendingEditAfterClone) {
      doCloneAndEdit(pendingEditAfterClone);
    }
  };

  const handleCancelCloneWarning = () => {
    setShowCloneWarning(false);
    setPendingEditAfterClone(null);
    setCloneWarningDontShow(false);
  };

  const handleEdit = (ex: Exercise) => {
    if (ex.source === 'base') {
      startEditBase(ex);
      return;
    }
    setCurrentEx(ex);
    setIsEditing(true);
  };

  const handleToggleBaseActive = (id: string) => {
    StorageService.toggleBaseActive(id);
    setDeactivatedIds(StorageService.getDeactivatedBaseIds());
  };

  const handleAddNew = () => {
    setCurrentEx({
      name: '',
      description: '',
      steps: '',
      muscleGroup: MuscleGroup.LEGS,
      difficulty: Difficulty.MEDIUM,
      biSided: false,
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!currentEx.name || !currentEx.muscleGroup || !currentEx.difficulty) return;

    const fullEx: Exercise = {
      ...currentEx,
      id: currentEx.id ?? `user_${Date.now()}`,
      name: currentEx.name,
      description: currentEx.description ?? '',
      steps: currentEx.steps ?? '',
      muscleGroup: currentEx.muscleGroup,
      difficulty: currentEx.difficulty,
      biSided: currentEx.biSided ?? false,
      source: 'user',
    };

    const userExercises = StorageService.getUserExercises();
    if (currentEx.id) {
      const updated = userExercises.map(e => (e.id === currentEx.id ? fullEx : e));
      StorageService.saveUserExercises(updated);
    } else {
      StorageService.saveUserExercises([...userExercises, fullEx]);
    }
    refresh();
    setIsEditing(false);
  };

  if (showCloneWarning && pendingEditAfterClone) {
    return (
      <div className="p-4 pb-24 animate-fade-in max-w-lg mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-primary">Редактирование упражнения из базы</h2>
        <p className="text-slate-300 mb-4">{CLONE_WARNING_MESSAGE}</p>
        <div className="flex items-center gap-3 mb-6">
          <input
            type="checkbox"
            id="dontShowClone"
            checked={cloneWarningDontShow}
            onChange={e => setCloneWarningDontShow(e.target.checked)}
            className="w-4 h-4 rounded border-slate-600 bg-surface text-primary focus:ring-primary"
          />
          <label htmlFor="dontShowClone" className="text-slate-300 text-sm cursor-pointer">
            Понятно, больше не показывать
          </label>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={handleCancelCloneWarning}>
            Отмена
          </Button>
          <Button fullWidth onClick={handleConfirmCloneWarning}>
            Создать копию и редактировать
          </Button>
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="p-4 pb-24 animate-fade-in max-w-lg mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-primary">
          {currentEx.id ? 'Редактировать' : 'Добавить'}
        </h2>
        <div className="space-y-4">
          <div>
            <label className="text-slate-400 text-sm">Название</label>
            <p className="text-slate-500 text-xs mt-0.5 mb-1">
              Лучше использовать английские названия упражнений или будет казус с произношением ;)
            </p>
            <input
              className="w-full bg-surface border border-slate-600 rounded-lg p-3 text-white focus:border-primary outline-none"
              value={currentEx.name || ''}
              onChange={e => setCurrentEx({ ...currentEx, name: e.target.value })}
            />
          </div>
          <div>
            <label className="text-slate-400 text-sm">Описание</label>
            <textarea
              className="w-full bg-surface border border-slate-600 rounded-lg p-3 text-white focus:border-primary outline-none h-24"
              value={currentEx.description || ''}
              onChange={e => setCurrentEx({ ...currentEx, description: e.target.value })}
            />
          </div>
          <div>
            <label className="text-slate-400 text-sm">Шаги исполнения</label>
            <textarea
              className="w-full bg-surface border border-slate-600 rounded-lg p-3 text-white focus:border-primary outline-none h-[300px] resize-y"
              value={currentEx.steps ?? ''}
              onChange={e => setCurrentEx({ ...currentEx, steps: e.target.value })}
              placeholder="Например: 1. Шаг один. 2. Шаг два. (каждый шаг с новой строки)"
            />
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="biSided"
              checked={currentEx.biSided ?? false}
              onChange={e => setCurrentEx({ ...currentEx, biSided: e.target.checked })}
              className="w-4 h-4 rounded border-slate-600 bg-surface text-primary focus:ring-primary"
            />
            <label htmlFor="biSided" className="text-slate-300 text-sm cursor-pointer">
              Двухстороннее упражнение
            </label>
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-slate-400 text-sm">Группа мышц</label>
              <select
                className="w-full bg-surface border border-slate-600 rounded-lg p-3 text-white focus:border-primary outline-none"
                value={currentEx.muscleGroup}
                onChange={e =>
                  setCurrentEx({ ...currentEx, muscleGroup: e.target.value as MuscleGroup })
                }
              >
                {ALL_MUSCLE_GROUPS.map(g => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="text-slate-400 text-sm">Сложность</label>
              <select
                className="w-full bg-surface border border-slate-600 rounded-lg p-3 text-white focus:border-primary outline-none"
                value={currentEx.difficulty}
                onChange={e =>
                  setCurrentEx({ ...currentEx, difficulty: e.target.value as Difficulty })
                }
              >
                {Object.values(Difficulty).map(d => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="secondary" fullWidth onClick={() => setIsEditing(false)}>
              Отмена
            </Button>
            <Button fullWidth onClick={handleSave}>
              Сохранить
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isEmptyMy = filterSource === 'user' && filteredAndSorted.length === 0;

  return (
    <div className="p-4 pb-24 animate-fade-in max-w-lg mx-auto">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenInfo}
            className="text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
            aria-label="Как пользоваться базой упражнений"
          >
            <h2 className="text-2xl font-bold text-primary">База упражнений</h2>
          </button>
          <button
            type="button"
            onClick={onOpenInfo}
            className="shrink-0 w-[15px] h-[15px] rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700/50 border border-slate-600 hover:border-slate-500 transition-colors text-xs font-bold"
            aria-label="Как пользоваться базой упражнений"
            title="Как пользоваться базой упражнений"
          >
            i
          </button>
        </div>
        <Button variant="ghost" onClick={onBack}>
          Назад
        </Button>
      </div>

      <p className="text-xs text-slate-500 mb-4" aria-live="polite">
        {ALL_MUSCLE_GROUPS.map(g => `${g}: ${statsByGroup[g] ?? 0}`).join(' · ')}
      </p>

      <div className="flex flex-col sm:flex-row gap-2 mb-4 flex-wrap wide:flex-nowrap w-full">
        <input
          type="search"
          placeholder="Поиск по названию..."
          className="w-full min-w-0 flex-1 sm:min-w-[8rem] bg-surface border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-primary outline-none"
          value={filterName}
          onChange={e => setFilterName(e.target.value)}
          aria-label="Фильтр по названию"
        />
        <select
          className="w-full sm:w-auto bg-surface border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:border-primary outline-none shrink-0"
          value={filterMuscleGroup}
          onChange={e => setFilterMuscleGroup((e.target.value || '') as MuscleGroup | '')}
          aria-label="Фильтр по группе мышц"
        >
          <option value="">Все группы</option>
          {ALL_MUSCLE_GROUPS.map(g => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
        <div className="flex flex-1 min-w-full sm:min-w-0 rounded-lg overflow-hidden border border-slate-600" role="group" aria-label="Фильтр по источнику упражнений">
          {(['all', 'base', 'user'] as const).map(key => (
            <button
              key={key}
              type="button"
              onClick={() => setFilterSource(key)}
              className={`flex-1 min-w-0 px-3 py-2 text-sm transition-colors ${
                filterSource === key
                  ? 'bg-primary text-white'
                  : 'bg-surface text-slate-400 hover:text-white'
              }`}
              aria-pressed={filterSource === key}
              aria-label={key === 'all' ? 'Все упражнения' : key === 'base' ? 'Только база' : 'Только мои'}
            >
              {key === 'all' ? 'Все' : key === 'base' ? 'База' : 'Моё'}
            </button>
          ))}
        </div>
      </div>

      <Button fullWidth onClick={handleAddNew} className="mb-6">
        + Добавить упражнение
      </Button>

      {isEmptyMy ? (
        <div className="bg-surface p-6 rounded-xl border border-slate-700 text-center">
          <p className="text-slate-400">У вас пока нет своих упражнений.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAndSorted.map(ex => {
            const isBase = ex.source === 'base';
            const isDeactivated = isBase && deactivatedIds.includes(ex.id);
            return (
              <div
                key={ex.id}
                className={`bg-surface p-4 rounded-xl border flex justify-between items-center transition-opacity ${
                  isDeactivated ? 'border-slate-600 opacity-45' : 'border-slate-700'
                } ${onOpenExerciseDetail ? 'cursor-pointer' : ''}`}
                role={onOpenExerciseDetail ? 'button' : undefined}
                onClick={onOpenExerciseDetail ? () => onOpenExerciseDetail(ex) : undefined}
                onKeyDown={
                  onOpenExerciseDetail
                    ? (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onOpenExerciseDetail(ex);
                        }
                      }
                    : undefined
                }
                tabIndex={onOpenExerciseDetail ? 0 : undefined}
                aria-label={onOpenExerciseDetail ? `Открыть описание: ${ex.name}` : undefined}
              >
                <div className={`min-w-0 ${isDeactivated ? 'text-slate-500' : ''}`}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className={`font-bold ${isDeactivated ? 'text-slate-400' : 'text-white'}`}>{ex.name}</h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        isBase ? 'bg-slate-600 text-slate-300' : 'bg-primary/20 text-primary'
                      }`}
                    >
                      {isBase ? 'База' : 'Моё'}
                    </span>
                    {isDeactivated && (
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-400">
                        Неактивно
                      </span>
                    )}
                  </div>
                  <p className={`text-xs mt-0.5 ${isDeactivated ? 'text-slate-500' : 'text-slate-400'}`}>
                    {ex.muscleGroup} • <span className={`px-2 py-0.5 rounded ${getDifficultyStyles(ex.difficulty)}`}>{ex.difficulty}</span>
                  </p>
                </div>
                <div className="flex gap-2 shrink-0" onClick={e => e.stopPropagation()}>
                  {isBase ? (
                    <>
                      <button
                        onClick={() => handleToggleBaseActive(ex.id)}
                        className="text-slate-400 hover:text-white p-2.5 min-w-[34px] min-h-[34px] flex items-center justify-center"
                        title={isDeactivated ? 'Активировать' : 'Деактивировать'}
                        aria-label={isDeactivated ? 'Активировать упражнение' : 'Деактивировать упражнение'}
                      >
                        {isDeactivated ? '⊕' : '⊖'}
                      </button>
                      <button
                        onClick={() => handleEdit(ex)}
                        className="text-slate-400 hover:text-white p-2"
                        aria-label="Редактировать (создаст копию в Моё)"
                      >
                        ✎
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEdit(ex)}
                        className="text-slate-400 hover:text-white p-2"
                        aria-label="Редактировать"
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => handleDelete(ex.id)}
                        className="text-red-400 hover:text-red-300 p-2"
                        aria-label="Удалить"
                      >
                        🗑
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
