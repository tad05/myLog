import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProjectService {
  constructor(private readonly prisma: PrismaService) {}

  async getProjects(userId: number) {
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
      orderBy: [{ isDirectory: 'desc' }, { path: 'asc' }],
    });
  }
}
