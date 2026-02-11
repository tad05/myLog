type BaseNode = {
  id: string
  name: string
  path: string
  parentId: string | null
}

export type FlatNode =
  | (BaseNode & {
      isDirectory: true
    })
  | (BaseNode & {
      isDirectory: false
      blogId: string
    })
export type TreeNode = {
  id: string
  name: string
  path: string
  isDirectory: boolean
  blogId: string
  children?: TreeNode[]
}
