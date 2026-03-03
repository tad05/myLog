import type { InlineNode } from '@/lib/inlineParser'

export const renderInline = (nodes: InlineNode[]): React.ReactNode => {
  return nodes.map((node, i) => {
    switch (node.type) {
      case 'text':
        return node.value

      case 'bold':
        return <strong key={i}>{renderInline(node.children)}</strong>

      case 'italic':
        return <em key={i}>{renderInline(node.children)}</em>

      case 'link':
        return (
          <a key={i} href={node.url} target="_blank">
            {renderInline(node.children)}
          </a>
        )

      case 'hashtag':
        return (
          <span key={i} style={{ color: 'blue' }}>
            #{node.value}
          </span>
        )

      case 'emoji':
        return node.value

      default:
        return null
    }
  })
}
