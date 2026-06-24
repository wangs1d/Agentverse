import { usePromoStore } from '../store/usePromoStore'
import { Upload, Cpu, Bot, Sparkles, RotateCcw, Users, Megaphone, Package, Brain, Clock, BarChart3 } from 'lucide-react'
import { useState } from 'react'

export type AppPage = 'product' | 'promo' | 'persona' | 'contrast' | 'timing' | 'merchant'

interface TopBarProps {
  page: AppPage
  onPageChange: (page: AppPage) => void
}

export function TopBar({ page, onPageChange }: TopBarProps) {
  const stage = usePromoStore((s) => s.stage)
  const reset = usePromoStore((s) => s.reset)
  const [hovered, setHovered] = useState<AppPage | null>(null)

  const steps = [
    { key: 'left', label: 'B 端上传', icon: Upload },
    { key: 'middle', label: '算法匹配', icon: Cpu },
    { key: 'right', label: 'Agent 推荐', icon: Bot },
  ] as const

  const activeIndex = (() => {
    if (stage === 'idle') return -1
    if (stage === 'submitted' || stage === 'inferring') return 0
    if (stage === 'matching') return 1
    if (stage === 'done') return 2
    return -1
  })()

  const tabs: { key: AppPage; label: string; icon: any; badge?: string }[] = [
    { key: 'product', label: '产品世界', icon: Package },
    { key: 'promo', label: '推广演示', icon: Megaphone },
    { key: 'merchant', label: '商家后台', icon: BarChart3, badge: 'NEW' },
    { key: 'persona', label: '人格世界', icon: Users, badge: '8' },
    { key: 'contrast', label: '反常识对比', icon: Brain, badge: 'HIT' },
    { key: 'timing', label: '时机之轮', icon: Clock },
  ]

  return (
    <header className="relative z-20 border-b border-white/[0.05] bg-ink-900/70 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between px-6">
        {/* 品牌 + tab 导航 */}
        <div className="flex items-center gap-6">
          {/* 品牌 */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-tech shadow-glow-soft">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <div>
              <div className="text-sm font-semibold text-ink-50">Agentverse</div>
              <div className="text-[10px] uppercase tracking-widest text-ink-200">Persona-Driven Commerce</div>
            </div>
          </div>

          {/* 分隔线 */}
          <div className="h-5 w-px bg-white/[0.08]" />

          {/* tab 导航 */}
          <nav className="flex items-center gap-1 rounded-lg border border-white/[0.06] bg-white/[0.02] p-0.5">
            {tabs.map((tab) => (
              <TabButton
                key={tab.key}
                active={page === tab.key}
                hovered={hovered === tab.key}
                onClick={() => onPageChange(tab.key)}
                onMouseEnter={() => setHovered(tab.key)}
                onMouseLeave={() => setHovered(null)}
                icon={(() => {
                  const Icon = tab.icon
                  return <Icon className="h-3.5 w-3.5" />
                })()}
                label={tab.label}
                badge={tab.badge}
              />
            ))}
          </nav>
        </div>

        {/* 步骤指示器（仅在 promo 页显示） */}
        {page === 'promo' && (
          <div className="flex items-center gap-2">
            {steps.map((s, i) => {
              const Icon = s.icon
              const done = activeIndex > i || (activeIndex === 2 && i === 2)
              const active = activeIndex === i
              return (
                <div key={s.key} className="flex items-center gap-2">
                  <div
                    className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] transition-all ${
                      done
                        ? 'border-tech-light/40 bg-tech/15 text-tech-light'
                        : active
                        ? 'border-tech-light/40 bg-tech/10 text-tech-light breath-dot'
                        : 'border-white/[0.06] bg-white/[0.02] text-ink-200'
                    }`}
                  >
                    <Icon className="h-3 w-3" />
                    <span>{s.label}</span>
                  </div>
                  {i < steps.length - 1 && (
                    <div
                      className={`h-px w-8 transition-colors ${
                        activeIndex > i ? 'bg-tech/60' : 'bg-white/[0.06]'
                      }`}
                    />
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* 右侧 */}
        <div className="flex items-center gap-3">
          {page === 'promo' && stage !== 'idle' ? (
            <button onClick={reset} className="btn-ghost text-[11px]">
              <RotateCcw className="h-3 w-3" />
              重新演示
            </button>
          ) : (
            <div className="flex items-center gap-2 text-[11px] text-ink-200">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-success breath-dot" />
              8 Personas × 8 Products
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

function TabButton({
  active,
  hovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
  icon,
  label,
  badge,
}: {
  active: boolean
  hovered: boolean
  onClick: () => void
  onMouseEnter: () => void
  onMouseLeave: () => void
  icon: React.ReactNode
  label: string
  badge?: string
}) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`relative flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-medium transition-all ${
        active
          ? 'bg-tech/15 text-tech-light shadow-glow-soft'
          : hovered
          ? 'bg-white/[0.04] text-ink-50'
          : 'text-ink-200'
      }`}
    >
      {icon}
      <span>{label}</span>
      {badge && (
        <span
          className={`ml-0.5 rounded px-1 py-0.5 text-[8px] font-bold uppercase tracking-wider ${
            active ? 'bg-tech/30 text-tech-light' : 'bg-tech/20 text-tech-light/80'
          }`}
        >
          {badge}
        </span>
      )}
    </button>
  )
}
