import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProjectService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserProjects(userId: number) {
    return this.prisma.project.findMany({
      where: {
        userId: userId,
      },
    });
  }

  async getProjectFiles(projectId: number) {
    return this.prisma.file.findMany({
      where: {
        projectId: projectId,
      },
      orderBy: {
        path: 'asc',
      },
    });
  }

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
