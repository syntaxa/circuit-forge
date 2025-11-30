import { Difficulty, Exercise, MuscleGroup, Settings } from './types';

export const DEFAULT_SETTINGS: Settings = {
  exerciseDuration: 30,
  exercisesPerCycle: 10,
  cycleCount: 2,
  ttsVoiceURI: null,
};

export const SEED_EXERCISES: Exercise[] = [
  { id: '1', name: 'Приседания', description: 'Классические приседания с собственным весом.', muscleGroup: MuscleGroup.LEGS, difficulty: Difficulty.MEDIUM },
  { id: '2', name: 'Отжимания', description: 'Классические отжимания от пола.', muscleGroup: MuscleGroup.CHEST, difficulty: Difficulty.MEDIUM },
  { id: '3', name: 'Планка', description: 'Статическая нагрузка на пресс.', muscleGroup: MuscleGroup.ABS, difficulty: Difficulty.MEDIUM },
  { id: '4', name: 'Берпи', description: 'Интенсивное упражнение с прыжком.', muscleGroup: MuscleGroup.LEGS, difficulty: Difficulty.HARD },
  { id: '5', name: 'Выпады', description: 'Поочередные выпады ногами вперед.', muscleGroup: MuscleGroup.LEGS, difficulty: Difficulty.MEDIUM },
  { id: '6', name: 'Скручивания', description: 'Подъем корпуса лежа на спине.', muscleGroup: MuscleGroup.ABS, difficulty: Difficulty.EASY },
  { id: '7', name: 'Отжимания от стула', description: 'Обратные отжимания на трицепс.', muscleGroup: MuscleGroup.ARMS, difficulty: Difficulty.EASY },
  { id: '8', name: 'Джампинг Джек', description: 'Прыжки с разведением рук и ног.', muscleGroup: MuscleGroup.LEGS, difficulty: Difficulty.EASY },
  { id: '9', name: 'Лодочка', description: 'Подъем рук и ног лежа на животе.', muscleGroup: MuscleGroup.BACK, difficulty: Difficulty.MEDIUM },
  { id: '10', name: 'Скалолаз', description: 'Бег в упоре лежа.', muscleGroup: MuscleGroup.ABS, difficulty: Difficulty.HARD },
  { id: '11', name: 'Ягодичный мостик', description: 'Подъем таза лежа на спине.', muscleGroup: MuscleGroup.LEGS, difficulty: Difficulty.EASY },
  { id: '12', name: 'Подтягивания', description: 'Если есть турник, или имитация полотенцем.', muscleGroup: MuscleGroup.BACK, difficulty: Difficulty.HARD },
  { id: '13', name: 'Армейский жим', description: 'Жим рук вверх (можно с бутылками воды).', muscleGroup: MuscleGroup.SHOULDERS, difficulty: Difficulty.MEDIUM },
  { id: '14', name: 'Боковая планка', description: 'Планка на одной руке.', muscleGroup: MuscleGroup.ABS, difficulty: Difficulty.MEDIUM },
  { id: '15', name: 'Отжимания с колен', description: 'Упрощенная версия отжиманий.', muscleGroup: MuscleGroup.CHEST, difficulty: Difficulty.EASY },
];

export const ALL_MUSCLE_GROUPS = [
  MuscleGroup.LEGS,
  MuscleGroup.ABS,
  MuscleGroup.BACK,
  MuscleGroup.CHEST,
  MuscleGroup.ARMS,
  MuscleGroup.SHOULDERS
];