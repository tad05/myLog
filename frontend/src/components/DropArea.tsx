import { useDrop } from 'react-dnd'
import { useEffect, useRef } from 'react'
import { useDragContext } from '@/contexts/DragContext'

interface DropAreaProps {
  level?: number
  parentId?: string | null
  position?: number
  message?: string
  onMoveNode?: (
    draggedNodeId: string,
    targetParentId: string | null,
    position: number,
  ) => void
  text?: string
}

export const DropArea = ({
  level = 0,
  parentId = null,
  position = 0,
  message = 'Drop here',
  text = '',
  onMoveNode,
}: DropAreaProps) => {
  const dropRef = useRef<HTMLDivElement>(null)
  const { dragState, setHoveredFolder } = useDragContext()

  const [{ isOver, draggedItem }, drop] = useDrop({
    accept: 'TREE_NODE',
    hover: () => {
      // DropArea 위에 호버 시 부모 폴더 호버 상태 해제
      setHoveredFolder(null)
    },
    drop: (item: { id: string; name: string; isDirectory: boolean }) => {
      console.log('Dropped:', {
        draggedItem: item,
        targetParent: parentId,
        targetLevel: level,
        position: position,
        text,
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

  // 임시로 draggedItem이 있을 때 매우 짧은 높이로 설정하여 거의 안보이게 함
  const isCurrentlyDragging = !!draggedItem

  // 폴더 호버 상태 확인 - 현재 DropArea의 부모가 호버 중인지 확인
  const isParentHovered = dragState.hoveredFolderId === parentId

  // shouldHide가 true면 DropArea를 렌더링하지 않음
  if (shouldHide) {
    return null
  }

  return (
    <div
      ref={dropRef}
      style={{
        height: isOver ? '20px' : '8px', // 기본 높이를 8px로 증가
        marginLeft: `${level * 15}px`, // 레벨에 따른 들여쓰기
        backgroundColor: isOver
          ? 'rgba(0, 123, 255, 0.3)'
          : isParentHovered
            ? 'rgba(255, 165, 0, 0.15)' // 부모 폴더 호버 시 오렌지 계열
            : isCurrentlyDragging
              ? 'rgba(0, 123, 255, 0.1)' // 드래그 중일 때 약간 보이게
              : 'rgba(200, 200, 200, 0.2)', // 평상시에도 약간 보이게
        border: isOver
          ? '2px dashed #007bff'
          : isParentHovered
            ? '1px dashed rgba(255, 165, 0, 0.6)' // 부모 호버 시 오렌지 테두리
            : '1px dashed rgba(200, 200, 200, 0.5)',
        borderRadius: '4px',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        color: isOver
          ? '#007bff'
          : isParentHovered
            ? 'rgba(255, 165, 0, 0.8)' // 부모 호버 시 오렌지 글자
            : 'rgba(150, 150, 150, 0.8)',
        opacity: 1, // 항상 보이도록
      }}
    >
      {isOver
        ? message
        : isParentHovered
          ? '↓' // 부모 호버 시 화살표 표시
          : '+'}{' '}
      {/* 평상시에는 + 표시 */}
    </div>
  )
}
