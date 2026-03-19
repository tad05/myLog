import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getFileBlog } from '@/api/fileApi'
import { queryKeys } from '@/queries/queryKeys'
import { saveBlog } from '@/api/blogApi'

export const useFileBlog = (fileId?: number) => {
  return useQuery({
    queryKey: queryKeys.blog(fileId!),
    queryFn: () => getFileBlog(fileId!),
    enabled: !!fileId,
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
