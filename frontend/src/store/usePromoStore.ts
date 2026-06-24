import { create } from 'zustand'
import type { ProductInfo } from '../lib/matcher'
import {
  inferPersonas,
  calculateMatch,
  pickPrimaryPersona,
  generateRecommendation,
  type InferSource,
} from '../lib/matcher'
import type { Persona } from '../data/personas'
import type { ConversationFlow } from '../data/recommendations'

export type Stage = 'idle' | 'submitted' | 'inferring' | 'matching' | 'done'

export interface ChatMessage {
  id: string
  role: 'agent' | 'user'
  text: string
  complete?: boolean
  personaLabel?: string
}

interface PromoState {
  // B 端
  product: ProductInfo
  setProduct: (patch: Partial<ProductInfo>) => void

  // 中台
  stage: Stage
  inferredPersonas: Persona[]
  matchSource: InferSource | null
  matchSourceDetail: string | null
  matchProgress: number
  matchedAgents: number
  matchTier: 'strong' | 'weak' | 'potential'
  matchTierLabel: string

  // C 端
  chatMessages: ChatMessage[]
  typing: boolean
  recommendSource: InferSource | null
  recommendSourceDetail: string | null

  // UI
  collapsed: { left: boolean; middle: boolean; right: boolean }
  togglePanel: (p: 'left' | 'middle' | 'right') => void
  setCollapsed: (p: 'left' | 'middle' | 'right', v: boolean) => void
  setAllCollapsed: (v: boolean) => void

  // actions
  submitPromo: () => void
  reset: () => void
}

const initialProduct: ProductInfo = {
  type: 'software',
  brand: '',
  name: '',
  desc: '',
  price: 0,
  image: '',
}

export const usePromoStore = create<PromoState>((set, get) => ({
  product: initialProduct,
  setProduct: (patch) =>
    set((s) => ({ product: { ...s.product, ...patch } })),

  stage: 'idle',
  inferredPersonas: [],
  matchSource: null,
  matchSourceDetail: null,
  matchProgress: 0,
  matchedAgents: 0,
  matchTier: 'potential',
  matchTierLabel: '潜在关注',

  chatMessages: [],
  typing: false,
  recommendSource: null,
  recommendSourceDetail: null,

  collapsed: { left: false, middle: false, right: false },
  togglePanel: (p) =>
    set((s) => ({ collapsed: { ...s.collapsed, [p]: !s.collapsed[p] } })),
  setCollapsed: (p, v) =>
    set((s) => ({ collapsed: { ...s.collapsed, [p]: v } })),
  setAllCollapsed: (v) => set({ collapsed: { left: v, middle: v, right: v } }),

  submitPromo: () => {
    const { product } = get()
    if (get().stage !== 'idle') return
    set({ stage: 'submitted' })

    // 1) 阶段一：AI 画像推断（先调 KIMI，失败回退到规则，仍返回 personas）
    setTimeout(async () => {
      set({ stage: 'inferring' })
      const result = await inferPersonas(product, { timeoutMs: 8000 })
      set({
        inferredPersonas: result.personas,
        matchSource: result.source,
        matchSourceDetail: result.detail ?? null,
      })

      // 2) 阶段二：双向匹配（前端进度条动画）
      setTimeout(() => {
        set({ stage: 'matching' })
        const personas = result.personas
        let p = 0
        const tick = setInterval(() => {
          p += 4 + Math.random() * 6
          if (p >= 100) {
            p = 100
            clearInterval(tick)
            const { progress, matchedAgents, tier, tierLabel } = calculateMatch(personas)
            set({ matchProgress: progress, matchedAgents, matchTier: tier, matchTierLabel: tierLabel })

            // 3) 阶段三：Agent 推荐
            setTimeout(() => {
              set({ stage: 'done' })
              const primary = pickPrimaryPersona(personas)
              startAgentConversation(primary, product, set)
            }, 400)
          } else {
            set({ matchProgress: Math.round(p) })
          }
        }, 90)
      }, 600)
    }, 500)
  },

  reset: () => {
    set({
      stage: 'idle',
      inferredPersonas: [],
      matchSource: null,
      matchSourceDetail: null,
      matchProgress: 0,
      matchedAgents: 0,
      chatMessages: [],
      typing: false,
      recommendSource: null,
      recommendSourceDetail: null,
      collapsed: { left: false, middle: false, right: false },
    })
  },
}))

/**
 * 启动 Agent 对话：先让 KIMI 实时生成 5 步对话（失败回退模板），再逐条打字机输出
 * 节奏：先共情 → 询问 → 等待用户回应 → 顺势带出产品 → 轻量收尾
 * 规则：
 *  - 不报价格、不出产品卡片；
 *  - AI 路径：share 字段由 KIMI 直接嵌入品牌与产品名；模板路径：用 {brand}/{product} 占位填充
 *  - 仍不催单，把决定权交还用户。
 */
async function startAgentConversation(
  primary: Persona,
  product: ProductInfo,
  set: (partial: Partial<PromoState> | ((s: PromoState) => Partial<PromoState>)) => void,
) {
  // 先亮起"思考中"动画，给 KIMI 留生成时间
  set({ typing: true })

  const { flow, source, detail } = await generateRecommendation(product, primary, { timeoutMs: 10000 })
  set({ recommendSource: source, recommendSourceDetail: detail ?? null })

  // 模板路径才需要做占位符替换；AI 路径下 KIMI 已经按要求嵌入了品牌与产品名
  const productName = product.name?.trim() || '那款产品'
  const brandName = product.brand?.trim() || '那家'
  const fill = (text: string) =>
    text.replace(/\{brand\}/g, brandName).replace(/\{product\}/g, productName)
  const finalFlow: ConversationFlow =
    source === 'ai'
      ? flow
      : {
          greeting: fill(flow.greeting),
          probe: fill(flow.probe),
          userResponse: fill(flow.userResponse),
          share: fill(flow.share),
          closing: fill(flow.closing),
        }

  // 1) 关心  2) 询问  3) 用户主动表达需求  4) 顺势分享（自然带出产品名）  5) 轻量收尾
  const lines: Array<{
    role: 'agent' | 'user'
    text: string
    delayBefore?: number
  }> = [
    { role: 'agent', text: finalFlow.greeting, delayBefore: 0 },
    { role: 'agent', text: finalFlow.probe, delayBefore: 600 },
    { role: 'user', text: finalFlow.userResponse, delayBefore: 900 },
    { role: 'agent', text: finalFlow.share, delayBefore: 700 },
    { role: 'agent', text: finalFlow.closing, delayBefore: 600 },
  ]

  // AI 路径的对话总长通常比模板短，把打字节奏调快一档以减少等待感
  const charInterval = source === 'ai' ? 18 : 22

  let i = 0
  const playNext = () => {
    if (i >= lines.length) {
      set({ typing: false })
      return
    }
    const line = lines[i]
    set({ typing: true })
    const id = `m-${Date.now()}-${i}`
    set((s) => ({
      chatMessages: [
        ...s.chatMessages,
        { id, role: line.role, text: '', complete: false },
      ],
    }))

    // 打字机
    let char = 0
    const text = line.text
    const typeInterval = setInterval(() => {
      char += 1
      set((s) => ({
        chatMessages: s.chatMessages.map((m) =>
          m.id === id ? { ...m, text: text.slice(0, char) } : m,
        ),
      }))
      if (char >= text.length) {
        clearInterval(typeInterval)
        set((s) => ({
          chatMessages: s.chatMessages.map((m) =>
            m.id === id ? { ...m, complete: true } : m,
          ),
        }))
        i += 1
        const next = lines[i]
        setTimeout(playNext, next?.delayBefore ?? 380)
      }
    }, charInterval)
  }
  setTimeout(playNext, 200)
}
