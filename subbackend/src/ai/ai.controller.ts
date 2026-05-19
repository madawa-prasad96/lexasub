import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { AiService } from './ai.service';
import { ContextDefinitionsDto } from './dto/context-definitions.dto';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('context-definitions')
  async getContextDefinitions(@Body() dto: ContextDefinitionsDto) {
    try {
      return await this.aiService.getContextDefinitions(dto);
    } catch (error) {
      throw new HttpException(
        { message: 'AI service error', error: (error as Error).message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
