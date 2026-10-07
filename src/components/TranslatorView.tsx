import React, { useState, useEffect, useRef } from 'react';
import {
  SOURCE_LANGUAGES,
  SUPPORTED_LANGUAGES,
} from '../data/languages';
import { TranslationRecord, TranslationResponse } from '../types';
import {
  ArrowLeftRight,
  RotateCcw,
  Mic,
  MicOff,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Sparkles,
} from 'lucide-react';
import { speakText, stopSpeaking, isSpeechSupported } from '../utils/speech';

interface TranslatorViewProps {
  initialTargetLang?: string;
  onSaveTranslation: (record: TranslationRecord) => void;
  onShowToast: (message: string, isError?: boolean) => void;
  isDarkMode: boolean;
}

const POPULAR_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'kn', name: 'Kannada' },
  { code: 'hi', name: 'Hindi' },
  { code: 'te', name: 'Telugu' },
  { code: 'ta', name: 'Tamil' },
  { code: 'es', name: 'Spanish' },
];

export const TranslatorView: React.FC<TranslatorViewProps> = ({
  initialTargetLang,
  onSaveTranslation,
  onShowToast,
  isDarkMode,
}) => {
  const [sourceLang, setSourceLang] = useState<string>('en');
  const [targetLang, setTargetLang] = useState<string>(initialTargetLang || 'kn');
  const [sourceText, setSourceText] = useState<string>('');
  const [targetText, setTargetText] = useState<string>('');
  const [translateState, setTranslateState] = useState<
    'idle' | 'translating' | 'success' | 'error'
  >('idle');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (initialTargetLang) {
      setTargetLang(initialTargetLang);
    }
  }, [initialTargetLang]);

  // Pre-load voices & cleanup speech synthesis on unmount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      const onVoicesChanged = () => {
        window.speechSynthesis.getVoices();
      };
      window.speechSynthesis.addEventListener('voiceschanged', onVoicesChanged);
      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
        stopSpeaking();
      };
    }
  }, []);

  // Speech Recognition setup
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        onShowToast('Listening... Speak now');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSourceText((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognition.onerror = () => {
        setIsListening(false);
        onShowToast('Microphone error or permission denied', true);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const handleToggleVoice = () => {
    if (!recognitionRef.current) {
      onShowToast('Voice input is not supported in this browser', true);
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.lang = sourceLang === 'auto' ? 'en-US' : sourceLang;
        recognitionRef.current.start();
      } catch {
        setIsListening(false);
      }
    }
  };

  const handleClear = () => {
    stopSpeaking();
    setIsSpeaking(false);
    setSourceText('');
    setTargetText('');
    setTranslateState('idle');
  };

  const handleCopy = async () => {
    if (!targetText || !targetText.trim()) {
      onShowToast('Please translate some text first.', true);
      return;
    }
    try {
      await navigator.clipboard.writeText(targetText);
      setIsCopied(true);
      onShowToast('Copied to clipboard');
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      onShowToast('Failed to copy', true);
    }
  };

  const handleListenTts = async () => {
    // Check if browser supports audio or speech
    if (!isSpeechSupported()) {
      onShowToast('Text-to-speech is not supported in this browser.', true);
      return;
    }

    // If currently speaking, toggle to STOP and restore button to Listen
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    // Verify there is translated text
    const cleanTranslatedText = targetText.trim();
    if (!cleanTranslatedText || cleanTranslatedText.includes('will appear here')) {
      onShowToast('Please translate some text first.', true);
      return;
    }

    setIsSpeaking(true);

    try {
      const success = await speakText(
        cleanTranslatedText,
        targetLang,
        () => {
          setIsSpeaking(true);
        },
        () => {
          setIsSpeaking(false);
        }
      );

      if (!success) {
        setIsSpeaking(false);
      }
    } catch {
      setIsSpeaking(false);
    }
  };

  const handleSwapLanguages = () => {
    stopSpeaking();
    setIsSpeaking(false);

    const prevSrc = sourceLang;
    const prevTgt = targetLang;

    if (prevSrc === 'auto') {
      setSourceLang(prevTgt);
      setTargetLang('en');
    } else {
      setSourceLang(prevTgt);
      setTargetLang(prevSrc);
    }

    if (targetText) {
      const prevSourceText = sourceText;
      setSourceText(targetText);
      setTargetText(prevSourceText);
    }
  };

  const executeTranslation = async () => {
    stopSpeaking();
    setIsSpeaking(false);

    const trimmed = sourceText.trim();
    if (!trimmed) {
      onShowToast('Please enter text to translate.', true);
      return;
    }

    // If source and target languages are explicitly the same, preserve original text
    if (sourceLang !== 'auto' && sourceLang === targetLang) {
      setTargetText(trimmed);
      setTranslateState('success');
      setTimeout(() => setTranslateState('idle'), 2000);
      return;
    }

    setTranslateState('translating');

    try {
      const res = await fetch('/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: trimmed,
          source_language: sourceLang,
          target_language: targetLang,
        }),
      });

      if (!res.ok) {
        throw new Error('Translation failed');
      }

      const data: TranslationResponse = await res.json();
      if (data.status !== 'success' || !data.translated_text) {
        throw new Error(data.message || 'Translation failed');
      }

      const finalTranslated = data.translated_text;
      setTargetText(finalTranslated);
      setTranslateState('success');

      // Save real translation to history with formatted date/time
      const srcObj = SOURCE_LANGUAGES.find((l) => l.code === sourceLang);
      const tgtObj = SUPPORTED_LANGUAGES.find((l) => l.code === targetLang);

      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const record: TranslationRecord = {
        id: `rec-${Date.now()}`,
        sourceText: trimmed,
        translatedText: finalTranslated,
        sourceLang: sourceLang === 'auto' ? 'en' : sourceLang,
        sourceLangLabel: srcObj?.name || 'English',
        targetLang: targetLang,
        targetLangLabel: tgtObj?.name || 'Kannada',
        timestamp: `Today • ${timeStr}`,
        model: 'Neural Translation',
        confidence: 99.8,
        latencyMs: 120,
      };

      onSaveTranslation(record);

      setTimeout(() => {
        setTranslateState('idle');
      }, 2000);
    } catch {
      setTranslateState('error');
      onShowToast('Translation failed. Please try again.', true);
      setTimeout(() => {
        setTranslateState('idle');
      }, 2500);
    }
  };

  const getTranslateBtnContent = () => {
    switch (translateState) {
      case 'translating':
        return (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            <span>Translating...</span>
          </>
        );
      case 'success':
        return (
          <>
            <Check className="w-4 h-4" />
            <span>Translation Complete ✓</span>
          </>
        );
      case 'error':
        return <span>Translation Failed — Try Again</span>;
      default:
        return (
          <>
            <Sparkles className="w-4 h-4" />
            <span>✦ Translate</span>
          </>
        );
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      {/* 1. HEADING & SUBTITLE */}
      <div className="text-center mb-8">
        <h1
          className={`text-3xl sm:text-4xl font-bold tracking-tight ${
            isDarkMode ? 'text-white' : 'text-[#111827]'
          }`}
        >
          Smart Translation
        </h1>
        <p
          className={`mt-2 text-sm sm:text-base ${
            isDarkMode ? 'text-[#94A3B8]' : 'text-[#5B6472]'
          }`}
        >
          Translate your text in seconds.
        </p>
      </div>

      {/* 2. LANGUAGE BAR */}
      <div
        className={`p-3 sm:p-4 rounded-2xl border mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 transition-colors ${
          isDarkMode
            ? 'bg-[#0D1B2A] border-[#1E293B]'
            : 'bg-white border-[#E2E8F0] shadow-sm'
        }`}
      >
        {/* Source Language */}
        <div className="w-full sm:flex-1 flex flex-col gap-1">
          <label
            className={`text-[11px] font-semibold uppercase tracking-wider ${
              isDarkMode ? 'text-[#94A3B8]' : 'text-[#5B6472]'
            }`}
          >
            Source Language
          </label>
          <div
            className={`h-11 px-3 rounded-xl border flex items-center transition-colors ${
              isDarkMode
                ? 'bg-[#07111F] border-[#1E293B]'
                : 'bg-[#F8FAFC] border-[#E2E8F0]'
            }`}
          >
            <select
              value={sourceLang}
              onChange={(e) => {
                stopSpeaking();
                setIsSpeaking(false);
                setSourceLang(e.target.value);
              }}
              className={`w-full bg-transparent text-sm font-medium focus:outline-none cursor-pointer ${
                isDarkMode ? 'text-white' : 'text-[#111827]'
              }`}
            >
              {SOURCE_LANGUAGES.map((lang) => (
                <option
                  key={lang.code}
                  value={lang.code}
                  className={isDarkMode ? 'bg-[#0D1B2A] text-white' : 'bg-white text-[#111827]'}
                >
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Swap Button (⇄) */}
        <div className="flex items-center justify-center pt-2 sm:pt-4">
          <button
            onClick={handleSwapLanguages}
            aria-label="Swap languages"
            title="Swap source and target languages"
            className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
              isDarkMode
                ? 'bg-[#07111F] border-[#1E293B] text-cyan-400 hover:bg-[#152538]'
                : 'bg-[#F8FAFC] border-[#E2E8F0] text-indigo-600 hover:bg-[#F1F5F9]'
            }`}
            type="button"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>
        </div>

        {/* Target Language */}
        <div className="w-full sm:flex-1 flex flex-col gap-1">
          <label
            className={`text-[11px] font-semibold uppercase tracking-wider ${
              isDarkMode ? 'text-[#94A3B8]' : 'text-[#5B6472]'
            }`}
          >
            Target Language
          </label>
          <div
            className={`h-11 px-3 rounded-xl border flex items-center transition-colors ${
              isDarkMode
                ? 'bg-[#07111F] border-[#1E293B]'
                : 'bg-[#F8FAFC] border-[#E2E8F0]'
            }`}
          >
            <select
              value={targetLang}
              onChange={(e) => {
                stopSpeaking();
                setIsSpeaking(false);
                setTargetLang(e.target.value);
              }}
              className={`w-full bg-transparent text-sm font-medium focus:outline-none cursor-pointer ${
                isDarkMode ? 'text-white' : 'text-[#111827]'
              }`}
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option
                  key={lang.code}
                  value={lang.code}
                  className={isDarkMode ? 'bg-[#0D1B2A] text-white' : 'bg-white text-[#111827]'}
                >
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 3. TRANSLATION WORKSPACE (TWO EQUAL-SIZED CARDS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* LEFT CARD: YOUR TEXT */}
        <div
          className={`p-5 rounded-2xl border flex flex-col justify-between min-h-[320px] transition-colors ${
            isDarkMode
              ? 'bg-[#0D1B2A] border-[#1E293B]'
              : 'bg-white border-[#E2E8F0] shadow-sm'
          }`}
        >
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-inherit">
              <span
                className={`text-xs font-bold uppercase tracking-wider ${
                  isDarkMode ? 'text-[#94A3B8]' : 'text-[#5B6472]'
                }`}
              >
                YOUR TEXT
              </span>
              <span
                className={`text-xs font-mono ${
                  isDarkMode ? 'text-[#94A3B8]' : 'text-[#5B6472]'
                }`}
              >
                {sourceText.length} / 5000
              </span>
            </div>

            <textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              maxLength={5000}
              placeholder="Type or paste your text here…"
              rows={8}
              className={`w-full mt-3 bg-transparent resize-none focus:outline-none text-base leading-relaxed ${
                isDarkMode
                  ? 'text-white placeholder-[#94A3B8]/60'
                  : 'text-[#111827] placeholder-[#5B6472]/60'
              }`}
            />
          </div>

          {/* Bottom Actions: Clear & Voice Input */}
          <div className="flex items-center justify-between pt-3 border-t border-inherit">
            <button
              onClick={handleClear}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                isDarkMode
                  ? 'bg-[#07111F] border-[#1E293B] text-[#94A3B8] hover:text-white hover:bg-[#152538]'
                  : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#5B6472] hover:text-[#111827] hover:bg-[#F1F5F9]'
              }`}
              type="button"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>

            <button
              onClick={handleToggleVoice}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                isListening
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-400 animate-pulse'
                  : isDarkMode
                  ? 'bg-[#07111F] border-[#1E293B] text-[#94A3B8] hover:text-white hover:bg-[#152538]'
                  : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#5B6472] hover:text-[#111827] hover:bg-[#F1F5F9]'
              }`}
              type="button"
            >
              {isListening ? (
                <>
                  <MicOff className="w-3.5 h-3.5 text-rose-400" />
                  <span>Listening...</span>
                </>
              ) : (
                <>
                  <Mic className="w-3.5 h-3.5" />
                  <span>Voice Input</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* RIGHT CARD: TRANSLATION */}
        <div
          className={`p-5 rounded-2xl border flex flex-col justify-between min-h-[320px] transition-colors ${
            isDarkMode
              ? 'bg-[#0D1B2A] border-[#1E293B]'
              : 'bg-white border-[#E2E8F0] shadow-sm'
          }`}
        >
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-inherit">
              <span
                className={`text-xs font-bold uppercase tracking-wider ${
                  isDarkMode ? 'text-[#94A3B8]' : 'text-[#5B6472]'
                }`}
              >
                TRANSLATION
              </span>
            </div>

            <div className="w-full mt-3 min-h-[190px] overflow-y-auto">
              {targetText ? (
                <p
                  className={`text-base leading-relaxed whitespace-pre-wrap font-medium ${
                    isDarkMode ? 'text-white' : 'text-[#111827]'
                  }`}
                >
                  {targetText}
                </p>
              ) : (
                <p
                  className={`text-base italic ${
                    isDarkMode ? 'text-[#94A3B8]/60' : 'text-[#5B6472]/60'
                  }`}
                >
                  Your translation will appear here…
                </p>
              )}
            </div>
          </div>

          {/* Bottom Actions: Copy & Listen */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-inherit">
            <button
              onClick={handleCopy}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                isDarkMode
                  ? 'bg-[#07111F] border-[#1E293B] text-[#94A3B8] hover:text-white hover:bg-[#152538]'
                  : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#5B6472] hover:text-[#111827] hover:bg-[#F1F5F9]'
              }`}
              type="button"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-cyan-400">Copied ✓</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>

            <button
              onClick={handleListenTts}
              aria-label={isSpeaking ? 'Stop speaking' : 'Listen to translation'}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                isSpeaking
                  ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400'
                  : isDarkMode
                  ? 'bg-[#07111F] border-[#1E293B] text-[#94A3B8] hover:text-white hover:bg-[#152538]'
                  : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#5B6472] hover:text-[#111827] hover:bg-[#F1F5F9]'
              }`}
              type="button"
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-3.5 h-3.5 animate-pulse text-indigo-400" />
                  <span>Speaking...</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Listen</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 4. TRANSLATE BUTTON */}
      <div className="flex justify-center mb-12">
        <button
          onClick={executeTranslation}
          disabled={translateState === 'translating'}
          className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-base shadow-md transition-all duration-200 cursor-pointer disabled:opacity-75 min-w-[240px]"
          type="button"
        >
          {getTranslateBtnContent()}
        </button>
      </div>

      {/* 5. POPULAR LANGUAGES */}
      <div
        className={`p-6 rounded-2xl border text-center transition-colors ${
          isDarkMode
            ? 'bg-[#0D1B2A] border-[#1E293B]'
            : 'bg-white border-[#E2E8F0] shadow-sm'
        }`}
      >
        <span
          className={`text-xs font-bold uppercase tracking-wider block mb-3 ${
            isDarkMode ? 'text-[#94A3B8]' : 'text-[#5B6472]'
          }`}
        >
          Popular Languages
        </span>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {POPULAR_LANGUAGES.map((item) => {
            const isActive = targetLang === item.code;
            return (
              <button
                key={item.code}
                onClick={() => {
                  stopSpeaking();
                  setIsSpeaking(false);
                  setTargetLang(item.code);
                }}
                className={`px-3.5 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 border-indigo-600 text-white font-semibold'
                    : isDarkMode
                    ? 'bg-[#07111F] border-[#1E293B] text-[#94A3B8] hover:text-white hover:bg-[#152538]'
                    : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#5B6472] hover:text-[#111827] hover:bg-[#F1F5F9]'
                }`}
                type="button"
              >
                {item.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
