import { Sparkles } from 'lucide-react'

export type AppPage = 'home' | 'demo' | 'merchant'

interface TopBarProps {
  page: AppPage
  onPageChange: (page: AppPage) => void
}

const TABS: { key: AppPage; label: string }[] = [
  { key: 'home', label: '首页' },
  { key: 'demo', label: '演示' },
  { key: 'merchant', label: '商家后台' },
]

export function TopBar({ page, onPageChange }: TopBarProps) {
  return (
    <header className="relative z-20 border-b border-white/[0.05] bg-ink-900/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between px-6">
        <button
          onClick={() => onPageChange('home')}
          className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-tech shadow-glow-soft">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>
          <div className="text-left">
            <div className="text-sm font-semibold text-ink-50">Agentverse</div>
            <div className="text-[10px] uppercase tracking-widest text-ink-300">Persona-Driven Commerce</div>
          </div>
        </button>

        <nav className="flex items-center gap-0.5">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => onPageChange(tab.key)}
              className={`relative rounded-md px-4 py-1.5 text-[13px] font-medium transition-colors ${
                page === tab.key ? 'text-ink-50' : 'text-ink-200 hover:text-ink-50'
              }`}
            >
              {tab.label}
              {page === tab.key && (
                <span className="absolute inset-x-3 -bottom-px h-px bg-tech-light" />
              )}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2 text-[11px] text-ink-200">
          <span className="h-1.5 w-1.5 rounded-full bg-accent-success" />
          <span>8 Personas × 8 Products</span>
        </div>
      </div>
    </header>
  )
}
