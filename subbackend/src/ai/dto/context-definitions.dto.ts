import { IsString, IsArray, IsObject, IsNotEmpty } from 'class-validator';

export class ContextDefinitionsDto {
  @IsArray()
  words: string[];

  @IsObject()
  subtitleLines: Record<string, string>;

  @IsString()
  @IsNotEmpty()
  targetLanguage: string;

  @IsString()
  @IsNotEmpty()
  experienceLevel: string;

  @IsString()
  @IsNotEmpty()
  movieName: string;
}
