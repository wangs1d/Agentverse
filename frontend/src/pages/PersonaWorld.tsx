// 人格世界主页：8 个人格卡选择 + 详情 + 对话 + 对比
// C 端「被推荐」体验：选一个人格，看 Agent 怎么跟你说话
// - 完成后能「接受」或「拒绝」
// - 拒绝后展示 Agent 的应对策略
import { useState } from 'react'
import { PERSONA_PROFILES } from '../data/personaProfiles'
import { PersonaStrip } from '../components/persona/PersonaStrip'
import { PersonaDetail } from '../components/persona/PersonaDetail'
import { PersonaChatPanel } from '../components/persona/PersonaChatPanel'
import { PersonaComparison } from '../components/persona/PersonaComparison'
import { Sparkles, Lightbulb, User } from 'lucide-react'

export function PersonaWorld() {
  const [selectedId, setSelectedId] = useState<string>('xiaoke')
  // 对比模式默认是反差最大的一对：小柯（极致性价比） vs Vivian（极低价格敏感）
  const [compareA, setCompareA] = useState<string>('xiaoke')
  const [compareB, setCompareB] = useState<string>('vivian')

  const selected = PERSONA_PROFILES.find((p) => p.id === selectedId)!

  // 换一组：随机选两个不同人格
  const swapCompare = () => {
    const ids = PERSONA_PROFILES.map((p) => p.id).filter((id) => id !== compareA)
    const newA = compareA
    const newB = ids[Math.floor(Math.random() * ids.length)]
    setCompareA(newA)
    setCompareB(newB)
  }

  return (
    <main className="flex flex-1 flex-col gap-3 overflow-hidden p-3">
      {/* 头部说明 */}
      <div className="panel-surface flex items-center gap-3 rounded-xl px-5 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-tech/20 text-tech-light">
          <User className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <h1 className="text-sm font-semibold text-ink-50">
            C 端「被推荐」体验 · 8 个人格 × 8 个产品的真实 Agent 对话
          </h1>
          <p className="text-[11px] text-ink-200">
            选一个「你身边的人」看看 Agent 怎么跟他说话；<span className="text-tech-light">你也可以拒绝，Agent 不会追着你推</span>
          </p>
        </div>
        <div className="hidden items-center gap-2 rounded-md border border-amber-500/20 bg-amber-500/5 px-2.5 py-1.5 text-[10px] text-amber-300/90 lg:flex">
          <Lightbulb className="h-3 w-3" />
          <span>不是 prompt 工程演示，是<span className="font-semibold">人格建模</span>——为 prompt 注入"读人"能力</span>
        </div>
      </div>

      {/* 1. 人格选择条 */}
      <PersonaStrip selectedId={selectedId} onSelect={setSelectedId} />

      {/* 2. 详情 + 对话 */}
      <div className="grid min-h-0 flex-1 grid-cols-5 gap-3">
        {/* 左：详情 (2/5) */}
        <div className="col-span-2 min-h-0 animate-fade-in" key={`detail-${selectedId}`}>
          <PersonaDetail persona={selected} />
        </div>
        {/* 右：对话 (3/5) - C 端被推荐体验 */}
        <div className="col-span-3 min-h-0 animate-fade-in" key={`chat-${selectedId}`}>
          <PersonaChatPanel persona={selected} />
        </div>
      </div>

      {/* 3. 对比视图 */}
      <div className="animate-fade-in" style={{ animationDelay: '120ms' }}>
        <PersonaComparison
          aId={compareA}
          bId={compareB}
          brand=""
          product=""
          onSwap={swapCompare}
        />
      </div>
    </main>
  )
}
