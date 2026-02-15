const DEFAULT_VOICE_NAME_SUBSTRING = 'microsoft david';

function findDefaultVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  return voices.find(v => v.name.toLowerCase().includes(DEFAULT_VOICE_NAME_SUBSTRING)) ?? null;
}

export const TTSService = {
  speak: (text: string, voiceURI: string | null, lang: 'ru-RU' | 'en-US' = 'ru-RU', onEnd?: () => void) => {
    if (!('speechSynthesis' in window)) {
      onEnd?.();
      return;
    }

    // Cancel any current speech to prevent overlapping
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;

    // Attempt to match voice — single setting: prefer user's chosen voice for all announcements
    const voices = window.speechSynthesis.getVoices();
    let selectedVoice: SpeechSynthesisVoice | null = null;

    // 1. If user saved a voice preference, use it for any language
    if (voiceURI) {
      selectedVoice = voices.find(v => v.voiceURI === voiceURI) ?? null;
    }
    // 2. No preference or voice not found — choose by language
    if (!selectedVoice) {
      if (lang === 'en-US') {
        selectedVoice = voices.find(v => v.lang === 'en-US' || (v.lang.startsWith('en') && v.name.toLowerCase().includes('us'))) ?? null;
        if (!selectedVoice) selectedVoice = voices.find(v => v.lang.startsWith('en')) ?? null;
      } else {
        selectedVoice = findDefaultVoice(voices);
        if (!selectedVoice) selectedVoice = voices.find(v => v.lang === 'ru-RU' || v.lang.startsWith('ru')) ?? null;
      }
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
    return window.speechSynthesis.getVoices();
  },

  getDefaultVoice: (): SpeechSynthesisVoice | null => {
    if (!('speechSynthesis' in window)) return null;
    return findDefaultVoice(window.speechSynthesis.getVoices());
  }
};