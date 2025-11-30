export const TTSService = {
  speak: (text: string, voiceURI: string | null) => {
    if (!('speechSynthesis' in window)) return;

    // Cancel any current speech to prevent overlapping
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ru-RU'; // Force Russian locale

    // Attempt to match voice
    const voices = window.speechSynthesis.getVoices();
    let selectedVoice = null;
    
    // 1. Try specific voice URI
    if (voiceURI) {
      selectedVoice = voices.find(v => v.voiceURI === voiceURI);
    }
    
    // 2. Fallback: Try to find a Russian voice
    if (!selectedVoice) {
      selectedVoice = voices.find(v => v.lang === 'ru-RU' || v.lang.startsWith('ru'));
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  },

  getVoices: (): SpeechSynthesisVoice[] => {
    if (!('speechSynthesis' in window)) return [];
    return window.speechSynthesis.getVoices();
  }
};