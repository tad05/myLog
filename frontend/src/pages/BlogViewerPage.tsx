import { useEffect, useState, useMemo, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { updateProgress } from '../features/readingProgressSlice'
import type { RootState } from '@/store'
import type { CSSObject } from '@emotion/react'
import { FloatingButton } from '@/components/FloatingButton'
import { parseFileEnhanced } from '../lib/parser'
import testBlock2 from '../mock/testBlockRaw'
import { BlockRenderer } from '@/components/renderer/BlockRenderer'
import type { EnhancedBlockNode, CommentBlock } from '../lib/parser'
import { BlogEditPage } from './BlogEditPage'
/** @jsxImportSource @emotion/react */

const EMOTION_STYLES: CSSObject = {
  '& ul': {
    listStyleType: 'disc',
    paddingLeft: '20px',
    margin: '8px 0',
  } as CSSObject,
  '& ol': {
    listStyleType: 'decimal',
    paddingLeft: '20px',
    margin: '8px 0',
  } as CSSObject,
  '& li': {
    marginBottom: '4px',
  } as CSSObject,
  '& table': {
    borderCollapse: 'collapse',
    width: '100%',
    margin: '16px 0',
    border: '1px solid #dee2e6',
  } as CSSObject,
  '& th': {
    border: '1px solid #dee2e6',
    padding: '8px 12px',
    textAlign: 'left',
    backgroundColor: '#f8f9fa',
    fontWeight: 'bold',
  } as CSSObject,
  '& td': {
    border: '1px solid #dee2e6',
    padding: '8px 12px',
    textAlign: 'left',
  } as CSSObject,
}

export const BlogViewerPage = ({ blogId }: { blogId: string }) => {
  const dispatch = useDispatch()
  const title = 'test'
  const [isEditing, setIsEditing] = useState(false)

  // Redux에서 저장된 progress 가져오기
  const savedProgress = useSelector(
    (state: RootState) =>
      state.readingProgress.progressList.find((p) => p.id === blogId)
        ?.percent || 0,
  )

  const blocks = useMemo(() => parseFileEnhanced(testBlock2), [])

  // 편집 모드 블록 메모이제이션 (isEditing이 true일 때만 복사)
  const editableBlocks = useMemo(() => {
    if (!isEditing) return []
    // JSON 직렬화로 getter 완전 제거
    return JSON.parse(JSON.stringify(blocks))
  }, [isEditing, blocks])

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

        if (scrollableHeight > 0) {
          // percent를 실제 스크롤 위치로 변환
          const targetScrollTop = (savedProgress / 100) * scrollableHeight

          // 실제 스크롤 컨테이너가 document.documentElement가 아니면 해당 컨테이너에 스크롤
          if (container !== document.documentElement) {
            container.scrollTop = targetScrollTop
          } else {
            window.scrollTo(0, targetScrollTop)
          }
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

  const onClickEdit = useCallback(() => {
    setIsEditing(!isEditing)
  }, [isEditing])

  // 주석 블록 렌더링 함수 (정적)
  const renderStaticCommentBlock = (block: CommentBlock, index: number) => {
    return (
      <div
        css={{
          background: '#f8f9fa',
          border: '1px solid #e9ecef',
          borderRadius: '4px',
          padding: '12px 16px',
          margin: '8px 0',
          position: 'relative',
        }}
      >
        {/* 마크다운 파싱된 블록들을 렌더링 */}
        <div css={EMOTION_STYLES}>
          {block.blocks.map((commentBlock, j) => (
            <BlockRenderer key={`comment-${index}-${j}`} block={commentBlock} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        gap: '20px',
        display: 'flex',
        flexDirection: 'column',
        paddingBottom: '120px',
      }}
    >
      <div>
        <span style={{ fontSize: '22px', fontWeight: 'bold' }}>{title}</span>
        {isEditing && (
          <span
            css={{
              marginLeft: '16px',
              fontSize: '14px',
              color: '#007bff',
              background: '#e3f2fd',
              padding: '4px 8px',
              borderRadius: '4px',
            }}
          >
            ✏️ 편집 모드
          </span>
        )}
      </div>

      {isEditing ? (
        // 편집 모드: editableBlocks가 준비되면 렌더링
        editableBlocks.length > 0 ? (
          <BlogEditPage key="edit-mode" blockList={editableBlocks} />
        ) : (
          <div css={{ textAlign: 'center', padding: '20px', color: '#999' }}>
            ⏳ 편집 모드 준비 중...
          </div>
        )
      ) : (
        // 일반 모드
        <div>
          {blocks.map((block, i) => {
            if (block.type === 'code') {
              return (
                <pre
                  key={i}
                  style={{
                    background: '#111',
                    color: '#ddd',
                    padding: 16,
                    overflowX: 'auto',
                    borderRadius: '4px',
                    margin: '16px 0',
                  }}
                >
                  <code>{block.code}</code>
                </pre>
              )
            }

            if (block.type === 'comment') {
              return renderStaticCommentBlock(block as CommentBlock, i)
            }

            if (block.type === 'heading' || block.type === 'paragraph') {
              return <BlockRenderer key={i} block={block} />
            }

            return null
          })}
        </div>
      )}

      <FloatingButton
        text={isEditing ? '저장하기' : '수정하기'}
        onClick={onClickEdit}
      />
    </div>
  )
}
