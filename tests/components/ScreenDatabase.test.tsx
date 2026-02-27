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
    saveExercises: vi.fn(),
  },
}));

describe('ScreenDatabase', () => {
  const onBack = vi.fn();
  const initialExercises = [
    createExercise({ id: '1', name: 'Squats', muscleGroup: MuscleGroup.LEGS, difficulty: Difficulty.MEDIUM }),
    createExercise({ id: '2', name: 'Push-ups', muscleGroup: MuscleGroup.CHEST, difficulty: Difficulty.EASY }),
  ];

  beforeEach(() => {
    vi.mocked(StorageService.getExercises).mockReturnValue(initialExercises);
    onBack.mockClear();
  });

  it('показывает список упражнений из базы', () => {
    render(<ScreenDatabase onBack={onBack} />);
    expect(screen.getByText('Squats')).toBeInTheDocument();
    expect(screen.getByText('Push-ups')).toBeInTheDocument();
    expect(screen.getByText(/ноги|LEGS/i)).toBeInTheDocument();
    expect(screen.getByText(/грудь|CHEST/i)).toBeInTheDocument();
  });

  it('добавление: заполнение формы + сохранение → появляется в списке', async () => {
    const user = userEvent.setup();
    render(<ScreenDatabase onBack={onBack} />);
    await user.click(screen.getByRole('button', { name: /добавить упражнение/i }));
    expect(screen.getByRole('heading', { name: /добавить/i })).toBeInTheDocument();
    const textboxes = screen.getAllByRole('textbox');
    await user.type(textboxes[0], 'Plank');
    const combos = screen.getAllByRole('combobox');
    await user.selectOptions(combos[0], MuscleGroup.ABS);
    await user.selectOptions(combos[1], Difficulty.MEDIUM);
    await user.click(screen.getByRole('button', { name: /сохранить/i }));
    expect(StorageService.saveExercises).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Plank', muscleGroup: MuscleGroup.ABS, difficulty: Difficulty.MEDIUM }),
      ])
    );
  });

  it('редактирование: клик на упражнение → форма заполняется → сохранение', async () => {
    const user = userEvent.setup();
    render(<ScreenDatabase onBack={onBack} />);
    const editButtons = screen.getAllByRole('button', { name: /✎/ });
    await user.click(editButtons[0]);
    expect(screen.getByRole('heading', { name: /редактировать/i })).toBeInTheDocument();
    const nameInput = screen.getByDisplayValue('Squats');
    await user.clear(nameInput);
    await user.type(nameInput, 'Jump Squats');
    await user.click(screen.getByRole('button', { name: /сохранить/i }));
    expect(StorageService.saveExercises).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Jump Squats' }),
      ])
    );
  });

  it('удаление: подтверждение → упражнение исчезает из списка', async () => {
    const user = userEvent.setup();
    const confirmFn = vi.fn(() => true);
    vi.stubGlobal('confirm', confirmFn);
    render(<ScreenDatabase onBack={onBack} />);
    const deleteButtons = screen.getAllByRole('button', { name: /🗑/ });
    await user.click(deleteButtons[0]);
    expect(confirmFn).toHaveBeenCalledWith('Удалить упражнение?');
    const saveCalls = vi.mocked(StorageService.saveExercises).mock.calls;
    const deleteCall = saveCalls[saveCalls.length - 1][0];
    expect(deleteCall).toHaveLength(1);
    expect(deleteCall[0].name).toBe('Push-ups');
    vi.unstubAllGlobals();
  });

  it('валидация: нельзя сохранить без заполнения обязательных полей', async () => {
    const user = userEvent.setup();
    vi.mocked(StorageService.saveExercises).mockClear();
    render(<ScreenDatabase onBack={onBack} />);
    await user.click(screen.getByRole('button', { name: /добавить упражнение/i }));
    const textboxes = screen.getAllByRole('textbox');
    expect(textboxes[0]).toHaveValue('');
    await user.click(screen.getByRole('button', { name: /сохранить/i }));
    expect(StorageService.saveExercises).not.toHaveBeenCalled();
    await user.type(textboxes[0], 'Valid Name');
    await user.click(screen.getByRole('button', { name: /сохранить/i }));
    expect(StorageService.saveExercises).toHaveBeenCalled();
  });
});
