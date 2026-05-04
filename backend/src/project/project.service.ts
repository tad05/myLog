import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectDto } from './project.dto';

@Injectable()
export class ProjectService {
  constructor(private readonly prisma: PrismaService) {}

  async getProjects(userId: number | null) {
    return this.prisma.project.findMany({
      where: {
        ...(userId !== undefined && { userId }),
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

  async createProject(projectData: ProjectDto) {
    return await this.prisma.project.create({
      data: {
        userId: projectData.userId,
        title: projectData.title,
        description: projectData.description,
        thumbnail: projectData.thumbnail,
        fileCount: projectData.fileCount,
      },
    });
  }
  async deleteProject(projectId: number) {
    await this.prisma.project.delete({
      where: { id: projectId },
    });
  }
}
