import { SubtitleEntry, ExperienceLevel, MovieDifficulty, TargetLanguage, VocabWord } from '../types';
import { stripHtmlTags, stripSubtitleFormatting, cleanWord } from '../utils/textCleaner';
import { calculateMovieDifficulty } from './difficultyService';
import { filterWords, getCEFRLevel } from './wordFilterService';
import { translateWords } from './translationService';
import { fetchContextDefinitions } from './aiService';

export const parseSRT = (content: string): SubtitleEntry[] => {
  const blocks = content.split(/\r?\n\r?\n/).filter(b => b.trim());
  const entries: SubtitleEntry[] = [];

  for (const block of blocks) {
    const lines = block.split(/\r?\n/).map(l => l.trim()).filter(l => l);
    if (lines.length < 3) continue;

    const idLine = lines[0];
    const id = parseInt(idLine, 10);
    if (isNaN(id)) continue;

    const timeLine = lines[1];
    const timeMatch = timeLine.match(
      /(\d{2}:\d{2}:\d{2}[,\.]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[,\.]\d{3})/,
    );
    if (!timeMatch) continue;

    const startTime = timeMatch[1].replace('.', ',');
    const endTime = timeMatch[2].replace('.', ',');
    const rawText = lines.slice(2).join(' ');
    const text = stripSubtitleFormatting(stripHtmlTags(rawText));

    if (text) {
      entries.push({ id, startTime, endTime, text });
    }
  }

  return entries;
};

export const parseVTT = (content: string): SubtitleEntry[] => {
  const lines = content.split(/\r?\n/);
  const normalizedLines: string[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    if (line === 'WEBVTT' || line.startsWith('NOTE') || line.startsWith('STYLE')) {
      while (i < lines.length && lines[i].trim() !== '') i++;
    } else {
      normalizedLines.push(line);
    }
    i++;
  }

  const normalizedContent = normalizedLines.join('\n');
  const withCommas = normalizedContent.replace(
    /(\d{2}:\d{2}:\d{2})\.(\d{3})/g,
    '$1,$2',
  );

  return parseSRT(withCommas);
};

export const extractWordTimestampMap = (
  entries: SubtitleEntry[],
): {
  wordMap: Record<string, { timestamps: string[]; subtitleLines: string[] }>;
  likelyProperNouns: Set<string>;
} => {
  const wordMap: Record<string, { timestamps: Set<string>; subtitleLines: Set<string> }> = {};
  const totalCount: Record<string, number> = {};
  const capitalizedCount: Record<string, number> = {};

  for (const entry of entries) {
    const rawWords = entry.text.split(/\s+/);
    for (const rawWord of rawWords) {
      const word = cleanWord(rawWord);
      if (!word || word.length < 3) continue;

      const firstChar = rawWord[0];
      const startsUpper =
        firstChar !== undefined &&
        firstChar === firstChar.toUpperCase() &&
        firstChar !== firstChar.toLowerCase();

      totalCount[word] = (totalCount[word] ?? 0) + 1;
      if (startsUpper) capitalizedCount[word] = (capitalizedCount[word] ?? 0) + 1;

      if (!wordMap[word]) {
        wordMap[word] = { timestamps: new Set(), subtitleLines: new Set() };
      }
      wordMap[word].timestamps.add(entry.startTime);
      wordMap[word].subtitleLines.add(entry.text);
    }
  }

  // Words appearing capitalized ≥80% of the time (and seen ≥2×) are likely proper nouns
  const likelyProperNouns = new Set<string>();
  for (const [word, total] of Object.entries(totalCount)) {
    const capCount = capitalizedCount[word] ?? 0;
    if (total >= 2 && capCount / total >= 0.8) {
      likelyProperNouns.add(word);
    }
  }

  const result: Record<string, { timestamps: string[]; subtitleLines: string[] }> = {};
  for (const [word, data] of Object.entries(wordMap)) {
    result[word] = {
      timestamps: Array.from(data.timestamps),
      subtitleLines: Array.from(data.subtitleLines),
    };
  }
  return { wordMap: result, likelyProperNouns };
};

export const processSubtitleFile = async (
  fileContent: string,
  fileExtension: 'srt' | 'vtt',
  movieName: string,
  targetLanguage: TargetLanguage,
  experienceLevel: ExperienceLevel,
  onStep: (step: string) => void,
  onWordsReady: (words: VocabWord[], difficulty: MovieDifficulty) => void,
  onAIUpdate: (word: string, contextDefinition: string, culturalNote: string | null, exampleSentence: string) => void,
): Promise<void> => {
  onStep('Parsing subtitle file...');
  const entries = fileExtension === 'srt' ? parseSRT(fileContent) : parseVTT(fileContent);

  onStep('Extracting vocabulary...');
  const extracted = extractWordTimestampMap(entries);
  const wordMap = extracted.wordMap;
  const likelyProperNouns = extracted.likelyProperNouns;

  onStep('Calculating movie difficulty...');
  const allWords = Object.keys(wordMap).filter(w => !likelyProperNouns.has(w));
  const difficulty = calculateMovieDifficulty(allWords, experienceLevel);

  onStep('Filtering words for your level...');
  const filteredWords = filterWords(allWords, experienceLevel);

  onStep('Translating words...');
  const translations = await translateWords(filteredWords, targetLanguage.code);

  const vocabWords: VocabWord[] = filteredWords
    .map(word => ({
      word,
      timestamps: wordMap[word].timestamps,
      subtitleLines: wordMap[word].subtitleLines,
      translation: translations[word] ?? '',
      cefrLevel: getCEFRLevel(word),
      frequency: wordMap[word].timestamps.length,
      isAILoaded: false,
    }))
    .sort((a, b) => b.frequency - a.frequency);

  onWordsReady(vocabWords, difficulty);

  onStep('Loading AI context definitions...');
  try {
    const top50 = vocabWords.slice(0, 50);
    const aiData = await fetchContextDefinitions(top50, movieName, targetLanguage.label, experienceLevel);
    Object.entries(aiData).forEach(([word, def]) => {
      onAIUpdate(word, def.contextDefinition, def.culturalNote, def.exampleSentence);
    });
  } catch (err) {
    console.warn('AI context definitions unavailable:', err);
  }
};
