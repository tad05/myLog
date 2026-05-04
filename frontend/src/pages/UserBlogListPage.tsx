import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { FolderOpen, ChevronRight, FileText, Plus } from 'lucide-react'
import { useProjects } from '@/hooks/useProject'

export const UserBlogListPage = () => {
  const navigate = useNavigate()
  const [selectedProject, setSelectedProject] = useState<number | null>(null)
  // const user = useSelector((state: RootState) => state.user.currentUser)
  const user = {
    id: 1,
    email: 'user@example.com',
    nickname: 'User',
    createdAt: '2023-01-01',
  }
  const { data: projects } = useProjects(user.id)
  const onClickCreate = () => {
    navigate('/myLog/blog/new')
  }
  useEffect(() => {
    if (!user) {
      navigate('/login')
    }
  }, [user, navigate])

  const handleProjectClick = (projectId: number) => {
    navigate(`/myLog/projects/${projectId}/files`)
  }

  return (
    <div className="h-full overflow-y-auto bg-[#f8f9fa]">
      <div className="max-w-5xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl mb-2 text-gray-900">My Projects</h1>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {projects?.map((project: any) => (
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
                    {project.title}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {project.description}
                  </p>
                </div>
              </div>

              {/* File count */}
              <div className="flex items-center gap-2 text-sm text-gray-600 pt-4 border-t border-gray-100">
                <FileText className="w-4 h-4" />
                <span>{project.fileCount} files</span>
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
