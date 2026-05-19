import { ExperienceLevel, MovieDifficulty } from '../types';
import { getCEFRLevel } from './wordFilterService';
import { SKIP_LEVELS } from './wordFilterService';

const WEIGHTS: Record<string, number> = {
  A1: 1, A2: 2, B1: 4, B2: 6, C1: 8, C2: 10, Unknown: 7,
};

const buildVerdict = (
  difficulty: string,
  newWords: number,
  _level: ExperienceLevel,
  breakdown: Record<string, number>,
): string => {
  const dominantLevel = Object.entries(breakdown)
    .filter(([k]) => k !== 'Unknown')
    .sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'B1';

  const verdicts: Record<string, string> = {
    Easy: `This film is well within your comfort zone with ~${newWords} new words, mostly ${dominantLevel} level.`,
    Moderate: `A good match for your level — expect ~${newWords} new words to learn, mostly ${dominantLevel}.`,
    Challenging: `This will push you! Around ${newWords} new words await, with heavy ${dominantLevel} vocabulary.`,
    'Very Hard': `This is a serious challenge — ${newWords} unfamiliar words, lots of ${dominantLevel}+ content.`,
  };
  return verdicts[difficulty] ?? verdicts['Moderate'];
};

export const calculateMovieDifficulty = (
  allWords: string[],
  experienceLevel: ExperienceLevel,
): MovieDifficulty => {
  const levelCounts: Record<string, number> = {
    A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0, Unknown: 0,
  };

  allWords.forEach(word => {
    const level = getCEFRLevel(word);
    levelCounts[level] = (levelCounts[level] ?? 0) + 1;
  });

  const total = allWords.length || 1;
  const cefrBreakdown: Record<string, number> = {};
  Object.keys(levelCounts).forEach(level => {
    cefrBreakdown[level] = Math.round((levelCounts[level] / total) * 100);
  });

  const skipLevels = SKIP_LEVELS[experienceLevel];
  const estimatedNewWords = allWords.filter(w => {
    const lvl = getCEFRLevel(w);
    return lvl === 'Unknown' || !skipLevels.includes(lvl);
  }).length;

  const weightedScore = Object.keys(levelCounts).reduce((sum, level) => {
    return sum + (levelCounts[level] / total) * (WEIGHTS[level] ?? 5);
  }, 0);
  const difficultyScore = Math.min(10, Math.max(1, Math.round(weightedScore)));

  let overallDifficulty: MovieDifficulty['overallDifficulty'];
  if (difficultyScore <= 3) overallDifficulty = 'Easy';
  else if (difficultyScore <= 5) overallDifficulty = 'Moderate';
  else if (difficultyScore <= 7) overallDifficulty = 'Challenging';
  else overallDifficulty = 'Very Hard';

  const verdict = buildVerdict(overallDifficulty, estimatedNewWords, experienceLevel, cefrBreakdown);

  return { overallDifficulty, difficultyScore, cefrBreakdown, estimatedNewWords, verdict };
};
