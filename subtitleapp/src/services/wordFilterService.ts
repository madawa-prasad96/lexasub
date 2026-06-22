import { ExperienceLevel, VocabWord } from '../types';
import { CEFR_WORDS, STOP_WORDS } from '../utils/cefrWordList';

export const SKIP_LEVELS: Record<ExperienceLevel, string[]> = {
  Beginner:     ['C1', 'C2'],         // show A1, A2, B1, B2, Unknown
  Elementary:   ['A1', 'C2'],         // show A2, B1, B2, C1, Unknown
  Intermediate: ['A1', 'A2'],         // show B1, B2, C1, C2, Unknown
  Advanced:     ['A1', 'A2', 'B1'],   // show B2, C1, C2, Unknown
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
