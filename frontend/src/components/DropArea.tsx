import { useDrop } from 'react-dnd'
import { useEffect, useRef } from 'react'
import { useDragContext } from '@/contexts/DragContext'

interface DropAreaProps {
  level?: number
  parentId?: number | null
  position?: number
  message?: string
  onMoveNode?: (
    draggedNodeId: number,
    targetParentId: number | null,
    position: number,
  ) => void
}

export const DropArea = ({
  level = 0,
  parentId = null,
  position = 0,
  message = 'Drop here',
  onMoveNode,
}: DropAreaProps) => {
  const dropRef = useRef<HTMLDivElement>(null)
  const { dragState, setHoveredFolder } = useDragContext()

  const [{ isOver }, drop] = useDrop({
    accept: 'TREE_NODE',
    hover: () => {
      // DropArea 위에 호버 시 부모 폴더 호버 상태 해제
      setHoveredFolder(null)
    },
    drop: (item: { id: number; name: string; isDirectory: boolean }) => {
      console.log('🎯 DropArea Drop Event:', {
        draggedItem: item,
        targetParent: parentId,
        targetLevel: level,
        position: position,
        dropAreaInfo: {
          message: 'DropArea 위치',
          parentName: parentId ? 'folder' : 'root',
        },
      })

      // 실제 이동 로직 실행
      if (onMoveNode) {
        onMoveNode(item.id, parentId, position)
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      draggedItem: monitor.getItem() as {
        id: string
        name: string
        isDirectory: boolean
      } | null,
    }),
  })

  // drop ref를 useEffect에서 연결
  useEffect(() => {
    drop(dropRef)
  }, [drop])

  // 정확한 숨김 로직: 드래그 중인 노드의 바로 다음 위치인 DropArea는 숨김
  const shouldHide =
    dragState.draggedNodeId &&
    dragState.draggedNodeParentId === parentId &&
    dragState.draggedNodePosition !== null &&
    dragState.draggedNodePosition + 1 === position

  // shouldHide가 true면 DropArea를 렌더링하지 않음
  if (shouldHide) {
    return null
  }

  return (
    <div
      ref={dropRef}
      className={`transition-all duration-200 ease-out flex items-center justify-center text-xs rounded-lg ${
        isOver
          ? 'h-5 bg-blue-100 border-2 border-dashed border-blue-400 text-blue-600'
          : 'h-1 bg-transparent border-transparent'
      }`}
      style={{
        marginLeft: `${level * 12 + 12}px`,
        marginRight: '12px',
      }}
    >
      {isOver && <span className="font-medium">{message}</span>}
    </div>
  )
}
