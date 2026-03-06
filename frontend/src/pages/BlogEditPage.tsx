import { BlockRenderer } from '@/components/renderer/BlockRenderer'
import { DndProvider } from 'react-dnd/dist/core/DndProvider'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { EnhancedBlockNode, CommentBlock } from '../lib/parser'
import { useDrag } from 'react-dnd/dist/hooks/useDrag/useDrag'
import { useDrop } from 'react-dnd/dist/hooks/useDrop/useDrop'

import { parseBlocks } from '../lib/blockParser'
import { TipTapEditor } from '@/components/TipTapEditor'
import type { CSSObject } from '@emotion/serialize'
import { CodeEditor } from '@/components/CodeEditor'

export const BlogEditPage = ({
  blockList,
}: {
  blockList: EnhancedBlockNode[]
}) => {
  console.log('🎨 [BlogEditPage render] blocks.length:', blockList.length)

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
  const [blocks, setBlocks] = useState<EnhancedBlockNode[]>(() => {
    console.log('🆕 [useState initial] blockList.length:', blockList.length)
    console.log('🆕 Stack trace:', new Error().stack)
    return blockList
  })
  const [editorLoading, setEditorLoading] = useState<{
    [key: number]: boolean
  }>({})

  const [editingBlockIndex, setEditingBlockIndex] = useState<number | null>(
    null,
  )

  // blockList가 변경되면 blocks 업데이트 (초기값 포함)
  useEffect(() => {
    console.log(
      '📦 [BlogEditPage] blockList changed, length:',
      blockList.length,
    )
    console.log('📋 Stack trace:', new Error().stack)
    if (blockList.length > 0) {
      console.log('🔄 Calling setBlocks from useEffect')
      setBlocks(blockList)
    }
  }, [blockList])

  // CodeEditor 로딩 상태 관리
  const handleEditorMount = useCallback((blockIndex: number) => {
    setEditorLoading((prev) => {
      // 이미 false면 업데이트하지 않음 (무한 리렌더링 방지)
      if (prev[blockIndex] === false) return prev
      return { ...prev, [blockIndex]: false }
    })
  }, [])
  // Comment 블록 onChange 콜백
  const handleCommentChange = useCallback(
    (blockIndex: number, htmlValue: string) => {
      console.log('💬 [handleCommentChange] block:', blockIndex)
      console.log('💬 Stack trace:', new Error().stack)
      setBlocks((prevBlocks) => {
        console.log('💬 [setBlocks in handleCommentChange] calling')
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
    console.log(
      '💻 [handleCodeChange] block:',
      blockIndex,
      'value length:',
      value.length,
    )
    console.log('💻 Stack trace:', new Error().stack)
    setBlocks((prevBlocks) => {
      console.log('💻 [setBlocks in handleCodeChange] calling')
      const newBlocks = [...prevBlocks]
      ;(newBlocks[blockIndex] as any).code = value
      return newBlocks
    })
  }, [])
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

    const [{ isDragging }, drag] = useDrag({
      type: 'BLOCK',
      item: { index, blockType: block.type },
      canDrag: () => isDraggable,
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      end: () => {
        // 드래그 완료 후 병합 수행
        console.log('✅ [drag end] Merging adjacent blocks')
        setBlocks((prevBlocks) => mergeAdjacentBlocks(prevBlocks))
      },
    })

    const [{ isOver }, drop] = useDrop({
      accept: 'BLOCK',
      hover: (item: { index: number }, monitor) => {
        if (!isDraggable || item.index === index) return

        const hoverBoundingRect = dragRef.current?.getBoundingClientRect()
        if (!hoverBoundingRect) return

        // hover 중간 지점을 기준으로만 이동 (reorder 최소화)
        const hoverMiddleY =
          (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
        const clientOffset = monitor.getClientOffset()
        if (!clientOffset) return

        const hoverClientY = clientOffset.y - hoverBoundingRect.top

        // 중간 지점 넘으면 이동
        if (item.index < index && hoverClientY < hoverMiddleY) {
          return
        }
        if (item.index > index && hoverClientY > hoverMiddleY) {
          return
        }

        moveBlock(item.index, index)
        item.index = index
      },
      drop: () => {
        // ⚠️ drop 핸들러는 호출되지만 실제 병합은 useDrag의 end에서만 수행
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    })
    // 드래그 앤 드롭 이동 함수
    const moveBlock = useCallback((dragIndex: number, hoverIndex: number) => {
      setBlocks((prevBlocks) => {
        const draggedBlock = prevBlocks[dragIndex]
        const newBlocks = [...prevBlocks]
        newBlocks.splice(dragIndex, 1)
        newBlocks.splice(hoverIndex, 0, draggedBlock)

        // ⚠️ hover 중에는 병합하지 않음 - drop 후에 end에서만 병합됨
        return newBlocks
      })
    }, [])
    // 블록을 마크다운 주석으로 변환하는 함수
    const convertBlockToMarkdownComment = useCallback(
      (block: EnhancedBlockNode): string => {
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
      },
      [],
    )

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
          opacity: isDragging ? 0.5 : 1,
          position: 'relative',
          cursor: isDraggable ? 'grab' : 'default',
          border:
            isOver && isDraggable
              ? '2px dashed #007bff'
              : '2px solid transparent',
          backgroundColor:
            isOver && isDraggable ? 'rgba(0, 123, 255, 0.15)' : 'transparent',
          borderRadius: '4px',
          margin: '8px 0',
          padding: '8px 0',
          transition: 'all 0.15s ease',
          '&:hover': {
            transform: isDragging || !isDraggable ? 'none' : 'translateY(-1px)',
            boxShadow:
              isDragging || !isDraggable ? 'none' : '0 2px 8px rgba(0,0,0,0.1)',
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
  }, [])
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
  return (
    <DndProvider backend={HTML5Backend}>
      <div>
        {blocks.map((block, i) => {
          if (i == 0 && block.type == 'code') {
            console.log(`Rendering block ${i}:`, block)
          }

          const isCurrentlyEditing = editingBlockIndex === i

          return (
            <DraggableBlock
              key={`block-${i}`}
              block={block}
              index={i}
              isDraggable={!isCurrentlyEditing}
            >
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
                          ? convertBlocksToHTML((block as CommentBlock).blocks)
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
                      (block as CommentBlock).blocks.map((commentBlock, j) => (
                        <BlockRenderer
                          key={`comment-${i}-${j}`}
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
                    border: isCurrentlyEditing
                      ? '2px solid #007bff'
                      : '1px solid #e9ecef',
                    borderRadius: '4px',
                    overflow: 'visible',
                    minHeight: '200px',
                    position: 'relative',
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    setEditingBlockIndex(i)
                  }}
                >
                  {editorLoading[i] !== false && (
                    <div
                      css={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(17, 17, 17, 0.9)',
                        zIndex: 10,
                        color: '#ddd',
                        fontSize: '14px',
                      }}
                    >
                      <div css={{ textAlign: 'center' }}>
                        <div css={{ marginBottom: '8px' }}>⏳</div>
                        <div>Loading Editor...</div>
                      </div>
                    </div>
                  )}
                  <CodeEditor
                    key={`code-${i}-${isCurrentlyEditing}`}
                    content={(() => {
                      const codeValue = (block as any).code
                      return codeValue
                    })()}
                    onChange={(value: string) => handleCodeChange(i, value)}
                    readOnly={!isCurrentlyEditing}
                    onMount={() => {
                      handleEditorMount(i)
                    }}
                    height={(() => {
                      const codeValue = (block as any).code
                      // 줄 수에 따른 높이 계산: 최소 200px, 최대 600px
                      const lineCount =
                        (codeValue?.match(/\n/g) || []).length + 1
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
        })}
      </div>
    </DndProvider>
  )
}
