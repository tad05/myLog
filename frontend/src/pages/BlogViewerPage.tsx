import { useEffect, useState, useMemo, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { updateProgress } from '../features/readingProgressSlice'
import { Edit3, Save, X } from 'lucide-react'
import type { RootState } from '@/store'
import type { CSSObject } from '@emotion/react'
import { BlockRenderer } from '@/components/renderer/BlockRenderer'
import type { CommentBlock } from '../lib/parser'
import { BlogEditPage } from './BlogEditPage'
import { useFileBlog } from '@/hooks/useProjectFiles'
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

export const BlogViewerPage = ({ fileId }: { fileId: number }) => {
  const dispatch = useDispatch()

  const { serverBlog } = useFileBlog(fileId)
  const [isEditing, setIsEditing] = useState(false)

  // Redux에서 저장된 progress 가져오기
  const savedProgress = useSelector(
    (state: RootState) =>
      state.readingProgress.progressList.find((p) => p.id === fileId)
        ?.percent || 0,
  )

  const blocks = useMemo(() => {
    if (serverBlog?.parsedBlocks) {
      return serverBlog.parsedBlocks
    }
  }, [serverBlog])

  const title = serverBlog?.title || ''

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
      dispatch(updateProgress({ id: fileId, title, percent }))
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
  }, [fileId, title, dispatch])

  const onClickEdit = useCallback(() => {
    setIsEditing(!isEditing)
  }, [isEditing])

  // 주석 블록 렌더링 함수 (정적)
  const renderStaticCommentBlock = (block: CommentBlock, index: number) => {
    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
        <div className="p-6">
          <div css={EMOTION_STYLES}>
            {block.blocks.map((commentBlock, j) => (
              <BlockRenderer
                key={`comment-${index}-${j}`}
                block={commentBlock}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 h-full overflow-y-auto bg-[#f8f9fa]">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex-1">
            <h1 className="text-4xl mb-2 text-gray-900">{title}</h1>
            <p className="text-sm text-gray-500">
              Last updated{' '}
              {new Date().toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>

          {/* Edit/Save Button */}
          <div className="flex gap-2">
            {!isEditing ? (
              <button
                onClick={onClickEdit}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                Edit
              </button>
            ) : (
              <>
                <button
                  onClick={onClickEdit}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={onClickEdit}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
              </>
            )}
          </div>
        </div>

        {/* Content Area */}
        {isEditing ? (
          // 편집 모드: editableBlocks가 준비되면 렌더링
          editableBlocks.length > 0 ? (
            <BlogEditPage key="edit-mode" blockList={editableBlocks} />
          ) : (
            <div className="text-center py-8 text-gray-500">
              ⏳ 편집 모드 준비 중...
            </div>
          )
        ) : (
          // 일반 모드 - figma 스타일의 블록 렌더링
          <div className="space-y-6">
            {serverBlog?.parsedBlocks?.map((block: any, i: number) => {
              if (block.type === 'code') {
                return (
                  <div
                    key={i}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                  >
                    <pre className="bg-gray-900 text-gray-100 p-6 m-0 overflow-x-auto">
                      <code>{block.code}</code>
                    </pre>
                  </div>
                )
              }

              if (block.type === 'comment') {
                return renderStaticCommentBlock(block as CommentBlock, i)
              }

              if (block.type === 'heading' || block.type === 'paragraph') {
                return (
                  <div
                    key={i}
                    className="bg-white rounded-xl border border-gray-200 p-6"
                  >
                    <BlockRenderer block={block} />
                  </div>
                )
              }

              return null
            })}
          </div>
        )}
      </div>
    </div>
  )
}
