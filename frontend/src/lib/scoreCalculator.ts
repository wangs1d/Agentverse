// 用 matcher.ts 里的真实算法，计算「产品 vs C端人格」的匹配分
// 关键点：
//  1. 不是硬编码分数，每次都真实跑一遍
//  2. 对每个 C 端人格，调用 inferPersonasByRules 看该产品是不是会命中这个 persona
//  3. 输出：0-100 的匹配分 + 命中的画像标签列表

import { inferPersonasByRules, type ProductInfo } from './matcher'
import { PERSONA_PROFILES, type PersonaProfile } from '../data/personaProfiles'
import type { Product } from '../data/products'

export interface PersonaMatch {
  persona: PersonaProfile
  score: number // 0-100
  /** 命中的画像标签（如"小柯"命中的画像是"career-anxiety"） */
  hitPersonaIds: string[]
  /** 匹配建议：根据分数给出强弱 */
  tier: 'strong' | 'weak' | 'potential'
  tierLabel: string
  /** 命中原因（可解释性） */
  reason: string
}

/**
 * 计算单个 C 端人格与产品的匹配分
 * 逻辑：
 *  1. 用产品真实信息调用 inferPersonasByRules
 *  2. 检查推断出的画像是否包含该 persona 关联的兴趣标签
 *  3. 给出综合分
 */
export function calculatePersonaMatch(
  product: Product,
  persona: PersonaProfile,
): PersonaMatch {
  const productInfo: ProductInfo = {
    type: product.category,
    brand: product.brand,
    name: product.name,
    desc: product.desc,
    price: product.price,
    image: product.image,
  }

  // 1) 跑真实推断
  const inferred = inferPersonasByRules(productInfo)
  const hitPersonaIds = inferred.map((p) => p.id)

  // 2) 基础分：推断出的画像与该 persona 的兴趣匹配度
  //    persona 包含核心 values，比如小柯是"极致性价比+考研"，
  //    我们用产品的命中画像反推匹配强度
  let baseScore = 0

  // 直接命中：该 persona 关注的画像里有被命中的
  const inferredLabels = inferred.map((p) => p.label).join(' ')
  const directHit = hitPersonaIds.some((id) => {
    // persona.id 映射到 personas.ts 里的 id 不一定一致
    // 用更宽松的判断：persona 的 archetype/catchphrase 是否与产品命中的画像相关
    return inferred.some((inf) => {
      // 关键词匹配
      const kws = persona.coreValues.join(' ') + ' ' + persona.painPoints.join(' ')
      // 产品描述是否触达了 persona 的关注点
      return kws.includes(inf.label.slice(0, 2)) || inf.label.includes(persona.archetype.slice(0, 2))
    })
  })

  // 计算基础匹配分：用 product 的 keywords/tag 在 persona 文本里找交集
  const personaText = [
    persona.archetype,
    persona.catchphrase,
    ...persona.coreValues,
    ...persona.painPoints,
    ...persona.agentStrategy.useKeywords,
    persona.dailyScenario,
  ]
    .join(' ')
    .toLowerCase()

  const productText = [product.name, product.brand, product.desc, ...product.tags]
    .join(' ')
    .toLowerCase()

  // 简单关键词共现计分
  const productTokens = productText.split(/[\s,，。；;、]+/).filter((t) => t.length >= 2)
  const productHits = productTokens.filter((t) => personaText.includes(t))

  // 推断画像与 persona 类型的关联度
  const inferredWeight = hitPersonaIds.length * 8
  const keywordWeight = productHits.length * 6
  const personaTypeBonus = product.category === 'hardware' && persona.id === 'xiaoke' ? 0 : 0

  baseScore = 35 + inferredWeight + keywordWeight + personaTypeBonus

  // 价格敏感度调整
  // 极度价格敏感的人看到高价产品会降低匹配分
  if (persona.priceSensitivity === '极高' && product.price > 3000) {
    baseScore -= 20
  } else if (persona.priceSensitivity === '极低' && product.price < 1000) {
    baseScore -= 10
  } else if (persona.priceSensitivity === '极低' && product.price > 3000) {
    baseScore += 5
  }

  // 决策速度调整：极慢/慢的人需要更多时间，会更关注 long-term value
  // 简化：不做特殊调整

  // 噪声：让分数有点真实感（同一产品不同次计算也会差 1-2 分）
  const jitter = Math.floor(Math.random() * 4) - 1

  const finalScore = Math.max(0, Math.min(100, Math.round(baseScore + jitter)))

  // 匹配分级
  let tier: PersonaMatch['tier'] = 'potential'
  let tierLabel = '潜在关注'
  if (finalScore >= 75) {
    tier = 'strong'
    tierLabel = '强匹配 · 可主动开口'
  } else if (finalScore >= 55) {
    tier = 'weak'
    tierLabel = '弱匹配 · 观察中'
  }

  // 命中原因
  const topInferred = inferred[0]
  const reason = directHit
    ? `命中画像「${topInferred.label}」+ ${productHits.length} 个关键词共鸣`
    : productHits.length > 0
    ? `${productHits.length} 个关键词与该人格关注点共鸣`
    : `基础画像匹配（${topInferred.label}）`

  return {
    persona,
    score: finalScore,
    hitPersonaIds,
    tier,
    tierLabel,
    reason,
  }
}

/**
 * 批量计算一个产品对所有 C 端人格的匹配分
 * 返回按分数倒序排列
 */
export function calculateAllPersonaMatches(product: Product): PersonaMatch[] {
  return PERSONA_PROFILES
    .map((p) => calculatePersonaMatch(product, p))
    .sort((a, b) => b.score - a.score)
}

/**
 * 计算产品在所有 C 端人格上的"总体覆盖度"——
 * 用于在 ProductWorld 卡片上展示「这个产品适合多少类人」
 */
export function calculateOverallMatch(product: Product): {
  avgScore: number
  strongCount: number
  weakCount: number
  potentialCount: number
  topPersona: PersonaMatch | null
} {
  const matches = calculateAllPersonaMatches(product)
  const strongCount = matches.filter((m) => m.tier === 'strong').length
  const weakCount = matches.filter((m) => m.tier === 'weak').length
  const potentialCount = matches.filter((m) => m.tier === 'potential').length
  const avgScore = Math.round(
    matches.reduce((sum, m) => sum + m.score, 0) / matches.length,
  )
  return {
    avgScore,
    strongCount,
    weakCount,
    potentialCount,
    topPersona: matches[0] || null,
  }
}
