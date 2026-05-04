import { Route, Routes } from 'react-router-dom'
import { Root } from './components/Root'
import { DashboardPage } from './pages/DashboardPage'
import { BlogListPage } from './pages/BlogListPage'
import { UserBlogListPage } from './pages/UserBlogListPage'
import { BlogPage } from './pages/BlogPage'
import { BlogCreatePage } from './pages/BlogCreatePage'
/** @jsxImportSource @emotion/react */

function App() {
  return (
    <Routes>
      <Route path="/" element={<Root />}>
        <Route index element={<DashboardPage />} />
        <Route path="myLog" element={<DashboardPage />} />
        <Route path="myLog/my-projects" element={<UserBlogListPage />} />
        <Route path="myLog/projects" element={<BlogListPage />} />
        <Route path="myLog/projects/:projectId/files" element={<BlogPage />} />
        <Route path="myLog/files/:fileId" element={<BlogPage />} />
        <Route path="myLog/blog/new" element={<BlogCreatePage />} />
      </Route>
    </Routes>
  )
}

export default App
