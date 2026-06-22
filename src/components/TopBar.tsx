import { usePromoStore } from '../store/usePromoStore'
import { Upload, Cpu, Bot, Sparkles, RotateCcw } from 'lucide-react'

export function TopBar() {
  const stage = usePromoStore((s) => s.stage)
  const reset = usePromoStore((s) => s.reset)

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

  return (
    <header className="relative z-20 border-b border-white/[0.05] bg-ink-900/70 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between px-6">
        {/* 品牌 */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-tech shadow-glow-soft">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold text-ink-50">Agent World</div>
            <div className="text-[10px] uppercase tracking-widest text-ink-200">Business Intelligence</div>
          </div>
        </div>

        {/* 步骤指示器 */}
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

        {/* 重置 */}
        {stage !== 'idle' && (
          <button onClick={reset} className="btn-ghost text-[11px]">
            <RotateCcw className="h-3 w-3" />
            重新演示
          </button>
        )}
      </div>
    </header>
  )
}
