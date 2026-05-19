import { ExperienceLevel, VocabWord } from '../types';
import { CEFR_WORDS, STOP_WORDS } from '../utils/cefrWordList';

export const SKIP_LEVELS: Record<ExperienceLevel, string[]> = {
  Beginner: [],
  Elementary: ['A1'],
  Intermediate: ['A1', 'A2'],
  Advanced: ['A1', 'A2', 'B1'],
};

export const getCEFRLevel = (word: string): VocabWord['cefrLevel'] => {
  const lower = word.toLowerCase();
  return CEFR_WORDS[lower] ?? 'Unknown';
};

export const filterWords = (words: string[], level: ExperienceLevel): string[] => {
  const skipLevels = SKIP_LEVELS[level];
  return words.filter(word => {
    const lower = word.toLowerCase();
    if (STOP_WORDS.has(lower)) return false;
    const cefrLevel = getCEFRLevel(lower);
    if (skipLevels.includes(cefrLevel)) return false;
    return true;
  });
};
