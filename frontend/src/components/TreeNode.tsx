import type { TreeNode } from '@/models/fileNode'
import { useEffect, useState } from 'react'

export const TreeNodeItem = ({
  node,
  level,
  selectedId,
  onSelect,
  expandedIds = [],
  onToggleExpand,
}: {
  node: TreeNode
  level: number
  selectedId: string | null
  onSelect: (id: string) => void
  expandedIds?: string[]
  onToggleExpand?: (nodeId: string) => void
}) => {
  // expandedIds에서 현재 노드가 펼쳐져 있는지 확인
  const isExpanded = expandedIds.includes(node.id)
  const [open, setOpen] = useState(false)
  const handleClick = () => {
    if (node.isDirectory) {
      setOpen((prev) => !prev)
      onToggleExpand?.(node.id)
    } else {
      onSelect(node.blogId)
    }
  }
  useEffect(() => {
    setOpen(isExpanded)
  }, [isExpanded])

  return (
    <div>
      <div
        onClick={handleClick}
        style={{
          fontWeight: node.id === selectedId ? 'bold' : 'normal',
          cursor: 'pointer',
          paddingLeft: `${level * 15}px`,
        }}
      >
        <span
          style={{ fontSize: '18px', letterSpacing: '1px', lineHeight: '22pt' }}
        >
          {node.isDirectory ? (open ? '📂' : '📁') : '📄'} {node.name}
        </span>
      </div>
      {open &&
        node.children &&
        node.children.map((child) => (
          <TreeNodeItem
            key={child.id}
            node={child}
            level={level + 1}
            selectedId={selectedId}
            onSelect={onSelect}
            expandedIds={expandedIds}
            onToggleExpand={onToggleExpand}
          />
        ))}
    </div>
  )
}
