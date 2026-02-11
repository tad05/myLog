import { Route, Routes } from 'react-router-dom'
import { DashboardPage } from './pages/DashboardPage'
import { BlogListPage } from './pages/BlogListPage'
import { Header } from './components/Header'
import { BlogPage } from './pages/BlogPage'

function App() {
  return (
    <div className="bg-[var(--background)] h-screen flex flex-col">
      <Header />
      {/* <NavBar /> */}
      <div className="flex-1 overflow-auto" data-scroll-container>
        <Routes>
          <Route path="/myLog" element={<DashboardPage />} />
          <Route path="/myLog/blogs" element={<BlogListPage />} />
          <Route path="/myLog/blog/:blogId" element={<BlogPage />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
