import { parseInline, type InlineNode } from './inlineParser'

/* ===========================
   TYPES
=========================== */

// Re-export InlineNode for convenience
export type { InlineNode }

export type BlockNode =
  | { type: 'heading'; level: number; children: InlineNode[] }
  | { type: 'paragraph'; children: InlineNode[] }
  | { type: 'list'; ordered: boolean; items: ListItem[] }
  | { type: 'table'; header: TableCell[]; rows: TableCell[][] }
  | { type: 'image'; alt: string; src: string }

export type ListItem = {
  children: InlineNode[]
  nested?: {
    type: 'list'
    ordered: boolean
    items: ListItem[]
  }
}

export type TableCell = {
  children: InlineNode[]
  align?: 'left' | 'center' | 'right'
}

/* ===========================
   MAIN ENTRY
=========================== */

export function parseBlocks(doc: string): BlockNode[] {
  const lines = doc.split('\n')
  const blocks: BlockNode[] = []

  let i = 0

  while (i < lines.length) {
    const raw = lines[i]
    const line = raw.trim()

    if (!line) {
      i++
      continue
    }

    /* ========= HEADING ========= */

    const headingMatch = line.match(/^(\d+)\s+(.*)$/)
    if (headingMatch) {
      blocks.push({
        type: 'heading',
        level: Number(headingMatch[1]),
        children: parseInline(headingMatch[2]),
      })
      i++
      continue
    }

    /* ========= TABLE ========= */

    const table = parseTable(lines, i)
    if (table) {
      blocks.push(table.block)
      i = table.nextIndex
      continue
    }

    /* ========= LIST ========= */

    const listMatch =
      line.match(/^(\s*)[-*+]\s+/) || line.match(/^(\s*)(\d+)\.\s+/)

    if (listMatch) {
      const list = parseList(lines, i)
      blocks.push(list.block)
      i = list.nextIndex
      continue
    }

    /* ========= IMAGE ========= */

    const imageMatch = line.match(/^!\[(.*?)\]\((.*?)\)$/)
    if (imageMatch) {
      blocks.push({
        type: 'image',
        alt: imageMatch[1],
        src: imageMatch[2],
      })
      i++
      continue
    }

    /* ========= PARAGRAPH ========= */

    const paragraphLines = [line]
    i++

    while (i < lines.length && lines[i].trim() !== '') {
      paragraphLines.push(lines[i].trim())
      i++
    }

    blocks.push({
      type: 'paragraph',
      children: parseInline(paragraphLines.join(' ')),
    })
  }

  return blocks
}

/* ===========================
   LIST PARSER
=========================== */

function parseList(lines: string[], startIndex: number) {
  const items: ListItem[] = []

  let i = startIndex
  let baseIndent = -1 // 첫 번째 아이템의 들여쓰기를 기준으로 설정

  while (i < lines.length) {
    const line = lines[i]

    const unorderedMatch = line.match(/^(\s*)[-*+]\s+(.*)/)
    const orderedMatch = line.match(/^(\s*)(\d+)\.\s+(.*)/)

    if (!unorderedMatch && !orderedMatch) break

    const isOrdered = !!orderedMatch
    const actualIndent = (unorderedMatch?.[1] || orderedMatch?.[1] || '').length
    const content = unorderedMatch?.[2] || orderedMatch?.[3]

    // 첫 번째 아이템의 들여쓰기를 기준점으로 설정
    if (baseIndent === -1) {
      baseIndent = actualIndent
    }

    // 기준점과 같은 레벨이거나 더 적은 들여쓰기면 형제로 처리
    if (actualIndent <= baseIndent) {
      const newItem: ListItem = {
        children: parseInline(content!),
      }
      items.push(newItem)
    } else {
      // 더 깊은 들여쓰기는 현재 구현에서는 무시하거나 평면화
      // 일단 형제로 처리
      const newItem: ListItem = {
        children: parseInline(content!),
      }
      items.push(newItem)
    }

    i++
  }

  return {
    block: {
      type: 'list' as const,
      ordered: lines[startIndex].trim().match(/^\d+\./) ? true : false,
      items,
    },
    nextIndex: i,
  }
}

/* ===========================
   TABLE PARSER
=========================== */

function parseTable(lines: string[], startIndex: number) {
  const headerLine = lines[startIndex]
  const separatorLine = lines[startIndex + 1]

  if (!separatorLine) return null
  if (!/^\s*\|?[\s\-:|]+\|?\s*$/.test(separatorLine)) return null

  const alignments = parseAlignment(separatorLine)

  // 테이블 셀 파싱 시 빈 셀도 포함하도록 수정
  const headerCells = headerLine
    .split('|')
    .map((c) => c.trim())
    .slice(1, -1) // 양 끝의 빈 문자열만 제거 (시작/끝 | 때문에 생기는)

  const header: TableCell[] = headerCells.map((cell, i) => ({
    children: parseInline(cell || ''), // 빈 셀도 처리
    align: alignments[i],
  }))

  const rows: TableCell[][] = []
  let i = startIndex + 2

  while (i < lines.length && lines[i].includes('|')) {
    const rowCells = lines[i]
      .split('|')
      .map((c) => c.trim())
      .slice(1, -1) // 양 끝의 빈 문자열만 제거

    rows.push(
      rowCells.map((cell, idx) => ({
        children: parseInline(cell || ''), // 빈 셀도 처리
        align: alignments[idx],
      })),
    )

    i++
  }

  return {
    block: {
      type: 'table' as const,
      header,
      rows,
    },
    nextIndex: i,
  }
}

function parseAlignment(line: string) {
  const cells = line
    .split('|')
    .map((c) => c.trim())
    .filter(Boolean)

  return cells.map((cell) => {
    const left = cell.startsWith(':')
    const right = cell.endsWith(':')

    if (left && right) return 'center'
    if (left) return 'left'
    if (right) return 'right'
    return undefined
  })
}
