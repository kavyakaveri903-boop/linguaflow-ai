import React from 'react';
import { NavTab } from '../types';

interface FooterProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  isDarkMode: boolean;
}

export const Footer: React.FC<FooterProps> = ({ currentTab, onTabChange, isDarkMode }) => {
  return (
    <footer
      className={`w-full py-8 border-t transition-colors duration-200 mt-auto ${
        isDarkMode
          ? 'bg-[#050C16] border-[#1E293B]/80 text-[#94A3B8]'
          : 'bg-[#FFFFFF] border-[#E2E8F0] text-[#5B6472]'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <span
              className={`font-semibold text-sm ${
                isDarkMode ? 'text-white' : 'text-[#111827]'
              }`}
            >
              LinguaFlow AI
            </span>
            <span className="text-xs">
              — Smart Language Translation
            </span>
          </div>
          <p className="text-[11px] opacity-75">
            CodeAlpha AI Internship • Task 1: Language Translation Tool
          </p>
        </div>

        <nav className="flex items-center gap-6 text-xs font-medium">
          <button
            onClick={() => onTabChange('home')}
            className={`transition-colors cursor-pointer ${
              currentTab === 'home'
                ? isDarkMode
                  ? 'text-white font-semibold'
                  : 'text-indigo-600 font-semibold'
                : 'hover:text-indigo-400'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => onTabChange('translator')}
            className={`transition-colors cursor-pointer ${
              currentTab === 'translator'
                ? isDarkMode
                  ? 'text-white font-semibold'
                  : 'text-indigo-600 font-semibold'
                : 'hover:text-indigo-400'
            }`}
          >
            Translator
          </button>
          <button
            onClick={() => onTabChange('translation-history')}
            className={`transition-colors cursor-pointer ${
              currentTab === 'translation-history'
                ? isDarkMode
                  ? 'text-white font-semibold'
                  : 'text-indigo-600 font-semibold'
                : 'hover:text-indigo-400'
            }`}
          >
            History
          </button>
        </nav>
      </div>
    </footer>
  );
};
