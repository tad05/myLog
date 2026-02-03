import { useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import type { RootState } from '../store'
import { SEARCH_TYPE } from '@/mock/blogSearchOption'
import { BlogList } from '@/components/BlogList'
import { Flex } from '@/components/shared/Flex'

export const BlogListPage = () => {
  const [searchParams] = useSearchParams()
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

  return (
    <Flex direction="column" style={{ gap: '20px', padding: '20px' }}>
      <BlogList items={getItems()} />
    </Flex>
  )
}
