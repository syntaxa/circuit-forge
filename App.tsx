import React, { useState } from 'react';
import { AppScreen, Exercise, MuscleGroup } from './types';
import { ScreenSetup } from './components/ScreenSetup';
import { ScreenWorkout } from './components/ScreenWorkout';
import { ScreenSettings } from './components/ScreenSettings';
import { ScreenDatabase } from './components/ScreenDatabase';

function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>(AppScreen.SETUP);
  const [activePlaylist, setActivePlaylist] = useState<Exercise[]>([]);
  const [activeMuscles, setActiveMuscles] = useState<MuscleGroup[]>([]);

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
            onStart={handleStartWorkout}
            onNavigate={setCurrentScreen}
          />
        );
      case AppScreen.WORKOUT:
        return (
          <ScreenWorkout 
            playlist={activePlaylist}
            muscleGroups={activeMuscles}
            onFinish={() => setCurrentScreen(AppScreen.SETUP)}
            onCancel={() => setCurrentScreen(AppScreen.SETUP)}
          />
        );
      case AppScreen.SETTINGS:
        return (
          <ScreenSettings 
            onBack={() => setCurrentScreen(AppScreen.SETUP)}
          />
        );
      case AppScreen.DATABASE:
        return (
          <ScreenDatabase 
            onBack={() => setCurrentScreen(AppScreen.SETUP)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-dark text-white font-sans selection:bg-primary selection:text-white">
      {renderScreen()}
    </div>
  );
}

export default App;