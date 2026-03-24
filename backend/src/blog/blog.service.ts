import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BlogDto } from './blog.dto';

@Injectable()
export class BlogService {
  constructor(private readonly prisma: PrismaService) {}

  async saveBlog(fileId: number, dto: BlogDto) {
    const searchText = dto.parsedBlocks
      ?.map((b: any) => {
        if (b.type === 'code') return b.code ?? '';
        if (b.type === 'comment') return b.content ?? '';
        return '';
      })
      .join(' ');

    try {
      const result = await this.prisma.blog.update({
        where: {
          fileId,
        },
        data: {
          ...dto,
          searchText: searchText,
        },
      });

      return result;
    } catch (e) {
      console.error('❌ 에러 발생:', e);
      throw e;
    }
  }
  async createBlog(blogDto: BlogDto) {
    const searchText = blogDto.parsedBlocks
      ?.map((b: any) => {
        if (b.type === 'code') return b.code ?? '';
        if (b.type === 'comment') return b.content ?? '';
        return '';
      })
      .join(' ');

    try {
      const result = await this.prisma.blog.create({
        data: {
          ...blogDto,
          searchText: searchText || '',
        },
      });
      return result;
    } catch (e) {
      console.error('❌ 에러 발생:', e);
      throw e;
    }
  }
}
