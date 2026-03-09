import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

afterEach(() => {
  cleanup();
  localStorage.clear();
});

// Мок Web Speech API
class MockSpeechSynthesisUtterance {
  text: string;
  lang = '';
  voice: SpeechSynthesisVoice | null = null;
  rate = 1;
  pitch = 1;
  onend: (() => void) | null = null;
  constructor(text: string) {
    this.text = text;
  }
}
(globalThis as unknown as { SpeechSynthesisUtterance: unknown }).SpeechSynthesisUtterance =
  MockSpeechSynthesisUtterance;

Object.defineProperty(window, 'speechSynthesis', {
  configurable: true,
  value: {
    speak: vi.fn((u: SpeechSynthesisUtterance) => {
      if (u.onend) (u.onend as () => void)();
    }),
    cancel: vi.fn(),
    getVoices: vi.fn(() => []),
  },
});

// Мок Audio
window.HTMLMediaElement.prototype.play = vi.fn(() => Promise.resolve());
window.HTMLMediaElement.prototype.pause = vi.fn();

// Мок Service Worker API (для PWA; тесты не загружают полную страницу с registerSW)
if (typeof navigator !== 'undefined' && !('serviceWorker' in navigator)) {
  Object.defineProperty(navigator, 'serviceWorker', {
    value: {
      register: vi.fn(() => Promise.resolve({ scope: '/', updateViaCache: () => {} })),
      getRegistration: vi.fn(() => Promise.resolve(null)),
      getRegistrations: vi.fn(() => Promise.resolve([])),
    },
    configurable: true,
    writable: true,
  });
}
