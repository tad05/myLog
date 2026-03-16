import { useQuery } from 'node_modules/@tanstack/react-query/build/modern/useQuery'
import { getProjects, getProjectFiles } from '@/api/projectApi'
import { queryKeys } from '@/queries/queryKeys'

export const useProjects = (userId: number) => {
  return useQuery({
    queryKey: queryKeys.projects(userId),
    queryFn: () => getProjects(userId),
  })
}

export const useProjectFiles = (projectId?: number) => {
  return useQuery({
    queryKey: queryKeys.files(projectId!),
    queryFn: () => getProjectFiles(projectId!),
    enabled: !!projectId,
  })
}
