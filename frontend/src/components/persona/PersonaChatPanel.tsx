// 适配人格的对话面板：5 步对话流 + 打字机动画 + 接受/拒绝交互
import { useEffect, useState, useMemo } from 'react'
import { Bot, User as UserIcon, RefreshCw, Pause, Play, ThumbsUp, ThumbsDown, Lightbulb, X, Heart, Clock } from 'lucide-react'
import type { PersonaProfile } from '../../data/personaProfiles'
import { getPersonaConversation } from '../../data/personaConversations'
import { PRODUCTS, type Product } from '../../data/products'
import { calculatePersonaMatch } from '../../lib/scoreCalculator'

interface PersonaChatPanelProps {
  persona: PersonaProfile
}

interface ChatStep {
  speaker: 'agent' | 'user'
  text: string
}

type Phase = 'idle' | 'chatting' | 'completed' | 'rejected' | 'accepted'

export function PersonaChatPanel({ persona }: PersonaChatPanelProps) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [step, setStep] = useState(0)
  const [typedText, setTypedText] = useState('')
  const [playing, setPlaying] = useState(true)
  const [seed, setSeed] = useState(0)

  // 自动为该 persona 选最匹配的 B 端产品
  const matchedProduct: Product = useMemo(() => {
    const sorted = PRODUCTS
      .map((p) => ({ p, m: calculatePersonaMatch(p, persona) }))
      .sort((a, b) => b.m.score - a.m.score)
    return sorted[0]?.p || PRODUCTS[0]
  }, [persona])

  const brand = matchedProduct.brand
  const product = matchedProduct.name

  const conv = getPersonaConversation(persona.id)
  const fillTemplate = (s: string) => s.replace(/\{brand\}/g, brand).replace(/\{product\}/g, product)

  const flow: ChatStep[] = [
    { speaker: 'agent', text: fillTemplate(conv.greeting) },
    { speaker: 'agent', text: fillTemplate(conv.probe) },
    { speaker: 'user', text: fillTemplate(conv.userResponse) },
    { speaker: 'agent', text: fillTemplate(conv.share) },
    { speaker: 'agent', text: fillTemplate(conv.closing) },
  ]

  useEffect(() => {
    if (!playing || phase !== 'chatting') return
    if (step >= flow.length) {
      setPhase('completed')
      return
    }
    const current = flow[step].text
    if (typedText.length < current.length) {
      const t = setTimeout(() => {
        setTypedText(current.slice(0, typedText.length + 1))
      }, 28)
      return () => clearTimeout(t)
    } else {
      const t = setTimeout(() => {
        setStep((s) => s + 1)
        setTypedText('')
      }, step === flow.length - 1 ? 0 : 700)
      return () => clearTimeout(t)
    }
  }, [step, typedText, playing, phase, flow, seed])

  useEffect(() => {
    if (phase === 'idle') {
      const t = setTimeout(() => setPhase('chatting'), 200)
      return () => clearTimeout(t)
    }
  }, [phase, seed])

  const reset = () => {
    setPhase('idle')
    setStep(0)
    setTypedText('')
    setPlaying(true)
    setSeed((s) => s + 1)
  }

  const handleAccept = () => setPhase('accepted')
  const handleReject = () => setPhase('rejected')

  return (
    <div className="panel-surface flex h-full flex-col overflow-hidden rounded-xl">
      {/* 头部：人格 + 控制 */}
      <div className="flex items-center gap-3 border-b border-white/[0.05] px-5 py-3">
        <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-tech/40 to-tech-neon/40 text-sm font-bold text-tech-light">
          {persona.name[0]}
          {phase === 'accepted' && <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-ink-850 bg-accent-success" />}
          {phase === 'rejected' && <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-ink-850 bg-accent-warning" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-ink-50">{persona.name}</span>
            <span className="rounded bg-tech/10 px-1.5 py-0.5 text-[9px] text-tech-light">
              {persona.archetype}
            </span>
          </div>
          <div className="text-[10px] text-ink-300">
            推荐产品：{brand} {product}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPlaying((p) => !p)}
            className="btn-ghost px-2 py-1 text-[10px]"
            title={playing ? '暂停' : '继续'}
          >
            {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          </button>
          <button onClick={reset} className="btn-ghost px-2 py-1 text-[10px]" title="重新模拟">
            <RefreshCw className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* 对话区 */}
      <div className="flex-1 space-y-3 overflow-y-auto p-5">
        {flow.map((s, i) => {
          if (i > step) return null
          const isCurrent = i === step && phase === 'chatting'
          const text = isCurrent ? typedText : s.text
          const isAgent = s.speaker === 'agent'

          return (
            <div
              key={`${seed}-${i}`}
              className={`flex animate-fade-in gap-2.5 ${isAgent ? 'justify-start' : 'justify-end'}`}
            >
              {isAgent && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-tech/15 text-tech-light">
                  <Bot className="h-3.5 w-3.5" />
                </div>
              )}
              <div
                className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-[12.5px] leading-relaxed ${
                  isAgent
                    ? 'rounded-tl-sm bg-ink-800/80 text-ink-50'
                    : 'rounded-tr-sm bg-tech/15 text-ink-50'
                }`}
              >
                {text}
                {isCurrent && (
                  <span className="ml-0.5 inline-block h-3 w-1.5 -translate-y-0.5 animate-pulse bg-tech-light align-middle" />
                )}
              </div>
              {!isAgent && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-ink-100">
                  <UserIcon className="h-3.5 w-3.5" />
                </div>
              )}
            </div>
          )
        })}

        {/* 完成态：让用户决定 */}
        {phase === 'completed' && (
          <div className="animate-fade-in rounded-xl border border-tech-light/30 bg-tech/[0.05] p-4">
            <div className="mb-1 text-[10px] uppercase tracking-wider text-tech-light">球在你这边</div>
            <p className="text-[11px] leading-relaxed text-ink-100">
              Agent 已经把信息摆给你了。<span className="text-tech-light">决定权在你手里</span>，没有「立即下单」「限时优惠」之类的催单。
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                onClick={handleAccept}
                className="flex items-center justify-center gap-1.5 rounded-md bg-accent-success/15 px-3 py-2 text-xs font-medium text-accent-success transition-all hover:bg-accent-success/25"
              >
                <ThumbsUp className="h-3.5 w-3.5" />
                我想试试
              </button>
              <button
                onClick={handleReject}
                className="flex items-center justify-center gap-1.5 rounded-md border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-ink-200 transition-all hover:border-accent-warning/30 hover:text-accent-warning"
              >
                <ThumbsDown className="h-3.5 w-3.5" />
                这次不需要
              </button>
            </div>
          </div>
        )}

        {/* 接受态 */}
        {phase === 'accepted' && (
          <div className="animate-fade-in rounded-xl border border-accent-success/30 bg-accent-success/[0.06] p-4">
            <div className="mb-2 flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-accent-success">
              <Heart className="h-3 w-3" />
              转化成功
            </div>
            <p className="text-[11px] leading-relaxed text-ink-100">
              Agent 不会弹「恭喜你」之类的彩带——它会继续陪你日常聊天，等下次你有相关需求时自然地再提一句。
            </p>
          </div>
        )}

        {/* 拒绝态：展示 Agent 的应对策略 */}
        {phase === 'rejected' && (
          <div className="animate-fade-in space-y-2">
            <div className="rounded-xl border border-accent-warning/30 bg-accent-warning/[0.04] p-4">
              <div className="mb-1 flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-accent-warning">
                <X className="h-3 w-3" />
                拒绝已记录 · Agent 不会追着你推
              </div>
              <p className="text-[11px] leading-relaxed text-ink-100">
                Agent 知道「{persona.name}」的决策模式是<span className="text-tech-light">{persona.decisionStyle}</span>，
                所以不会强行二次推销。
              </p>
            </div>
            <div className="rounded-xl border border-tech-light/20 bg-ink-900/40 p-4">
              <div className="mb-2 flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-tech-light">
                <Lightbulb className="h-3 w-3" />
                Agent 接下来会这样做
              </div>
              <p className="text-[12px] leading-relaxed text-ink-50">
                {persona.agentStrategy.ifRejected}
              </p>
              <div className="mt-2 flex items-start gap-1.5 rounded-md bg-ink-900/60 p-2 text-[10px] text-ink-300">
                <Clock className="mt-0.5 h-2.5 w-2.5 shrink-0" />
                <span>
                  <span className="text-ink-100">最佳触发窗口：</span>
                  {persona.agentStrategy.bestTiming}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
