import { describe, it, expect, beforeEach } from 'vitest';
import { WorkoutGenerator } from '@/services/workoutGenerator';
import { StorageService } from '@/services/storageService';
import { MuscleGroup, Difficulty } from '@/types';
import { ALL_MUSCLE_GROUPS, SEED_EXERCISES } from '@/constants';
import { createExercise, createWorkoutLog } from '../helpers';

describe('WorkoutGenerator', () => {
  beforeEach(() => {
    localStorage.clear();
    StorageService.clearHistory();
    // Деактивируем базовые упражнения, чтобы использовать только пользовательские для контролируемых тестов
    StorageService.setDeactivatedBaseIds(SEED_EXERCISES.map((e) => e.id));
  });

  describe('selectMuscleGroups', () => {
    it('без истории — возвращает ровно 3 уникальные группы мышц', () => {
      const result = WorkoutGenerator.selectMuscleGroups();

      expect(result).toHaveLength(3);
      expect(new Set(result).size).toBe(3);
      result.forEach((mg) => {
        expect(ALL_MUSCLE_GROUPS).toContain(mg);
      });
    });

    it('с историей — возвращает 2 из предыдущей тренировки + 1 новую', () => {
      const previous = [MuscleGroup.LEGS, MuscleGroup.ABS, MuscleGroup.BACK];
      StorageService.addLog(createWorkoutLog({ muscleGroupsUsed: previous }));

      const result = WorkoutGenerator.selectMuscleGroups();

      expect(result).toHaveLength(3);
      const fromPrevious = result.filter((mg) => previous.includes(mg));
      const newOne = result.filter((mg) => !previous.includes(mg));
      expect(fromPrevious.length).toBe(2);
      expect(newOne.length).toBe(1);
      expect([MuscleGroup.CHEST, MuscleGroup.ARMS, MuscleGroup.SHOULDERS]).toContain(newOne[0]);
    });

    it('все группы использованы — корректный fallback при исчерпании групп', () => {
      const allUsed = [...ALL_MUSCLE_GROUPS];
      StorageService.addLog(createWorkoutLog({ muscleGroupsUsed: allUsed }));

      const result = WorkoutGenerator.selectMuscleGroups();

      expect(result).toHaveLength(3);
      expect(new Set(result).size).toBe(3);
      result.forEach((mg) => expect(ALL_MUSCLE_GROUPS).toContain(mg));
    });
  });

  describe('generatePlaylist', () => {
    it('покрытие групп — хотя бы одно упражнение из каждой целевой группы', () => {
      const targetMuscles = [MuscleGroup.ARMS, MuscleGroup.LEGS];
      const exercises = [
        createExercise({ id: '1', muscleGroup: MuscleGroup.ARMS }),
        createExercise({ id: '2', muscleGroup: MuscleGroup.ARMS }),
        createExercise({ id: '3', muscleGroup: MuscleGroup.LEGS }),
        createExercise({ id: '4', muscleGroup: MuscleGroup.LEGS }),
      ];
      StorageService.saveUserExercises(exercises);

      const result = WorkoutGenerator.generatePlaylist(targetMuscles, 4);

      expect(result.length).toBe(4);
      const armsCount = result.filter((e) => e.muscleGroup === MuscleGroup.ARMS).length;
      const legsCount = result.filter((e) => e.muscleGroup === MuscleGroup.LEGS).length;
      expect(armsCount).toBeGreaterThanOrEqual(1);
      expect(legsCount).toBeGreaterThanOrEqual(1);
    });

    it('количество — возвращает ровно count упражнений', () => {
      const targetMuscles = [MuscleGroup.ARMS];
      const exercises = [
        createExercise({ id: 'a1', muscleGroup: MuscleGroup.ARMS }),
        createExercise({ id: 'a2', muscleGroup: MuscleGroup.ARMS }),
        createExercise({ id: 'a3', muscleGroup: MuscleGroup.ARMS }),
      ];
      StorageService.saveUserExercises(exercises);

      const result = WorkoutGenerator.generatePlaylist(targetMuscles, 3);

      expect(result).toHaveLength(3);
    });

    it('ограничение сложности — нет двух HARD подряд', () => {
      const targetMuscles = [MuscleGroup.ARMS];
      const exercises = [
        createExercise({ id: '1', muscleGroup: MuscleGroup.ARMS, difficulty: Difficulty.HARD }),
        createExercise({ id: '2', muscleGroup: MuscleGroup.ARMS, difficulty: Difficulty.HARD }),
        createExercise({ id: '3', muscleGroup: MuscleGroup.ARMS, difficulty: Difficulty.MEDIUM }),
      ];
      StorageService.saveUserExercises(exercises);

      // Алгоритм гарантирует отсутствие двух HARD подряд; проверяем в нескольких запусках
      for (let run = 0; run < 30; run++) {
        const result = WorkoutGenerator.generatePlaylist(targetMuscles, 3);
        expect(result).toHaveLength(3);
        for (let i = 0; i < result.length - 1; i++) {
          const noTwoHard =
            result[i].difficulty !== Difficulty.HARD || result[i + 1].difficulty !== Difficulty.HARD;
          expect(noTwoHard).toBe(true);
        }
      }
    });

    it('пустая база — возвращает пустой массив при отсутствии кандидатов', () => {
      StorageService.saveUserExercises([]);

      const result = WorkoutGenerator.generatePlaylist([MuscleGroup.ARMS], 5);

      expect(result).toEqual([]);
    });

    it('одна группа — работает корректно с одной целевой группой', () => {
      const targetMuscles = [MuscleGroup.ABS];
      const exercises = [
        createExercise({ id: '1', muscleGroup: MuscleGroup.ABS }),
        createExercise({ id: '2', muscleGroup: MuscleGroup.ABS }),
        createExercise({ id: '3', muscleGroup: MuscleGroup.ABS }),
      ];
      StorageService.saveUserExercises(exercises);

      const result = WorkoutGenerator.generatePlaylist(targetMuscles, 3);

      expect(result).toHaveLength(3);
      result.forEach((ex) => expect(ex.muscleGroup).toBe(MuscleGroup.ABS));
    });

    it('при достатке уникальных — дубликатов нет', () => {
      const targetMuscles = [MuscleGroup.ARMS, MuscleGroup.LEGS];
      const exercises = [
        createExercise({ id: '1', muscleGroup: MuscleGroup.ARMS }),
        createExercise({ id: '2', muscleGroup: MuscleGroup.ARMS }),
        createExercise({ id: '3', muscleGroup: MuscleGroup.LEGS }),
        createExercise({ id: '4', muscleGroup: MuscleGroup.LEGS }),
      ];
      StorageService.saveUserExercises(exercises);

      const result = WorkoutGenerator.generatePlaylist(targetMuscles, 4);

      expect(result).toHaveLength(4);
      const ids = result.map((e) => e.id);
      expect(new Set(ids).size).toBe(4);
    });

    it('при нехватке уникальных — дубликаты только не подряд', () => {
      const targetMuscles = [MuscleGroup.ARMS, MuscleGroup.LEGS];
      const exercises = [
        createExercise({ id: '1', name: 'A', muscleGroup: MuscleGroup.ARMS }),
        createExercise({ id: '2', name: 'B', muscleGroup: MuscleGroup.LEGS }),
        createExercise({ id: '3', name: 'C', muscleGroup: MuscleGroup.ARMS }),
      ];
      StorageService.saveUserExercises(exercises);

      const result = WorkoutGenerator.generatePlaylist(targetMuscles, 6);

      expect(result).toHaveLength(6);
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].id).not.toBe(result[i + 1].id);
      }
    });
  });
});
