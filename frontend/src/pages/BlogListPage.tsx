import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Bookmark } from 'lucide-react'
import type { RootState } from '../store'

import { useProjects } from '@/hooks/useProject'
import { useBlogs } from '@/hooks/useBlog'

export const BlogListPage = () => {
  const navigate = useNavigate()

  const blogProgressList = useSelector(
    (state: RootState) => state.readingProgress.progressList,
  )
  const blogScrapList = useSelector(
    (state: RootState) => state.blogScrap.scrapList,
  )
  const { data: projects } = useProjects()
  const { data: blogs } = useBlogs()
  const [unit, setUnit] = useState('projects')
  const [list, setList] = useState<{ id: number; title: string }[]>([])

  const handleProjectClick = (id: number) => {
    if (unit === 'projects') {
      navigate(`/myLog/projects/${id}/files`)
    }
    if (unit === 'blogs') {
      navigate(`/myLog/files/${id}`)
    }
  }

  useEffect(() => {
    setUnit(unit)
    setList(unit === 'projects' ? projects : blogs)
  }, [unit])

  return (
    <div className="h-full overflow-y-auto bg-[#f8f9fa]">
      <div className="max-w-5xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl mb-2 text-gray-900">Main</h1>
        </div>

        {/* Recently Read Section */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">{/* {option} */}</div>
        </div>

        <div className="space-y-3">
          {list?.map((item, idx) => (
            <div
              key={item.id || idx}
              onClick={() => handleProjectClick(item.id)}
              className="bg-white rounded-xl p-6 cursor-pointer transition-all hover:shadow-md border border-gray-200/50 hover:border-gray-300"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-500">Last read recently</p>
                </div>
                {blogScrapList.some((scrap) => scrap.id === item.id) && (
                  <Bookmark className="w-4 h-4 text-blue-500 fill-blue-500 flex-shrink-0" />
                )}
              </div>
              {/* Progress Bar 하단 빨간줄로 변경 */}
              {/* <div className="space-y-1.5">
                                <div className="relative overflow-hidden bg-gray-100 rounded-full w-full h-1.5">
                                    <div
                                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-transform duration-300 ease-out rounded-full"
                                        style={{ width: `${progress.percent}%` }}
                                    />
                                </div>
                                <p className="text-xs text-gray-500">
                                    {progress.percent}% complete
                                </p>
                            </div> */}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
