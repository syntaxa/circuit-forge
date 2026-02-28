import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '@/App';
import { StorageService } from '@/services/storageService';
import { AppScreen } from '@/types';
import type { HistoryState } from '@/App';
import { createSettings } from '../helpers';

describe('deviceBackNavigation (integration)', () => {
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

  it('симуляция кнопки «Назад» устройства: с экрана О приложении возврат на экран настройки (SETUP)', async () => {
    const user = userEvent.setup();
    render(<App />);

    const startBtn = await screen.findByRole('button', { name: /Начать тренировку/i });
    await waitFor(() => expect(startBtn).not.toBeDisabled());

    const aboutButtons = screen.getAllByRole('button', { name: 'О приложении' });
    await user.click(aboutButtons[0]);
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'О приложении' })).toBeInTheDocument();
    });

    const state: HistoryState = { screen: AppScreen.SETUP, exerciseDetail: null };
    await act(() => {
      window.dispatchEvent(new PopStateEvent('popstate', { state }));
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Начать тренировку/i })).toBeInTheDocument();
    });
  });

  it('симуляция кнопки «Назад» устройства: с экрана База упражнений возврат на экран настройки', async () => {
    const user = userEvent.setup();
    render(<App />);

    const startBtn = await screen.findByRole('button', { name: /Начать тренировку/i });
    await waitFor(() => expect(startBtn).not.toBeDisabled());

    await user.click(screen.getByRole('button', { name: /База упражнений/i }));
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /База упражнений/i })).toBeInTheDocument();
    });

    const state: HistoryState = { screen: AppScreen.SETUP, exerciseDetail: null };
    await act(() => {
      window.dispatchEvent(new PopStateEvent('popstate', { state }));
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Начать тренировку/i })).toBeInTheDocument();
    });
    expect(screen.queryByRole('heading', { name: /База упражнений/i })).not.toBeInTheDocument();
  });

  it('симуляция кнопки «Назад» устройства: закрытие оверлея детали упражнения', async () => {
    const user = userEvent.setup();
    render(<App />);

    const startBtn = await screen.findByRole('button', { name: /Начать тренировку/i });
    await waitFor(() => expect(startBtn).not.toBeDisabled());

    await user.click(screen.getByRole('button', { name: /База упражнений/i }));
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /База упражнений/i })).toBeInTheDocument();
    });

    const openDetailBtn = screen.getByRole('button', { name: 'Открыть описание: Abdominal Crunch' });
    await user.click(openDetailBtn);

    await screen.findByRole('heading', { name: 'Как выполнять' });

    const state: HistoryState = { screen: AppScreen.DATABASE, exerciseDetail: null };
    await act(() => {
      window.dispatchEvent(new PopStateEvent('popstate', { state }));
    });

    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: 'Как выполнять' })).not.toBeInTheDocument();
    });
    expect(screen.getByRole('heading', { name: /База упражнений/i })).toBeInTheDocument();
  });
});
