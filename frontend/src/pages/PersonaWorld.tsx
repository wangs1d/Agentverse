// C 端「被推荐」体验：选一个身边的人，看 Agent 怎么说话
// 极简版：人格条 + 对话，无对比、无详情面板
import { useState } from 'react'
import { PERSONA_PROFILES } from '../data/personaProfiles'
import { PersonaStrip } from '../components/persona/PersonaStrip'
import { PersonaChatPanel } from '../components/persona/PersonaChatPanel'
import { User } from 'lucide-react'

export function PersonaWorld() {
  const [selectedId, setSelectedId] = useState<string>('xiaoke')
  const selected = PERSONA_PROFILES.find((p) => p.id === selectedId)!

  return (
    <main className="flex flex-1 flex-col gap-3 overflow-hidden p-3">
      <div className="panel-surface flex items-center gap-3 rounded-xl px-5 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-tech/20 text-tech-light">
          <User className="h-4 w-4" />
        </div>
        <div>
          <h1 className="text-sm font-semibold text-ink-50">C 端被推荐体验</h1>
          <p className="text-[11px] text-ink-200">选一个身边的人，看 Agent 怎么说话</p>
        </div>
      </div>

      <PersonaStrip selectedId={selectedId} onSelect={setSelectedId} />

      <div className="min-h-0 flex-1 animate-fade-in" key={`chat-${selectedId}`}>
        <PersonaChatPanel persona={selected} />
      </div>
    </main>
  )
}
