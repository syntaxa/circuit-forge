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

    // Attempt to match voice
    const voices = window.speechSynthesis.getVoices();
    let selectedVoice = null;
    
    if (lang === 'en-US') {
      // For English, prefer US English voices
      // 1. Try to find US English voice
      selectedVoice = voices.find(v => 
        v.lang === 'en-US' || 
        (v.lang.startsWith('en') && v.name.toLowerCase().includes('us'))
      );
      // 2. Fallback to any English voice
      if (!selectedVoice) {
        selectedVoice = voices.find(v => v.lang.startsWith('en'));
      }
    } else {
      // For Russian, use existing logic
      // 1. Try specific voice URI
      if (voiceURI) {
        selectedVoice = voices.find(v => v.voiceURI === voiceURI);
      }
      
      // 2. Fallback: Try to find a Russian voice
      if (!selectedVoice) {
        selectedVoice = voices.find(v => v.lang === 'ru-RU' || v.lang.startsWith('ru'));
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

  speakEnglish: (text: string, onEnd?: () => void) => {
    TTSService.speak(text, null, 'en-US', onEnd);
  },

  getVoices: (): SpeechSynthesisVoice[] => {
    if (!('speechSynthesis' in window)) return [];
    return window.speechSynthesis.getVoices();
  }
};