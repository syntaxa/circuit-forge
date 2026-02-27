import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '@/App';
import { StorageService } from '@/services/storageService';
import { MuscleGroup } from '@/types';
import { createExercise } from '../helpers';
import { SEED_EXERCISES } from '@/constants';

vi.mock('@/services/workoutGenerator', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/workoutGenerator')>();
  const { StorageService } = await import('@/services/storageService');
  return {
    ...actual,
    WorkoutGenerator: {
      ...actual.WorkoutGenerator,
      selectMuscleGroups: vi.fn(() => [MuscleGroup.LEGS, MuscleGroup.ARMS, MuscleGroup.ABS]),
      // Детерминированный плейлист: первые count упражнений из LEGS, чтобы Jump Squat (id 1) всегда входил
      generatePlaylist: vi.fn((_groups: MuscleGroup[], count: number) => {
        const exercises = StorageService.getExercises();
        const legs = exercises.filter((e) => e.muscleGroup === MuscleGroup.LEGS);
        return legs.slice(0, Math.max(count, legs.length));
      }),
    },
  };
});

function getEditButtonForExercise(exerciseName: string): HTMLElement {
  const heading = screen.getByRole('heading', { name: exerciseName });
  const card = heading.closest('div.bg-surface');
  if (!card) throw new Error(`Card not found for ${exerciseName}`);
  const buttons = within(card as HTMLElement).getAllByRole('button');
  const editBtn = buttons.find((b) => b.textContent?.trim() === '✎');
  if (!editBtn) throw new Error('Edit button not found');
  return editBtn;
}

function getDeleteButtonForExercise(exerciseName: string): HTMLElement {
  const heading = screen.getByRole('heading', { name: exerciseName });
  const card = heading.closest('div.bg-surface');
  if (!card) throw new Error(`Card not found for ${exerciseName}`);
  const buttons = within(card as HTMLElement).getAllByRole('button');
  const deleteBtn = buttons.find((b) => b.textContent?.includes('🗑'));
  if (!deleteBtn) throw new Error('Delete button not found');
  return deleteBtn;
}

describe('databaseSync (integration)', () => {
  beforeEach(() => {
    StorageService.saveExercises(SEED_EXERCISES);
  });

  it('редактирование упражнения в базе → возврат на экран настройки → плейлист содержит обновлённые данные', async () => {
    const user = userEvent.setup();
    render(<App />);

    const startBtn = await screen.findByRole('button', { name: /Начать тренировку/i });
    await waitFor(() => expect(startBtn).not.toBeDisabled());

    await user.click(screen.getByRole('button', { name: /База упражнений/i }));

    expect(screen.getByRole('heading', { name: /База упражнений/i })).toBeInTheDocument();

    await user.click(getEditButtonForExercise('Jump Squat'));

    expect(screen.getByRole('heading', { name: /Редактировать/i })).toBeInTheDocument();

    const nameInput = screen.getByDisplayValue('Jump Squat');
    await user.clear(nameInput);
    await user.type(nameInput, 'Jump Squat Edited');

    await user.click(screen.getByRole('button', { name: /Сохранить/i }));

    await user.click(screen.getByRole('button', { name: /Назад/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Начать тренировку/i })).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText(/Jump Squat Edited/i)).toBeInTheDocument();
    });
  });

  it('удаление упражнения из базы → плейлист не содержит удалённого упражнения', async () => {
    const toDelete = createExercise({
      id: 'to-delete',
      name: 'Unique To Delete',
      muscleGroup: MuscleGroup.LEGS,
    });
    const toKeep = createExercise({
      id: 'to-keep',
      name: 'Unique To Keep',
      muscleGroup: MuscleGroup.LEGS,
    });
    StorageService.saveExercises([toDelete, toKeep]);

    const confirmFn = vi.fn(() => true);
    vi.stubGlobal('confirm', confirmFn);

    const user = userEvent.setup();
    render(<App />);

    const startBtn = await screen.findByRole('button', { name: /Начать тренировку/i });
    await waitFor(() => expect(startBtn).not.toBeDisabled());

    await user.click(screen.getByRole('button', { name: /База упражнений/i }));

    expect(screen.getByText('Unique To Delete')).toBeInTheDocument();
    expect(screen.getByText('Unique To Keep')).toBeInTheDocument();

    await user.click(getDeleteButtonForExercise('Unique To Delete'));

    expect(confirmFn).toHaveBeenCalledWith('Удалить упражнение?');

    await waitFor(() => {
      expect(screen.queryByText('Unique To Delete')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Unique To Keep')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Назад/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Начать тренировку/i })).toBeInTheDocument();
    });

    expect(screen.queryByText('Unique To Delete')).not.toBeInTheDocument();

    vi.unstubAllGlobals();
  });
});
