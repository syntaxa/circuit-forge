import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TTSService } from '@/services/ttsService';

const mockVoices: SpeechSynthesisVoice[] = [
  {
    voiceURI: 'en-us-1',
    name: 'US English',
    lang: 'en-US',
    default: true,
    localService: true,
  },
  {
    voiceURI: 'en-gb-1',
    name: 'UK English',
    lang: 'en-GB',
    default: false,
    localService: true,
  },
  {
    voiceURI: 'ru-1',
    name: 'Russian',
    lang: 'ru-RU',
    default: false,
    localService: true,
  },
] as SpeechSynthesisVoice[];

describe('TTSService', () => {
  beforeEach(() => {
    vi.mocked(window.speechSynthesis.getVoices).mockReturnValue(mockVoices);
    vi.mocked(window.speechSynthesis.speak).mockClear();
  });

  it('speak — вызов speechSynthesis.speak с правильными параметрами', () => {
    TTSService.speak('Hello', null, 'en-US');

    expect(window.speechSynthesis.speak).toHaveBeenCalled();
    const [utterance] = (window.speechSynthesis.speak as ReturnType<typeof vi.fn>).mock
      .calls[0] as [SpeechSynthesisUtterance];
    expect(utterance).toBeInstanceOf(SpeechSynthesisUtterance);
    expect(utterance.text).toBe('Hello');
    expect(utterance.lang).toBe('en-US');
    expect(utterance.rate).toBe(1.0);
    expect(utterance.pitch).toBe(1.0);
  });

  it('speak — предпочтение пользовательского голоса по voiceURI (English)', () => {
    TTSService.speak('Test', 'en-gb-1', 'en-US');

    expect(window.speechSynthesis.speak).toHaveBeenCalled();
    const [utterance] = (window.speechSynthesis.speak as ReturnType<typeof vi.fn>).mock
      .calls[0] as [SpeechSynthesisUtterance];
    expect(utterance.voice?.voiceURI).toBe('en-gb-1');
  });

  it('speak — fallback на en-US если voiceURI не найден', () => {
    TTSService.speak('Test', 'nonexistent-voice', 'en-US');

    expect(window.speechSynthesis.speak).toHaveBeenCalled();
    const [utterance] = (window.speechSynthesis.speak as ReturnType<typeof vi.fn>).mock
      .calls[0] as [SpeechSynthesisUtterance];
    // Должен быть выбран какой-то английский голос (en-US предпочтителен)
    expect(utterance.voice).toBeTruthy();
    expect(utterance.voice?.lang.startsWith('en')).toBe(true);
  });

  it('speak — без Speech API вызывает onEnd и не падает', () => {
    const orig = window.speechSynthesis;
    Reflect.deleteProperty(window, 'speechSynthesis');
    const onEnd = vi.fn();
    TTSService.speak('Test', null, 'en-US', onEnd);
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: orig,
    });
    expect(onEnd).toHaveBeenCalled();
  });

  it('getVoices — фильтрация по lang.startsWith("en")', () => {
    const voices = TTSService.getVoices();

    expect(voices.every((v) => v.lang.startsWith('en'))).toBe(true);
    expect(voices.map((v) => v.lang)).toContain('en-US');
    expect(voices.map((v) => v.lang)).toContain('en-GB');
    expect(voices.some((v) => v.lang === 'ru-RU')).toBe(false);
  });

  it('unlock — вызывает cancel и speak в контексте жеста (для PWA/мобильного)', () => {
    const cancelSpy = vi.mocked(window.speechSynthesis.cancel);
    cancelSpy.mockClear();
    TTSService.unlock();
    expect(cancelSpy).toHaveBeenCalled();
    expect(window.speechSynthesis.speak).toHaveBeenCalled();
    const [u] = (window.speechSynthesis.speak as ReturnType<typeof vi.fn>).mock.calls[0] as [SpeechSynthesisUtterance];
    expect(u.volume).toBe(0);
  });
});
