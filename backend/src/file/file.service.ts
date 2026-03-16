import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FileService {
  constructor(private readonly prisma: PrismaService) {}

  async getBlogByFileId(fileId: number) {
    return this.prisma.blog.findUnique({
      where: { fileId: fileId },
      include: {
        file: {
          include: {
            project: true,
          },
        },
      },
    });
  }
}
