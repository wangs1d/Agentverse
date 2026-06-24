// 产品世界页：8 个真实产品 × 8 个人格的真实 AI 匹配分
import { useMemo, useState } from 'react'
import { usePromoStore } from '../store/usePromoStore'
import { PRODUCTS, type Product } from '../data/products'
import { calculateAllPersonaMatches, calculateOverallMatch } from '../lib/scoreCalculator'
import { getRandomRecommendation } from '../data/recommendations'
import {
  Sparkles,
  Package,
  Eye,
  X,
  Bot,
  Users,
  Tag,
  Target,
  Lightbulb,
  Zap,
} from 'lucide-react'

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
      <div className="panel-surface flex items-center justify-between gap-3 rounded-xl px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-tech/20 text-tech-light">
            <Package className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-ink-50">产品世界 · 8 款 B 端产品 × 8 类 C 端人格</h1>
            <p className="text-[11px] text-ink-200">每个分数都由 AI 匹配引擎实时计算</p>
          </div>
        </div>
        <div className="flex items-center gap-1 rounded-md border border-white/[0.06] bg-ink-900/40 p-0.5">
          {[
            { key: 'all', label: '全部' },
            { key: 'software', label: 'SaaS' },
            { key: 'hardware', label: '硬件' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key as 'all' | 'software' | 'hardware')}
              className={`rounded px-2.5 py-1 text-[11px] transition-all ${
                filter === f.key ? 'bg-tech/20 text-tech-light' : 'text-ink-200 hover:text-ink-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-auto scrollbar-thin md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visibleProducts.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            onClick={() => setSelectedId(p.id)}
            onTryAsMerchant={() => {
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

      {selected && <ProductDetailDrawer product={selected} onClose={() => setSelectedId(null)} />}
    </main>
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

  return (
    <div className="panel-surface group flex flex-col overflow-hidden rounded-xl transition-all hover:border-tech-light/30">
      <div className="relative aspect-[16/9] overflow-hidden bg-ink-900">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div
          className={`absolute right-2 top-2 flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium ${
            overall.avgScore >= 70
              ? 'bg-tech/20 text-tech-light'
              : overall.avgScore >= 50
              ? 'bg-accent-warning/20 text-accent-warning'
              : 'bg-ink-700/70 text-ink-200'
          }`}
        >
          <Sparkles className="h-2.5 w-2.5" />
          <span className="font-mono">{overall.avgScore}</span>
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-900/90 to-transparent p-2.5">
          <div className="text-[10px] text-ink-200">{product.brand}</div>
          <div className="text-xs font-medium text-ink-50">{product.name}</div>
        </div>
      </div>

      <div className="flex items-center justify-between p-3">
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
        className="panel-surface flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 border-b border-white/[0.05] p-4">
          <img src={product.image} alt={product.name} className="h-14 w-14 rounded-lg object-cover" />
          <div className="flex-1">
            <div className="text-[10px] text-ink-300">{product.brand}</div>
            <h2 className="text-sm font-semibold text-ink-50">{product.name}</h2>
            <p className="mt-0.5 text-[11px] leading-relaxed text-ink-100">{product.desc}</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-ink-200 transition-colors hover:bg-white/[0.05] hover:text-ink-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 border-b border-white/[0.05] p-3">
          <Mini icon={<Sparkles className="h-3 w-3" />} label="平均匹配分" value={`${overall.avgScore}/100`} />
          <Mini icon={<Target className="h-3 w-3" />} label="强匹配人格" value={`${overall.strongCount} 个`} />
          <Mini icon={<Tag className="h-3 w-3" />} label="定价" value={`¥${product.price.toLocaleString()}`} />
        </div>

        <div className="flex-1 space-y-1 overflow-auto p-3 scrollbar-thin">
          <div className="mb-1 flex items-center gap-1.5 text-[10px] text-ink-300">
            <Users className="h-3 w-3" />
            <span>8 类 C 端人格匹配详情（按分数倒序）</span>
          </div>
          {matches.map((m) => (
            <PersonaMatchRow key={m.persona.id} match={m} product={product} />
          ))}
        </div>
      </div>
    </div>
  )
}

function Mini({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/[0.05] bg-ink-900/40 p-2">
      <div className="flex items-center gap-1 text-ink-300">
        {icon}
        <span className="text-[10px]">{label}</span>
      </div>
      <div className="mt-0.5 font-mono text-xs font-semibold text-ink-50">{value}</div>
    </div>
  )
}

function PersonaMatchRow({
  match,
  product,
}: {
  match: ReturnType<typeof calculateAllPersonaMatches>[number]
  product: Product
}) {
  const [showPreview, setShowPreview] = useState(false)
  const preview = useMemo(() => getRandomRecommendation(match.persona.id), [match.persona.id])

  const tone =
    match.tier === 'strong'
      ? 'border-tech-light/30 bg-tech/[0.05]'
      : match.tier === 'weak'
      ? 'border-accent-warning/20 bg-accent-warning/[0.04]'
      : 'border-white/[0.05] bg-ink-900/30'

  return (
    <div className={`rounded-lg border p-2.5 transition-all ${tone}`}>
      <div className="flex items-center gap-2.5">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-tech/30 to-tech-neon/30 text-[10px] font-semibold text-tech-light">
          {match.persona.name.slice(0, 1)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-ink-50">{match.persona.name}</span>
            <span className="text-[10px] text-ink-300">· {match.persona.age}岁</span>
            {match.tier === 'strong' && (
              <span className="rounded bg-tech/20 px-1 py-0.5 text-[9px] text-tech-light">强匹配</span>
            )}
            {match.tier === 'weak' && (
              <span className="rounded bg-accent-warning/20 px-1 py-0.5 text-[9px] text-accent-warning">弱匹配</span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-2">
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className={`h-full rounded-full ${
                  match.tier === 'strong'
                    ? 'bg-gradient-to-r from-tech to-tech-neon'
                    : match.tier === 'weak'
                    ? 'bg-gradient-to-r from-accent-warning to-yellow-400'
                    : 'bg-ink-300/40'
                }`}
                style={{ width: `${match.score}%` }}
              />
            </div>
            <span className="w-8 text-right font-mono text-[11px] font-semibold text-ink-50">{match.score}</span>
          </div>
        </div>
        <button
          onClick={() => setShowPreview((v) => !v)}
          className="shrink-0 rounded-md border border-white/[0.06] bg-white/[0.03] px-2 py-1 text-[10px] text-ink-100 transition-all hover:border-tech-light/40 hover:text-tech-light"
        >
          <Bot className="mr-1 inline h-2.5 w-2.5" />
          {showPreview ? '收起' : '看话术'}
        </button>
      </div>

      {showPreview && (
        <div className="mt-2 space-y-1 rounded-md border border-white/[0.05] bg-ink-900/40 p-2.5 text-[11px] leading-relaxed text-ink-100">
          <div>
            <span className="text-ink-300">开场 · </span>
            {preview.greeting.replace(/\{brand\}/g, product.brand).replace(/\{product\}/g, product.name)}
          </div>
          <div>
            <span className="text-ink-300">分享 · </span>
            {preview.share.replace(/\{brand\}/g, product.brand).replace(/\{product\}/g, product.name)}
          </div>
          <div className="mt-1 flex items-center gap-1 rounded bg-ink-900/60 p-1.5 text-[9px] text-ink-300">
            <Lightbulb className="h-2.5 w-2.5 shrink-0 text-accent-warning" />
            <span>用词：{match.persona.agentStrategy.useKeywords.slice(0, 4).join('、')}</span>
          </div>
        </div>
      )}
    </div>
  )
}
