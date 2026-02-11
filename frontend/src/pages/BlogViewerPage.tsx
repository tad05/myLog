import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { updateProgress } from '../features/readingProgressSlice'
import { CONTENTS } from '@/mock/blogContent'
import type { RootState } from '@/store'
import ReactMarkdown from 'react-markdown'

export const BlogViewerPage = ({ blogId }: { blogId: string }) => {
  const dispatch = useDispatch()
  const title = 'test'

  // Redux에서 저장된 progress 가져오기
  const savedProgress = useSelector(
    (state: RootState) =>
      state.readingProgress.progressList.find((p) => p.id === blogId)
        ?.percent || 0,
  )

  // 페이지 로드 시 저장된 스크롤 위치로 즉시 복원
  useEffect(() => {
    if (savedProgress > 0) {
      // DOM이 렌더링되는 즉시 스크롤 위치 설정
      const restoreScroll = () => {
        const container =
          (document.querySelector('[data-scroll-container]') as HTMLElement) ||
          document.documentElement

        const containerHeight = container.clientHeight || window.innerHeight
        const contentHeight =
          container.scrollHeight || document.documentElement.scrollHeight
        const scrollableHeight = contentHeight - containerHeight

        console.log('Restore - container:', container)
        console.log('Restore - Container info:', {
          containerHeight,
          contentHeight,
          scrollableHeight,
        })

        if (scrollableHeight > 0) {
          // percent를 실제 스크롤 위치로 변환
          const targetScrollTop = (savedProgress / 100) * scrollableHeight

          // 실제 스크롤 컨테이너가 document.documentElement가 아니면 해당 컨테이너에 스크롤
          if (container !== document.documentElement) {
            container.scrollTop = targetScrollTop
          } else {
            window.scrollTo(0, targetScrollTop)
          }

          console.log(
            `Restored scroll position: ${savedProgress}% -> ${targetScrollTop}px`,
          )
        }
      }

      // 즉시 실행
      restoreScroll()

      // 혹시 렌더링이 완료되지 않았을 경우를 대비해 한번 더
      const timer = setTimeout(restoreScroll, 50)

      return () => clearTimeout(timer)
    }
  }, [savedProgress])

  useEffect(() => {
    // 실제 스크롤이 일어나는 컨테이너 찾기 (한 번만)
    const scrollContainer =
      (document.querySelector('[data-scroll-container]') as HTMLElement) ||
      document.documentElement

    const saveProgress = (container: HTMLElement) => {
      const scrollTop = container.scrollTop || window.scrollY
      const containerHeight = container.clientHeight || window.innerHeight
      const contentHeight =
        container.scrollHeight || document.documentElement.scrollHeight

      // scrollable height 계산
      const scrollableHeight = contentHeight - containerHeight

      console.log('Container info:', {
        scrollTop,
        containerHeight,
        contentHeight,
        scrollableHeight,
      })

      // 0으로 나누는 것 방지 및 음수값 방지
      const percent =
        scrollableHeight > 0
          ? Math.min(100, Math.max(0, (scrollTop / scrollableHeight) * 100))
          : 0
      dispatch(updateProgress({ id: blogId, title, percent }))
    }

    // scroll 이벤트 핸들러
    const handleScroll = () => {
      saveProgress(scrollContainer)
    }

    // scroll 이벤트 리스너 추가
    // document.documentElement인 경우 window에서 스크롤 이벤트 발생
    if (scrollContainer === document.documentElement) {
      window.addEventListener('scroll', handleScroll)
    } else {
      scrollContainer.addEventListener('scroll', handleScroll)
    }

    // 브라우저 닫기 / 새로고침 / 외부 이동 시 호출
    const handleBeforeUnload = () => saveProgress(scrollContainer)
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      if (scrollContainer === document.documentElement) {
        window.removeEventListener('scroll', handleScroll)
      } else {
        scrollContainer.removeEventListener('scroll', handleScroll)
      }
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [blogId, title, dispatch])

  return (
    <div
      style={{
        gap: '20px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div>
        <span style={{ fontSize: '22px', fontWeight: 'bold' }}>{title}</span>
      </div>
      <div>
        <span
          style={{ fontSize: '18px', letterSpacing: '1px', lineHeight: '22pt' }}
        >
          <ReactMarkdown>
            {CONTENTS.blocks.map(customToMarkdown).join('\n\n')}
          </ReactMarkdown>
        </span>
      </div>
    </div>
  )
}
function customToMarkdown(block: {
  type: string
  text: string
  lang?: string
}) {
  const res = block.text
    .replace(/^\s*\/\/\/\s*(.*)$/gm, '## $1')
    .replace(/^\s*##\s*(.*)$/gm, '## $1')
    .replace(/\/\*@source@\*\//g, '```ts')
    .replace(/\/\*@end@\*\//g, '```')
  if (block.type === 'code') {
    return '```' + (block.lang || '') + '\n' + block.text + '\n```'
  }
  return res
}
