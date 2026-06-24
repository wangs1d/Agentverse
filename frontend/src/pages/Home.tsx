// 简洁首页：hero + 价值主张 + 4 个 demo 入口卡片
import { ArrowRight, Sparkles, MessageCircle, BarChart3, Clock, Brain, Target, Zap, ShieldCheck } from 'lucide-react'

interface HomeProps {
  onNavigate: (page: 'demo' | 'merchant') => void
}

export function Home({ onNavigate }: HomeProps) {
  return (
    <main className="flex flex-1 flex-col overflow-y-auto">
      {/* Hero */}
      <section className="relative flex min-h-[78vh] items-center justify-center overflow-hidden px-6">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-tech/10 blur-3xl" />
          <div className="absolute right-1/4 top-1/4 h-72 w-72 rounded-full bg-tech-neon/10 blur-3xl" />
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

          <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-relaxed text-ink-100">
            Agentverse 不卖广告位。我们用 8 个带内部矛盾的人格模型，<br className="hidden md:block" />
            让你的产品以私人 Agent 主动开口的方式，触达真正会买的人。
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

          <div className="mt-12 grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-white/[0.05] bg-white/[0.02]">
            <Stat label="已建模 C 端人格" value="8" sub="类" />
            <Stat label="已上架 B 端产品" value="8" sub="款" />
            <Stat label="Agent 匹配" value="实时" sub="毫秒级" tone="tech" />
          </div>
        </div>
      </section>

      {/* 价值主张 */}
      <section className="border-t border-white/[0.05] bg-ink-900/40 px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <div className="text-[11px] uppercase tracking-widest text-ink-300">Why Agentverse</div>
            <h2 className="mt-2 text-2xl font-semibold text-ink-50">
              通用 Agent 联网能搜到商品，<br />
              但解决不了"信任不对称"
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <ValueCard
              icon={<Brain className="h-4 w-4" />}
              title="人格建模，不是 prompt 工程"
              desc={'每个人格都有内部矛盾、决策模式、最佳推荐时机。Agent 不是模板拼接，是"读懂"这个具体的人。'}
            />
            <ValueCard
              icon={<Clock className="h-4 w-4" />}
              title="对的时候说一句"
              desc="同一个产品，对小柯要在晚 9-11 点他刷手机时开口；对志远要在晚 9-10 点孩子睡着后 10 分钟。错的时间，再多推也白搭。"
            />
            <ValueCard
              icon={<ShieldCheck className="h-4 w-4" />}
              title="敢说缺点的 Agent"
              desc={'Agentverse Agent 会主动说"这款表带夏天出汗会黏、APP 偶尔抽风"。能说出缺点的反而更可信 —— 你的 Agent 比通用搜索更懂这个用户。'}
            />
          </div>
        </div>
      </section>

      {/* 4 个 demo 入口 */}
      <section className="border-t border-white/[0.05] px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-widest text-ink-300">Live Demo</div>
              <h2 className="mt-2 text-2xl font-semibold text-ink-50">4 个核心场景</h2>
            </div>
            <button
              onClick={() => onNavigate('demo')}
              className="flex items-center gap-1 text-[12px] text-tech-light transition-opacity hover:opacity-80"
            >
              全部演示 <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <DemoEntry
              icon={<Target className="h-4 w-4" />}
              title="产品世界"
              desc="8 款真实产品 × 8 类 C 端人格的实时 AI 匹配分，切换查看不同产品的真实适配人群"
            />
            <DemoEntry
              icon={<MessageCircle className="h-4 w-4" />}
              title="人格对话"
              desc="选一个身边的人，看 Agent 怎么跟他说话；你能「接受」或「拒绝」，Agent 不追着你推"
            />
            <DemoEntry
              icon={<Zap className="h-4 w-4" />}
              title="反常识对比"
              desc="同一款产品同一个人，通用 Agent 话术 vs Agentverse Agent 话术 —— 转化率天差地别"
            />
            <DemoEntry
              icon={<Clock className="h-4 w-4" />}
              title="时机之轮"
              desc="24 小时 × 8 人格推荐强度热力图。早上 6:30 跟晚上 9:11 该对谁开口？答案是不同的"
            />
          </div>
        </div>
      </section>

      <footer className="border-t border-white/[0.05] px-6 py-6 text-center text-[11px] text-ink-300">
        Agentverse · Persona-Driven Commerce · 2026
      </footer>
    </main>
  )
}

function Stat({ label, value, sub, tone = 'ink' }: { label: string; value: string; sub: string; tone?: 'ink' | 'tech' }) {
  return (
    <div className="bg-ink-900/50 p-4">
      <div className="text-[10px] uppercase tracking-wider text-ink-300">{label}</div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className={`font-mono text-2xl font-semibold ${tone === 'tech' ? 'text-tech-light' : 'text-ink-50'}`}>
          {value}
        </span>
        <span className="text-[10px] text-ink-300">{sub}</span>
      </div>
    </div>
  )
}

function ValueCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-lg border border-white/[0.05] bg-ink-900/40 p-5">
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-tech/15 text-tech-light">
        {icon}
      </div>
      <h3 className="mt-3 text-sm font-semibold text-ink-50">{title}</h3>
      <p className="mt-1.5 text-[12px] leading-relaxed text-ink-100">{desc}</p>
    </div>
  )
}

function DemoEntry({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <button className="group rounded-lg border border-white/[0.05] bg-ink-900/30 p-4 text-left transition-all hover:border-tech-light/30 hover:bg-tech/[0.03]">
      <div className="flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded bg-white/[0.05] text-ink-200 group-hover:bg-tech/15 group-hover:text-tech-light">
          {icon}
        </div>
        <h4 className="text-sm font-medium text-ink-50 group-hover:text-tech-light">{title}</h4>
        <ArrowRight className="ml-auto h-3.5 w-3.5 text-ink-300 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
      </div>
      <p className="mt-2 text-[12px] leading-relaxed text-ink-100">{desc}</p>
    </button>
  )
}
