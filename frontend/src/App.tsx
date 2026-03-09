import { Route, Routes } from 'react-router-dom'
import { DashboardPage } from './pages/DashboardPage'
import { BlogListPage } from './pages/BlogListPage'
import { Header } from './components/Header'
import { BlogPage } from './pages/BlogPage'
import { BlogCreatePage } from './pages/BlogCreatePage'
import { useEffect, useState } from 'react'
/** @jsxImportSource @emotion/react */

function App() {
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

  return (
    <div className="bg-[var(--background)] h-screen flex flex-col">
      <Header />
      {/* <NavBar /> */}
      <div
        className="flex-1 overflow-auto"
        data-scroll-container
        css={{
          position: 'relative',
          // 상단 드래그 스크롤 영역 시각적 피드백 (Header 바로 아래)
          '&::before': {
            content: '""',
            position: 'fixed',
            top: '64px', // Header 높이 추정값
            left: 0,
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
            left: 0,
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
        <Routes>
          <Route path="/myLog" element={<DashboardPage />} />
          <Route path="/myLog/blogs" element={<BlogListPage />} />
          <Route path="/myLog/blog/:blogId" element={<BlogPage />} />
          <Route path="/myLog/blog/new" element={<BlogCreatePage />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
