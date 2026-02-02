import styled from '@emotion/styled'
import type { CSSProperties } from 'react'
import { colors, type Colors } from '@styles/colorPalette'
import { typographyMap, type Typography } from '@styles/typography'

interface TextProps {
  typography?: Typography
  color?: Colors
  display?: CSSProperties['display']
  textAlign?: CSSProperties['textAlign']
  fontWeight?: CSSProperties['fontWeight']
  bold?: boolean
}

export const Text = styled.span<TextProps>(
  ({ color = 'mainText', display, textAlign, fontWeight, bold }) => ({
    color: colors[color],
    display,
    textAlign,
    fontWeight: bold ? 'bold' : fontWeight,
  }),
  ({ typography = 't5' }) => typographyMap[typography],
)
