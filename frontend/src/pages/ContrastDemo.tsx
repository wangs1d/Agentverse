// 反常识对比演示：通用 Agent vs Agentverse Agent
// 同一个产品（Watch Pro），同一个用户（小柯），但两种话术对比
import { useState } from 'react'
import { Sparkles, ArrowRight, ThumbsDown, ThumbsUp, Zap, Bot, Brain, Lightbulb } from 'lucide-react'

interface ComparisonProduct {
  name: string
  brand: string
  desc: string
  genericAgent: { lines: string[]; outcome: 'rejected' | 'ignored' | 'converted' }
  agentverseAgent: { lines: string[]; outcome: 'converted' | 'pending' | 'considering' }
  personaInsight: {
    decisionStyle: string
    priceSensitivity: string
    trustedSources: string
    useKeywords: string[]
    avoidKeywords: string[]
    bestTiming: string
    ifRejected: string
  }
}

const COMPARISONS: ComparisonProduct[] = [
  {
    name: 'Watch Pro 智能运动手表',
    brand: 'Aether',
    desc: '专业跑步数据监测，14天续航，1899元',
    genericAgent: {
      outcome: 'rejected',
      lines: [
        '【Aether 智能助手】检测到您对运动产品感兴趣！',
        'Aether Watch Pro 正在限时特惠，下单立减500元！',
        '国民爆款，王者级性能，明星同款，错过再等一年！',
        '立即点击 → 抢购链接',
      ],
    },
    agentverseAgent: {
      outcome: 'considering',
      lines: [
        '晚上好啊，蹲宿舍床帘里刷手机呢',
        '今天跑步数据看了没？',
        '……啊最近在观望新表吧',
        '我替你翻了几款，{brand} 那个 {product} 可以多看两眼。续航实测比官方标的高一截，5ATM 防水，IP68 也扛得住',
        '但你要的"性价比"那栏，它不是同价位最便宜的——贵了两百。',
        '我翻了下什么值得买上的长测，有几个缺点的：表带夏天出汗会黏、APP 同步偶尔抽风',
        '能说出缺点的反而更可信，你自己定',
        '不催你，链接我先放着，你哪天想清楚了再点',
      ],
    },
    personaInsight: {
      decisionStyle: '研究型延迟决策：搜集 3-5 篇测评后还可能再拖一周',
      priceSensitivity: '极高（生活费 1500/月，敏感每一分钱）',
      trustedSources: 'B 站长测评、知乎真实用户、什么值得买',
      useKeywords: ['实测', '参数', '拆机', '性价比', '长测', '避坑', '客观'],
      avoidKeywords: ['爆款', '限时', '错过', '立即', '特惠', '明星同款'],
      bestTiming: '晚上 9-11 点他刷手机的低谷期',
      ifRejected: '不追问，一周后以"我看到一篇新的对比"自然带出',
    },
  },
  {
    name: 'AIChat 智能客服机器人',
    brand: '灵犀智能',
    desc: '企业级客服 AI，¥1,999/坐席/月',
    genericAgent: {
      outcome: 'ignored',
      lines: [
        '【灵犀智能】您的企业客服效率低？试试 AIChat！',
        'AI 智能客服，4.9 分好评，月销 2100！',
        '限时优惠，立即开通，前 100 名送 3 个月！',
        '点击查看 → 立即开通',
      ],
    },
    agentverseAgent: {
      outcome: 'converted',
      lines: [
        '李同学，开会开到这个点啊',
        '我看到你今天 4 个会连着开',
        '你那个客服团队，最近是不是加班到很晚？',
        '……我替你扫过，{brand} 那个 {product} 对得上你的场景。NLP 能力不是吹的，开会前 5 分钟能缓过来——',
        '我团队里有两个 PM 在用，反馈是真的有效，不是玄学',
        '我先把那两位朋友的反馈整理给你，看完你自己定',
      ],
    },
    personaInsight: {
      decisionStyle: '快决策：看到"对得上需求"就下单，平均 24-48 小时',
      priceSensitivity: '低（4-6 万/月，时间比钱贵）',
      trustedSources: '品牌官方、身边同层级朋友、垂直 KOL',
      useKeywords: ['推荐', '对得上', '省心', '高效', '一站式', '适合你'],
      avoidKeywords: ['比一比', '要不要考虑', '慢慢挑', '说个故事'],
      bestTiming: '晚 9-10 点孩子睡着后的 10 分钟窗口期',
      ifRejected: '不纠缠，隔天以"我顺手发现一个升级版"带过',
    },
  },
]

export function ContrastDemo() {
  const [active, setActive] = useState(0)
  const comp = COMPARISONS[active]

  return (
    <main className="flex flex-1 flex-col gap-3 overflow-hidden p-3">
      {/* 头部 */}
      <div className="panel-surface flex items-center gap-3 rounded-xl px-5 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-tech/20 text-tech-light">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <h1 className="text-sm font-semibold text-ink-50">
            反常识对比 · 通用 Agent vs Agentverse Agent
          </h1>
          <p className="text-[11px] text-ink-200">
            同一款产品，同一个用户人格，<span className="text-tech-light">两种话术</span>产生截然不同的结果
          </p>
        </div>
        <div className="hidden items-center gap-1.5 rounded-md border border-accent-warning/20 bg-accent-warning/5 px-2.5 py-1.5 text-[10px] text-accent-warning lg:flex">
          <Lightbulb className="h-3 w-3" />
          <span>不是 prompt 工程，是<span className="font-semibold">人格建模</span></span>
        </div>
      </div>

      {/* 产品切换 */}
      <div className="flex gap-2">
        {COMPARISONS.map((c, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`flex-1 rounded-lg border p-3 text-left transition-all ${
              active === i
                ? 'border-tech-light/50 bg-tech/[0.05]'
                : 'border-white/[0.05] bg-ink-900/30 hover:border-white/[0.1]'
            }`}
          >
            <div className="text-[10px] text-ink-300">{c.brand}</div>
            <div className="text-xs font-medium text-ink-50">{c.name}</div>
          </button>
        ))}
      </div>

      {/* 对比主体 */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-auto scrollbar-thin lg:grid-cols-[1fr_1fr_280px]">
        {/* 左：通用 Agent */}
        <GenericAgentPanel comp={comp} />
        {/* 中：箭头分隔 */}
        <div className="hidden lg:flex" />
        {/* 实际是左中右布局，我们用三列：通用 / Agentverse / 洞察 */}
        <AgentversePanel comp={comp} />
        <PersonaInsightPanel insight={comp.personaInsight} />
      </div>
    </main>
  )
}

function GenericAgentPanel({ comp }: { comp: ComparisonProduct }) {
  return (
    <div className="panel-surface flex flex-col overflow-hidden rounded-xl">
      <div className="flex items-center justify-between border-b border-white/[0.05] px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white/[0.05] text-ink-200">
            <Bot className="h-3.5 w-3.5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-ink-100">通用 Agent</div>
            <div className="text-[10px] text-ink-300">联网搜索 + 模板化话术</div>
          </div>
        </div>
        <OutcomeBadge outcome={comp.genericAgent.outcome} />
      </div>
      <div className="flex-1 overflow-auto p-3 scrollbar-thin">
        <div className="mb-2 text-[10px] text-ink-300">
          用户：「{comp.name}」相关搜索
        </div>
        <div className="space-y-2">
          {comp.genericAgent.lines.map((line, i) => (
            <div
              key={i}
              className="rounded-2xl rounded-bl-sm border border-white/[0.06] bg-ink-800/80 px-3 py-2 text-[11px] leading-relaxed text-ink-100"
            >
              {line}
            </div>
          ))}
        </div>
        <div className="mt-3 rounded-md border border-accent-warning/20 bg-accent-warning/5 p-2.5 text-[10px] text-accent-warning">
          ⚠ 触发了「{comp.personaInsight.avoidKeywords.slice(0, 3).join('/')}」等 5 个用户禁忌词
        </div>
      </div>
    </div>
  )
}

function AgentversePanel({ comp }: { comp: ComparisonProduct }) {
  return (
    <div className="panel-surface flex flex-col overflow-hidden rounded-xl border-tech-light/30">
      <div className="flex items-center justify-between border-b border-white/[0.05] bg-tech/[0.04] px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-tech text-white">
            <Brain className="h-3.5 w-3.5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-ink-50">Agentverse Agent</div>
            <div className="text-[10px] text-tech-light">基于人格建模 + 长期关系</div>
          </div>
        </div>
        <OutcomeBadge outcome={comp.agentverseAgent.outcome} />
      </div>
      <div className="flex-1 overflow-auto p-3 scrollbar-thin">
        <div className="mb-2 text-[10px] text-ink-300">
          私人 Agent · 知道你今天状态后的自然推荐
        </div>
        <div className="space-y-2">
          {comp.agentverseAgent.lines.map((line, i) => (
            <div
              key={i}
              className="rounded-2xl rounded-bl-sm border border-tech-light/30 bg-tech/[0.06] px-3 py-2 text-[11px] leading-relaxed text-ink-50"
            >
              {line
                .replace(/\{brand\}/g, comp.brand)
                .replace(/\{product\}/g, comp.name)}
            </div>
          ))}
        </div>
        <div className="mt-3 rounded-md border border-tech-light/30 bg-tech/10 p-2.5 text-[10px] text-tech-light">
          ✓ 命中了「{comp.personaInsight.useKeywords.slice(0, 4).join('/')}」等 7 个用户偏好词
        </div>
      </div>
    </div>
  )
}

function PersonaInsightPanel({
  insight,
}: {
  insight: ComparisonProduct['personaInsight']
}) {
  return (
    <div className="panel-surface flex flex-col overflow-hidden rounded-xl">
      <div className="flex items-center gap-2 border-b border-white/[0.05] px-4 py-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent-warning/20 text-accent-warning">
          <Brain className="h-3.5 w-3.5" />
        </div>
        <div>
          <div className="text-xs font-semibold text-ink-50">人格洞察</div>
          <div className="text-[10px] text-ink-300">Agent 知道的「看不见」的信息</div>
        </div>
      </div>
      <div className="flex-1 space-y-3 overflow-auto p-3 scrollbar-thin text-[11px]">
        <InsightRow label="决策模式" value={insight.decisionStyle} />
        <InsightRow label="价格敏感度" value={insight.priceSensitivity} />
        <InsightRow label="信任信源" value={insight.trustedSources} />
        <div>
          <div className="label-eyebrow mb-1.5">用词策略</div>
          <div className="flex flex-wrap gap-1">
            {insight.useKeywords.map((k) => (
              <span
                key={k}
                className="rounded-full border border-tech-light/30 bg-tech/[0.08] px-2 py-0.5 text-[10px] text-tech-light"
              >
                {k}
              </span>
            ))}
          </div>
        </div>
        <div>
          <div className="label-eyebrow mb-1.5">禁忌词</div>
          <div className="flex flex-wrap gap-1">
            {insight.avoidKeywords.map((k) => (
              <span
                key={k}
                className="rounded-full border border-accent-warning/30 bg-accent-warning/[0.08] px-2 py-0.5 text-[10px] text-accent-warning line-through"
              >
                {k}
              </span>
            ))}
          </div>
        </div>
        <InsightRow label="最佳时机" value={insight.bestTiming} />
        <InsightRow label="被拒绝后" value={insight.ifRejected} />
      </div>
    </div>
  )
}

function InsightRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="label-eyebrow mb-1">{label}</div>
      <div className="text-[11px] leading-relaxed text-ink-100">{value}</div>
    </div>
  )
}

function OutcomeBadge({ outcome }: { outcome: 'converted' | 'pending' | 'considering' | 'rejected' | 'ignored' }) {
  const map = {
    converted: { label: '下单转化', color: 'bg-accent-success/15 text-accent-success', icon: ThumbsUp },
    considering: { label: '考虑中', color: 'bg-tech/15 text-tech-light', icon: Zap },
    pending: { label: '观察中', color: 'bg-ink-700/50 text-ink-200', icon: Zap },
    rejected: { label: '直接拒绝', color: 'bg-accent-warning/15 text-accent-warning', icon: ThumbsDown },
    ignored: { label: '已读不回', color: 'bg-ink-700/50 text-ink-300', icon: ThumbsDown },
  }
  const m = map[outcome]
  const Icon = m.icon
  return (
    <span
      className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${m.color}`}
    >
      <Icon className="h-2.5 w-2.5" />
      {m.label}
    </span>
  )
}
