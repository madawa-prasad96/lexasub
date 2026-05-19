import { create } from 'zustand';
import { UserProfile, SavedMovieWordList, ExperienceLevel, TargetLanguage } from '../types';

interface UserStore {
  profile: UserProfile | null;
  savedMovies: Omit<SavedMovieWordList, 'words'>[];
  accessToken: string | null;
  isAuthenticated: boolean;
  setProfile: (profile: UserProfile) => void;
  setSavedMovies: (movies: Omit<SavedMovieWordList, 'words'>[]) => void;
  addSavedMovie: (movie: Omit<SavedMovieWordList, 'words'>) => void;
  removeSavedMovie: (movieId: string) => void;
  updateTargetLanguage: (lang: TargetLanguage) => void;
  updateExperienceLevel: (level: ExperienceLevel) => void;
  setAccessToken: (token: string | null) => void;
  setIsAuthenticated: (v: boolean) => void;
  signOut: () => void;
}

export const useUserStore = create<UserStore>(set => ({
  profile: null,
  savedMovies: [],
  accessToken: null,
  isAuthenticated: false,
  setProfile: profile => set({ profile }),
  setSavedMovies: savedMovies => set({ savedMovies }),
  addSavedMovie: movie =>
    set(state => ({ savedMovies: [movie, ...state.savedMovies] })),
  removeSavedMovie: movieId =>
    set(state => ({ savedMovies: state.savedMovies.filter(m => m.id !== movieId) })),
  updateTargetLanguage: lang =>
    set(state => ({
      profile: state.profile ? { ...state.profile, targetLanguage: lang } : null,
    })),
  updateExperienceLevel: level =>
    set(state => ({
      profile: state.profile ? { ...state.profile, experienceLevel: level } : null,
    })),
  setAccessToken: token => set({ accessToken: token }),
  setIsAuthenticated: v => set({ isAuthenticated: v }),
  signOut: () =>
    set({ profile: null, savedMovies: [], accessToken: null, isAuthenticated: false }),
}));
