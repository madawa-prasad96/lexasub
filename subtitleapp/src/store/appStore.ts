import { create } from 'zustand';
import { SubtitleEntry, VocabWord, MovieDifficulty } from '../types';

interface AppStore {
  currentSubtitleEntries: SubtitleEntry[];
  currentVocabWords: VocabWord[];
  currentMovieName: string;
  currentDifficulty: MovieDifficulty | null;
  isProcessing: boolean;
  processingStep: string;
  setSubtitleEntries: (entries: SubtitleEntry[]) => void;
  setVocabWords: (words: VocabWord[]) => void;
  setCurrentMovieName: (name: string) => void;
  setCurrentDifficulty: (difficulty: MovieDifficulty) => void;
  setIsProcessing: (loading: boolean) => void;
  setProcessingStep: (step: string) => void;
  updateWordAIData: (
    word: string,
    contextDefinition: string,
    culturalNote: string | null,
    exampleSentence: string,
  ) => void;
  resetSession: () => void;
}

export const useAppStore = create<AppStore>(set => ({
  currentSubtitleEntries: [],
  currentVocabWords: [],
  currentMovieName: '',
  currentDifficulty: null,
  isProcessing: false,
  processingStep: '',
  setSubtitleEntries: entries => set({ currentSubtitleEntries: entries }),
  setVocabWords: words => set({ currentVocabWords: words }),
  setCurrentMovieName: name => set({ currentMovieName: name }),
  setCurrentDifficulty: difficulty => set({ currentDifficulty: difficulty }),
  setIsProcessing: loading => set({ isProcessing: loading }),
  setProcessingStep: step => set({ processingStep: step }),
  updateWordAIData: (word, contextDefinition, culturalNote, exampleSentence) =>
    set(state => ({
      currentVocabWords: state.currentVocabWords.map(w =>
        w.word === word
          ? { ...w, contextDefinition, culturalNote: culturalNote ?? undefined, exampleSentence, isAILoaded: true }
          : w,
      ),
    })),
  resetSession: () =>
    set({
      currentSubtitleEntries: [],
      currentVocabWords: [],
      currentMovieName: '',
      currentDifficulty: null,
      isProcessing: false,
      processingStep: '',
    }),
}));
