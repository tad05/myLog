import { API_BASE } from './client'

export const createFile = async ({
  projectId,
  name,
  path,
  language,
  rawContent,
}: {
  projectId: number
  name: string
  path: string
  language: string
  rawContent: string
}) => {
  const res = await fetch(`${API_BASE}/files`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ projectId, name, path, language, rawContent }),
  })
  if (!res.ok) {
    throw new Error('파일 생성 실패')
  }
  return await res.json()
}

export const getFile = async (fileId: number) => {
  const res = await fetch(`${API_BASE}/files/${fileId}`)
  if (!res.ok) {
    throw new Error('파일 조회 실패')
  }
  return await res.json()
}
