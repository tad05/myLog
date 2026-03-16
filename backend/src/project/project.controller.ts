import { Controller, Get, Param } from '@nestjs/common';
import { ProjectService } from './project.service';
@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}
  @Get(':userId')
  async getUserProjects(@Param('userId') userId: string) {
    const numericUserId = Number(userId);
    return this.projectService.getUserProjects(numericUserId);
  }
  @Get(':id/files')
  async getProjectFiles(@Param('id') id: string) {
    const projectId = Number(id);
    return this.projectService.getProjectFiles(projectId);
  }
  @Get('file/:fileId')
  async getBlogByFileId(@Param('fileId') fileId: string) {
    const numericFileId = Number(fileId);
    return this.projectService.getBlogByFileId(numericFileId);
  }
}
