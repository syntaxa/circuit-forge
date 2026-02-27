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
    const allExercises = StorageService.getExercises();
    
    // Filter exercises that match target muscles
    const candidates = allExercises.filter(ex => targetMuscles.includes(ex.muscleGroup));

    if (candidates.length === 0) {
      // Fallback if database is empty for these muscles
      return []; 
    }

    let playlist: Exercise[] = [];
    
    // Ensure at least one from each target group exists in the playlist (if available)
    targetMuscles.forEach(muscle => {
      const muscleSpecific = candidates.filter(ex => ex.muscleGroup === muscle);
      if (muscleSpecific.length > 0) {
        playlist.push(muscleSpecific[Math.floor(Math.random() * muscleSpecific.length)]);
      }
    });

    // Fill the rest
    while (playlist.length < count) {
      const randomEx = candidates[Math.floor(Math.random() * candidates.length)];
      playlist.push(randomEx);
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

    return playlist;
  }
};