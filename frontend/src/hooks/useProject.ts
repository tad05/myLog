import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { getProjects, getProjectFiles, deleteProject } from '@/api/projectApi'
import { queryKeys } from '@/queries/queryKeys'
import { createProject } from '@/api/projectApi'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store'

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

export const useCreateProject = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  return useMutation({
    mutationFn: createProject,

    onSuccess: async (_data, variables) => {
      console.log('✅ 프로젝트 생성 성공:', _data, variables)
      // 👉 variables = mutate할 때 넘긴 값
      await queryClient.invalidateQueries({
        queryKey: queryKeys.projects(variables.projectData.userId),
      })
      navigate(`/myLog/projects/${_data.id}/files`)
    },
  })
}

export const useDeleteProject = (projectId: number) => {
  const queryClient = useQueryClient()
  const user = useSelector((state: RootState) => state.user.currentUser)

  return useMutation({
    mutationFn: deleteProject,

    onSuccess: async (_data, variables) => {
      console.log('✅ 프로젝트 생성 성공:', _data, variables)
      queryClient.removeQueries({
        queryKey: queryKeys.files(projectId),
      })
      if (user && user.id) {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.projects(user.id),
        })
      }
    },
  })
}
