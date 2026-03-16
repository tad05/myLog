import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react'

interface DragState {
  draggedNodeId: number | null
  draggedNodeParentId: number | null
  draggedNodePosition: number | null
  hoveredFolderId: number | null // 현재 호버 중인 폴더
}

interface DragContextType {
  dragState: DragState
  setDraggedNode: (
    nodeId: number,
    parentId: number | null,
    position: number,
  ) => void
  clearDraggedNode: () => void
  setHoveredFolder: (folderId: number | null) => void
}

const DragContext = createContext<DragContextType | undefined>(undefined)

export const DragProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [dragState, setDragState] = useState<DragState>({
    draggedNodeId: null,
    draggedNodeParentId: null,
    draggedNodePosition: null,
    hoveredFolderId: null,
  })

  const setDraggedNode = (
    nodeId: number,
    parentId: number | null,
    position: number,
  ) => {
    setDragState({
      draggedNodeId: nodeId,
      draggedNodeParentId: parentId,
      draggedNodePosition: position,
      hoveredFolderId: null,
    })
  }

  const clearDraggedNode = () => {
    setDragState({
      draggedNodeId: null,
      draggedNodeParentId: null,
      draggedNodePosition: null,
      hoveredFolderId: null, // 호버 상태도 함께 초기화
    })
  }

  const setHoveredFolder = (folderId: number | null) => {
    setDragState((prev) => ({
      ...prev,
      hoveredFolderId: folderId,
    }))
  }

  return (
    <DragContext.Provider
      value={{ dragState, setDraggedNode, clearDraggedNode, setHoveredFolder }}
    >
      {children}
    </DragContext.Provider>
  )
}

export const useDragContext = () => {
  const context = useContext(DragContext)
  if (context === undefined) {
    throw new Error('useDragContext must be used within a DragProvider')
  }
  return context
}
