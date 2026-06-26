// 产品 - 画像匹配度计算（前端用，纯本地计算）
// 不需要调后端；基于 persona.keywords 命中 + 类目加权产出 0-100 的分数
import { PERSONAS, PERSONA_BY_ID, type PersonaId, type Persona } from '../data/personas'
import type { Product } from '../data/products'

export interface PersonaMatch {
  persona: Persona
  score: number // 0-100
  hits: string[] // 命中的关键词
}

export interface OverallMatch {
  /** 每个画像的匹配分（按 score 降序） */
  breakdown: PersonaMatch[]
  /** 8 个画像平均分（用于卡片角标） */
  avgScore: number
  /** 主匹配画像（分数最高） */
  top: PersonaMatch
  /** 浓度（最高分 - 平均分）：体现"专一"程度 */
  concentration: number
}

function calcForProduct(p: Product): OverallMatch {
  const text = `${p.name} ${p.desc} ${p.brand}`.toLowerCase()
  const breakdown: PersonaMatch[] = PERSONAS.map((persona) => {
    const hits: string[] = []
    for (const kw of persona.keywords) {
      if (text.includes(kw.toLowerCase())) hits.push(kw)
    }
    // 关键词命中权重 8 分/个，封顶 80
    let score = Math.min(80, hits.length * 8)
    // 软加成：主画像 hint 命中 +12
    if (p.primaryPersonaHint === persona.id) score += 12
    // 次画像 hint +6
    if (p.secondaryPersonaHint?.includes(persona.id)) score += 6
    // 软打底，避免全 0
    score = Math.max(score, 12)
    return { persona, score, hits }
  })
  breakdown.sort((a, b) => b.score - a.score)
  const avg = breakdown.reduce((sum, m) => sum + m.score, 0) / breakdown.length
  const top = breakdown[0]
  return {
    breakdown,
    avgScore: Math.round(avg),
    top,
    concentration: Math.round(top.score - avg),
  }
}

export function calculateOverallMatch(p: Product): OverallMatch {
  return calcForProduct(p)
}

/**
 * 快速取出某画像对该产品的分
 */
export function scoreFor(p: Product, personaId: PersonaId): number {
  const m = calcForProduct(p)
  const found = m.breakdown.find((x) => x.persona.id === personaId)
  return found?.score ?? 0
}

export { PERSONA_BY_ID }
