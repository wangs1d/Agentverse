import { useState } from 'react'
import { TopBar, type AppPage } from './components/TopBar'
import { Home } from './pages/Home'
import { ProductUpload } from './pages/ProductUpload'
import { DataAnalytics } from './pages/DataAnalytics'

function App() {
  const [page, setPage] = useState<AppPage>('home')

  return (
    <div className="min-h-screen bg-black">
      <TopBar page={page} onPageChange={setPage} />

      {page === 'home' && <Home onNavigate={setPage} />}
      {page === 'upload' && <ProductUpload />}
      {page === 'analytics' && <DataAnalytics />}
    </div>
  )
}

export default App
