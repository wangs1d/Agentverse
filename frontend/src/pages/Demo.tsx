// 演示页：3 个核心场景（产品 / 人格 / 对比）
import { useState } from 'react'
import { ProductWorld } from './ProductWorld'
import { PersonaWorld } from './PersonaWorld'
import { ContrastDemo } from './ContrastDemo'
import { Target, MessageCircle, Zap } from 'lucide-react'

const SECTIONS = [
  { key: 'product', label: '产品世界', icon: Target },
  { key: 'persona', label: '人格对话', icon: MessageCircle },
  { key: 'contrast', label: '反常识对比', icon: Zap },
] as const

type SectionKey = (typeof SECTIONS)[number]['key']

export function Demo() {
  const [active, setActive] = useState<SectionKey>('product')

  return (
    <main className="flex flex-1 flex-col overflow-y-auto">
      <div className="sticky top-0 z-10 border-b border-white/[0.05] bg-ink-900/85 px-6 py-2.5 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1400px] items-center gap-1.5">
          <span className="mr-2 text-[11px] text-ink-300">演示 ·</span>
          {SECTIONS.map((s) => {
            const Icon = s.icon
            return (
              <a
                key={s.key}
                href={`#${s.key}`}
                onClick={() => setActive(s.key)}
                className={`flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] transition-all ${
                  active === s.key
                    ? 'border-tech-light/40 bg-tech/[0.08] text-tech-light'
                    : 'border-white/[0.06] bg-white/[0.02] text-ink-200 hover:border-white/15 hover:text-ink-50'
                }`}
              >
                <Icon className="h-3 w-3" />
                {s.label}
              </a>
            )
          })}
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-[1400px] flex-col">
        <Section id="product" title="1 · 产品世界" subtitle="8 款真实产品 × 8 类 C 端人格的实时 AI 匹配分">
          <ProductWorld />
        </Section>

        <Section id="persona" title="2 · 人格对话" subtitle="选一个身边的人，看 Agent 怎么跟他说话；你能「接受」或「拒绝」">
          <PersonaWorld />
        </Section>

        <Section id="contrast" title="3 · 反常识对比" subtitle="通用 Agent vs Agentverse Agent · 同款产品同个人 · 两种话术">
          <ContrastDemo />
        </Section>
      </div>
    </main>
  )
}

function Section({
  id,
  title,
  subtitle,
  children,
}: {
  id: string
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="border-b border-white/[0.05] py-8 first:pt-10 last:border-b-0">
      <div className="mb-5 px-6">
        <h2 className="text-lg font-semibold text-ink-50">{title}</h2>
        <p className="mt-0.5 text-[12px] text-ink-200">{subtitle}</p>
      </div>
      <div className="h-[640px] overflow-hidden px-6">
        <div className="panel-surface h-full overflow-hidden rounded-xl">{children}</div>
      </div>
    </section>
  )
}
