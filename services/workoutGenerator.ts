import { Exercise, MuscleGroup, Difficulty, WorkoutLog } from '../types';
import { StorageService } from './storageService';
import { ALL_MUSCLE_GROUPS } from '../constants';

// Fisher-Yates shuffle
function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const WorkoutGenerator = {
  selectMuscleGroups: (): MuscleGroup[] => {
    const lastLog = StorageService.getLastLog();
    
    // Rule: If no history, pick 3 random unique
    if (!lastLog || !lastLog.muscleGroupsUsed || lastLog.muscleGroupsUsed.length === 0) {
      return shuffle(ALL_MUSCLE_GROUPS).slice(0, 3);
    }

    // Rule: Pick 2 from previous, add 1 new
    const previous = lastLog.muscleGroupsUsed;
    const availableNew = ALL_MUSCLE_GROUPS.filter(mg => !previous.includes(mg));
    
    // If we somehow exhausted all muscles (e.g. if we used 5 last time), fallback to random
    if (availableNew.length === 0) {
       return shuffle(ALL_MUSCLE_GROUPS).slice(0, 3);
    }

    const twoOld = shuffle(previous).slice(0, 2);
    const oneNew = shuffle(availableNew).slice(0, 1);

    return [...twoOld, ...oneNew];
  },

  generatePlaylist: (targetMuscles: MuscleGroup[], count: number): Exercise[] => {
    const allExercises = StorageService.getExercisesForWorkout();
    
    // Filter exercises that match target muscles
    const candidates = allExercises.filter(ex => targetMuscles.includes(ex.muscleGroup));

    if (candidates.length === 0) {
      return [];
    }

    // Distinct exercises (by id) — use these first so duplicates appear only when necessary
    const distinctList = shuffle([...new Map(candidates.map((e) => [e.id, e])).values()]);
    const usedIds = new Set<string>();
    let playlist: Exercise[] = [];

    // At least one from each target group (from distinct, without replacement)
    for (const muscle of targetMuscles) {
      const option = distinctList.find((ex) => ex.muscleGroup === muscle && !usedIds.has(ex.id));
      if (option) {
        playlist.push(option);
        usedIds.add(option.id);
      }
    }

    // Fill with distinct exercises (no duplicates) until we have count or run out
    while (playlist.length < count) {
      const available = distinctList.filter((ex) => !usedIds.has(ex.id));
      if (available.length === 0) break;
      const lastId = playlist.length > 0 ? playlist[playlist.length - 1].id : null;
      const pickFrom = lastId ? available.filter((c) => c.id !== lastId) : available;
      const pool = pickFrom.length > 0 ? pickFrom : available;
      const ex = pool[Math.floor(Math.random() * pool.length)];
      playlist.push(ex);
      usedIds.add(ex.id);
    }

    // Only when not enough distinct: fill with repeats, never same as last (no consecutive duplicates)
    while (playlist.length < count) {
      const lastId = playlist[playlist.length - 1].id;
      const pickFrom = candidates.filter((c) => c.id !== lastId);
      const pool = pickFrom.length > 0 ? pickFrom : candidates;
      playlist.push(pool[Math.floor(Math.random() * pool.length)]);
    }

    // Apply difficulty constraint: No HARD followed immediately by HARD.
    // Partition into HARD and non-HARD; if we have enough non-HARD to separate (notHard.length >= hard.length - 1), interleave.
    const hard = playlist.filter(ex => ex.difficulty === Difficulty.HARD);
    const notHard = playlist.filter(ex => ex.difficulty !== Difficulty.HARD);
    const canSeparate = hard.length <= 1 || notHard.length >= hard.length - 1;
    if (!canSeparate) {
      playlist = shuffle(playlist);
    } else if (hard.length > 0 && notHard.length > 0) {
      const result: Exercise[] = [];
      let hi = 0;
      let ni = 0;
      const startWithHard = hard.length > notHard.length;
      while (hi < hard.length || ni < notHard.length) {
        if (startWithHard) {
          if (hi < hard.length) result.push(hard[hi++]);
          if (ni < notHard.length) result.push(notHard[ni++]);
        } else {
          if (ni < notHard.length) result.push(notHard[ni++]);
          if (hi < hard.length) result.push(hard[hi++]);
        }
      }
      playlist = result;
    } else {
      playlist = shuffle(playlist);
    }

    // Ensure no two identical exercises in a row (difficulty reorder may have created duplicates)
    playlist = avoidConsecutiveDuplicates(playlist);

    return playlist;
  }
};

/** Swap elements so that no two adjacent exercises have the same id. */
function avoidConsecutiveDuplicates(list: Exercise[]): Exercise[] {
  const arr = [...list];
  let changed = true;
  let iterations = 0;
  const maxIterations = arr.length * arr.length;
  while (changed && iterations < maxIterations) {
    changed = false;
    iterations++;
    for (let i = 1; i < arr.length; i++) {
      if (arr[i].id !== arr[i - 1].id) continue;
      const duplicateId = arr[i].id;
      let found = false;
      for (let j = 0; j < arr.length && !found; j++) {
        if (j === i || j === i - 1) continue;
        if (arr[j].id === duplicateId) continue;
        const prevId = j > 0 ? arr[j - 1].id : null;
        const nextId = j < arr.length - 1 ? arr[j + 1].id : null;
        if (prevId === duplicateId || nextId === duplicateId) continue;
        [arr[i], arr[j]] = [arr[j], arr[i]];
        found = true;
        changed = true;
      }
      if (found) break;
    }
  }
  return arr;
}