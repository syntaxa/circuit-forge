import { Exercise, Settings, WorkoutLog, UserProfile } from '../types';
import { DEFAULT_SETTINGS, SEED_EXERCISES } from '../constants';

const KEYS = {
  EXERCISES: 'cf_exercises',
  SETTINGS: 'cf_settings',
  PROFILE: 'cf_profile',
  HISTORY: 'cf_history',
};

export const StorageService = {
  getExercises: (): Exercise[] => {
    const data = localStorage.getItem(KEYS.EXERCISES);
    if (!data) {
      localStorage.setItem(KEYS.EXERCISES, JSON.stringify(SEED_EXERCISES));
      return SEED_EXERCISES;
    }
    return JSON.parse(data);
  },

  saveExercises: (exercises: Exercise[]) => {
    localStorage.setItem(KEYS.EXERCISES, JSON.stringify(exercises));
  },

  getSettings: (): Settings => {
    const data = localStorage.getItem(KEYS.SETTINGS);
    if (!data) {
      localStorage.setItem(KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
    return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
  },

  saveSettings: (settings: Settings) => {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  },

  getHistory: (): WorkoutLog[] => {
    const data = localStorage.getItem(KEYS.HISTORY);
    return data ? JSON.parse(data) : [];
  },

  addLog: (log: WorkoutLog) => {
    const history = StorageService.getHistory();
    history.unshift(log); // Add to beginning
    localStorage.setItem(KEYS.HISTORY, JSON.stringify(history));
  },

  getLastLog: (): WorkoutLog | null => {
    const history = StorageService.getHistory();
    return history.length > 0 ? history[0] : null;
  }
};