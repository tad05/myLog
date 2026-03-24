import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FileDto } from './file.dto';
import { BlogService } from 'src/blog/blog.service';

@Injectable()
export class FileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly blogService: BlogService,
  ) {}

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
  async saveFile(
    nodes: FileDto[],
    parentId = null,
    parentPath = '',
    projectId: number,
  ) {
    for (const node of nodes) {
      const currentPath = `${parentPath}/${node.name}`;
      const language = node.isDirectory
        ? null
        : node.name.split('.').pop()?.toLowerCase() || null;

      const rawContent = node.isDirectory ? null : node.rawContent || '';
      const fileSize = node.isDirectory
        ? 0
        : Buffer.byteLength(node.rawContent || '', 'utf-8');

      console.log('Saving file with details:', {
        projectId,
        name: node.name,
        path: currentPath,
        language,
        rawContent,
        fileSize,
        isDirectory: node.isDirectory,
        parentId,
      });
      const saved = await this.prisma.file.create({
        data: {
          projectId,
          name: node.name,
          path: currentPath,
          language,
          rawContent,
          fileSize,
          isDirectory: node.isDirectory,
          parentId,
        },
      });
      console.log('Saved file:', saved);
      if (!node.isDirectory) {
        await this.blogService.createBlog({
          fileId: saved.id,
          title: node.name,
          parsedBlocks: node.parsedBlocks || [],
        });
      }
      if (node.isDirectory && node.children) {
        await this.saveFile(node.children, saved.id, currentPath, projectId);
      }
    }
  }
}
