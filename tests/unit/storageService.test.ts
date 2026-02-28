import { describe, it, expect, beforeEach } from 'vitest';
import { StorageService } from '@/services/storageService';
import { SEED_EXERCISES, DEFAULT_SETTINGS } from '@/constants';
import { createExercise, createSettings, createWorkoutLog } from '../helpers';
import { MuscleGroup } from '@/types';

describe('StorageService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('getExercises', () => {
    it('первый запуск — возвращает SEED с source: base, не записывает cf_exercises', () => {
      const result = StorageService.getExercises();

      expect(result.length).toBe(SEED_EXERCISES.length);
      result.forEach((ex, i) => {
        expect(ex).toMatchObject({ ...SEED_EXERCISES[i], source: 'base' });
      });
      expect(localStorage.getItem('cf_exercises')).toBeNull();
    });

    it('повторный запуск — возвращает SEED + пользовательские данные', () => {
      const custom = [createExercise({ id: 'user_1', name: 'Custom', source: 'user' })];
      StorageService.saveUserExercises(custom);

      const result = StorageService.getExercises();

      const baseCount = result.filter(e => e.source === 'base').length;
      const userEx = result.find(e => e.source === 'user');
      expect(baseCount).toBe(SEED_EXERCISES.length);
      expect(userEx?.name).toBe('Custom');
    });
  });

  describe('saveUserExercises / getUserExercises', () => {
    it('корректно сериализует и сохраняет массив пользовательских упражнений', () => {
      const exercises = [createExercise({ id: 'user_a', name: 'A' })];

      StorageService.saveUserExercises(exercises);

      const raw = localStorage.getItem('cf_user_exercises');
      expect(raw).toBeTruthy();
      const parsed = JSON.parse(raw!);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].name).toBe('A');
      expect(parsed[0].source).toBe('user');
    });
  });

  describe('migration', () => {
    it('при старом формате (cf_exercises без cf_user_exercises) — очищает старый ключ и создаёт пустой user', () => {
      const oldData = [createExercise({ id: '1', name: 'Old' })];
      localStorage.setItem('cf_exercises', JSON.stringify(oldData));

      StorageService.getExercises();

      expect(localStorage.getItem('cf_exercises')).toBeNull();
      expect(JSON.parse(localStorage.getItem('cf_user_exercises')!)).toEqual([]);
    });
  });

  describe('getExercisesForWorkout', () => {
    it('исключает деактивированные базовые упражнения', () => {
      StorageService.setDeactivatedBaseIds(['1', '2']);

      const result = StorageService.getExercisesForWorkout();

      const ids = result.map(e => e.id);
      expect(ids).not.toContain('1');
      expect(ids).not.toContain('2');
      const baseFromSeed = result.filter(e => e.source === 'base');
      expect(baseFromSeed.length).toBe(SEED_EXERCISES.length - 2);
    });
  });

  describe('getSettings', () => {
    it('без данных — возвращает DEFAULT_SETTINGS', () => {
      const result = StorageService.getSettings();

      expect(result).toEqual(DEFAULT_SETTINGS);
    });

    it('частичные данные — мержит с defaults', () => {
      localStorage.setItem('cf_settings', JSON.stringify({ exerciseDuration: 45 }));

      const result = StorageService.getSettings();

      expect(result.exerciseDuration).toBe(45);
      expect(result.exercisesPerCycle).toBe(DEFAULT_SETTINGS.exercisesPerCycle);
      expect(result.cycleCount).toBe(DEFAULT_SETTINGS.cycleCount);
      expect(result.ttsVoiceURI).toBe(DEFAULT_SETTINGS.ttsVoiceURI);
    });
  });

  describe('saveSettings / getSettings roundtrip', () => {
    it('сохранённые настройки читаются обратно', () => {
      const settings = createSettings({ exerciseDuration: 60, cycleCount: 3 });
      StorageService.saveSettings(settings);

      const result = StorageService.getSettings();

      expect(result.exerciseDuration).toBe(60);
      expect(result.cycleCount).toBe(3);
    });
  });

  describe('addLog + getLastLog', () => {
    it('лог добавляется в начало, getLastLog возвращает его', () => {
      const log = createWorkoutLog({ muscleGroupsUsed: [MuscleGroup.ARMS] });
      StorageService.addLog(log);

      const last = StorageService.getLastLog();

      expect(last).toEqual(log);
      expect(StorageService.getHistory()[0]).toEqual(log);
    });
  });

  describe('clearLastLog', () => {
    it('удаляет только первый элемент истории', () => {
      const log1 = createWorkoutLog({ muscleGroupsUsed: [MuscleGroup.ARMS] });
      const log2 = createWorkoutLog({ muscleGroupsUsed: [MuscleGroup.LEGS] });
      StorageService.addLog(log1);
      StorageService.addLog(log2);
      // История: [log2, log1], getLastLog() === log2

      StorageService.clearLastLog();

      expect(StorageService.getLastLog()).toEqual(log1);
      expect(StorageService.getHistory()).toHaveLength(1);
    });
  });

  describe('clearHistory', () => {
    it('полностью очищает историю', () => {
      StorageService.addLog(createWorkoutLog({}));
      StorageService.clearHistory();

      expect(StorageService.getHistory()).toEqual([]);
      expect(StorageService.getLastLog()).toBeNull();
    });
  });

  describe('getHistory', () => {
    it('пустая — возвращает пустой массив', () => {
      const result = StorageService.getHistory();

      expect(result).toEqual([]);
    });
  });
});
