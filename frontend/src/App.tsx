import { useEffect, useState } from 'react'
import { usePromoStore } from './store/usePromoStore'
import { TopBar, type AppPage } from './components/TopBar'
import { MerchantPanel } from './components/panels/MerchantPanel'
import { MatchingEngine } from './components/panels/MatchingEngine'
import { AgentChat } from './components/panels/AgentChat'
import { PersonaWorld } from './pages/PersonaWorld'
import { ProductWorld } from './pages/ProductWorld'
import { MerchantDashboard } from './pages/MerchantDashboard'
import { ContrastDemo } from './pages/ContrastDemo'
import { TimingClock } from './pages/TimingClock'
import { Sparkles } from 'lucide-react'

/**
 * 路由：
 *  - promo: B端三栏式演示（商家上传 → 中台匹配 → C端对话）
 *  - merchant: B端商家后台（漏斗 + 收入 + 人群分布）
 *  - product: 产品世界（B端商家看自己的产品怎么被推荐）
 *  - persona: 人格世界（8个差异化人格深度展示 + C端体验）
 *  - contrast: 反常识对比（通用Agent vs Agentverse Agent）
 *  - timing: 24小时推荐时机可视化
 */
function App() {
  const [page, setPage] = useState<AppPage>('product')

  return (
    <div className="flex h-screen flex-col">
      <TopBar page={page} onPageChange={setPage} />

      {page === 'promo' ? (
        <DemoShell />
      ) : page === 'product' ? (
        <ProductWorld />
      ) : page === 'persona' ? (
        <PersonaWorld />
      ) : page === 'merchant' ? (
        <MerchantDashboard />
      ) : page === 'contrast' ? (
        <ContrastDemo />
      ) : page === 'timing' ? (
        <TimingClock />
      ) : null}

      {/* 底部状态条 */}
      <footer className="flex h-7 items-center justify-between border-t border-white/[0.05] bg-ink-900/60 px-4 text-[11px] text-ink-200">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-success" />
            {getStatusLabel(page)}
          </span>
          <span className="font-mono text-ink-300">v0.4.0</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Pure Frontend · React 18 + Tailwind v3</span>
          <span className="flex items-center gap-1 text-tech-light">
            <Sparkles className="h-2.5 w-2.5" />
            Agentverse · 8 Personas × 8 Products · Real-time Funnel
          </span>
        </div>
      </footer>
    </div>
  )
}

function getStatusLabel(page: AppPage): string {
  const map: Record<AppPage, string> = {
    promo: 'Demo Mode · 12,480 Agents Online',
    product: 'Product World · 8 Products × 8 Personas',
    persona: 'Persona Lab · 8 Archetypes Loaded',
    merchant: 'Merchant Dashboard · Real-time Funnel',
    contrast: 'Contrast Lab · 2 Scenarios Active',
    timing: 'Timing Wheel · 24h × 8 Personas',
  }
  return map[page] || 'Demo Mode'
}

/**
 * 三栏式演示主界面（B端上传 → 中台匹配 → C端对话）
 */
function DemoShell() {
  const stage = usePromoStore((s) => s.stage)
  const setCollapsed = usePromoStore((s) => s.setCollapsed)

  // 阶段驱动：自动调整抽屉状态，引导视觉聚焦中栏
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (stage === 'idle') {
      setCollapsed('left', false)
      setCollapsed('right', true)
    } else if (stage === 'submitted' || stage === 'inferring' || stage === 'matching') {
      setCollapsed('left', true)
      setCollapsed('right', true)
    } else if (stage === 'done') {
      setCollapsed('left', true)
      setCollapsed('right', false)
    }
  }, [stage, setCollapsed])

  return (
    <main className="flex flex-1 gap-2 overflow-hidden p-2">
      {/* 左侧抽屉 */}
      <div className="flex animate-fade-in" style={{ animationDelay: '0ms' }}>
        <MerchantPanel />
      </div>

      {/* 中栏：算法匹配中台，视觉中心 */}
      <div className="flex min-w-0 flex-1 animate-fade-in" style={{ animationDelay: '80ms' }}>
        <MatchingEngine />
      </div>

      {/* 右侧抽屉 */}
      <div className="flex animate-fade-in" style={{ animationDelay: '160ms' }}>
        <AgentChat />
      </div>
    </main>
  )
}

export default App
