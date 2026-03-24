export class FileDto {
  projectId: number;
  name: string;
  path: string;
  language: string | null;
  rawContent: string | null;
  fileSize: number;
  isDirectory: boolean;
  parentId: number | null;
  children?: FileDto[];
  parsedBlocks?: any[];
}
