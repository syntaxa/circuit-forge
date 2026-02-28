import { Exercise, ExerciseSource, Settings, WorkoutLog, UserProfile } from '../types';
import { DEFAULT_SETTINGS, SEED_EXERCISES } from '../constants';

const KEYS = {
  EXERCISES: 'cf_exercises',
  USER_EXERCISES: 'cf_user_exercises',
  DEACTIVATED_BASE_IDS: 'cf_deactivated_base_ids',
  HIDE_CLONE_WARNING: 'cf_hide_clone_warning',
  SETTINGS: 'cf_settings',
  PROFILE: 'cf_profile',
  HISTORY: 'cf_history',
};

function runMigration(): void {
  const hasOld = localStorage.getItem(KEYS.EXERCISES);
  const hasNew = localStorage.getItem(KEYS.USER_EXERCISES);
  if (hasOld && !hasNew) {
    localStorage.removeItem(KEYS.EXERCISES);
    localStorage.setItem(KEYS.USER_EXERCISES, '[]');
  }
}

export const StorageService = {
  runMigration,

  getExercises: (forWorkout?: boolean): Exercise[] => {
    runMigration();
    const deactivated = StorageService.getDeactivatedBaseIds();
    const userExercises = StorageService.getUserExercises();

    const baseExercises: Exercise[] = SEED_EXERCISES.map(e => ({
      ...e,
      source: 'base' as ExerciseSource,
    }));

    const activeBase = forWorkout
      ? baseExercises.filter(e => !deactivated.includes(e.id))
      : baseExercises;

    const userWithSource: Exercise[] = userExercises.map(e => ({
      ...e,
      source: 'user' as ExerciseSource,
    }));

    return [...activeBase, ...userWithSource];
  },

  getExercisesForWorkout: (): Exercise[] => StorageService.getExercises(true),

  getUserExercises: (): Exercise[] => {
    runMigration();
    const data = localStorage.getItem(KEYS.USER_EXERCISES);
    if (!data) return [];
    try {
      const parsed = JSON.parse(data) as Exercise[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  saveUserExercises: (exercises: Exercise[]) => {
    const withSource = exercises.map(e => ({ ...e, source: 'user' as ExerciseSource }));
    localStorage.setItem(KEYS.USER_EXERCISES, JSON.stringify(withSource));
  },

  getDeactivatedBaseIds: (): string[] => {
    const data = localStorage.getItem(KEYS.DEACTIVATED_BASE_IDS);
    if (!data) return [];
    try {
      const parsed = JSON.parse(data) as string[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  setDeactivatedBaseIds: (ids: string[]) => {
    localStorage.setItem(KEYS.DEACTIVATED_BASE_IDS, JSON.stringify(ids));
  },

  toggleBaseActive: (id: string) => {
    const ids = StorageService.getDeactivatedBaseIds();
    const idx = ids.indexOf(id);
    if (idx >= 0) {
      StorageService.setDeactivatedBaseIds(ids.filter((_, i) => i !== idx));
    } else {
      StorageService.setDeactivatedBaseIds([...ids, id]);
    }
  },

  isBaseDeactivated: (id: string): boolean =>
    StorageService.getDeactivatedBaseIds().includes(id),

  getHideCloneWarning: (): boolean => {
    const data = localStorage.getItem(KEYS.HIDE_CLONE_WARNING);
    return data === 'true';
  },

  setHideCloneWarning: (value: boolean) => {
    localStorage.setItem(KEYS.HIDE_CLONE_WARNING, value ? 'true' : 'false');
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
    history.unshift(log);
    localStorage.setItem(KEYS.HISTORY, JSON.stringify(history));
  },

  getLastLog: (): WorkoutLog | null => {
    const history = StorageService.getHistory();
    return history.length > 0 ? history[0] : null;
  },

  clearLastLog: (): void => {
    const history = StorageService.getHistory();
    if (history.length === 0) return;
    const rest = history.slice(1);
    localStorage.setItem(KEYS.HISTORY, JSON.stringify(rest));
  },

  clearHistory: (): void => {
    localStorage.removeItem(KEYS.HISTORY);
  },
};
