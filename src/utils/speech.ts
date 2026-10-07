/**
 * LinguaFlow AI Speech System
 * Dual-tier high-fidelity speech engine:
 * 1. Primary: Server-side TTS endpoint (/api/tts) delivering authentic, natural audio
 *    for Kannada (kn-IN), Telugu (te-IN), Tamil (ta-IN), Hindi (hi-IN), Spanish (es-ES), English (en-US), etc.
 * 2. Secondary fallback: Web Speech API (speechSynthesis) with strict language routing.
 */

// Global tracking to manage audio and Web Speech playback
let activeAudio: HTMLAudioElement | null = null;
let activeBlobUrl: string | null = null;
const activeUtterances: SpeechSynthesisUtterance[] = [];
let isPlaybackActive = false;
let onPlaybackEndCallback: (() => void) | null = null;
let onPlaybackStartCallback: (() => void) | null = null;

export const SPEECH_LANG_MAP: Record<string, string> = {
  en: 'en-US',
  kn: 'kn-IN',
  hi: 'hi-IN',
  te: 'te-IN',
  ta: 'ta-IN',
  es: 'es-ES',
  ml: 'ml-IN',
  mr: 'mr-IN',
  bn: 'bn-IN',
  gu: 'gu-IN',
  pa: 'pa-IN',
  fr: 'fr-FR',
  de: 'de-DE',
  ja: 'ja-JP',
  ko: 'ko-KR',
  zh: 'zh-CN',
  ar: 'ar-SA',
};

export function getSpeechLangCode(langCode: string): string {
  if (!langCode) return 'en-US';
  const clean = langCode.trim().toLowerCase();
  if (SPEECH_LANG_MAP[clean]) {
    return SPEECH_LANG_MAP[clean];
  }
  const base = clean.split('-')[0];
  if (SPEECH_LANG_MAP[base]) {
    return SPEECH_LANG_MAP[base];
  }
  if (langCode.includes('-')) {
    return langCode;
  }
  return 'en-US';
}

export function isSpeechSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'speechSynthesis' in window || typeof Audio !== 'undefined';
}

/**
 * Stop any current speech playback immediately (both HTML Audio and SpeechSynthesis).
 */
export function stopSpeaking() {
  isPlaybackActive = false;

  // Stop HTML5 audio element
  if (activeAudio) {
    try {
      activeAudio.pause();
      activeAudio.currentTime = 0;
      activeAudio.src = '';
    } catch {
      // ignore
    }
    activeAudio = null;
  }

  if (activeBlobUrl) {
    try {
      URL.revokeObjectURL(activeBlobUrl);
    } catch {
      // ignore
    }
    activeBlobUrl = null;
  }

  // Stop browser SpeechSynthesis
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }

  activeUtterances.length = 0;
}

/**
 * Play via native browser speechSynthesis fallback.
 */
function playNativeSpeechSynthesis(
  text: string,
  targetLanguage: string,
  onStart?: () => void,
  onEnd?: () => void
): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onEnd) onEnd();
    return false;
  }

  stopSpeaking();
  isPlaybackActive = true;

  const langCode = getSpeechLangCode(targetLanguage);
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = langCode;
  utterance.rate = 0.95;

  // Find matching voice if available in the browser
  const voices = window.speechSynthesis.getVoices();
  if (voices && voices.length > 0) {
    const targetLower = langCode.toLowerCase().replace('_', '-');
    const baseLang = targetLower.split('-')[0];

    // Only assign if voice genuinely matches the language
    const match =
      voices.find((v) => v.lang.toLowerCase().replace('_', '-') === targetLower) ||
      voices.find((v) => v.lang.toLowerCase().replace('_', '-').startsWith(baseLang + '-')) ||
      voices.find((v) => v.lang.toLowerCase().split('-')[0] === baseLang);

    if (match) {
      utterance.voice = match;
    }
    // If no matching voice exists, do not assign a mismatching English voice,
    // which would cause speech synthesis to choke on Indic characters.
  }

  activeUtterances.push(utterance);

  utterance.onstart = () => {
    if (onStart) onStart();
  };

  utterance.onend = () => {
    isPlaybackActive = false;
    const idx = activeUtterances.indexOf(utterance);
    if (idx !== -1) activeUtterances.splice(idx, 1);
    if (onEnd) onEnd();
  };

  utterance.onerror = (e) => {
    console.warn('SpeechSynthesis error:', e);
    isPlaybackActive = false;
    const idx = activeUtterances.indexOf(utterance);
    if (idx !== -1) activeUtterances.splice(idx, 1);
    if (onEnd) onEnd();
  };

  if (window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
  }

  try {
    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    console.warn('speechSynthesis.speak error:', err);
    isPlaybackActive = false;
    if (onEnd) onEnd();
    return false;
  }
}

/**
 * Main speak function.
 * Accurately announces Kannada, Telugu, Tamil, Hindi, Spanish, English, etc.
 * Uses pristine server-side audio first, falling back to browser SpeechSynthesis.
 */
export async function speakText(
  text: string,
  targetLanguage: string,
  onStart?: () => void,
  onEnd?: () => void
): Promise<boolean> {
  const cleanText = text.trim();
  if (!cleanText) return false;

  stopSpeaking();
  isPlaybackActive = true;
  onPlaybackStartCallback = onStart || null;
  onPlaybackEndCallback = onEnd || null;

  // 1. Try server audio first (guarantees perfect pronunciation for Kannada, Telugu, Tamil, Hindi, etc.)
  try {
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: cleanText,
        language: targetLanguage,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.status === 'success' && data.audioBase64) {
        if (!isPlaybackActive) return false; // Was stopped while loading

        // Decode base64 to Blob for robust cross-browser audio playback
        const binaryString = atob(data.audioBase64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        const mimeType = data.mimeType || 'audio/mpeg';
        const blob = new Blob([bytes], { type: mimeType });
        const blobUrl = URL.createObjectURL(blob);
        activeBlobUrl = blobUrl;

        const audio = new Audio(blobUrl);
        activeAudio = audio;

        audio.onplay = () => {
          if (onPlaybackStartCallback) onPlaybackStartCallback();
        };

        audio.onended = () => {
          isPlaybackActive = false;
          activeAudio = null;
          if (activeBlobUrl) {
            URL.revokeObjectURL(activeBlobUrl);
            activeBlobUrl = null;
          }
          if (onPlaybackEndCallback) onPlaybackEndCallback();
        };

        audio.onerror = () => {
          console.warn('Audio playback error, attempting native speech synthesis fallback');
          activeAudio = null;
          if (activeBlobUrl) {
            URL.revokeObjectURL(activeBlobUrl);
            activeBlobUrl = null;
          }
          playNativeSpeechSynthesis(
            cleanText,
            targetLanguage,
            onPlaybackStartCallback || undefined,
            onPlaybackEndCallback || undefined
          );
        };

        await audio.play();
        return true;
      }
    }
  } catch (err) {
    console.warn('Server TTS fetch failed, using browser speech synthesis fallback:', err);
  }

  // 2. Fallback to native Web Speech API
  if (isPlaybackActive) {
    return playNativeSpeechSynthesis(
      cleanText,
      targetLanguage,
      onPlaybackStartCallback || undefined,
      onPlaybackEndCallback || undefined
    );
  }

  return false;
}

export function isSpeakingNow(): boolean {
  return isPlaybackActive;
}
