import { css, type SerializedStyles } from '@emotion/react'
import { Flex } from './Flex'
import { Text } from './Text'

interface ListGridProps {
  contents: React.ReactNode
  onClick?: () => void
  as?: 'div' | 'li'
  style?: SerializedStyles
}

export const ListGrid = ({
  as = 'li',
  contents,
  onClick,
  style,
}: ListGridProps) => {
  return (
    <Flex
      as={as}
      css={[listGridContainerStyles, style]}
      onClick={onClick}
      align="center"
    >
      {contents}
    </Flex>
  )
}

const listGridContainerStyles = css`
  aspect-ratio: 1 / 1;
  overflow: hidden;
  border-radius: 8px;
`
function ListGridTexts({
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

ListGrid.Texts = ListGridTexts
