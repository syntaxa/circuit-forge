export enum MuscleGroup {
  LEGS = 'ноги',
  ABS = 'пресс',
  BACK = 'спина',
  CHEST = 'грудь',
  ARMS = 'руки',
  SHOULDERS = 'плечи'
}

export enum Difficulty {
  EASY = 'лёгкий',
  MEDIUM = 'средний',
  HARD = 'высокий'
}

export type ExerciseSource = 'base' | 'user';

export interface Exercise {
  id: string;
  name: string;
  description: string;
  muscleGroup: MuscleGroup;
  difficulty: Difficulty;
  biSided?: boolean;
  steps: string;
  source?: ExerciseSource;
}

export interface Settings {
  exerciseDuration: number; // seconds
  breakDuration: number; // seconds between exercises
  exercisesPerCycle: number;
  cycleCount: number;
  ttsVoiceURI: string | null;
}

export interface UserProfile {
  userId: string;
  userName: string;
}

export interface WorkoutLog {
  date: string; // ISO 8601
  muscleGroupsUsed: MuscleGroup[];
}

export enum AppScreen {
  SETUP = 'SETUP',
  WORKOUT = 'WORKOUT',
  SETTINGS = 'SETTINGS',
  DATABASE = 'DATABASE',
  DATABASE_ABOUT = 'DATABASE_ABOUT',
  ABOUT = 'ABOUT'
}