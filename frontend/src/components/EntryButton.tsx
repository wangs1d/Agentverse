import { Megaphone } from 'lucide-react'
import type { CSSProperties, MouseEventHandler } from 'react'

export interface EntryButtonProps {
  onClick?: MouseEventHandler<HTMLButtonElement>
  label?: string
  variant?: 'primary' | 'ghost'
  iconSize?: number
  className?: string
  style?: CSSProperties
}

/**
 * 入口按钮 - 可嵌入 Agent World 已有应用导航栏
 * - primary：实心科技蓝 + 微弱辉光
 * - ghost：透明背景 + 边框，hover 高亮
 */
export function EntryButton({
  onClick,
  label = '商业智能推广',
  variant = 'ghost',
  iconSize = 16,
  className = '',
  style,
}: EntryButtonProps) {
  return (
    <button
      onClick={onClick}
      style={style}
      className={[
        'group relative inline-flex items-center gap-1.5 rounded-md px-3 py-1.5',
        'text-sm font-medium transition-all duration-200',
        variant === 'primary'
          ? 'bg-tech text-white hover:bg-tech-light hover:shadow-glow-soft active:scale-[0.98]'
          : 'text-ink-100 bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-tech-light/40 hover:text-tech-light',
        className,
      ].join(' ')}
    >
      <Megaphone
        size={iconSize}
        className="transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110"
      />
      <span>{label}</span>
      {/* 角标 */}
      <span className="absolute -right-1 -top-1 flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-tech-neon opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-tech-neon" />
      </span>
    </button>
  )
}
