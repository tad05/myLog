import { API_BASE } from './client'
import { type EnhancedBlockNode } from '../lib/parser'

export const createBlog = async ({
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
  const res = await fetch(`${API_BASE}/files/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ projectId, name, path, language, rawContent }),
  })
  if (!res.ok) {
    throw new Error('블로그 파일 생성 실패')
  }
  return await res.json()
}

export const getBlog = async (fileId: number) => {
  const res = await fetch(`${API_BASE}/files/${fileId}/blog`)
  if (!res.ok) {
    throw new Error('블로그 파일 조회 실패')
  }
  return await res.json()
}

export const getBlogs = async () => {
  const res = await fetch(`${API_BASE}/blogs`)
  if (!res.ok) {
    throw new Error('블로그 목록 조회 실패')
  }
  return await res.json()
}

export const saveBlog = async ({
  fileId,
  parsedBlocks,
}: {
  fileId: number
  parsedBlocks: EnhancedBlockNode[]
}) => {
  console.log('🚀 saveBlog called with:', { fileId, parsedBlocks })
  const res = await fetch(`${API_BASE}/files/${fileId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ parsedBlocks }),
  })
  if (!res.ok) {
    throw new Error('블로그 파일 조회 실패')
  }
  return await res.json()
}
