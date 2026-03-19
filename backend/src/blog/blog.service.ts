import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SaveBlogDto } from './blog.dto';

@Injectable()
export class BlogService {
  constructor(private readonly prisma: PrismaService) {}

  async saveBlog(fileId: number, dto: SaveBlogDto) {
    const searchText = dto.parsedBlocks
      .map((b: any) => {
        if (b.type === 'code') return b.code ?? '';
        if (b.type === 'comment') return b.content ?? '';
        return '';
      })
      .join(' ');

    return this.prisma.blog.update({
      where: {
        fileId,
      },
      data: {
        ...dto,
        searchText: searchText,
      },
    });
  }
}
