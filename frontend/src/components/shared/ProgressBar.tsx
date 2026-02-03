import { css, keyframes } from '@emotion/react'
import { Text } from '@shared/Text'

interface ProgressBarProps {
  percent: number
  animate?: boolean
}

export const ProgressBar = ({ percent, animate = false }: ProgressBarProps) => {
  return (
    <div css={progressContainer}>
      <div
        css={[progressFill, animate && fillAnimationStyle]}
        style={{ '--target-width': `${percent}%` } as React.CSSProperties}
      />
      <span css={percentLabel} style={{ left: `${percent}%` }}>
        <Text display="block" typography="t8" bold={true} color="green">
          {percent.toFixed(1)}%
        </Text>
      </span>
    </div>
  )
}

const fillAnimation = keyframes`
  from {
    width: 0%;
  }
  to {
    width: var(--target-width);
  }
`

const progressContainer = css`
  width: 100%;
  height: 4px;
  background-color: var(--border);
  overflow: visible;
  position: relative;

  &:hover span {
    opacity: 1;
  }
`

const progressFill = css`
  height: 100%;
  width: var(--target-width);
  background-color: var(--green);
  transition: width 3s ease;
`

const fillAnimationStyle = css`
  animation: ${fillAnimation} 1.5s ease-out forwards;
`

const percentLabel = css`
  position: absolute;
  bottom: 100%;
  transform: translateX(-100%);
  margin-bottom: 4px;
  padding: 5px 8px;
  background-color: var(--item);
  border: 1px solid var(--border);
  border-radius: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
  pointer-events: none;
  white-space: nowrap;
`
