import { Difficulty } from '../types';

/** Tailwind classes for difficulty badge (bg + text). Option 2: primary / secondary / red. */
export function getDifficultyStyles(difficulty: Difficulty): string {
  switch (difficulty) {
    case Difficulty.EASY:
      return 'bg-primary/20 text-primary';
    case Difficulty.MEDIUM:
      return 'bg-secondary/20 text-secondary';
    case Difficulty.HARD:
      return 'bg-red-500/20 text-red-400';
    default:
      return 'bg-slate-800 text-slate-400';
  }
}

/** Tailwind classes for difficulty pill (badge + border). Use for larger pills. */
export function getDifficultyPillStyles(difficulty: Difficulty): string {
  switch (difficulty) {
    case Difficulty.EASY:
      return 'bg-primary/20 text-primary border-primary/40';
    case Difficulty.MEDIUM:
      return 'bg-secondary/20 text-secondary border-secondary/40';
    case Difficulty.HARD:
      return 'bg-red-500/20 text-red-400 border-red-500/40';
    default:
      return 'bg-slate-800 text-slate-300 border-slate-700';
  }
}
