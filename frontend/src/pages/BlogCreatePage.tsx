import { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import { BlogEditPage } from './BlogEditPage'
import { parseFileEnhanced, type EnhancedBlockNode } from '../lib/parser'

export const BlogCreatePage = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileContent, setFileContent] = useState<string>('')
  const inputEl = useRef<HTMLInputElement | null>(null)

  const fileInputHandler = useCallback((event: Event) => {
    const target = event.target as HTMLInputElement
    const files = target && target.files
    if (files && files[0]) {
      setSelectedFile(files[0])

      // 파일 읽기
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setFileContent(content)
      }
      reader.readAsText(files[0])
    }
  }, [])

  useEffect(() => {
    if (inputEl.current !== null) {
      inputEl.current.addEventListener('change', fileInputHandler)
    }
    return () => {
      if (inputEl.current) {
        inputEl.current.removeEventListener('change', fileInputHandler)
      }
    }
  }, [fileInputHandler])

  // 파일 내용을 파싱하여 블록 생성
  const parsedBlocks = useMemo<EnhancedBlockNode[]>(() => {
    if (!fileContent) return []
    console.log('Parsing file content:', parseFileEnhanced(fileContent))
    return parseFileEnhanced(fileContent)
  }, [fileContent])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        padding: '20px',
      }}
    >
      <div
        className="modal"
        style={{ display: selectedFile ? 'none' : 'block' }}
      >
        <label htmlFor="fileInput">
          <div
            style={{
              width: 'fit-content',
              padding: '16px',
              backgroundColor: '#191b27',
              borderRadius: '12px',
              color: 'white',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            🔗 FILE UPLOAD
          </div>
        </label>
        <input
          ref={inputEl}
          style={{ display: 'none' }}
          type="file"
          id="fileInput"
          // onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
          required
        />
      </div>
      <BlogEditPage blockList={parsedBlocks} />
    </div>
  )
}
