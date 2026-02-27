import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ScreenWorkout } from '@/components/ScreenWorkout';
import { createExercise } from '../helpers';
import { MuscleGroup, Difficulty } from '@/types';
import { StorageService } from '@/services/storageService';
import { TTSService } from '@/services/ttsService';
import { createSettings } from '../helpers';

vi.mock('@/services/storageService', () => ({
  StorageService: {
    getSettings: vi.fn(),
    addLog: vi.fn(),
  },
}));

vi.mock('@/services/ttsService', () => ({
  TTSService: {
    speakEnglish: vi.fn(),
  },
}));

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
    vi.mocked(StorageService.getSettings).mockReturnValue(defaultSettings);
    vi.mocked(TTSService.speakEnglish).mockClear();
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

  it('двустороннее упражнение — показывает L и R, переключается на полпути', async () => {
    const bilateral = [
      createExercise({ name: 'Bilateral', id: '1', biSided: true, muscleGroup: MuscleGroup.ARMS }),
    ];
    const onFinish = vi.fn();
    const onCancel = vi.fn();
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
    const calls = vi.mocked(TTSService.speakEnglish).mock.calls;
    const switchSideCall = calls.find((c) => c[0] === 'Switch side');
    expect(switchSideCall).toBeDefined();
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

  it('отмена: вызывает onCancel', async () => {
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
    expect(onCancel).toHaveBeenCalledTimes(1);
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

  it('TTS: вызывает speakEnglish с названием упражнения', () => {
    render(
      <ScreenWorkout
        playlist={playlist}
        muscleGroups={muscleGroups}
        onFinish={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(TTSService.speakEnglish).toHaveBeenCalledWith('Exercise One', null, expect.any(Function));
  });
});
