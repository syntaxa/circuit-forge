import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ScreenWorkout } from '@/components/ScreenWorkout';
import { createExercise } from '../helpers';
import { MuscleGroup, Difficulty } from '@/types';
import { StorageService } from '@/services/storageService';
import { createSettings } from '../helpers';

const defaultSettings = createSettings({
  exerciseDuration: 10,
  exercisesPerCycle: 2,
  cycleCount: 2,
});

describe('ScreenWorkout', () => {
  const playlist = [
    createExercise({ name: 'Exercise One', id: '1', muscleGroup: MuscleGroup.ARMS, difficulty: Difficulty.MEDIUM }),
    createExercise({ name: 'Exercise Two', id: '2', muscleGroup: MuscleGroup.LEGS, difficulty: Difficulty.EASY }),
  ];
  const muscleGroups = [MuscleGroup.ARMS, MuscleGroup.LEGS];

  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    StorageService.saveSettings(defaultSettings);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('начинается с фазы PREP (5 секунд)', () => {
    const onFinish = vi.fn();
    const onCancel = vi.fn();
    render(
      <ScreenWorkout
        playlist={playlist}
        muscleGroups={muscleGroups}
        onFinish={onFinish}
        onCancel={onCancel}
      />
    );
    expect(screen.getByText('ГОТОВЬСЯ')).toBeInTheDocument();
    expect(screen.getByText(/Exercise One/i)).toBeInTheDocument();
  });

  it('переключается на WORK по окончании PREP', async () => {
    const onFinish = vi.fn();
    const onCancel = vi.fn();
    render(
      <ScreenWorkout
        playlist={playlist}
        muscleGroups={muscleGroups}
        onFinish={onFinish}
        onCancel={onCancel}
      />
    );
    await act(() => { vi.advanceTimersByTime(5000); });
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText(/ОСТАЛОСЬ/i)).toBeInTheDocument();
    expect(screen.getByText(/Exercise One/i)).toBeInTheDocument();
  });

  it('переключается на следующее упражнение по окончании WORK', async () => {
    const onFinish = vi.fn();
    const onCancel = vi.fn();
    render(
      <ScreenWorkout
        playlist={playlist}
        muscleGroups={muscleGroups}
        onFinish={onFinish}
        onCancel={onCancel}
      />
    );
    await act(() => { vi.advanceTimersByTime(5000); });
    await act(() => { vi.advanceTimersByTime(10000); });
    expect(screen.getByText('ГОТОВЬСЯ')).toBeInTheDocument();
    expect(screen.getByText(/Exercise Two/i)).toBeInTheDocument();
  });

  it('перерыв между упражнениями берется из настроек', async () => {
    StorageService.saveSettings(
      createSettings({ exerciseDuration: 10, breakDuration: 3, cycleCount: 1 })
    );
    render(
      <ScreenWorkout
        playlist={playlist}
        muscleGroups={muscleGroups}
        onFinish={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    await act(() => { vi.advanceTimersByTime(5000); });
    await act(() => { vi.advanceTimersByTime(10000); });
    expect(screen.getByText('ГОТОВЬСЯ')).toBeInTheDocument();
    await act(() => { vi.advanceTimersByTime(3000); });
    expect(screen.getByText(/Exercise Two/i)).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('двустороннее упражнение — показывает L и R, переключается на полпути', async () => {
    const bilateral = [
      createExercise({ name: 'Bilateral', id: '1', biSided: true, muscleGroup: MuscleGroup.ARMS }),
    ];
    const onFinish = vi.fn();
    const onCancel = vi.fn();
    const speakSpy = window.speechSynthesis.speak as ReturnType<typeof vi.fn>;
    speakSpy.mockClear();
    render(
      <ScreenWorkout
        playlist={bilateral}
        muscleGroups={[MuscleGroup.ARMS]}
        onFinish={onFinish}
        onCancel={onCancel}
      />
    );
    await act(() => { vi.advanceTimersByTime(5000); });
    expect(screen.getByText(/Bilateral/i)).toBeInTheDocument();
    await act(() => { vi.advanceTimersByTime(10000); });
    const spokenTexts = speakSpy.mock.calls.map((c) => (c[0] as SpeechSynthesisUtterance).text);
    expect(spokenTexts).toContain('Switch side');
  });

  it('пауза: таймер останавливается, кнопка меняет текст', async () => {
    const onFinish = vi.fn();
    const onCancel = vi.fn();
    render(
      <ScreenWorkout
        playlist={playlist}
        muscleGroups={muscleGroups}
        onFinish={onFinish}
        onCancel={onCancel}
      />
    );
    await act(() => { vi.advanceTimersByTime(5000); });
    const pauseButton = screen.getByRole('button', { name: /пауза/i });
    fireEvent.click(pauseButton);
    expect(screen.getByRole('button', { name: /продолжить/i })).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    await act(() => { vi.advanceTimersByTime(3000); });
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('возобновление: таймер продолжает', async () => {
    const onFinish = vi.fn();
    const onCancel = vi.fn();
    render(
      <ScreenWorkout
        playlist={playlist}
        muscleGroups={muscleGroups}
        onFinish={onFinish}
        onCancel={onCancel}
      />
    );
    await act(() => { vi.advanceTimersByTime(5000); });
    fireEvent.click(screen.getByRole('button', { name: /пауза/i }));
    fireEvent.click(screen.getByRole('button', { name: /продолжить/i }));
    await act(() => { vi.advanceTimersByTime(2000); });
    expect(screen.getByText('8')).toBeInTheDocument();
  });

  it('финиш: вызывает onFinish после последнего цикла', async () => {
    const onFinish = vi.fn();
    const onCancel = vi.fn();
    render(
      <ScreenWorkout
        playlist={playlist}
        muscleGroups={muscleGroups}
        onFinish={onFinish}
        onCancel={onCancel}
      />
    );
    await act(() => { vi.advanceTimersByTime(5000); });
    await act(() => { vi.advanceTimersByTime(10000); });
    await act(() => { vi.advanceTimersByTime(5000); });
    await act(() => { vi.advanceTimersByTime(10000); });
    await act(() => { vi.advanceTimersByTime(5000); });
    await act(() => { vi.advanceTimersByTime(10000); });
    await act(() => { vi.advanceTimersByTime(5000); });
    await act(() => { vi.advanceTimersByTime(10000); });
    await act(() => { vi.advanceTimersByTime(3000); });
    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  it('отмена: при нажатии показывается диалог, при «Да, прервать» вызывается onCancel', async () => {
    const onCancel = vi.fn();
    render(
      <ScreenWorkout
        playlist={playlist}
        muscleGroups={muscleGroups}
        onFinish={vi.fn()}
        onCancel={onCancel}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /отмена/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Прервать тренировку\?/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /да, прервать/i }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('отмена: при нажатии «Нет» в диалоге onCancel не вызывается', async () => {
    const onCancel = vi.fn();
    render(
      <ScreenWorkout
        playlist={playlist}
        muscleGroups={muscleGroups}
        onFinish={vi.fn()}
        onCancel={onCancel}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /отмена/i }));
    fireEvent.click(screen.getByRole('button', { name: /^нет$/i }));
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('isPausedByOverlay ставит таймер на паузу', async () => {
    const onFinish = vi.fn();
    const onCancel = vi.fn();
    render(
      <ScreenWorkout
        playlist={playlist}
        muscleGroups={muscleGroups}
        onFinish={onFinish}
        onCancel={onCancel}
        isPausedByOverlay={true}
      />
    );
    await act(() => { vi.advanceTimersByTime(5000); });
    await act(() => { vi.advanceTimersByTime(15000); });
    expect(screen.getByText('ГОТОВЬСЯ')).toBeInTheDocument();
  });

  it('TTS: озвучивает название упражнения через Speech Synthesis API', async () => {
    const speakSpy = window.speechSynthesis.speak as ReturnType<typeof vi.fn>;
    speakSpy.mockClear();
    render(
      <ScreenWorkout
        playlist={playlist}
        muscleGroups={muscleGroups}
        onFinish={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    await act(() => { vi.advanceTimersByTime(400); });
    expect(speakSpy).toHaveBeenCalled();
    const utterance = speakSpy.mock.calls[0][0] as SpeechSynthesisUtterance;
    expect(utterance.text).toBe('Exercise One');
  });
});
