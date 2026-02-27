import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ScreenSettings } from '@/components/ScreenSettings';
import { StorageService } from '@/services/storageService';
import { TTSService } from '@/services/ttsService';
import { createSettings } from '../helpers';
import { MuscleGroup } from '@/types';

vi.mock('@/services/storageService', () => ({
  StorageService: {
    getSettings: vi.fn(),
    saveSettings: vi.fn(),
    getLastLog: vi.fn(),
    clearLastLog: vi.fn(),
  },
}));

const mockEnVoice = {
  voiceURI: 'en-us-1',
  name: 'US English',
  lang: 'en-US',
  default: true,
  localService: true,
} as SpeechSynthesisVoice;

const mockEnGbVoice = {
  voiceURI: 'en-gb-1',
  name: 'UK English',
  lang: 'en-GB',
  default: false,
  localService: true,
} as SpeechSynthesisVoice;

vi.mock('@/services/ttsService', () => ({
  TTSService: {
    getVoices: vi.fn(() => [mockEnVoice, mockEnGbVoice]),
    getDefaultVoice: vi.fn(() => mockEnVoice),
  },
}));

describe('ScreenSettings', () => {
  const onBack = vi.fn();

  beforeEach(() => {
    vi.mocked(StorageService.getSettings).mockReturnValue(createSettings());
    vi.mocked(StorageService.getLastLog).mockReturnValue(null);
    onBack.mockClear();
  });

  it('отображает текущие значения настроек из StorageService', () => {
    const settings = createSettings({
      exerciseDuration: 45,
      exercisesPerCycle: 8,
      cycleCount: 3,
    });
    vi.mocked(StorageService.getSettings).mockReturnValue(settings);
    render(<ScreenSettings onBack={onBack} />);

    expect(screen.getByDisplayValue('45')).toBeInTheDocument();
    expect(screen.getByDisplayValue('8')).toBeInTheDocument();
    expect(screen.getByDisplayValue('3')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Настройки' })).toBeInTheDocument();
  });

  it('изменение exerciseDuration сохраняет через StorageService.saveSettings', async () => {
    const user = userEvent.setup();
    const settings = createSettings({ exerciseDuration: 30 });
    vi.mocked(StorageService.getSettings).mockReturnValue(settings);
    render(<ScreenSettings onBack={onBack} />);

    const durationInput = screen.getByDisplayValue('30');
    await user.clear(durationInput);
    await user.type(durationInput, '60');
    await user.click(screen.getByRole('button', { name: /сохранить/i }));

    expect(StorageService.saveSettings).toHaveBeenCalledWith(
      expect.objectContaining({ exerciseDuration: 60 })
    );
    expect(onBack).toHaveBeenCalled();
  });

  it('список голосов показывает только английские голоса', () => {
    render(<ScreenSettings onBack={onBack} />);

    expect(screen.getByRole('option', { name: /US English.*en-US/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /UK English.*en-GB/i })).toBeInTheDocument();
    const options = screen.getAllByRole('option');
    expect(options.length).toBeGreaterThanOrEqual(2);
  });

  it('кнопка «Очистить данные последней тренировки» вызывает clearLastLog', async () => {
    const user = userEvent.setup();
    vi.mocked(StorageService.getLastLog).mockReturnValue({
      date: new Date().toISOString(),
      muscleGroupsUsed: [MuscleGroup.ARMS, MuscleGroup.LEGS],
    });
    render(<ScreenSettings onBack={onBack} />);

    expect(screen.getByText(/ARMS|руки|LEGS|ноги/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /очистить данные последней тренировки/i }));

    expect(StorageService.clearLastLog).toHaveBeenCalled();
  });

  it('при отсутствии lastLog показывает сообщение и нет кнопки очистки', () => {
    vi.mocked(StorageService.getLastLog).mockReturnValue(null);
    render(<ScreenSettings onBack={onBack} />);

    expect(screen.getByText(/нет данных о завершённых тренировках/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /очистить данные последней тренировки/i })).not.toBeInTheDocument();
  });
});
