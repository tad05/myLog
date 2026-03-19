import { type InlineNode, type BlockNode } from './blockParser'

/**
 * HTML을 파싱해서 블록 구조로 변환하는 unparser
 * TipTap 에디터에서 나온 HTML을 원래의 블록 구조로 되돌립니다.
 */

export function parseHTMLToBlocks(html: string): {
  content: string // 마크다운 형태의 content
  blocks: BlockNode[] // BlockNode 배열로 복원
} {
  console.log('🔍 [htmlUnparser] Input HTML:', html)

  // HTML을 DOM으로 파싱
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const body = doc.body

  console.log('🔍 [htmlUnparser] Parsed body:', body)
  console.log('🔍 [htmlUnparser] Body children:', body.childNodes)

  const blocks: BlockNode[] = []
  let markdownContent = ''

  // body의 모든 자식 노드들을 순회
  for (const node of body.childNodes) {
    console.log('🔍 [htmlUnparser] Processing node:', node.nodeType, node)

    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element
      console.log('🔍 [htmlUnparser] Element tag:', element.tagName, element)

      const result = parseElementToBlock(element)

      if (result) {
        console.log('🔍 [htmlUnparser] Parsed block:', result.block)
        blocks.push(result.block)
        markdownContent += result.markdown + '\n'
      }
    } else if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim()
      // 빈 문자열이나 공백만 있는 경우 무시
      if (text && text.length > 0) {
        console.log('🔍 [htmlUnparser] Text node:', text)
        // 텍스트만 있는 경우 paragraph로 처리
        blocks.push({
          type: 'paragraph',
          children: [{ type: 'text', value: text }],
        })
        markdownContent += text + '\n'
      }
    }
  }

  const result = {
    content: markdownContent.trim(),
    blocks,
  }

  console.log('🔍 [htmlUnparser] Final result:', result)
  return result
}

function parseElementToBlock(
  element: Element,
): { block: BlockNode; markdown: string } | null {
  const tagName = element.tagName.toLowerCase()

  switch (tagName) {
    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
    case 'h5':
    case 'h6':
      return parseHeading(element, parseInt(tagName.charAt(1)))

    case 'p':
      return parseParagraph(element)

    case 'ul':
    case 'ol':
      return parseList(element)

    case 'table':
      return parseTable(element)

    case 'img':
      return parseImage(element)

    default:
      // 기타 요소는 paragraph로 처리
      return parseParagraph(element)
  }
}

function parseHeading(
  element: Element,
  level: number,
): { block: BlockNode; markdown: string } {
  const children = parseInlineElements(element)
  const text = extractTextFromInlines(children)

  return {
    block: {
      type: 'heading',
      level,
      children,
    },
    markdown: `${level} ${text}`,
  }
}

function parseParagraph(
  element: Element,
): { block: BlockNode; markdown: string } | null {
  const children = parseInlineElements(element)

  // 빈 children 배열이면 null 반환
  if (children.length === 0) {
    return null
  }

  const markdown = convertInlinesToMarkdown(children)

  return {
    block: {
      type: 'paragraph',
      children,
    },
    markdown,
  }
}

function parseList(element: Element): { block: BlockNode; markdown: string } {
  const isOrdered = element.tagName.toLowerCase() === 'ol'
  const items: Array<{ children: InlineNode[] }> = []
  let markdown = ''

  const listItems = element.querySelectorAll('li')
  listItems.forEach((li, index) => {
    const children = parseInlineElements(li)
    items.push({ children })

    const itemText = extractTextFromInlines(children)
    const prefix = isOrdered ? `${index + 1}.` : '-'
    markdown += `  ${prefix} ${itemText}\n`
  })

  return {
    block: {
      type: 'list',
      ordered: isOrdered,
      items,
    },
    markdown: markdown.trim(),
  }
}

function parseTable(
  element: Element,
): { block: BlockNode; markdown: string } | null {
  const rows = element.querySelectorAll('tr')
  if (rows.length === 0) return null

  // 첫 번째 행을 헤더로 처리
  const headerRow = rows[0]
  const headerCells = headerRow.querySelectorAll('td, th')
  const header = Array.from(headerCells).map((cell) => ({
    children: parseInlineElements(cell),
  }))

  // 나머지 행들을 데이터로 처리
  const dataRows = []
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    const cells = row.querySelectorAll('td, th')
    const rowData = Array.from(cells).map((cell) => ({
      children: parseInlineElements(cell),
    }))
    dataRows.push(rowData)
  }

  // 마크다운 테이블 생성
  let markdown = '  | '
  markdown += header
    .map((cell) => extractTextFromInlines(cell.children))
    .join(' | ')
  markdown += ' |\n  |'
  markdown += header.map(() => '---|').join('')

  dataRows.forEach((row) => {
    markdown += '\n  | '
    markdown += row
      .map((cell) => extractTextFromInlines(cell.children))
      .join(' | ')
    markdown += ' |'
  })

  return {
    block: {
      type: 'table',
      header,
      rows: dataRows,
    },
    markdown,
  }
}

function parseImage(element: Element): { block: BlockNode; markdown: string } {
  const src = element.getAttribute('src') || ''
  const alt = element.getAttribute('alt') || ''

  return {
    block: {
      type: 'image',
      src,
      alt,
    },
    markdown: `![${alt}](${src})`,
  }
}

function parseInlineElements(element: Element): InlineNode[] {
  const nodes: InlineNode[] = []

  for (const node of element.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || ''
      // 빈 문자열이나 공백만 있는 경우 제외
      if (text.trim()) {
        nodes.push({ type: 'text', value: text })
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const childElement = node as Element
      const inlineNode = parseInlineElement(childElement)
      if (inlineNode) {
        nodes.push(inlineNode)
      }
    }
  }

  return nodes
}

function parseInlineElement(element: Element): InlineNode | null {
  const tagName = element.tagName.toLowerCase()
  const className = element.className

  switch (tagName) {
    case 'strong':
    case 'b':
      return {
        type: 'bold',
        children: parseInlineElements(element),
      }

    case 'em':
    case 'i':
      return {
        type: 'italic',
        children: parseInlineElements(element),
      }

    case 'code':
      return {
        type: 'code',
        value: element.textContent || '',
      }

    case 'a':
      return {
        type: 'link',
        url: element.getAttribute('href') || '',
        children: parseInlineElements(element),
      }

    case 'span':
      // TipTap에서 font-bold 클래스로 bold 처리하는 경우
      if (className.includes('font-bold')) {
        return {
          type: 'bold',
          children: parseInlineElements(element),
        }
      }

      // 해시태그나 이모지 처리
      const text = element.textContent || ''
      if (text.startsWith('#')) {
        return {
          type: 'hashtag',
          value: text.substring(1),
        }
      }
      // 일반 span은 text로 처리
      return {
        type: 'text',
        value: text,
      }

    default:
      // 기타 요소는 text로 처리
      return {
        type: 'text',
        value: element.textContent || '',
      }
  }
}

function extractTextFromInlines(inlines: InlineNode[]): string {
  return inlines
    .map((node) => {
      switch (node.type) {
        case 'text':
          return node.value
        case 'bold':
        case 'italic':
        case 'link':
          return extractTextFromInlines(node.children)
        case 'code':
          return node.value
        case 'hashtag':
          return '#' + node.value
        case 'emoji':
          return node.value
        default:
          return ''
      }
    })
    .join('')
}

function convertInlinesToMarkdown(inlines: InlineNode[]): string {
  return inlines
    .map((node) => {
      switch (node.type) {
        case 'text':
          return node.value
        case 'bold':
          return `**${convertInlinesToMarkdown(node.children)}**`
        case 'italic':
          return `*${convertInlinesToMarkdown(node.children)}*`
        case 'code':
          return `\`${node.value}\``
        case 'link':
          return `[${convertInlinesToMarkdown(node.children)}](${node.url})`
        case 'hashtag':
          return '#' + node.value
        case 'emoji':
          return node.value
        default:
          return ''
      }
    })
    .join('')
}
