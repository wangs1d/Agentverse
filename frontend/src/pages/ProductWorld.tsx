// 产品世界页：8 个真实产品 × 8 个人格的真实 AI 匹配分
// 这是「B 端商家看自己产品怎么被推荐」的核心演示页
import { useMemo, useState } from 'react'
import { usePromoStore } from '../store/usePromoStore'
import { PRODUCTS, type Product } from '../data/products'
import { calculateOverallMatch, calculateAllPersonaMatches } from '../lib/scoreCalculator'
import { PERSONA_PROFILES, type PersonaProfile } from '../data/personaProfiles'
import { getRandomRecommendation } from '../data/recommendations'
import {
  Sparkles,
  Package,
  TrendingUp,
  Eye,
  X,
  Bot,
  CheckCircle2,
  Users,
  Clock,
  Tag,
  ArrowRight,
  Target,
  Lightbulb,
  Zap,
  BarChart3,
} from 'lucide-react'

/**
 * 渲染匹配人数：用 deterministic 哈希，避免每次刷新人数都跳
 */
function seededMatchedAgents(seed: string, base: number): number {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  const ratio = 0.018 + (h >>> 0) % 100 / 1000
  return Math.round(12480 * ratio * (0.6 + (h >>> 8) % 100 / 250))
}

export function ProductWorld() {
  const setProduct = usePromoStore((s) => s.setProduct)
  const submitPromo = usePromoStore((s) => s.submitPromo)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'software' | 'hardware'>('all')

  const visibleProducts = useMemo(() => {
    return filter === 'all' ? PRODUCTS : PRODUCTS.filter((p) => p.category === filter)
  }, [filter])

  const selected = selectedId ? PRODUCTS.find((p) => p.id === selectedId) : null

  return (
    <main className="flex flex-1 flex-col gap-3 overflow-hidden p-3">
      {/* 头部说明 */}
      <div className="panel-surface flex items-center justify-between gap-3 rounded-xl px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-tech/20 text-tech-light">
            <Package className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-ink-50">
              产品世界 · 8 款 B 端产品 × 8 类 C 端人格
            </h1>
            <p className="text-[11px] text-ink-200">
              每个分数都由 AI 匹配引擎实时计算（基于产品描述 + 上下文近义 + 价格敏感度）
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 rounded-md border border-white/[0.06] bg-ink-900/40 p-0.5">
          {[
            { key: 'all', label: '全部' },
            { key: 'software', label: '软件 SaaS' },
            { key: 'hardware', label: '智能硬件' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key as 'all' | 'software' | 'hardware')}
              className={`rounded px-2.5 py-1 text-[11px] transition-all ${
                filter === f.key
                  ? 'bg-tech/20 text-tech-light'
                  : 'text-ink-200 hover:text-ink-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* 关键洞察条 */}
      <InsightBar />

      {/* 产品网格 */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-auto scrollbar-thin md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visibleProducts.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            onClick={() => setSelectedId(p.id)}
            onTryAsMerchant={() => {
              // 真实可执行：把产品填到 B 端商家表单，然后跑匹配演示
              setProduct({
                type: p.category,
                brand: p.brand,
                name: p.name,
                desc: p.desc,
                price: p.price,
                image: p.image,
              })
              submitPromo()
            }}
          />
        ))}
      </div>

      {/* 详情抽屉 */}
      {selected && <ProductDetailDrawer product={selected} onClose={() => setSelectedId(null)} />}
    </main>
  )
}

/**
 * 顶部洞察条：跨所有产品的总体表现
 */
function InsightBar() {
  const stats = useMemo(() => {
    const total = PRODUCTS.length
    const totalMatched = PRODUCTS.reduce(
      (sum, p) => sum + calculateOverallMatch(p).strongCount,
      0,
    )
    const avgScore = Math.round(
      PRODUCTS.reduce((sum, p) => sum + calculateOverallMatch(p).avgScore, 0) / total,
    )
    return { total, totalMatched, avgScore }
  }, [])

  return (
    <div className="grid grid-cols-3 gap-2">
      <InsightCell
        icon={<Package className="h-3.5 w-3.5" />}
        label="在售产品"
        value={stats.total.toString()}
        sub="款"
        tone="neutral"
      />
      <InsightCell
        icon={<Target className="h-3.5 w-3.5" />}
        label="平均匹配分"
        value={stats.avgScore.toString()}
        sub="/100"
        tone={stats.avgScore >= 60 ? 'good' : 'warn'}
      />
      <InsightCell
        icon={<Users className="h-3.5 w-3.5" />}
        label="强匹配人格对"
        value={stats.totalMatched.toString()}
        sub="组（产品×人格）"
        tone="good"
      />
    </div>
  )
}

function InsightCell({
  icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub: string
  tone: 'good' | 'warn' | 'neutral'
}) {
  const ring =
    tone === 'good'
      ? 'border-tech/30 bg-tech/[0.05]'
      : tone === 'warn'
      ? 'border-accent-warning/30 bg-accent-warning/[0.05]'
      : 'border-white/[0.05] bg-ink-900/40'
  return (
    <div className={`rounded-lg border p-2.5 ${ring}`}>
      <div className="mb-1 flex items-center gap-1 text-ink-200">
        {icon}
        <span className="text-[10px] tracking-wider">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="font-mono text-base font-semibold text-ink-50">{value}</span>
        <span className="text-[10px] text-ink-300">{sub}</span>
      </div>
    </div>
  )
}

/**
 * 产品卡片：实时计算 AI 匹配分
 */
function ProductCard({
  product,
  onClick,
  onTryAsMerchant,
}: {
  product: Product
  onClick: () => void
  onTryAsMerchant: () => void
}) {
  const overall = useMemo(() => calculateOverallMatch(product), [product])
  const matchedAgents = useMemo(
    () => seededMatchedAgents(product.id, overall.strongCount),
    [product.id, overall.strongCount],
  )

  return (
    <div className="panel-surface group flex flex-col overflow-hidden rounded-xl transition-all hover:border-tech-light/30">
      {/* 顶部条：分类 + 匹配分 */}
      <div className="flex items-center justify-between border-b border-white/[0.05] px-3 py-2">
        <div className="flex items-center gap-1.5">
          <div className="flex h-5 w-5 items-center justify-center rounded bg-white/[0.05] text-ink-200">
            {product.category === 'software' ? (
              <Zap className="h-2.5 w-2.5" />
            ) : (
              <Package className="h-2.5 w-2.5" />
            )}
          </div>
          <span className="text-[10px] uppercase tracking-wider text-ink-200">
            {product.category === 'software' ? 'SaaS' : '硬件'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className={`flex h-6 items-center gap-1 rounded-md px-2 text-[10px] font-medium ${
              overall.avgScore >= 70
                ? 'bg-tech/15 text-tech-light'
                : overall.avgScore >= 50
                ? 'bg-accent-warning/15 text-accent-warning'
                : 'bg-ink-700/50 text-ink-200'
            }`}
          >
            <Sparkles className="h-2.5 w-2.5" />
            <span className="font-mono">{overall.avgScore}</span>
            <span className="opacity-60">匹配分</span>
          </div>
        </div>
      </div>

      {/* 缩略图 */}
      <div className="relative aspect-[16/10] overflow-hidden bg-ink-900">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-900/90 to-transparent p-2.5">
          <div className="text-[10px] text-ink-200">{product.brand}</div>
          <div className="text-xs font-medium text-ink-50">{product.name}</div>
        </div>
      </div>

      {/* 描述 */}
      <div className="flex-1 p-3">
        <p className="line-clamp-2 text-[11px] leading-relaxed text-ink-100">{product.desc}</p>

        {/* 标签云 */}
        <div className="mt-2 flex flex-wrap gap-1">
          {product.tags.slice(0, 3).map((t) => (
            <span
              key={t}
              className="rounded-full border border-white/[0.06] bg-white/[0.03] px-1.5 py-0.5 text-[9px] text-ink-200"
            >
              {t}
            </span>
          ))}
        </div>

        {/* 数据条 */}
        <div className="mt-3 flex items-center justify-between border-t border-white/[0.05] pt-2 text-[10px] text-ink-200">
          <span className="flex items-center gap-1">
            <Users className="h-2.5 w-2.5" />
            <span className="font-mono text-tech-light">{matchedAgents.toLocaleString()}</span>
            <span>匹配 Agent</span>
          </span>
          <span className="flex items-center gap-1">
            <Target className="h-2.5 w-2.5" />
            <span className="font-mono text-tech-light">{overall.strongCount}</span>
            <span>个强匹配人格</span>
          </span>
        </div>

        {/* 价格 + 操作 */}
        <div className="mt-2 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-ink-300">定价</div>
            <div className="text-sm font-semibold text-ink-50">
              <span className="text-tech-light">¥{product.price.toLocaleString()}</span>
              <span className="ml-1 text-[10px] text-ink-200">{product.priceUnit}</span>
            </div>
          </div>
          <div className="flex gap-1">
            <button
              onClick={onClick}
              className="rounded-md border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 text-[10px] text-ink-100 transition-all hover:border-white/15 hover:text-ink-50"
            >
              <Eye className="mr-1 inline h-2.5 w-2.5" />
              详情
            </button>
            <button
              onClick={onTryAsMerchant}
              className="rounded-md bg-tech px-2.5 py-1 text-[10px] text-white transition-all hover:bg-tech-light hover:shadow-glow-soft"
            >
              <Zap className="mr-1 inline h-2.5 w-2.5" />
              看 Agent 推
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * 产品详情抽屉：展示对每个 C 端人格的匹配分 + 推荐预览
 */
function ProductDetailDrawer({ product, onClose }: { product: Product; onClose: () => void }) {
  const matches = useMemo(() => calculateAllPersonaMatches(product), [product])
  const overall = useMemo(() => calculateOverallMatch(product), [product])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="panel-surface flex max-h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/[0.05] p-5">
          <div className="flex flex-1 items-start gap-4">
            <img
              src={product.image}
              alt={product.name}
              className="h-20 w-20 rounded-lg object-cover"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-tech/15 px-2 py-0.5 text-[10px] text-tech-light">
                  {product.brand}
                </span>
                <span className="rounded-md border border-white/[0.06] bg-white/[0.03] px-2 py-0.5 text-[10px] text-ink-200">
                  {product.category === 'software' ? 'SaaS' : '硬件'}
                </span>
              </div>
              <h2 className="mt-1.5 text-base font-semibold text-ink-50">{product.name}</h2>
              <p className="mt-1 text-[11px] leading-relaxed text-ink-100">{product.desc}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-ink-200 transition-colors hover:bg-white/[0.05] hover:text-ink-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 关键指标 */}
        <div className="grid grid-cols-4 gap-3 border-b border-white/[0.05] p-4">
          <StatBox
            icon={<Sparkles className="h-3.5 w-3.5" />}
            label="平均匹配分"
            value={`${overall.avgScore}`}
            sub="/100"
          />
          <StatBox
            icon={<Target className="h-3.5 w-3.5" />}
            label="强匹配人格"
            value={overall.strongCount.toString()}
            sub="个"
            tone="good"
          />
          <StatBox
            icon={<BarChart3 className="h-3.5 w-3.5" />}
            label="月销量"
            value={product.monthlySales.toLocaleString()}
            sub="单"
          />
          <StatBox
            icon={<Tag className="h-3.5 w-3.5" />}
            label="定价"
            value={`¥${product.price.toLocaleString()}`}
            sub={product.priceUnit}
          />
        </div>

        {/* 8 个人格匹配分表 */}
        <div className="flex-1 overflow-auto p-4 scrollbar-thin">
          <div className="mb-2 flex items-center gap-2">
            <Users className="h-3.5 w-3.5 text-tech-light" />
            <h3 className="text-xs font-semibold text-ink-50">8 类 C 端人格匹配详情</h3>
            <span className="text-[10px] text-ink-300">（按分数倒序）</span>
          </div>

          <div className="space-y-1.5">
            {matches.map((m) => (
              <PersonaMatchRow key={m.persona.id} match={m} product={product} />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/[0.05] p-3">
          <div className="flex items-center gap-1.5 text-[10px] text-ink-300">
            <Lightbulb className="h-3 w-3 text-accent-warning" />
            <span>分数由 matcher.ts 实时计算 · 同一产品每次刷新差 1-2 分（噪声）</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-md bg-tech px-3 py-1.5 text-[11px] text-white transition-all hover:bg-tech-light"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * 单个人格匹配行
 */
function PersonaMatchRow({
  match,
  product,
}: {
  match: ReturnType<typeof calculateAllPersonaMatches>[number]
  product: Product
}) {
  const [showPreview, setShowPreview] = useState(false)
  const preview = useMemo(
    () => getRandomRecommendation(match.persona.id),
    [match.persona.id],
  )

  const tone =
    match.tier === 'strong'
      ? 'border-tech-light/30 bg-tech/[0.05]'
      : match.tier === 'weak'
      ? 'border-accent-warning/20 bg-accent-warning/[0.04]'
      : 'border-white/[0.05] bg-ink-900/30'

  return (
    <div className={`rounded-lg border p-3 transition-all ${tone}`}>
      <div className="flex items-center gap-3">
        {/* 头像 */}
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-tech/30 to-tech-neon/30 text-[11px] font-semibold text-tech-light">
          {match.persona.name.slice(0, 1)}
        </div>

        {/* 信息 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-ink-50">{match.persona.name}</span>
            <span className="text-[10px] text-ink-300">· {match.persona.age}岁</span>
            <span className="text-[10px] text-ink-300">· {match.persona.city}</span>
            {match.tier === 'strong' && (
              <span className="rounded bg-tech/20 px-1.5 py-0.5 text-[9px] text-tech-light">
                强匹配
              </span>
            )}
            {match.tier === 'weak' && (
              <span className="rounded bg-accent-warning/20 px-1.5 py-0.5 text-[9px] text-accent-warning">
                弱匹配
              </span>
            )}
          </div>
          <div className="mt-0.5 text-[10px] text-ink-200">
            {match.persona.archetype}
          </div>
          {/* 进度条 */}
          <div className="mt-1.5 flex items-center gap-2">
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className={`h-full rounded-full transition-all ${
                  match.tier === 'strong'
                    ? 'bg-gradient-to-r from-tech to-tech-neon'
                    : match.tier === 'weak'
                    ? 'bg-gradient-to-r from-accent-warning to-yellow-400'
                    : 'bg-ink-300/40'
                }`}
                style={{ width: `${match.score}%` }}
              />
            </div>
            <span className="w-9 text-right font-mono text-[11px] font-semibold text-ink-50">
              {match.score}
            </span>
          </div>
          <div className="mt-1 text-[10px] leading-relaxed text-ink-300">
            {match.reason}
          </div>
        </div>

        {/* 操作按钮 */}
        <button
          onClick={() => setShowPreview((v) => !v)}
          className="shrink-0 rounded-md border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 text-[10px] text-ink-100 transition-all hover:border-tech-light/40 hover:text-tech-light"
        >
          <Bot className="mr-1 inline h-2.5 w-2.5" />
          {showPreview ? '收起' : '看话术'}
        </button>
      </div>

      {/* 展开的话术预览 */}
      {showPreview && (
        <div className="mt-2 rounded-md border border-white/[0.05] bg-ink-900/40 p-2.5">
          <div className="mb-1.5 flex items-center gap-1 text-[10px] text-tech-light">
            <Bot className="h-2.5 w-2.5" />
            <span>Agent 会这样跟「{match.persona.name}」说：</span>
          </div>
          <div className="space-y-1 text-[11px] leading-relaxed text-ink-100">
            <div>
              <span className="text-ink-300">开场：</span>
              {preview.greeting.replace(/\{brand\}/g, product.brand).replace(/\{product\}/g, product.name)}
            </div>
            <div>
              <span className="text-ink-300">询问：</span>
              {preview.probe}
            </div>
            <div>
              <span className="text-ink-300">分享：</span>
              {preview.share.replace(/\{brand\}/g, product.brand).replace(/\{product\}/g, product.name)}
            </div>
          </div>
          <div className="mt-2 flex items-start gap-1 rounded bg-ink-900/60 p-1.5 text-[9px] text-ink-300">
            <Lightbulb className="mt-0.5 h-2.5 w-2.5 shrink-0 text-accent-warning" />
            <span>
              <span className="text-ink-100">用词策略：</span>
              {match.persona.agentStrategy.useKeywords.slice(0, 4).join('、')}
              <span className="ml-2 text-ink-100">避免：</span>
              <span className="text-accent-warning/80">
                {match.persona.agentStrategy.avoidKeywords.slice(0, 3).join('、')}
              </span>
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

function StatBox({
  icon,
  label,
  value,
  sub,
  tone = 'neutral',
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub: string
  tone?: 'good' | 'warn' | 'neutral'
}) {
  const color =
    tone === 'good' ? 'text-tech-light' : tone === 'warn' ? 'text-accent-warning' : 'text-ink-50'
  return (
    <div className="rounded-md border border-white/[0.05] bg-ink-900/40 p-2.5">
      <div className="mb-1 flex items-center gap-1 text-ink-200">
        {icon}
        <span className="text-[10px] tracking-wider">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`font-mono text-base font-semibold ${color}`}>{value}</span>
        <span className="text-[10px] text-ink-300">{sub}</span>
      </div>
    </div>
  )
}
