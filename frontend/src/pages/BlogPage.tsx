import { useEffect, useMemo, useState } from 'react'
import type { FlatNode, TreeNode } from '@/models/fileNode'
import { mockFlatNodes } from '@/mock/fileNode'
import { Tree } from '@/components/Tree'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { BlogViewerPage } from './BlogViewerPage'

export const BlogPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
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

  const handleLocation = (id: string) => {
    navigate(`/myLog/blog/${id}`)
  }
  const handleSelectNode = (node: FlatNode) => {
    setSelectedId(node.id)
    setSelectedNode(node)
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
    const flatNodes = mockFlatNodes
    setFlatNodes(flatNodes)
  }, [])

  useEffect(() => {
    if (flatNodes.length > 0 && blogId !== '' && blogId !== undefined) {
      // flatNodes가 설정된 후에 blogId에 해당하는 노드를 찾아서 트리를 펼치고 선택
      expandPathToBlog(blogId)
    }
  }, [flatNodes, blogId, nodeMap])

  useEffect(() => {
    const path = location.pathname.split('/').pop() || ''
    if (flatNodes.length === 0) return
    const targetNode = flatNodes.find(
      (node) => !node.isDirectory && node.blogId === path,
    )
    if (targetNode) handleSelectNode(targetNode)
  }, [location, flatNodes])

  // Tree 너비 동적 계산
  const getTreeWidth = () => {
    // 기본 너비
    const baseWidth = 200

    if (expandedIds.length === 0) return baseWidth

    // 펼쳐진 폴더들의 최대 깊이 계산
    const maxDepth = Math.max(
      ...expandedIds.map((nodeId) => {
        const pathNodes = buildBreadcrumb(nodeId, nodeMap)
        return pathNodes.length
      }),
    )

    // 예상 콘텐츠 너비 (들여쓰기 15px * 깊이 + 텍스트 예상 너비)
    const estimatedContentWidth = maxDepth * 15 + 150 // 아이콘 + 텍스트 기본 150px

    // 200px를 넘어갈 때만 확장
    if (estimatedContentWidth > baseWidth) {
      return Math.min(400, estimatedContentWidth) // 최대 400px
    }

    return baseWidth
  }

  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        padding: '20px',
        height: '100vh',
      }}
    >
      <div
        style={{
          flexBasis: `${getTreeWidth()}px`,
          flexShrink: 0,
          maxHeight: 'calc(100vh - 40px)',
          overflowY: 'auto',
          marginRight: '20px',
          transition: 'flex-basis 0.3s ease',
        }}
      >
        <Tree
          nodes={treeMap}
          selectedId={selectedId}
          onSelect={handleLocation}
          expandedIds={expandedIds}
          onToggleExpand={handleToggleExpand}
        />
      </div>
      {!selectedNode?.isDirectory && selectedNode?.blogId && (
        <div style={{ flex: 1, minWidth: 0 }}>
          <BlogViewerPage blogId={selectedNode.blogId} />
        </div>
      )}
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
