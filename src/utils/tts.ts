export const speak = (text: string, lang = 'es-ES') => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;

        // Try to find a specific voice for the language
        const voices = window.speechSynthesis.getVoices();
        const voice = voices.find(v => v.lang.startsWith(lang));
        if (voice) {
            utterance.voice = voice;
        }

        window.speechSynthesis.speak(utterance);
    } else {
        console.warn("Text-to-speech not supported.");
    }
};
