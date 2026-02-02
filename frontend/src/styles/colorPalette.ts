import { css } from '@emotion/react'

export const colorPalette = css`
  :root {
    --background: #fafaf8;
    --item: #ffffff;
    --action: #f6f6f3;
    --border: #e7e5e4;
    --main-text: #1f2937;
    --sub-text: #6b7280;
    --placeholder-text: #9ca3af;
    --green: #4f7663;
    --blue: #4a6cf7;
  }
`

export const colors = {
  background: 'var(--background)',
  item: 'var(--item)',
  action: 'var(--action)',
  border: 'var(--border)',
  mainText: 'var(--main-text)',
  subText: 'var(--sub-text)',
  placeholderText: 'var(--placeholder-text)',
  green: 'var(--green)',
  blue: 'var(--blue)',
}

export type Colors = keyof typeof colors
