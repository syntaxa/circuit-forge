import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AppScreen, Exercise, MuscleGroup } from './types';
import { ScreenSetup } from './components/ScreenSetup';
import { ScreenWorkout } from './components/ScreenWorkout';
import { ScreenExerciseDetail } from './components/ScreenExerciseDetail';
import { ScreenSettings } from './components/ScreenSettings';
import { ScreenDatabase } from './components/ScreenDatabase';
import { ScreenDatabaseAbout } from './components/ScreenDatabaseAbout';
import { ScreenAbout } from './components/ScreenAbout';

export interface HistoryState {
  screen: AppScreen;
  exerciseDetail: Exercise | null;
}

function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>(AppScreen.SETUP);
  const [activePlaylist, setActivePlaylist] = useState<Exercise[]>([]);
  const [activeMuscles, setActiveMuscles] = useState<MuscleGroup[]>([]);
  const [exerciseDetail, setExerciseDetail] = useState<Exercise | null>(null);
  /** Увеличивается при каждом возврате на SETUP, чтобы плейлист пересобирался из актуальной базы (после редактирования в базе). */
  const [setupRefreshKey, setSetupRefreshKey] = useState(0);

  useEffect(() => {
    const state: HistoryState = { screen: AppScreen.SETUP, exerciseDetail: null };
    history.replaceState(state, '', window.location.href);

    const onPopState = (e: PopStateEvent) => {
      const state = (e.state as HistoryState | null) ?? { screen: AppScreen.SETUP, exerciseDetail: null };
      setCurrentScreen(state.screen);
      setExerciseDetail(state.exerciseDetail ?? null);
      if (state.screen === AppScreen.SETUP) {
        setSetupRefreshKey((k) => k + 1);
      }
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigateTo = (screen: AppScreen, detail: Exercise | null = null) => {
    setCurrentScreen(screen);
    setExerciseDetail(detail);
    history.pushState({ screen, exerciseDetail: detail }, '', window.location.href);
  };

  const goBack = () => history.back();

  const openExerciseDetail = (exercise: Exercise) => {
    setExerciseDetail(exercise);
    history.pushState(
      { screen: currentScreen, exerciseDetail: exercise },
      '',
      window.location.href
    );
  };

  const handleStartWorkout = (playlist: Exercise[], muscles: MuscleGroup[]) => {
    setActivePlaylist(playlist);
    setActiveMuscles(muscles);
    navigateTo(AppScreen.WORKOUT);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case AppScreen.SETUP:
        return (
          <ScreenSetup
            key={setupRefreshKey}
            onStart={handleStartWorkout}
            onNavigate={navigateTo}
            onOpenExerciseDetail={openExerciseDetail}
          />
        );
      case AppScreen.WORKOUT:
        return (
          <ScreenWorkout
            playlist={activePlaylist}
            muscleGroups={activeMuscles}
            onFinish={goBack}
            onCancel={goBack}
            onOpenExerciseDetail={openExerciseDetail}
            isPausedByOverlay={currentScreen === AppScreen.WORKOUT && exerciseDetail !== null}
          />
        );
      case AppScreen.SETTINGS:
        return <ScreenSettings onBack={goBack} />;
      case AppScreen.DATABASE:
        return (
          <ScreenDatabase
            onBack={goBack}
            onOpenInfo={() => navigateTo(AppScreen.DATABASE_ABOUT)}
            onOpenExerciseDetail={openExerciseDetail}
          />
        );
      case AppScreen.DATABASE_ABOUT:
        return <ScreenDatabaseAbout onBack={goBack} />;
      case AppScreen.ABOUT:
        return <ScreenAbout onBack={goBack} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-dark text-white font-sans selection:bg-primary selection:text-white">
      {renderScreen()}
      {exerciseDetail !== null &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 99999,
            }}
          >
            <ScreenExerciseDetail exercise={exerciseDetail} onBack={goBack} />
          </div>,
          document.body
        )}
    </div>
  );
}

export default App;