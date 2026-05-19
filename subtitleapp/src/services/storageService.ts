import RNFS from 'react-native-fs';

const TOKENS_PATH = `${RNFS.DocumentDirectoryPath}/auth.json`;
const CACHE_PATH = `${RNFS.DocumentDirectoryPath}/trans_cache.json`;

export interface StoredTokens {
  accessToken: string;
  refreshToken: string;
}

export const saveTokens = async (tokens: StoredTokens): Promise<void> => {
  await RNFS.writeFile(TOKENS_PATH, JSON.stringify(tokens), 'utf8');
};

export const getTokens = async (): Promise<StoredTokens | null> => {
  try {
    const exists = await RNFS.exists(TOKENS_PATH);
    if (!exists) return null;
    return JSON.parse(await RNFS.readFile(TOKENS_PATH, 'utf8'));
  } catch {
    return null;
  }
};

export const clearTokens = async (): Promise<void> => {
  try {
    const exists = await RNFS.exists(TOKENS_PATH);
    if (exists) await RNFS.unlink(TOKENS_PATH);
  } catch {}
};

export const getCachedTranslation = async (word: string, lang: string): Promise<string | null> => {
  try {
    const exists = await RNFS.exists(CACHE_PATH);
    if (!exists) return null;
    const cache: Record<string, string> = JSON.parse(await RNFS.readFile(CACHE_PATH, 'utf8'));
    return cache[`${lang}:${word}`] ?? null;
  } catch {
    return null;
  }
};

export const cacheTranslations = async (
  entries: Array<{ word: string; translation: string }>,
  lang: string,
): Promise<void> => {
  try {
    let cache: Record<string, string> = {};
    const exists = await RNFS.exists(CACHE_PATH);
    if (exists) cache = JSON.parse(await RNFS.readFile(CACHE_PATH, 'utf8'));
    entries.forEach(({ word, translation }) => {
      cache[`${lang}:${word}`] = translation;
    });
    await RNFS.writeFile(CACHE_PATH, JSON.stringify(cache), 'utf8');
  } catch {}
};
