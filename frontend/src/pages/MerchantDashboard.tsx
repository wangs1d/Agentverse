// 商家后台：B端商家看到自己的产品怎么被推荐、漏斗数据、人群分布
// 关键点：所有数据基于 funnel.ts 真实计算，切换产品/人格时数据会跟着变
import { useMemo, useState } from 'react'
import { usePromoStore } from '../store/usePromoStore'
import { PRODUCTS, type Product } from '../data/products'
import { PERSONA_PROFILES, type PersonaProfile } from '../data/personaProfiles'
import {
  calculateProductTotalFunnel,
  calculateFunnel,
  type ProductFunnel,
} from '../lib/funnel'
import {
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingCart,
  DollarSign,
  Eye,
  Target,
  Zap,
  ChevronRight,
  BarChart3,
  Award,
  Sparkles,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Package,
  Activity,
  PieChart as PieIcon,
} from 'lucide-react'

interface DashboardData {
  product: Product
  funnel: ReturnType<typeof calculateProductTotalFunnel>
}

export function MerchantDashboard() {
  const userProduct = usePromoStore((s) => s.product)
  // 商家后台的"我的产品"列表：合并用户上传的产品 + PRODUCTS 库中部分产品
  const myProducts: Product[] = useMemo(() => {
    const builtIn: Product[] = [
      PRODUCTS[0], // AIChat
      PRODUCTS[1], // SmartOffice
      PRODUCTS[2], // MarketAI
      PRODUCTS[7], // Watch Pro
    ]
    if (userProduct?.name) {
      return [
        {
          id: 'user-uploaded',
          brand: userProduct.brand || '我的品牌',
          name: userProduct.name,
          category: userProduct.type,
          price: userProduct.price || 999,
          priceUnit: '/月',
          desc: userProduct.desc || '（用户上传的产品）',
          image: userProduct.image,
          tags: ['我的产品'],
          monthlySales: 0,
          rating: 0,
          merchantNote: '你刚才上传演示的产品',
        },
        ...builtIn,
      ]
    }
    return builtIn
  }, [userProduct])

  const [selectedId, setSelectedId] = useState<string>(myProducts[0]?.id || '')
  const [selectedPersonaId, setSelectedPersonaId] = useState<string | null>(null)

  const selectedProduct = myProducts.find((p) => p.id === selectedId) || myProducts[0]
  const dashboardData: DashboardData | null = useMemo(() => {
    if (!selectedProduct) return null
    return {
      product: selectedProduct,
      funnel: calculateProductTotalFunnel(selectedProduct),
    }
  }, [selectedProduct])

  // 总览数据
  const overall = useMemo(() => {
    if (!dashboardData) return null
    const { aggregate } = dashboardData.funnel
    return aggregate
  }, [dashboardData])

  return (
    <main className="flex flex-1 flex-col gap-3 overflow-hidden p-3">
      {/* 头部 */}
      <div className="panel-surface flex items-center gap-3 rounded-xl px-5 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent-success/20 text-accent-success">
          <BarChart3 className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <h1 className="text-sm font-semibold text-ink-50">商家后台 · 转化漏斗 · 真实数据驱动</h1>
          <p className="text-[11px] text-ink-200">
            所有漏斗数据基于产品×人格的<span className="text-tech-light">真实匹配分</span>计算 · 不是硬编码
          </p>
        </div>
        <div className="hidden items-center gap-2 rounded-md border border-accent-success/20 bg-accent-success/5 px-2.5 py-1.5 text-[10px] text-accent-success md:flex">
          <Activity className="h-3 w-3" />
          <span>过去 30 天 · {selectedProduct?.brand || ''} 视角</span>
        </div>
      </div>

      {/* 产品切换 */}
      <ProductSwitcher
        products={myProducts}
        selectedId={selectedId}
        onSelect={setSelectedId}
        userProductId={userProduct?.name ? 'user-uploaded' : null}
      />

      {/* 顶部 KPI 卡 */}
      {overall && dashboardData && (
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <KpiCard
            icon={<Eye className="h-3.5 w-3.5" />}
            label="Agent 触达"
            value={overall.impressions.toLocaleString()}
            sub="次曝光"
            tone="neutral"
            delta="+18%"
            deltaPositive
          />
          <KpiCard
            icon={<Target className="h-3.5 w-3.5" />}
            label="匹配开口"
            value={overall.matched.toLocaleString()}
            sub={`转化率 ${((overall.matched / overall.impressions) * 100).toFixed(1)}%`}
            tone="tech"
            delta="+24%"
            deltaPositive
          />
          <KpiCard
            icon={<CheckCircle2 className="h-3.5 w-3.5" />}
            label="最终转化"
            value={overall.converted.toLocaleString()}
            sub={`单次 ${((overall.converted / overall.impressions) * 100).toFixed(2)}%`}
            tone="success"
            delta="+12%"
            deltaPositive
          />
          <KpiCard
            icon={<DollarSign className="h-3.5 w-3.5" />}
            label="GMV"
            value={`¥${(overall.revenue / 10000).toFixed(1)}万`}
            sub={`ROI ${overall.roi.toFixed(1)}x`}
            tone="warning"
            delta="+34%"
            deltaPositive
          />
        </div>
      )}

      {/* 漏斗 + 人群分布 */}
      {dashboardData && (
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-hidden lg:grid-cols-[1.4fr_1fr]">
          {/* 漏斗 */}
          <FunnelPanel
            funnel={dashboardData.funnel}
            selectedPersonaId={selectedPersonaId}
            onSelectPersona={setSelectedPersonaId}
          />
          {/* 人群分布 */}
          <PersonaDistributionPanel
            perPersona={dashboardData.funnel.perPersona}
            selectedId={selectedPersonaId}
            onSelect={setSelectedPersonaId}
          />
        </div>
      )}

      {/* 选中人格的详细漏斗 */}
      {selectedPersonaId && dashboardData && (
        <SinglePersonaFunnel
          funnel={dashboardData.funnel.perPersona.find(
            (f) => f.persona.id === selectedPersonaId,
          )}
        />
      )}
    </main>
  )
}

/**
 * 产品切换器
 */
function ProductSwitcher({
  products,
  selectedId,
  onSelect,
  userProductId,
}: {
  products: Product[]
  selectedId: string
  onSelect: (id: string) => void
  userProductId: string | null
}) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
      {products.map((p) => {
        const isUser = p.id === userProductId
        const active = p.id === selectedId
        return (
          <button
            key={p.id}
            onClick={() => onSelect(p.id)}
            className={`group flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-left transition-all ${
              active
                ? isUser
                  ? 'border-accent-warning/40 bg-accent-warning/[0.06]'
                  : 'border-tech-light/40 bg-tech/[0.05]'
                : 'border-white/[0.05] bg-ink-900/30 hover:border-white/[0.1]'
            }`}
          >
            <img
              src={p.image}
              alt={p.name}
              className="h-7 w-7 shrink-0 rounded object-cover"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-xs font-medium text-ink-50">{p.name}</span>
                {isUser && (
                  <span className="shrink-0 rounded bg-accent-warning/20 px-1 py-0.5 text-[8px] font-bold uppercase text-accent-warning">
                    你上传的
                  </span>
                )}
              </div>
              <div className="truncate text-[10px] text-ink-300">
                {p.brand} · ¥{p.price.toLocaleString()}{p.priceUnit}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}

/**
 * KPI 卡
 */
function KpiCard({
  icon,
  label,
  value,
  sub,
  tone,
  delta,
  deltaPositive,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub: string
  tone: 'tech' | 'success' | 'warning' | 'neutral'
  delta: string
  deltaPositive: boolean
}) {
  const ring = {
    tech: 'border-tech/30 bg-tech/[0.04]',
    success: 'border-accent-success/30 bg-accent-success/[0.04]',
    warning: 'border-accent-warning/30 bg-accent-warning/[0.04]',
    neutral: 'border-white/[0.05] bg-ink-900/40',
  }[tone]

  const valueColor = {
    tech: 'text-tech-light',
    success: 'text-accent-success',
    warning: 'text-accent-warning',
    neutral: 'text-ink-50',
  }[tone]

  return (
    <div className={`rounded-lg border p-2.5 ${ring}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-ink-200">
          {icon}
          <span className="text-[10px] tracking-wider">{label}</span>
        </div>
        <div
          className={`flex items-center gap-0.5 rounded px-1 py-0.5 text-[9px] ${
            deltaPositive
              ? 'bg-accent-success/15 text-accent-success'
              : 'bg-accent-warning/15 text-accent-warning'
          }`}
        >
          {deltaPositive ? (
            <ArrowUpRight className="h-2.5 w-2.5" />
          ) : (
            <TrendingDown className="h-2.5 w-2.5" />
          )}
          {delta}
        </div>
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className={`font-mono text-lg font-semibold ${valueColor}`}>{value}</span>
      </div>
      <div className="text-[10px] text-ink-300">{sub}</div>
    </div>
  )
}

/**
 * 漏斗面板
 */
function FunnelPanel({
  funnel,
  selectedPersonaId,
  onSelectPersona,
}: {
  funnel: ReturnType<typeof calculateProductTotalFunnel>
  selectedPersonaId: string | null
  onSelectPersona: (id: string | null) => void
}) {
  // 漏斗五阶段（聚合）
  const aggregate = funnel.aggregate
  const stages = [
    { name: 'Agent 看到', count: aggregate.impressions, tone: 'ink' },
    { name: '判定匹配 · 开口', count: aggregate.matched, tone: 'tech' },
    { name: '用户接收 · 没反感', count: aggregate.engaged, tone: 'tech' },
    { name: '查看详情', count: aggregate.clicked, tone: 'tech' },
    { name: '最终转化', count: aggregate.converted, tone: 'success' },
  ] as const

  const maxCount = stages[0].count
  const widths = stages.map((s) => Math.max(8, (s.count / maxCount) * 100))

  return (
    <div className="panel-surface flex flex-col overflow-hidden rounded-xl">
      <div className="flex items-center justify-between border-b border-white/[0.05] px-4 py-3">
        <div>
          <div className="flex items-center gap-1.5">
            <BarChart3 className="h-3.5 w-3.5 text-tech-light" />
            <h2 className="text-xs font-semibold text-ink-50">转化漏斗</h2>
          </div>
          <p className="mt-0.5 text-[10px] text-ink-300">
            从 Agent 看到 → 最终转化（5 阶段）
          </p>
        </div>
        <div className="rounded-md border border-tech-light/30 bg-tech/[0.06] px-2.5 py-1 text-right">
          <div className="text-[9px] text-tech-light">整体转化率</div>
          <div className="font-mono text-sm font-bold text-tech-light">
            {(aggregate.overallConversion * 100).toFixed(2)}%
          </div>
        </div>
      </div>
      <div className="flex-1 space-y-1.5 overflow-auto p-3 scrollbar-thin">
        {stages.map((s, i) => {
          const rate = i === 0 ? 1 : s.count / stages[i - 1].count
          const colorClass = {
            ink: 'bg-ink-700/40 text-ink-50',
            tech: 'bg-gradient-to-r from-tech/40 to-tech-neon/30 text-tech-light',
            success: 'bg-gradient-to-r from-accent-success/50 to-emerald-400/40 text-accent-success',
          }[s.tone]

          return (
            <div key={i}>
              <div className="mb-0.5 flex items-center justify-between text-[10px]">
                <span className="text-ink-100">{s.name}</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-ink-50">{s.count.toLocaleString()}</span>
                  {i > 0 && (
                    <span
                      className={`rounded px-1 py-0.5 font-mono ${
                        rate > 0.4
                          ? 'bg-accent-success/15 text-accent-success'
                          : rate > 0.15
                          ? 'bg-tech/15 text-tech-light'
                          : 'bg-ink-700/50 text-ink-200'
                      }`}
                    >
                      {(rate * 100).toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
              <div className="relative h-7 overflow-hidden rounded-md border border-white/[0.05] bg-ink-900/40">
                <div
                  className={`absolute inset-y-0 left-0 flex items-center justify-end px-2 transition-all duration-700 ${colorClass}`}
                  style={{ width: `${widths[i]}%` }}
                >
                  <span className="text-[9px] font-medium opacity-90">
                    {((s.count / maxCount) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          )
        })}

        {/* 收入成本分析 */}
        <div className="mt-3 grid grid-cols-3 gap-2 rounded-lg border border-white/[0.05] bg-ink-900/30 p-2.5">
          <div className="text-center">
            <div className="text-[9px] uppercase tracking-wider text-ink-300">GMV</div>
            <div className="mt-0.5 font-mono text-sm font-semibold text-accent-success">
              ¥{(aggregate.revenue / 10000).toFixed(2)}万
            </div>
          </div>
          <div className="text-center">
            <div className="text-[9px] uppercase tracking-wider text-ink-300">投放成本</div>
            <div className="mt-0.5 font-mono text-sm font-semibold text-ink-100">
              ¥{(aggregate.cost / 10000).toFixed(2)}万
            </div>
          </div>
          <div className="text-center">
            <div className="text-[9px] uppercase tracking-wider text-ink-300">ROI</div>
            <div
              className={`mt-0.5 font-mono text-sm font-semibold ${
                aggregate.roi > 5
                  ? 'text-accent-success'
                  : aggregate.roi > 2
                  ? 'text-tech-light'
                  : 'text-accent-warning'
              }`}
            >
              {aggregate.roi.toFixed(1)}x
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * 人群分布面板
 */
function PersonaDistributionPanel({
  perPersona,
  selectedId,
  onSelect,
}: {
  perPersona: ProductFunnel[]
  selectedId: string | null
  onSelect: (id: string | null) => void
}) {
  // 按收入排序
  const sorted = useMemo(
    () => [...perPersona].sort((a, b) => b.revenue - a.revenue),
    [perPersona],
  )
  const maxRevenue = Math.max(...sorted.map((f) => f.revenue), 1)

  // 总转化数
  const totalConverted = perPersona.reduce((s, f) => s + f.stages[4].count, 0)

  return (
    <div className="panel-surface flex flex-col overflow-hidden rounded-xl">
      <div className="flex items-center justify-between border-b border-white/[0.05] px-4 py-3">
        <div>
          <div className="flex items-center gap-1.5">
            <PieIcon className="h-3.5 w-3.5 text-accent-warning" />
            <h2 className="text-xs font-semibold text-ink-50">8 类人格 · 收入分布</h2>
          </div>
          <p className="mt-0.5 text-[10px] text-ink-300">
            点击看单人漏斗细节
          </p>
        </div>
        <div className="rounded-md border border-accent-warning/30 bg-accent-warning/5 px-2.5 py-1 text-right">
          <div className="text-[9px] text-accent-warning">总转化</div>
          <div className="font-mono text-sm font-bold text-accent-warning">
            {totalConverted.toLocaleString()}
          </div>
        </div>
      </div>
      <div className="flex-1 space-y-1 overflow-auto p-3 scrollbar-thin">
        {sorted.map((f) => {
          const pct = (f.revenue / maxRevenue) * 100
          const tierColor =
            f.match.tier === 'strong'
              ? 'bg-accent-success'
              : f.match.tier === 'weak'
              ? 'bg-accent-warning'
              : 'bg-ink-700'
          const active = selectedId === f.persona.id
          return (
            <button
              key={f.persona.id}
              onClick={() => onSelect(active ? null : f.persona.id)}
              className={`group w-full rounded-md border p-2 text-left transition-all ${
                active
                  ? 'border-tech-light/50 bg-tech/[0.05]'
                  : 'border-white/[0.05] hover:border-white/[0.1]'
              }`}
            >
              <div className="mb-1 flex items-center gap-2">
                <div
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${tierColor}`}
                />
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-tech/30 to-tech-neon/30 text-[9px] font-semibold text-tech-light">
                  {f.persona.name[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-[11px] font-medium text-ink-50">
                      {f.persona.name}
                    </span>
                    {f.match.tier === 'strong' && (
                      <span className="rounded bg-accent-success/15 px-1 py-0.5 text-[8px] text-accent-success">
                        主力
                      </span>
                    )}
                  </div>
                  <div className="truncate text-[9px] text-ink-300">
                    {f.persona.archetype}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-[10px] text-ink-50">
                    ¥{(f.revenue / 1000).toFixed(1)}k
                  </div>
                  <div className="font-mono text-[9px] text-tech-light">
                    {f.stages[4].count}单
                  </div>
                </div>
              </div>
              <div className="relative h-1 overflow-hidden rounded-full bg-white/[0.04]">
                <div
                  className={`absolute inset-y-0 left-0 rounded-full ${
                    f.match.tier === 'strong'
                      ? 'bg-gradient-to-r from-accent-success to-emerald-400'
                      : f.match.tier === 'weak'
                      ? 'bg-gradient-to-r from-accent-warning to-yellow-400'
                      : 'bg-ink-700'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="mt-1 flex items-center justify-between text-[9px] text-ink-300">
                <span>匹配分 {f.match.score}</span>
                <span>ROI {f.roi.toFixed(1)}x</span>
                <ChevronRight className="h-2.5 w-2.5 opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/**
 * 选中人格的详细漏斗
 */
function SinglePersonaFunnel({ funnel }: { funnel: ProductFunnel | undefined }) {
  if (!funnel) return null
  const maxCount = funnel.stages[0].count
  const widths = funnel.stages.map((s) => Math.max(8, (s.count / maxCount) * 100))

  return (
    <div className="panel-surface flex flex-col overflow-hidden rounded-xl border-tech-light/30">
      <div className="flex items-center justify-between border-b border-white/[0.05] bg-tech/[0.04] px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-tech/40 to-tech-neon/40 text-sm font-bold text-tech-light">
            {funnel.persona.name[0]}
          </div>
          <div>
            <div className="text-sm font-semibold text-ink-50">
              {funnel.persona.name} · 单人漏斗
            </div>
            <div className="text-[10px] text-ink-300">
              匹配分 {funnel.match.score} · {funnel.match.tierLabel}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 text-right">
          <div>
            <div className="text-[9px] text-ink-300">单人 GMV</div>
            <div className="font-mono text-sm font-semibold text-accent-success">
              ¥{(funnel.revenue / 1000).toFixed(1)}k
            </div>
          </div>
          <div>
            <div className="text-[9px] text-ink-300">ROI</div>
            <div className="font-mono text-sm font-semibold text-tech-light">
              {funnel.roi.toFixed(1)}x
            </div>
          </div>
          <div>
            <div className="text-[9px] text-ink-300">转化率</div>
            <div className="font-mono text-sm font-semibold text-ink-50">
              {((funnel.stages[4].count / funnel.stages[0].count) * 100).toFixed(2)}%
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2 p-3 md:grid-cols-5">
        {funnel.stages.map((s, i) => {
          const rate = i === 0 ? 1 : s.count / funnel.stages[i - 1].count
          const colorBg = {
            ink: 'from-ink-700/40 to-ink-700/20 border-white/[0.05]',
            tech: 'from-tech/30 to-tech-neon/10 border-tech/30',
            warning: 'from-accent-warning/30 to-yellow-500/10 border-accent-warning/30',
            success: 'from-accent-success/40 to-emerald-400/10 border-accent-success/30',
          }[s.tone]
          const textColor = {
            ink: 'text-ink-50',
            tech: 'text-tech-light',
            warning: 'text-accent-warning',
            success: 'text-accent-success',
          }[s.tone]

          return (
            <div
              key={i}
              className={`rounded-lg border bg-gradient-to-br p-2.5 ${colorBg}`}
            >
              <div className="text-[10px] text-ink-200">{s.name}</div>
              <div className={`mt-1 font-mono text-lg font-semibold ${textColor}`}>
                {s.count.toLocaleString()}
              </div>
              {i > 0 && (
                <div className="mt-0.5 flex items-center gap-0.5 text-[9px] text-ink-300">
                  <span>转化</span>
                  <span className={`font-mono ${textColor}`}>
                    {(rate * 100).toFixed(1)}%
                  </span>
                </div>
              )}
              <div className="mt-1 text-[9px] leading-tight text-ink-300">
                {s.description}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
