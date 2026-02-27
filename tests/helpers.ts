import { Exercise, MuscleGroup, Difficulty, Settings, WorkoutLog } from '@/types';

export function createExercise(overrides: Partial<Exercise> = {}): Exercise {
  return {
    id: crypto.randomUUID(),
    name: 'Test Exercise',
    description: 'Test description',
    muscleGroup: MuscleGroup.ARMS,
    difficulty: Difficulty.MEDIUM,
    biSided: false,
    steps: 'Step 1\nStep 2',
    ...overrides,
  };
}

export function createSettings(overrides: Partial<Settings> = {}): Settings {
  return {
    exerciseDuration: 30,
    exercisesPerCycle: 10,
    cycleCount: 2,
    ttsVoiceURI: null,
    ...overrides,
  };
}

export function createWorkoutLog(overrides: Partial<WorkoutLog> = {}): WorkoutLog {
  return {
    date: new Date().toISOString(),
    muscleGroupsUsed: [MuscleGroup.ARMS, MuscleGroup.LEGS, MuscleGroup.ABS],
    ...overrides,
  };
}
