import React, { useState, useMemo, useEffect } from 'react';
import { TranslationRecord } from '../types';
import {
  Search,
  X,
  ArrowRight,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { speakText, stopSpeaking, isSpeechSupported } from '../utils/speech';

interface HistoryViewProps {
  history: TranslationRecord[];
  onDeleteRecord: (id: string) => void;
  onClearHistory: () => void;
  onNavigateToTranslator: () => void;
  onShowToast: (message: string, isError?: boolean) => void;
  isDarkMode: boolean;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onDeleteRecord,
  onClearHistory,
  onNavigateToTranslator,
  onShowToast,
  isDarkMode,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showClearModal, setShowClearModal] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const filteredHistory = useMemo(() => {
    if (!searchQuery.trim()) return history;
    const q = searchQuery.toLowerCase().trim();
    return history.filter(
      (item) =>
        item.sourceText.toLowerCase().includes(q) ||
        item.translatedText.toLowerCase().includes(q) ||
        item.sourceLangLabel.toLowerCase().includes(q) ||
        item.targetLangLabel.toLowerCase().includes(q)
    );
  }, [history, searchQuery]);

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      onShowToast('Copied translation to clipboard');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      onShowToast('Failed to copy', true);
    }
  };

  const handleListen = async (id: string, text: string, targetLangCode: string) => {
    if (!isSpeechSupported()) {
      onShowToast('Text-to-speech is not supported in this browser.', true);
      return;
    }

    if (speakingId === id) {
      stopSpeaking();
      setSpeakingId(null);
      return;
    }

    const cleanText = text.trim();
    if (!cleanText) {
      onShowToast('Please translate some text first.', true);
      return;
    }

    setSpeakingId(id);

    try {
      const success = await speakText(
        cleanText,
        targetLangCode,
        () => setSpeakingId(id),
        () => setSpeakingId(null)
      );

      if (!success) {
        setSpeakingId(null);
      }
    } catch {
      setSpeakingId(null);
    }
  };

  const confirmClearAll = () => {
    onClearHistory();
    setShowClearModal(false);
    onShowToast('Cleared translation history');
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      {/* 1. HEADING & SUBTITLE */}
      <div className="text-center mb-8">
        <h1
          className={`text-3xl sm:text-4xl font-bold tracking-tight ${
            isDarkMode ? 'text-white' : 'text-[#111827]'
          }`}
        >
          Translation History
        </h1>
        <p
          className={`mt-2 text-sm sm:text-base ${
            isDarkMode ? 'text-[#94A3B8]' : 'text-[#5B6472]'
          }`}
        >
          Your recent translations in one place.
        </p>
      </div>

      {/* 2. SEARCH FIELD */}
      <div className="mb-8">
        <div
          className={`h-12 px-4 rounded-xl border flex items-center gap-3 transition-colors ${
            isDarkMode
              ? 'bg-[#0D1B2A] border-[#1E293B]'
              : 'bg-white border-[#E2E8F0] shadow-sm'
          }`}
        >
          <Search className={`w-4 h-4 ${isDarkMode ? 'text-[#94A3B8]' : 'text-[#5B6472]'}`} />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            type="text"
            placeholder="Search translations..."
            className={`w-full bg-transparent text-sm focus:outline-none ${
              isDarkMode
                ? 'text-white placeholder-[#94A3B8]/60'
                : 'text-[#111827] placeholder-[#5B6472]/60'
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className={`p-1 rounded-md transition-colors cursor-pointer ${
                isDarkMode ? 'text-[#94A3B8] hover:text-white' : 'text-[#5B6472] hover:text-[#111827]'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 3. HISTORY CARDS OR EMPTY STATE */}
      {filteredHistory.length > 0 ? (
        <div className="flex flex-col gap-4 mb-8">
          {filteredHistory.map((item) => (
            <article
              key={item.id}
              className={`p-6 rounded-2xl border transition-all ${
                isDarkMode
                  ? 'bg-[#0D1B2A] border-[#1E293B]'
                  : 'bg-white border-[#E2E8F0] shadow-sm'
              }`}
            >
              {/* Card Header: Language Pair & Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-inherit">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold uppercase tracking-wider ${
                      isDarkMode ? 'text-indigo-400' : 'text-indigo-600'
                    }`}
                  >
                    {item.sourceLangLabel}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                  <span
                    className={`text-xs font-bold uppercase tracking-wider ${
                      isDarkMode ? 'text-cyan-400' : 'text-cyan-700'
                    }`}
                  >
                    {item.targetLangLabel}
                  </span>
                </div>

                {/* Actions: Copy, Listen, Delete */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => handleCopy(item.id, item.translatedText)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                      isDarkMode
                        ? 'bg-[#07111F] border-[#1E293B] text-[#94A3B8] hover:text-white hover:bg-[#152538]'
                        : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#5B6472] hover:text-[#111827] hover:bg-[#F1F5F9]'
                    }`}
                    type="button"
                  >
                    {copiedId === item.id ? (
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
                    onClick={() => handleListen(item.id, item.translatedText, item.targetLang)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                      speakingId === item.id
                        ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400'
                        : isDarkMode
                        ? 'bg-[#07111F] border-[#1E293B] text-[#94A3B8] hover:text-white hover:bg-[#152538]'
                        : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#5B6472] hover:text-[#111827] hover:bg-[#F1F5F9]'
                    }`}
                    type="button"
                  >
                    {speakingId === item.id ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5" />
                        <span>Stop</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Listen</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => onDeleteRecord(item.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                      isDarkMode
                        ? 'bg-[#07111F] border-[#1E293B] text-[#94A3B8] hover:text-rose-400 hover:bg-rose-950/20 hover:border-rose-900/40'
                        : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#5B6472] hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200'
                    }`}
                    type="button"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>

              {/* Card Body: Original & Translation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div
                  className={`p-3.5 rounded-xl border ${
                    isDarkMode
                      ? 'bg-[#07111F] border-[#1E293B]/70'
                      : 'bg-[#F8FAFC] border-[#E2E8F0]'
                  }`}
                >
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider block mb-1 ${
                      isDarkMode ? 'text-[#94A3B8]' : 'text-[#5B6472]'
                    }`}
                  >
                    Original:
                  </span>
                  <p
                    className={`text-sm leading-relaxed ${
                      isDarkMode ? 'text-white' : 'text-[#111827]'
                    }`}
                  >
                    “{item.sourceText}”
                  </p>
                </div>

                <div
                  className={`p-3.5 rounded-xl border ${
                    isDarkMode
                      ? 'bg-[#07111F] border-[#1E293B]/70'
                      : 'bg-[#F8FAFC] border-[#E2E8F0]'
                  }`}
                >
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider block mb-1 ${
                      isDarkMode ? 'text-cyan-400' : 'text-indigo-600'
                    }`}
                  >
                    Translation:
                  </span>
                  <p
                    className={`text-sm leading-relaxed font-medium ${
                      isDarkMode ? 'text-white' : 'text-[#111827]'
                    }`}
                  >
                    “{item.translatedText}”
                  </p>
                </div>
              </div>
            </article>
          ))}

          {/* 4. CLEAR ALL HISTORY BUTTON */}
          <div className="flex justify-center mt-4">
            <button
              onClick={() => setShowClearModal(true)}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                isDarkMode
                  ? 'bg-[#0D1B2A] border-[#1E293B] text-[#94A3B8] hover:text-rose-400 hover:border-rose-900/40 hover:bg-rose-950/20'
                  : 'bg-white border-[#E2E8F0] text-[#5B6472] hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 shadow-sm'
              }`}
              type="button"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear All History</span>
            </button>
          </div>
        </div>
      ) : (
        /* 5. EMPTY STATE */
        <div
          className={`py-16 px-6 text-center rounded-2xl border transition-colors ${
            isDarkMode
              ? 'bg-[#0D1B2A] border-[#1E293B]'
              : 'bg-white border-[#E2E8F0] shadow-sm'
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto mb-4">
            <Search className="w-6 h-6 text-indigo-500" />
          </div>
          <h2
            className={`text-xl font-bold mb-1 ${
              isDarkMode ? 'text-white' : 'text-[#111827]'
            }`}
          >
            No translations yet.
          </h2>
          <p
            className={`text-sm max-w-sm mx-auto mb-6 ${
              isDarkMode ? 'text-[#94A3B8]' : 'text-[#5B6472]'
            }`}
          >
            Your completed translations will appear here.
          </p>
          <button
            onClick={onNavigateToTranslator}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs shadow-md transition-all cursor-pointer"
            type="button"
          >
            <span>Start Translating</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Confirmation Modal: Clear all translation history? */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div
            className={`w-full max-w-md p-6 rounded-2xl border shadow-2xl flex flex-col gap-4 animate-scaleUp transition-colors ${
              isDarkMode
                ? 'bg-[#0D1B2A] border-[#1E293B] text-white'
                : 'bg-white border-[#E2E8F0] text-[#111827]'
            }`}
          >
            <div className="flex items-center gap-3 text-rose-500">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
              </div>
              <div>
                <h3 className="text-base font-bold">Clear all translation history?</h3>
                <p
                  className={`text-xs mt-0.5 ${
                    isDarkMode ? 'text-[#94A3B8]' : 'text-[#5B6472]'
                  }`}
                >
                  This will remove all saved translations from your session.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-inherit">
              <button
                onClick={() => setShowClearModal(false)}
                className={`px-4 py-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                  isDarkMode
                    ? 'bg-[#07111F] border-[#1E293B] text-[#94A3B8] hover:text-white'
                    : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#5B6472] hover:text-[#111827]'
                }`}
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={confirmClearAll}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                type="button"
              >
                Clear History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
