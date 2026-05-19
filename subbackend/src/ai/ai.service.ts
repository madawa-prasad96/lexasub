import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ContextDefinitionsDto } from './dto/context-definitions.dto';

export interface WordDefinition {
  word: string;
  contextDefinition: string;
  culturalNote: string | null;
  exampleSentence: string;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private genAI: GoogleGenerativeAI;
  private cache = new Map<string, WordDefinition>();

  constructor(private configService: ConfigService) {
    this.genAI = new GoogleGenerativeAI(
      this.configService.get<string>('GEMINI_API_KEY') ?? '',
    );
  }

  async getContextDefinitions(dto: ContextDefinitionsDto): Promise<{
    definitions: WordDefinition[];
  }> {
    const { words, subtitleLines, targetLanguage, experienceLevel, movieName } = dto;

    const uncachedWords = words.filter(
      w => !this.cache.has(`${movieName}:${w}:${targetLanguage}`),
    );
    const cachedResults = words
      .filter(w => this.cache.has(`${movieName}:${w}:${targetLanguage}`))
      .map(w => this.cache.get(`${movieName}:${w}:${targetLanguage}`) as WordDefinition);

    this.logger.log(`Context definitions for "${movieName}": ${cachedResults.length} cached, ${uncachedWords.length} to fetch`);

    if (uncachedWords.length === 0) {
      return { definitions: cachedResults };
    }

    const model = this.genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: { responseMimeType: 'application/json' },
    });

    const batches = this.chunkArray(uncachedWords, 10);
    const freshResults: WordDefinition[] = [];

    for (const [i, batch] of batches.entries()) {
      this.logger.log(`Calling Gemini: batch ${i + 1}/${batches.length} (${batch.length} words) for "${movieName}"`);
      const wordsWithContext = batch
        .map(w => `- "${w}": "${subtitleLines[w] || 'No subtitle line available'}"`)
        .join('\n');

      const prompt = `You are a language learning assistant. For each English word below, provide:
1. A context-aware definition: explain what the word means specifically in the subtitle line shown. Keep it clear and simple for a ${experienceLevel} level learner.
2. A cultural note: if the word carries cultural significance a ${targetLanguage} speaker should understand, explain it. If no cultural note is needed, write null.
3. A simple example sentence at ${experienceLevel} level that uses the word naturally.

Movie: ${movieName}

Words and their subtitle context:
${wordsWithContext}

Respond ONLY with a valid JSON array. No preamble, no markdown fences. Example format:
[
  {
    "word": "betray",
    "contextDefinition": "In this scene, betray means to act against someone who trusted you deeply.",
    "culturalNote": "In English-speaking cultures, betrayal is considered one of the gravest moral violations, especially among close friends or family.",
    "exampleSentence": "She felt betrayed when her best friend revealed her secret to everyone."
  }
]`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();

      let parsed: WordDefinition[];
      try {
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
      } catch {
        this.logger.error(`Failed to parse Gemini response for batch ${i + 1}: ${text.slice(0, 200)}`);
        parsed = batch.map(w => ({
          word: w,
          contextDefinition: 'Definition not available.',
          culturalNote: null,
          exampleSentence: '',
        }));
      }

      freshResults.push(...parsed);

      parsed.forEach(item => {
        this.cache.set(`${movieName}:${item.word}:${targetLanguage}`, item);
      });
    }

    return { definitions: [...cachedResults, ...freshResults] };
  }

  private chunkArray<T>(arr: T[], size: number): T[][] {
    return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
      arr.slice(i * size, i * size + size),
    );
  }
}
