import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ProjectService } from './project.service';
@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  getProjects(@Query('userId') userId?: number) {
    return this.projectService.getProjects(userId);
  }

  @Get(':projectId/files')
  getProjectFiles(@Param('projectId', ParseIntPipe) projectId: number) {
    return this.projectService.getProjectFiles(projectId);
  }
}
