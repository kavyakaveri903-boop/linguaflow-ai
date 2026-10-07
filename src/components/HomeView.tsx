import React from 'react';
import { Zap, Globe, Volume2, ArrowRight, ArrowDown } from 'lucide-react';

interface HomeViewProps {
  onNavigateToTranslator: (targetLang?: string) => void;
  isDarkMode: boolean;
}

const SUPPORTED_LANG_CHIPS = [
  { code: 'en', name: 'English' },
  { code: 'kn', name: 'Kannada' },
  { code: 'hi', name: 'Hindi' },
  { code: 'te', name: 'Telugu' },
  { code: 'ta', name: 'Tamil' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'ja', name: 'Japanese' },
];

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigateToTranslator,
  isDarkMode,
}) => {
  const scrollToFeatures = () => {
    const el = document.getElementById('features');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* 1. HERO SECTION */}
      <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-20 sm:pb-28 text-center flex flex-col items-center">
        {/* Badge */}
        <div
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold tracking-wide uppercase mb-6 transition-colors ${
            isDarkMode
              ? 'bg-[#0D1B2A] border-[#1E293B] text-cyan-400'
              : 'bg-white border-[#E2E8F0] text-indigo-600 shadow-sm'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          ✦ AI-POWERED TRANSLATION
        </div>

        {/* Heading */}
        <h1
          className={`text-4xl sm:text-6xl font-extrabold tracking-tight max-w-3xl leading-tight ${
            isDarkMode ? 'text-white' : 'text-[#111827]'
          }`}
        >
          Translate Without{' '}
          <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 bg-clip-text text-transparent">
            Limits.
          </span>
        </h1>

        {/* Subtitle */}
        <p
          className={`mt-5 text-base sm:text-lg max-w-2xl leading-relaxed ${
            isDarkMode ? 'text-[#94A3B8]' : 'text-[#5B6472]'
          }`}
        >
          Simple, fast and intelligent AI-powered translation for everyday communication.
        </p>

        {/* Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <button
            onClick={() => onNavigateToTranslator()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm shadow-md transition-all duration-200 cursor-pointer hover:shadow-indigo-500/25 active:scale-98"
          >
            <span>Start Translating</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={scrollToFeatures}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl border font-semibold text-sm transition-all duration-200 cursor-pointer ${
              isDarkMode
                ? 'bg-[#0D1B2A] border-[#1E293B] text-white hover:bg-[#152538]'
                : 'bg-white border-[#E2E8F0] text-[#111827] hover:bg-[#F8FAFC] shadow-sm'
            }`}
          >
            <span>Explore Features</span>
            <ArrowDown className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 2. FEATURES SECTION */}
      <section
        id="features"
        className={`w-full py-20 border-t transition-colors duration-200 ${
          isDarkMode ? 'bg-[#050C16] border-[#1E293B]/80' : 'bg-[#FFFFFF] border-[#E2E8F0]'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2
              className={`text-2xl sm:text-3xl font-bold tracking-tight ${
                isDarkMode ? 'text-white' : 'text-[#111827]'
              }`}
            >
              Engineered for Cognitive Precision
            </h2>
            <p
              className={`mt-2 text-sm sm:text-base ${
                isDarkMode ? 'text-[#94A3B8]' : 'text-[#5B6472]'
              }`}
            >
              Powerful translation capabilities built to understand nuance and natural context.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div
              className={`p-7 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                isDarkMode
                  ? 'bg-[#0D1B2A] border-[#1E293B] text-white hover:border-indigo-500/40'
                  : 'bg-[#F6F8FC] border-[#E2E8F0] text-[#111827] hover:border-indigo-400'
              }`}
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-5">
                  <Zap className="w-6 h-6 text-indigo-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">⚡ Fast Translation</h3>
                <p
                  className={`text-sm leading-relaxed ${
                    isDarkMode ? 'text-[#94A3B8]' : 'text-[#5B6472]'
                  }`}
                >
                  Translate text quickly and effortlessly.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div
              className={`p-7 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                isDarkMode
                  ? 'bg-[#0D1B2A] border-[#1E293B] text-white hover:border-cyan-500/40'
                  : 'bg-[#F6F8FC] border-[#E2E8F0] text-[#111827] hover:border-cyan-400'
              }`}
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-5">
                  <Globe className="w-6 h-6 text-cyan-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">🌍 Multiple Languages</h3>
                <p
                  className={`text-sm leading-relaxed ${
                    isDarkMode ? 'text-[#94A3B8]' : 'text-[#5B6472]'
                  }`}
                >
                  Connect across languages and cultures.
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div
              className={`p-7 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                isDarkMode
                  ? 'bg-[#0D1B2A] border-[#1E293B] text-white hover:border-violet-500/40'
                  : 'bg-[#F6F8FC] border-[#E2E8F0] text-[#111827] hover:border-violet-400'
              }`}
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-5">
                  <Volume2 className="w-6 h-6 text-violet-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">🔊 Voice Playback</h3>
                <p
                  className={`text-sm leading-relaxed ${
                    isDarkMode ? 'text-[#94A3B8]' : 'text-[#5B6472]'
                  }`}
                >
                  Listen to translated text instantly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SUPPORTED LANGUAGES SECTION */}
      <section className="w-full py-20 border-t transition-colors duration-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-2xl mx-auto mb-10">
            <h2
              className={`text-2xl sm:text-3xl font-bold tracking-tight ${
                isDarkMode ? 'text-white' : 'text-[#111827]'
              }`}
            >
              Languages Without Limits
            </h2>
            <p
              className={`mt-2 text-sm sm:text-base ${
                isDarkMode ? 'text-[#94A3B8]' : 'text-[#5B6472]'
              }`}
            >
              Select any dialect to begin translating immediately.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 max-w-3xl mx-auto">
            {SUPPORTED_LANG_CHIPS.map((chip) => (
              <button
                key={chip.code}
                onClick={() => onNavigateToTranslator(chip.code)}
                className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isDarkMode
                    ? 'bg-[#0D1B2A] border-[#1E293B] text-white hover:bg-[#152538] hover:border-indigo-500/50'
                    : 'bg-white border-[#E2E8F0] text-[#111827] hover:bg-[#F8FAFC] hover:border-indigo-400 shadow-sm'
                }`}
              >
                {chip.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS SECTION */}
      <section
        className={`w-full py-20 border-t transition-colors duration-200 ${
          isDarkMode ? 'bg-[#050C16] border-[#1E293B]/80' : 'bg-[#FFFFFF] border-[#E2E8F0]'
        }`}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-2xl mx-auto mb-12">
            <h2
              className={`text-2xl sm:text-3xl font-bold tracking-tight ${
                isDarkMode ? 'text-white' : 'text-[#111827]'
              }`}
            >
              How It Works
            </h2>
            <p
              className={`mt-2 text-sm sm:text-base ${
                isDarkMode ? 'text-[#94A3B8]' : 'text-[#5B6472]'
              }`}
            >
              Three simple steps to bridge understanding across languages.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {/* Step 1 */}
            <div
              className={`p-7 rounded-2xl border transition-colors ${
                isDarkMode
                  ? 'bg-[#0D1B2A] border-[#1E293B] text-white'
                  : 'bg-[#F6F8FC] border-[#E2E8F0] text-[#111827]'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold text-sm flex items-center justify-center mb-4">
                01
              </div>
              <h3 className="text-base font-semibold mb-1">Enter Text</h3>
              <p
                className={`text-sm ${
                  isDarkMode ? 'text-[#94A3B8]' : 'text-[#5B6472]'
                }`}
              >
                Type or speak your message directly into the translation box.
              </p>
            </div>

            {/* Step 2 */}
            <div
              className={`p-7 rounded-2xl border transition-colors ${
                isDarkMode
                  ? 'bg-[#0D1B2A] border-[#1E293B] text-white'
                  : 'bg-[#F6F8FC] border-[#E2E8F0] text-[#111827]'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-violet-600 text-white font-bold text-sm flex items-center justify-center mb-4">
                02
              </div>
              <h3 className="text-base font-semibold mb-1">Choose Languages</h3>
              <p
                className={`text-sm ${
                  isDarkMode ? 'text-[#94A3B8]' : 'text-[#5B6472]'
                }`}
              >
                Pick your source and target language or let auto-detection decide.
              </p>
            </div>

            {/* Step 3 */}
            <div
              className={`p-7 rounded-2xl border transition-colors ${
                isDarkMode
                  ? 'bg-[#0D1B2A] border-[#1E293B] text-white'
                  : 'bg-[#F6F8FC] border-[#E2E8F0] text-[#111827]'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-600 text-white font-bold text-sm flex items-center justify-center mb-4">
                03
              </div>
              <h3 className="text-base font-semibold mb-1">Translate</h3>
              <p
                className={`text-sm ${
                  isDarkMode ? 'text-[#94A3B8]' : 'text-[#5B6472]'
                }`}
              >
                Get your instant translation, copy to clipboard, or listen aloud.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
