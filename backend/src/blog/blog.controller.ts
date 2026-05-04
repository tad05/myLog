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

@Controller()
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Get('/blogs')
  getBlogByFileId() {
    return this.blogService.getBlogs();
  }

  @Post('files/:fileId')
  saveBlog(
    @Param('fileId', ParseIntPipe) fileId: number,
    @Body() dto: BlogDto,
  ) {
    return this.blogService.saveBlog(fileId, dto);
  }
}
