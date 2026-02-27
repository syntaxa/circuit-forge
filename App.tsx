import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { AppScreen, Exercise, MuscleGroup } from './types';
import { ScreenSetup } from './components/ScreenSetup';
import { ScreenWorkout } from './components/ScreenWorkout';
import { ScreenExerciseDetail } from './components/ScreenExerciseDetail';
import { ScreenSettings } from './components/ScreenSettings';
import { ScreenDatabase } from './components/ScreenDatabase';
import { ScreenAbout } from './components/ScreenAbout';

function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>(AppScreen.SETUP);
  const [activePlaylist, setActivePlaylist] = useState<Exercise[]>([]);
  const [activeMuscles, setActiveMuscles] = useState<MuscleGroup[]>([]);
  const [exerciseDetail, setExerciseDetail] = useState<Exercise | null>(null);
  /** Увеличивается при каждом возврате на SETUP, чтобы плейлист пересобирался из актуальной базы (после редактирования в базе). */
  const [setupRefreshKey, setSetupRefreshKey] = useState(0);

  const navigateToSetup = () => {
    setCurrentScreen(AppScreen.SETUP);
    setSetupRefreshKey((k) => k + 1);
  };

  const handleStartWorkout = (playlist: Exercise[], muscles: MuscleGroup[]) => {
    setActivePlaylist(playlist);
    setActiveMuscles(muscles);
    setCurrentScreen(AppScreen.WORKOUT);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case AppScreen.SETUP:
        return (
          <ScreenSetup 
            key={setupRefreshKey}
            onStart={handleStartWorkout}
            onNavigate={setCurrentScreen}
            onOpenExerciseDetail={setExerciseDetail}
          />
        );
      case AppScreen.WORKOUT:
        return (
          <ScreenWorkout 
            playlist={activePlaylist}
            muscleGroups={activeMuscles}
            onFinish={navigateToSetup}
            onCancel={navigateToSetup}
            onOpenExerciseDetail={setExerciseDetail}
            isPausedByOverlay={currentScreen === AppScreen.WORKOUT && exerciseDetail !== null}
          />
        );
      case AppScreen.SETTINGS:
        return (
          <ScreenSettings 
            onBack={navigateToSetup}
          />
        );
      case AppScreen.DATABASE:
        return (
          <ScreenDatabase 
            onBack={navigateToSetup}
          />
        );
      case AppScreen.ABOUT:
        return (
          <ScreenAbout 
            onBack={navigateToSetup}
          />
        );
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
            <ScreenExerciseDetail
              exercise={exerciseDetail}
              onBack={() => setExerciseDetail(null)}
            />
          </div>,
          document.body
        )}
    </div>
  );
}

export default App;