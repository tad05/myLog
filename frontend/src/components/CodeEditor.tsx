import { useRef, useEffect, useState } from 'react'
import MonacoEditor, { type Monaco } from '@monaco-editor/react'
import * as monacoEditor from 'monaco-editor'
import Tomorrow from '../themes/Tomorrow.json'
import './codeEditor.css'

export const CodeEditor = ({
  content,
  onChange,
  readOnly = false,
  onMount,
  height = '400px',
  language = 'javascript',
}: {
  content?: string
  onChange?: (value: string) => void
  readOnly?: boolean
  onMount?: () => void
  height?: string
  language?: string
}) => {
  const editorRef = useRef<any>(null)
  const monacoRef = useRef<any>(null)
  // onChange를 ref로 저장하여 안정적인 참조 유지
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange
  const onMountRef = useRef(onMount)
  onMountRef.current = onMount
  const [isMounted, setIsMounted] = useState(false)
  const contentRef = useRef(content)
  // 🔹 에디터 마운트 시
  const handleMount = (
    editor: monacoEditor.editor.IStandaloneCodeEditor,
    monaco: any,
  ) => {
    editorRef.current = editor
    monacoRef.current = monaco
    editorRef.current.setValue(content)
    contentRef.current = content
    // 마운트 완료 콜백 호출
    onMountRef.current?.()
    setIsMounted(true)
    const domNode = editorRef.current.getDomNode()
    if (!domNode) return

    let dropDecoration: monacoEditor.editor.IEditorDecorationsCollection
    dropDecoration = editor.createDecorationsCollection()
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()

      const target = editor.getTargetAtClientPoint(e.clientX, e.clientY)
      if (!target?.position) return

      const { lineNumber, column } = target.position
      dropDecoration.set([
        {
          range: new monacoEditor.Range(lineNumber, column, lineNumber, column),
          options: {
            beforeContentClassName: 'drop-caret-inline',
            stickiness:
              monacoEditor.editor.TrackedRangeStickiness
                .NeverGrowsWhenTypingAtEdges,
          },
        },
      ])
    }

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
    }

    const handleDrop = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()

      const text = e.dataTransfer?.getData('text/plain')
      if (!text) return

      // 마우스 위치에서 에디터 포지션 가져오기
      const target = editor.getTargetAtClientPoint(e.clientX, e.clientY)
      if (!target?.position) {
        return
      }

      const { lineNumber, column } = target.position

      // 이미 /* */ 주석 형식이면 그대로, 아니면 감싸기
      const formatted =
        text.trim().startsWith('/*') && text.trim().endsWith('*/')
          ? text + '\n'
          : text.includes('\n')
            ? `/*\n${text}\n*/\n`
            : `// ${text}\n`

      // 드롭한 위치에 텍스트 삽입
      editor.executeEdits(
        'drop-block',
        [
          {
            range: new monaco.Range(lineNumber, column, lineNumber, column),
            text: formatted,
            forceMoveMarkers: true,
          },
        ],
        [new monaco.Selection(lineNumber, column, lineNumber, column)],
      )
      editor.pushUndoStop()
      editor.focus()
    }

    domNode.addEventListener('dragover', handleDragOver)
    domNode.addEventListener('dragenter', handleDragEnter)
    domNode.addEventListener('drop', handleDrop)
    dropDecoration.clear()

    // ✅ blur 이벤트 등록
    editor.onDidBlurEditorWidget(() => {
      if (!editorRef.current) return

      const currentValue = editorRef.current.getValue()
      if (currentValue) {
        onChangeRef.current?.(currentValue)
      }
    })
  }
  const handleEditorCustom = (monaco: Monaco) => {
    monaco.editor.defineTheme('Tomorrow', Tomorrow)
    // 인라인 주석 하이라이팅 개선
    monaco.languages.setMonarchTokensProvider('javascript', {
      tokenizer: {
        root: [
          [/\/\/.*$/, 'comment.inline'],
          [/\/\*[\s\S]*?\*\//, 'comment.block'],
          [/"([^"\\]|\\.)*$/, 'string.invalid'],
          [/'([^'\\]|\\.)*$/, 'string.invalid'],
          [/"/, 'string', '@string_double'],
          [/'/, 'string', '@string_single'],
        ],
        string_double: [
          [/[^\\"]+/, 'string'],
          [/\\./, 'string.escape.invalid'],
          [/"/, 'string', '@pop'],
        ],
        string_single: [
          [/[^\\']+/, 'string'],
          [/\\./, 'string.escape.invalid'],
          [/'/, 'string', '@pop'],
        ],
      },
    })
  }
  useEffect(() => {
    if (!editorRef.current || !isMounted) {
      return
    }
    // content prop이 유효하고, 현재 ref 값과 다르면 업데이트
    if (content && content !== contentRef.current) {
      editorRef.current.setValue(content)
      contentRef.current = content
    }
  }, [content, isMounted])

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!editorRef.current) return

      const value = editorRef.current.getValue()
      // 페이지 떠나기 전에 최종 값 저장
      console.log('⏹️ [beforeunload] 저장 중...', 'value length:', value.length)
      if (value && value !== contentRef.current) {
        onChangeRef.current?.(value)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])

  useEffect(() => {
    return () => {
      if (editorRef.current) {
        const currentValue = editorRef.current.getValue()
        // 컴포넌트 언마운트 시 최종 값 저장 (블록 이동, 페이지 전환 등)
        if (currentValue && currentValue !== contentRef.current) {
          onChangeRef.current?.(currentValue)
        }
      }
    }
  }, [])
  useEffect(() => {
    // Monaco의 비동기 취소 에러 무시
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason?.message?.includes('Canceled')) {
        event.preventDefault()
      }
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  return (
    <MonacoEditor
      width="100%"
      height={height}
      defaultLanguage={language}
      defaultValue={contentRef.current || ''}
      theme="Tomorrow"
      onMount={handleMount}
      beforeMount={handleEditorCustom}
      options={{
        fontSize: 16,
        minimap: { enabled: false },
        readOnly: readOnly,
        wordWrap: 'on',
        scrollBeyondLastLine: false,
      }}
    />
  )
}
