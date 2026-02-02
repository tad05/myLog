import type { BlogInfo } from '@/models/dashboard'
export interface BlogScrapList {
  scrapList: BlogInfo[]
}
export const BlogScrapList: BlogScrapList = {
  scrapList: [
    {
      id: '1',
      title: 'vercel의 agent-skills인 react-best-practices을 소개합니다',
    },
    {
      id: '2',
      title:
        "[회고] 실리콘밸리 AI 유니콘 'Cohere' 과제 합격 회고 (비록 채용은 취소됐지만) 긴 문장 타이틀 테스트",
    },
    { id: '3', title: 'Some scrap blog title for blog 3' },
    { id: '4', title: 'Some scrap blog title for blog 4' },
    { id: '5', title: 'Some scrap blog title for blog 5' },
    { id: '6', title: 'Some scrap blog title for blog 6' },
    { id: '7', title: 'Some scrap blog title for blog 7' },
    { id: '8', title: 'Some scrap blog title for blog 8' },
    { id: '9', title: 'Some scrap blog title for blog 9' },
  ],
}
