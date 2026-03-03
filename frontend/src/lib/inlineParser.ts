export type InlineNode =
  | { type: 'text'; value: string }
  | { type: 'bold'; children: InlineNode[] }
  | { type: 'italic'; children: InlineNode[] }
  | { type: 'code'; value: string }
  | { type: 'link'; url: string; children: InlineNode[] }
  | { type: 'hashtag'; value: string }
  | { type: 'emoji'; value: string }

export function parseInline(text: string): InlineNode[] {
  const nodes: InlineNode[] = []
  let i = 0

  function pushText(value: string) {
    if (!value) return
    const last = nodes[nodes.length - 1]
    if (last?.type === 'text') {
      last.value += value
    } else {
      nodes.push({ type: 'text', value })
    }
  }

  function findClosing(marker: string, start: number) {
    let idx = start
    while (idx < text.length) {
      if (text.startsWith(marker, idx)) return idx
      idx++
    }
    return -1
  }

  while (i < text.length) {
    // 🔹 ESCAPE 처리
    if (text[i] === '\\' && i + 1 < text.length) {
      pushText(text[i + 1])
      i += 2
      continue
    }

    // 🔹 INLINE CODE `code`
    if (text[i] === '`') {
      const end = findClosing('`', i + 1)
      if (end !== -1) {
        nodes.push({
          type: 'code',
          value: text.slice(i + 1, end),
        })
        i = end + 1
        continue
      }
    }

    // 🔹 BOLD+ITALIC ***text***
    if (text.startsWith('***', i)) {
      const end = findClosing('***', i + 3)
      if (end !== -1) {
        const inner = text.slice(i + 3, end)
        nodes.push({
          type: 'bold',
          children: [
            {
              type: 'italic',
              children: parseInline(inner),
            },
          ],
        })
        i = end + 3
        continue
      }
    }

    // 🔹 BOLD **text**
    if (text.startsWith('**', i)) {
      const end = findClosing('**', i + 2)
      if (end !== -1) {
        const inner = text.slice(i + 2, end)
        nodes.push({
          type: 'bold',
          children: parseInline(inner),
        })
        i = end + 2
        continue
      }
    }

    // 🔹 ITALIC *text* or _text_
    if (text[i] === '*' || text[i] === '_') {
      const marker = text[i]
      const end = findClosing(marker, i + 1)
      if (end !== -1) {
        const inner = text.slice(i + 1, end)
        nodes.push({
          type: 'italic',
          children: parseInline(inner),
        })
        i = end + 1
        continue
      }
    }

    // 🔹 LINK [text](url)
    if (text[i] === '[') {
      const closeBracket = text.indexOf(']', i)
      if (closeBracket !== -1 && text[closeBracket + 1] === '(') {
        const closeParen = text.indexOf(')', closeBracket)
        if (closeParen !== -1) {
          const label = text.slice(i + 1, closeBracket)
          const url = text.slice(closeBracket + 2, closeParen)

          nodes.push({
            type: 'link',
            url,
            children: parseInline(label),
          })

          i = closeParen + 1
          continue
        }
      }
    }

    // 🔹 HASHTAG (공백 기준)
    if (
      text[i] === '#' &&
      (i === 0 || /\s/.test(text[i - 1])) &&
      /\w/.test(text[i + 1])
    ) {
      let j = i + 1
      while (j < text.length && /\w/.test(text[j])) j++

      nodes.push({
        type: 'hashtag',
        value: text.slice(i + 1, j),
      })

      i = j
      continue
    }

    // 🔹 EMOJI :name:
    if (text[i] === ':' && (i === 0 || /\s/.test(text[i - 1]))) {
      const end = text.indexOf(':', i + 1)
      if (end !== -1) {
        const name = text.slice(i + 1, end)

        const emojiMap: Record<string, string> = {
          smile: '😄',
          fire: '🔥',
          rocket: '🚀',
          heart: '❤️',
        }

        if (emojiMap[name]) {
          nodes.push({
            type: 'emoji',
            value: emojiMap[name],
          })
          i = end + 1
          continue
        }
      }
    }

    // 🔹 기본 텍스트
    pushText(text[i])
    i++
  }

  return nodes
}
