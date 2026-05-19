import { BACKEND_URL } from '../config';
import { SavedMovieWordList } from '../types';
import { getTokens } from './storageService';
import { refreshAccessToken } from './authService';

const authFetch = async (path: string, options: RequestInit = {}): Promise<Response> => {
  const tokens = await getTokens();
  let token = tokens?.accessToken;

  const makeRequest = (t: string) =>
    fetch(`${BACKEND_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${t}`,
        ...(options.headers ?? {}),
      },
    });

  let res = await makeRequest(token ?? '');

  if (res.status === 401) {
    const newToken = await refreshAccessToken();
    if (!newToken) throw new Error('Session expired. Please log in again.');
    res = await makeRequest(newToken);
  }

  return res;
};

export const saveMovieToBackend = async (movie: SavedMovieWordList): Promise<SavedMovieWordList> => {
  const res = await authFetch('/movies', {
    method: 'POST',
    body: JSON.stringify({
      movieName: movie.movieName,
      targetLanguage: movie.targetLanguage,
      experienceLevel: movie.experienceLevel,
      totalWords: movie.totalWords,
      difficultyEstimate: movie.difficultyEstimate,
      words: movie.words,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? 'Failed to save movie');
  }
  return res.json();
};

export const getMoviesFromBackend = async (): Promise<Omit<SavedMovieWordList, 'words'>[]> => {
  const res = await authFetch('/movies');
  if (!res.ok) throw new Error('Failed to fetch movies');
  return res.json();
};

export const getMovieFromBackend = async (movieId: string): Promise<SavedMovieWordList> => {
  const res = await authFetch(`/movies/${movieId}`);
  if (!res.ok) throw new Error('Failed to fetch movie');
  return res.json();
};

export const deleteMovieFromBackend = async (movieId: string): Promise<void> => {
  const res = await authFetch(`/movies/${movieId}`, { method: 'DELETE' });
  if (!res.ok && res.status !== 204) throw new Error('Failed to delete movie');
};
