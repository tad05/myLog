import type { FlatNode } from '@/models/fileNode'

export const mockFlatNodes: FlatNode[] = [
  { id: '1', name: 'src', path: '/src', isDirectory: true, parentId: null },
  {
    id: '2',
    name: 'app.tsx',
    path: '/src/app.tsx',
    isDirectory: false,
    blogId: 'blog1',
    parentId: '1',
  },
  {
    id: '3',
    name: 'main.tsx',
    path: '/src/main.tsx',
    isDirectory: false,
    blogId: 'blog2',
    parentId: '1',
  },
  {
    id: '4',
    name: 'public',
    path: '/public',
    isDirectory: true,
    parentId: null,
  },
  {
    id: '5',
    name: 'index.html',
    path: '/public/index.html',
    isDirectory: false,
    blogId: 'blog3',
    parentId: '4',
  },
  {
    id: '6',
    name: 'assets',
    path: '/src/assets',
    isDirectory: true,
    parentId: '1',
  },
  {
    id: '7',
    name: 'arraw.tsx',
    path: '/src/assets/arraw.tsx',
    isDirectory: false,
    blogId: 'blog4',
    parentId: '6',
  },
  {
    id: '8',
    name: 'package.json',
    path: '/src/package.json',
    isDirectory: false,
    blogId: 'blog5',
    parentId: '1',
  },
]
