import type { BlogInfo } from '@/models/dashboard'

export interface BlogProgressList {
  progressList: BlogInfo[]
}
export const BlogProgressList: BlogProgressList = {
  progressList: [
    {
      id: '1',
      title: 'vercel의 agent-skills인 react-best-practices을 소개합니다',
      percent: 45.5,
    },
    {
      id: '2',
      title:
        "[회고] 실리콘밸리 AI 유니콘 'Cohere' 과제 합격 회고 (비록 채용은 취소됐지만)",
      percent: 78.2,
    },
    { id: '3', title: 'Some blog title for blog 3', percent: 12.0 },
    { id: '4', title: 'Some blog title for blog 4', percent: 12.0 },
    { id: '5', title: 'Some blog title for blog 5', percent: 12.0 },
    { id: '6', title: 'Some blog title for blog 6', percent: 12.0 },
  ],
}
