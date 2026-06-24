// 左侧人格详情面板
import type { PersonaProfile } from '../../data/personaProfiles'
import { MapPin, Briefcase, Banknote, Zap, MessageCircle, Brain, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'

interface PersonaDetailProps {
  persona: PersonaProfile
}

export function PersonaDetail({ persona }: PersonaDetailProps) {
  return (
    <div className="panel-surface flex h-full flex-col overflow-hidden rounded-xl">
      {/* 头部 */}
      <div className="border-b border-white/[0.05] p-5">
        <div className="mb-3 flex items-start gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-tech/30 to-tech-neon/30 text-2xl font-bold text-tech-light shadow-glow-soft">
            {persona.name[0]}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-2">
              <h2 className="text-lg font-semibold text-ink-50">{persona.name}</h2>
              <span className="text-[11px] text-ink-300">
                {persona.age} · {persona.gender === 'F' ? '女' : '男'}
              </span>
            </div>
            <div className="mt-0.5 text-[11px] text-ink-200">{persona.archetype}</div>
            <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-tech/10 px-2 py-0.5 text-[10px] text-tech-light">
              <span className="h-1 w-1 rounded-full bg-tech-light" />
              {persona.catchphrase}
            </div>
          </div>
        </div>

        {/* 基本信息网格 */}
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <InfoRow icon={<MapPin className="h-3 w-3" />} label="城市" value={`${persona.city} · ${persona.cityTier}`} />
          <InfoRow icon={<Briefcase className="h-3 w-3" />} label="职业" value={persona.occupation} />
          <InfoRow icon={<Banknote className="h-3 w-3" />} label="收入" value={persona.monthlyIncome} />
          <InfoRow icon={<Zap className="h-3 w-3" />} label="人生阶段" value={persona.lifeStage} />
        </div>
      </div>

      {/* 滚动内容区 */}
      <div className="flex-1 space-y-4 overflow-y-auto p-5 text-[12px]">
        {/* 内部矛盾（核心）*/}
        <Section title="内部矛盾（人格真实感）" icon={<Brain className="h-3 w-3" />} highlight>
          <p className="leading-relaxed text-ink-100">{persona.internalContradiction}</p>
        </Section>

        {/* 核心价值观 */}
        <Section title="核心价值观" icon={<CheckCircle2 className="h-3 w-3" />}>
          <div className="flex flex-wrap gap-1.5">
            {persona.coreValues.map((v) => (
              <span key={v} className="chip">
                {v}
              </span>
            ))}
          </div>
        </Section>

        {/* 决策模式 */}
        <Section title="决策画像" icon={<Zap className="h-3 w-3" />}>
          <Row label="决策模式" value={persona.decisionStyle} />
          <Row label="决策速度" value={persona.decisionSpeed} />
          <Row label="价格敏感" value={persona.priceSensitivity} />
          <Row label="风险承受" value={persona.riskTolerance} />
          <Row label="品牌信任" value={persona.trustBrands} />
        </Section>

        {/* 沟通偏好 */}
        <Section title="沟通偏好" icon={<MessageCircle className="h-3 w-3" />}>
          <div className="mb-2">
            <div className="mb-1 text-[10px] uppercase tracking-wider text-ink-300/70">偏好的语气</div>
            <div className="flex flex-wrap gap-1">
              {persona.prefersTone.map((t) => (
                <span key={t} className="rounded bg-accent-success/10 px-1.5 py-0.5 text-[10px] text-accent-success">
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div className="mb-2">
            <div className="mb-1 text-[10px] uppercase tracking-wider text-ink-300/70">反感的语气</div>
            <div className="flex flex-wrap gap-1">
              {persona.dislikesTone.map((t) => (
                <span key={t} className="rounded bg-red-500/10 px-1.5 py-0.5 text-[10px] text-red-400">
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div className="mb-2">
            <div className="mb-1 text-[10px] uppercase tracking-wider text-ink-300/70">信任的信息源</div>
            <div className="flex flex-wrap gap-1">
              {persona.trustedSources.map((s) => (
                <span key={s} className="rounded bg-tech/10 px-1.5 py-0.5 text-[10px] text-tech-light">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </Section>

        {/* 生活痛点 */}
        <Section title="典型痛点" icon={<AlertTriangle className="h-3 w-3" />}>
          <ul className="space-y-1 text-ink-100">
            {persona.painPoints.map((p) => (
              <li key={p} className="flex items-start gap-1.5">
                <span className="mt-1.5 h-0.5 w-0.5 shrink-0 rounded-full bg-ink-300" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </Section>

        {/* Agent 应对策略 */}
        <Section title="Agent 应对策略（可执行）" icon={<Brain className="h-3 w-3" />} highlight>
          <StrategyRow label="开场" value={persona.agentStrategy.openingTactic} />
          <StrategyRow label="推荐路径" value={persona.agentStrategy.persuasionPath} />
          <StrategyRow label="最佳时机" value={persona.agentStrategy.bestTiming} />
          <StrategyRow label="收尾" value={persona.agentStrategy.closingStyle} />
          <StrategyRow label="被拒应对" value={persona.agentStrategy.ifRejected} />
          <StrategyRow label="证据类型" value={persona.agentStrategy.socialProofType} />
          <div className="mt-2">
            <div className="mb-1 text-[10px] uppercase tracking-wider text-ink-300/70">推荐用词</div>
            <div className="flex flex-wrap gap-1">
              {persona.agentStrategy.useKeywords.map((k) => (
                <span key={k} className="rounded bg-accent-success/10 px-1.5 py-0.5 text-[10px] text-accent-success">
                  {k}
                </span>
              ))}
            </div>
          </div>
          <div className="mt-2">
            <div className="mb-1 text-[10px] uppercase tracking-wider text-ink-300/70">避免用词</div>
            <div className="flex flex-wrap gap-1">
              {persona.agentStrategy.avoidKeywords.map((k) => (
                <span key={k} className="rounded bg-red-500/10 px-1.5 py-0.5 text-[10px] text-red-400">
                  {k}
                </span>
              ))}
            </div>
          </div>
        </Section>

        {/* 对比性反应 */}
        <Section title="同一 Agent 的两种话术反应" icon={<MessageCircle className="h-3 w-3" />}>
          <div className="rounded-lg border border-accent-success/20 bg-accent-success/5 p-2.5">
            <div className="mb-1 flex items-center gap-1 text-[10px] font-semibold text-accent-success">
              <CheckCircle2 className="h-3 w-3" />合适话术 → 真实反应
            </div>
            <p className="text-[11px] leading-relaxed text-ink-100">{persona.sampleReactions.goodFit}</p>
          </div>
          <div className="mt-2 rounded-lg border border-red-500/20 bg-red-500/5 p-2.5">
            <div className="mb-1 flex items-center gap-1 text-[10px] font-semibold text-red-400">
              <XCircle className="h-3 w-3" />不合适话术 → 真实反应
            </div>
            <p className="text-[11px] leading-relaxed text-ink-100">{persona.sampleReactions.badFit}</p>
          </div>
        </Section>

        {/* 日常场景 */}
        <Section title="一个真实生活片段" icon={<MessageCircle className="h-3 w-3" />}>
          <p className="italic leading-relaxed text-ink-100">"{persona.dailyScenario}"</p>
        </Section>
      </div>
    </div>
  )
}

function Section({
  title,
  icon,
  children,
  highlight = false,
}: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  highlight?: boolean
}) {
  return (
    <div
      className={`rounded-lg border p-3 ${
        highlight
          ? 'border-tech-light/20 bg-tech/[0.03]'
          : 'border-white/[0.05] bg-white/[0.02]'
      }`}
    >
      <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-200">
        <span className="text-tech-light">{icon}</span>
        {title}
      </div>
      {children}
    </div>
  )
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5 text-ink-200">
      <span className="text-ink-300">{icon}</span>
      <span className="text-ink-300/70">{label}:</span>
      <span className="truncate text-ink-50" title={value}>{value}</span>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="text-ink-300">{label}</span>
      <span className="font-medium text-ink-50">{value}</span>
    </div>
  )
}

function StrategyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-1.5">
      <span className="text-ink-300/80">{label}：</span>
      <span className="text-ink-100">{value}</span>
    </div>
  )
}
