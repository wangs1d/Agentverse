import { CircleAlert, User } from 'lucide-react'

export type AppPage = 'home' | 'upload' | 'analytics'

interface TopBarProps {
  page: AppPage
  onPageChange: (page: AppPage) => void
}

const TABS: { key: AppPage; label: string }[] = [
  { key: 'upload', label: '产品管理' },
  { key: 'analytics', label: '数据分析' },
]

export function TopBar({ page, onPageChange }: TopBarProps) {
  return (
    <header
      className="fixed left-0 top-0 z-50 w-full border-b"
      style={{
        height: 56,
        background: 'rgba(0,0,0,0.72)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderColor: 'var(--surface-border, #3a3a3c)',
      }}
    >
      <div className="flex h-full max-w-screen-2xl mx-auto items-center justify-between px-8">
        {/* Logo */}
        <button
          onClick={() => onPageChange('home')}
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <span className="text-lg font-bold tracking-tight text-[var(--text-primary, #f5f5f7)]">
            Agentverse
          </span>
          <span className="inline-block w-2 h-2 rounded-full bg-apple-blue" />
        </button>

        {/* Nav Links */}
        <nav className="flex items-center gap-6">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => onPageChange(tab.key)}
              className={`text-sm transition-colors duration-150 ${
                page === tab.key
                  ? 'text-apple-blue'
                  : 'text-apple-text-secondary hover:text-[var(--text-primary, #f5f5f7)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <button className="text-apple-text-secondary transition-colors hover:text-apple-text">
            <CircleAlert className="w-5 h-5" />
          </button>
          <div
            className="flex items-center justify-center w-8 h-8 rounded-full border"
            style={{
              background: 'var(--surface-secondary, #1c1c1e)',
              borderColor: 'var(--surface-border, #3a3a3c)',
            }}
          >
            <User className="w-4 h-4 text-apple-text-secondary" />
          </div>
        </div>
      </div>
    </header>
  )
}
