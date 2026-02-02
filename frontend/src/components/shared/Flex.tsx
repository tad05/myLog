import styled from '@emotion/styled'
import type { CSSProperties } from 'react'

interface FlexProps {
  align?: CSSProperties['alignItems']
  justify?: CSSProperties['justifyContent']
  direction?: CSSProperties['flexDirection']
  style?: CSSProperties
}

export const Flex = styled.div<FlexProps>(
  ({ align, justify, direction, style }) => ({
    display: 'flex',
    alignItems: align,
    justifyContent: justify,
    flexDirection: direction,
    ...style,
  }),
)
