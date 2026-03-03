import { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { updateProgress } from '../features/readingProgressSlice'
import type { RootState } from '@/store'
import type { CSSObject } from '@emotion/react'
import { FloatingButton } from '@/components/FloatingButton'
import { parseFileEnhanced } from '../lib/parser'
import testBlock2 from '../mock/testBlockRaw'
import { BlockRenderer } from '@/components/renderer/BlockRenderer'
import { TipTapEditor } from '@/components/TipTapEditor'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useDrag, useDrop } from 'react-dnd'
import type { EnhancedBlockNode, CommentBlock } from '../lib/parser'
import { parseBlocks } from '../lib/blockParser'
import { CodeEditor } from '@/components/CodeEditor'
/** @jsxImportSource @emotion/react */

// ===== 스타일 상수 =====
const BLOCK_HTML_STYLES = {
  tableStyle: 'border-collapse: collapse; width: 100%; margin: 16px 0;',
  thStyle:
    'border: 1px solid #dee2e6; padding: 8px 12px; text-align: left; background-color: #f8f9fa; font-weight: bold;',
  tdStyle: 'border: 1px solid #dee2e6; padding: 8px 12px; text-align: left;',
  ulStyle: 'list-style-type: disc; padding-left: 20px; margin: 8px 0;',
  olStyle: 'list-style-type: decimal; padding-left: 20px; margin: 8px 0;',
  liStyle: 'margin-bottom: 4px;',
}

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
  const [editableBlocks, setEditableBlocks] = useState<EnhancedBlockNode[]>([])
  const [editingBlockIndex, setEditingBlockIndex] = useState<number | null>(
    null,
  )

  // Redux에서 저장된 progress 가져오기
  const savedProgress = useSelector(
    (state: RootState) =>
      state.readingProgress.progressList.find((p) => p.id === blogId)
        ?.percent || 0,
  )

  const blocks = useMemo(() => parseFileEnhanced(testBlock2), [])

  // 편집 모드 진입 시 블록 복사
  useEffect(() => {
    if (isEditing) {
      setEditableBlocks([...blocks])
      console.log('Parsed blocks for editing:', blocks)
    }
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

  // 편집 모드에서 외부 클릭 감지
  useEffect(() => {
    if (editingBlockIndex !== null) {
      const handleGlobalClick = (e: MouseEvent) => {
        const editingElement = document.querySelector(
          '[data-editing-block], [data-editing-code-block]',
        )
        if (editingElement && !editingElement.contains(e.target as Node)) {
          setEditingBlockIndex(null)
        }
      }

      document.addEventListener('click', handleGlobalClick)
      return () => document.removeEventListener('click', handleGlobalClick)
    }
  }, [editingBlockIndex])

  // 인접한 블록 병합 함수 (코드 + 코멘트)
  const mergeAdjacentBlocks = useCallback(
    (blocks: EnhancedBlockNode[]): EnhancedBlockNode[] => {
      const merged = []
      let i = 0

      while (i < blocks.length) {
        const current = blocks[i]

        if (current.type === 'code') {
          let combinedCode = (current as any).code
          let j = i + 1

          while (j < blocks.length && blocks[j].type === 'code') {
            combinedCode += '\n\n' + (blocks[j] as any).code
            j++
          }

          merged.push({ ...current, code: combinedCode } as any)
          i = j
        } else if (current.type === 'comment') {
          let combinedContent = (current as CommentBlock).content
          let j = i + 1

          while (j < blocks.length && blocks[j].type === 'comment') {
            combinedContent += '\n\n' + (blocks[j] as CommentBlock).content
            j++
          }

          if (j > i + 1) {
            // 병합이 발생한 경우에만 다시 파싱
            const newBlocks = parseBlocks(combinedContent)
            merged.push({
              ...current,
              content: combinedContent,
              blocks: newBlocks,
            } as CommentBlock)
          } else {
            merged.push(current)
          }
          i = j
        } else {
          merged.push(current)
          i++
        }
      }

      return merged
    },
    [],
  )

  // 드래그 앤 드롭 이동 함수
  const moveBlock = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      setEditableBlocks((prevBlocks) => {
        const draggedBlock = prevBlocks[dragIndex]
        const newBlocks = [...prevBlocks]
        newBlocks.splice(dragIndex, 1)
        newBlocks.splice(hoverIndex, 0, draggedBlock)

        // 블록 병합 로직
        return mergeAdjacentBlocks(newBlocks)
      })
    },
    [mergeAdjacentBlocks],
  )

  // 드래그 가능한 블록 컴포넌트 (모든 타입 지원)
  const DraggableBlock = ({
    block,
    index,
    children,
  }: {
    block: EnhancedBlockNode
    index: number
    children: React.ReactNode
  }) => {
    const dragRef = useRef<HTMLDivElement>(null)

    const [{ isDragging }, drag] = useDrag({
      type: 'BLOCK',
      item: { index, blockType: block.type },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    })

    const [{ isOver }, drop] = useDrop({
      accept: 'BLOCK',
      hover: (item: { index: number }) => {
        if (item.index !== index) {
          moveBlock(item.index, index)
          item.index = index
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    })

    useEffect(() => {
      // ref 연결
      drag(drop(dragRef))
    }, [drag, drop])

    return (
      <div
        ref={dragRef}
        css={{
          opacity: isDragging ? 0.5 : 1,
          cursor: 'grab',
          position: 'relative',
          border: isOver ? '2px dashed #007bff' : '2px solid transparent',
          borderRadius: '4px',
          margin: '8px 0',
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: isDragging ? 'none' : 'translateY(-1px)',
            boxShadow: isDragging ? 'none' : '0 2px 8px rgba(0,0,0,0.1)',
          },
        }}
      >
        <div
          css={{
            position: 'absolute',
            top: '-8px',
            right: '8px',
            fontSize: '12px',
            color: '#6c757d',
            background: 'white',
            padding: '2px 6px',
            borderRadius: '12px',
            border: '1px solid #dee2e6',
            zIndex: 10,
          }}
        >
          🔄 드래그 이동
        </div>
        {children}
      </div>
    )
  }

  // 파싱된 블록들을 HTML 문자열로 변환 (TipTap용)
  const convertBlocksToHTML = useCallback((blocks: any[]): string => {
    // children 배열을 HTML로 변환하는 헬퍼 함수
    const convertChildren = (children: any[]): string => {
      if (!Array.isArray(children) || children.length === 0) {
        return ''
      }
      return children
        .map((child) => {
          switch (child.type) {
            case 'text':
              return child.value || ''
            case 'bold':
              return `<strong>${convertChildren(child.children)}</strong>`
            case 'italic':
              return `<em>${convertChildren(child.children)}</em>`
            case 'link':
              return `<a href="${child.url || ''}">${convertChildren(child.children)}</a>`
            case 'hashtag':
              return `<span style="color: blue;">#${child.value || ''}</span>`
            case 'emoji':
              return child.value || ''
            default:
              return ''
          }
        })
        .join('')
    }

    const convertListItems = (
      block: Extract<any, { type: 'list' }>,
    ): string => {
      console.log('Converting list block:', block)
      const listTag = block.ordered ? 'ol' : 'ul'
      const listStyle = block.ordered
        ? BLOCK_HTML_STYLES.olStyle
        : BLOCK_HTML_STYLES.ulStyle

      return `<${listTag} style="${listStyle}">${block.items
        .map((item: any) => {
          console.log('List item:', item)
          // item.children가 배열인 경우 (파서에서 제공)
          const itemContent = Array.isArray(item.children)
            ? convertChildren(item.children)
            : // item.content가 문자열인 경우 (직접 입력)
              item.content || ''

          return `<li style="${BLOCK_HTML_STYLES.liStyle}"><p>${itemContent}</p>${item.nested ? convertListItems(item.nested) : ''}</li>`
        })
        .join('')}</${listTag}>`
    }

    return blocks
      .map((block) => {
        console.log('Block type:', block.type, block)
        switch (block.type) {
          case 'paragraph':
            if (block.children) {
              return `<p>${convertChildren(block.children)}</p>`
            }
            return `<p>${block.content || ''}</p>`
          case 'heading':
            const headingText = convertChildren(block.children)
            return `<h${block.level || 1}>${headingText}</h${block.level || 1}>`
          case 'image':
            return `<img src="${block.src || ''}" alt="${block.alt || ''}" style="max-width: 100%; margin: 16px 0;" />`
          case 'list':
            console.log('List block found:', block)
            return block.items ? convertListItems(block) : ''
          case 'table':
            console.log('Table block found:', block)
            if (block.header && block.rows) {
              // TipTap에서는 헤더도 <td>를 사용하고 <thead> 안에 위치
              const headerCells = block.header
                .map((cell: any) => {
                  const cellContent = convertChildren(cell.children)
                  console.log('Header cell content:', cellContent)
                  return `<td style="${BLOCK_HTML_STYLES.thStyle}"><p>${cellContent}</p></td>`
                })
                .join('')
              const dataRows = block.rows
                .map((row: any[]) => {
                  const cells = row
                    .map((cell: any) => {
                      const cellContent = convertChildren(cell.children)
                      console.log('Data cell content:', cellContent)
                      return `<td style="${BLOCK_HTML_STYLES.tdStyle}"><p>${cellContent}</p></td>`
                    })
                    .join('')
                  return `<tr>${cells}</tr>`
                })
                .join('')
              const tableHTML = `<table style="${BLOCK_HTML_STYLES.tableStyle}"><tbody><tr>${headerCells}</tr>${dataRows}</tbody></table>`
              console.log('Generated table HTML:', tableHTML)
              return tableHTML
            }
            return ''
          case 'code':
            return `<pre><code>${block.content || ''}</code></pre>`
          default:
            return ''
        }
      })
      .filter(Boolean)
      .join('')
  }, [])

  // Comment 블록 onChange 콜백
  const handleCommentChange = useCallback(
    (blockIndex: number, htmlValue: string) => {
      console.log('Comment changed, HTML:', htmlValue)
      setEditableBlocks((prevBlocks) => {
        const newBlocks = [...prevBlocks]
        // HTML을 그대로 content로 저장
        ;(newBlocks[blockIndex] as CommentBlock).content = htmlValue
        // parseBlocks는 일단 빈 배열로 (HTML 직접 렌더링할 것이므로)
        ;(newBlocks[blockIndex] as CommentBlock).blocks = []
        return newBlocks
      })
    },
    [],
  )

  // Code 블록 onChange 콜백
  const handleCodeChange = useCallback((blockIndex: number, value: string) => {
    setEditableBlocks((prevBlocks) => {
      const newBlocks = [...prevBlocks]
      ;(newBlocks[blockIndex] as any).code = value
      return newBlocks
    })
  }, [])
  const onClickEdit = useCallback(() => {
    setIsEditing(!isEditing)
    console.log('Edit mode:', !isEditing)
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
        // 편집 모드: 드래그 앤 드롭 활성화
        <DndProvider backend={HTML5Backend}>
          <div>
            {editableBlocks.map((block, i) => {
              const isCurrentlyEditing = editingBlockIndex === i

              return (
                <DraggableBlock key={`block-${i}`} block={block} index={i}>
                  {block.type === 'comment' ? (
                    isCurrentlyEditing ? (
                      <div
                        data-editing-block
                        css={{
                          border: '2px solid #007bff',
                          borderRadius: '4px',
                          overflow: 'hidden',
                          height: '300px',
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <TipTapEditor
                          content={
                            (block as CommentBlock).blocks.length > 0
                              ? convertBlocksToHTML(
                                  (block as CommentBlock).blocks,
                                )
                              : (block as CommentBlock).content
                          }
                          onChange={(value: string) =>
                            handleCommentChange(i, value)
                          }
                          readOnly={false}
                        />
                      </div>
                    ) : (
                      <div
                        css={{
                          background: '#f8f9fa',
                          border: '1px solid #e9ecef',
                          borderRadius: '4px',
                          padding: '12px 16px',
                          margin: '8px 0',
                          cursor: 'pointer',
                          ...EMOTION_STYLES,
                        }}
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingBlockIndex(i)
                        }}
                      >
                        {(block as CommentBlock).blocks.length > 0 ? (
                          (block as CommentBlock).blocks.map(
                            (commentBlock, j) => (
                              <BlockRenderer
                                key={`comment-${i}-${j}`}
                                block={commentBlock}
                              />
                            ),
                          )
                        ) : (
                          <div
                            dangerouslySetInnerHTML={{
                              __html: (block as CommentBlock).content,
                            }}
                          />
                        )}
                      </div>
                    )
                  ) : block.type === 'code' ? (
                    isCurrentlyEditing ? (
                      <div
                        data-editing-code-block
                        css={{
                          border: '2px solid #007bff',
                          borderRadius: '4px',
                          overflow: 'hidden',
                          height: '400px',
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <CodeEditor
                          content={(block as any).code}
                          onChange={(value: string) =>
                            handleCodeChange(i, value)
                          }
                          readOnly={false}
                        />
                      </div>
                    ) : (
                      <pre
                        css={{
                          background: '#111',
                          color: '#ddd',
                          padding: 16,
                          overflowX: 'auto',
                          borderRadius: '4px',
                          margin: '16px 0',
                          position: 'relative',
                          cursor: 'pointer',
                        }}
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingBlockIndex(i)
                        }}
                      >
                        <code>{(block as any).code}</code>
                      </pre>
                    )
                  ) : (
                    <div
                      css={{
                        background: '#f8f9fa',
                        border: '1px solid #e9ecef',
                        borderRadius: '4px',
                        padding: '12px 16px',
                        margin: '8px 0',
                      }}
                    >
                      <BlockRenderer block={block} />
                    </div>
                  )}
                </DraggableBlock>
              )
            })}
          </div>
        </DndProvider>
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
