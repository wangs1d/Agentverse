import { PERSONAS, type Persona } from '../data/personas'
import { getRandomRecommendation, type ConversationFlow } from '../data/recommendations'

export interface ProductInfo {
  type: 'software' | 'hardware'
  brand?: string
  name: string
  desc: string
  price: number
  image: string
}

export type InferSource = 'ai' | 'rule'

export interface InferResult {
  personas: Persona[]
  source: InferSource
  detail?: string // 失败时附带原因
}

/**
 * 近义/上下文补全词典
 * 用于解决「Agent 了解用户时关键词命中但语义缺口」的问题：
 * 例如产品只写了"陪聊"，也能命中"陪伴 / 倾诉 / 情感"画像。
 *
 * 每条规则：出现 trigger 中的任意词时，给指定 persona 加分。
 */
interface ContextRule {
  triggers: string[]
  personaId: string
  weight: number
  reason?: string // 可选：仅用于日志/可解释性
}

const CONTEXT_RULES: ContextRule[] = [
  // 陪伴/情感缺口补全
  { triggers: ['陪聊', '解闷', '解闷儿', '唠嗑', '念叨', '说话', '倾听', '深夜', '失眠', '安静', '空'], personaId: 'lonely', weight: 1.2, reason: '情绪陪伴信号' },
  { triggers: ['陪伴', '聊天', '倾诉', '智能', '机器人', '宠物', '社交', '朋友'], personaId: 'lonely', weight: 0.6 },

  // 效率/职场焦虑补全
  { triggers: ['会多', '会议', '加班', '熬夜', '996', '内卷', '汇报', 'deadline', 'ddl', '赶工', '压力'], personaId: 'career-anxiety', weight: 1.0, reason: '高压职场信号' },
  { triggers: ['专注', '番茄', 'todo', '任务', '时间', '效率', '正念', '冥想', '白噪音', '心率'], personaId: 'career-anxiety', weight: 0.6 },

  // 健身补全
  { triggers: ['跑步', '撸铁', '深蹲', '硬拉', '有氧', '无氧', '减脂', '增肌', '恢复', '膝盖', '瓶颈'], personaId: 'fitness', weight: 1.0 },
  { triggers: ['运动', '健身', '心率', '体脂', '卡路里', '手表', '穿戴', '训练'], personaId: 'fitness', weight: 0.6 },

  // 数码补全
  { triggers: ['npu', 'gpu', 'cpu', '芯片', '算力', '首发', '拆机', '跑分', '堆料', '旗舰'], personaId: 'tech-enthusiast', weight: 1.1 },
  { triggers: ['数码', '极客', '新品', '黑科技', '智能', '评测', '参数'], personaId: 'tech-enthusiast', weight: 0.6 },

  // 母婴补全
  { triggers: ['哄睡', '夜醒', '尿不湿', '奶粉', '胎动', '产检', '孕', '妈妈群', '妈咪', '婴儿'], personaId: 'parenting', weight: 1.1 },
  { triggers: ['母婴', '宝宝', '育儿', '早教', '儿童', '亲子', '监护'], personaId: 'parenting', weight: 0.6 },

  // 学生补全
  { triggers: ['期末', '考研', '考公', '四六级', '期末考', '复习', '刷题', '错题', '保研'], personaId: 'student', weight: 1.0 },
  { triggers: ['学习', '笔记', '墨水屏', '语言', '阅读', '效率', '专注'], personaId: 'student', weight: 0.6 },

  // 旅行补全
  { triggers: ['进山', '徒步', '露营', '自驾', '高原', '无人区', '户外', '野', '小众', '差旅'], personaId: 'traveler', weight: 1.0 },
  { triggers: ['旅行', '便携', '续航', '防水', '导航', '背包', '摄影', '翻译'], personaId: 'traveler', weight: 0.6 },

  // 创作者补全
  { triggers: ['录播客', '出图', '交稿', '剪片', '剪辑', '调色', '色差', '色准', '客户', '灵感'], personaId: 'creator', weight: 1.0 },
  { triggers: ['创作', '设计', '视频', '内容', '协作', '效率', '便携屏'], personaId: 'creator', weight: 0.6 },
]

/**
 * 工具函数：判断文本中是否包含 trigger（简单子串匹配，中文按字面量）
 */
function hasAny(text: string, triggers: string[]): boolean {
  for (const t of triggers) {
    if (text.includes(t)) return true
  }
  return false
}

/**
 * 规则版画像推断（本地，离线 fallback）
 * 维度：
 *  1) 显性关键词（画像自带的 keywords）
 *  2) 上下文近义补全（CONTEXT_RULES，解决"理解缺口"）
 *  3) 产品类型软偏好（软件→效率/创作/学生；硬件→数码/健身/旅行）
 *  4) 协同过滤补全（同分段其他高分画像的近邻）
 */
export function inferPersonasByRules(product: ProductInfo): Persona[] {
  const { type, name, desc } = product
  const text = `${name} ${desc}`.toLowerCase()

  const scores = PERSONAS.map((persona) => {
    let score = 0
    const reasons: string[] = []

    persona.keywords.forEach((kw) => {
      if (text.includes(kw)) {
        score += 2
        reasons.push(`关键词「${kw}」`)
      }
    })

    CONTEXT_RULES.forEach((rule) => {
      if (rule.personaId === persona.id && hasAny(text, rule.triggers)) {
        score += rule.weight
        if (rule.reason && rule.weight >= 1) reasons.push(rule.reason)
      }
    })

    if (type === 'software') {
      if (['career-anxiety', 'student', 'creator'].includes(persona.id)) {
        score += 0.5
      }
    } else {
      if (['tech-enthusiast', 'fitness', 'traveler'].includes(persona.id)) {
        score += 0.5
      }
    }

    return { persona, score, reasons }
  })

  const sortedScores = [...scores].sort((a, b) => b.score - a.score)
  const topIds = new Set(
    sortedScores.filter((s) => s.score >= 1.5).map((s) => s.persona.id),
  )
  const NEIGHBORS: Record<string, string[]> = {
    lonely: ['student', 'creator'],
    'career-anxiety': ['student', 'creator'],
    fitness: ['traveler', 'tech-enthusiast'],
    'tech-enthusiast': ['creator', 'fitness'],
    parenting: ['lonely'],
    student: ['career-anxiety', 'creator'],
    traveler: ['fitness', 'tech-enthusiast'],
    creator: ['tech-enthusiast', 'student', 'career-anxiety'],
  }
  scores.forEach((s) => {
    const neighbors = NEIGHBORS[s.persona.id] || []
    neighbors.forEach((nid) => {
      if (topIds.has(nid)) s.score += 0.3
    })
  })

  scores.sort((a, b) => b.score - a.score)
  const matched = scores.filter((s) => s.score > 0)
  const top = matched.slice(0, 3).map((s) => ({
    ...s.persona,
    reason: s.reasons[0],
  }))

  if (top.length === 0) {
    return scores.slice(0, 3).map((s) => ({ ...s.persona, reason: '默认回退' }))
  }
  return top
}

/**
 * AI 版画像推断：调用本地后端 → 后端再调 Moonshot KIMI
 * 返回 { personas, source: 'ai' }；失败时抛错
 */
export async function inferPersonasByAI(
  product: ProductInfo,
  signal?: AbortSignal,
): Promise<Persona[]> {
  const r = await fetch('/api/infer-personas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: product.name,
      desc: product.desc,
      type: product.type,
    }),
    signal,
  })
  if (!r.ok) {
    const detail = await r.text().catch(() => '')
    throw new Error(`AI 推断失败: HTTP ${r.status} ${detail.slice(0, 200)}`)
  }
  const data = await r.json()
  if (!data?.personas || !Array.isArray(data.personas)) {
    throw new Error('AI 返回格式异常')
  }
  return data.personas.map((p: { id: string; label: string; score: number; reason: string }) => {
    const def = PERSONAS.find((d) => d.id === p.id)
    if (!def) throw new Error(`AI 返回未知画像 id: ${p.id}`)
    return { ...def, reason: p.reason }
  })
}

/**
 * 统一入口：先调 AI（真实算法），失败/超时/离线时回退到本地规则
 * 返回带 source 字段的结果，便于 UI 展示当前用的是哪条路径
 */
export async function inferPersonas(
  product: ProductInfo,
  opts: { timeoutMs?: number } = {},
): Promise<InferResult> {
  const { timeoutMs = 8000 } = opts
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const personas = await inferPersonasByAI(product, controller.signal)
    clearTimeout(timer)
    return { personas, source: 'ai' }
  } catch (err) {
    clearTimeout(timer)
    const detail = err instanceof Error ? err.message : String(err)
    console.warn('[matcher] AI 推断失败，回退到规则:', detail)
    return { personas: inferPersonasByRules(product), source: 'rule', detail }
  }
}

/**
 * 计算匹配度（0-100），并返回匹配到的 Agent 数量
 * 同时返回分级标签：强 / 弱 / 潜在，便于中台可视化 & 时机触发
 */
export interface MatchResult {
  progress: number
  matchedAgents: number
  tier: 'strong' | 'weak' | 'potential'
  tierLabel: string
}

export function calculateMatch(
  inferred: Persona[],
  totalAgents: number = 12480,
): MatchResult {
  const baseProgress = 75 + inferred.length * 5
  const jitter = Math.random() * 12 - 6
  const progress = Math.min(99, Math.max(80, Math.round(baseProgress + jitter)))

  const personaCount = inferred.length || 1
  const hitRate = 0.018 + personaCount * 0.022 + Math.random() * 0.04
  const matched = Math.round(totalAgents * hitRate)

  let tier: MatchResult['tier'] = 'potential'
  let tierLabel = '潜在关注'
  if (progress >= 85) {
    tier = 'strong'
    tierLabel = '强匹配 · 可主动开口'
  } else if (progress >= 70) {
    tier = 'weak'
    tierLabel = '弱匹配 · 观察中'
  }

  return { progress, matchedAgents: matched, tier, tierLabel }
}

/**
 * 在推断画像中选第一个（主画像）做 Agent 推荐
 */
export function pickPrimaryPersona(personas: Persona[]): Persona {
  return personas[0] || PERSONAS[0]
}

/**
 * AI 实时生成 5 步推荐对话
 * 入参：product + primary persona
 * 失败抛错
 */
export async function generateRecommendationByAI(
  product: ProductInfo,
  primary: Persona,
  signal?: AbortSignal,
): Promise<ConversationFlow> {
  const r = await fetch('/api/generate-recommendation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: product.name,
      desc: product.desc,
      type: product.type,
      brand: product.brand,
      personaId: primary.id,
    }),
    signal,
  })
  if (!r.ok) {
    const detail = await r.text().catch(() => '')
    throw new Error(`AI 推荐生成失败: HTTP ${r.status} ${detail.slice(0, 200)}`)
  }
  const data = await r.json()
  const flow = data?.flow
  if (
    !flow ||
    typeof flow.greeting !== 'string' ||
    typeof flow.probe !== 'string' ||
    typeof flow.userResponse !== 'string' ||
    typeof flow.share !== 'string' ||
    typeof flow.closing !== 'string'
  ) {
    throw new Error('AI 返回格式异常')
  }
  return flow
}

/**
 * 统一入口：先调 AI 实时生成对话，失败/超时/离线时回退到本地模板
 * 返回带 source 字段的结果，便于 UI 展示当前用的是哪条路径
 */
export interface RecommendResult {
  flow: ConversationFlow
  source: 'ai' | 'rule'
  detail?: string
}

export async function generateRecommendation(
  product: ProductInfo,
  primary: Persona,
  opts: { timeoutMs?: number } = {},
): Promise<RecommendResult> {
  const { timeoutMs = 10000 } = opts
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const flow = await generateRecommendationByAI(product, primary, controller.signal)
    clearTimeout(timer)
    return { flow, source: 'ai' }
  } catch (err) {
    clearTimeout(timer)
    const detail = err instanceof Error ? err.message : String(err)
    console.warn('[matcher] AI 推荐生成失败，回退到模板:', detail)
    return { flow: getRandomRecommendation(primary.id), source: 'rule', detail }
  }
}
