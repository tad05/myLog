import { Route, Routes } from 'react-router-dom'
import { Root } from './components/Root'
import { DashboardPage } from './pages/DashboardPage'
import { BlogListPage } from './pages/BlogListPage'
import { BlogPage } from './pages/BlogPage'
import { BlogCreatePage } from './pages/BlogCreatePage'
/** @jsxImportSource @emotion/react */

function App() {
  return (
    <Routes>
      <Route path="/" element={<Root />}>
        <Route index element={<DashboardPage />} />
        <Route path="myLog" element={<DashboardPage />} />
        <Route path="myLog/blogs" element={<BlogListPage />} />
        <Route path="myLog/projects/:projectId" element={<BlogPage />} />
        <Route path="myLog/projects/file/:fileId" element={<BlogPage />} />
        <Route path="myLog/blog/new" element={<BlogCreatePage />} />
      </Route>
    </Routes>
  )
}

export default App
