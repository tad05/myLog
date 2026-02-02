import styled from '@emotion/styled'
import type { CSSProperties } from 'react'
import { colors } from '@styles/colorPalette'

interface ContainerProps {
  backgroundColor?: CSSProperties['backgroundColor']
  border?: CSSProperties['border']
  width?: CSSProperties['width']
  height?: CSSProperties['height']
}

export const Container = styled.div<ContainerProps>(
  ({
    backgroundColor = colors.item,
    border,
    width = '100%',
    height = '100%',
  }) => ({
    backgroundColor,
    border,
    width,
    height,
  }),
)
