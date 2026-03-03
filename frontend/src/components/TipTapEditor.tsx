import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { TextStyle } from '@tiptap/extension-text-style'
import Typography from '@tiptap/extension-typography'
import Bold from '@tiptap/extension-bold'
import Italic from '@tiptap/extension-italic'
import Code from '@tiptap/extension-code'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableHeader } from '@tiptap/extension-table-header'
import { TableCell } from '@tiptap/extension-table-cell'
import React, { useEffect, memo, useRef, useCallback } from 'react'
/** @jsxImportSource @emotion/react */

interface TipTapEditorProps {
  content: React.ReactNode
  onChange?: (content: string) => void
  readOnly?: boolean
  placeholder?: string
}

const TipTapEditorComponent = ({
  content,
  onChange,
  readOnly = false,
  placeholder = '내용을 입력하세요...',
}: TipTapEditorProps) => {
  // 외부 업데이트 중인지 추적
  const isExternalUpdate = useRef(false)
  // 마지막으로 보낸 값 추적 (중복 onChange 방지)
  const lastSentValue = useRef(content)
  // onChange를 ref로 저장하여 안정적인 참조 유지
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  // 에디터 포커스 아웃 시 저장
  const handleBlur = useCallback(({ editor }: { editor: any }) => {
    const html = editor.getHTML()
    // 이전에 보낸 값과 같으면 호출 안함
    if (html === lastSentValue.current) {
      return
    }

    lastSentValue.current = html
    onChangeRef.current?.(html)
  }, [])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bold: false, // 별도로 설정
        italic: false, // 별도로 설정
        code: false, // 별도로 설정
      }),
      Bold.configure({
        HTMLAttributes: {
          class: 'font-bold',
        },
      }),
      Italic.configure({
        HTMLAttributes: {
          class: 'italic',
        },
      }),
      Code.configure({
        HTMLAttributes: {
          class: 'bg-gray-100 px-1 py-0.5 rounded text-sm font-mono',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline',
        },
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
      TextStyle,
      Typography,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: `${content}`,
    editable: !readOnly,
    onBlur: handleBlur,
    parseOptions: {
      preserveWhitespace: 'full',
    },
  })

  useEffect(() => {
    console.log('Content updated:', content)
    if (!editor) return

    const currentHTML = editor.getHTML()
    const newContent = `${content}`

    // 외부에서 content가 변경되었고, 현재 에디터 내용과 다를 때만 업데이트
    if (newContent !== lastSentValue.current && currentHTML !== newContent) {
      isExternalUpdate.current = true
      lastSentValue.current = newContent
      editor.commands.setContent(newContent, {
        emitUpdate: false,
        parseOptions: {
          preserveWhitespace: 'full',
        },
      })

      // 다음 틱에서 플래그 해제
      requestAnimationFrame(() => {
        isExternalUpdate.current = false
      })
    }
  }, [content, editor])

  // 컴포넌트 언마운트 시 현재 내용 저장 (onBlur가 호출되지 않을 경우 대비)
  useEffect(() => {
    return () => {
      if (editor) {
        const html = editor.getHTML()
        if (html !== lastSentValue.current) {
          onChangeRef.current?.(html)
        }
      }
    }
  }, [editor])

  if (!editor) {
    return null
  }

  return (
    <div
      css={{
        border: '1px solid #e9ecef',
        borderRadius: '4px',
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {!readOnly && (
        <div
          css={{
            borderBottom: '1px solid #e9ecef',
            padding: '8px 12px',
            background: '#f8f9fa',
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            css={{
              padding: '4px 8px',
              borderRadius: '4px',
              border: 'none',
              background: editor.isActive('bold') ? '#007bff' : 'transparent',
              color: editor.isActive('bold') ? 'white' : '#333',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              '&:hover': {
                background: editor.isActive('bold') ? '#0056b3' : '#e9ecef',
              },
            }}
          >
            B
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            css={{
              padding: '4px 8px',
              borderRadius: '4px',
              border: 'none',
              background: editor.isActive('italic') ? '#007bff' : 'transparent',
              color: editor.isActive('italic') ? 'white' : '#333',
              cursor: 'pointer',
              fontSize: '14px',
              fontStyle: 'italic',
              '&:hover': {
                background: editor.isActive('italic') ? '#0056b3' : '#e9ecef',
              },
            }}
          >
            I
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCode().run()}
            css={{
              padding: '4px 8px',
              borderRadius: '4px',
              border: 'none',
              background: editor.isActive('code') ? '#007bff' : 'transparent',
              color: editor.isActive('code') ? 'white' : '#333',
              cursor: 'pointer',
              fontSize: '14px',
              fontFamily: 'monospace',
              '&:hover': {
                background: editor.isActive('code') ? '#0056b3' : '#e9ecef',
              },
            }}
          >
            {'</>'}
          </button>
          <button
            onClick={() => {
              const url = window.prompt('링크 URL을 입력하세요:')
              if (url) {
                editor
                  .chain()
                  .focus()
                  .extendMarkRange('link')
                  .setLink({ href: url })
                  .run()
              }
            }}
            css={{
              padding: '4px 8px',
              borderRadius: '4px',
              border: 'none',
              background: editor.isActive('link') ? '#007bff' : 'transparent',
              color: editor.isActive('link') ? 'white' : '#333',
              cursor: 'pointer',
              fontSize: '14px',
              '&:hover': {
                background: editor.isActive('link') ? '#0056b3' : '#e9ecef',
              },
            }}
          >
            🔗
          </button>

          {/* 구분선 */}
          <div
            css={{
              width: '1px',
              background: '#dee2e6',
              height: '24px',
              margin: '0 4px',
            }}
          />

          {/* 테이블 버튼들 */}
          <button
            onClick={() =>
              editor
                .chain()
                .focus()
                .insertTable({ rows: 3, cols: 3, withHeaderRow: false })
                .run()
            }
            css={{
              padding: '4px 8px',
              borderRadius: '4px',
              border: 'none',
              background: 'transparent',
              color: '#333',
              cursor: 'pointer',
              fontSize: '14px',
              '&:hover': {
                background: '#e9ecef',
              },
            }}
            title="테이블 삽입 (3x3)"
          >
            📊
          </button>
          <button
            onClick={() => editor.chain().focus().addRowBefore().run()}
            disabled={!editor.can().addRowBefore()}
            css={{
              padding: '4px 8px',
              borderRadius: '4px',
              border: 'none',
              background: 'transparent',
              color: '#333',
              cursor: 'pointer',
              fontSize: '12px',
              '&:hover:not(:disabled)': {
                background: '#e9ecef',
              },
              '&:disabled': {
                opacity: 0.3,
                cursor: 'not-allowed',
              },
            }}
            title="위에 행 추가"
          >
            ⬆️+
          </button>
          <button
            onClick={() => editor.chain().focus().addRowAfter().run()}
            disabled={!editor.can().addRowAfter()}
            css={{
              padding: '4px 8px',
              borderRadius: '4px',
              border: 'none',
              background: 'transparent',
              color: '#333',
              cursor: 'pointer',
              fontSize: '12px',
              '&:hover:not(:disabled)': {
                background: '#e9ecef',
              },
              '&:disabled': {
                opacity: 0.3,
                cursor: 'not-allowed',
              },
            }}
            title="아래에 행 추가"
          >
            ⬇️+
          </button>
          <button
            onClick={() => editor.chain().focus().deleteRow().run()}
            disabled={!editor.can().deleteRow()}
            css={{
              padding: '4px 8px',
              borderRadius: '4px',
              border: 'none',
              background: 'transparent',
              color: '#dc3545',
              cursor: 'pointer',
              fontSize: '12px',
              '&:hover:not(:disabled)': {
                background: '#f8d7da',
              },
              '&:disabled': {
                opacity: 0.3,
                cursor: 'not-allowed',
              },
            }}
            title="행 삭제"
          >
            ⬇️-
          </button>
          <button
            onClick={() => editor.chain().focus().addColumnBefore().run()}
            disabled={!editor.can().addColumnBefore()}
            css={{
              padding: '4px 8px',
              borderRadius: '4px',
              border: 'none',
              background: 'transparent',
              color: '#333',
              cursor: 'pointer',
              fontSize: '12px',
              '&:hover:not(:disabled)': {
                background: '#e9ecef',
              },
              '&:disabled': {
                opacity: 0.3,
                cursor: 'not-allowed',
              },
            }}
            title="왼쪽에 열 추가"
          >
            ⬅️+
          </button>
          <button
            onClick={() => editor.chain().focus().addColumnAfter().run()}
            disabled={!editor.can().addColumnAfter()}
            css={{
              padding: '4px 8px',
              borderRadius: '4px',
              border: 'none',
              background: 'transparent',
              color: '#333',
              cursor: 'pointer',
              fontSize: '12px',
              '&:hover:not(:disabled)': {
                background: '#e9ecef',
              },
              '&:disabled': {
                opacity: 0.3,
                cursor: 'not-allowed',
              },
            }}
            title="오른쪽에 열 추가"
          >
            ➡️+
          </button>
          <button
            onClick={() => editor.chain().focus().deleteColumn().run()}
            disabled={!editor.can().deleteColumn()}
            css={{
              padding: '4px 8px',
              borderRadius: '4px',
              border: 'none',
              background: 'transparent',
              color: '#dc3545',
              cursor: 'pointer',
              fontSize: '12px',
              '&:hover:not(:disabled)': {
                background: '#f8d7da',
              },
              '&:disabled': {
                opacity: 0.3,
                cursor: 'not-allowed',
              },
            }}
            title="열 삭제"
          >
            ➡️-
          </button>
          <button
            onClick={() => editor.chain().focus().deleteTable().run()}
            disabled={!editor.can().deleteTable()}
            css={{
              padding: '4px 8px',
              borderRadius: '4px',
              border: 'none',
              background: 'transparent',
              color: '#dc3545',
              cursor: 'pointer',
              fontSize: '14px',
              '&:hover:not(:disabled)': {
                background: '#f8d7da',
              },
              '&:disabled': {
                opacity: 0.3,
                cursor: 'not-allowed',
              },
            }}
            title="테이블 삭제"
          >
            🗑️
          </button>
        </div>
      )}

      <div
        css={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
        }}
      >
        <EditorContent
          editor={editor}
          css={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            '& .ProseMirror': {
              flex: 1,
              minHeight: 0,
              padding: '12px',
              outline: 'none',
              fontSize: '14px',
              lineHeight: 1.5,
              color: '#212529',
              overflowX: 'auto',
              overflowY: 'auto',
              '& p': {
                margin: '0 0 8px 0',
              },
              '& h1, & h2, & h3, & h4, & h5, & h6': {
                margin: '16px 0 8px 0',
                fontWeight: 'bold',
              },
              '& h1': { fontSize: '24px' },
              '& h2': { fontSize: '20px' },
              '& h3': { fontSize: '18px' },
              '& ul': {
                padding: '0 0 0 20px',
                margin: '8px 0',
                listStyleType: 'disc',
              },
              '& ol': {
                padding: '0 0 0 20px',
                margin: '8px 0',
                listStyleType: 'decimal',
              },
              '& li': {
                margin: '4px 0',
              },
              '& .is-editor-empty::before': {
                content: 'attr(data-placeholder)',
                float: 'left',
                color: '#adb5bd',
                pointerEvents: 'none',
                height: 0,
              },
              '& code': {
                background: '#f1f3f4',
                padding: '2px 4px',
                borderRadius: '3px',
                fontSize: '13px',
                fontFamily: 'monospace',
              },
              '& pre': {
                background: '#f8f9fa',
                padding: '12px',
                borderRadius: '4px',
                margin: '8px 0',
                overflow: 'auto',
                '& code': {
                  background: 'none',
                  padding: 0,
                },
              },
              '& blockquote': {
                borderLeft: '4px solid #e9ecef',
                paddingLeft: '12px',
                margin: '8px 0',
                color: '#6c757d',
              },
              '& table': {
                borderCollapse: 'collapse',
                width: '100%',
                margin: '16px 0',
                tableLayout: 'fixed',
              },
              '& td, & th': {
                border: '1px solid #dee2e6',
                padding: '8px 12px',
                textAlign: 'left',
                verticalAlign: 'top',
                minWidth: '50px',
                position: 'relative',
                '& > *': {
                  margin: 0,
                },
              },
              '& th': {
                backgroundColor: '#f8f9fa',
                fontWeight: 'bold',
              },
              '& .selectedCell': {
                background: '#e3f2fd',
              },
              ...(readOnly && {
                cursor: 'default',
              }),
            },
          }}
        />
      </div>
    </div>
  )
}

export const TipTapEditor = memo(TipTapEditorComponent)
