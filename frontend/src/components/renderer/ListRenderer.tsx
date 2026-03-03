import { useEffect } from 'react'
import { renderInline } from './InlineRenderer'
import type { BlockNode } from '@/lib/blockParser'

export const ListRenderer = ({
  block,
}: {
  block: Extract<BlockNode, { type: 'list' }>
}) => {
  const Tag = block.ordered ? 'ol' : 'ul'
  useEffect(() => {
    console.log('Rendering list block:', block)
  }, [block])
  return (
    <Tag>
      {block.items.map((item, idx) => (
        <li key={idx}>
          {item.children ? renderInline(item.children) : ''}
          {item.nested && <ListRenderer block={item.nested} />}
        </li>
      ))}
    </Tag>
  )
}
