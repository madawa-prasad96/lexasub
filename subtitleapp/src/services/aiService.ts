import { VocabWord, ExperienceLevel } from '../types';
import { BACKEND_URL } from '../config';

export interface AIWordDefinition {
  word: string;
  contextDefinition: string;
  culturalNote: string | null;
  exampleSentence: string;
}

export const fetchContextDefinitions = async (
  words: VocabWord[],
  movieName: string,
  targetLanguage: string,
  experienceLevel: ExperienceLevel,
): Promise<Record<string, AIWordDefinition>> => {
  const subtitleLines: Record<string, string> = {};
  words.forEach(w => {
    subtitleLines[w.word] = w.subtitleLines[0] ?? '';
  });

  const response = await fetch(`${BACKEND_URL}/ai/context-definitions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      words: words.map(w => w.word),
      subtitleLines,
      targetLanguage,
      experienceLevel,
      movieName,
    }),
  });

  if (!response.ok) throw new Error(`AI service error: ${response.status}`);

  const data = await response.json();
  const result: Record<string, AIWordDefinition> = {};
  (data.definitions as AIWordDefinition[]).forEach(d => {
    result[d.word] = d;
  });
  return result;
};
