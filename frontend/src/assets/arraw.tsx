import { colors, type Colors } from '@styles/colorPalette'

interface IconArrowRightProps {
  color?: Colors
  width?: number
  height?: number
}
export const IconArrowRight = ({
  color = 'mainText',
  width = 20,
  height = 18,
}: IconArrowRightProps) => {
  return (
    <svg
      viewBox="0 0 96 96"
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      fill={colors[color]}
    >
      <title />
      <path d="M69.8437,43.3876,33.8422,13.3863a6.0035,6.0035,0,0,0-7.6878,9.223l30.47,25.39-30.47,25.39a6.0035,6.0035,0,0,0,7.6878,9.2231L69.8437,52.6106a6.0091,6.0091,0,0,0,0-9.223Z" />
    </svg>
  )
}
