import { useState, useRef, useEffect } from 'react'
import MonacoEditor, { type Monaco } from '@monaco-editor/react'
import Tomorrow from '../themes/Tomorrow.json'

export const CodeEditor = ({
  content,
  onChange,
  readOnly = false,
}: {
  content?: string
  onChange?: (value: string) => void
  readOnly?: boolean
}) => {
  const editorRef = useRef<any>(null)
  const monacoRef = useRef<any>(null)
  // onChange를 ref로 저장하여 안정적인 참조 유지
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange
  // 🔹 에디터 마운트 시
  const handleMount = (editor: any, monaco: any) => {
    editorRef.current = editor
    monacoRef.current = monaco

    // ✅ blur 이벤트 등록
    editor.onDidBlurEditorWidget(() => {
      const currentValue = editor.getValue()
      onChangeRef.current?.(currentValue)
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
    return () => {
      if (editorRef.current) {
        const currentValue = editorRef.current.getValue()
        if (currentValue !== content) {
          onChangeRef.current?.(currentValue)
        }
      }
    }
  }, [editorRef.current, content])

  return (
    <MonacoEditor
      width="100%"
      height="100vh"
      defaultLanguage="html"
      value={content}
      theme="Tomorrow"
      beforeMount={handleEditorCustom}
      onMount={handleMount}
      options={{
        fontSize: 16,
        minimap: { enabled: false },
        readOnly: readOnly,
      }}
    />
  )
}
