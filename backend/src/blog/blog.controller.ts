import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { BlogService } from './blog.service';
import { SaveBlogDto } from './blog.dto';

@Controller('files')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post(':fileId')
  saveBlog(@Param('fileId') fileId: string, @Body() dto: SaveBlogDto) {
    return this.blogService.saveBlog(Number(fileId), dto);
  }
}
