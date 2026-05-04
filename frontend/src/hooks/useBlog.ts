import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/queries/queryKeys'
import { getBlog, getBlogs, saveBlog } from '@/api/blogApi'

export const useBlog = (fileId?: number) => {
  return useQuery({
    queryKey: queryKeys.blog(fileId!),
    queryFn: () => getBlog(fileId!),
    enabled: fileId !== null && fileId !== undefined,
  })
}
export const useBlogs = () => {
  return useQuery({
    queryKey: queryKeys.blogs(),
    queryFn: () => getBlogs(),
  })
}
export const useSaveBlog = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: saveBlog,

    onSuccess: (_data, variables) => {
      console.log('✅ 저장 성공:', _data)

      // 👉 variables = mutate할 때 넘긴 값
      queryClient.invalidateQueries({
        queryKey: queryKeys.blog(variables.fileId),
      })
    },
  })
}
