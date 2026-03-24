import {
  useEffect,
  useRef,
  memo,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react'
import { BlockRenderer } from '@/components/renderer/BlockRenderer'
import { DndProvider } from 'react-dnd/dist/core/DndProvider'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useState } from 'react'
import type { EnhancedBlockNode, CommentBlock } from '../lib/parser'
import { useDrag } from 'react-dnd/dist/hooks/useDrag/useDrag'
import { useDrop } from 'react-dnd/dist/hooks/useDrop/useDrop'

import { TipTapEditor } from '@/components/TipTapEditor'
import type { CSSObject } from '@emotion/serialize'
import { CodeEditor } from '@/components/CodeEditor'
import { parseHTMLToBlocks } from '../lib/htmlUnparser'

// 블록 항목 컴포넌트를 외부로 분리 (호버 시 불필요한 리렌더링 방지)
const BlockItem = memo(
  ({
    block,
    index,
    isEditing,
    onCommentChange,
    onCodeChange,
    onSetEditing,
    EMOTION_STYLES,
    convertBlocksToHTML,
    DraggableBlock,
  }: {
    block: EnhancedBlockNode
    index: number
    isEditing: boolean
    onCommentChange: (index: number, value: string) => void
    onCodeChange: (index: number, value: string) => void
    onSetEditing: (index: number) => void
    EMOTION_STYLES: CSSObject
    convertBlocksToHTML: (blocks: any[]) => string
    DraggableBlock: any
  }) => {
    // 📍 BlockItem props 변경 감지
    useEffect(() => {
      console.log(`📍 [BlockItem] index ${index} props:`, {
        blockType: block.type,
        blockContent:
          block.type === 'code'
            ? (block as any).code?.substring(0, 50) + '...'
            : (block as CommentBlock).content?.substring(0, 50) + '...',
        isEditing,
        timestamp: Date.now(),
      })
    }, [
      index,
      block.type,
      isEditing,
      onCommentChange,
      onCodeChange,
      onSetEditing,
    ])

    // 📍 리렌더링 감지
    console.log(`📍 [BlockItem] Rendering index ${index}, type: ${block.type}`)

    return (
      <DraggableBlock block={block} index={index} isDraggable={!isEditing}>
        {block.type === 'comment' ? (
          isEditing ? (
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
                    ? convertBlocksToHTML((block as CommentBlock).blocks)
                    : (block as CommentBlock).content
                }
                onChange={(value: string) => onCommentChange(index, value)}
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
                onSetEditing(index)
              }}
            >
              {(block as CommentBlock).blocks.length > 0 ? (
                (block as CommentBlock).blocks.map((commentBlock, j) => (
                  <BlockRenderer
                    key={`comment-${index}-${j}`}
                    block={commentBlock}
                  />
                ))
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
          <div
            data-code-block
            css={{
              border: isEditing ? '2px solid #007bff' : '1px solid #e9ecef',
              borderRadius: '4px',
              overflow: 'visible',
              minHeight: '200px',
              position: 'relative',
            }}
            onClick={(e) => {
              e.stopPropagation()
              onSetEditing(index)
            }}
          >
            <CodeEditor
              key={`code-${index}`}
              content={(() => {
                const codeValue = (block as any).code
                return codeValue
              })()}
              onChange={(value: string) => onCodeChange(index, value)}
              readOnly={!isEditing}
              height={(() => {
                const codeValue = (block as any).code
                // 줄 수에 따른 높이 계산: 최소 200px, 최대 600px
                const lineCount = (codeValue?.match(/\n/g) || []).length + 1
                const calculatedHeight = Math.min(
                  Math.max(lineCount * 24 + 40, 200),
                  600,
                )
                return `${calculatedHeight}px`
              })()}
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
            }}
          >
            <BlockRenderer block={block} />
          </div>
        )}
      </DraggableBlock>
    )
  },
  (prevProps, nextProps) => {
    // 📍 memo 비교 로그
    const blockChanged = prevProps.block !== nextProps.block
    const indexChanged = prevProps.index !== nextProps.index
    const isEditingChanged = prevProps.isEditing !== nextProps.isEditing
    const onCommentChangeChanged =
      prevProps.onCommentChange !== nextProps.onCommentChange
    const onCodeChangeChanged =
      prevProps.onCodeChange !== nextProps.onCodeChange
    const onSetEditingChanged =
      prevProps.onSetEditing !== nextProps.onSetEditing

    const shouldRerender =
      blockChanged ||
      indexChanged ||
      isEditingChanged ||
      onCommentChangeChanged ||
      onCodeChangeChanged ||
      onSetEditingChanged

    // true를 반환하면 리렌더링 스킵, false를 반환하면 리렌더링
    return !shouldRerender
  },
)

export const BlogEditPage = forwardRef<
  { getCurrentBlocks: () => EnhancedBlockNode[] },
  { blockList: EnhancedBlockNode[] }
>(({ blockList }, ref) => {
  // 📍 BlogEditPage 리렌더링 감지
  console.log(
    '📍 [BlogEditPage] 리렌더링 발생, blockList length:',
    blockList.length,
  )

  // 최신 blockList 상태를 추적하는 ref
  const blockListRef = useRef<EnhancedBlockNode[]>(blockList)

  // 부모가 호출할 수 있는 메서드 노출
  useImperativeHandle(
    ref,
    () => ({
      getCurrentBlocks: () => blockListRef.current,
    }),
    [],
  )

  // blockList prop이 변경될 때마다 ref 업데이트
  useEffect(() => {
    blockListRef.current = blockList
  }, [blockList])

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

  const [editingBlockIndex, setEditingBlockIndex] = useState<number | null>(
    null,
  )
  const [insertAfterIndex, setInsertAfterIndex] = useState<number | null>(null)
  const [_, setForceUpdate] = useState(0)

  // 자동 스크롤 상태
  const [__, setScrollDirection] = useState<'up' | 'down' | null>(null)

  // 드래그 중 자동 스크롤 핸들러
  const handleDragScroll = useCallback(() => {
    let lastScrollTime = 0

    return (clientY: number) => {
      const now = Date.now()

      // 60fps (16.67ms) 간격으로 스크롤 실행
      if (now - lastScrollTime < 16) return

      lastScrollTime = now

      const scrollSpeed = 50
      const topMargin = 80 // 상단 스크롤 영역
      const extraMargin = 100 // 하단 FloatingButton 기준 여유분

      // 실제 스크롤 컨테이너 찾기
      const scrollContainer = document.querySelector(
        '[data-scroll-container]',
      ) as HTMLElement
      if (!scrollContainer) {
        console.log('❌ 스크롤 컨테이너를 찾을 수 없음')
        return
      }

      // 스크롤 컨테이너의 화면상 위치
      const containerRect = scrollContainer.getBoundingClientRect()
      const containerTop = containerRect.top
      const containerBottom = containerRect.bottom

      // FloatingButton 위치 찾기
      const floatingButton = document.querySelector(
        'button[data-floating-button]',
      ) as HTMLButtonElement
      let floatingButtonTop = containerBottom // 기본값

      if (floatingButton) {
        const buttonRect = floatingButton.getBoundingClientRect()
        floatingButtonTop = buttonRect.top
      }

      const currentScrollY = scrollContainer.scrollTop
      const containerHeight = scrollContainer.clientHeight
      const contentHeight = scrollContainer.scrollHeight
      const maxScroll = Math.max(0, contentHeight - containerHeight)

      // 스크롤 가능 여부
      const canScrollUp = currentScrollY > 0
      const canScrollDown =
        currentScrollY < maxScroll || contentHeight > containerHeight

      // 스크롤 영역 정의
      const topScrollZone = containerTop + topMargin
      const bottomScrollZone = floatingButtonTop - extraMargin

      // 스크롤 방향 결정
      const willScrollUp = clientY < topScrollZone && canScrollUp
      const willScrollDown = clientY > bottomScrollZone && canScrollDown

      // 시각적 피드백 업데이트
      if (willScrollUp) {
        setScrollDirection('up')
      } else if (willScrollDown) {
        setScrollDirection('down')
      } else {
        setScrollDirection(null)
      }

      // 실제 스크롤 실행
      if (willScrollUp) {
        // App.tsx에 상단 스크롤 시각적 피드백 전송
        window.dispatchEvent(
          new CustomEvent('dragScrollDirection', { detail: 'up' }),
        )
        const newScrollY = Math.max(0, currentScrollY - scrollSpeed)
        scrollContainer.scrollTop = newScrollY
      } else if (willScrollDown) {
        // App.tsx에 하단 스크롤 시각적 피드백 전송
        window.dispatchEvent(
          new CustomEvent('dragScrollDirection', { detail: 'down' }),
        )
        let newScrollY
        if (maxScroll === 0 || currentScrollY >= maxScroll) {
          // 더 이상 스크롤할 공간이 없으면 공간 확보
          const currentMinHeight =
            parseInt(scrollContainer.style.minHeight) || containerHeight * 1.5
          scrollContainer.style.minHeight = `${currentMinHeight + 200}px`
          newScrollY = currentScrollY + scrollSpeed
        } else {
          newScrollY = Math.min(maxScroll, currentScrollY + scrollSpeed)
        }
        scrollContainer.scrollTop = newScrollY
      } else {
        // 스크롤이 없을 때 시각적 피드백 제거
        window.dispatchEvent(
          new CustomEvent('dragScrollDirection', { detail: null }),
        )
      }
    }
  }, [])() // 즉시 실행하여 클로저로 lastScrollTime 보존
  // Comment 블록 onChange 콜백 (메모이제이션)
  const handleCommentChange = useCallback(
    (blockIndex: number, htmlValue: string) => {
      console.log('📝 [handleCommentChange] HTML input:', htmlValue)

      // HTML을 블록 구조로 마이그레이션
      const parsed = parseHTMLToBlocks(htmlValue)

      console.log('📝 [handleCommentChange] Parsed result:', parsed)

      // CommentBlock 업데이트
      ;(blockList[blockIndex] as CommentBlock).content = parsed.content
      ;(blockList[blockIndex] as CommentBlock).blocks = parsed.blocks

      // ref도 업데이트 (최신 상태 반영)
      blockListRef.current = [...blockList]

      console.log(
        '📝 [handleCommentChange] Updated block:',
        blockList[blockIndex],
      )
    },
    [blockList],
  )
  // Code 블록 onChange 콜백 (메모이제이션)
  const handleCodeChange = useCallback(
    (blockIndex: number, value: string) => {
      // 현재는 로컬 변경만 처리
      ;(blockList[blockIndex] as any).code = value

      // ref도 업데이트 (최신 상태 반영)
      blockListRef.current = [...blockList]
    },
    [blockList],
  )

  // 편집 상태 설정 콜백 (메모이제이션)
  const handleSetEditing = useCallback(
    (index: number) => {
      setEditingBlockIndex(index)
    },
    [], // setEditingBlockIndex는 안정적이므로 의존성에서 제거
  )

  // 새 블록 추가 함수
  const insertBlock = (afterIndex: number, type: 'code' | 'comment') => {
    const newBlock: EnhancedBlockNode =
      type === 'code'
        ? { type: 'code', code: '', lineNumber: 0 }
        : {
            type: 'comment',
            content: '',
            blocks: [],
            position: 'inline',
            lineNumber: 0,
            id: `comment-${Date.now()}`,
          }

    blockList.splice(afterIndex + 1, 0, newBlock as any)

    // ref도 업데이트
    blockListRef.current = [...blockList]

    setInsertAfterIndex(null)

    // 새로 추가된 블록을 즉시 편집 모드로 전환
    setEditingBlockIndex(afterIndex + 1)
  }

  // 드래그 앤 드롭 이동 함수
  const moveBlock = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      const draggedBlock = blockList[dragIndex]
      blockList.splice(dragIndex, 1)
      blockList.splice(hoverIndex, 0, draggedBlock)

      // ref도 업데이트
      blockListRef.current = [...blockList]

      // React가 변경을 감지하도록 강제 리렌더링
      setForceUpdate((prev) => prev + 1)
    },
    [blockList],
  )

  // 인접한 같은 타입의 블록들을 병합하는 함수
  const mergeAdjacentBlocks = useCallback(() => {
    console.log('🔗 인접 블록 병합 시작')

    let merged = false

    for (let i = blockList.length - 1; i > 0; i--) {
      const currentBlock = blockList[i]
      const prevBlock = blockList[i - 1]

      // 인접한 블록이 같은 타입이면 병합
      if (currentBlock.type === prevBlock.type) {
        if (currentBlock.type === 'code') {
          // 코드 블록 병합
          const currentCode = (currentBlock as any).code || ''
          const prevCode = (prevBlock as any).code || ''
          ;(prevBlock as any).code = prevCode + '\n' + currentCode

          console.log('🔗 코드 블록 병합:', { index: i - 1 })
        } else if (currentBlock.type === 'comment') {
          // 댓글 블록 병합
          const currentContent = (currentBlock as CommentBlock).content || ''
          const prevContent = (prevBlock as CommentBlock).content || ''
          ;(prevBlock as CommentBlock).content =
            prevContent + '\n' + currentContent

          // blocks 배열도 병합
          const currentBlocks = (currentBlock as CommentBlock).blocks || []
          const prevBlocks = (prevBlock as CommentBlock).blocks || []
          ;(prevBlock as CommentBlock).blocks = [
            ...prevBlocks,
            ...currentBlocks,
          ]

          console.log('🔗 댓글 블록 병합:', { index: i - 1 })
        }

        // 현재 블록 제거
        blockList.splice(i, 1)

        // 병합된 블록을 편집 모드로 전환
        setEditingBlockIndex(i - 1)

        merged = true
        console.log('blockList', blockList)
      }
    }

    // 병합이 발생한 경우에만 리렌더링
    if (merged) {
      // ref도 업데이트
      blockListRef.current = [...blockList]
      setForceUpdate((prev) => prev + 1)
    }
  }, [blockList])

  // 드래그 가능한 블록 컴포넌트 (모든 타입 지원)
  const DraggableBlock = ({
    block,
    index,
    children,
    isDraggable = true,
  }: {
    block: EnhancedBlockNode
    index: number
    children: React.ReactNode
    isDraggable?: boolean
  }) => {
    const dragRef = useRef<HTMLDivElement>(null)
    const dragHandleRef = useRef<HTMLDivElement>(null)

    const [{ isDragging: dragIsDragging }, drag] = useDrag({
      type: 'BLOCK',
      item: { index, blockType: block.type },
      canDrag: () => isDraggable,
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      end: () => {
        console.log('✅ [drag end] 드래그 완료')
        setScrollDirection(null) // 스크롤 방향 초기화
        // App.tsx에 시각적 피드백 제거 전송
        window.dispatchEvent(
          new CustomEvent('dragScrollDirection', { detail: null }),
        )
        // 드래그 완료 후 인접한 같은 타입 블록들 병합
        console.log('✅ [drag end] Merging adjacent blocks')
        mergeAdjacentBlocks()
      },
    })

    const [{}, drop] = useDrop({
      accept: 'BLOCK',
      hover: (item: { index: number; blockType: string }, monitor) => {
        if (!isDraggable || !dragRef.current) return

        const dragIndex = item.index
        const hoverIndex = index

        // 같은 위치면 무시
        if (dragIndex === hoverIndex) {
          return
        }

        const hoverBoundingRect = dragRef.current.getBoundingClientRect()
        const hoverHeight = hoverBoundingRect.bottom - hoverBoundingRect.top
        const clientOffset = monitor.getClientOffset()

        if (!clientOffset) return

        const hoverClientY = clientOffset.y - hoverBoundingRect.top

        // 드래그 중 자동 스크롤 처리
        requestAnimationFrame(() => {
          handleDragScroll(clientOffset.y)
        })

        const hoverMiddle = hoverHeight / 2

        // 위에서 아래로 드래그할 때: 50%를 넘어야 이동
        if (dragIndex < hoverIndex && hoverClientY < hoverMiddle) {
          return
        }
        // 아래에서 위로 드래그할 때: 50% 위에 있어야 이동
        if (dragIndex > hoverIndex && hoverClientY > hoverMiddle) {
          return
        }

        // 같은 위치로 이동하려는 경우 방지 (이미 이동했을 수 있음)
        if (item.index === index) {
          return
        }

        // 블록 위치 바꾸기 (hover 중에 실시간으로)
        moveBlock(dragIndex, hoverIndex)
        item.index = hoverIndex // 아이템 인덱스도 업데이트

        // 이동 후 바로 return (같은 호버에서 중복 이동 방지)
        return
      },
      drop: () => {
        // 이미 hover에서 이동했으므로 여기서는 별도 작업 없음
        console.log('💧 드롭 완료')
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    })
    const convertBlockToMarkdownComment = (
      block: EnhancedBlockNode,
    ): string => {
      if (block.type === 'comment') {
        const commentBlock = block as CommentBlock

        // 파싱된 블록들을 마크다운으로 변환
        const convertToMarkdown = (blocks: any[]): string => {
          const getText = (children: any[]): string => {
            return children
              .map((child: any) => {
                if (child.type === 'text') return child.value || ''
                if (child.type === 'bold')
                  return `**${getText(child.children)}**`
                if (child.type === 'italic')
                  return `*${getText(child.children)}*`
                if (child.type === 'code')
                  return `\`${getText(child.children)}\``
                if (child.type === 'link')
                  return `[${getText(child.children)}](${child.url || ''})`
                if (child.type === 'hashtag') return `#${child.value || ''}`
                if (child.type === 'emoji') return child.value || ''
                if (child.children) return getText(child.children)
                return ''
              })
              .join('')
          }
          return blocks
            .map((b: any) => {
              switch (b.type) {
                case 'paragraph':
                  // children에서 텍스트 추출

                  return getText(b.children || [])

                case 'heading':
                  const headingText = getText(b.children || [])
                  return `${'#'.repeat(b.level || 1)} ${headingText}`

                case 'list':
                  const listItems = b.items
                    .map((item: any, idx: number) => {
                      const itemText = getText(item.children || [])
                      const prefix = b.ordered ? `${idx + 1}.` : '-'
                      return `  ${prefix} ${itemText}`
                    })
                    .join('\n')
                  return listItems

                case 'table':
                  if (b.header && b.rows) {
                    const headerRow = `  | ${b.header.map((cell: any) => getText(cell.children || [])).join(' | ')} |`
                    const separator = `  |${b.header.map(() => '---|').join('')}`
                    const dataRows = b.rows
                      .map(
                        (row: any[]) =>
                          `  | ${row.map((cell: any) => getText(cell.children || [])).join(' | ')} |`,
                      )
                      .join('\n')
                    return `${headerRow}\n${separator}\n${dataRows}`
                  }
                  return ''

                default:
                  return ''
              }
            })
            .filter(Boolean)
            .join('\n')
        }

        if (commentBlock.blocks.length > 0) {
          const markdown = convertToMarkdown(commentBlock.blocks)
          return `/*\n${markdown}\n  */`
        } else {
          // HTML 콘텐츠를 간단하게 변환 (임시)
          return `/*\n  ${commentBlock.content}\n  */`
        }
      } else if (block.type === 'code') {
        return (block as any).code || ''
      }

      return ''
    }

    useEffect(() => {
      // 드래그 가능할 때만 ref 연결
      if (isDraggable && dragRef.current) {
        drag(drop(dragRef))

        // 네이티브 드래그도 활성화
        const element = dragRef.current
        element.setAttribute('draggable', 'true')

        const handleNativeDragStart = (e: DragEvent) => {
          const markdownContent = convertBlockToMarkdownComment(block)
          e.dataTransfer?.setData('text/plain', markdownContent)
          if (e.dataTransfer) {
            e.dataTransfer.effectAllowed = 'copy'
          }
        }

        element.addEventListener('dragstart', handleNativeDragStart)

        return () => {
          element.removeEventListener('dragstart', handleNativeDragStart)
        }
      }
    }, [drag, drop, isDraggable, block])

    // 드래그 핸들에서만 네이티브 드래그 시작
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
      if (!isDraggable) {
        e.preventDefault()
        return
      }

      const markdownContent = convertBlockToMarkdownComment(block)
      e.dataTransfer.setData('text/plain', markdownContent)
      e.dataTransfer.effectAllowed = 'copy'
    }

    return (
      <div
        ref={(el) => {
          dragRef.current = el
          drag(drop(el))
        }}
        css={{
          opacity: dragIsDragging ? 0.5 : 1,
          position: 'relative',
          cursor: isDraggable ? 'grab' : 'default',
          borderRadius: '4px',
          margin: '8px 0',
          padding: '8px 0',
          transition: 'all 0.15s ease',
          transform: dragIsDragging ? 'rotate(2deg) scale(1.05)' : 'none',
          '&:hover': {
            transform:
              dragIsDragging || !isDraggable ? 'none' : 'translateY(-1px)',
            boxShadow:
              dragIsDragging || !isDraggable
                ? 'none'
                : '0 2px 8px rgba(0,0,0,0.1)',
          },
          '&:active': {
            cursor: isDraggable ? 'grabbing' : 'default',
          },
        }}
      >
        {isDraggable && (
          <div
            ref={dragHandleRef}
            draggable={true}
            onDragStart={handleDragStart}
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
              cursor: 'grab',
              '&:active': {
                cursor: 'grabbing',
              },
            }}
          >
            🔄 드래그 이동
          </div>
        )}
        {children}
      </div>
    )
  }
  // 파싱된 블록들을 HTML 문자열로 변환 (TipTap용)
  const convertBlocksToHTML = (blocks: any[]): string => {
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
      const listTag = block.ordered ? 'ol' : 'ul'
      const listStyle = block.ordered
        ? BLOCK_HTML_STYLES.olStyle
        : BLOCK_HTML_STYLES.ulStyle

      return `<${listTag} style="${listStyle}">${block.items
        .map((item: any) => {
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
            return block.items ? convertListItems(block) : ''
          case 'table':
            if (block.header && block.rows) {
              // TipTap에서는 헤더도 <td>를 사용하고 <thead> 안에 위치
              const headerCells = block.header
                .map((cell: any) => {
                  const cellContent = convertChildren(cell.children)
                  return `<td style="${BLOCK_HTML_STYLES.thStyle}"><p>${cellContent}</p></td>`
                })
                .join('')
              const dataRows = block.rows
                .map((row: any[]) => {
                  const cells = row
                    .map((cell: any) => {
                      const cellContent = convertChildren(cell.children)
                      return `<td style="${BLOCK_HTML_STYLES.tdStyle}"><p>${cellContent}</p></td>`
                    })
                    .join('')
                  return `<tr>${cells}</tr>`
                })
                .join('')
              const tableHTML = `<table style="${BLOCK_HTML_STYLES.tableStyle}"><tbody><tr>${headerCells}</tr>${dataRows}</tbody></table>`
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
  }

  // INSERT 메뉴 UI
  const InsertMenu = ({ afterIndex }: { afterIndex: number }) => (
    <div
      css={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        width: '100%',
        height: '28px',
        cursor: 'pointer',
      }}
    >
      <div css={{ flex: 1, height: '1px', background: '#ddd' }} />

      <button
        onClick={() => insertBlock(afterIndex, 'comment')}
        css={{
          padding: '2px 10px',
          borderRadius: '20px',
          border: '1px solid #ddd',
          background: 'white',
          fontSize: '13px',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          transition: 'all 0.2s ease',
          '&:hover': {
            background: '#f0f0f0',
            borderColor: '#999',
          },
        }}
      >
        + 텍스트
      </button>
      <button
        onClick={() => insertBlock(afterIndex, 'code')}
        css={{
          padding: '2px 10px',
          borderRadius: '20px',
          border: '1px solid #ddd',
          background: 'white',
          fontSize: '13px',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          transition: 'all 0.2s ease',
          '&:hover': {
            background: '#f0f0f0',
            borderColor: '#999',
          },
        }}
      >
        + 코드
      </button>
      <div css={{ flex: 1, height: '1px', background: '#ddd' }} />
    </div>
  )

  // INSERT 메뉴 영역
  const InsertArea = ({
    index,
    showMenu,
  }: {
    index: number
    showMenu: boolean
  }) => (
    <div
      css={{
        height: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onMouseEnter={() => setInsertAfterIndex(index)}
      onMouseLeave={() => setInsertAfterIndex(null)}
    >
      {showMenu && <InsertMenu afterIndex={index} />}
    </div>
  )

  // 편집 모드에서 외부 클릭 감지
  useEffect(() => {
    if (editingBlockIndex !== null) {
      const handleGlobalClick = (e: MouseEvent) => {
        // 편집 중인 요소들 찾기
        const editingElement = document.querySelector('[data-editing-block]')
        const editingCodeElement = document.querySelector('[data-code-block]')

        // Monaco 에디터 요소들도 확인
        const monacoEditor = document.querySelector('.monaco-editor')

        const target = e.target as Node

        // 편집 중인 요소나 Monaco 에디터 내부를 클릭한 경우 무시
        if (
          (editingElement && editingElement.contains(target)) ||
          (editingCodeElement && editingCodeElement.contains(target)) ||
          (monacoEditor && monacoEditor.contains(target))
        ) {
          return
        }

        // 그 외의 경우 편집 모드 종료
        setEditingBlockIndex(null)
      }

      document.addEventListener('click', handleGlobalClick)
      return () => document.removeEventListener('click', handleGlobalClick)
    }
  }, [editingBlockIndex])

  return (
    <DndProvider backend={HTML5Backend}>
      <div>
        {blockList.map((block, i) => (
          <div key={`block-wrapper-${i}`}>
            <BlockItem
              block={block}
              index={i}
              isEditing={editingBlockIndex === i}
              onCommentChange={handleCommentChange}
              onCodeChange={handleCodeChange}
              onSetEditing={handleSetEditing}
              EMOTION_STYLES={EMOTION_STYLES}
              convertBlocksToHTML={convertBlocksToHTML}
              DraggableBlock={DraggableBlock}
            />
            <InsertArea index={i} showMenu={insertAfterIndex === i} />
          </div>
        ))}
      </div>
    </DndProvider>
  )
})
