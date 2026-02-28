import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '@/App';
import { StorageService } from '@/services/storageService';
import { createSettings } from '../helpers';

describe('workoutFlow (integration)', () => {
  beforeEach(() => {
    localStorage.removeItem('cf_exercises');
    localStorage.setItem('cf_user_exercises', '[]');
    StorageService.saveSettings(
      createSettings({
        exerciseDuration: 30,
        exercisesPerCycle: 3,
        cycleCount: 1,
      })
    );
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('полный цикл: экран настройки → «Начать» → переход на экран тренировки (PREP, Отмена)', async () => {
    const user = userEvent.setup();
    render(<App />);

    const startBtn = await screen.findByRole('button', { name: /Начать тренировку/i });
    await waitFor(() => expect(startBtn).not.toBeDisabled());

    await user.click(startBtn);

    expect(screen.getByText(/ГОТОВЬСЯ/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Отмена/i })).toBeInTheDocument();
  });

  it('отмена тренировки: Начать → Отмена → возврат на настройку', async () => {
    const user = userEvent.setup();
    render(<App />);

    const startBtn = await screen.findByRole('button', { name: /Начать тренировку/i });
    await waitFor(() => expect(startBtn).not.toBeDisabled());

    await user.click(startBtn);

    expect(screen.getByText(/ГОТОВЬСЯ/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Отмена/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Начать тренировку/i })).toBeInTheDocument();
    });
  });

  it('настройки влияют на тренировку: изменить длительность → начать → таймер использует новое значение', async () => {
    const user = userEvent.setup();
    StorageService.saveSettings(
      createSettings({
        exerciseDuration: 15,
        exercisesPerCycle: 3,
        cycleCount: 1,
      })
    );
    render(<App />);

    const startBtn = await screen.findByRole('button', { name: /Начать тренировку/i });
    await waitFor(() => expect(startBtn).not.toBeDisabled());

    vi.useFakeTimers();
    fireEvent.click(startBtn);

    expect(screen.getByText(/ГОТОВЬСЯ/i)).toBeInTheDocument();

    for (let i = 0; i < 5; i++) await act(() => vi.advanceTimersByTime(1000)); // конец PREP

    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText(/ОСТАЛОСЬ/i)).toBeInTheDocument();
  });
});
