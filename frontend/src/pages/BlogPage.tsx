import { useEffect, useMemo, useState } from 'react'
import type { FlatNode, TreeNode } from '@/models/fileNode'
import { useNavigate, useParams } from 'react-router-dom'
import { BlogViewerPage } from './BlogViewerPage'
import { Tree } from '@/components/Tree'
import { useProjectFiles } from '@/hooks/useProject'
import { useBlog } from '@/hooks/useBlog'

export const BlogPage = () => {
  const navigate = useNavigate()
  const [selectedNode, setSelectedNode] = useState<FlatNode | null>(null)
  const [flatNodes, setFlatNodes] = useState<FlatNode[]>([])
  const [expandedIds, setExpandedIds] = useState<number[]>([])
  const { fileId: fileIdParam, projectId: projectIdParam } = useParams<{
    fileId?: string
    projectId?: string
  }>()

  // URL 파라미터를 number로 변환
  const fileId = fileIdParam ? Number(fileIdParam) : undefined
  const projectId = projectIdParam ? Number(projectIdParam) : undefined

  // 현재 모드 판별 (프로젝트 모드 vs 블로그 모드)
  const isProjectMode = !!projectId
  const currentId = projectId || fileId || ''

  const { data: serverBlog } = useBlog(fileId)
  const resolvedProjectId = projectId ?? serverBlog?.file.projectId
  console.log('resolvedProjectId in BlogPage:', resolvedProjectId)
  const {
    data: files,
    isLoading: filesLoading,
    error: filesError,
  } = useProjectFiles(resolvedProjectId)

  const nodeMap = useMemo(() => {
    const map = new Map<number, FlatNode>()
    flatNodes?.forEach((n) => map.set(n.id, n))
    return map
  }, [flatNodes])

  const treeMap = useMemo(() => {
    if (!flatNodes || flatNodes.length === 0) {
      return []
    }
    return buildTree(flatNodes)
  }, [flatNodes])

  const handleSelectNode = (nodeId: number) => {
    const node = nodeMap.get(nodeId)
    console.log('🖱️ handleSelectNode 호출:', { nodeId, node, isProjectMode })
    if (node && !node.isDirectory) {
      setSelectedNode(node)
      console.log(
        '📍 프로젝트에서 파일 선택:',
        `/myLog/projects/file/${node.id}`,
      )
      navigate(`/myLog/files/${node.id}`)
    }
  }

  const handleMoveNode = (
    draggedNodeId: number,
    targetParentId: number | null,
    position: number,
  ) => {
    console.log('🚀 handleMoveNode 시작:', {
      draggedNodeId,
      targetParentId,
      position,
    })

    setFlatNodes((prevNodes) => {
      // 1. 드래그된 노드 찾기
      const draggedNode = prevNodes.find((node) => node.id === draggedNodeId)
      if (!draggedNode) {
        console.log('❌ 드래그된 노드를 찾을 수 없음:', draggedNodeId)
        return prevNodes
      }

      console.log('📝 드래그된 노드 정보:', draggedNode)

      // 현재 같은 부모의 형제 노드들 확인
      const currentSiblings = prevNodes.filter(
        (node) => node.parentId === targetParentId && node.id !== draggedNodeId,
      )
      console.log(
        '👥 현재 형제 노드들:',
        currentSiblings.map((n) => ({ id: n.id, name: n.name })),
      )

      // 드래그된 노드의 현재 위치 계산
      const draggedNodeCurrentIndex = prevNodes
        .filter((node) => node.parentId === draggedNode.parentId)
        .findIndex((node) => node.id === draggedNodeId)

      console.log('🔢 드래그된 노드의 현재 index:', draggedNodeCurrentIndex)

      // 같은 부모 내에서 이동하는 경우 position 조정
      let adjustedPosition = position
      if (
        draggedNode.parentId === targetParentId &&
        draggedNodeCurrentIndex < position
      ) {
        adjustedPosition = position - 1
        console.log(
          '📐 같은 부모 내 이동 - position 조정:',
          position,
          '->',
          adjustedPosition,
        )
      }

      console.log(
        '📍 최종 타겟 position:',
        adjustedPosition,
        '/ 총 형제 수:',
        currentSiblings.length,
      )

      // 폴더 expanded 상태 관리
      setExpandedIds((prevExpanded) => {
        const newExpanded = [...prevExpanded]

        // 드래그된 노드가 폴더이고 현재 닫혀있다면, 타겟 폴더 안으로 들어가도 자동으로 열리지 않음
        if (draggedNode.isDirectory && !prevExpanded.includes(draggedNodeId)) {
          // 닫힌 폴더는 그대로 유지 (자동으로 열리지 않음)
        }

        // 타겟 폴더의 상태는 변경하지 않음 (펼쳐져 있으면 유지, 닫혀있으면 유지)

        console.log('📂 폴더 상태 유지:', {
          draggedFolder: draggedNode.isDirectory
            ? draggedNode.name
            : 'not folder',
          targetFolder: targetParentId,
          expandedFolders: newExpanded.length,
          action: 'maintain current state',
        })

        return newExpanded
      })

      // 2. 안전성 검사
      if (targetParentId === draggedNodeId) return prevNodes
      if (
        targetParentId &&
        isDescendant(targetParentId, draggedNodeId, prevNodes)
      ) {
        return prevNodes
      }

      // 3. 새로운 노드 생성 (부모 변경)
      const updatedNode = { ...draggedNode, parentId: targetParentId }

      // 4. 형제 노드들 가져오기 (드래그된 노드 제외)
      const siblings = prevNodes.filter(
        (node) => node.parentId === targetParentId && node.id !== draggedNodeId,
      )

      // 5. 형제들 중에서 올바른 위치에 삽입 (상대적 인덱스 사용)
      const sortedSiblings = siblings.sort((a, b) => {
        // 기존 순서 유지
        const aIndex = prevNodes.findIndex((n) => n.id === a.id)
        const bIndex = prevNodes.findIndex((n) => n.id === b.id)
        return aIndex - bIndex
      })

      const newSiblingOrder = [...sortedSiblings]
      // adjustedPosition을 현재 형제 수를 상한값으로 제한
      const safePosition = Math.min(adjustedPosition, newSiblingOrder.length)
      newSiblingOrder.splice(safePosition, 0, updatedNode)

      // 6. 전체 노드 목록 재구성
      if (targetParentId === null) {
        // 루트 레벨로 이동하는 경우
        const allOtherNodes = prevNodes.filter(
          (node) => node.id !== draggedNodeId,
        )
        const rootNodes = allOtherNodes.filter((node) => node.parentId === null)
        const nonRootNodes = allOtherNodes.filter(
          (node) => node.parentId !== null,
        )

        // 루트 노드들을 순서대로 정렬하고 새 노드 삽입
        const sortedRootNodes = rootNodes.sort((a, b) => {
          const aIndex = prevNodes.findIndex((n) => n.id === a.id)
          const bIndex = prevNodes.findIndex((n) => n.id === b.id)
          return aIndex - bIndex
        })

        const finalRootOrder = [...sortedRootNodes]
        const safePosRoot = Math.min(adjustedPosition, finalRootOrder.length)
        finalRootOrder.splice(safePosRoot, 0, updatedNode)

        return [...finalRootOrder, ...nonRootNodes]
      } else {
        // 특정 부모로 이동하는 경우
        const otherNodes = prevNodes.filter(
          (node) =>
            node.parentId !== targetParentId && node.id !== draggedNodeId,
        )

        const result: typeof prevNodes = []
        const parentIndex = otherNodes.findIndex(
          (node) => node.id === targetParentId,
        )

        if (parentIndex !== -1) {
          // 부모 노드 이전의 모든 노드들
          result.push(...otherNodes.slice(0, parentIndex + 1))
          // 새로운 순서의 자식들
          result.push(...newSiblingOrder)
          // 부모 노드 이후의 모든 노드들
          result.push(...otherNodes.slice(parentIndex + 1))
        } else {
          // 부모를 찾을 수 없는 경우 (새로 생성된 부모일 수 있음)
          result.push(...otherNodes, ...newSiblingOrder)
        }

        return result
      }
    })
  }

  // 하위 노드인지 확인하는 함수
  const isDescendant = (
    potentialDescendantId: number,
    ancestorId: number,
    nodes: FlatNode[],
  ): boolean => {
    const nodeMap = new Map(nodes.map((node) => [node.id, node]))
    let current = nodeMap.get(potentialDescendantId)

    while (current && current.parentId) {
      if (current.parentId === ancestorId) {
        return true
      }
      current = nodeMap.get(current.parentId)
    }

    return false
  }

  const handleToggleExpand = (nodeId: number) => {
    const isExpanded = expandedIds.includes(nodeId)
    if (isExpanded) {
      setExpandedIds(expandedIds.filter((id) => id !== nodeId))
    } else {
      setExpandedIds([...expandedIds, nodeId])
    }
  }

  // fileId로부터 해당 노드까지의 경로상의 모든 부모 노드들을 펼치는 함수
  const expandPathToFile = (targetFileId: number) => {
    const targetNode = flatNodes.find(
      (node: any) => node.isDirectory === false && node.id === targetFileId,
    )
    if (!targetNode) return

    // 해당 노드까지의 breadcrumb 생성
    const pathNodes = buildBreadcrumb(targetNode.id, nodeMap)
    // 모든 부모 디렉토리들을 expandedIds에 추가
    const parentIds = pathNodes
      .filter((node) => node.isDirectory)
      .map((node) => node.id)

    setExpandedIds(parentIds)
  }

  useEffect(() => {
    console.log('📁 프로젝트 파일 데이터 로드:', { files })
    // files가 유효한 배열일 때만 설정
    if (files && Array.isArray(files) && files.length > 0) {
      setFlatNodes(files)
    } else if (files && Array.isArray(files) && files.length === 0) {
      // 빈 배열인 경우도 설정 (프로젝트에 파일이 없는 경우)
      setFlatNodes([])
    }
    // files가 undefined이면 기존 flatNodes 유지
  }, [files])

  useEffect(() => {
    if (flatNodes && flatNodes.length > 0 && currentId) {
      // 프로젝트 모드인 경우 루트 폴더만 펼치기
      if (isProjectMode) {
        const rootNode = flatNodes.find(
          (node) => node.isDirectory && node.parentId === null,
        )
        if (rootNode) {
          setExpandedIds([rootNode.id])
        }
      } else if (fileId) {
        // 블로그 모드인 경우 해당 블로그 경로 펼치기
        expandPathToFile(fileId)
      }
    }
  }, [flatNodes, currentId, isProjectMode, fileId, nodeMap])

  useEffect(() => {
    if (!flatNodes || flatNodes.length === 0) return

    // 블로그 모드에서만 자동 노드 선택
    if (!isProjectMode && fileId) {
      console.log('🔄 블로그 모드 - URL fileId 변경 감지:', {
        fileId,
        flatNodesLength: flatNodes.length,
      })
      ///꼭꼭 수정필요
      const targetNode = flatNodes.find(
        (node) => !node.isDirectory && node.id === fileId,
      )
      console.log('🎯 타겟 노드 찾기 결과:', { targetNode })
      if (targetNode) {
        setSelectedNode(targetNode)
      }
    }
  }, [fileId, flatNodes, isProjectMode])

  return (
    <div className="flex h-full bg-[#f8f9fa]">
      {/* File Tree Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-sm text-gray-500 uppercase tracking-wider mb-1">
            Project
          </h2>
          <h3 className="text-gray-900">My Blog Project</h3>
        </div>

        <div className="p-2">
          <Tree
            nodes={treeMap}
            selectedId={selectedNode?.id ?? null}
            onSelect={handleSelectNode}
            expandedIds={expandedIds}
            onToggleExpand={handleToggleExpand}
            onMoveNode={handleMoveNode}
          />
        </div>
      </div>

      {/* Editor/Viewer Area */}
      <div className="flex-1 flex flex-col h-full">
        {!isProjectMode && selectedNode && serverBlog ? (
          <BlogViewerPage fileId={serverBlog.file.id} />
        ) : (
          <div className="h-full flex items-center justify-center">
            {isProjectMode ? (
              <div className="text-center">
                <p className="text-gray-500 mb-2">프로젝트가 로드되었습니다</p>
                <p className="text-sm text-gray-400">
                  좌측에서 파일을 선택하여 내용을 확인하세요
                </p>
              </div>
            ) : (
              <p className="text-gray-500">Select a file to view its content</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export function buildTree(nodes: FlatNode[]): TreeNode[] {
  const nodeMap = new Map<number, TreeNode>()
  const roots: TreeNode[] = []
  console.log('📂 buildTree 호출:', {
    nodes,
    nodesLength: nodes ? nodes.length : 'undefined',
    isArray: Array.isArray(nodes),
  })

  if (!nodes || !Array.isArray(nodes) || nodes.length === 0) {
    console.log('⚠️ buildTree: 노드 데이터가 없습니다.')
    return []
  }
  // 1. 모든 노드를 map에 등록
  for (const node of nodes) {
    nodeMap.set(node.id, {
      id: node.id,
      name: node.name,
      path: node.path,
      isDirectory: node.isDirectory,
      parentId: node.parentId,
      // blogId: node.isDirectory ? '' : node.blogId,
      ...(node.isDirectory ? { children: [] } : {}),
    })
  }

  console.log('🗂️ 생성된 nodeMap:', Array.from(nodeMap.entries()))

  // 2. 부모-자식 연결
  for (const node of nodes) {
    const treeNode = nodeMap.get(node.id)!
    if (node.parentId === null) {
      roots.push(treeNode)
    } else {
      const parent = nodeMap.get(node.parentId)
      if (parent?.children) {
        console.log(`🔗 자식 연결: ${node.name} -> 부모: ${parent.name}`)
        parent.children.push(treeNode)
      } else {
        console.log(
          `❌ 부모를 찾을 수 없음: ${node.name}, parentId: ${node.parentId}`,
        )
      }
    }
  }

  console.log('🌳 최종 트리 구조:', roots)
  return roots
}

function buildBreadcrumb(
  currentId: number,
  nodeMap: Map<number, FlatNode>,
): FlatNode[] {
  const path: FlatNode[] = []
  let cursor: FlatNode | undefined = nodeMap.get(currentId)

  while (cursor) {
    path.push(cursor)
    if (!cursor.parentId) break
    cursor = nodeMap.get(cursor.parentId)
  }
  return path.reverse()
}
