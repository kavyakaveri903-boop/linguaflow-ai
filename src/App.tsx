/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { NavTab, TranslationRecord } from './types';
import { INITIAL_HISTORY_RECORDS } from './data/initialHistory';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomeView } from './components/HomeView';
import { TranslatorView } from './components/TranslatorView';
import { HistoryView } from './components/HistoryView';
import { Toast } from './components/Toast';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const savedTheme = localStorage.getItem('linguaflow_theme');
      if (savedTheme !== null) {
        return savedTheme === 'dark';
      }
    } catch {
      // ignore
    }
    return true;
  });

  const [targetLangOverride, setTargetLangOverride] = useState<string | undefined>(undefined);

  // Sync theme to document element & localStorage
  useEffect(() => {
    try {
      localStorage.setItem('linguaflow_theme', isDarkMode ? 'dark' : 'light');
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch {
      // ignore
    }
  }, [isDarkMode]);

  // Initialize history from localStorage or fallback to seed records
  const [history, setHistory] = useState<TranslationRecord[]>(() => {
    try {
      const saved = localStorage.getItem('linguaflow_history');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (err) {
      console.warn('Could not read history from localStorage', err);
    }
    return INITIAL_HISTORY_RECORDS;
  });

  // Sync history changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('linguaflow_history', JSON.stringify(history));
    } catch (err) {
      console.warn('Could not write history to localStorage', err);
    }
  }, [history]);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastIsError, setToastIsError] = useState<boolean>(false);
  const [toastVisible, setToastVisible] = useState<boolean>(false);

  const showToast = (message: string, isError: boolean = false) => {
    setToastMessage(message);
    setToastIsError(isError);
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
    }, 2800);
  };

  const handleNavigateToTranslator = (targetLang?: string) => {
    if (targetLang) {
      setTargetLangOverride(targetLang);
    }
    setCurrentTab('translator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveTranslation = (record: TranslationRecord) => {
    setHistory((prev) => [record, ...prev.slice(0, 29)]);
  };

  const handleDeleteRecord = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
    showToast('Deleted translation entry');
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        isDarkMode ? 'bg-[#07111F] text-white' : 'bg-[#F6F8FC] text-[#111827]'
      }`}
    >
      <Navbar
        currentTab={currentTab}
        onTabChange={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
      />

      <main className="w-full pt-16 flex-1 flex flex-col transition-colors duration-200">
        {currentTab === 'home' && (
          <HomeView
            onNavigateToTranslator={handleNavigateToTranslator}
            isDarkMode={isDarkMode}
          />
        )}

        {currentTab === 'translator' && (
          <TranslatorView
            initialTargetLang={targetLangOverride}
            onSaveTranslation={handleSaveTranslation}
            onShowToast={showToast}
            isDarkMode={isDarkMode}
          />
        )}

        {currentTab === 'translation-history' && (
          <HistoryView
            history={history}
            onDeleteRecord={handleDeleteRecord}
            onClearHistory={handleClearHistory}
            onNavigateToTranslator={() => handleNavigateToTranslator()}
            onShowToast={showToast}
            isDarkMode={isDarkMode}
          />
        )}
      </main>

      <Footer
        currentTab={currentTab}
        onTabChange={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        isDarkMode={isDarkMode}
      />

      <Toast
        message={toastMessage}
        isError={toastIsError}
        isVisible={toastVisible}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}
