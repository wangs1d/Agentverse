// AI 画像推断 + 规则兜底
// 调用后端 /api/infer-personas；失败/超时则使用本地关键词规则推断
import { PERSONAS, type Persona, type PersonaId } from '../data/personas'

export type InferSource = 'ai' | 'rule'

export interface InferResult {
  personas: Persona[] // 已合并基础画像字段 + 推断的 reason/score
  source: InferSource
  detail?: string // 失败时附带原因
}

export interface ProductInfo {
  type: 'software' | 'hardware'
  brand: string
  name: string
  desc: string
  price: number
  image?: string
}

export interface InferOptions {
  /** AI 调用超时（毫秒），默认 8s */
  timeoutMs?: number
  /** 后端 baseURL（默认空，走 vite proxy /api） */
  baseURL?: string
}

/**
 * 调后端 AI 推断；失败/超时返回 null
 */
async function callAiInfer(
  info: ProductInfo,
  opts: InferOptions,
): Promise<InferResult | null> {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), opts.timeoutMs ?? 8000)
  try {
    const r = await fetch(`${opts.baseURL ?? ''}/api/infer-personas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: info.name,
        desc: info.desc,
        type: info.type,
        brand: info.brand,
      }),
      signal: ctrl.signal,
    })
    clearTimeout(t)
    if (!r.ok) return null
    const data = await r.json()
    if (!data?.personas || !Array.isArray(data.personas)) return null
    const validIds = new Set(PERSONAS.map((p) => p.id))
    const personas: Persona[] = data.personas
      .filter((p: { id: string }) => validIds.has(p.id as PersonaId))
      .map((p: { id: PersonaId; score: number; reason: string }) => {
        const def = PERSONAS.find((d) => d.id === p.id)!
        return {
          ...def,
          reason: p.reason || def.description.slice(0, 30),
          score: typeof p.score === 'number' ? p.score : 0.5,
        }
      })
    if (personas.length === 0) return null
    return { personas, source: 'ai' }
  } catch {
    clearTimeout(t)
    return null
  }
}

/**
 * 规则兜底：按 persona.keywords 命中数 + 类别加权打分
 */
function ruleInfer(info: ProductInfo): InferResult {
  const text = `${info.name} ${info.desc} ${info.brand}`.toLowerCase()
  const scores = PERSONAS.map((p) => {
    let hits = 0
    for (const kw of p.keywords) {
      if (text.includes(kw.toLowerCase())) hits += 1
    }
    // 软件 + 效率类画像轻微加权
    const boost = info.type === 'software' && p.id === 'career-anxiety' ? 1.5 : 0
    return { id: p.id, label: p.label, hits, boost, persona: p }
  })

  const max = Math.max(...scores.map((s) => s.hits + s.boost), 1)
  const enriched = scores
    .map((s) => ({
      ...s.persona,
      score: Math.min(0.9, (s.hits + s.boost) / max * 0.85 + 0.1),
      reason:
        s.hits > 0
          ? `描述命中关键词「${s.persona.keywords.find((k) => text.includes(k.toLowerCase()))}」`
          : '规则兜底：产品定位与该画像场景相符',
    }))
    .filter((p) => (p.score ?? 0) >= 0.25)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, 3)

  return {
    personas: enriched.length > 0 ? enriched : [PERSONAS[0], PERSONAS[1]].map((p) => ({ ...p, score: 0.4 })),
    source: 'rule',
    detail: 'AI 服务暂不可用，使用本地关键词规则推断',
  }
}

/**
 * 公共入口：先尝试 AI，失败则规则兜底
 */
export async function inferPersonas(
  info: ProductInfo,
  opts: InferOptions = {},
): Promise<InferResult> {
  const ai = await callAiInfer(info, opts)
  if (ai) return ai
  return ruleInfer(info)
}
