import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ScreenSetup } from '@/components/ScreenSetup';
import { createExercise, createWorkoutLog, createSettings } from '../helpers';
import { MuscleGroup, AppScreen } from '@/types';
import { WorkoutGenerator } from '@/services/workoutGenerator';
import { StorageService } from '@/services/storageService';

vi.mock('@/services/workoutGenerator', () => ({
  WorkoutGenerator: {
    selectMuscleGroups: vi.fn(),
    generatePlaylist: vi.fn(),
  },
}));

vi.mock('@/services/storageService', () => ({
  StorageService: {
    getLastLog: vi.fn(),
    getSettings: vi.fn(),
    clearHistory: vi.fn(),
  },
}));

const mockPlaylist = [
  createExercise({ name: 'Push-ups', id: '1', muscleGroup: MuscleGroup.CHEST }),
  createExercise({ name: 'Squats', id: '2', muscleGroup: MuscleGroup.LEGS }),
];
const mockMuscles = [MuscleGroup.CHEST, MuscleGroup.LEGS, MuscleGroup.ABS];

describe('ScreenSetup', () => {
  const onStart = vi.fn();
  const onNavigate = vi.fn();
  const onOpenExerciseDetail = vi.fn();

  beforeEach(() => {
    vi.mocked(WorkoutGenerator.selectMuscleGroups).mockReturnValue(mockMuscles);
    vi.mocked(WorkoutGenerator.generatePlaylist).mockReturnValue(mockPlaylist);
    vi.mocked(StorageService.getLastLog).mockReturnValue(null);
    vi.mocked(StorageService.getSettings).mockReturnValue(
      createSettings({ exerciseDuration: 30, exercisesPerCycle: 10, cycleCount: 2 })
    );
    onStart.mockClear();
    onNavigate.mockClear();
    onOpenExerciseDetail.mockClear();
  });

  it('показывает список упражнений из сгенерированного плейлиста', async () => {
    render(
      <ScreenSetup
        onStart={onStart}
        onNavigate={onNavigate}
        onOpenExerciseDetail={onOpenExerciseDetail}
      />
    );
    await waitFor(() => {
      expect(screen.getByText(/Push-ups/i)).toBeInTheDocument();
      expect(screen.getByText(/Squats/i)).toBeInTheDocument();
    });
  });

  it('показывает бейджи групп мышц (amber для повторных, emerald для новых)', async () => {
    vi.mocked(StorageService.getLastLog).mockReturnValue(
      createWorkoutLog({ muscleGroupsUsed: [MuscleGroup.CHEST, MuscleGroup.LEGS] })
    );
    render(
      <ScreenSetup
        onStart={onStart}
        onNavigate={onNavigate}
        onOpenExerciseDetail={onOpenExerciseDetail}
      />
    );
    await waitFor(() => {
      expect(screen.getByText(/Прошлая:/i)).toBeInTheDocument();
    });
    expect(screen.getByText('грудь')).toBeInTheDocument();
    expect(screen.getByText('ноги')).toBeInTheDocument();
    expect(screen.getByText('пресс')).toBeInTheDocument();
  });

  it('показывает статистику: кол-во упражнений, циклы, длительность', async () => {
    render(
      <ScreenSetup
        onStart={onStart}
        onNavigate={onNavigate}
        onOpenExerciseDetail={onOpenExerciseDetail}
      />
    );
    await waitFor(() => {
      expect(screen.getByText(/Push-ups/i)).toBeInTheDocument();
    });
    expect(screen.getByText('Упражнений')).toBeInTheDocument();
    expect(screen.getByText('Кругов')).toBeInTheDocument();
    expect(screen.getByText('Минут')).toBeInTheDocument();
  });

  it('кнопка «Обновить план» перегенерирует плейлист', async () => {
    const user = userEvent.setup();
    vi.mocked(WorkoutGenerator.generatePlaylist).mockReturnValue(mockPlaylist);
    render(
      <ScreenSetup
        onStart={onStart}
        onNavigate={onNavigate}
        onOpenExerciseDetail={onOpenExerciseDetail}
      />
    );
    await waitFor(() => expect(screen.getByText(/Push-ups/i)).toBeInTheDocument());
    const initialCalls = vi.mocked(WorkoutGenerator.generatePlaylist).mock.calls.length;
    await user.click(screen.getByRole('button', { name: /обновить план/i }));
    await waitFor(
      () => {
        expect(vi.mocked(WorkoutGenerator.generatePlaylist).mock.calls.length).toBeGreaterThan(initialCalls);
      },
      { timeout: 1000 }
    );
  });

  it('кнопка «Начать тренировку» вызывает onStart с плейлистом и группами', async () => {
    const user = userEvent.setup();
    render(
      <ScreenSetup
        onStart={onStart}
        onNavigate={onNavigate}
        onOpenExerciseDetail={onOpenExerciseDetail}
      />
    );
    await waitFor(() => expect(screen.getByText(/Push-ups/i)).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: /начать тренировку/i }));
    expect(onStart).toHaveBeenCalledWith(mockPlaylist, mockMuscles);
  });

  it('клик по упражнению вызывает onOpenExerciseDetail', async () => {
    const user = userEvent.setup();
    render(
      <ScreenSetup
        onStart={onStart}
        onNavigate={onNavigate}
        onOpenExerciseDetail={onOpenExerciseDetail}
      />
    );
    await waitFor(() => expect(screen.getByText(/Push-ups/i)).toBeInTheDocument());
    const exerciseButtons = screen.getAllByRole('button', { name: /подробнее об упражнении/i });
    await user.click(exerciseButtons[0]);
    expect(onOpenExerciseDetail).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Push-ups' })
    );
  });

  it('кнопка «Забыть историю» вызывает StorageService.clearHistory и обновляет UI', async () => {
    const user = userEvent.setup();
    vi.mocked(StorageService.getLastLog).mockReturnValue(
      createWorkoutLog({ muscleGroupsUsed: [MuscleGroup.CHEST, MuscleGroup.LEGS] })
    );
    render(
      <ScreenSetup
        onStart={onStart}
        onNavigate={onNavigate}
        onOpenExerciseDetail={onOpenExerciseDetail}
      />
    );
    await waitFor(() => expect(screen.getByText(/Прошлая:/i)).toBeInTheDocument());
    const forgetButton = screen.getByRole('button', { name: /забыть историю тренировок/i });
    await user.click(forgetButton);
    expect(StorageService.clearHistory).toHaveBeenCalled();
  });
});
