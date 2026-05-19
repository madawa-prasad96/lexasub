import SQLite from 'react-native-sqlite-storage';
import { UserProfile, SavedMovieWordList, VocabWord, ExperienceLevel, TargetLanguage } from '../types';

SQLite.enablePromise(true);

let db: SQLite.SQLiteDatabase | null = null;

const getDb = async (): Promise<SQLite.SQLiteDatabase> => {
  if (!db) {
    db = await SQLite.openDatabase({ name: 'subtitlelearner.db', location: 'default' });
  }
  return db;
};

export const initializeDatabase = async (): Promise<void> => {
  const database = await getDb();

  await database.executeSql(`
    CREATE TABLE IF NOT EXISTS user_profile (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      experience_level TEXT NOT NULL,
      target_language_code TEXT NOT NULL,
      target_language_label TEXT NOT NULL,
      target_language_native_label TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  await database.executeSql(`
    CREATE TABLE IF NOT EXISTS saved_movies (
      id TEXT PRIMARY KEY,
      movie_name TEXT NOT NULL,
      saved_at TEXT NOT NULL,
      target_language TEXT NOT NULL,
      experience_level TEXT NOT NULL,
      total_words INTEGER NOT NULL,
      difficulty_estimate TEXT NOT NULL
    );
  `);

  await database.executeSql(`
    CREATE TABLE IF NOT EXISTS saved_words (
      id TEXT PRIMARY KEY,
      movie_id TEXT NOT NULL,
      word TEXT NOT NULL,
      translation TEXT NOT NULL,
      cefr_level TEXT NOT NULL,
      frequency INTEGER NOT NULL,
      timestamps TEXT NOT NULL,
      subtitle_lines TEXT NOT NULL,
      context_definition TEXT,
      cultural_note TEXT,
      example_sentence TEXT,
      FOREIGN KEY (movie_id) REFERENCES saved_movies(id) ON DELETE CASCADE
    );
  `);

  await database.executeSql(`
    CREATE TABLE IF NOT EXISTS translation_cache (
      word TEXT NOT NULL,
      target_language TEXT NOT NULL,
      translation TEXT NOT NULL,
      PRIMARY KEY (word, target_language)
    );
  `);
};

export const getUserProfile = async (): Promise<UserProfile | null> => {
  const database = await getDb();
  const [results] = await database.executeSql('SELECT * FROM user_profile LIMIT 1;');
  if (results.rows.length === 0) return null;
  const row = results.rows.item(0);
  return {
    id: row.id,
    name: row.name,
    experienceLevel: row.experience_level as ExperienceLevel,
    targetLanguage: {
      code: row.target_language_code,
      label: row.target_language_label,
      nativeLabel: row.target_language_native_label,
    },
    createdAt: row.created_at,
  };
};

export const saveUserProfile = async (profile: UserProfile): Promise<void> => {
  const database = await getDb();
  await database.executeSql(
    `INSERT OR REPLACE INTO user_profile
      (id, name, experience_level, target_language_code, target_language_label, target_language_native_label, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?);`,
    [
      profile.id,
      profile.name,
      profile.experienceLevel,
      profile.targetLanguage.code,
      profile.targetLanguage.label,
      profile.targetLanguage.nativeLabel,
      profile.createdAt,
    ],
  );
};

export const updateUserExperienceLevel = async (level: ExperienceLevel): Promise<void> => {
  const database = await getDb();
  await database.executeSql('UPDATE user_profile SET experience_level = ?;', [level]);
};

export const updateUserTargetLanguage = async (lang: TargetLanguage): Promise<void> => {
  const database = await getDb();
  await database.executeSql(
    'UPDATE user_profile SET target_language_code = ?, target_language_label = ?, target_language_native_label = ?;',
    [lang.code, lang.label, lang.nativeLabel],
  );
};

export const saveMovieWordList = async (movieList: SavedMovieWordList): Promise<void> => {
  const database = await getDb();
  await database.executeSql(
    `INSERT OR REPLACE INTO saved_movies (id, movie_name, saved_at, target_language, experience_level, total_words, difficulty_estimate)
     VALUES (?, ?, ?, ?, ?, ?, ?);`,
    [
      movieList.id,
      movieList.movieName,
      movieList.savedAt,
      movieList.targetLanguage,
      movieList.experienceLevel,
      movieList.totalWords,
      JSON.stringify(movieList.difficultyEstimate),
    ],
  );

  for (const word of movieList.words) {
    const wordId = `${movieList.id}_${word.word}`;
    await database.executeSql(
      `INSERT OR REPLACE INTO saved_words
        (id, movie_id, word, translation, cefr_level, frequency, timestamps, subtitle_lines, context_definition, cultural_note, example_sentence)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        wordId,
        movieList.id,
        word.word,
        word.translation,
        word.cefrLevel,
        word.frequency,
        JSON.stringify(word.timestamps),
        JSON.stringify(word.subtitleLines),
        word.contextDefinition ?? null,
        word.culturalNote ?? null,
        word.exampleSentence ?? null,
      ],
    );
  }
};

export const getAllSavedMovies = async (): Promise<Omit<SavedMovieWordList, 'words'>[]> => {
  const database = await getDb();
  const [results] = await database.executeSql('SELECT * FROM saved_movies ORDER BY saved_at DESC;');
  const movies: Omit<SavedMovieWordList, 'words'>[] = [];
  for (let i = 0; i < results.rows.length; i++) {
    const row = results.rows.item(i);
    movies.push({
      id: row.id,
      movieName: row.movie_name,
      savedAt: row.saved_at,
      targetLanguage: row.target_language,
      experienceLevel: row.experience_level as ExperienceLevel,
      totalWords: row.total_words,
      difficultyEstimate: JSON.parse(row.difficulty_estimate),
    });
  }
  return movies;
};

export const getMovieWordList = async (movieId: string): Promise<SavedMovieWordList> => {
  const database = await getDb();
  const [movieResults] = await database.executeSql('SELECT * FROM saved_movies WHERE id = ?;', [movieId]);
  if (movieResults.rows.length === 0) throw new Error(`Movie not found: ${movieId}`);
  const movieRow = movieResults.rows.item(0);

  const [wordResults] = await database.executeSql('SELECT * FROM saved_words WHERE movie_id = ?;', [movieId]);
  const words: VocabWord[] = [];
  for (let i = 0; i < wordResults.rows.length; i++) {
    const row = wordResults.rows.item(i);
    words.push({
      word: row.word,
      translation: row.translation,
      cefrLevel: row.cefr_level as VocabWord['cefrLevel'],
      frequency: row.frequency,
      timestamps: JSON.parse(row.timestamps),
      subtitleLines: JSON.parse(row.subtitle_lines),
      contextDefinition: row.context_definition ?? undefined,
      culturalNote: row.cultural_note ?? undefined,
      exampleSentence: row.example_sentence ?? undefined,
      isAILoaded: !!(row.context_definition),
    });
  }

  return {
    id: movieRow.id,
    movieName: movieRow.movie_name,
    savedAt: movieRow.saved_at,
    targetLanguage: movieRow.target_language,
    experienceLevel: movieRow.experience_level as ExperienceLevel,
    totalWords: movieRow.total_words,
    difficultyEstimate: JSON.parse(movieRow.difficulty_estimate),
    words,
  };
};

export const deleteMovieWordList = async (movieId: string): Promise<void> => {
  const database = await getDb();
  await database.executeSql('DELETE FROM saved_words WHERE movie_id = ?;', [movieId]);
  await database.executeSql('DELETE FROM saved_movies WHERE id = ?;', [movieId]);
};

export const getCachedTranslation = async (word: string, targetLang: string): Promise<string | null> => {
  try {
    const database = await getDb();
    const [results] = await database.executeSql(
      'SELECT translation FROM translation_cache WHERE word = ? AND target_language = ?;',
      [word, targetLang],
    );
    if (results.rows.length === 0) return null;
    return results.rows.item(0).translation;
  } catch {
    return null;
  }
};

export const cacheTranslations = async (
  entries: Array<{ word: string; translation: string }>,
  targetLang: string,
): Promise<void> => {
  const database = await getDb();
  for (const entry of entries) {
    await database.executeSql(
      'INSERT OR REPLACE INTO translation_cache (word, target_language, translation) VALUES (?, ?, ?);',
      [entry.word, targetLang, entry.translation],
    );
  }
};
