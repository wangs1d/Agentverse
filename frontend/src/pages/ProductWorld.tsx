// 产品世界页：极简 —— 只展示产品卡 + Agent 推 demo
// 8 类人格是 C 端样本，这里只用一个匹配的 Agent 对话 demo 来代表
import { useMemo, useState } from 'react'
import { usePromoStore } from '../store/usePromoStore'
import { PRODUCTS, type Product } from '../data/products'
import { calculateAllPersonaMatches, calculateOverallMatch } from '../lib/scoreCalculator'
import { PERSONA_PROFILES } from '../data/personaProfiles'
import { Package, Zap, X, Bot, Sparkles, Tag } from 'lucide-react'

export function ProductWorld() {
  const setProduct = usePromoStore((s) => s.setProduct)
  const submitPromo = usePromoStore((s) => s.submitPromo)
  const [filter, setFilter] = useState<'all' | 'software' | 'hardware'>('all')
  const [demoProductId, setDemoProductId] = useState<string | null>(null)

  const visibleProducts = useMemo(() => {
    return filter === 'all' ? PRODUCTS : PRODUCTS.filter((p) => p.category === filter)
  }, [filter])

  const demoProduct = demoProductId ? PRODUCTS.find((p) => p.id === demoProductId) : null

  return (
    <main className="flex flex-1 flex-col gap-3 overflow-hidden p-3">
      <div className="panel-surface flex items-center justify-between gap-3 rounded-xl px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-tech/20 text-tech-light">
            <Package className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-ink-50">B 端产品库</h1>
            <p className="text-[11px] text-ink-200">商家上架产品后获得 Agent 推荐资格</p>
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
            onTryDemo={() => setDemoProductId(p.id)}
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

      {demoProduct && (
        <DemoChatModal product={demoProduct} onClose={() => setDemoProductId(null)} />
      )}
    </main>
  )
}

function ProductCard({
  product,
  onTryDemo,
  onTryAsMerchant,
}: {
  product: Product
  onTryDemo: () => void
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
            onClick={onTryDemo}
            className="rounded-md border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 text-[10px] text-ink-100 transition-all hover:border-white/15 hover:text-ink-50"
          >
            <Bot className="mr-1 inline h-2.5 w-2.5" />
            Agent 推
          </button>
          <button
            onClick={onTryAsMerchant}
            className="rounded-md bg-tech px-2.5 py-1 text-[10px] text-white transition-all hover:bg-tech-light hover:shadow-glow-soft"
          >
            <Zap className="mr-1 inline h-2.5 w-2.5" />
            上架此品
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Agent 推 demo：自动选最匹配的人格，展示一段话术
 */
function DemoChatModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const persona = useMemo(() => {
    const matches = calculateAllPersonaMatches(product)
    return PERSONA_PROFILES.find((p) => p.id === matches[0]?.persona.id) || PERSONA_PROFILES[0]
  }, [product])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="panel-surface flex w-full max-w-md flex-col overflow-hidden rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-white/[0.05] p-4">
          <img src={product.image} alt={product.name} className="h-10 w-10 rounded object-cover" />
          <div className="flex-1 min-w-0">
            <div className="text-[10px] text-ink-300">{product.brand}</div>
            <div className="truncate text-sm font-semibold text-ink-50">{product.name}</div>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-ink-200 transition-colors hover:bg-white/[0.05] hover:text-ink-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4">
          <div className="mb-3 flex items-center gap-2 text-[10px] text-ink-300">
            <Bot className="h-3 w-3 text-tech-light" />
            <span>Agent 正在向「{persona.name}」推荐</span>
            <span className="ml-auto inline-flex items-center gap-1 rounded bg-tech/15 px-1.5 py-0.5 text-[9px] text-tech-light">
              <Tag className="h-2.5 w-2.5" /> 匹配度 {persona.id ? calculateMatch(product, persona) : '-'}
            </span>
          </div>

          <div className="space-y-2 rounded-lg border border-white/[0.05] bg-ink-900/40 p-3 text-[12.5px] leading-relaxed text-ink-100">
            <div className="text-ink-50">
              「我看你最近关注<span className="text-tech-light">{product.tags[0] || product.name}</span>这块，
              这款「{product.name}」可能对得上你的需求。
              <span className="text-ink-300">不过 {product.name} 在 {product.tags[1] || '某些场景'}上有点弱</span>，
              你看是不是你关心的点？」
            </div>
            <div className="text-[10px] text-ink-300">
              · {persona.archetype} · {persona.decisionStyle}
            </div>
          </div>

          <p className="mt-3 text-[10px] text-ink-300">
            这就是 Agent 主动开口的样子：先给核心信息、再说缺点、不催单。
          </p>
        </div>
      </div>
    </div>
  )
}

function calculateMatch(product: Product, persona: { id: string }) {
  return calculateAllPersonaMatches(product).find((m) => m.persona.id === persona.id)?.score ?? 0
}
