import { usePromoStore } from '../../store/usePromoStore'
import { CollapsiblePanel } from '../ui/CollapsiblePanel'
import {
  Cpu,
  Loader2,
  Activity,
  Users,
  Target,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Package,
} from 'lucide-react'

/**
 * 中栏：算法匹配中台（主-辅布局下的视觉中心）
 * - 顶部：流转指示带「B端产品 → AI智能匹配 → 找到X位Agent用户」
 * - 主体：宽幅可视化（产品卡 → AI中枢 → 用户池搜索 → 命中用户）
 * - 底部：指标卡 + 进度条
 */
export function MatchingEngine() {
  const {
    stage,
    inferredPersonas,
    matchProgress,
    matchedAgents,
    matchTier,
    matchTierLabel,
    product,
  } = usePromoStore()

  const active = stage === 'inferring' || stage === 'matching'
  const done = stage === 'done'

  return (
    <CollapsiblePanel
      side="middle"
      title="算法匹配中台"
      subtitle="AI Targeting Engine · 精准找到目标用户"
      icon={<Cpu className="h-4 w-4" />}
      active={active}
    >
      <div className="panel-body flex h-full flex-col gap-3">
        {/* 顶部流转指示带 */}
        <FlowRibbon
          stage={stage}
          productName={product.name}
          matchedAgents={matchedAgents}
          done={done}
        />

        {/* 阶段指示器 */}
        <div className="flex items-center gap-1.5">
          {[
            { key: 'infer', label: '画像推断', active: stage === 'inferring', done: stage === 'matching' || done },
            { key: 'match', label: '智能匹配', active: stage === 'matching', done: done },
            { key: 'ok', label: '推送 Agent', active: done, done: done },
          ].map((s, i, arr) => (
            <div key={s.key} className="flex flex-1 items-center gap-1.5">
              <div
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-medium transition-all ${
                  s.done
                    ? 'bg-tech text-white'
                    : s.active
                    ? 'bg-tech/20 text-tech-light breath-dot'
                    : 'border border-white/[0.08] bg-ink-900/60 text-ink-300'
                }`}
              >
                {s.done ? <CheckCircle2 className="h-3 w-3" /> : i + 1}
              </div>
              <span
                className={`text-[11px] transition-colors ${
                  s.done ? 'text-ink-50' : s.active ? 'text-tech-light' : 'text-ink-300'
                }`}
              >
                {s.label}
              </span>
              {i < arr.length - 1 && (
                <div
                  className={`h-px flex-1 transition-colors ${
                    s.done ? 'bg-tech/60' : 'bg-white/[0.06]'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* 主可视化区（占用剩余空间） */}
        <div className="relative flex-1 overflow-hidden rounded-lg border border-white/[0.06] bg-ink-900/40">
          <div className="absolute inset-0 grid-bg opacity-30" />

          {stage === 'idle' || stage === 'submitted' ? (
            <IdleState />
          ) : (
            <ActiveVisualization
              inferring={stage === 'inferring'}
              matching={stage === 'matching'}
              done={done}
              inferredPersonas={inferredPersonas}
              product={product}
              matchedAgents={matchedAgents}
            />
          )}
        </div>

        {/* 指标卡片 */}
        <div className="grid grid-cols-3 gap-2">
          <StatCard
            icon={<Target className="h-3.5 w-3.5" />}
            label="推断画像"
            value={inferredPersonas.length.toString()}
            sub="维度"
            active={inferredPersonas.length > 0}
          />
          <StatCard
            icon={<Activity className="h-3.5 w-3.5" />}
            label="匹配度"
            value={`${matchProgress}%`}
            sub={matchProgress > 0 ? matchTierLabel : '置信度'}
            active={matchProgress > 0}
            progress={matchProgress}
            tone={matchTier}
          />
          <StatCard
            icon={<Users className="h-3.5 w-3.5" />}
            label="命中 Agent"
            value={done ? matchedAgents.toLocaleString() : matchProgress > 30 ? '~' + Math.round(matchedAgents * (matchProgress / 100)).toLocaleString() : '0'}
            sub="位用户"
            active={done}
          />
        </div>

        {/* 匹配度进度条 */}
        {stage !== 'idle' && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-ink-200">
              <span>实时匹配进度</span>
              <span className="font-mono text-tech-light">{matchProgress}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.04]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-tech to-tech-neon transition-all duration-300"
                style={{
                  width: `${matchProgress}%`,
                  boxShadow: '0 0 12px rgba(0,170,255,0.5)',
                }}
              />
            </div>
          </div>
        )}
      </div>
    </CollapsiblePanel>
  )
}

/**
 * 流转指示带：核心卖点叙事
 * B端产品「XXX」 → AI 智能匹配 → 找到 X 位目标 Agent 用户
 */
function FlowRibbon({
  stage,
  productName,
  matchedAgents,
  done,
}: {
  stage: string
  productName: string
  matchedAgents: number
  done: boolean
}) {
  const isWorking = stage === 'inferring' || stage === 'matching'
  return (
    <div className="relative overflow-hidden rounded-md border border-white/[0.06] bg-gradient-to-r from-ink-900/60 via-tech/[0.06] to-ink-900/60 px-3 py-2">
      <div className="flex items-center justify-between gap-2 text-[11px]">
        {/* B 端产品 */}
        <div className="flex min-w-0 items-center gap-1.5">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-white/[0.08] bg-white/[0.03] text-ink-100">
            <Package className="h-3 w-3" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-ink-50">
              <span className="text-ink-300">B端 · </span>
              {productName || '待提交'}
            </div>
          </div>
        </div>

        {/* 中间流转 */}
        <div className="flex shrink-0 items-center gap-1.5">
          <ArrowRight className="h-3 w-3 text-ink-300" />
          <div className="flex items-center gap-1 rounded-full border border-tech-light/30 bg-tech/10 px-2 py-0.5 text-tech-light">
            <Cpu className="h-3 w-3" />
            <span className="font-medium">AI 智能匹配</span>
            {isWorking && <Loader2 className="h-2.5 w-2.5 animate-spin" />}
          </div>
          <ArrowRight className="h-3 w-3 text-ink-300" />
        </div>

        {/* 结果：找到 X 位 Agent */}
        <div className="flex min-w-0 items-center gap-1.5">
          <div
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded border transition-all ${
              done
                ? 'border-tech-light/60 bg-tech/15 text-tech-light'
                : 'border-white/[0.08] bg-white/[0.03] text-ink-200'
            }`}
          >
            <Users className="h-3 w-3" />
          </div>
          <div className="min-w-0">
            <div className="text-ink-300">找到</div>
            <div className="flex items-baseline gap-1">
              <span
                className={`font-mono text-sm font-semibold transition-colors ${
                  done ? 'text-tech-light' : 'text-ink-200'
                }`}
              >
                {done ? matchedAgents.toLocaleString() : isWorking ? '…' : '0'}
              </span>
              <span className="text-[10px] text-ink-300">位目标 Agent</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function IdleState() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.06] bg-ink-800/50">
        <Sparkles className="h-5 w-5 text-ink-200" />
      </div>
      <p className="text-sm text-ink-100">等待 B 端提交推广</p>
      <p className="mt-1 text-[11px] text-ink-300">AI 中枢将自动分析产品并精准定位目标用户</p>
    </div>
  )
}

interface ActiveVizProps {
  inferring: boolean
  matching: boolean
  done: boolean
  inferredPersonas: { id: string; label: string }[]
  product: { name: string; type: string; price: number; desc: string; image: string }
  matchedAgents: number
}

/**
 * 主动画区（宽幅版）
 * 布局：左侧产品卡 | 中央 AI Hub | 右侧用户池（搜索 + 命中高亮）
 */
function ActiveVisualization({
  inferring,
  matching,
  done,
  inferredPersonas,
  product,
  matchedAgents,
}: ActiveVizProps) {
  return (
    <div className="absolute inset-0">
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1000 500"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <radialGradient id="hubGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00aaff" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#0066cc" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#003d80" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0066cc" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#00aaff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0066cc" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="scanGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#00aaff" stopOpacity="0" />
            <stop offset="50%" stopColor="#00aaff" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#00aaff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* === 左侧：产品卡节点 === */}
        <g transform="translate(70, 250)">
          <circle r="44" fill="#0066cc" opacity="0.12" />
          <circle r="34" fill="#0066cc" opacity="0.18" />
          <rect
            x="-48"
            y="-32"
            width="96"
            height="64"
            rx="6"
            fill="#1a1a1a"
            stroke="#0066cc"
            strokeWidth="1.2"
          />
          <text x="0" y="-14" textAnchor="middle" fill="#8e8e93" fontSize="9" letterSpacing="1">
            B 端产品
          </text>
          <text
            x="0"
            y="4"
            textAnchor="middle"
            fill="#f5f5f7"
            fontSize="10"
            fontWeight="600"
          >
            {truncate(product.name, 10)}
          </text>
          <text x="0" y="18" textAnchor="middle" fill="#3399ff" fontSize="8" fontFamily="monospace">
            ¥{product.price}
          </text>
        </g>

        {/* === 中央：AI Hub === */}
        <g transform="translate(500, 250)">
          <circle r="90" fill="url(#hubGrad)" opacity="0.6">
            {matching && <animate attributeName="r" values="86;96;86" dur="2s" repeatCount="indefinite" />}
          </circle>
          <circle r="56" fill="url(#hubGrad)" opacity="0.4">
            {matching && <animate attributeName="r" values="52;62;52" dur="2s" repeatCount="indefinite" />}
          </circle>
          <circle
            r="40"
            fill="#0d0d0d"
            stroke="#00aaff"
            strokeWidth="1.5"
            style={{ filter: 'drop-shadow(0 0 12px rgba(0,170,255,0.7))' }}
          />
          {/* 旋转光圈 */}
          {(inferring || matching) && (
            <g>
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 500 250"
                to="360 500 250"
                dur="3s"
                repeatCount="indefinite"
              />
              <circle r="40" fill="none" stroke="#00aaff" strokeWidth="1" opacity="0.5" />
              <circle cx="500" cy="210" r="3" fill="#00aaff" />
            </g>
          )}
          <text x="500" y="246" textAnchor="middle" fill="#f5f5f7" fontSize="13" fontWeight="600">
            AI Hub
          </text>
          <text x="500" y="262" textAnchor="middle" fill="#8e8e93" fontSize="9">
            {inferring ? '画像推断中' : matching ? '精准匹配中' : '匹配完成'}
          </text>
        </g>

        {/* === 右侧：用户池（搜索 + 命中） === */}
        <g transform="translate(700, 60)">
          {/* 用户池背景框 */}
          <rect
            x="0"
            y="0"
            width="280"
            height="380"
            rx="8"
            fill="rgba(0,0,0,0.25)"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1"
          />
          {/* 标题 */}
          <text x="140" y="22" textAnchor="middle" fill="#8e8e93" fontSize="10" letterSpacing="1">
            C 端用户池 · 12,480 Agents
          </text>

          {/* 用户点阵（5列 × 12行 = 60个） */}
          {Array.from({ length: 60 }).map((_, i) => {
            const cols = 5
            const row = Math.floor(i / cols)
            const col = i % cols
            const cx = 50 + col * 45
            const cy = 50 + row * 27
            // 命中规则：每4/5/7/9/11/13/15的倍数
            const hitIndices = [3, 5, 7, 11, 19, 23, 28, 31, 37, 41, 44, 47, 52, 55, 58]
            const isHit = done && hitIndices.includes(i)
            return (
              <g key={i}>
                {isHit && (
                  <circle cx={cx} cy={cy} r="8" fill="none" stroke="#00aaff" strokeWidth="0.6" opacity="0.5">
                    <animate attributeName="r" values="5;11;5" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.7;0;0.7" dur="2s" repeatCount="indefinite" />
                  </circle>
                )}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHit ? 3.2 : 1.8}
                  fill={isHit ? '#00aaff' : '#3a3a3a'}
                  opacity={isHit ? 1 : 0.5}
                />
              </g>
            )
          })}

          {/* 搜索光带（matching 时从上往下扫描） */}
          {matching && (
            <rect x="20" y="40" width="240" height="40" fill="url(#scanGrad)" opacity="0.6">
              <animate attributeName="y" values="40;330;40" dur="3s" repeatCount="indefinite" />
            </rect>
          )}
        </g>

        {/* === 连线：产品 → Hub === */}
        <path
          d="M 130 250 Q 280 250 460 250"
          stroke="url(#lineGrad)"
          strokeWidth="2"
          fill="none"
          className={matching || done ? 'flow-line' : ''}
        />

        {/* === 连线：Hub → 用户池（命中节点连线） === */}
        {(matching || done) && (
          <g>
            {/* 多条命中连线 */}
            {[
              { x: 750, y: 110, delay: 0 },
              { x: 795, y: 137, delay: 0.2 },
              { x: 840, y: 164, delay: 0.4 },
              { x: 885, y: 191, delay: 0.6 },
              { x: 750, y: 218, delay: 0.3 },
              { x: 840, y: 245, delay: 0.5 },
              { x: 930, y: 272, delay: 0.7 },
              { x: 795, y: 299, delay: 0.4 },
              { x: 885, y: 326, delay: 0.6 },
              { x: 840, y: 353, delay: 0.5 },
            ].map((c, i) => (
              <path
                key={i}
                d={`M 540 250 Q 620 ${250 + (c.y - 250) * 0.4} ${c.x} ${c.y}`}
                stroke="url(#lineGrad)"
                strokeWidth="1.2"
                fill="none"
                className="flow-line"
                style={{ animationDelay: `${c.delay}s` }}
              />
            ))}
          </g>
        )}
      </svg>

      {/* === 标签涌现（顶部） === */}
      {(inferring || matching || done) && (
        <div className="absolute left-1/2 top-2 flex w-[55%] -translate-x-1/2 flex-wrap justify-center gap-1.5">
          {inferredPersonas.map((p, i) => (
            <div
              key={p.id}
              className="chip chip-active animate-fade-in"
              style={{ animationDelay: `${i * 0.2}s`, animationFillMode: 'backwards' }}
            >
              <Sparkles className="h-3 w-3" />
              {p.label}
            </div>
          ))}
          {inferring &&
            Array.from({ length: Math.max(0, 3 - inferredPersonas.length) }).map((_, i) => (
              <div
                key={`sk-${i}`}
                className="h-6 w-20 animate-pulse rounded-full bg-white/[0.04]"
                style={{ animationDelay: `${i * 0.3}s` }}
              />
            ))}
        </div>
      )}

      {/* === 底部状态提示 === */}
      {inferring && (
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 text-[11px] text-ink-200">
          <Loader2 className="h-3 w-3 animate-spin text-tech-light" />
          正在分析「{truncate(product.name, 14)}」的目标人群
        </div>
      )}
      {matching && (
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 text-[11px] text-ink-200">
          <Loader2 className="h-3 w-3 animate-spin text-tech-light" />
          在 12,480 位 Agent 中扫描画像相似度
        </div>
      )}
      {done && (
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-tech/30 bg-tech/10 px-3 py-1 text-[11px] text-tech-light">
          <CheckCircle2 className="h-3 w-3" />
          精准找到 {matchedAgents.toLocaleString()} 位目标用户 · 已推送至 C 端
        </div>
      )}
    </div>
  )
}

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n) + '…' : s
}

function StatCard({
  icon,
  label,
  value,
  sub,
  active,
  progress,
  tone,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub: string
  active?: boolean
  progress?: number
  tone?: 'strong' | 'weak' | 'potential'
}) {
  const toneRing =
    tone === 'strong'
      ? 'ring-1 ring-tech-light/30'
      : tone === 'weak'
      ? 'ring-1 ring-accent-warning/30'
      : tone === 'potential'
      ? 'ring-1 ring-ink-300/20'
      : ''
  return (
    <div
      className={`rounded-md border p-2.5 transition-all ${
        active
          ? `border-tech/30 bg-tech/[0.05] ${toneRing}`
          : 'border-white/[0.05] bg-ink-900/40'
      }`}
    >
      <div className="mb-1 flex items-center gap-1 text-ink-200">
        {icon}
        <span className="text-[10px] tracking-wider">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="font-mono text-base font-semibold text-ink-50">{value}</span>
        <span className="text-[10px] text-ink-300">{sub}</span>
      </div>
      {typeof progress === 'number' && (
        <div className="mt-1.5 h-0.5 overflow-hidden rounded-full bg-white/[0.04]">
          <div
            className="h-full rounded-full bg-tech-light"
            style={{ width: `${progress}%`, transition: 'width 300ms' }}
          />
        </div>
      )}
    </div>
  )
}
