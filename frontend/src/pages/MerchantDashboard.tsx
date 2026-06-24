// 商家后台：极简 —— B 端产品被推荐的资格 + 漏斗
// 不展示 8 人格分布、不过度拆解数据
import { useMemo, useState } from 'react'
import { usePromoStore } from '../store/usePromoStore'
import { PRODUCTS, type Product } from '../data/products'
import { calculateProductTotalFunnel } from '../lib/funnel'
import { BarChart3, CheckCircle2 } from 'lucide-react'

export function MerchantDashboard() {
  const userProduct = usePromoStore((s) => s.product)
  const myProducts: Product[] = useMemo(() => {
    const builtIn: Product[] = [PRODUCTS[0], PRODUCTS[1], PRODUCTS[2], PRODUCTS[7]]
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
  const selectedProduct = myProducts.find((p) => p.id === selectedId) || myProducts[0]
  const funnel = useMemo(
    () => (selectedProduct ? calculateProductTotalFunnel(selectedProduct) : null),
    [selectedProduct],
  )
  const aggregate = funnel?.aggregate

  return (
    <main className="flex flex-1 flex-col gap-3 overflow-hidden p-3">
      <div className="panel-surface flex items-center gap-3 rounded-xl px-5 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent-success/20 text-accent-success">
          <BarChart3 className="h-4 w-4" />
        </div>
        <div>
          <h1 className="text-sm font-semibold text-ink-50">商家后台 · 推荐资格 · 转化漏斗</h1>
          <p className="text-[11px] text-ink-200">数据基于产品与 8 类 C 端人格的真实匹配分计算</p>
        </div>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        {myProducts.map((p) => {
          const isUser = p.id === 'user-uploaded' && userProduct?.name
          const active = p.id === selectedId
          return (
            <button
              key={p.id}
              onClick={() => setSelectedId(p.id)}
              className={`group flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-left transition-all ${
                active
                  ? isUser
                    ? 'border-accent-warning/40 bg-accent-warning/[0.06]'
                    : 'border-tech-light/40 bg-tech/[0.05]'
                  : 'border-white/[0.05] bg-ink-900/30 hover:border-white/[0.1]'
              }`}
            >
              <img src={p.image} alt={p.name} className="h-7 w-7 shrink-0 rounded object-cover" />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-xs font-medium text-ink-50">{p.name}</span>
                  {isUser && (
                    <span className="shrink-0 rounded bg-accent-warning/20 px-1 py-0.5 text-[8px] font-bold uppercase text-accent-warning">
                      我的
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

      {aggregate && funnel && (
        <div className="panel-surface flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl">
          <div className="flex items-center justify-between border-b border-white/[0.05] px-4 py-3">
            <div className="flex items-center gap-2 text-[10px] text-ink-300">
              <CheckCircle2 className="h-3 w-3 text-accent-success" />
              <span>
                「{selectedProduct?.name}」已获得 Agent 推荐资格
              </span>
            </div>
            <div className="text-right">
              <div className="text-[9px] text-tech-light">整体转化率</div>
              <div className="font-mono text-sm font-bold text-tech-light">
                {(aggregate.overallConversion * 100).toFixed(2)}%
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-2 overflow-auto p-4 scrollbar-thin">
            {[
              { name: 'Agent 看到', count: aggregate.impressions, tone: 'ink' as const },
              { name: '判定匹配 · 开口', count: aggregate.matched, tone: 'tech' as const },
              { name: '用户接收 · 没反感', count: aggregate.engaged, tone: 'tech' as const },
              { name: '查看详情', count: aggregate.clicked, tone: 'tech' as const },
              { name: '最终转化', count: aggregate.converted, tone: 'success' as const },
            ].map((s, i, arr) => {
              const rate = i === 0 ? 1 : s.count / arr[i - 1].count
              const max = arr[0].count
              const widthPct = Math.max(8, (s.count / max) * 100)
              const colorBar = {
                ink: 'bg-ink-700/60 text-ink-50',
                tech: 'bg-gradient-to-r from-tech/50 to-tech-neon/30 text-tech-light',
                success: 'bg-gradient-to-r from-accent-success/60 to-emerald-400/30 text-accent-success',
              }[s.tone]
              return (
                <div key={i}>
                  <div className="mb-1 flex items-center justify-between text-[11px]">
                    <span className="text-ink-100">{s.name}</span>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-ink-50">{s.count.toLocaleString()}</span>
                      {i > 0 && (
                        <span
                          className={`rounded px-1.5 py-0.5 ${
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
                  <div className="relative h-8 overflow-hidden rounded-md border border-white/[0.05] bg-ink-900/40">
                    <div
                      className={`absolute inset-y-0 left-0 flex items-center justify-end px-3 transition-all duration-700 ${colorBar}`}
                      style={{ width: `${widthPct}%` }}
                    >
                      <span className="text-[10px] font-medium opacity-90">
                        {((s.count / max) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}

            <div className="mt-3 rounded-lg border border-white/[0.05] bg-ink-900/30 p-3 text-center text-[10px] text-ink-300">
              这条漏斗的每个数字都由「产品×人格的真实匹配分」驱动，不是硬编码。
              <br />
              切换产品或人格配置，数字会跟着变。
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
