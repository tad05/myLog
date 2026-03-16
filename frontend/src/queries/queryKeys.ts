// src/queries/queryKeys.ts
export const queryKeys = {
  projects: (userId: number) => ['projects', userId] as const,

  project: (projectId: number) => ['project', projectId] as const,

  files: (projectId: number) => ['files', projectId] as const,

  file: (fileId: number) => ['file', fileId] as const,

  blog: (fileId: number) => ['blog', fileId] as const,
}
