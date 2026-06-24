// 24 小时推荐时机可视化：每个 C 端人格都有「最佳推荐时机」
// 展示「现在几点 / 今天该对谁开口」的真实感
import { useState, useEffect, useMemo } from 'react'
import { Clock, Sun, Moon, Sunrise, Sunset } from 'lucide-react'
import { PERSONA_PROFILES, type PersonaProfile } from '../data/personaProfiles'

interface TimingSlot {
  hour: number
  personas: { persona: PersonaProfile; intensity: 'best' | 'good' | 'ok' | 'avoid' }[]
  label?: string
}

/**
 * 把每个 persona 的 bestTiming 字符串解析成 24h 区间
 * 简化版：只解析「晚9-11点」/「清晨6:30-7:30」/「深夜1-2点」这种
 */
function parseBestTiming(timing: string): { start: number; end: number } | null {
  // 匹配「X-Y点」或「X-Y」
  const match = timing.match(/(\d{1,2})[:：]?(\d{0,2})[-—到](\d{1,2})[:：]?(\d{0,2})/)
  if (!match) return null
  const startH = parseInt(match[1])
  const startM = match[2] ? parseInt(match[2]) : 0
  const endH = parseInt(match[3])
  const endM = match[4] ? parseInt(match[4]) : 0
  // 简单处理：晚上 9-11 点这种
  if (timing.includes('晚') || timing.includes('深夜') || timing.includes('凌晨') || timing.includes('夜里')) {
    return { start: startH, end: endH }
  }
  if (timing.includes('清晨') || timing.includes('早') || timing.includes('上午')) {
    return { start: startH, end: endH }
  }
  if (timing.includes('下午')) {
    return { start: startH + 12, end: endH + 12 }
  }
  if (timing.includes('中午')) {
    return { start: startH, end: endH }
  }
  return { start: startH, end: endH }
}

const TIMING_LABELS: Record<string, { label: string; icon: any; color: string }> = {
  breakfast: { label: '清晨 6-9', icon: Sunrise, color: 'text-amber-300' },
  morning: { label: '上午 9-12', icon: Sun, color: 'text-yellow-200' },
  noon: { label: '中午 12-14', icon: Sun, color: 'text-yellow-300' },
  afternoon: { label: '下午 14-18', icon: Sun, color: 'text-orange-300' },
  evening: { label: '傍晚 18-21', icon: Sunset, color: 'text-orange-400' },
  night: { label: '晚间 21-24', icon: Moon, color: 'text-blue-300' },
  midnight: { label: '凌晨 0-3', icon: Moon, color: 'text-indigo-300' },
  late: { label: '深夜 3-6', icon: Moon, color: 'text-indigo-400' },
}

function getTimeSlot(hour: number) {
  if (hour >= 6 && hour < 9) return TIMING_LABELS.breakfast
  if (hour >= 9 && hour < 12) return TIMING_LABELS.morning
  if (hour >= 12 && hour < 14) return TIMING_LABELS.noon
  if (hour >= 14 && hour < 18) return TIMING_LABELS.afternoon
  if (hour >= 18 && hour < 21) return TIMING_LABELS.evening
  if (hour >= 21 && hour < 24) return TIMING_LABELS.night
  if (hour >= 0 && hour < 3) return TIMING_LABELS.midnight
  return TIMING_LABELS.late
}

/**
 * 计算每个人格在每个小时的状态
 * 简化：best = 在 bestTiming 区间内；good = 邻近 1-2 小时；avoid = 完全相反的时段
 */
function buildTimings(): TimingSlot[] {
  const slots: TimingSlot[] = []
  for (let h = 0; h < 24; h++) {
    const personas = PERSONA_PROFILES.map((p) => {
      const range = parseBestTiming(p.agentStrategy.bestTiming)
      if (!range) return { persona: p, intensity: 'ok' as const }
      // 简化：处理跨天
      let intensity: 'best' | 'good' | 'ok' | 'avoid'
      if (range.start <= range.end) {
        if (h >= range.start && h <= range.end) intensity = 'best'
        else if (h === range.start - 1 || h === range.end + 1) intensity = 'good'
        else if (Math.abs(h - range.start) <= 3 || Math.abs(h - range.end) <= 3) intensity = 'ok'
        else intensity = 'avoid'
      } else {
        // 跨天
        if (h >= range.start || h <= range.end) intensity = 'best'
        else intensity = 'avoid'
      }
      return { persona: p, intensity }
    })
    slots.push({ hour: h, personas })
  }
  return slots
}

export function TimingClock() {
  const [now, setNow] = useState(new Date())
  const slots = useMemo(() => buildTimings(), [])

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const currentHour = now.getHours()
  const currentSlot = slots[currentHour]

  // 当前正在「最佳时机」的人格
  const bestNow = currentSlot.personas.filter((p) => p.intensity === 'best')
  const goodNow = currentSlot.personas.filter((p) => p.intensity === 'good')
  const slotInfo = getTimeSlot(currentHour)

  return (
    <main className="flex flex-1 flex-col gap-3 overflow-hidden p-3">
      {/* 头部 */}
      <div className="panel-surface flex items-center gap-3 rounded-xl px-5 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-tech/20 text-tech-light">
          <Clock className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <h1 className="text-sm font-semibold text-ink-50">
            时机之轮 · 24 小时推荐策略
          </h1>
          <p className="text-[11px] text-ink-200">
            每个人格都有「最佳推荐时机」，对的时候说一句，胜过错的时候说一百句
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-md border border-tech-light/30 bg-tech/[0.06] px-3 py-1.5">
          <slotInfo.icon className={`h-3.5 w-3.5 ${slotInfo.color}`} />
          <span className="font-mono text-xs font-semibold text-ink-50">
            {String(currentHour).padStart(2, '0')}:{String(now.getMinutes()).padStart(2, '0')}
          </span>
          <span className="text-[10px] text-ink-200">{slotInfo.label}</span>
        </div>
      </div>

      {/* 当前推荐状态卡片 */}
      <div className="grid grid-cols-3 gap-3">
        <CurrentStateCard
          tone="best"
          title="现在该主动开口"
          count={bestNow.length}
          personas={bestNow}
        />
        <CurrentStateCard
          tone="good"
          title="观察期 · 可试探"
          count={goodNow.length}
          personas={goodNow}
        />
        <CurrentStateCard
          tone="avoid"
          title="不建议推荐"
          count={currentSlot.personas.filter((p) => p.intensity === 'avoid').length}
          personas={currentSlot.personas.filter((p) => p.intensity === 'avoid')}
        />
      </div>

      {/* 24小时环形视图 */}
      <div className="panel-surface flex-1 overflow-hidden rounded-xl p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-semibold text-ink-50">24 小时 × 8 人格推荐强度</h2>
          <div className="flex items-center gap-3 text-[10px]">
            <Legend color="bg-tech-light" label="最佳时机" />
            <Legend color="bg-tech/40" label="可试探" />
            <Legend color="bg-ink-700" label="一般" />
            <Legend color="bg-ink-900" label="避免" />
          </div>
        </div>
        <div className="overflow-auto scrollbar-thin">
          <HourGrid slots={slots} currentHour={currentHour} />
        </div>
      </div>
    </main>
  )
}

function CurrentStateCard({
  tone,
  title,
  count,
  personas,
}: {
  tone: 'best' | 'good' | 'avoid'
  title: string
  count: number
  personas: { persona: PersonaProfile; intensity: 'best' | 'good' | 'ok' | 'avoid' }[]
}) {
  const ring =
    tone === 'best'
      ? 'border-tech-light/40 bg-tech/[0.06]'
      : tone === 'good'
      ? 'border-tech/30 bg-tech/[0.04]'
      : 'border-white/[0.05] bg-ink-900/30'
  return (
    <div className={`rounded-xl border p-3 ${ring}`}>
      <div className="mb-2 flex items-center justify-between">
        <div className="text-[10px] uppercase tracking-wider text-ink-200">{title}</div>
        <div
          className={`flex h-7 w-7 items-center justify-center rounded-full font-mono text-xs font-semibold ${
            tone === 'best'
              ? 'bg-tech-light/20 text-tech-light'
              : tone === 'good'
              ? 'bg-tech/20 text-tech-light'
              : 'bg-ink-700/50 text-ink-200'
          }`}
        >
          {count}
        </div>
      </div>
      <div className="space-y-1">
        {personas.slice(0, 4).map(({ persona }) => (
          <div key={persona.id} className="flex items-center gap-1.5 text-[11px]">
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-tech/30 to-tech-neon/30 text-[9px] font-semibold text-tech-light">
              {persona.name.slice(0, 1)}
            </div>
            <span className="text-ink-50">{persona.name}</span>
            <span className="text-[9px] text-ink-300">·</span>
            <span className="text-[9px] text-ink-300">{persona.archetype.slice(0, 8)}</span>
          </div>
        ))}
        {count === 0 && (
          <div className="text-[10px] text-ink-300">—</div>
        )}
      </div>
    </div>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1 text-ink-200">
      <div className={`h-2.5 w-2.5 rounded-sm ${color}`} />
      <span>{label}</span>
    </div>
  )
}

function HourGrid({ slots, currentHour }: { slots: TimingSlot[]; currentHour: number }) {
  return (
    <div className="space-y-1">
      {/* 表头：小时 */}
      <div className="flex items-center gap-1 pl-24">
        {slots.map((s) => (
          <div
            key={s.hour}
            className={`flex w-7 shrink-0 flex-col items-center text-[9px] ${
              s.hour === currentHour ? 'text-tech-light' : 'text-ink-300'
            }`}
          >
            <span>{String(s.hour).padStart(2, '0')}</span>
            {s.hour === currentHour && <div className="mt-0.5 h-1 w-1 rounded-full bg-tech-light" />}
          </div>
        ))}
      </div>
      {/* 每行一个人格 */}
      {PERSONA_PROFILES.map((persona) => (
        <div key={persona.id} className="flex items-center gap-1">
          <div className="flex w-24 shrink-0 items-center gap-1.5">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-tech/30 to-tech-neon/30 text-[9px] font-semibold text-tech-light">
              {persona.name.slice(0, 1)}
            </div>
            <div className="min-w-0">
              <div className="truncate text-[11px] text-ink-50">{persona.name}</div>
              <div className="truncate text-[9px] text-ink-300">
                {persona.agentStrategy.bestTiming}
              </div>
            </div>
          </div>
          {slots.map((s) => {
            const p = s.personas.find((x) => x.persona.id === persona.id)
            const intensity = p?.intensity || 'ok'
            const colorClass =
              intensity === 'best'
                ? 'bg-tech-light shadow-glow-soft'
                : intensity === 'good'
                ? 'bg-tech/50'
                : intensity === 'ok'
                ? 'bg-ink-700/60'
                : 'bg-ink-900/40'
            return (
              <div
                key={s.hour}
                title={`${String(s.hour).padStart(2, '0')}:00 - ${persona.name} - ${
                  intensity === 'best'
                    ? '最佳'
                    : intensity === 'good'
                    ? '可试探'
                    : intensity === 'ok'
                    ? '一般'
                    : '避免'
                }`}
                className={`h-5 w-7 shrink-0 rounded-sm transition-all ${colorClass} ${
                  s.hour === currentHour ? 'ring-1 ring-tech-light' : ''
                }`}
              />
            )
          })}
        </div>
      ))}
    </div>
  )
}
