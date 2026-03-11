import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { FolderOpen, ChevronRight, FileText, Plus } from 'lucide-react'
import type { RootState } from '../store'
import { FloatingButton } from '@/components/FloatingButton'

export const BlogListPage = () => {
  const navigate = useNavigate()
  const [selectedProject, setSelectedProject] = useState<string | null>(null)

  const blogProgressList = useSelector(
    (state: RootState) => state.readingProgress.progressList,
  )
  const blogScrapList = useSelector(
    (state: RootState) => state.blogScrap.scrapList,
  )

  const onClickCreate = () => {
    navigate('/myLog/blog/new')
  }

  // Mock projects based on existing data
  const mockProjects = [
    {
      id: 'personal',
      name: 'Personal Blog',
      description: 'My personal thoughts and writings',
      files: blogProgressList.slice(0, 3),
    },
    {
      id: 'tech',
      name: 'Tech Articles',
      description: 'Technical tutorials and guides',
      files: blogProgressList.slice(3, 6),
    },
    {
      id: 'bookmarks',
      name: 'Bookmarked Posts',
      description: 'My favorite saved articles',
      files: blogScrapList,
    },
  ]

  const handleProjectClick = (projectId: string) => {
    setSelectedProject(projectId)
    const project = mockProjects.find((p) => p.id === projectId)
    if (project?.files && project.files.length > 0) {
      navigate(`/myLog/blog/${project.files[0].id}`)
    }
  }

  return (
    <div className="h-full overflow-y-auto bg-[#f8f9fa]">
      <div className="max-w-5xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl mb-2 text-gray-900">My Projects</h1>
          <p className="text-gray-600">Organize your writing into projects</p>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {mockProjects.map((project) => (
            <div
              key={project.id}
              onClick={() => handleProjectClick(project.id)}
              className={`bg-white rounded-xl p-6 cursor-pointer transition-all hover:shadow-md border ${
                selectedProject === project.id
                  ? 'border-blue-500 shadow-md'
                  : 'border-gray-200/50 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 flex-shrink-0">
                  <FolderOpen className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg text-gray-900 mb-1 truncate">
                    {project.name}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {project.description}
                  </p>
                </div>
              </div>

              {/* File count */}
              <div className="flex items-center gap-2 text-sm text-gray-600 pt-4 border-t border-gray-100">
                <FileText className="w-4 h-4" />
                <span>{project.files.length} files</span>
                <ChevronRight className="w-4 h-4 ml-auto" />
              </div>
            </div>
          ))}
        </div>

        {/* Create New Project Section */}
        <div className="p-8 bg-white rounded-xl border border-dashed border-gray-300 text-center">
          <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg text-gray-700 mb-1">Create New Project</h3>
          <p className="text-sm text-gray-500 mb-4">
            Start a new project to organize your blog posts
          </p>
          <button
            onClick={onClickCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Post
          </button>
        </div>
      </div>
    </div>
  )
}
