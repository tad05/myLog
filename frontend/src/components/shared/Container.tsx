import styled from '@emotion/styled'
import type { CSSProperties } from 'react'
import { colors } from '@styles/colorPalette'

interface ContainerProps {
  backgroundColor?: CSSProperties['backgroundColor']
  border?: CSSProperties['border']
  borderRadius?: CSSProperties['borderRadius']
  width?: CSSProperties['width']
  height?: CSSProperties['height']
}

export const Container = styled.div<ContainerProps>(
  ({
    backgroundColor = colors.item,
    border,
    borderRadius,
    width = '100%',
    height = '100%',
  }) => ({
    backgroundColor,
    border,
    borderRadius,
    width,
    height,
  }),
)
