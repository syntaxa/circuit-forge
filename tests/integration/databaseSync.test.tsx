import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '@/App';
import { StorageService } from '@/services/storageService';
import { MuscleGroup } from '@/types';
import { createExercise, createSettings, createWorkoutLog } from '../helpers';
import { SEED_EXERCISES } from '@/constants';

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
    localStorage.clear();
    StorageService.setDeactivatedBaseIds(SEED_EXERCISES.map((e) => e.id));
    StorageService.saveSettings(
      createSettings({ exerciseDuration: 30, exercisesPerCycle: 3, cycleCount: 1 })
    );
  });

  it('редактирование упражнения в базе → возврат → Обновить план → плейлист содержит обновлённые данные', async () => {
    const exToEdit = createExercise({
      id: 'user_edit-test',
      name: 'ExToEdit',
      muscleGroup: MuscleGroup.LEGS,
    });
    StorageService.saveUserExercises([exToEdit]);
    StorageService.addLog(createWorkoutLog({ muscleGroupsUsed: [MuscleGroup.LEGS] }));

    const user = userEvent.setup();
    render(<App />);

    const startBtn = await screen.findByRole('button', { name: /Начать тренировку/i });
    await waitFor(() => expect(startBtn).not.toBeDisabled(), { timeout: 5000 });

    expect(screen.getAllByText(/ExToEdit/i).length).toBeGreaterThan(0);

    await user.click(screen.getByRole('button', { name: /База упражнений/i }));

    expect(screen.getByRole('heading', { name: /База упражнений/i })).toBeInTheDocument();

    await user.click(getEditButtonForExercise('ExToEdit'));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Редактировать/i })).toBeInTheDocument();
    });

    const nameInput = screen.getByDisplayValue('ExToEdit');
    await user.clear(nameInput);
    await user.type(nameInput, 'ExToEdit Edited');

    await user.click(screen.getByRole('button', { name: /Сохранить/i }));

    await user.click(screen.getByRole('button', { name: /Назад/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Начать тренировку/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /обновить план/i }));

    await waitFor(
      () => {
        expect(screen.getAllByText(/ExToEdit Edited/i).length).toBeGreaterThan(0);
      },
      { timeout: 5000 }
    );
  }, 15000);

  it('удаление упражнения из базы → плейлист не содержит удалённого упражнения', async () => {
    const toDelete = createExercise({
      id: 'user_to-delete',
      name: 'Unique To Delete',
      muscleGroup: MuscleGroup.LEGS,
    });
    const toKeep = createExercise({
      id: 'user_to-keep',
      name: 'Unique To Keep',
      muscleGroup: MuscleGroup.LEGS,
    });
    StorageService.saveUserExercises([toDelete, toKeep]);
    StorageService.addLog(createWorkoutLog({ muscleGroupsUsed: [MuscleGroup.LEGS] }));

    vi.stubGlobal('confirm', () => true);

    const user = userEvent.setup();
    render(<App />);

    const startBtn = await screen.findByRole('button', { name: /Начать тренировку/i });
    await waitFor(() => expect(startBtn).not.toBeDisabled(), { timeout: 5000 });

    await user.click(screen.getByRole('button', { name: /База упражнений/i }));

    expect(screen.getByText('Unique To Delete')).toBeInTheDocument();
    expect(screen.getByText('Unique To Keep')).toBeInTheDocument();

    await user.click(getDeleteButtonForExercise('Unique To Delete'));

    await waitFor(() => {
      expect(screen.queryByText('Unique To Delete')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Unique To Keep')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Назад/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Начать тренировку/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /обновить план/i }));

    await waitFor(() => {
      expect(screen.queryByText('Unique To Delete')).not.toBeInTheDocument();
    });

    vi.unstubAllGlobals();
  }, 15000);
});
