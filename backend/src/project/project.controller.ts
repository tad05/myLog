import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectRequestDto, ProjectDto } from './project.dto';
import { FileService } from '../file/file.service';

@Controller('projects')
export class ProjectController {
  constructor(
    private readonly projectService: ProjectService,
    private readonly fileService: FileService,
  ) {}

  @Get()
  getProjects(
    @Query('userId', new ParseIntPipe({ optional: true })) userId?: number,
  ) {
    return this.projectService.getProjects(userId);
  }

  @Get(':projectId/files')
  getProjectFiles(@Param('projectId', ParseIntPipe) projectId: number) {
    return this.projectService.getProjectFiles(projectId);
  }

  @Post()
  async createProject(@Body() dto: CreateProjectRequestDto) {
    const { projectData, fileData } = dto;
    if (!projectData.userId) {
      // userId가 없을 경우 header에서 가져오도록 수정
    }
    if (!projectData.title) {
      throw new Error('title is required to create a project');
    }
    const projectResult = await this.projectService.createProject(projectData);

    if (projectResult) {
      if (projectData.fileCount > 0) {
        // 파일이 포함된 프로젝트인 경우, 파일 저장 로직을 여기에 추가
        await this.fileService.saveFile(fileData, null, '', projectResult.id);
      }
    }
    return projectResult;
  }

  @Delete(':projectId')
  async deleteProject(@Param('projectId', ParseIntPipe) projectId: number) {
    const result = await this.projectService.deleteProject(projectId);
    console.log(`Deleted project with ID: ${projectId} and result:`, result);
    return { message: 'Project deleted successfully' };
  }
}
