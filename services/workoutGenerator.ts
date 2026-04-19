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

function getTransitionPenalty(previous: Exercise | null, current: Exercise): number {
  if (!previous) {
    return 0;
  }

  let penalty = 0;

  if (previous.id === current.id) {
    penalty += 1000;
  }

  if (previous.muscleGroup === current.muscleGroup) {
    penalty += 100;
  }

  if (previous.difficulty === Difficulty.HARD && current.difficulty === Difficulty.HARD) {
    penalty += 1;
  }

  return penalty;
}

function scoreCandidate(candidate: Exercise, previous: Exercise | null, remaining: Exercise[]): number {
  let score = -getTransitionPenalty(previous, candidate);

  const sameIdRemaining = remaining.filter((ex) => ex.id === candidate.id).length;
  const sameGroupRemaining = remaining.filter((ex) => ex.muscleGroup === candidate.muscleGroup).length;
  score += sameIdRemaining * 10;
  score += sameGroupRemaining;

  return score;
}

function arrangePlaylistGreedy(list: Exercise[]): Exercise[] {
  const remaining = shuffle(list);
  const result: Exercise[] = [];

  while (remaining.length > 0) {
    const previous = result.length > 0 ? result[result.length - 1] : null;
    let bestIndex = 0;
    let bestScore = Number.NEGATIVE_INFINITY;

    for (let i = 0; i < remaining.length; i++) {
      const candidate = remaining[i];
      const others = remaining.filter((_, idx) => idx !== i);
      const score = scoreCandidate(candidate, previous, others);

      if (score > bestScore) {
        bestScore = score;
        bestIndex = i;
      }
    }

    result.push(remaining.splice(bestIndex, 1)[0]);
  }

  return result;
}

function arrangePlaylistOptimized(list: Exercise[]): Exercise[] {
  const shuffled = shuffle(list);
  const memo = new Map<string, { penalty: number; order: number[] }>();

  function solve(previousIndex: number, usedMask: number): { penalty: number; order: number[] } {
    const key = `${previousIndex}|${usedMask}`;
    const cached = memo.get(key);
    if (cached) {
      return cached;
    }

    if (usedMask === (1 << shuffled.length) - 1) {
      const done = { penalty: 0, order: [] };
      memo.set(key, done);
      return done;
    }

    let best: { penalty: number; order: number[] } | null = null;

    for (let i = 0; i < shuffled.length; i++) {
      if ((usedMask & (1 << i)) !== 0) {
        continue;
      }

      const current = shuffled[i];
      const previous = previousIndex >= 0 ? shuffled[previousIndex] : null;
      const transitionPenalty = getTransitionPenalty(previous, current);
      const next = solve(i, usedMask | (1 << i));
      const candidate = {
        penalty: transitionPenalty + next.penalty,
        order: [i, ...next.order],
      };

      if (
        best === null ||
        candidate.penalty < best.penalty
      ) {
        best = candidate;
      }
    }

    const resolved = best ?? { penalty: 0, order: [] };
    memo.set(key, resolved);
    return resolved;
  }

  return solve(-1, 0).order.map((index) => shuffled[index]);
}

function arrangePlaylist(list: Exercise[]): Exercise[] {
  if (list.length <= 1) return [...list];

  if (list.length <= 14) {
    return arrangePlaylistOptimized(list);
  }

  return arrangePlaylistGreedy(list);
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

    // Distinct exercises (by id) - use these first so duplicates appear only when necessary
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

    return arrangePlaylist(playlist);
  }
};
