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
  selectedId: number | null
  onSelect: (id: number) => void
  expandedIds?: number[]
  onToggleExpand?: (nodeId: number) => void
  onMoveNode?: (
    draggedNodeId: number,
    targetParentId: number | null,
    position: number,
  ) => void
}) => {
  console.log('🌳 Tree 컴포넌트 렌더링:', { nodes, nodesLength: nodes.length })

  return (
    <DragProvider>
      <DndProvider backend={HTML5Backend}>
        <div>
          <DropArea position={0} onMoveNode={onMoveNode} />
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
              <DropArea position={index + 1} onMoveNode={onMoveNode} />
            </div>
          ))}
        </div>
      </DndProvider>
    </DragProvider>
  )
}
