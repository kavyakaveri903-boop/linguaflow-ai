export type NavTab = 'home' | 'translator' | 'translation-history';

export interface TranslationRecord {
  id: string;
  sourceText: string;
  translatedText: string;
  sourceLang: string;
  sourceLangLabel: string;
  targetLang: string;
  targetLangLabel: string;
  timestamp: string;
  model: string;
  confidence: number;
  latencyMs: number;
}

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  speechCode: string;
  flag?: string;
}

export interface TranslationResponse {
  status: 'success' | 'error';
  translated_text: string;
  detected_source?: string;
  target_language?: string;
  latency_ms?: number;
  model?: string;
  confidence?: number;
  message?: string;
}
