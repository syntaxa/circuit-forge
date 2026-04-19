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
    StorageService.setDeactivatedBaseIds(SEED_EXERCISES.map((e) => e.id));
  });

  describe('selectMuscleGroups', () => {
    it('returns exactly 3 unique muscle groups when there is no history', () => {
      const result = WorkoutGenerator.selectMuscleGroups();

      expect(result).toHaveLength(3);
      expect(new Set(result).size).toBe(3);
      result.forEach((mg) => {
        expect(ALL_MUSCLE_GROUPS).toContain(mg);
      });
    });

    it('returns 2 groups from the previous workout plus 1 new one', () => {
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

    it('falls back correctly when all groups were already used', () => {
      const allUsed = [...ALL_MUSCLE_GROUPS];
      StorageService.addLog(createWorkoutLog({ muscleGroupsUsed: allUsed }));

      const result = WorkoutGenerator.selectMuscleGroups();

      expect(result).toHaveLength(3);
      expect(new Set(result).size).toBe(3);
      result.forEach((mg) => expect(ALL_MUSCLE_GROUPS).toContain(mg));
    });
  });

  describe('generatePlaylist', () => {
    it('ensures every target muscle group is represented at least once', () => {
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

    it('returns exactly the requested count', () => {
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

    it('prioritizes alternating muscle groups when alternatives exist', () => {
      const targetMuscles = [MuscleGroup.ARMS, MuscleGroup.LEGS];
      const exercises = [
        createExercise({ id: '1', muscleGroup: MuscleGroup.ARMS, difficulty: Difficulty.HARD }),
        createExercise({ id: '2', muscleGroup: MuscleGroup.ARMS, difficulty: Difficulty.MEDIUM }),
        createExercise({ id: '3', muscleGroup: MuscleGroup.LEGS, difficulty: Difficulty.MEDIUM }),
        createExercise({ id: '4', muscleGroup: MuscleGroup.LEGS, difficulty: Difficulty.HARD }),
      ];
      StorageService.saveUserExercises(exercises);

      for (let run = 0; run < 30; run++) {
        const result = WorkoutGenerator.generatePlaylist(targetMuscles, 4);
        expect(result).toHaveLength(4);
        for (let i = 0; i < result.length - 1; i++) {
          expect(result[i].muscleGroup).not.toBe(result[i + 1].muscleGroup);
        }
      }
    });

    it('avoids two HARD exercises in a row when it can do so without breaking group alternation', () => {
      const targetMuscles = [MuscleGroup.ARMS, MuscleGroup.LEGS];
      const exercises = [
        createExercise({ id: '1', muscleGroup: MuscleGroup.ARMS, difficulty: Difficulty.HARD }),
        createExercise({ id: '2', muscleGroup: MuscleGroup.LEGS, difficulty: Difficulty.MEDIUM }),
        createExercise({ id: '3', muscleGroup: MuscleGroup.ARMS, difficulty: Difficulty.HARD }),
      ];
      StorageService.saveUserExercises(exercises);

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

    it('returns an empty list when there are no candidates', () => {
      StorageService.saveUserExercises([]);

      const result = WorkoutGenerator.generatePlaylist([MuscleGroup.ARMS], 5);

      expect(result).toEqual([]);
    });

    it('works correctly for a single target muscle group', () => {
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

    it('does not repeat ids when enough unique exercises are available', () => {
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

    it('keeps duplicate ids non-consecutive when repeats are unavoidable', () => {
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

    it('allows consecutive HARD exercises when avoiding them is impossible', () => {
      const targetMuscles = [MuscleGroup.ARMS];
      const exercises = [
        createExercise({ id: '1', muscleGroup: MuscleGroup.ARMS, difficulty: Difficulty.HARD }),
        createExercise({ id: '2', muscleGroup: MuscleGroup.ARMS, difficulty: Difficulty.HARD }),
        createExercise({ id: '3', muscleGroup: MuscleGroup.ARMS, difficulty: Difficulty.MEDIUM }),
      ];
      StorageService.saveUserExercises(exercises);

      const result = WorkoutGenerator.generatePlaylist(targetMuscles, 5);

      expect(result).toHaveLength(5);
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].id).not.toBe(result[i + 1].id);
      }
    });
  });
});
