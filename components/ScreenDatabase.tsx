import React, { useState } from 'react';
import { Exercise, MuscleGroup, Difficulty } from '../types';
import { StorageService } from '../services/storageService';
import { Button } from './Button';
import { ALL_MUSCLE_GROUPS } from '../constants';

interface ScreenDatabaseProps {
  onBack: () => void;
}

export const ScreenDatabase: React.FC<ScreenDatabaseProps> = ({ onBack }) => {
  const [exercises, setExercises] = useState<Exercise[]>(StorageService.getExercises());
  const [isEditing, setIsEditing] = useState(false);
  const [currentEx, setCurrentEx] = useState<Partial<Exercise>>({});

  const handleDelete = (id: string) => {
    if (confirm('Удалить упражнение?')) {
      const updated = exercises.filter(e => e.id !== id);
      setExercises(updated);
      StorageService.saveExercises(updated);
    }
  };

  const handleEdit = (ex: Exercise) => {
    setCurrentEx(ex);
    setIsEditing(true);
  };

  const handleAddNew = () => {
    setCurrentEx({
      name: '',
      description: '',
      steps: '',
      muscleGroup: MuscleGroup.LEGS,
      difficulty: Difficulty.MEDIUM,
      biSided: false
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!currentEx.name || !currentEx.muscleGroup || !currentEx.difficulty) return;

    const fullEx: Exercise = {
      ...currentEx,
      id: currentEx.id ?? Date.now().toString(),
      name: currentEx.name,
      description: currentEx.description ?? '',
      steps: currentEx.steps ?? '',
      muscleGroup: currentEx.muscleGroup,
      difficulty: currentEx.difficulty,
      biSided: currentEx.biSided ?? false
    };

    let updated: Exercise[];
    if (currentEx.id) {
      updated = exercises.map(e => e.id === currentEx.id ? fullEx : e);
    } else {
      updated = [...exercises, fullEx];
    }
    
    setExercises(updated);
    StorageService.saveExercises(updated);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="p-4 pb-24 animate-fade-in max-w-lg mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-primary">{currentEx.id ? 'Редактировать' : 'Добавить'}</h2>
        <div className="space-y-4">
          <div>
            <label className="text-slate-400 text-sm">Название</label>
            <input 
              className="w-full bg-surface border border-slate-600 rounded-lg p-3 text-white focus:border-primary outline-none"
              value={currentEx.name || ''}
              onChange={e => setCurrentEx({...currentEx, name: e.target.value})}
            />
          </div>
          <div>
            <label className="text-slate-400 text-sm">Описание</label>
            <textarea 
              className="w-full bg-surface border border-slate-600 rounded-lg p-3 text-white focus:border-primary outline-none h-24"
              value={currentEx.description || ''}
              onChange={e => setCurrentEx({...currentEx, description: e.target.value})}
            />
          </div>
          <div>
            <label className="text-slate-400 text-sm">Шаги исполнения</label>
            <textarea 
              className="w-full bg-surface border border-slate-600 rounded-lg p-3 text-white focus:border-primary outline-none h-[300px] resize-y"
              value={currentEx.steps ?? ''}
              onChange={e => setCurrentEx({...currentEx, steps: e.target.value})}
              placeholder="Например: 1. Шаг один. 2. Шаг два. (каждый шаг с новой строки)"
            />
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="biSided"
              checked={currentEx.biSided ?? false}
              onChange={e => setCurrentEx({...currentEx, biSided: e.target.checked})}
              className="w-4 h-4 rounded border-slate-600 bg-surface text-primary focus:ring-primary"
            />
            <label htmlFor="biSided" className="text-slate-300 text-sm cursor-pointer">Двухстороннее упражнение</label>
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-slate-400 text-sm">Группа мышц</label>
              <select 
                className="w-full bg-surface border border-slate-600 rounded-lg p-3 text-white focus:border-primary outline-none"
                value={currentEx.muscleGroup}
                onChange={e => setCurrentEx({...currentEx, muscleGroup: e.target.value as MuscleGroup})}
              >
                {ALL_MUSCLE_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="text-slate-400 text-sm">Сложность</label>
              <select 
                className="w-full bg-surface border border-slate-600 rounded-lg p-3 text-white focus:border-primary outline-none"
                value={currentEx.difficulty}
                onChange={e => setCurrentEx({...currentEx, difficulty: e.target.value as Difficulty})}
              >
                {Object.values(Difficulty).map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="secondary" fullWidth onClick={() => setIsEditing(false)}>Отмена</Button>
            <Button fullWidth onClick={handleSave}>Сохранить</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-24 animate-fade-in max-w-lg mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-primary">База упражнений</h2>
        <Button variant="ghost" onClick={onBack}>Назад</Button>
      </div>

      <Button fullWidth onClick={handleAddNew} className="mb-6">
        + Добавить упражнение
      </Button>

      <div className="space-y-3">
        {exercises.map(ex => (
          <div key={ex.id} className="bg-surface p-4 rounded-xl border border-slate-700 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-white">{ex.name}</h3>
              <p className="text-xs text-slate-400">{ex.muscleGroup} • {ex.difficulty}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(ex)} className="text-slate-400 hover:text-white p-2">✎</button>
              <button onClick={() => handleDelete(ex.id)} className="text-red-400 hover:text-red-300 p-2">🗑</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};