// 8 人格选择条：横向滚动 + 选中态
import type { PersonaProfile } from '../../data/personaProfiles'
import { PERSONA_PROFILES } from '../../data/personaProfiles'

interface PersonaStripProps {
  selectedId: string
  onSelect: (id: string) => void
}

export function PersonaStrip({ selectedId, onSelect }: PersonaStripProps) {
  return (
    <div className="panel-surface rounded-xl p-3">
      <div className="mb-2 flex items-center justify-between px-2">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-ink-200/70">
          <span className="h-1.5 w-1.5 rounded-full bg-tech-light breath-dot" />
          8 Archetypes · 同一款产品 · 8 种反应
        </div>
        <div className="text-[10px] text-ink-300">点击切换 · 观察 Agent 话术变化</div>
      </div>
      <div className="grid grid-cols-8 gap-2">
        {PERSONA_PROFILES.map((p) => (
          <PersonaChip
            key={p.id}
            persona={p}
            active={p.id === selectedId}
            onClick={() => onSelect(p.id)}
          />
        ))}
      </div>
    </div>
  )
}

function PersonaChip({
  persona,
  active,
  onClick,
}: {
  persona: PersonaProfile
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`group relative flex flex-col items-center gap-1.5 rounded-lg border p-2.5 transition-all ${
        active
          ? 'border-tech-light/60 bg-tech/10 shadow-glow-soft'
          : 'border-white/[0.05] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]'
      }`}
    >
      {/* 头像（首字 + 性别色） */}
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all ${
          active
            ? 'bg-gradient-to-br from-tech to-tech-neon text-white'
            : persona.gender === 'F'
            ? 'bg-pink-500/15 text-pink-300'
            : 'bg-blue-500/15 text-blue-300'
        }`}
      >
        {persona.name[0]}
      </div>
      {/* 名字 + 年龄 */}
      <div className="flex items-baseline gap-1">
        <span className={`text-[12px] font-semibold ${active ? 'text-tech-light' : 'text-ink-50'}`}>
          {persona.name}
        </span>
        <span className="text-[10px] text-ink-300">{persona.age}</span>
      </div>
      {/* 原型一行字 */}
      <div className="line-clamp-1 text-center text-[10px] leading-tight text-ink-200">
        {persona.archetype}
      </div>
      {active && (
        <div className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-tech-light breath-dot" />
      )}
    </button>
  )
}
