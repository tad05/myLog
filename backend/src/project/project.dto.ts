import { FileDto } from 'src/file/file.dto';

export class ProjectDto {
  id: number;
  userId: number;
  title: string;
  description?: string;
  thumbnail?: string;
  fileCount: number;
}
export class CreateProjectRequestDto {
  projectData: ProjectDto;
  fileData: FileDto[];
}
