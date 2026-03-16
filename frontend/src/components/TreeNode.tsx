import type { TreeNode } from '@/models/fileNode'
import { useEffect, useRef, useState } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { DropArea } from './DropArea'
import { useDragContext } from '@/contexts/DragContext'
import { ChevronRight, ChevronDown, Folder, FileText } from 'lucide-react'
export const TreeNodeItem = ({
  node,
  level,
  selectedId,
  onSelect,
  expandedIds = [],
  onToggleExpand,
  onMoveNode,
  nodePosition,
  parentId,
}: {
  node: TreeNode
  level: number
  selectedId: number | null
  onSelect: (id: number) => void
  expandedIds?: number[]
  onToggleExpand?: (nodeId: number) => void
  onMoveNode?: (
    draggedNodeId: number,
    targetParentId: number | null,
    position: number,
  ) => void
  nodePosition: number
  parentId: number | null
}) => {
  // expandedIds에서 현재 노드가 펼쳐져 있는지 확인
  const isExpanded = expandedIds.includes(node.id)
  const [open, setOpen] = useState(false)
  const dragRef = useRef<HTMLDivElement>(null)
  const dropRef = useRef<HTMLDivElement>(null)
  const { dragState, setDraggedNode, clearDraggedNode, setHoveredFolder } =
    useDragContext()

  // 현재 노드가 호버 중인 폴더이거나 그 형제인지 확인
  const isHoveredTarget = dragState.hoveredFolderId === node.id
  const isSiblingOfHovered =
    parentId &&
    dragState.hoveredFolderId &&
    parentId === dragState.hoveredFolderId
  const showSiblingHover =
    dragState.draggedNodeId && (isHoveredTarget || isSiblingOfHovered)

  const [{ isDragging }, drag] = useDrag({
    type: 'TREE_NODE',
    item: () => {
      // 드래그 시작 시 상태 설정
      setDraggedNode(node.id, parentId, nodePosition)
      return { id: node.id, name: node.name, isDirectory: node.isDirectory }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: () => {
      // 드래그 종료 시 상태 초기화
      clearDraggedNode()
    },
  })

  // 폴더인 경우에만 드롭 가능하게 설정
  const [{ isOver }, drop] = useDrop({
    accept: 'TREE_NODE',
    hover: (item: { id: number; name: string; isDirectory: boolean }) => {
      // 폴더 위에 호버 시 상태 설정
      if (node.isDirectory && item.id !== node.id) {
        setHoveredFolder(node.id)
      }
    },
    drop: (item: { id: number; name: string; isDirectory: boolean }) => {
      // 자기 자신에게 드롭하는 것은 방지
      if (item.id === node.id) return

      // 폴더에 드롭하면 해당 폴더의 0번째 position으로 이동
      if (node.isDirectory && onMoveNode) {
        console.log(
          `Dropping ${item.name} into folder ${node.name} at position 0`,
        )
        onMoveNode(item.id, node.id, 0)
      }
      // 드롭 후 호버 상태 초기화
      setHoveredFolder(null)
    },
    collect: (monitor) => ({
      isOver: monitor.isOver() && node.isDirectory, // 폴더일 때만 호버 효과
    }),
    canDrop: () => node.isDirectory, // 폴더일 때만 드롭 가능
  })

  const handleClick = () => {
    if (node.isDirectory) {
      setOpen((prev) => !prev)
      onToggleExpand?.(node.id)
    } else {
      onSelect(node.id)
    }
  }

  // drag ref를 useEffect에서 연결
  useEffect(() => {
    drag(dragRef)
  }, [drag])

  // drop ref를 useEffect에서 연결 (폴더인 경우만)
  useEffect(() => {
    if (node.isDirectory) {
      drop(dropRef)
    }
  }, [drop, node.isDirectory])

  useEffect(() => {
    setOpen(isExpanded)
  }, [isExpanded])

  return (
    <div>
      <div
        ref={(element) => {
          dragRef.current = element
          if (node.isDirectory) {
            dropRef.current = element
          }
        }}
        onClick={handleClick}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all ${
          node.id === selectedId
            ? 'bg-blue-50 text-blue-700'
            : 'hover:bg-gray-100 text-gray-700'
        } ${isDragging ? 'opacity-50' : ''} ${
          isOver ? 'bg-blue-100 border-2 border-dashed border-blue-400' : ''
        } ${showSiblingHover ? 'bg-blue-25 border border-blue-200' : ''}`}
        style={{
          paddingLeft: `${level * 12 + 12}px`,
          opacity: isDragging ? 0.5 : 1,
        }}
      >
        {node.isDirectory ? (
          <>
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 flex-shrink-0" />
            ) : (
              <ChevronRight className="w-4 h-4 flex-shrink-0" />
            )}
            <Folder className="w-4 h-4 flex-shrink-0" />
          </>
        ) : (
          <>
            <div className="w-4" />
            <FileText className="w-4 h-4 flex-shrink-0" />
          </>
        )}
        <span className="text-sm truncate">{node.name}</span>
      </div>

      {/* 폴더가 열려있고 자식이 있을 때 */}
      {open && node.children && node.children.length > 0 && (
        <div>
          {/* 첫번째 자식 위에 DropArea 추가 */}
          <DropArea
            level={level + 1}
            parentId={node.id}
            position={0}
            onMoveNode={onMoveNode}
          />
          {node.children.map((child, index) => (
            <div key={child.id}>
              <TreeNodeItem
                node={child}
                level={level + 1}
                selectedId={selectedId}
                onSelect={onSelect}
                expandedIds={expandedIds}
                onToggleExpand={onToggleExpand}
                onMoveNode={onMoveNode}
                nodePosition={index}
                parentId={node.id}
              />
              {/* 각 자식 노드 사이의 드롭 영역*/}
              <DropArea
                level={level + 1}
                parentId={node.id}
                position={index + 1}
                onMoveNode={onMoveNode}
              />
            </div>
          ))}
        </div>
      )}

      {/* 폴더가 열려있지만 자식이 없을 때 (빈 폴더) */}
      {open && node.children && node.children.length === 0 && (
        <DropArea
          level={level + 1}
          parentId={node.id}
          position={0}
          message="폴더가 비어있습니다"
          onMoveNode={onMoveNode}
        />
      )}
    </div>
  )
}
