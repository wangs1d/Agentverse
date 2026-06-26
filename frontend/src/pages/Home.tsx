import { useMemo } from 'react'
import { ArrowRight, BarChart3, Sparkles, Package, Bot, TrendingUp } from 'lucide-react'
import { useProductLib } from '../store/useProductLib'
import { calculateOverallMatch } from '../lib/scoreCalculator'
import { computeFunnel } from '../lib/funnel'

interface HomeProps {
  onNavigate: (page: 'upload' | 'analytics') => void
}

export function Home({ onNavigate }: HomeProps) {
  const { products } = useProductLib()

  // 真实数据摘要
  const summary = useMemo(() => {
    const total = products.length
    const uploaded = products.filter((p) => p.id.startsWith('uploaded-')).length
    const live = products.filter((p) => p.status === 'live' || p.id.startsWith('uploaded-')).length
    const avgMatch = Math.round(
      products.reduce((s, p) => s + calculateOverallMatch(p).avgScore, 0) / Math.max(1, total),
    )
    const funnel = computeFunnel(products)
    return {
      total,
      uploaded,
      live,
      avgMatch,
      personaCvr: funnel.total.clicks > 0
        ? ((funnel.total.conversions / funnel.total.clicks) * 100).toFixed(1)
        : '0.0',
    }
  }, [products])

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section
        className="relative flex w-full items-center justify-center"
        style={{
          minHeight: '100vh',
          marginTop: 56,
          backgroundImage: "url('/assets/images/hero-dark-upload.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.6) 50%, #000 100%)',
          }}
        />
        <div className="relative z-10 flex flex-col items-center justify-center px-6 text-center">
          <span
            className="inline-flex items-center justify-center whitespace-nowrap px-3 py-1 text-xs font-medium"
            style={{
              background: 'var(--surface-secondary, #1c1c1e)',
              color: 'var(--text-secondary, #8e8e93)',
              borderRadius: 999,
              border: '1px solid var(--surface-border, #3a3a3c)',
            }}
          >
            Persona-Driven Commerce
          </span>

          <h1
            className="mt-6 font-bold tracking-tight"
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              color: 'var(--text-primary, #f5f5f7)',
              lineHeight: 1.1,
              wordBreak: 'keep-all',
            }}
          >
            你的产品，
            <br />
            会被对的人主动找上门
          </h1>

          <p
            className="mt-6 max-w-xl"
            style={{
              fontSize: '1.1rem',
              color: 'var(--text-secondary, #8e8e93)',
              lineHeight: 1.7,
            }}
          >
            Agentverse 不卖广告位。我们用 8 类用户画像模型，
            <br />
            让你的产品以 Agent 主动开口的方式，触达真正会买的人。
          </p>

          <div className="mt-10 flex items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('upload')}
              className="group flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium text-white transition-all duration-200 hover:brightness-110 hover:-translate-y-0.5 active:scale-[0.98]"
              style={{ background: 'var(--brand-blue, #2e8dff)' }}
            >
              开始上传产品
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <button
              onClick={() => onNavigate('analytics')}
              className="flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 border"
              style={{
                background: 'transparent',
                color: 'var(--text-primary, #f5f5f7)',
                borderColor: 'var(--surface-border, #3a3a3c)',
              }}
            >
              <BarChart3 className="h-4 w-4" />
              查看数据
            </button>
          </div>
        </div>
      </section>

      {/* Quick Stats Strip (real data) */}
      <section className="w-full px-6 lg:px-8" style={{ paddingTop: 60, paddingBottom: 60 }}>
        <div className="max-w-screen-xl mx-auto">
          <div
            className="grid grid-cols-2 gap-3 md:grid-cols-4"
            style={{
              background: 'var(--surface-card, #1c1c1e)',
              border: '1px solid var(--surface-border, #3a3a3c)',
              borderRadius: 'var(--apple-radius, 1.2rem)',
              padding: 24,
            }}
          >
            <Stat icon={<Package className="h-4 w-4" />} label="产品库" value={String(summary.total)} hint={`已上架 ${summary.live}`} />
            <Stat icon={<Sparkles className="h-4 w-4" />} label="AI 推断" value={`${summary.avgMatch}`} hint="平均匹配分" />
            <Stat icon={<Bot className="h-4 w-4" />} label="画像" value="8 类" hint="C 端人格模型" />
            <Stat icon={<TrendingUp className="h-4 w-4" />} label="推荐转化" value={`${summary.personaCvr}%`} hint="近 7 天" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="w-full border-t px-6 py-6"
        style={{ borderColor: 'var(--surface-border, #3a3a3c)' }}
      >
        <p className="text-center text-xs" style={{ color: 'var(--text-secondary, #8e8e93)' }}>
          &copy; 2025 Agentverse &middot; 服务条款 &middot; 隐私政策
        </p>
      </footer>
    </div>
  )
}

function Stat({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode
  label: string
  value: string
  hint: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-secondary, #8e8e93)' }}>
        {icon}
        <span>{label}</span>
      </div>
      <div
        className="font-bold tracking-tight"
        style={{
          fontSize: '1.6rem',
          color: 'var(--text-primary, #f5f5f7)',
          fontVariantNumeric: 'tabular-nums',
          lineHeight: 1.1,
        }}
      >
        {value}
      </div>
      <div className="text-[11px]" style={{ color: 'var(--text-secondary, #8e8e93)' }}>
        {hint}
      </div>
    </div>
  )
}
