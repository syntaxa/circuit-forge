import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WorkoutGenerator } from '@/services/workoutGenerator';
import { StorageService } from '@/services/storageService';
import { MuscleGroup, Difficulty } from '@/types';
import { ALL_MUSCLE_GROUPS } from '@/constants';
import { createExercise, createWorkoutLog } from '../helpers';

vi.mock('@/services/storageService', () => ({
  StorageService: {
    getLastLog: vi.fn(),
    getExercises: vi.fn(),
    getExercisesForWorkout: vi.fn(),
  },
}));

describe('WorkoutGenerator', () => {
  beforeEach(() => {
    vi.mocked(StorageService.getLastLog).mockReturnValue(null);
    vi.mocked(StorageService.getExercises).mockReturnValue([]);
    vi.mocked(StorageService.getExercisesForWorkout).mockReturnValue([]);
  });

  describe('selectMuscleGroups', () => {
    it('без истории — возвращает ровно 3 уникальные группы мышц', () => {
      vi.mocked(StorageService.getLastLog).mockReturnValue(null);

      const result = WorkoutGenerator.selectMuscleGroups();

      expect(result).toHaveLength(3);
      expect(new Set(result).size).toBe(3);
      result.forEach((mg) => {
        expect(ALL_MUSCLE_GROUPS).toContain(mg);
      });
    });

    it('с историей — возвращает 2 из предыдущей тренировки + 1 новую', () => {
      const previous = [MuscleGroup.LEGS, MuscleGroup.ABS, MuscleGroup.BACK];
      vi.mocked(StorageService.getLastLog).mockReturnValue(
        createWorkoutLog({ muscleGroupsUsed: previous })
      );

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
      vi.mocked(StorageService.getLastLog).mockReturnValue(
        createWorkoutLog({ muscleGroupsUsed: allUsed })
      );

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
      vi.mocked(StorageService.getExercisesForWorkout).mockReturnValue(exercises);

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
        createExercise({ muscleGroup: MuscleGroup.ARMS }),
        createExercise({ muscleGroup: MuscleGroup.ARMS }),
        createExercise({ muscleGroup: MuscleGroup.ARMS }),
      ];
      vi.mocked(StorageService.getExercisesForWorkout).mockReturnValue(exercises);

      const result = WorkoutGenerator.generatePlaylist(targetMuscles, 3);

      expect(result).toHaveLength(3);
    });

    it('ограничение сложности — нет двух HARD подряд (best effort за 10 попыток)', () => {
      const targetMuscles = [MuscleGroup.ARMS];
      const exercises = [
        createExercise({ id: '1', muscleGroup: MuscleGroup.ARMS, difficulty: Difficulty.HARD }),
        createExercise({ id: '2', muscleGroup: MuscleGroup.ARMS, difficulty: Difficulty.HARD }),
        createExercise({ id: '3', muscleGroup: MuscleGroup.ARMS, difficulty: Difficulty.MEDIUM }),
      ];
      vi.mocked(StorageService.getExercisesForWorkout).mockReturnValue(exercises);

      // Детерминируем выбор: один из каждой группы (индексы 0, 1, 2), чтобы в плейлисте 2 HARD и 1 MEDIUM
      let pickIndex = 0;
      vi.spyOn(Math, 'random').mockImplementation(() => {
        const out = [0, 1 / 3, 2 / 3][pickIndex % 3];
        pickIndex++;
        return out;
      });

      const result = WorkoutGenerator.generatePlaylist(targetMuscles, 3);

      vi.mocked(Math.random).mockRestore();
      expect(result).toHaveLength(3);
      for (let i = 0; i < result.length - 1; i++) {
        const noTwoHard =
          result[i].difficulty !== Difficulty.HARD || result[i + 1].difficulty !== Difficulty.HARD;
        expect(noTwoHard).toBe(true);
      }
    });

    it('пустая база — возвращает пустой массив при отсутствии кандидатов', () => {
      vi.mocked(StorageService.getExercisesForWorkout).mockReturnValue([]);

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
      vi.mocked(StorageService.getExercisesForWorkout).mockReturnValue(exercises);

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
      vi.mocked(StorageService.getExercisesForWorkout).mockReturnValue(exercises);

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
      vi.mocked(StorageService.getExercisesForWorkout).mockReturnValue(exercises);

      const result = WorkoutGenerator.generatePlaylist(targetMuscles, 6);

      expect(result).toHaveLength(6);
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].id).not.toBe(result[i + 1].id);
      }
    });
  });
});
