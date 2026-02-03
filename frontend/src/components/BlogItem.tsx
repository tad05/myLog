import { useState } from 'react'
import { css } from '@emotion/react'
import { ListRow } from '@shared/ListRow'
import { Flex } from '@shared/Flex'
import { ProgressBar } from '@shared/ProgressBar'
import type { BlogInfo } from '@/models/dashboard'
import { IconArrowRight } from '@/assets/arraw'

export const BlogItem = ({ title, percent }: BlogInfo) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <ListRow
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      contents={
        <Flex direction="column" style={{ flex: 1, gap: '5px' }}>
          <Flex justify="space-between" align="center" css={hoverRowStyles}>
            <ListRow.Texts title={title}></ListRow.Texts>
            <IconArrowRight color="subText" />
          </Flex>
          {percent && <ProgressBar percent={percent} animate={isHovered} />}
        </Flex>
      }
    />
  )
}

const hoverRowStyles = css`
  padding: 5px;
  transition: background-color 0.2s ease;
  cursor: pointer;

  &:hover {
    background-color: var(--hovered-item);
  }
`
