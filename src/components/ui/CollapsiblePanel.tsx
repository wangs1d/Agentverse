import { usePromoStore } from '../../store/usePromoStore'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'

interface Props {
  side: 'left' | 'middle' | 'right'
  title: string
  subtitle?: string
  icon: ReactNode
  children: ReactNode
  active?: boolean
  /** 抽屉展开宽度（仅 left/right 生效），默认 320 */
  drawerWidth?: number
}

/**
 * 通用可折叠面板
 * - middle 模式：占满剩余空间（flex-1）
 * - left/right 模式：以 drawerWidth 为准，可折叠为 44px 窄条
 */
export function CollapsiblePanel({
  side,
  title,
  subtitle,
  icon,
  children,
  active,
  drawerWidth = 320,
}: Props) {
  const collapsed = usePromoStore((s) => s.collapsed[side])
  const toggle = usePromoStore((s) => s.togglePanel)

  const isDrawer = side !== 'middle'

  // 折叠态：显示窄条 + 图标 + 纵向标题
  if (collapsed) {
    return (
      <button
        onClick={() => toggle(side)}
        className={`group relative flex shrink-0 flex-col items-center justify-between overflow-hidden border-white/[0.05] bg-ink-850/70 backdrop-blur-xl transition-colors hover:bg-ink-800 ${
          isDrawer ? 'w-11 border-r' : 'flex-1 border-r'
        } ${side === 'right' ? 'border-l border-r-0' : ''}`}
        title={`展开 ${title}`}
      >
        {/* 顶部高亮带（激活态） */}
        {active && (
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-tech-light to-transparent" />
        )}

        <div className="flex flex-1 flex-col items-center justify-center gap-3 py-6">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-md border transition-all ${
              active
                ? 'border-tech-light/60 bg-tech/15 text-tech-light shadow-glow-soft'
                : 'border-white/[0.08] bg-white/[0.03] text-ink-100 group-hover:border-white/15 group-hover:text-ink-50'
            }`}
          >
            {icon}
          </div>
          <div
            className={`text-[11px] font-medium tracking-[0.2em] transition-colors ${
              active ? 'text-tech-light' : 'text-ink-200 group-hover:text-ink-50'
            }`}
            style={{ writingMode: 'vertical-rl' }}
          >
            {title}
          </div>
          {active && (
            <div className="mt-1 flex h-1.5 w-1.5 animate-pulse rounded-full bg-tech-light shadow-glow-soft" />
          )}
        </div>
        <div className="mb-4 flex flex-col items-center gap-1 text-ink-300 transition-transform group-hover:translate-x-0.5">
          {side === 'left' ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
          <span className="text-[9px] uppercase tracking-widest">展开</span>
        </div>
      </button>
    )
  }

  // 展开态
  const expandedClass = isDrawer
    ? `shrink-0 overflow-hidden rounded-xl`
    : `min-w-0 flex-1 overflow-hidden rounded-xl`

  const widthStyle = isDrawer ? { width: `${drawerWidth}px` } : undefined

  return (
    <section
      style={widthStyle}
      className={`panel-surface relative flex flex-col transition-all duration-300 ${expandedClass} ${
        active ? 'shadow-glow-soft' : ''
      }`}
    >
      <header className="panel-header">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-md border transition-colors ${
              active
                ? 'border-tech-light/60 bg-tech/15 text-tech-light'
                : 'border-white/[0.08] bg-white/[0.03] text-ink-100'
            }`}
          >
            {icon}
          </div>
          <div>
            <h2 className="text-sm font-semibold text-ink-50">{title}</h2>
            {subtitle && <p className="text-[11px] text-ink-200">{subtitle}</p>}
          </div>
        </div>
        <button
          onClick={() => toggle(side)}
          className="flex h-7 w-7 items-center justify-center rounded text-ink-200 transition-colors hover:bg-white/[0.05] hover:text-ink-50"
          title="折叠"
        >
          {side === 'left' ? (
            <ChevronLeft className="h-4 w-4" />
          ) : side === 'right' ? (
            <ChevronRight className="h-4 w-4" />
          ) : null}
        </button>
      </header>
      <div className="flex-1 overflow-auto scrollbar-thin">{children}</div>

      {/* 激活态顶部光带 */}
      {active && (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-tech-light to-transparent" />
      )}
    </section>
  )
}
