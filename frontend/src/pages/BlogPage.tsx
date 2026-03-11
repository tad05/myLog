import { useEffect, useMemo, useState } from 'react'
import type { FlatNode, TreeNode } from '@/models/fileNode'
import { mockFlatNodes } from '@/mock/fileNode'
import { useNavigate, useParams } from 'react-router-dom'
import { BlogViewerPage } from './BlogViewerPage'
import { Tree } from '@/components/Tree'

export const BlogPage = () => {
  const navigate = useNavigate()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedNode, setSelectedNode] = useState<FlatNode | null>(null)
  const [flatNodes, setFlatNodes] = useState<FlatNode[]>([])
  const [expandedIds, setExpandedIds] = useState<string[]>([])
  const { blogId = '' } = useParams<{ blogId: string }>()

  const nodeMap = useMemo(() => {
    const map = new Map<string, FlatNode>()
    flatNodes.forEach((n) => map.set(n.id, n))
    return map
  }, [flatNodes])

  const treeMap = useMemo(() => buildTree(flatNodes), [flatNodes])

  const handleSelectNode = (nodeId: string) => {
    const node = nodeMap.get(nodeId)
    console.log('🖱️ handleSelectNode 호출:', { nodeId, node })
    if (node && !node.isDirectory) {
      setSelectedId(nodeId)
      setSelectedNode(node)
      if (node.blogId) {
        console.log('📍 네비게이션 호출:', `/myLog/blog/${node.blogId}`)
        navigate(`/myLog/blog/${node.blogId}`)
      }
    }
  }

  const handleMoveNode = (
    draggedNodeId: string,
    targetParentId: string | null,
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
    potentialDescendantId: string,
    ancestorId: string,
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

  const handleToggleExpand = (nodeId: string) => {
    const isExpanded = expandedIds.includes(nodeId)
    if (isExpanded) {
      setExpandedIds(expandedIds.filter((id) => id !== nodeId))
    } else {
      setExpandedIds([...expandedIds, nodeId])
    }
  }

  // blogId로부터 해당 노드까지의 경로상의 모든 부모 노드들을 펼치는 함수
  const expandPathToBlog = (targetBlogId: string) => {
    const targetNode = flatNodes.find(
      (node) => node.isDirectory === false && node.blogId === targetBlogId,
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
    // 프로젝트 ID인지 확인
    if (blogId && blogId.startsWith('project-')) {
      const storedProjectData = localStorage.getItem(`project_${blogId}`)

      console.log('🔍 프로젝트 ID 감지:', blogId, '→', storedProjectData)
      if (storedProjectData) {
        try {
          const projectData = JSON.parse(storedProjectData)
          console.log('📚 프로젝트 데이터 로드:', projectData)

          // 프로젝트 데이터를 FlatNode 형식으로 변환
          const newFlatNodes: FlatNode[] = [
            {
              id: 'uploaded-project',
              name: projectData.title || 'Uploaded Project',
              path: '/uploaded-project',
              isDirectory: true,
              parentId: null,
            },
          ]

          // 업로드된 파일들을 각각 노드로 추가
          if (
            projectData.uploadedFiles &&
            Array.isArray(projectData.uploadedFiles)
          ) {
            projectData.uploadedFiles.forEach((file: any, index: number) => {
              newFlatNodes.push({
                id: `file-${index}`,
                name: file.name,
                path: `/uploaded-project/${file.name}`,
                isDirectory: false,
                blogId: file.blogId, // 각 파일의 개별 블로그ID 사용
                parentId: 'uploaded-project',
              })
            })
          }

          setFlatNodes(newFlatNodes)
          // 프로젝트 폴더를 기본적으로 펼쳐둠
          setExpandedIds(['uploaded-project'])
          return
        } catch (error) {
          console.error('프로젝트 데이터 파싱 오류:', error)
        }
      }
    }
    // 개별 블로그 ID인지 확인 (기존 업로드 파일들)
    else if (blogId && blogId.startsWith('blog-')) {
      const storedBlogData = localStorage.getItem(`blog_${blogId}`)

      console.log('🔍 새 블로그 ID 감지:', blogId, '→', storedBlogData)
      if (storedBlogData) {
        try {
          const blogData = JSON.parse(storedBlogData)
          console.log('📚 새로 생성된 블로그 데이터 로드:', blogData)

          // 기존 방식 유지 (하위 호환성)
          const newFlatNodes: FlatNode[] = [
            {
              id: 'uploaded-project',
              name: blogData.title || 'Uploaded Project',
              path: '/uploaded-project',
              isDirectory: true,
              parentId: null,
            },
          ]

          // 업로드된 파일들을 각각 노드로 추가
          if (blogData.uploadedFiles && Array.isArray(blogData.uploadedFiles)) {
            blogData.uploadedFiles.forEach((file: any, index: number) => {
              newFlatNodes.push({
                id: `file-${index}`,
                name: file.name,
                path: `/uploaded-project/${file.name}`,
                isDirectory: false,
                blogId: blogId,
                parentId: 'uploaded-project',
              })
            })
          }

          setFlatNodes(newFlatNodes)
          // 기존 방식도 프로젝트 폴더를 기본적으로 펼쳐둠
          setExpandedIds(['uploaded-project'])
          return
        } catch (error) {
          console.error('블로그 데이터 파싱 오류:', error)
        }
      }
    }

    // 기본 mockFlatNodes 사용
    const flatNodes = mockFlatNodes
    setFlatNodes(flatNodes)
  }, [blogId])
  useEffect(() => {
    if (flatNodes.length > 0 && blogId !== '' && blogId !== undefined) {
      // 프로젝트 ID인 경우 프로젝트 폴더만 펼치기
      if (blogId.startsWith('project-')) {
        setExpandedIds(['uploaded-project'])
      } else {
        // flatNodes가 설정된 후에 blogId에 해당하는 노드를 찾아서 트리를 펼치고 선택
        expandPathToBlog(blogId)
      }
    }
  }, [flatNodes, blogId, nodeMap])

  useEffect(() => {
    if (flatNodes.length === 0) return

    // URL에서 blogId 파라미터 가져오기
    const currentBlogId = blogId
    console.log('🔄 URL blogId 변경 감지:', {
      currentBlogId,
      flatNodesLength: flatNodes.length,
    })
    if (currentBlogId && !currentBlogId.startsWith('project-')) {
      // 프로젝트 ID가 아닌 개별 블로그 ID인 경우에만 노드 선택
      const targetNode = flatNodes.find(
        (node) => !node.isDirectory && node.blogId === currentBlogId,
      )
      console.log('🎯 타겟 노드 찾기 결과:', { targetNode })
      if (targetNode) {
        handleSelectNode(targetNode.id)
        setSelectedId(targetNode.id)
      }
    }
  }, [blogId, flatNodes])

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
            selectedId={selectedId}
            onSelect={handleSelectNode}
            expandedIds={expandedIds}
            onToggleExpand={handleToggleExpand}
            onMoveNode={handleMoveNode}
          />
        </div>
      </div>

      {/* Editor/Viewer Area */}
      <div className="flex-1 flex flex-col h-full">
        {!selectedNode?.isDirectory && selectedNode?.blogId ? (
          <BlogViewerPage blogId={selectedNode.blogId} />
        ) : (
          <div className="h-full flex items-center justify-center">
            {blogId &&
            (blogId.startsWith('project-') || blogId.startsWith('blog-')) ? (
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
  const nodeMap = new Map<string, TreeNode>()
  const roots: TreeNode[] = []

  // 1. 모든 노드를 map에 등록
  for (const node of nodes) {
    nodeMap.set(node.id, {
      id: node.id,
      name: node.name,
      path: node.path,
      isDirectory: node.isDirectory,
      blogId: node.isDirectory ? '' : node.blogId,
      ...(node.isDirectory ? { children: [] } : {}),
    })
  }

  // 2. 부모-자식 연결
  for (const node of nodes) {
    const treeNode = nodeMap.get(node.id)!
    if (node.parentId === null) {
      roots.push(treeNode)
    } else {
      const parent = nodeMap.get(node.parentId)
      if (parent?.children) {
        parent.children.push(treeNode)
      }
    }
  }

  return roots
}

function buildBreadcrumb(
  currentId: string,
  nodeMap: Map<string, FlatNode>,
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
