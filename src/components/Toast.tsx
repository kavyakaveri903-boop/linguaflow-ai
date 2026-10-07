import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface ToastProps {
  message: string;
  isError?: boolean;
  isVisible: boolean;
  isDarkMode: boolean;
}

export const Toast: React.FC<ToastProps> = ({ message, isError, isVisible, isDarkMode }) => {
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 transform transition-all duration-300 pointer-events-none rounded-xl border px-4 py-3 shadow-xl flex items-center gap-2.5 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      } ${
        isDarkMode
          ? 'bg-[#0D1B2A] border-[#1E293B] text-white'
          : 'bg-white border-[#E2E8F0] text-[#111827]'
      }`}
    >
      {isError ? (
        <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
      ) : (
        <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
      )}
      <span className="text-xs font-medium">{message}</span>
    </div>
  );
};
