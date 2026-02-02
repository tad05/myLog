import { Route, Routes } from 'react-router-dom'
import { DashboardPage } from './pages/DashboardPage'

function App() {
  return (
    <div className="bg-[var(--background)] px-8">
      <Routes>
        <Route path="/myLog" element={<DashboardPage />} />
      </Routes>
    </div>
  )
}

export default App
