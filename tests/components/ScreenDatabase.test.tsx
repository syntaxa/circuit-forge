import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ScreenDatabase } from '@/components/ScreenDatabase';
import { createExercise } from '../helpers';
import { MuscleGroup, Difficulty } from '@/types';
import { StorageService } from '@/services/storageService';

describe('ScreenDatabase', () => {
  const onBack = vi.fn();
  const onOpenInfo = vi.fn();
  const initialExercises = [
    createExercise({
      id: 'user_1',
      name: 'Squats',
      muscleGroup: MuscleGroup.LEGS,
      difficulty: Difficulty.MEDIUM,
      source: 'user',
    }),
    createExercise({
      id: 'user_2',
      name: 'Push-ups',
      muscleGroup: MuscleGroup.CHEST,
      difficulty: Difficulty.EASY,
      source: 'user',
    }),
  ];

  beforeEach(() => {
    localStorage.clear();
    StorageService.saveUserExercises(initialExercises);
    StorageService.setDeactivatedBaseIds([]);
    StorageService.setHideCloneWarning(true);
    onBack.mockClear();
  });

  it('показывает список упражнений из базы', () => {
    render(<ScreenDatabase onBack={onBack} onOpenInfo={onOpenInfo} />);
    expect(screen.getByText('Squats')).toBeInTheDocument();
    expect(screen.getByText('Push-ups')).toBeInTheDocument();
    expect(screen.getAllByText('Моё').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/ноги/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/грудь/i).length).toBeGreaterThan(0);
  });

  it('добавление: заполнение формы + сохранение → появляется в списке', async () => {
    const user = userEvent.setup();
    const uniqueName = 'MyCustomPlankTest123';
    render(<ScreenDatabase onBack={onBack} onOpenInfo={onOpenInfo} />);
    await user.click(screen.getByRole('button', { name: /добавить упражнение/i }));
    expect(screen.getByRole('heading', { name: /добавить/i })).toBeInTheDocument();
    const textboxes = screen.getAllByRole('textbox');
    await user.type(textboxes[0], uniqueName);
    const combos = screen.getAllByRole('combobox');
    await user.selectOptions(combos[0], MuscleGroup.ABS);
    await user.selectOptions(combos[1], Difficulty.MEDIUM);
    await user.click(screen.getByRole('button', { name: /сохранить/i }));
    expect(screen.getByText(uniqueName)).toBeInTheDocument();
    const saved = StorageService.getUserExercises();
    expect(saved.some((e) => e.name === uniqueName && e.muscleGroup === MuscleGroup.ABS)).toBe(true);
  });

  it('редактирование: клик по упражнению → форма заполняется → сохранение', async () => {
    const user = userEvent.setup();
    render(<ScreenDatabase onBack={onBack} onOpenInfo={onOpenInfo} />);
    await user.click(screen.getByRole('button', { name: /Только мои/i }));
    const editButtons = screen.getAllByRole('button', { name: /редактировать/i });
    await user.click(editButtons[1]);
    expect(screen.getByRole('heading', { name: /редактировать/i })).toBeInTheDocument();
    const nameInput = screen.getByDisplayValue('Squats');
    await user.clear(nameInput);
    await user.type(nameInput, 'Jump Squats');
    await user.click(screen.getByRole('button', { name: /сохранить/i }));
    expect(screen.getByText('Jump Squats')).toBeInTheDocument();
    expect(StorageService.getUserExercises().some((e) => e.name === 'Jump Squats')).toBe(true);
  });

  it('удаление: подтверждение → упражнение исчезает из списка', async () => {
    const user = userEvent.setup();
    vi.stubGlobal('confirm', () => true);
    render(<ScreenDatabase onBack={onBack} onOpenInfo={onOpenInfo} />);
    const deleteButtons = screen.getAllByRole('button', { name: /удалить/i });
    await user.click(deleteButtons[0]);
    expect(screen.queryByText('Push-ups')).not.toBeInTheDocument();
    expect(screen.getByText('Squats')).toBeInTheDocument();
    expect(StorageService.getUserExercises().map((e) => e.name)).not.toContain('Push-ups');
    vi.unstubAllGlobals();
  });

  it('валидация: нельзя сохранить без заполнения обязательных полей', async () => {
    const user = userEvent.setup();
    const initialCount = StorageService.getUserExercises().length;
    render(<ScreenDatabase onBack={onBack} onOpenInfo={onOpenInfo} />);
    await user.click(screen.getByRole('button', { name: /добавить упражнение/i }));
    const textboxes = screen.getAllByRole('textbox');
    expect(textboxes[0]).toHaveValue('');
    await user.click(screen.getByRole('button', { name: /сохранить/i }));
    expect(StorageService.getUserExercises().length).toBe(initialCount);
    await user.type(textboxes[0], 'Valid Name');
    await user.click(screen.getByRole('button', { name: /сохранить/i }));
    expect(StorageService.getUserExercises().length).toBe(initialCount + 1);
  });
});
