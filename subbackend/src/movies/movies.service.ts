import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SaveMovieDto } from './dto/save-movie.dto';

@Injectable()
export class MoviesService {
  private readonly logger = new Logger(MoviesService.name);

  constructor(private prisma: PrismaService) {}

  async saveMovie(userId: string, dto: SaveMovieDto) {
    this.logger.log(`Saving movie "${dto.movieName}" for user ${userId} (${dto.words.length} words)`);
    const movie = await this.prisma.savedMovie.create({
      data: {
        userId,
        movieName: dto.movieName,
        targetLanguage: dto.targetLanguage,
        experienceLevel: dto.experienceLevel,
        totalWords: dto.totalWords,
        difficultyEstimate: dto.difficultyEstimate,
        words: {
          create: dto.words.map((w: any) => ({
            word: w.word,
            translation: w.translation,
            cefrLevel: w.cefrLevel,
            frequency: w.frequency,
            timestamps: w.timestamps,
            subtitleLines: w.subtitleLines,
            contextDefinition: w.contextDefinition ?? null,
            culturalNote: w.culturalNote ?? null,
            exampleSentence: w.exampleSentence ?? null,
          })),
        },
      },
      include: { words: true },
    });
    this.logger.log(`Movie saved: "${movie.movieName}" (${movie.id})`);
    return this.formatMovie(movie);
  }

  async getMovies(userId: string) {
    const movies = await this.prisma.savedMovie.findMany({
      where: { userId },
      orderBy: { savedAt: 'desc' },
    });
    this.logger.log(`Listed ${movies.length} movies for user ${userId}`);
    return movies.map(m => ({
      id: m.id,
      movieName: m.movieName,
      savedAt: m.savedAt.toISOString(),
      targetLanguage: m.targetLanguage,
      experienceLevel: m.experienceLevel,
      totalWords: m.totalWords,
      difficultyEstimate: m.difficultyEstimate,
    }));
  }

  async getMovie(userId: string, movieId: string) {
    const movie = await this.prisma.savedMovie.findUnique({
      where: { id: movieId },
      include: { words: true },
    });
    if (!movie) {
      this.logger.warn(`getMovie: not found (${movieId})`);
      throw new NotFoundException('Movie not found');
    }
    if (movie.userId !== userId) {
      this.logger.warn(`getMovie: forbidden — user ${userId} tried to access movie ${movieId}`);
      throw new ForbiddenException();
    }
    this.logger.log(`Fetched movie "${movie.movieName}" (${movieId}) for user ${userId}`);
    return this.formatMovie(movie);
  }

  async deleteMovie(userId: string, movieId: string) {
    const movie = await this.prisma.savedMovie.findUnique({ where: { id: movieId } });
    if (!movie) {
      this.logger.warn(`deleteMovie: not found (${movieId})`);
      throw new NotFoundException('Movie not found');
    }
    if (movie.userId !== userId) {
      this.logger.warn(`deleteMovie: forbidden — user ${userId} tried to delete movie ${movieId}`);
      throw new ForbiddenException();
    }
    await this.prisma.savedMovie.delete({ where: { id: movieId } });
    this.logger.log(`Deleted movie "${movie.movieName}" (${movieId})`);
  }

  private formatMovie(movie: any) {
    return {
      id: movie.id,
      movieName: movie.movieName,
      savedAt: movie.savedAt.toISOString(),
      targetLanguage: movie.targetLanguage,
      experienceLevel: movie.experienceLevel,
      totalWords: movie.totalWords,
      difficultyEstimate: movie.difficultyEstimate,
      words: (movie.words ?? []).map((w: any) => ({
        word: w.word,
        translation: w.translation,
        cefrLevel: w.cefrLevel,
        frequency: w.frequency,
        timestamps: w.timestamps,
        subtitleLines: w.subtitleLines,
        contextDefinition: w.contextDefinition ?? undefined,
        culturalNote: w.culturalNote ?? undefined,
        exampleSentence: w.exampleSentence ?? undefined,
        isAILoaded: !!w.contextDefinition,
      })),
    };
  }
}
