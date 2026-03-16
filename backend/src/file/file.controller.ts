import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { FileService } from './file.service';
@Controller('files')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Get(':fileId/blog')
  getBlogByFileId(@Param('fileId', ParseIntPipe) fileId: number) {
    return this.fileService.getBlogByFileId(fileId);
  }
}
