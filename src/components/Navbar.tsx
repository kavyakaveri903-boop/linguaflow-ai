import React from 'react';
import { NavTab } from '../types';
import { Sparkles, Sun, Moon } from 'lucide-react';

interface NavbarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  isDarkMode,
  onToggleDarkMode,
}) => {
  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 h-16 transition-colors duration-200 border-b backdrop-blur-md ${
        isDarkMode
          ? 'bg-[#07111F]/90 border-[#1E293B]/80 text-white'
          : 'bg-[#FFFFFF]/90 border-[#E2E8F0] text-[#111827]'
      }`}
    >
      <div className="h-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* LEFT: Branding */}
        <button
          onClick={() => onTabChange('home')}
          className="flex items-center gap-3 text-left focus:outline-none cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-sm transition-transform group-hover:scale-105">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-[17px] tracking-tight leading-none bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
              ✦ LinguaFlow AI
            </span>
            <span
              className={`text-[11px] font-medium tracking-wide mt-1 ${
                isDarkMode ? 'text-[#94A3B8]' : 'text-[#5B6472]'
              }`}
            >
              Smart Language Translation
            </span>
          </div>
        </button>

        {/* RIGHT: Navigation & Controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Nav Tabs */}
          <nav
            className={`flex items-center p-1 rounded-full border text-xs sm:text-sm font-medium transition-colors ${
              isDarkMode
                ? 'bg-[#0D1B2A] border-[#1E293B] text-[#94A3B8]'
                : 'bg-[#F1F5F9] border-[#E2E8F0] text-[#5B6472]'
            }`}
          >
            <button
              onClick={() => onTabChange('home')}
              className={`px-3 sm:px-4 py-1.5 rounded-full transition-all cursor-pointer font-medium ${
                currentTab === 'home'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm'
                  : isDarkMode
                  ? 'hover:text-white'
                  : 'hover:text-[#111827]'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => onTabChange('translator')}
              className={`px-3 sm:px-4 py-1.5 rounded-full transition-all cursor-pointer font-medium ${
                currentTab === 'translator'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm'
                  : isDarkMode
                  ? 'hover:text-white'
                  : 'hover:text-[#111827]'
              }`}
            >
              Translator
            </button>
            <button
              onClick={() => onTabChange('translation-history')}
              className={`px-3 sm:px-4 py-1.5 rounded-full transition-all cursor-pointer font-medium ${
                currentTab === 'translation-history'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm'
                  : isDarkMode
                  ? 'hover:text-white'
                  : 'hover:text-[#111827]'
              }`}
            >
              History
            </button>
          </nav>

          {/* AI Powered Badge */}
          <div
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-semibold tracking-wide uppercase transition-colors ${
              isDarkMode
                ? 'bg-[#0D1B2A] border-[#1E293B] text-cyan-400'
                : 'bg-white border-[#E2E8F0] text-indigo-600 shadow-sm'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            AI Powered
          </div>

          {/* Theme Toggle Button: ☀ / 🌙 */}
          <button
            onClick={onToggleDarkMode}
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
              isDarkMode
                ? 'bg-[#0D1B2A] border-[#1E293B] text-amber-400 hover:bg-[#152538] hover:text-amber-300'
                : 'bg-white border-[#E2E8F0] text-indigo-600 hover:bg-[#F8FAFC] shadow-sm'
            }`}
            type="button"
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
