import { ListRow } from '@shared/ListRow'
import { Flex } from '@shared/Flex'
import { ProgressBar } from '@shared/ProgressBar'
import type { BlogInfo } from '@/models/dashboard'

export const BlogItem = ({ title, percent }: BlogInfo) => {
  return (
    <ListRow
      contents={
        <Flex
          direction="column"
          style={{ flex: 1, paddingRight: '10px', gap: '5px' }}
        >
          <ListRow.Texts title={title}></ListRow.Texts>
          {percent && <ProgressBar percent={percent} />}
        </Flex>
      }
      withArrow={true}
    />
  )
}
