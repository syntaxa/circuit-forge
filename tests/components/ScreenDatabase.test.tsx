import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ScreenDatabase } from '@/components/ScreenDatabase';
import { createExercise } from '../helpers';
import { MuscleGroup, Difficulty } from '@/types';
import { StorageService } from '@/services/storageService';

vi.mock('@/services/storageService', () => ({
  StorageService: {
    getExercises: vi.fn(),
    getUserExercises: vi.fn(),
    saveUserExercises: vi.fn(),
    getDeactivatedBaseIds: vi.fn(),
    setDeactivatedBaseIds: vi.fn(),
    toggleBaseActive: vi.fn(),
    getHideCloneWarning: vi.fn(),
    setHideCloneWarning: vi.fn(),
  },
}));

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
    vi.mocked(StorageService.getExercises).mockReturnValue(initialExercises);
    vi.mocked(StorageService.getDeactivatedBaseIds).mockReturnValue([]);
    vi.mocked(StorageService.getHideCloneWarning).mockReturnValue(true);
    vi.mocked(StorageService.getUserExercises).mockReturnValue(initialExercises);
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
    render(<ScreenDatabase onBack={onBack} onOpenInfo={onOpenInfo} />);
    await user.click(screen.getByRole('button', { name: /добавить упражнение/i }));
    expect(screen.getByRole('heading', { name: /добавить/i })).toBeInTheDocument();
    const textboxes = screen.getAllByRole('textbox');
    await user.type(textboxes[0], 'Plank');
    const combos = screen.getAllByRole('combobox');
    await user.selectOptions(combos[0], MuscleGroup.ABS);
    await user.selectOptions(combos[1], Difficulty.MEDIUM);
    await user.click(screen.getByRole('button', { name: /сохранить/i }));
    expect(StorageService.saveUserExercises).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'Plank',
          muscleGroup: MuscleGroup.ABS,
          difficulty: Difficulty.MEDIUM,
          source: 'user',
        }),
      ])
    );
  });

  it('редактирование: клик по упражнению → форма заполняется → сохранение', async () => {
    const user = userEvent.setup();
    render(<ScreenDatabase onBack={onBack} onOpenInfo={onOpenInfo} />);
    const editButtons = screen.getAllByRole('button', { name: /редактировать/i });
    await user.click(editButtons[1]);
    expect(screen.getByRole('heading', { name: /редактировать/i })).toBeInTheDocument();
    const nameInput = screen.getByDisplayValue('Squats');
    await user.clear(nameInput);
    await user.type(nameInput, 'Jump Squats');
    await user.click(screen.getByRole('button', { name: /сохранить/i }));
    expect(StorageService.saveUserExercises).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ name: 'Jump Squats' })])
    );
  });

  it('удаление: подтверждение → упражнение исчезает из списка', async () => {
    const user = userEvent.setup();
    const confirmFn = vi.fn(() => true);
    vi.stubGlobal('confirm', confirmFn);
    vi.mocked(StorageService.saveUserExercises).mockClear();
    render(<ScreenDatabase onBack={onBack} onOpenInfo={onOpenInfo} />);
    const deleteButtons = screen.getAllByRole('button', { name: /удалить/i });
    await user.click(deleteButtons[0]);
    expect(confirmFn).toHaveBeenCalledWith('Удалить упражнение?');
    expect(StorageService.saveUserExercises).toHaveBeenCalled();
    const saved = vi.mocked(StorageService.saveUserExercises).mock.calls[0][0] as { name: string }[];
    expect(saved.map(e => e.name)).not.toContain('Push-ups');
    expect(saved.map(e => e.name)).toContain('Squats');
    vi.unstubAllGlobals();
  });

  it('валидация: нельзя сохранить без заполнения обязательных полей', async () => {
    const user = userEvent.setup();
    vi.mocked(StorageService.saveUserExercises).mockClear();
    render(<ScreenDatabase onBack={onBack} onOpenInfo={onOpenInfo} />);
    await user.click(screen.getByRole('button', { name: /добавить упражнение/i }));
    const textboxes = screen.getAllByRole('textbox');
    expect(textboxes[0]).toHaveValue('');
    await user.click(screen.getByRole('button', { name: /сохранить/i }));
    expect(StorageService.saveUserExercises).not.toHaveBeenCalled();
    await user.type(textboxes[0], 'Valid Name');
    await user.click(screen.getByRole('button', { name: /сохранить/i }));
    expect(StorageService.saveUserExercises).toHaveBeenCalled();
  });
});
