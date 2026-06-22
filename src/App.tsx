import { useEffect, useState } from 'react'
import { usePromoStore } from './store/usePromoStore'
import { TopBar } from './components/TopBar'
import { MerchantPanel } from './components/panels/MerchantPanel'
import { MatchingEngine } from './components/panels/MatchingEngine'
import { AgentChat } from './components/panels/AgentChat'
import { EntryButton } from './components/EntryButton'
import { Megaphone, ArrowRight, Sparkles } from 'lucide-react'

function App() {
  // 演示模式开关：true 显示入口，false 直接进入演示
  const [entered, setEntered] = useState(true) // 默认直接展示演示，可改为 false 看入口页

  if (!entered) {
    return <EntryLanding onEnter={() => setEntered(true)} />
  }

  return <DemoShell />
}

/**
 * 演示主界面：主-辅布局
 * - 中栏（算法匹配中台）作为绝对主角，占据视觉中心
 * - 左/右栏改为可折叠抽屉（drawer），弱化为辅助面板
 * - 按 stage 自动调整展开状态，引导叙事
 */
function DemoShell() {
  const stage = usePromoStore((s) => s.stage)
  const setCollapsed = usePromoStore((s) => s.setCollapsed)

  // 阶段驱动：自动调整抽屉状态，引导视觉聚焦中栏
  useEffect(() => {
    if (stage === 'idle') {
      // 初始：B 端需要填表 -> 展开左抽屉
      setCollapsed('left', false)
      setCollapsed('right', true)
    } else if (stage === 'submitted' || stage === 'inferring' || stage === 'matching') {
      // 匹配过程：聚焦中栏 -> 收起两侧
      setCollapsed('left', true)
      setCollapsed('right', true)
    } else if (stage === 'done') {
      // 完成：自动展开右抽屉展示 Agent 推荐结果
      setCollapsed('left', true)
      setCollapsed('right', false)
    }
  }, [stage, setCollapsed])

  return (
    <div className="flex h-screen flex-col">
      <TopBar />

      {/* 主体：左抽屉 + 中栏(主角) + 右抽屉 */}
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

      {/* 底部状态条 */}
      <footer className="flex h-7 items-center justify-between border-t border-white/[0.05] bg-ink-900/60 px-4 text-[10px] text-ink-300">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-success" />
            Demo Mode · 12,480 Agents Online
          </span>
          <span className="font-mono">v0.1.0</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Pure Frontend · React 18 + Tailwind v3</span>
          <span className="flex items-center gap-1 text-tech-light">
            <Sparkles className="h-2.5 w-2.5" />
            Agent World 商业智能推广模块
          </span>
        </div>
      </footer>
    </div>
  )
}

function EntryLanding({ onEnter }: { onEnter: () => void }) {
  return (
    <div className="relative flex h-screen flex-col">
      <TopBar />
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="panel-surface max-w-xl rounded-2xl p-10 text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-tech shadow-glow-soft">
            <Megaphone className="h-6 w-6 text-white" />
          </div>
          <h1 className="mb-2 text-2xl font-semibold tracking-tight text-ink-50">商业智能推广</h1>
          <p className="mb-8 text-sm leading-relaxed text-ink-100">
            一站式演示 <span className="text-tech-light">B 端商家 → AI 匹配中台 → C 端 Agent</span> 推广闭环，
            展示 AI 智能体基于用户画像的精准个性化推荐能力。
          </p>
          <EntryButton
            label="进入演示"
            variant="primary"
            iconSize={18}
            onClick={onEnter}
            className="!px-5 !py-2.5"
          />
          <div className="mt-6 flex items-center justify-center gap-1 text-[11px] text-ink-300">
            <span>主-辅布局 · 算法可视化为视觉中心</span>
            <ArrowRight className="h-3 w-3" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
