import { useQuery } from '@tanstack/react-query'
import { getFileBlog } from '@/api/fileApi'
import { queryKeys } from '@/queries/queryKeys'

export const useFileBlog = (fileId?: number) => {
  return useQuery({
    queryKey: queryKeys.blog(fileId!),
    queryFn: () => getFileBlog(fileId!),
    enabled: !!fileId,
  })
}
