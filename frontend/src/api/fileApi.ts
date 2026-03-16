import { API_BASE } from './client'

export const getFileBlog = async (fileId: number) => {
  const res = await fetch(`${API_BASE}/files/${fileId}/blog`)
  if (!res.ok) {
    throw new Error('블로그 파일 조회 실패')
  }
  return await res.json()
}
