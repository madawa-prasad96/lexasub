export interface SubtitleEntry {
  id: number;
  startTime: string;
  endTime: string;
  text: string;
}

export interface VocabWord {
  word: string;
  timestamps: string[];
  subtitleLines: string[];
  translation: string;
  cefrLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'Unknown';
  frequency: number;
  contextDefinition?: string;
  culturalNote?: string;
  exampleSentence?: string;
  isAILoaded: boolean;
}

export interface MovieDifficulty {
  overallDifficulty: 'Easy' | 'Moderate' | 'Challenging' | 'Very Hard';
  difficultyScore: number;
  cefrBreakdown: Record<string, number>;
  estimatedNewWords: number;
  verdict: string;
}

export interface SavedMovieWordList {
  id: string;
  movieName: string;
  savedAt: string;
  targetLanguage: string;
  experienceLevel: ExperienceLevel;
  totalWords: number;
  words: VocabWord[];
  difficultyEstimate: MovieDifficulty;
}

export type ExperienceLevel = 'Beginner' | 'Elementary' | 'Intermediate' | 'Advanced';

export interface TargetLanguage {
  code: string;
  label: string;
  nativeLabel: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  experienceLevel: ExperienceLevel;
  targetLanguage: TargetLanguage;
  createdAt: string;
}
