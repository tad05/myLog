import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Upload,
  PenLine,
  FileText,
  Code,
  Type,
  X,
  Save,
  ArrowLeft,
  FolderOpen,
  ChevronRight,
  ChevronDown,
} from 'lucide-react'
import { parseFileEnhanced, type EnhancedBlockNode } from '../lib/parser'
import { parseBlocks } from '@/lib/blockParser'
import { TipTapEditor } from '@/components/TipTapEditor'
import { CodeEditor } from '@/components/CodeEditor'
import { useCreateProject } from '@/hooks/useProject'
type Mode = 'select' | 'upload' | 'write'

interface ContentBlock {
  id: string
  type: 'text' | 'code'
  content: string
  language?: string
}

interface FileNode {
  id: string
  name: string
  isDirectory: boolean
  children?: FileNode[]
  file?: File
}

export const BlogCreatePage = () => {
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('select')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState<ContentBlock[]>([])

  // 새로운 프로젝트 관련 상태
  const [projectName, setProjectName] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [files, setFiles] = useState<FileNode[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])

  const { mutate: createProjectMutate } = useCreateProject()

  const handleFolderUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const fileList = event.target.files
    if (!fileList) return

    const fileArray = Array.from(fileList)
    setUploadedFiles(fileArray)

    // Build file tree from uploaded files
    const fileTree = buildFileTree(fileArray)
    setFiles(fileTree)
  }

  const handleIndividualFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const fileList = event.target.files
    if (!fileList) return

    const fileArray = Array.from(fileList)
    setUploadedFiles([...uploadedFiles, ...fileArray])

    // Add individual files to root
    const newFiles: FileNode[] = fileArray.map((file, index) => ({
      id: `file-${Date.now()}-${index}`,
      name: file.name,
      isDirectory: false,
      file: file,
    }))

    setFiles([...files, ...newFiles])
  }

  const buildFileTree = (fileArray: File[]): FileNode[] => {
    const tree: FileNode[] = []
    const folderMap = new Map<string, FileNode>()

    // Sort files by path to ensure folders are created before their contents
    const sortedFiles = fileArray.sort((a, b) =>
      a.webkitRelativePath.localeCompare(b.webkitRelativePath),
    )

    sortedFiles.forEach((file, index) => {
      const pathParts = file.webkitRelativePath.split('/')

      // Skip the root folder name (first part)
      const relevantParts = pathParts.slice(1)

      if (relevantParts.length === 0) return

      let currentLevel = tree
      let currentPath = ''

      // Create folders
      for (let i = 0; i < relevantParts.length - 1; i++) {
        const folderName = relevantParts[i]
        currentPath += '/' + folderName

        if (!folderMap.has(currentPath)) {
          const folderNode: FileNode = {
            id: `folder-${Date.now()}-${i}`,
            name: folderName,
            isDirectory: true,
            children: [],
          }
          folderMap.set(currentPath, folderNode)
          currentLevel.push(folderNode)
          currentLevel = folderNode.children!
        } else {
          const existingFolder = folderMap.get(currentPath)
          if (existingFolder && existingFolder.children) {
            currentLevel = existingFolder.children
          }
        }
      }

      // Add file
      const fileName = relevantParts[relevantParts.length - 1]
      const fileNode: FileNode = {
        id: `file-${Date.now()}-${index}`,
        name: fileName,
        isDirectory: false,
        file,
      }
      currentLevel.push(fileNode)
    })

    return tree
  }

  const handleCreateProject = async () => {
    const buildPayload = async (nodes: FileNode[]) => {
      const result: any[] = []

      for (const node of nodes) {
        if (node.isDirectory) {
          result.push({
            name: node.name,
            isDirectory: true,
            children: await buildPayload(node.children || []),
          })
        } else {
          try {
            const rawContent = await node.file?.text()
            const parsedBlocks = rawContent
              ? parseFileEnhanced(rawContent).map((block) =>
                  block.type === 'code'
                    ? block
                    : {
                        ...block,
                        blocks: block.content ? parseBlocks(block.content) : [],
                      },
                )
              : []
            result.push({
              name: node.name,
              isDirectory: false,
              rawContent,
              parsedBlocks
            })
          } catch (error) {
            console.error(`Failed to read file ${node.name}`, error)
          }
        }
      }
      return result
    }

    const projectData = {
      userId: 1, // 실제로는 로그인한 사용자 ID를 사용해야 함
      title: projectName || 'Uploaded Project',
      description: projectDescription,
      fileCount: uploadedFiles.filter((file) => file.type !== 'folder').length,
    }
    const filePayload = await buildPayload(files)
    console.log('Project data to create:', projectData)
    console.log('File payload to create:', filePayload)
    createProjectMutate({
      projectData: projectData,
      fileData: filePayload,
    })

    // 프로젝트 페이지로 이동 (파일 선택 없이)
    // navigate(`/myLog/projects/${projectId}/files`)
  }

  // 간단한 FileTreeView 컴포넌트
  const FileTreeView = ({ files }: { files: FileNode[] }) => {
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
      new Set(),
    )

    const toggleFolder = (folderId: string) => {
      setExpandedFolders((prev) => {
        const newSet = new Set(prev)
        if (newSet.has(folderId)) {
          newSet.delete(folderId)
        } else {
          newSet.add(folderId)
        }
        return newSet
      })
    }

    const renderNode = (node: FileNode, level: number = 0) => (
      <div key={node.id} style={{ paddingLeft: `${level * 16}px` }}>
        <div className="flex items-center gap-2 py-1">
          {node.isDirectory ? (
            <>
              <button
                onClick={() => toggleFolder(node.id)}
                className="flex items-center gap-1 text-gray-700 hover:text-gray-900"
              >
                {expandedFolders.has(node.id) ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
                <FolderOpen className="w-4 h-4 text-blue-600" />
                <span className="text-sm">{node.name}</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2 ml-5">
              <FileText className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">{node.name}</span>
            </div>
          )}
        </div>
        {node.isDirectory && expandedFolders.has(node.id) && node.children && (
          <div>
            {node.children.map((child) => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    )

    return (
      <div>
        {files
          .sort((a, b) => {
            // 폴더 먼저
            if (a.isDirectory && !b.isDirectory) return -1
            if (!a.isDirectory && b.isDirectory) return 1

            // 둘 다 같으면 이름 정렬
            return a.name.localeCompare(b.name)
          })
          .map((file) => renderNode(file))}
      </div>
    )
  }

  const updateBlockContent = (blockId: string, newContent: string) => {
    setContent((prev) =>
      prev.map((block) =>
        block.id === blockId ? { ...block, content: newContent } : block,
      ),
    )
  }

  const updateBlockLanguage = (blockId: string, language: string) => {
    setContent((prev) =>
      prev.map((block) =>
        block.id === blockId ? { ...block, language } : block,
      ),
    )
  }

  const removeBlock = (blockId: string) => {
    setContent((prev) => prev.filter((block) => block.id !== blockId))
  }

  const insertBlockAfter = (afterIndex: number, type: 'text' | 'code') => {
    const newBlock: ContentBlock = {
      id: `block-${Date.now()}`,
      type,
      content: '',
      language: type === 'code' ? 'javascript' : undefined,
    }
    setContent((prev) => {
      const newContent = [...prev]
      newContent.splice(afterIndex + 1, 0, newBlock)
      return newContent
    })
  }

  const handleSave = () => {
    // In a real app, this would save to backend
    console.log('Saving post:', { title, content })
    navigate('/myLog/blogs')
  }

  const handleBack = () => {
    if (mode === 'write') {
      setMode('select')
      setTitle('')
      setContent([])
    } else {
      navigate(-1)
    }
  }

  return (
    <div className="h-full overflow-y-auto bg-[#f8f9fa]">
      <div className="max-w-5xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-12">
          <button
            onClick={handleBack}
            className="flex items-center justify-center w-10 h-10 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
            title="Go Back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <h1 className="text-4xl mb-2 text-gray-900">Create New Post</h1>
            <p className="text-gray-600">
              {mode === 'select' && 'Choose how you want to create your post'}
              {mode === 'upload' && 'Upload a file to create a post'}
              {mode === 'write' && 'Write your blog post'}
            </p>
          </div>
        </div>

        {/* Mode Selection */}
        {mode === 'select' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
            <button
              onClick={() => setMode('upload')}
              className="bg-white rounded-xl p-8 border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all text-left group"
            >
              <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 mb-6 group-hover:from-blue-100 group-hover:to-purple-100 transition-colors">
                <Upload className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl text-gray-900 mb-2">Upload</h3>
              <p className="text-gray-600 leading-relaxed">
                Import markdown, text, or code files to create a blog post
                automatically
              </p>
              <div className="mt-6 flex items-center gap-2 text-sm text-gray-500">
                <FileText className="w-4 h-4" />
                <span>Supports .md, .txt, .js, .ts, and more</span>
              </div>
            </button>

            <button
              onClick={() => {
                setMode('write')
                setContent([
                  {
                    id: 'block-1',
                    type: 'text',
                    content: '',
                  },
                ])
              }}
              className="bg-white rounded-xl p-8 border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all text-left group"
            >
              <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 mb-6 group-hover:from-purple-100 group-hover:to-pink-100 transition-colors">
                <PenLine className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-xl text-gray-900 mb-2">Write Directly</h3>
              <p className="text-gray-600 leading-relaxed">
                Start with a blank canvas and create your blog post using text
                and code blocks
              </p>
              <div className="mt-6 flex items-center gap-2 text-sm text-gray-500">
                <Type className="w-4 h-4" />
                <span>Full editor with formatting options</span>
              </div>
            </button>
          </div>
        )}

        {/* Upload Mode - figma NewProject 스타일 */}
        {mode === 'upload' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Project Info */}
            <div className="space-y-6">
              {/* Project Details */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg text-gray-900 mb-4">Project Details</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">
                      Project Name *
                    </label>
                    <input
                      type="text"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder="My Awesome Project"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-2">
                      Description
                    </label>
                    <textarea
                      value={projectDescription}
                      onChange={(e) => setProjectDescription(e.target.value)}
                      placeholder="A brief description of your project..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Upload Options */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg text-gray-900 mb-4">Upload Files</h3>

                <div className="space-y-4">
                  {/* Upload Folder */}
                  <div>
                    <label className="block w-full">
                      <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-br from-blue-50 to-purple-50 border border-gray-200 rounded-lg cursor-pointer hover:from-blue-100 hover:to-purple-100 transition-colors">
                        <FolderOpen className="w-5 h-5 text-blue-600" />
                        <div className="flex-1">
                          <div className="text-sm text-gray-900">
                            Upload Folder
                          </div>
                          <div className="text-xs text-gray-500">
                            Select an entire folder with structure
                          </div>
                        </div>
                      </div>
                      <input
                        type="file"
                        /* @ts-ignore - webkitdirectory is not in types but works */
                        webkitdirectory=""
                        directory=""
                        multiple
                        onChange={handleFolderUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Upload Individual Files */}
                  <div>
                    <label className="block w-full">
                      <div className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <FileText className="w-5 h-5 text-gray-600" />
                        <div className="flex-1">
                          <div className="text-sm text-gray-900">
                            Upload Files
                          </div>
                          <div className="text-xs text-gray-500">
                            Select individual files
                          </div>
                        </div>
                      </div>
                      <input
                        type="file"
                        multiple
                        accept=".md,.txt,.js,.ts,.jsx,.tsx,.py,.java,.cpp,.c,.go,.rs,.css,.html"
                        onChange={handleIndividualFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <p className="text-xs text-gray-500 mt-4">
                  Supported formats: .md, .txt, .js, .ts, .jsx, .tsx, .py,
                  .java, .cpp, .c, .go, .rs, .css, .html
                </p>
              </div>

              {/* Create Button */}
              <button
                onClick={handleCreateProject}
                disabled={!projectName.trim() || files.length === 0}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5" />
                Create Project
              </button>
            </div>

            {/* Right Column: File Preview */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg text-gray-900">
                  File Structure Preview
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {files.length > 0
                    ? `${uploadedFiles.length} file(s) uploaded`
                    : 'No files uploaded yet'}
                </p>
              </div>

              <div
                className="p-4 overflow-y-auto"
                style={{ maxHeight: '500px' }}
              >
                {files.length > 0 ? (
                  <FileTreeView files={files} />
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Upload className="w-12 h-12 text-gray-300 mb-3" />
                    <p className="text-sm text-gray-500">
                      Upload files or folders to see the structure
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Write Mode - 새로운 블록 시스템 */}
        {mode === 'write' && (
          <div className="max-w-3xl">
            {/* Title Input */}
            <div className="mb-6">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Untitled Post"
                className="w-full text-4xl text-gray-900 placeholder-gray-400 focus:outline-none bg-transparent"
              />
            </div>

            {/* Content Blocks */}
            <div className="space-y-6 mb-6">
              {content.map((block, index) => (
                <div key={`block-wrapper-${block.id}`}>
                  {/* Insert Menu Above (첫 번째 블록이 아닌 경우) */}
                  {index > 0 && (
                    <div className="flex items-center gap-3 py-2 opacity-0 hover:opacity-100 transition-opacity">
                      <div className="flex-1 h-px bg-gray-300"></div>
                      <button
                        onClick={() => insertBlockAfter(index - 1, 'text')}
                        className="flex items-center gap-2 px-3 py-1 text-xs bg-white border border-gray-300 text-gray-600 rounded-full hover:bg-gray-50 hover:border-gray-400 transition-colors"
                      >
                        <Type className="w-3 h-3" />
                        Add Text
                      </button>
                      <button
                        onClick={() => insertBlockAfter(index - 1, 'code')}
                        className="flex items-center gap-2 px-3 py-1 text-xs bg-white border border-gray-300 text-gray-600 rounded-full hover:bg-gray-50 hover:border-gray-400 transition-colors"
                      >
                        <Code className="w-3 h-3" />
                        Add Code
                      </button>
                      <div className="flex-1 h-px bg-gray-300"></div>
                    </div>
                  )}

                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden group relative">
                    {/* Remove Button */}
                    {content.length > 1 && (
                      <button
                        onClick={() => removeBlock(block.id)}
                        className="absolute top-3 right-3 z-10 flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 text-red-600 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}

                    {block.type === 'text' ? (
                      <div className="p-6">
                        <div
                          className="min-h-[150px] focus-within:ring-2 focus-within:ring-blue-500 rounded-lg"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <TipTapEditor
                            content={block.content}
                            onChange={(value: string) =>
                              updateBlockContent(block.id, value)
                            }
                            readOnly={false}
                            placeholder="Start writing... (Use # for headings, ## for subheadings)"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="p-6">
                        <div className="mb-2">
                          <label className="text-sm text-gray-600 mb-1 block">
                            Language
                          </label>
                          <input
                            type="text"
                            value={block.language || ''}
                            onChange={(e) =>
                              updateBlockLanguage(block.id, e.target.value)
                            }
                            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., javascript"
                          />
                        </div>
                        <div
                          className="focus-within:ring-2 focus-within:ring-blue-500 rounded-lg overflow-hidden"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <CodeEditor
                            content={block.content}
                            onChange={(value: string) =>
                              updateBlockContent(block.id, value)
                            }
                            readOnly={false}
                            height="200px"
                            language={block.language || 'javascript'}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Insert Menu Below */}
                  <div className="flex items-center gap-3 py-2 opacity-0 hover:opacity-100 transition-opacity">
                    <div className="flex-1 h-px bg-gray-300"></div>
                    <button
                      onClick={() => insertBlockAfter(index, 'text')}
                      className="flex items-center gap-2 px-3 py-1 text-xs bg-white border border-gray-300 text-gray-600 rounded-full hover:bg-gray-50 hover:border-gray-400 transition-colors"
                    >
                      <Type className="w-3 h-3" />
                      Add Text
                    </button>
                    <button
                      onClick={() => insertBlockAfter(index, 'code')}
                      className="flex items-center gap-2 px-3 py-1 text-xs bg-white border border-gray-300 text-gray-600 rounded-full hover:bg-gray-50 hover:border-gray-400 transition-colors"
                    >
                      <Code className="w-3 h-3" />
                      Add Code
                    </button>
                    <div className="flex-1 h-px bg-gray-300"></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={
                  !title.trim() || content.every((b) => !b.content.trim())
                }
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                Save Post
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
