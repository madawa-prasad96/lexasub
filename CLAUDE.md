# LexSub — SubtitleLearner

A vocabulary learning mobile app that extracts and teaches words from movie subtitle files (.srt / .vtt). Users upload subtitles, get a word list filtered to their CEFR level, with translations and AI-enriched context definitions, then can save and study them.

## Repository Layout

```
lexsub/
├── subtitleapp/   React Native 0.85.1 mobile app (iOS + Android)
└── subbackend/    NestJS 10 REST API
```

## Tech Stack

| Layer | Stack |
|---|---|
| Mobile | React Native 0.85.1, TypeScript, React Navigation v7 |
| State | Zustand (`appStore`, `userStore`) |
| Backend | NestJS 10, TypeScript |
| ORM / DB | Prisma + PostgreSQL |
| Auth | JWT (access 15m / refresh 7d) + Google OAuth |
| AI | Google Gemini 2.0 Flash (`@google/generative-ai`) |
| Translation | Google Translate REST API |

## Running the Project

**Backend**
```bash
cd subbackend
npm run start:dev      # watch mode on port 3001
```

**Frontend**
```bash
cd subtitleapp
npm start              # Metro bundler
npm run ios            # or: npm run android
npm run start:reset    # clears Metro cache
```

## Backend (`subbackend/`)

### Entry & Modules

`src/app.module.ts` wires four feature modules:
- `AuthModule` — register, login, Google OAuth, refresh, logout, `/auth/me`
- `UsersModule` — `PATCH /users/me/preferences`
- `MoviesModule` — CRUD saved movies with word lists (all routes JWT-guarded)
- `AiModule` — `POST /api/ai/context-definitions` (Gemini, in-memory cache)

API is prefixed at `/api`. Backend listens on `PORT` env var (default 3001).

### Database Schema (Prisma / PostgreSQL)

```
User          — id, email, name, password?, googleId?, avatar?,
                experienceLevel (default "Intermediate"),
                targetLangCode/Label/Native (default Sinhala)
RefreshToken  — id, token, userId, expiresAt
SavedMovie    — id, userId, movieName, targetLanguage, experienceLevel,
                totalWords, difficultyEstimate (JSON)
Word          — id, movieId, word, translation, cefrLevel, frequency,
                timestamps (JSON), subtitleLines (JSON),
                contextDefinition?, culturalNote?, exampleSentence?
```

Run migrations: `npx prisma migrate dev` from `subbackend/`.

### Environment (`subbackend/.env`)

```
DATABASE_URL=postgresql://...
GEMINI_API_KEY=...
JWT_SECRET=...
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=...
JWT_REFRESH_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=...
PORT=3001
```

### AI Service

`src/ai/ai.service.ts` — batches words in groups of 10, calls Gemini 2.0 Flash for context-aware definitions, cultural notes, and example sentences. Results are cached in-memory keyed by `movieName:word:targetLanguage`.

## Frontend (`subtitleapp/`)

### Source Layout

```
src/
├── types/index.ts          Core interfaces: SubtitleEntry, VocabWord, MovieDifficulty, etc.
├── config.ts               BACKEND_URL, Google API keys
├── navigation/AppNavigator.tsx  Route tree (see below)
├── store/
│   ├── appStore.ts         Current subtitle session state
│   └── userStore.ts        Auth state, profile, saved movies list
├── services/
│   ├── subtitleParser.ts   SRT/VTT parser + full processing pipeline
│   ├── wordFilterService.ts CEFR filtering + level assignment
│   ├── translationService.ts Google Translate API calls
│   ├── difficultyService.ts Movie difficulty scoring
│   ├── aiService.ts        Calls backend /ai/context-definitions
│   ├── authService.ts      Backend auth + Google Sign-In
│   ├── moviesApiService.ts Backend movies CRUD
│   ├── storageService.ts   AsyncStorage for tokens
│   └── databaseService.ts  Local persistence helpers
├── screens/                One file per screen (see navigation)
├── components/             WordCard, StudyFlashcard, AIInsightCard, etc.
└── utils/                  cefrWordList, textCleaner, helpers
```

### Navigation Structure

```
AppNavigator
├── AuthNavigator (when not authenticated)
│   ├── LoginScreen
│   └── RegisterScreen
└── MainTabs (when authenticated)
    ├── HomeStack
    │   ├── HomeScreen         — file picker, language/level selector, triggers processing
    │   ├── VocabListScreen    — word list for current session
    │   └── WordDetailScreen   — single word: translation, CEFR, AI definition, timestamps
    ├── MoviesStack
    │   ├── SavedMoviesScreen  — list of saved movies from backend
    │   ├── MovieWordListScreen — word list for a saved movie
    │   ├── WordDetailScreen
    │   └── StudyScreen        — flashcard study mode
    └── ProfileScreen          — experience level + target language settings
```

### Subtitle Processing Pipeline

`subtitleParser.ts → processSubtitleFile()`:
1. Parse SRT/VTT → `SubtitleEntry[]`
2. Extract word→timestamp map
3. Calculate movie difficulty score
4. Filter words by user's experience/CEFR level
5. Translate filtered words via Google Translate
6. Post words to `appStore` (UI renders immediately)
7. Fetch AI context definitions for top 50 words from backend (async, updates store incrementally)

### Key Config (`subtitleapp/src/config.ts`)

```ts
export const BACKEND_URL = 'http://<local-network-ip>:3001/api';
export const GOOGLE_TRANSLATE_API_KEY = '...';
export const GOOGLE_WEB_CLIENT_ID = '...';
```

Update `BACKEND_URL` to your machine's LAN IP when running on a physical device.

## Common Tasks

**Add a new backend endpoint:** create controller/service/module in `subbackend/src/<feature>/`, register module in `app.module.ts`.

**Add a new screen:** create `subtitleapp/src/screens/NewScreen.tsx`, add to the relevant stack in `AppNavigator.tsx`, add types to the stack's `ParamList`.

**Change the target language default:** update `targetLangCode/Label/Native` defaults in `subbackend/prisma/schema.prisma` and re-migrate.

**Prisma schema change:** edit `subbackend/prisma/schema.prisma`, run `npx prisma migrate dev --name <description>`, regenerate client with `npx prisma generate`.
