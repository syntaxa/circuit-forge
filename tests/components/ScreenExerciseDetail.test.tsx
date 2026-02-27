import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ScreenExerciseDetail } from '@/components/ScreenExerciseDetail';
import { createExercise } from '../helpers';
import { MuscleGroup, Difficulty } from '@/types';

describe('ScreenExerciseDetail', () => {
  const onBack = vi.fn();

  it('показывает название, описание, группу мышц и сложность', () => {
    const exercise = createExercise({
      name: 'Jump Squat',
      description: 'Взрывное приседание.',
      muscleGroup: MuscleGroup.LEGS,
      difficulty: Difficulty.HARD,
    });
    render(<ScreenExerciseDetail exercise={exercise} onBack={onBack} />);

    expect(screen.getByRole('heading', { name: 'Jump Squat' })).toBeInTheDocument();
    expect(screen.getByText('Взрывное приседание.')).toBeInTheDocument();
    expect(screen.getByText(/ноги/)).toBeInTheDocument();
    expect(screen.getByText(/высокий/)).toBeInTheDocument();
  });

  it('показывает шаги выполнения', () => {
    const exercise = createExercise({
      steps: 'Step 1\nStep 2\nStep 3',
    });
    render(<ScreenExerciseDetail exercise={exercise} onBack={onBack} />);

    expect(screen.getByText(/как выполнять/i)).toBeInTheDocument();
    expect(screen.getByText(/Step 1/)).toBeInTheDocument();
    expect(screen.getByText(/Step 2/)).toBeInTheDocument();
    expect(screen.getByText(/Step 3/)).toBeInTheDocument();
  });

  it('кнопка «Назад» вызывает onBack', async () => {
    const user = userEvent.setup();
    const exercise = createExercise({ name: 'Plank' });
    render(<ScreenExerciseDetail exercise={exercise} onBack={onBack} />);

    await user.click(screen.getByRole('button', { name: /назад/i }));

    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('не рендерит блок описания, если description пустой', () => {
    const exercise = createExercise({ description: '', name: 'NoDesc' });
    render(<ScreenExerciseDetail exercise={exercise} onBack={onBack} />);

    expect(screen.getByRole('heading', { name: 'NoDesc' })).toBeInTheDocument();
    expect(screen.queryByText('Test description')).not.toBeInTheDocument();
  });

  it('не рендерит блок шагов, если steps пустой', () => {
    const exercise = createExercise({ steps: '', name: 'NoSteps' });
    render(<ScreenExerciseDetail exercise={exercise} onBack={onBack} />);

    expect(screen.getByRole('heading', { name: 'NoSteps' })).toBeInTheDocument();
    expect(screen.queryByText(/как выполнять/i)).not.toBeInTheDocument();
  });
});
