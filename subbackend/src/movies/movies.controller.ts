import { Controller, Post, Get, Delete, Body, Param, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SaveMovieDto } from './dto/save-movie.dto';

@UseGuards(JwtAuthGuard)
@Controller('movies')
export class MoviesController {
  constructor(private moviesService: MoviesService) {}

  @Post()
  saveMovie(@Request() req: any, @Body() dto: SaveMovieDto) {
    return this.moviesService.saveMovie(req.user.id, dto);
  }

  @Get()
  getMovies(@Request() req: any) {
    return this.moviesService.getMovies(req.user.id);
  }

  @Get(':id')
  getMovie(@Request() req: any, @Param('id') id: string) {
    return this.moviesService.getMovie(req.user.id, id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteMovie(@Request() req: any, @Param('id') id: string) {
    return this.moviesService.deleteMovie(req.user.id, id);
  }
}
