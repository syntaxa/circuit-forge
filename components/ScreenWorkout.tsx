import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Exercise, MuscleGroup, Settings } from '../types';
import { StorageService } from '../services/storageService';
import { TTSService } from '../services/ttsService';
import { disable as disableWakeLock, enable as enableWakeLock } from '../services/wakeLockService';
import { CircularTimer } from './CircularTimer';
import { Button } from './Button';
import { getDifficultyPillStyles } from '../utils/difficultyStyles';

interface ScreenWorkoutProps {
  playlist: Exercise[];
  muscleGroups: MuscleGroup[];
  onFinish: () => void;
  onCancel: () => void;
  onOpenExerciseDetail?: (exercise: Exercise) => void;
  onWorkoutActiveChange?: (active: boolean) => void;
  isPausedByOverlay?: boolean;
}

enum WorkoutState {
  PREP = 'PREP', // 5..4..3..2..1 before exercise
  WORK = 'WORK', // Active exercise
  PAUSED = 'PAUSED',
  FINISHED = 'FINISHED'
}

export const ScreenWorkout: React.FC<ScreenWorkoutProps> = ({ playlist, muscleGroups, onFinish, onCancel, onOpenExerciseDetail, onWorkoutActiveChange, isPausedByOverlay = false }) => {
  const settings = useRef<Settings>(StorageService.getSettings());
  
  const [state, setState] = useState<WorkoutState>(WorkoutState.PREP);
  const [currentCycle, setCurrentCycle] = useState(1);
  const [currentExIndex, setCurrentExIndex] = useState(0);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  
  // Timer state - Start with 5s prep to allow for initial announcement
  const [timeLeft, setTimeLeft] = useState(5); 
  const [duration, setDuration] = useState(5);
  
  const intervalRef = useRef<number | null>(null);
  const phaseTransitionLockRef = useRef(false);
  // Use ref to track the exercise that should be displayed during PREP
  const nextExerciseRef = useRef<Exercise | null>(null);
  // Refs for phase change logic so timer callback always sees current values (avoids stale closure)
  const stateRef = useRef(state);
  const currentExIndexRef = useRef(currentExIndex);
  const currentCycleRef = useRef(currentCycle);
  /** Состояние до открытия диалога выхода — восстанавливаем при отказе. */
  const stateBeforeExitDialogRef = useRef<WorkoutState>(WorkoutState.PREP);
  /** Состояние до паузы — восстанавливаем при снятии паузы (PREP или WORK). */
  const stateBeforePauseRef = useRef<WorkoutState>(WorkoutState.PREP);
  stateRef.current = state;
  currentExIndexRef.current = currentExIndex;
  currentCycleRef.current = currentCycle;

  // Preloaded audio — created once so first playback has no delay
  const dingAudioRef = useRef<HTMLAudioElement | null>(null);
  const completeAudioRef = useRef<HTMLAudioElement | null>(null);
  // One "Switch side" announcement per bilateral exercise, at midpoint
  const sideSwitchAnnouncedRef = useRef(false);

  // During PREP, show the next exercise if available, otherwise show current
  const currentExercise = (state === WorkoutState.PREP && nextExerciseRef.current) 
    ? nextExerciseRef.current 
    : playlist[currentExIndex];
  const isLastExercise = currentExIndex === playlist.length - 1;
  const isLastCycle = currentCycle === settings.current.cycleCount;

  // Main Loop
  const tick = useCallback(() => {
    setTimeLeft(prev => {
      if (phaseTransitionLockRef.current) {
        return prev;
      }

      const next = prev - 1;

      // Bilateral exercise: announce "Switch side" once at midpoint
      if (stateRef.current === WorkoutState.WORK) {
        const ex = playlist[currentExIndexRef.current];
        const workDuration = settings.current.exerciseDuration;
        const mid = Math.ceil(workDuration / 2);
        if (ex?.biSided && next <= mid && !sideSwitchAnnouncedRef.current) {
          sideSwitchAnnouncedRef.current = true;
          TTSService.speakEnglish('Switch side', settings.current.ttsVoiceURI);
        }
      }

      // Countdown handling (3, 2, 1) - speak in English
      if (next <= 3 && next > 0) {
        TTSService.speakEnglish(String(next), settings.current.ttsVoiceURI);
      }

      if (next <= 0) {
        // Stop interval immediately so we don't get a second tick (prev=0) and double handlePhaseChange
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        phaseTransitionLockRef.current = true;
        handlePhaseChange();
        return 0; // Will be reset by handlePhaseChange logic
      }
      return next;
    });
  // Empty deps: handlePhaseChange reads current indices from refs to avoid stale closure
  }, []);

  const handlePhaseChange = () => {
    if (phaseTransitionLockRef.current === false) {
      phaseTransitionLockRef.current = true;
    }

    const currentState = stateRef.current;
    const exIndex = currentExIndexRef.current;
    const cycle = currentCycleRef.current;
    const cycleCount = Number(settings.current.cycleCount);
    const lastEx = exIndex === playlist.length - 1;
    const lastCycle = cycle === cycleCount;

    if (currentState === WorkoutState.PREP) {
      // Prep finished, Start Work - clear the ref since we're now showing the actual current exercise
      nextExerciseRef.current = null;
      sideSwitchAnnouncedRef.current = false; // allow one "Switch side" per exercise block
      setState(WorkoutState.WORK);
      const workTime = settings.current.exerciseDuration;
      setDuration(workTime);
      setTimeLeft(workTime);
    } else if (currentState === WorkoutState.WORK) {
      // Play end-of-exercise sound (preloaded)
      try {
        const audio = dingAudioRef.current;
        if (audio) {
          audio.currentTime = 0;
          audio.play().catch(() => {});
        }
      } catch {
        // ignore if audio fails
      }
      // Work finished — use refs so timer callback always sees current indices
      if (lastEx) {
        if (lastCycle) {
          finishWorkout();
        } else {
          // Next Cycle
          setCurrentCycle(c => c + 1);
          const firstEx = playlist[0];
          setCurrentExIndex(0);
          startPrep(firstEx);
        }
      } else {
        // Next Exercise - update index first, then start prep
        const nextIndex = exIndex + 1;
        const nextEx = playlist[nextIndex];
        setCurrentExIndex(nextIndex);
        startPrep(nextEx);
      }
    }
  };

  const startPrep = (nextEx: Exercise) => {
    // Store the next exercise in ref so it's immediately available for display
    nextExerciseRef.current = nextEx;
    setState(WorkoutState.PREP);
    setDuration(5); // 5 seconds transition
    setTimeLeft(5);
    // Speak only the exercise name
    TTSService.speakEnglish(nextEx.name, settings.current.ttsVoiceURI, () => {});
  };

  // Notify parent when workout is active (PREP/WORK/PAUSED) vs finished — for back-button and beforeunload protection
  useEffect(() => {
    onWorkoutActiveChange?.(state !== WorkoutState.FINISHED);
    return () => onWorkoutActiveChange?.(false);
  }, [state, onWorkoutActiveChange]);

  // Снимаем wake lock при размонтировании (выход/завершение тренировки)
  useEffect(() => () => disableWakeLock(), []);

  const finishWorkout = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setState(WorkoutState.FINISHED);

    // Play workout complete sound (preloaded)
    try {
      const audio = completeAudioRef.current;
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      }
    } catch {
      // ignore if audio fails
    }
    
    // Save history
    StorageService.addLog({
      date: new Date().toISOString(),
      muscleGroupsUsed: muscleGroups
    });

    setTimeout(onFinish, 3000);
  };

  // Effect to manage interval (also stop when description overlay is open)
  useEffect(() => {
    if (state === WorkoutState.PAUSED || state === WorkoutState.FINISHED || isPausedByOverlay) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    // Unlock only when a new phase interval is armed.
    phaseTransitionLockRef.current = false;
    intervalRef.current = window.setInterval(tick, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [state, tick, isPausedByOverlay]);

  // Preload audio files on mount so first playback has no delay
  useEffect(() => {
    const base = import.meta.env.BASE_URL;
    dingAudioRef.current = new Audio(`${base}assets/268756__morrisjm__dingaling.mp3`);
    completeAudioRef.current = new Audio(`${base}assets/708541__rezidentevil__girl-says-uwu.mp3`);
    dingAudioRef.current.load();
    completeAudioRef.current.load();
  }, []);

  // Initial announcement - speak only the exercise name
  useEffect(() => {
    TTSService.speakEnglish(currentExercise.name, settings.current.ttsVoiceURI, () => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const togglePause = () => {
    if (state === WorkoutState.PAUSED) {
      enableWakeLock(); // User gesture при «Продолжить» — перезапросить wake lock после возврата из другого приложения
      setState(stateBeforePauseRef.current); // Resume to the same phase we were in (PREP or WORK)
    } else {
      enableWakeLock(); // Пауза — тоже user gesture, на случай если только что вернулись из другого приложения
      stateBeforePauseRef.current = state; // Remember PREP or WORK
      setState(WorkoutState.PAUSED);
    }
  };

  const handleCancelClick = () => {
    if (state === WorkoutState.FINISHED) {
      onCancel();
      return;
    }
    enableWakeLock(); // Отмена — user gesture, на случай возврата из другого приложения
    stateBeforeExitDialogRef.current = state;
    setState(WorkoutState.PAUSED);
    setShowExitConfirm(true);
  };

  const handleExitConfirm = (confirmed: boolean) => {
    setShowExitConfirm(false);
    if (confirmed) {
      onCancel();
    } else {
      enableWakeLock(); // «Нет» — user gesture, перезапросить wake lock (могли вернуться из другого приложения)
      setState(stateBeforeExitDialogRef.current);
    }
  };

  const progressValue = timeLeft / duration;
  const workDuration = settings.current.exerciseDuration;
  const mid = Math.ceil(workDuration / 2);
  const isBilateral = currentExercise.biSided === true;
  const isWorkPhase = state === WorkoutState.WORK;
  const leftHalfActive = isWorkPhase && isBilateral && timeLeft > mid;

  return (
    <div className="h-screen flex flex-col items-center justify-between p-6 bg-dark animate-fade-in relative overflow-hidden">
      {/* Диалог подтверждения выхода — свой UI, чтобы работал в PWA и мобильных браузерах */}
      {showExitConfirm && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70"
          role="dialog"
          aria-modal="true"
          aria-labelledby="exit-confirm-title"
        >
          <div className="bg-surface border border-slate-600 rounded-2xl shadow-xl max-w-sm w-full p-6 text-center">
            <h2 id="exit-confirm-title" className="text-lg font-bold text-white mb-4">
              Прервать тренировку?
            </h2>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => handleExitConfirm(false)}>
                Нет
              </Button>
              <Button variant="danger" className="flex-1" onClick={() => handleExitConfirm(true)}>
                Да, прервать
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Header Info */}
      <div className="w-full text-center z-10">
        <div className="text-slate-400 text-sm font-semibold tracking-wider uppercase mb-1">
          Круг {currentCycle} из {settings.current.cycleCount}
        </div>
        <div className="flex justify-center gap-1 mb-4">
          {playlist.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 flex-1 rounded-full transition-colors ${i === currentExIndex ? 'bg-primary' : i < currentExIndex ? 'bg-emerald-900' : 'bg-slate-700'}`}
            />
          ))}
        </div>
      </div>

      {/* Main Visual */}
      <div className="flex-1 flex flex-col items-center justify-center w-full z-10">
        <CircularTimer 
          progress={progressValue} 
          label={state === WorkoutState.PREP ? 'ГОТОВЬСЯ' : String(timeLeft)} 
          subLabel={state === WorkoutState.PREP ? undefined : 'ОСТАЛОСЬ'}
          color={state === WorkoutState.PREP ? '#f97316' : '#10b981'}
          biSided={isWorkPhase && isBilateral}
          leftHalfActive={leftHalfActive}
        />

        <div className="mt-8 text-center max-w-md">
          <button
            type="button"
            onClick={() => {
              enableWakeLock(); // Клик по упражнению — user gesture (могли вернуться из другого приложения)
              onOpenExerciseDetail?.(currentExercise);
            }}
            className="inline-flex items-center justify-center gap-1.5 text-center mb-2 hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-lg"
            aria-label={`Подробнее об упражнении ${currentExercise.name}`}
          >
            <h1 className="text-3xl font-black text-white leading-tight">
              {currentExercise.name}
            </h1>
            <span className="text-slate-400 text-lg font-normal" aria-hidden>ⓘ</span>
          </button>
          <p className="text-slate-400">{currentExercise.description}</p>
          <div className={`mt-4 inline-flex items-center px-3 py-1 rounded-full border text-xs font-bold ${getDifficultyPillStyles(currentExercise.difficulty)}`}>
             {currentExercise.muscleGroup} • {currentExercise.difficulty}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="w-full max-w-md grid grid-cols-2 gap-4 z-10">
        <Button variant="secondary" onClick={handleCancelClick}>Отмена</Button>
        <Button 
          variant={state === WorkoutState.PAUSED ? 'primary' : 'secondary'} 
          onClick={togglePause}
        >
          {state === WorkoutState.PAUSED ? 'Продолжить' : 'Пауза'}
        </Button>
      </div>
    </div>
  );
};