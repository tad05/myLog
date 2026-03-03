import type { TreeNode } from '@/models/fileNode'
import { TreeNodeItem } from './TreeNode'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { DropArea } from './DropArea'
import { DragProvider } from '@/contexts/DragContext'

export const Tree = ({
  nodes,
  selectedId,
  onSelect,
  expandedIds = [],
  onToggleExpand,
  onMoveNode,
}: {
  nodes: TreeNode[]
  selectedId: string | null
  onSelect: (id: string) => void
  expandedIds?: string[]
  onToggleExpand?: (nodeId: string) => void
  onMoveNode?: (
    draggedNodeId: string,
    targetParentId: string | null,
    position: number,
  ) => void
}) => {
  return (
    <DragProvider>
      <DndProvider backend={HTML5Backend}>
        <div>
          <DropArea position={0} onMoveNode={onMoveNode} text="Tree 1" />
          {nodes.map((node, index) => (
            <div key={node.id}>
              <TreeNodeItem
                node={node}
                level={0}
                selectedId={selectedId}
                onSelect={onSelect}
                expandedIds={expandedIds}
                onToggleExpand={onToggleExpand}
                onMoveNode={onMoveNode}
                nodePosition={index}
                parentId={null}
              />
              <DropArea
                position={index + 1}
                onMoveNode={onMoveNode}
                text="Tree2"
              />
            </div>
          ))}
        </div>
      </DndProvider>
    </DragProvider>
  )
}
