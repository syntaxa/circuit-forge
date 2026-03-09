import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ScreenSetup } from '@/components/ScreenSetup';
import { createExercise, createWorkoutLog, createSettings } from '../helpers';
import { MuscleGroup } from '@/types';
import { StorageService } from '@/services/storageService';

describe('ScreenSetup', () => {
  const onStart = vi.fn();
  const onNavigate = vi.fn();
  const onOpenExerciseDetail = vi.fn();

  beforeEach(() => {
    localStorage.clear();
    StorageService.clearHistory();
    StorageService.saveSettings(
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
    await waitFor(
      () => {
        const exerciseButtons = screen.getAllByRole('button', { name: /подробнее об упражнении/i });
        expect(exerciseButtons.length).toBeGreaterThan(0);
      },
      { timeout: 3000 }
    );
    expect(screen.getByText('Упражнений')).toBeInTheDocument();
  });

  it('показывает бейджи групп мышц (amber для повторных, emerald для новых)', async () => {
    StorageService.addLog(
      createWorkoutLog({ muscleGroupsUsed: [MuscleGroup.CHEST, MuscleGroup.LEGS] })
    );
    render(
      <ScreenSetup
        onStart={onStart}
        onNavigate={onNavigate}
        onOpenExerciseDetail={onOpenExerciseDetail}
      />
    );
    await waitFor(
      () => {
        expect(screen.getByText(/Прошлая:/i)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
    expect(screen.getByText('грудь')).toBeInTheDocument();
    expect(screen.getByText('ноги')).toBeInTheDocument();
  });

  it('показывает статистику: кол-во упражнений, циклы, длительность', async () => {
    render(
      <ScreenSetup
        onStart={onStart}
        onNavigate={onNavigate}
        onOpenExerciseDetail={onOpenExerciseDetail}
      />
    );
    await waitFor(
      () => {
        const exerciseButtons = screen.getAllByRole('button', { name: /подробнее об упражнении/i });
        expect(exerciseButtons.length).toBeGreaterThan(0);
      },
      { timeout: 3000 }
    );
    expect(screen.getByText('Упражнений')).toBeInTheDocument();
    expect(screen.getByText('Кругов')).toBeInTheDocument();
    expect(screen.getByText('Минут')).toBeInTheDocument();
  });

  it('кнопка «Обновить план» перегенерирует плейлист', async () => {
    const user = userEvent.setup();
    render(
      <ScreenSetup
        onStart={onStart}
        onNavigate={onNavigate}
        onOpenExerciseDetail={onOpenExerciseDetail}
      />
    );
    await waitFor(
      () => {
        const exerciseButtons = screen.getAllByRole('button', { name: /подробнее об упражнении/i });
        expect(exerciseButtons.length).toBeGreaterThan(0);
      },
      { timeout: 3000 }
    );
    await user.click(screen.getByRole('button', { name: /обновить план/i }));
    await waitFor(
      () => {
        const exerciseButtons = screen.getAllByRole('button', { name: /подробнее об упражнении/i });
        expect(exerciseButtons.length).toBeGreaterThan(0);
      },
      { timeout: 1000 }
    );
    expect(screen.getByRole('button', { name: /начать тренировку/i })).not.toBeDisabled();
  });

  it('кнопка «Начать тренировку» вызывает onStart с плейлистом и группами мышц', async () => {
    const user = userEvent.setup();
    render(
      <ScreenSetup
        onStart={onStart}
        onNavigate={onNavigate}
        onOpenExerciseDetail={onOpenExerciseDetail}
      />
    );
    await waitFor(
      () => {
        const exerciseButtons = screen.getAllByRole('button', { name: /подробнее об упражнении/i });
        expect(exerciseButtons.length).toBeGreaterThan(0);
      },
      { timeout: 3000 }
    );
    await user.click(screen.getByRole('button', { name: /начать тренировку/i }));
    expect(onStart).toHaveBeenCalledTimes(1);
    const [playlist, muscles] = onStart.mock.calls[0];
    expect(Array.isArray(playlist)).toBe(true);
    expect(playlist.length).toBeGreaterThan(0);
    expect(muscles).toHaveLength(3);
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
    await waitFor(
      () => {
        const exerciseButtons = screen.getAllByRole('button', { name: /подробнее об упражнении/i });
        expect(exerciseButtons.length).toBeGreaterThan(0);
      },
      { timeout: 3000 }
    );
    const exerciseButtons = screen.getAllByRole('button', { name: /подробнее об упражнении/i });
    await user.click(exerciseButtons[0]);
    expect(onOpenExerciseDetail).toHaveBeenCalledWith(
      expect.objectContaining({
        name: expect.any(String),
        muscleGroup: expect.any(String),
      })
    );
  });

  it('кнопка «Забыть историю» очищает историю и обновляет UI', async () => {
    const user = userEvent.setup();
    StorageService.addLog(
      createWorkoutLog({ muscleGroupsUsed: [MuscleGroup.CHEST, MuscleGroup.LEGS] })
    );
    expect(StorageService.getLastLog()).not.toBeNull();
    render(
      <ScreenSetup
        onStart={onStart}
        onNavigate={onNavigate}
        onOpenExerciseDetail={onOpenExerciseDetail}
      />
    );
    await waitFor(() => expect(screen.getByText(/Прошлая:/i)).toBeInTheDocument(), { timeout: 3000 });
    const forgetButton = screen.getByRole('button', { name: /забыть историю тренировок/i });
    await user.click(forgetButton);
    await waitFor(() => expect(StorageService.getLastLog()).toBeNull(), { timeout: 1000 });
  });
});
