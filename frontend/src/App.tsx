import { Route, Routes } from 'react-router-dom'
import { DashboardPage } from './pages/DashboardPage'
import { BlogListPage } from './pages/BlogListPage'
import { Header } from './components/Header'

function App() {
  return (
    <div className="bg-[var(--background)] min-h-screen">
      <Header />
      {/* <NavBar /> */}
      <div>
        <Routes>
          <Route path="/myLog" element={<DashboardPage />} />
          <Route path="/myLog/blogs" element={<BlogListPage />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
