import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { BlogService } from './blog.service';
import { BlogDto } from './blog.dto';

@Controller('files')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post(':fileId')
  saveBlog(
    @Param('fileId', ParseIntPipe) fileId: number,
    @Body() dto: BlogDto,
  ) {
    return this.blogService.saveBlog(fileId, dto);
  }
}
