import { IsString, IsNumber, IsArray, IsObject, IsNotEmpty } from 'class-validator';

export class SaveMovieDto {
  @IsString() @IsNotEmpty() movieName: string;
  @IsString() @IsNotEmpty() targetLanguage: string;
  @IsString() @IsNotEmpty() experienceLevel: string;
  @IsNumber() totalWords: number;
  @IsObject() difficultyEstimate: Record<string, any>;
  @IsArray() words: any[];
}
