function findDefaultEnglishVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  // Filter only English voices
  const englishVoices = voices.filter(v => v.lang.startsWith('en'));
  if (englishVoices.length === 0) return null;
  
  // Prefer en-US voices
  const usVoice = englishVoices.find(v => v.lang === 'en-US' || (v.lang.startsWith('en') && v.name.toLowerCase().includes('us')));
  if (usVoice) return usVoice;
  
  // Fallback to any English voice
  return englishVoices[0];
}

export const TTSService = {
  /**
   * Прогрев TTS в контексте пользовательского жеста (вызывать при «Начать тренировку»).
   * Выполняет «тихую» инициализацию без озвучивания; после завершения utterance ждёт
   * дополнительно SETTLE_MS, чтобы движок был готов к следующей фразе (на Android
   * иначе начало названия упражнения может обрезаться).
   */
  warmUp: (): Promise<void> => {
    const SETTLE_MS = 400;
    const MAX_WAIT_MS = 800;

    return new Promise((resolve) => {
      if (!('speechSynthesis' in window)) {
        resolve();
        return;
      }
      let timeoutId: ReturnType<typeof setTimeout> | undefined = undefined;
      let settleId: ReturnType<typeof setTimeout> | undefined = undefined;

      const finish = () => {
        if (timeoutId !== undefined) clearTimeout(timeoutId);
        if (settleId !== undefined) clearTimeout(settleId);
        resolve();
      };

      const onUtteranceDone = () => {
        if (timeoutId !== undefined) clearTimeout(timeoutId);
        timeoutId = undefined;
        settleId = setTimeout(finish, SETTLE_MS);
      };

      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance('\u00A0');
      u.volume = 0;
      u.onend = onUtteranceDone;
      u.onerror = onUtteranceDone;
      window.speechSynthesis.speak(u);
      timeoutId = setTimeout(finish, MAX_WAIT_MS);
    });
  },

  speak: (text: string, voiceURI: string | null, lang: 'ru-RU' | 'en-US' = 'ru-RU', onEnd?: () => void) => {
    if (!('speechSynthesis' in window)) {
      onEnd?.();
      return;
    }

    // Cancel any current speech to prevent overlapping
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US'; // Always use English language

    // Filter only English voices
    const allVoices = window.speechSynthesis.getVoices();
    const englishVoices = allVoices.filter(v => v.lang.startsWith('en'));
    
    let selectedVoice: SpeechSynthesisVoice | null = null;

    // 1. If user saved a voice preference, use it only if it's an English voice
    if (voiceURI) {
      const userVoice = englishVoices.find(v => v.voiceURI === voiceURI);
      if (userVoice) {
        selectedVoice = userVoice;
      }
    }
    
    // 2. No preference or voice not found — use default English voice
    if (!selectedVoice) {
      selectedVoice = findDefaultEnglishVoice(englishVoices);
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    if (onEnd) {
      utterance.onend = onEnd;
    }
    
    window.speechSynthesis.speak(utterance);
  },

  speakEnglish: (text: string, voiceURI: string | null, onEnd?: () => void) => {
    TTSService.speak(text, voiceURI, 'en-US', onEnd);
  },

  getVoices: (): SpeechSynthesisVoice[] => {
    if (!('speechSynthesis' in window)) return [];
    // Return only English voices
    return window.speechSynthesis.getVoices().filter(v => v.lang.startsWith('en'));
  },

  getDefaultVoice: (): SpeechSynthesisVoice | null => {
    if (!('speechSynthesis' in window)) return null;
    return findDefaultEnglishVoice(window.speechSynthesis.getVoices());
  }
};