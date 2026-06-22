import { usePromoStore } from '../../store/usePromoStore'
import { CollapsiblePanel } from '../ui/CollapsiblePanel'
import { Bot, User as UserIcon, Sparkles } from 'lucide-react'
import { useEffect, useRef } from 'react'

export function AgentChat() {
  const { chatMessages, typing, stage } = usePromoStore()
  const scrollRef = useRef<HTMLDivElement>(null)

  const active = stage === 'done'

  useEffect(() => {
    const el = scrollRef.current
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
    }
  }, [chatMessages, typing])

  return (
    <CollapsiblePanel
      side="right"
      title="C 端 Agent"
      subtitle="私人 Agent 推荐对话"
      icon={<Bot className="h-4 w-4" />}
      active={active}
    >
      <div className="flex h-full flex-col">
        {/* 顶部用户信息 */}
        <div className="flex items-center gap-2.5 border-b border-white/[0.05] px-4 py-3">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-tech to-tech-neon">
            <UserIcon className="h-3.5 w-3.5 text-white" />
            {active && (
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-ink-850 bg-accent-success" />
            )}
          </div>
          <div>
            <div className="text-xs font-medium text-ink-50">李同学</div>
            <div className="flex items-center gap-1 text-[10px] text-ink-300">
              {active ? (
                <>
                  <span className="h-1.5 w-1.5 rounded-full bg-accent-success" />
                  在线 · Agent 已推送推荐
                </>
              ) : (
                <>等待 Agent 推送</>
              )}
            </div>
          </div>
        </div>

        {/* 对话流 */}
        <div ref={scrollRef} className="flex-1 space-y-3 overflow-auto p-4 scrollbar-thin">
          {chatMessages.map((m) => (
            <MessageBubble key={m.id} role={m.role} text={m.text} />
          ))}

          {typing && (
            <div className="flex items-end gap-2">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-tech/20 text-tech-light">
                <Bot className="h-3 w-3" />
              </div>
              <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm border border-white/[0.06] bg-ink-800/80 px-3 py-2">
                <span className="h-1 w-1 animate-pulse rounded-full bg-ink-200" style={{ animationDelay: '0ms' }} />
                <span className="h-1 w-1 animate-pulse rounded-full bg-ink-200" style={{ animationDelay: '150ms' }} />
                <span className="h-1 w-1 animate-pulse rounded-full bg-ink-200" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          {stage !== 'done' && chatMessages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.06] bg-ink-800/50">
                <Sparkles className="h-4 w-4 text-ink-300" />
              </div>
              {stage === 'idle' ? (
                <>
                  <p className="text-xs text-ink-200">等待匹配推送</p>
                  <p className="mt-1 text-[10px] text-ink-300">Agent 收到推荐后会主动发起对话</p>
                </>
              ) : (
                <>
                  <p className="text-xs text-ink-200">正在为你匹配</p>
                  <p className="mt-1 text-[10px] text-ink-300">几秒后 Agent 会主动发起对话</p>
                </>
              )}
            </div>
          )}
        </div>

        {/* 输入区（禁用，只读演示） */}
        <div className="border-t border-white/[0.05] p-3">
          <div className="flex items-center gap-2 rounded-md border border-white/[0.06] bg-ink-900/60 px-3 py-2">
            <input
              disabled
              placeholder="演示模式：Agent 自动推荐"
              className="flex-1 bg-transparent text-xs text-ink-200 placeholder:text-ink-300/50 focus:outline-none disabled:opacity-50"
            />
            <button
              disabled
              className="flex h-6 w-6 items-center justify-center rounded bg-tech/40 text-white opacity-50"
            >
              <Bot className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </CollapsiblePanel>
  )
}

function MessageBubble({
  role,
  text,
}: {
  role: 'agent' | 'user'
  text: string
  personaLabel?: string
}) {
  if (role === 'agent') {
    return (
      <div className="flex animate-fade-in items-end gap-2">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-tech/20 text-tech-light">
          <Bot className="h-3 w-3" />
        </div>
        <div className="max-w-[85%]">
          <div className="whitespace-pre-wrap rounded-2xl rounded-bl-sm border border-white/[0.06] bg-ink-800/80 px-3 py-2 text-xs leading-relaxed text-ink-50">
            {text}
            {text.length > 0 && !text.endsWith('？') && !text.endsWith('~') && !text.endsWith('。') && (
              <span className="ml-0.5 inline-block h-3 w-[1px] translate-y-0.5 animate-caret bg-tech-light align-middle" />
            )}
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="flex animate-fade-in justify-end">
      <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-ink-700/70 px-3 py-2 text-xs leading-relaxed text-ink-50">
        {text}
      </div>
    </div>
  )
}
