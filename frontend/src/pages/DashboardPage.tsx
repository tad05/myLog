import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Clock, Bookmark } from 'lucide-react'
import type { RootState } from '../store'

export const DashboardPage = () => {
  const navigate = useNavigate()
  const blogProgressList = useSelector(
    (state: RootState) => state.readingProgress.progressList,
  )
  const blogScrapList = useSelector(
    (state: RootState) => state.blogScrap.scrapList,
  )

  return (
    <div className="h-full overflow-y-auto bg-[#f8f9fa]">
      <div className="max-w-5xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl mb-2 text-gray-900">Welcome back</h1>
          <p className="text-gray-600">Continue where you left off</p>
        </div>

        {/* Recently Read Section */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-5 h-5 text-gray-700" />
            <h2 className="text-xl text-gray-900">Recently Read</h2>
          </div>

          <div className="space-y-3">
            {blogProgressList.slice(0, 5).map((progress) => (
              <div
                key={progress.id}
                onClick={() => navigate(`/myLog/blog/${progress.id}`)}
                className="bg-white rounded-xl p-6 cursor-pointer transition-all hover:shadow-md border border-gray-200/50 hover:border-gray-300"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg text-gray-900 mb-1">
                      {progress.title}
                    </h3>
                    <p className="text-sm text-gray-500">Last read recently</p>
                  </div>
                  {blogScrapList.some((scrap) => scrap.id === progress.id) && (
                    <Bookmark className="w-4 h-4 text-blue-500 fill-blue-500 flex-shrink-0" />
                  )}
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="relative overflow-hidden bg-gray-100 rounded-full w-full h-1.5">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-transform duration-300 ease-out rounded-full"
                      style={{ width: `${progress.percent}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    {progress.percent}% complete
                  </p>
                </div>
              </div>
            ))}

            {blogProgressList.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No reading progress yet. Start reading to see your progress
                here!
              </div>
            )}
          </div>
        </section>

        {/* Bookmarked Posts Section */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Bookmark className="w-5 h-5 text-gray-700" />
            <h2 className="text-xl text-gray-900">Bookmarked</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {blogScrapList.map((scrap) => (
              <div
                key={scrap.id}
                onClick={() => navigate(`/myLog/blog/${scrap.id}`)}
                className="bg-white rounded-xl p-6 cursor-pointer transition-all hover:shadow-md border border-gray-200/50 hover:border-gray-300"
              >
                <h3 className="text-lg text-gray-900 mb-2">{scrap.title}</h3>
                <p className="text-sm text-gray-500">Bookmarked</p>
              </div>
            ))}

            {blogScrapList.length === 0 && (
              <div className="col-span-2 text-center py-8 text-gray-500">
                No bookmarked posts yet. Bookmark posts to see them here!
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
