import { renderInline } from './InlineRenderer'
import type { BlockNode } from '@/lib/blockParser'
import { ListRenderer } from './ListRenderer'
import { TableRenderer } from './TableRenderer'
import type { JSX } from '@emotion/react/jsx-runtime'

export const BlockRenderer = ({ block }: { block: BlockNode }) => {
  switch (block.type) {
    case 'heading': {
      const Tag = `h${block.level}` as keyof JSX.IntrinsicElements
      return <Tag>{renderInline(block.children)}</Tag>
    }

    case 'paragraph':
      return <p>{renderInline(block.children)}</p>

    case 'image':
      return (
        <img
          src={block.src}
          alt={block.alt}
          style={{ maxWidth: '100%', margin: '16px 0' }}
        />
      )

    case 'list':
      return <ListRenderer block={block} />

    case 'table':
      return <TableRenderer block={block} />

    default:
      return null
  }
}
