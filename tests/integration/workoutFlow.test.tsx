import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
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

    await waitFor(
      () => {
        expect(screen.getByText(/ГОТОВЬСЯ/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Отмена/i })).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });

  it('отмена тренировки: Начать → Отмена → диалог «Да, прервать» → возврат на настройку', async () => {
    const user = userEvent.setup();
    render(<App />);

    const startBtn = await screen.findByRole('button', { name: /Начать тренировку/i });
    await waitFor(() => expect(startBtn).not.toBeDisabled());

    await user.click(startBtn);

    await waitFor(() => expect(screen.getByText(/ГОТОВЬСЯ/i)).toBeInTheDocument(), { timeout: 5000 });

    await user.click(screen.getByRole('button', { name: /Отмена/i }));
    await user.click(screen.getByRole('button', { name: /да, прервать/i }));

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

    await user.click(startBtn);
    await waitFor(() => expect(screen.getByText(/ГОТОВЬСЯ/i)).toBeInTheDocument());

    await waitFor(() => expect(screen.getByText('15')).toBeInTheDocument(), { timeout: 8000 });

    expect(screen.getByText(/ОСТАЛОСЬ/i)).toBeInTheDocument();
  }, 10000);
});
