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
    it('первый запуск — инициализирует localStorage seed-данными и возвращает их', () => {
      const result = StorageService.getExercises();

      expect(result).toEqual(SEED_EXERCISES);
      expect(localStorage.getItem('cf_exercises')).toBe(JSON.stringify(SEED_EXERCISES));
    });

    it('повторный запуск — возвращает ранее сохранённые данные', () => {
      const custom = [createExercise({ id: 'custom-1', name: 'Custom' })];
      StorageService.saveExercises(custom);

      const result = StorageService.getExercises();

      expect(result).toEqual(custom);
      expect(result[0].name).toBe('Custom');
    });
  });

  describe('saveExercises', () => {
    it('корректно сериализует и сохраняет массив', () => {
      const exercises = [createExercise({ id: 'a', name: 'A' })];

      StorageService.saveExercises(exercises);

      const raw = localStorage.getItem('cf_exercises');
      expect(raw).toBeTruthy();
      expect(JSON.parse(raw!)).toEqual(exercises);
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
