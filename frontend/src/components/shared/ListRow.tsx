import { css, type SerializedStyles } from '@emotion/react'
import { Flex } from './Flex'
import { Text } from './Text'
import { IconArrowRight } from '@/assets/arraw'

interface ListRowProps {
  left?: React.ReactNode
  contents: React.ReactNode
  right?: React.ReactNode
  withArrow?: boolean
  onClick?: () => void
  as?: 'div' | 'li'
  style?: SerializedStyles
}

export const ListRow = ({
  as = 'li',
  left,
  contents,
  right,
  withArrow,
  onClick,
  style,
}: ListRowProps) => {
  return (
    <Flex
      as={as}
      css={[listRowContainerStyles, style]}
      onClick={onClick}
      align="center"
    >
      {left && <Flex css={listRowLeftStyles}>{left}</Flex>}
      <Flex css={listRowContentsStyles}>{contents}</Flex>
      {right && <Flex>{right}</Flex>}
      {withArrow ? <IconArrowRight color="subText" /> : null}
    </Flex>
  )
}

const listRowContainerStyles = css`
  padding: 8px 20px;
`

const listRowLeftStyles = css`
  margin-right: 14px;
`

const listRowContentsStyles = css`
  flex: 1;
  justify-content: center;
`
//  justify-content: center;

function ListRowTexts({
  title,
  subTitle,
}: {
  title: React.ReactNode
  subTitle?: React.ReactNode
}) {
  return (
    <Flex direction="column">
      <Text typography="t6" bold={true} color="mainText">
        {title}
      </Text>
      <Text typography="t7" color="subText">
        {subTitle}
      </Text>
    </Flex>
  )
}

ListRow.Texts = ListRowTexts
