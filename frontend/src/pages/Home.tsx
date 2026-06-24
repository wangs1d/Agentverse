// 简洁首页：仅 hero，去掉所有装饰性卡片网格
import { ArrowRight, Sparkles, BarChart3 } from 'lucide-react'

interface HomeProps {
  onNavigate: (page: 'demo' | 'merchant') => void
}

export function Home({ onNavigate }: HomeProps) {
  return (
    <main className="flex flex-1 flex-col overflow-y-auto">
      <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden px-6">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-tech/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-tech-light/30 bg-tech/[0.06] px-3 py-1 text-[11px] text-tech-light">
            <Sparkles className="h-3 w-3" />
            <span>关系驱动的 B2C 智能推荐平台</span>
          </div>

          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-ink-50 md:text-5xl">
            你的产品，
            <br />
            <span className="bg-gradient-to-r from-tech-light via-tech to-tech-neon bg-clip-text text-transparent">
              会被对的人主动找上门
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-[14px] leading-relaxed text-ink-100">
            Agentverse 不卖广告位。我们用 8 个带内部矛盾的人格模型，
            <br className="hidden md:block" />
            让你的产品以私人 Agent 主动开口的方式，触达真正会买的人。
          </p>

          <p className="mx-auto mt-4 max-w-lg text-[12px] leading-relaxed text-ink-300">
            通用 Agent 联网能搜到商品，但解决不了「信任不对称」。
            <br className="hidden md:block" />
            Agentverse 的 Agent 会在对的时间、对的语气、主动说出缺点。
          </p>

          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              onClick={() => onNavigate('demo')}
              className="group flex items-center gap-2 rounded-md bg-tech px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-tech-light hover:shadow-glow-soft"
            >
              看 60 秒 Demo
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
            <button
              onClick={() => onNavigate('merchant')}
              className="flex items-center gap-2 rounded-md border border-white/[0.08] bg-white/[0.02] px-5 py-2.5 text-sm text-ink-100 transition-all hover:border-white/15 hover:text-ink-50"
            >
              <BarChart3 className="h-3.5 w-3.5" />
              商家后台
            </button>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/[0.05] px-6 py-5 text-center text-[11px] text-ink-300">
        Agentverse · Persona-Driven Commerce · 2026
      </footer>
    </main>
  )
}
