import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini AI client
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize Gemini AI client:', err);
  }
}

// Language name mapping for clear instructions
const LANGUAGE_NAMES: Record<string, string> = {
  auto: 'Auto Detect',
  en: 'English',
  kn: 'Kannada',
  hi: 'Hindi',
  te: 'Telugu',
  ta: 'Tamil',
  ml: 'Malayalam',
  mr: 'Marathi',
  bn: 'Bengali',
  gu: 'Gujarati',
  pa: 'Punjabi',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  ja: 'Japanese',
  ko: 'Korean',
  zh: 'Chinese',
  ar: 'Arabic',
};

// Clean up any extra wrapper quotes or thought commentary if present
function cleanOutput(text: string): string {
  let cleaned = text.trim();

  // If the model output multiple lines where the last line is the actual translation, extract it
  const lines = cleaned.split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length > 1) {
    // Check if previous lines were commentary like "(Wait, let me give...)"
    const filtered = lines.filter(
      (l) =>
        !l.toLowerCase().startsWith('wait') &&
        !l.toLowerCase().startsWith('here is') &&
        !l.toLowerCase().startsWith('note:') &&
        !l.toLowerCase().startsWith('kannada translation:') &&
        !l.toLowerCase().startsWith('translation:')
    );
    if (filtered.length > 0) {
      cleaned = filtered[filtered.length - 1];
    }
  }

  // Strip outer quotes if wrapped
  if (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith('“') && cleaned.endsWith('”')) ||
    (cleaned.startsWith("'") && cleaned.endsWith("'"))
  ) {
    cleaned = cleaned.slice(1, -1).trim();
  }

  return cleaned;
}

// Core translation handler
async function handleTranslation(req: Request, res: Response) {
  const { text, source_language = 'auto', target_language = 'kn' } = req.body;

  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({
      status: 'error',
      message: 'Please enter text to translate.',
    });
  }

  const cleanText = text.trim();

  // If source and target are the same language, return original text
  if (source_language !== 'auto' && source_language === target_language) {
    return res.json({
      status: 'success',
      translated_text: cleanText,
      detected_source: source_language,
      target_language,
    });
  }

  if (!aiClient) {
    return res.status(500).json({
      status: 'error',
      message: 'Translation failed. Please try again.',
    });
  }

  const srcName = LANGUAGE_NAMES[source_language] || source_language;
  const tgtName = LANGUAGE_NAMES[target_language] || target_language;

  const systemInstruction = `You are an expert, accurate, and natural language translator.
Translate the user input into ${tgtName} (in authentic native script).
${source_language !== 'auto' ? `The source language is ${srcName}.` : 'Automatically detect the source language.'}

STRICT INSTRUCTIONS:
1. Return strictly ONLY the final translated text in the native script (e.g. native Kannada, Hindi, Telugu, Tamil, etc.).
2. Do NOT output thoughts, reasoning, self-corrections, prefixes, greetings, transliterations, pronunciation guides, or notes.
3. Do NOT wrap the translation in quotation marks.
4. Faithfully preserve meaning, context, sentence structure, proper names, numbers, and punctuation.`;

  // Candidate models chain for maximum uptime and fast response
  const candidateModels = [
    'gemini-3.5-flash-lite',
    'gemini-3.8-flash',
    'gemini-3.1-flash-lite',
  ];

  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      const response = await aiClient.models.generateContent({
        model,
        contents: cleanText,
        config: {
          systemInstruction,
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.LOW,
          },
        },
      });

      const rawText = response.text?.trim();
      if (rawText) {
        const finalText = cleanOutput(rawText);
        return res.json({
          status: 'success',
          translated_text: finalText,
          detected_source: source_language === 'auto' ? 'en' : source_language,
          target_language,
          model,
        });
      }
    } catch (err: any) {
      console.warn(`Translation attempt with model ${model} failed:`, err?.message || err);
      lastError = err;
    }
  }

  console.error('All translation candidate models failed:', lastError);
  return res.status(500).json({
    status: 'error',
    message: 'Translation failed. Please try again.',
  });
}

// Routes
app.post('/translate', handleTranslation);
app.post('/api/translate', handleTranslation);

// High-speed Text-to-Speech endpoint (native speech for Kannada, Telugu, Tamil, Hindi, etc.)
app.post(['/api/tts', '/tts'], async (req: Request, res: Response) => {
  const { text, language = 'kn' } = req.body;
  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ status: 'error', message: 'Text is required for TTS' });
  }

  const cleanText = text.trim();
  const langCode = (language || 'en').split('-')[0].toLowerCase();

  try {
    // 1. Primary: High-speed Google TTS proxy (supports Kannada, Telugu, Tamil, Hindi, Spanish, English, etc.)
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanText)}&tl=${langCode}&client=tw-ob`;
    const ttsResponse = await fetch(ttsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Referer': 'https://translate.google.com/',
      },
    });

    if (ttsResponse.ok) {
      const buffer = await ttsResponse.arrayBuffer();
      if (buffer.byteLength > 0) {
        const base64Audio = Buffer.from(buffer).toString('base64');
        return res.json({
          status: 'success',
          audioBase64: base64Audio,
          mimeType: 'audio/mpeg',
        });
      }
    }
  } catch (err: any) {
    console.warn('TTS fetch error:', err?.message || err);
  }

  return res.status(500).json({
    status: 'error',
    message: 'Server TTS unavailable',
  });
});

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'operational',
    service: 'LinguaFlow AI Translation Gateway',
    version: '1.0.4',
    gemini_enabled: Boolean(aiClient),
  });
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true, port: PORT },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LinguaFlow AI Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
