import type { BlogInfo } from '@/models/dashboard'
export interface BlogScrapList {
  scrapList: BlogInfo[]
}
export const BlogScrapList: BlogScrapList = {
  scrapList: [
    {
      id: 'blog1',
      title: 'app.tsx 기본 문법을 소개합니다',
    },
    {
      id: 'blog2',
      title: 'main.tsx 파일에서 React 애플리케이션을 초기화하는 방법',
    },
    { id: 'blog3', title: 'public 폴더 사용 방법' },
    { id: 'blog4', title: '화살표 컴포넌트 만들기' },
  ],
}
