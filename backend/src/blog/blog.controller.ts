import { Controller, Get, Param } from '@nestjs/common';
import { BlogService } from './blog.service';
@Controller('files')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}
}
