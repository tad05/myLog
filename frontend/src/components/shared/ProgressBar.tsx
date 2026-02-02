import { css } from '@emotion/react'
import { Text } from '@shared/Text'
export const ProgressBar = ({ percent }: { percent: number }) => {
  return (
    <div css={progressContainer}>
      <div css={progressFill} style={{ width: `${percent}%` }} />
      <span css={percentLabel} style={{ left: `${percent}%` }}>
        <Text display="block" typography="t8" bold={true} color="green">
          {percent.toFixed(1)}%
        </Text>
      </span>
    </div>
  )
}

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
  background-color: var(--green);
  transition: width 0.3s ease;
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
