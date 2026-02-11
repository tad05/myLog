import type { TreeNode } from '@/models/fileNode'
import { TreeNodeItem } from './TreeNode'

export const Tree = ({
  nodes,
  selectedId,
  onSelect,
  expandedIds = [],
  onToggleExpand,
}: {
  nodes: TreeNode[]
  selectedId: string | null
  onSelect: (id: string) => void
  expandedIds?: string[]
  onToggleExpand?: (nodeId: string) => void
}) => {
  return (
    <div>
      {nodes.map((node) => (
        <TreeNodeItem
          key={node.id}
          node={node}
          level={0}
          selectedId={selectedId}
          onSelect={onSelect}
          expandedIds={expandedIds}
          onToggleExpand={onToggleExpand}
        />
      ))}
    </div>
  )
}
