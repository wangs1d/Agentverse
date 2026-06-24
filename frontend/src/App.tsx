import { useState } from 'react'
import { TopBar, type AppPage } from './components/TopBar'
import { Home } from './pages/Home'
import { Demo } from './pages/Demo'
import { MerchantDashboard } from './pages/MerchantDashboard'

function App() {
  const [page, setPage] = useState<AppPage>('home')

  return (
    <div className="flex h-screen flex-col">
      <TopBar page={page} onPageChange={setPage} />

      {page === 'home' && <Home onNavigate={setPage} />}
      {page === 'demo' && <Demo />}
      {page === 'merchant' && <MerchantDashboard />}
    </div>
  )
}

export default App
