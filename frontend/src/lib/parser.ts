import { parseBlocks } from './blockParser'

// parserSafe.ts
export type BlockNode =
  | { type: 'heading'; level: number; children: InlineNode[] }
  | { type: 'paragraph'; children: InlineNode[] }
  | { type: 'code'; code: string }

export type InlineNode =
  | { type: 'text'; value: string }
  | { type: 'bold'; children: InlineNode[] }
  | { type: 'italic'; children: InlineNode[] }
  | { type: 'link'; url: string; children: InlineNode[] }
  | { type: 'hashtag'; value: string }
  | { type: 'emoji'; value: string }

// 주석 블록 타입 (마크다운 파싱된 블록들 포함)
export type CommentBlock = {
  type: 'comment'
  content: string // 원본 텍스트
  blocks: ReturnType<typeof parseBlocks> // 파싱된 마크다운 블록들
  position: 'above' | 'inline' | 'below'
  lineNumber: number
  id: string
}

// 코드 블록 타입
export type CodeBlock = {
  type: 'code'
  code: string
  lineNumber: number
}

// 향상된 블록 노드 타입
export type EnhancedBlockNode =
  | { type: 'heading'; level: number; children: InlineNode[] }
  | { type: 'paragraph'; children: InlineNode[] }
  | CodeBlock
  | CommentBlock

// 고유 ID 생성 함수
function generateCommentId(lineNumber: number): string {
  return `comment-${lineNumber}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function parseFileEnhanced(content: string): EnhancedBlockNode[] {
  const lines = content.split(/\r?\n/)
  const blocks: EnhancedBlockNode[] = []

  let codeBuffer: string[] = []
  let codeStartLine = -1
  let inBlockComment = false
  let blockCommentBuffer: string[] = []
  let blockCommentStartLine = -1

  function flushCode() {
    if (codeBuffer.length > 0) {
      blocks.push({
        type: 'code',
        code: codeBuffer.join('\n'),
        lineNumber: codeStartLine,
      })
      codeBuffer = []
      codeStartLine = -1
    }
  }

  function flushBlockComment() {
    if (blockCommentBuffer.length > 0) {
      const content = blockCommentBuffer.join('\n').trim()
      blocks.push({
        type: 'comment',
        content,
        blocks: parseBlocks(content), // 마크다운 파싱 추가
        position: 'above',
        lineNumber: blockCommentStartLine,
        id: generateCommentId(blockCommentStartLine),
      })
      blockCommentBuffer = []
      blockCommentStartLine = -1
    }
  }

  function addComment(
    content: string,
    position: 'above' | 'inline' | 'below',
    lineNumber: number,
  ) {
    blocks.push({
      type: 'comment',
      content: content.trim(),
      blocks: parseBlocks(content.trim()), // 마크다운 파싱 추가
      position,
      lineNumber,
      id: generateCommentId(lineNumber),
    })
  }

  function addCodeLine(line: string, lineIndex: number) {
    if (codeStartLine === -1) {
      codeStartLine = lineIndex
    }
    codeBuffer.push(line)
  }

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const rawLine = lines[lineIndex]
    const trimmedLine = rawLine.trim()

    // 멀티라인 블록 주석 처리
    if (inBlockComment) {
      if (trimmedLine.endsWith('*/')) {
        // 블록 주석 종료
        const endContent = trimmedLine.slice(0, -2).trim()
        if (endContent) {
          blockCommentBuffer.push(endContent)
        }
        flushBlockComment()
        inBlockComment = false
      } else {
        // 블록 주석 내용 계속
        blockCommentBuffer.push(rawLine)
      }
      continue
    }

    // 멀티라인 블록 주석 시작
    if (trimmedLine.startsWith('/*') && !trimmedLine.endsWith('*/')) {
      flushCode()
      inBlockComment = true
      blockCommentStartLine = lineIndex
      const startContent = trimmedLine.slice(2).trim()
      if (startContent) {
        blockCommentBuffer.push(startContent)
      }
      continue
    }

    // 빈 라인은 코드 버퍼에 유지
    if (!trimmedLine) {
      if (codeBuffer.length > 0) {
        codeBuffer.push(rawLine)
      }
      continue
    }

    // JSX 블록 주석: {/* ... */}
    const jsxCommentMatch = trimmedLine.match(
      /^\s*\{\s*\/\*\s*(.*?)\s*\*\/\s*\}\s*$/,
    )
    if (jsxCommentMatch) {
      flushCode()
      addComment(jsxCommentMatch[1], 'above', lineIndex)
      continue
    }

    // 한 줄 블록 주석: /* ... */
    const singleLineBlockComment = trimmedLine.match(
      /^\s*\/\*\s*(.*?)\s*\*\/\s*$/,
    )
    if (singleLineBlockComment) {
      flushCode()
      addComment(singleLineBlockComment[1], 'above', lineIndex)
      continue
    }

    // 라인 주석만 있는 경우: // ...
    if (trimmedLine.startsWith('//')) {
      flushCode()
      const commentContent = trimmedLine.slice(2).trim()
      addComment(commentContent, 'above', lineIndex)
      continue
    }

    // 코드와 인라인 주석이 함께 있는 경우
    const inlineCommentResult = parseInlineComment(rawLine)

    if (inlineCommentResult.hasComment) {
      // 코드 부분이 있으면 추가
      if (inlineCommentResult.codePart.trim()) {
        addCodeLine(inlineCommentResult.codePart, lineIndex)
        flushCode()
      }
      // 주석 부분 추가
      addComment(inlineCommentResult.commentPart, 'inline', lineIndex)
    } else {
      // 순수 코드 라인
      addCodeLine(rawLine, lineIndex)
    }
  }

  // 마지막에 남아있는 블록들 처리
  flushCode()
  flushBlockComment() // 멀티라인 주석이 끝나지 않은 경우도 처리
  return blocks
}

// 라인에서 코드와 인라인 주석을 분리하는 함수
function parseInlineComment(line: string): {
  hasComment: boolean
  codePart: string
  commentPart: string
} {
  let inString = false
  let stringChar = ''
  let escaped = false

  for (let i = 0; i < line.length - 1; i++) {
    const char = line[i]
    const nextChar = line[i + 1]

    // 이스케이프 처리
    if (escaped) {
      escaped = false
      continue
    }

    if (char === '\\') {
      escaped = true
      continue
    }

    // 문자열 상태 관리
    if (!inString && isQuoteChar(char)) {
      inString = true
      stringChar = char
      continue
    }

    if (inString && char === stringChar) {
      inString = false
      stringChar = ''
      continue
    }

    // 문자열 밖에서만 주석 체크
    if (!inString && char === '/' && nextChar === '/') {
      // URL 패턴인지 확인
      if (isUrlPattern(line, i)) {
        continue
      }

      return {
        hasComment: true,
        codePart: line.slice(0, i).trimEnd(),
        commentPart: line.slice(i + 2).trim(),
      }
    }
  }

  return {
    hasComment: false,
    codePart: line,
    commentPart: '',
  }
}

// 따옴표 문자인지 확인
function isQuoteChar(char: string): boolean {
  return char === '"' || char === "'" || char === '`'
}

// URL 패턴인지 확인
function isUrlPattern(line: string, position: number): boolean {
  if (position < 4) return false

  const beforeSlashes = line
    .slice(Math.max(0, position - 5), position)
    .toLowerCase()
  const urlProtocols = ['http:', 'https:', 'ftp:', 'file:']

  return urlProtocols.some((protocol) => beforeSlashes.includes(protocol))
}
