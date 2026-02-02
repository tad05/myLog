import { ProgressBar } from '@shared/ProgressBar'
import { css } from '@emotion/react'
import { ListGrid } from './shared/ListGrid'
import type { BlogInfo } from '@/models/dashboard'
import { Text } from '@shared/Text'

export const BlogGridItem = ({ title, percent }: BlogInfo) => {
  return (
    <>
      <ListGrid
        contents={
          <div
            css={css`
              display: flex;
              flex-direction: column;
              width: 100%;
              height: 100%;
            `}
          >
            <div
              css={css`
                flex: 1;
                overflow: hidden;
              `}
            >
              <picture>
                <source
                  srcSet={generateImageUrl({
                    filename: 'sample',
                    format: 'webp',
                    option: 'w_240,h_240,q_auto,c_fill',
                  })}
                  type="image/webp"
                />
                <img
                  src={generateImageUrl({
                    filename: 'sample',
                    format: 'jpg',
                    option: 'w_240,h_240,c_fill,q_auto',
                  })}
                  alt="이미지"
                  css={css`
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                  `}
                />
              </picture>
            </div>
            <div
              css={css`
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
                line-height: 1.4;
                min-height: calc(1.4em * 2);
                max-height: calc(1.4em * 2);
                margin-top: 8px;
              `}
            >
              <Text typography="t6" color="mainText">
                {title}
              </Text>
            </div>
          </div>
        }
      />
      {percent && <ProgressBar percent={percent} />}
    </>
  )
}
//demo용
function generateImageUrl({
  filename,
  format,
  option = 'q_auto,c_fill',
}: {
  filename: string
  format: 'jpg' | 'webp'
  option?: string
}) {
  return `https://res.cloudinary.com/demo/image/upload/${option}/${filename}.${format}`
}
//개인용
// function generateImageUrl({
//   filename,
//   format,
//   option = 'q_auto,c_fill',
// }: {
//   filename: string
//   format: 'jpg' | 'webp'
//   option?: string
// }) {
//   return `https://res.cloudinary.com/ds2kluqdi/image/upload/${option}/v1692027253/${format}/${filename}.${format}`
// }
