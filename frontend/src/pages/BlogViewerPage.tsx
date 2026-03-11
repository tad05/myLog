import { useEffect, useState, useMemo, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { updateProgress } from '../features/readingProgressSlice'
import { Edit3, Save, X } from 'lucide-react'
import type { RootState } from '@/store'
import type { CSSObject } from '@emotion/react'
import { FloatingButton } from '@/components/FloatingButton'
import { parseFileEnhanced } from '../lib/parser'
import testBlock2 from '../mock/testBlockRaw'
import testBlock3 from '../mock/testBlockRaw2'
import { BlockRenderer } from '@/components/renderer/BlockRenderer'
import type { CommentBlock } from '../lib/parser'
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
  const [blogData, setBlogData] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)

  // 새로운 블로그 ID인지 확인하고 데이터 로드
  useEffect(() => {
    if (blogId.startsWith('blog-')) {
      // localStorage에서 업로드된 블로그 데이터 가져오기
      const storedData = localStorage.getItem(`blog_${blogId}`)
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData)
          setBlogData(parsedData)
        } catch (error) {
          console.error('Error parsing stored blog data:', error)
          setBlogData(null)
        }
      }
    } else {
      setBlogData(null)
      // setBlogData(blogId)
    }
  }, [blogId])

  // Redux에서 저장된 progress 가져오기
  const savedProgress = useSelector(
    (state: RootState) =>
      state.readingProgress.progressList.find((p) => p.id === blogId)
        ?.percent || 0,
  )

  const blocks = useMemo(() => {
    console.log('blogData:', blogData)
    // 개별 파일의 블로그 ID인 경우 (blog-xxxxx-0, blog-xxxxx-1 등)
    if (blogData && blogData.fileName) {
      // 이미 파싱된 블록이 있으면 사용
      if (blogData.blocks) {
        return blogData.blocks
      }
    }
    // 기존 업로드 방식 (하위 호환성) - 여러 파일을 합쳐서 표시
    else if (blogData?.uploadedFiles) {
      // 파일 수가 많으면 첫 3개만 파싱 (성능 최적화)
      const filesToParse = blogData.uploadedFiles.slice(0, 3)

      const parseUploadedFiles = async () => {
        const allParsedBlocks: any[] = []

        for (const fileData of filesToParse) {
          try {
            // 파일 내용이 이미 저장되어 있으므로 직접 사용
            const text = fileData.content
            if (!text) {
              console.warn(`No content for file ${fileData.name}`)
              continue
            }

            // 파일 내용이 너무 크면 일부만 파싱 (성능 최적화)
            const truncatedText =
              text.length > 5000
                ? text.substring(0, 5000) +
                  '\n\n... (내용이 너무 길어 일부만 표시됩니다)'
                : text
            const parsedBlocks = parseFileEnhanced(truncatedText)

            // 파일명을 헤딩으로 추가
            const fileName = fileData.name
            const fileHeading = {
              type: 'comment',
              content: `# ${fileName}`,
              blocks: [
                {
                  type: 'heading',
                  level: 1,
                  children: [
                    {
                      type: 'text',
                      value: fileName,
                    },
                  ],
                },
              ],
              position: 'above',
              lineNumber: 0,
              id: `file-header-${Date.now()}-${fileName}`,
            }

            allParsedBlocks.push(fileHeading)
            allParsedBlocks.push(...parsedBlocks)

            // 파일 구분을 위한 구분선 추가 (마지막 파일이 아닌 경우)
            if (filesToParse.indexOf(fileData) < filesToParse.length - 1) {
              const separator = {
                type: 'comment',
                content: '---',
                blocks: [
                  {
                    type: 'paragraph',
                    children: [
                      {
                        type: 'text',
                        value: '---',
                      },
                    ],
                  },
                ],
                position: 'above',
                lineNumber: 0,
                id: `separator-${Date.now()}-${fileData.name}`,
              }
              allParsedBlocks.push(separator)
            }
          } catch (error) {
            console.error(`Failed to parse file ${fileData.name}:`, error)
          }
        }

        // 더 많은 파일이 있다면 안내 메시지 추가
        if (blogData.uploadedFiles.length > 3) {
          const moreFilesNotice = {
            type: 'comment',
            content: `\n## 📁 더 많은 파일 (${blogData.uploadedFiles.length - 3}개)\n\n성능 최적화를 위해 첫 3개 파일만 표시됩니다.`,
            blocks: [
              {
                type: 'heading',
                level: 2,
                children: [
                  {
                    type: 'text',
                    value: `📁 더 많은 파일 (${blogData.uploadedFiles.length - 3}개)`,
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'text',
                    value: '성능 최적화를 위해 첫 3개 파일만 표시됩니다.',
                  },
                ],
              },
            ],
            position: 'above',
            lineNumber: 0,
            id: `more-files-notice-${Date.now()}`,
          }
          allParsedBlocks.push(moreFilesNotice)
        }

        return allParsedBlocks
      }

      // 비동기 파싱 실행
      parseUploadedFiles().then((parsedBlocks) => {
        setBlogData((prev: any) => ({ ...prev, blocks: parsedBlocks }))
      })

      // 아직 파싱 중이면 빈 배열 반환
      return blogData.blocks || []
    }
    console.log(blogId, 'is using default test block')
    if (blogId !== 'blog1') {
      return parseFileEnhanced(testBlock3)
    }
    // 기본 testBlock2 사용
    return parseFileEnhanced(testBlock2)
  }, [blogData])

  const title = blogData?.title || 'test'

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
            {blocks.map((block: any, i: number) => {
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
