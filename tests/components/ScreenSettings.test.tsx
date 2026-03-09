import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ScreenSettings } from '@/components/ScreenSettings';
import { StorageService } from '@/services/storageService';
import { createSettings } from '../helpers';
import { MuscleGroup } from '@/types';

const testVoices: SpeechSynthesisVoice[] = [
  { voiceURI: 'en-us-1', name: 'US English', lang: 'en-US', default: true, localService: true },
  { voiceURI: 'en-gb-1', name: 'UK English', lang: 'en-GB', default: false, localService: true },
] as SpeechSynthesisVoice[];

describe('ScreenSettings', () => {
  const onBack = vi.fn();

  beforeEach(() => {
    localStorage.clear();
    (window.speechSynthesis.getVoices as ReturnType<typeof vi.fn>).mockReturnValue(testVoices);
    StorageService.saveSettings(createSettings());
    StorageService.clearHistory();
    onBack.mockClear();
  });

  it('отображает текущие значения настроек из StorageService', () => {
    StorageService.saveSettings(
      createSettings({
        exerciseDuration: 45,
        breakDuration: 7,
        exercisesPerCycle: 8,
        cycleCount: 3,
      })
    );
    render(<ScreenSettings onBack={onBack} />);

    expect(screen.getByDisplayValue('45')).toBeInTheDocument();
    expect(screen.getByDisplayValue('7')).toBeInTheDocument();
    expect(screen.getByDisplayValue('8')).toBeInTheDocument();
    expect(screen.getByDisplayValue('3')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Настройки' })).toBeInTheDocument();
  });

  it('изменение breakDuration сохраняет через StorageService.saveSettings, минимум 3', async () => {
    const user = userEvent.setup();
    StorageService.saveSettings(createSettings({ breakDuration: 5 }));
    render(<ScreenSettings onBack={onBack} />);

    const breakInput = screen.getByDisplayValue('5');
    fireEvent.change(breakInput, { target: { value: '2' } });
    await user.click(screen.getByRole('button', { name: /сохранить/i }));

    expect(StorageService.getSettings().breakDuration).toBe(3);
    expect(onBack).toHaveBeenCalled();
  });

  it('список голосов показывает только английские голоса', () => {
    render(<ScreenSettings onBack={onBack} />);

    const options = screen.getAllByRole('option');
    const texts = options.map((o) => o.textContent ?? '');
    expect(texts.some((t) => t === 'US English')).toBe(true);
    expect(texts.some((t) => t === 'UK English')).toBe(true);
    expect(options.length).toBeGreaterThanOrEqual(2);
  });

  it('кнопка «Очистить данные последней тренировки» очищает последний лог', async () => {
    const user = userEvent.setup();
    StorageService.addLog({
      date: new Date().toISOString(),
      muscleGroupsUsed: [MuscleGroup.ARMS, MuscleGroup.LEGS],
    });
    expect(StorageService.getLastLog()).not.toBeNull();
    render(<ScreenSettings onBack={onBack} />);

    expect(screen.getByText(/руки|ноги/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /очистить данные последней тренировки/i }));

    expect(StorageService.getLastLog()).toBeNull();
  });

  it('при отсутствии lastLog показывает сообщение и нет кнопки очистки', () => {
    StorageService.clearHistory();
    render(<ScreenSettings onBack={onBack} />);

    expect(screen.getByText(/нет данных о завершённых тренировка/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /очистить данные последней тренировки/i })).not.toBeInTheDocument();
  });
});
