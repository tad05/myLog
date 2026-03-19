import { API_BASE } from './client'
import { type EnhancedBlockNode } from '../lib/parser'
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
    body: JSON.stringify({ parsedBlocks }),
  })
  if (!res.ok) {
    throw new Error('블로그 파일 조회 실패')
  }
  return await res.json()
}
