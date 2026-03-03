import { useSelector } from 'react-redux'
import { useNavigate, useSearchParams } from 'react-router-dom'
import type { RootState } from '../store'
import { SEARCH_TYPE } from '@/mock/blogSearchOption'
import { BlogList } from '@/components/BlogList'
import { Flex } from '@/components/shared/Flex'
import { FloatingButton } from '@/components/FloatingButton'

export const BlogListPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const type = searchParams.get('type')

  const blogProgressList = useSelector(
    (state: RootState) => state.readingProgress.progressList,
  )
  const blogScrapList = useSelector(
    (state: RootState) => state.blogScrap.scrapList,
  )

  const getItems = () => {
    if (type === SEARCH_TYPE.PROGRESS) return blogProgressList
    if (type === SEARCH_TYPE.SCRAP) return blogScrapList
    return []
  }

  const onClickCreate = () => {
    navigate('/myLog/blog/new')
  }

  return (
    <Flex
      direction="column"
      style={{
        gap: '20px',
        padding: '20px',
        paddingBottom: '140px', // FloatingButton 영역 + 기존 패딩
      }}
    >
      <BlogList items={getItems()} />
      <FloatingButton text="새로 만들기" onClick={onClickCreate} />
    </Flex>
  )
}
