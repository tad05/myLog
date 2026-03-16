export type FlatNode = {
  id: number
  name: string
  path: string
  parentId: number | null
  isDirectory: boolean
}
export type TreeNode = {
  id: number
  name: string
  path: string
  parentId: number | null
  isDirectory: boolean
  children?: TreeNode[]
}
