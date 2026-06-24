// 同款产品对比视图：左侧人格 A 完整对话，右侧人格 B 完整对话
// 旁注每一步"为什么不同"——这是 B 端最买单的展示
import { PERSONA_PROFILES, type PersonaProfile } from '../../data/personaProfiles'
import { getPersonaConversation } from '../../data/personaConversations'
import { Bot, User as UserIcon, ArrowLeftRight } from 'lucide-react'

interface PersonaComparisonProps {
  aId: string
  bId: string
  brand: string
  product: string
  onSwap: () => void
}

const STEP_LABELS = ['开场', '试探', '用户反应', '推荐', '收尾']

export function PersonaComparison({ aId, bId, brand, product, onSwap }: PersonaComparisonProps) {
  // 这里我们直接对比"share"步骤，因为这一步差异最大
  const convA = getPersonaConversation(aId)
  const convB = getPersonaConversation(bId)

  // 简单查找 persona（避免传整个对象）
  const aProfile = PERSONA_PROFILES.find((p) => p.id === aId)!
  const bProfile = PERSONA_PROFILES.find((p) => p.id === bId)!

  const fillTpl = (s: string) => {
    if (brand && product) {
      return s.replace(/\{brand\}/g, brand).replace(/\{product\}/g, product)
    }
    // 没有传 brand/product，把占位符高亮成可点击填空的提示
    return s
      .replace(/\{brand\}/g, '【品牌】')
      .replace(/\{product\}/g, '【产品名】')
  }

  return (
    <div className="panel-surface rounded-xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-ink-200/70">
            <ArrowLeftRight className="h-3 w-3" />
            同款产品对比 · A vs B
          </div>
          <h3 className="mt-1 text-sm font-semibold text-ink-50">
            {brand && product
              ? `${brand} ${product} · 同一句话术 → 两个完全不同的人`
              : '同款产品 · 同一句话术 → 两个完全不同的人'}
          </h3>
        </div>
        <button onClick={onSwap} className="btn-ghost text-[11px]">
          <ArrowLeftRight className="h-3 w-3" />
          换一组
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* A 侧 */}
        <PersonaSide
          persona={aProfile}
          steps={[
            convA.greeting,
            convA.probe,
            convA.userResponse,
            convA.share,
            convA.closing,
          ].map(fillTpl)}
          tone="A"
        />
        {/* B 侧 */}
        <PersonaSide
          persona={bProfile}
          steps={[
            convB.greeting,
            convB.probe,
            convB.userResponse,
            convB.share,
            convB.closing,
          ].map(fillTpl)}
          tone="B"
        />
      </div>

      {/* 关键差异轴 */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        <DiffStrip profile={aProfile} tone="A" />
        <DiffStrip profile={bProfile} tone="B" />
      </div>
    </div>
  )
}

function PersonaSide({
  persona,
  steps,
  tone,
}: {
  persona: PersonaProfile
  steps: string[]
  tone: 'A' | 'B'
}) {
  const tagColor = tone === 'A' ? 'bg-tech/15 text-tech-light border-tech-light/30' : 'bg-accent-success/15 text-accent-success border-accent-success/30'
  return (
    <div className="rounded-lg border border-white/[0.05] bg-white/[0.02] p-3">
      <div className="mb-2 flex items-center gap-2">
        <span className={`flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-bold ${tagColor}`}>
          {tone}
        </span>
        <span className="text-sm font-semibold text-ink-50">{persona.name}</span>
        <span className="text-[10px] text-ink-300">{persona.age}岁</span>
        <span className="ml-auto text-[10px] text-ink-300/70">{persona.archetype}</span>
      </div>
      <div className="space-y-1.5">
        {steps.map((s, i) => {
          const isUser = i === 2
          return (
            <div
              key={i}
              className={`flex items-start gap-1.5 rounded-md p-1.5 text-[11.5px] leading-relaxed ${
                isUser ? 'bg-white/[0.02]' : 'bg-ink-800/50'
              }`}
            >
              <div className="flex w-12 shrink-0 items-center gap-1 text-[9px] uppercase tracking-wider text-ink-300/60">
                {isUser ? <UserIcon className="h-2.5 w-2.5" /> : <Bot className="h-2.5 w-2.5" />}
                <span>{STEP_LABELS[i]}</span>
              </div>
              <div className={`flex-1 ${isUser ? 'text-ink-200' : 'text-ink-50'}`}>{s}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function DiffStrip({ profile, tone }: { profile: PersonaProfile; tone: 'A' | 'B' }) {
  return (
    <div className="rounded-lg border border-white/[0.05] bg-ink-900/30 p-2.5 text-[10px]">
      <div className="mb-1.5 text-[9px] font-semibold uppercase tracking-wider text-ink-200/70">
        {tone} 的 Agent 配置
      </div>
      <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-ink-200">
        <span>价格敏感：<b className="text-ink-50">{profile.priceSensitivity}</b></span>
        <span>决策速度：<b className="text-ink-50">{profile.decisionSpeed}</b></span>
        <span>信息密度：<b className="text-ink-50">{profile.infoDensity}</b></span>
        <span>风险承受：<b className="text-ink-50">{profile.riskTolerance}</b></span>
      </div>
      <div className="mt-1.5 flex flex-wrap gap-1">
        {profile.agentStrategy.useKeywords.slice(0, 4).map((k) => (
          <span key={k} className="rounded bg-accent-success/10 px-1 py-0.5 text-[9px] text-accent-success">
            {k}
          </span>
        ))}
        {profile.agentStrategy.avoidKeywords.slice(0, 3).map((k) => (
          <span key={k} className="rounded bg-red-500/10 px-1 py-0.5 text-[9px] text-red-400">
            ✗{k}
          </span>
        ))}
      </div>
    </div>
  )
}
