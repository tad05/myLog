import { API_BASE } from './client'

export const getProjects = async (userId: number) => {
  const res = await fetch(`${API_BASE}/projects?userId=${userId}`)
  if (!res.ok) {
    throw new Error('프로젝트 조회 실패')
  }
  return await res.json()
}

export const getProjectFiles = async (projectId?: number | null) => {
  if (projectId == null) return []
  const res = await fetch(`${API_BASE}/projects/${projectId}/files`)
  if (!res.ok) {
    throw new Error('파일 조회 실패')
  }
  return await res.json()
}
