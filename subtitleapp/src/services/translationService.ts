import { TargetLanguage } from '../types';
import { GOOGLE_TRANSLATE_API_KEY } from '../config';
import { getCachedTranslation, cacheTranslations } from './storageService';

export const SUPPORTED_LANGUAGES: TargetLanguage[] = [
  { code: 'si', label: 'Sinhala', nativeLabel: 'සිංහල' },
  { code: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்' },
  { code: 'ja', label: 'Japanese', nativeLabel: '日本語' },
  { code: 'ko', label: 'Korean', nativeLabel: '한국어' },
  { code: 'zh', label: 'Chinese', nativeLabel: '中文' },
  { code: 'es', label: 'Spanish', nativeLabel: 'Español' },
  { code: 'fr', label: 'French', nativeLabel: 'Français' },
  { code: 'de', label: 'German', nativeLabel: 'Deutsch' },
  { code: 'ar', label: 'Arabic', nativeLabel: 'العربية' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी' },
  { code: 'pt', label: 'Portuguese', nativeLabel: 'Português' },
  { code: 'ru', label: 'Russian', nativeLabel: 'Русский' },
];

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const translateBatch = async (
  words: string[],
  targetLangCode: string,
  retries = 3,
): Promise<Record<string, string>> => {
  const url = `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_TRANSLATE_API_KEY}`;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q: words,
          source: 'en',
          target: targetLangCode,
          format: 'text',
        }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      const translations = data.data?.translations ?? [];
      const result: Record<string, string> = {};
      words.forEach((word, idx) => {
        result[word] = translations[idx]?.translatedText ?? word;
      });
      return result;
    } catch (err) {
      if (attempt < retries - 1) {
        await sleep(Math.pow(2, attempt) * 1000);
      } else {
        throw err;
      }
    }
  }
  return {};
};

export const translateWords = async (
  words: string[],
  targetLangCode: string,
): Promise<Record<string, string>> => {
  const result: Record<string, string> = {};
  const uncachedWords: string[] = [];

  for (const word of words) {
    const cached = await getCachedTranslation(word, targetLangCode);
    if (cached !== null) {
      result[word] = cached;
    } else {
      uncachedWords.push(word);
    }
  }

  const BATCH_SIZE = 100;
  for (let i = 0; i < uncachedWords.length; i += BATCH_SIZE) {
    const batch = uncachedWords.slice(i, i + BATCH_SIZE);
    try {
      const batchResult = await translateBatch(batch, targetLangCode);
      Object.assign(result, batchResult);

      const cacheEntries = Object.entries(batchResult).map(([word, translation]) => ({
        word,
        translation,
      }));
      await cacheTranslations(cacheEntries, targetLangCode);
    } catch (err) {
      console.warn('Translation batch failed:', err);
      batch.forEach(word => { result[word] = word; });
    }
  }

  return result;
};
