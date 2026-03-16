import { useEffect, useState } from 'react'

export interface Project {
  id: number
  title: string
  description: string
  fileCount: number
  updatedAt: string
  thumbnail: string
}

export const useProjects = (userId: number) => {
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch(`http://localhost:3000/projects/${userId}`)
        if (!res.ok) {
          throw new Error('프로젝트 조회 실패')
        }
        const data = await res.json()
        console.log('Fetched projects:', data)
        setProjects(data)
      } catch (err) {
        console.error((err as Error).message)
      }
    }
    fetchProjects()
  }, [userId])

  return projects
}

export interface FileItem {
  id: number
  projectId: number
  name: string
  parentId: number | null
  path: string
  language: string
  rawContent: string
  updatedAt: string
  isDirectory: boolean
}
export const useProjectFiles = (projectId?: number | null) => {
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        console.log(`Fetching files for projectId: ${projectId}`)
        const res = await fetch(
          `http://localhost:3000/projects/${projectId}/files`,
        )

        if (!res.ok) {
          throw new Error('파일 조회 실패')
        }

        const data = await res.json()
        console.log(`Fetched files for project ${projectId}:`, data)
        setFiles(data)
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    }
    if (!projectId) return
    fetchFiles()
  }, [projectId])

  return { files, loading, error }
}

export interface Blog {
  id: number
  title: string
  parsedBlocks: any[]
  searchText: string
  file: {
    id: number
    projectId: number
    name: string
    project: {
      id: number
      title: string
    }
  }
}

export const useFileBlog = (fileId?: number | null) => {
  const [serverBlog, setServerBlog] = useState<Blog | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        console.log(`Fetching Blog for fileId: ${fileId}`)
        const res = await fetch(`http://localhost:3000/files/${fileId}/blog`)
        if (!res.ok) {
          throw new Error('블로그 파일 조회 실패')
        }
        const data = await res.json()
        console.log(`Fetched blog for fileId ${fileId}:`, data)
        setServerBlog(data)
      } catch (err) {
        setError((err as Error).message)
      }

      setLoading(false)
    }
    if (!fileId) return
    fetchBlog()
  }, [fileId])

  return { serverBlog, loading, error }
}
