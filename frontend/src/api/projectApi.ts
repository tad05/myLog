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
type projectData = {
  userId: number
  title: string
  description: string
  fileCount: number
}
type fileData = {
  name: string
  isDirectory: boolean
  children?: fileData[]
  file?: File
}

export const createProject = async ({
  projectData,
  fileData,
}: {
  projectData: projectData
  fileData: fileData[]
}) => {
  const res = await fetch(`${API_BASE}/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      projectData,
      fileData,
    }),
  })
  if (!res.ok) {
    throw new Error('프로젝트 생성 실패')
  }
  return await res.json()
}

export const deleteProject = async (projectId: number) => {
  const res = await fetch(`${API_BASE}/projects/${projectId}`, {
    method: 'DELETE',
  })
  if (!res.ok) {
    throw new Error('프로젝트 삭제 실패')
  }
  return await res.json()
}
