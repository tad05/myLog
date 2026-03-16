import { Outlet, Link, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Home, FolderOpen, PenLine } from 'lucide-react'
/** @jsxImportSource @emotion/react */

export function Root() {
  const location = useLocation()
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(
    null,
  )

  // 드래그 스크롤 상태를 전역으로 공유하기 위한 이벤트 리스너
  useEffect(() => {
    const handleScrollDirection = (
      event: CustomEvent<'up' | 'down' | null>,
    ) => {
      setScrollDirection(event.detail)
    }

    window.addEventListener(
      'dragScrollDirection',
      handleScrollDirection as EventListener,
    )

    return () => {
      window.removeEventListener(
        'dragScrollDirection',
        handleScrollDirection as EventListener,
      )
    }
  }, [])

  const isActive = (path: string) => {
    const currentPath = location.pathname

    // /myLog/projects 경로인 경우
    if (path === '/myLog/projects') {
      return currentPath.startsWith('/myLog/projects')
    }

    // /myLog 경로인 경우 (projects가 아닌 경우만)
    if (path === '/myLog') {
      return (
        (currentPath === '/' || currentPath === '/myLog') &&
        !currentPath.startsWith('/myLog/projects')
      )
    }

    return false
  }

  return (
    <div className="flex h-screen bg-[#f8f9fa]">
      {/* Sidebar Navigation */}
      <div className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-6 gap-6">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
          <PenLine className="w-6 h-6 text-white" />
        </div>

        <nav className="flex flex-col gap-4 mt-4">
          <Link
            to="/myLog"
            className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all ${
              isActive('/myLog')
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            title="Home"
          >
            <Home className="w-5 h-5" />
          </Link>

          <Link
            to="/myLog/projects"
            className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all ${
              isActive('/myLog/projects')
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            title="Projects"
          >
            <FolderOpen className="w-5 h-5" />
          </Link>
        </nav>
      </div>

      {/* Main Content Area with Drag Scroll Container */}
      <div
        className="flex-1 overflow-auto"
        data-scroll-container
        css={{
          position: 'relative',
          // 상단 드래그 스크롤 영역 시각적 피드백
          '&::before': {
            content: '""',
            position: 'fixed',
            top: 0,
            left: '64px', // 사이드바 너비만큼 오프셋
            right: 0,
            height: '4px',
            background:
              scrollDirection === 'up'
                ? 'rgba(0, 123, 255, 0.8)'
                : 'transparent',
            pointerEvents: 'none',
            transition: 'background 0.2s ease',
            zIndex: 1000,
          },
          // 하단 드래그 스크롤 영역 시각적 피드백
          '&::after': {
            content: '""',
            position: 'fixed',
            bottom: '120px', // FloatingButton 위치 고려
            left: '64px', // 사이드바 너비만큼 오프셋
            right: 0,
            height: '4px',
            background:
              scrollDirection === 'down'
                ? 'rgba(0, 123, 255, 0.8)'
                : 'transparent',
            pointerEvents: 'none',
            transition: 'background 0.2s ease',
            zIndex: 1000,
          },
        }}
      >
        <Outlet />
      </div>
    </div>
  )
}
