import { useSelector } from 'react-redux'
import type { RootState } from '../store'
import { BlogList } from '@/components/BlogList'
import { useEffect, useState } from 'react'
import { Text } from '@/components/shared/Text'
import { Container } from '@/components/shared/Container'
import { Flex } from '@/components/shared/Flex'
import { IconArrowRight } from '@/assets/arraw'
import { BlogGrid } from '@/components/BlogGrid'
import { IoGrid } from 'react-icons/io5'
import { IoList } from 'react-icons/io5'

export const DashboardPage = () => {
  const blogProgressList = useSelector(
    (state: RootState) => state.readingProgress.progressList,
  )
  const blogScrapList = useSelector(
    (state: RootState) => state.blogScrap.scrapList,
  )
  const [scrapViewMode, setScrapViewMode] = useState<'list' | 'grid'>('grid')

  useEffect(() => {
    console.log(blogProgressList)
  }, [blogProgressList])

  return (
    <Flex direction="column" style={{ gap: '20px', padding: '20px' }}>
      <Container border="1px solid var(--border)">
        <div className="py-5 pr-[20px] flex justify-end items-center gap-1 cursor-pointer">
          <Text typography="t7" bold={true} color="subText">
            더보기
          </Text>
          <IconArrowRight color="subText" width={16} height={14} />
        </div>
        {/* todo: sort이후 slice하는 로직 추가하기 */}
        <BlogList items={blogProgressList.slice(0, 5)} />
      </Container>
      <Container border="1px solid var(--border)">
        <div className="grid grid-cols-2">
          <Flex
            align="center"
            style={{
              padding: '20px',
              gap: '8px',
            }}
          >
            <IoGrid
              size="20"
              color={scrapViewMode === 'grid' ? 'var(--green)' : undefined}
              style={{
                cursor: 'pointer',
              }}
              onClick={() => setScrapViewMode('grid')}
            />
            <IoList
              size="30"
              color={scrapViewMode === 'list' ? 'var(--green)' : undefined}
              style={{
                cursor: 'pointer',
              }}
              onClick={() => setScrapViewMode('list')}
            />
          </Flex>
          <Flex
            align="center"
            justify="flex-end"
            style={{
              cursor: 'pointer',
              paddingRight: '20px',
              gap: '4px',
            }}
          >
            <Text typography="t7" bold={true} color="subText">
              더보기
            </Text>
            <IconArrowRight color="subText" width={16} height={14} />
          </Flex>
        </div>

        {/* todo: sort이후 slice하는 로직 추가하기 */}
        {scrapViewMode === 'grid' ? (
          <BlogGrid items={blogScrapList.slice(0, 10)} />
        ) : (
          <BlogList items={blogScrapList.slice(0, 10)} />
        )}
      </Container>
    </Flex>
  )
}
