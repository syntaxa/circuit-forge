import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Exercise, MuscleGroup, Settings } from '../types';
import { StorageService } from '../services/storageService';
import { TTSService } from '../services/ttsService';
import { CircularTimer } from './CircularTimer';
import { Button } from './Button';

interface ScreenWorkoutProps {
  playlist: Exercise[];
  muscleGroups: MuscleGroup[];
  onFinish: () => void;
  onCancel: () => void;
}

enum WorkoutState {
  PREP = 'PREP', // 5..4..3..2..1 before exercise
  WORK = 'WORK', // Active exercise
  PAUSED = 'PAUSED',
  FINISHED = 'FINISHED'
}

export const ScreenWorkout: React.FC<ScreenWorkoutProps> = ({ playlist, muscleGroups, onFinish, onCancel }) => {
  const settings = useRef<Settings>(StorageService.getSettings());
  
  const [state, setState] = useState<WorkoutState>(WorkoutState.PREP);
  const [currentCycle, setCurrentCycle] = useState(1);
  const [currentExIndex, setCurrentExIndex] = useState(0);
  
  // Timer state - Start with 5s prep to allow for initial announcement
  const [timeLeft, setTimeLeft] = useState(5); 
  const [duration, setDuration] = useState(5);
  
  const intervalRef = useRef<number | null>(null);

  const currentExercise = playlist[currentExIndex];
  const isLastExercise = currentExIndex === playlist.length - 1;
  const isLastCycle = currentCycle === settings.current.cycleCount;

  const speak = (text: string) => {
    TTSService.speak(text, settings.current.ttsVoiceURI);
  };

  // Main Loop
  const tick = useCallback(() => {
    setTimeLeft(prev => {
      const next = prev - 1;
      
      // Countdown handling (3, 2, 1)
      if (next <= 3 && next > 0) {
        speak(String(next));
      }

      if (next < 0) {
        handlePhaseChange();
        return 0; // Will be reset by handlePhaseChange logic
      }
      return next;
    });
  }, [state, currentExIndex, currentCycle]);

  const handlePhaseChange = () => {
    if (state === WorkoutState.PREP) {
      // Prep finished, Start Work
      setState(WorkoutState.WORK);
      const workTime = settings.current.exerciseDuration;
      setDuration(workTime);
      setTimeLeft(workTime);
      speak("Начали!");
    } else if (state === WorkoutState.WORK) {
      // Work finished
      if (isLastExercise) {
        if (isLastCycle) {
          finishWorkout();
        } else {
          // Next Cycle
          setCurrentCycle(c => c + 1);
          setCurrentExIndex(0);
          startPrep(playlist[0]);
        }
      } else {
        // Next Exercise
        const nextEx = playlist[currentExIndex + 1];
        setCurrentExIndex(i => i + 1);
        startPrep(nextEx);
      }
    }
  };

  const startPrep = (nextEx: Exercise) => {
    setState(WorkoutState.PREP);
    setDuration(5); // 5 seconds transition
    setTimeLeft(5);
    // Shortened phrase "Далее" (Next) to ensure it fits within the 5s window before "3..2..1"
    speak(`Далее: ${nextEx.name}`);
  };

  const finishWorkout = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setState(WorkoutState.FINISHED);
    speak("Тренировка завершена. Отличная работа!");
    
    // Save history
    StorageService.addLog({
      date: new Date().toISOString(),
      muscleGroupsUsed: muscleGroups
    });

    setTimeout(onFinish, 3000);
  };

  // Effect to manage interval
  useEffect(() => {
    if (state === WorkoutState.PAUSED || state === WorkoutState.FINISHED) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = window.setInterval(tick, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [state, tick]);

  // Initial announcement
  useEffect(() => {
    speak(`Приготовьтесь. Первое упражнение: ${currentExercise.name}`);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const togglePause = () => {
    if (state === WorkoutState.PAUSED) {
      setState(WorkoutState.WORK); // Resume (simplified, returns to WORK even if was PREP to avoid complexity)
    } else {
      setState(WorkoutState.PAUSED);
      speak("Пауза");
    }
  };

  const progressValue = timeLeft / duration;

  return (
    <div className="h-screen flex flex-col items-center justify-between p-6 bg-dark animate-fade-in relative overflow-hidden">
      
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
          subLabel={state === WorkoutState.PREP ? 'СЕК' : 'ОСТАЛОСЬ'}
          color={state === WorkoutState.PREP ? '#f97316' : '#10b981'}
        />

        <div className="mt-8 text-center max-w-md">
          <h1 className="text-3xl font-black text-white mb-2 leading-tight">
            {currentExercise.name}
          </h1>
          <p className="text-slate-400">{currentExercise.description}</p>
          <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300">
             {currentExercise.muscleGroup} • {currentExercise.difficulty}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="w-full max-w-md grid grid-cols-2 gap-4 z-10">
        <Button variant="secondary" onClick={onCancel}>Отмена</Button>
        <Button 
          variant={state === WorkoutState.PAUSED ? 'primary' : 'ghost'} 
          className={state !== WorkoutState.PAUSED ? 'bg-surface border border-slate-600' : ''}
          onClick={togglePause}
        >
          {state === WorkoutState.PAUSED ? 'Продолжить' : 'Пауза'}
        </Button>
      </div>
    </div>
  );
};