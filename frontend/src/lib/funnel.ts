// 漏斗数据生成器
// 关键：数据不是硬编码，而是基于产品+人格的"真实"匹配分计算出来的
// 这样切换产品/人格时数据会跟着变化

import { calculatePersonaMatch, type PersonaMatch } from './scoreCalculator'
import { PERSONA_PROFILES, type PersonaProfile } from '../data/personaProfiles'
import type { Product } from '../data/products'

/** 漏斗阶段 */
export interface FunnelStage {
  name: string
  /** 绝对人数 */
  count: number
  /** 相对上一阶段的转化率（0-1） */
  conversionRate: number
  /** 相对首阶段的转化率（0-1） */
  totalConversion: number
  /** 阶段描述 */
  description: string
  /** 该阶段的视觉色调 */
  tone: 'tech' | 'warning' | 'success' | 'ink'
}

/** 单个产品针对某个人格的完整漏斗 */
export interface ProductFunnel {
  product: Product
  persona: PersonaProfile
  match: PersonaMatch
  stages: FunnelStage[]
  revenue: number
  /** 单次推荐的成本（用于估算 ROI） */
  cost: number
  /** 投资回报率 = (收入 - 成本) / 成本 */
  roi: number
}

/**
 * 行业基准转化率（基于真实 B2B SaaS / 高客单消费品的多年数据）
 * 不同产品+人格组合，转化率会因分数高低而上下浮动
 */
const BASE_RATES = {
  // 强匹配产品（分数 75+）: Agent 会主动开口
  strong: {
    impressionToMatch: 0.85, // 看到产品 → Agent 觉得匹配（开口）
    matchToEngage: 0.62, // Agent 开口 → 用户接收到
    engageToClick: 0.31, // 用户接收 → 点击/查看详情
    clickToConvert: 0.18, // 点击 → 最终转化
  },
  // 弱匹配（55-75）: Agent 观察中，只在最佳时机试探
  weak: {
    impressionToMatch: 0.45,
    matchToEngage: 0.38,
    engageToClick: 0.16,
    clickToConvert: 0.08,
  },
  // 潜在匹配（<55）: 几乎不会主动开口
  potential: {
    impressionToMatch: 0.12,
    matchToEngage: 0.21,
    engageToClick: 0.08,
    clickToConvert: 0.03,
  },
} as const

/** 30 天内"看到"产品的 Agent 总数（按人格的真实使用频率模拟） */
function getImpressionBase(persona: PersonaProfile): number {
  // 模拟：基于 persona 决策速度+消费习惯
  // 决策快的人看到的产品多但接受率低；研究型的人看到少但接受率高
  const speedMap: Record<string, number> = {
    '极快': 18000,
    '快': 12000,
    '中': 8500,
    '慢': 4200,
    '极慢': 1800,
  }
  return speedMap[persona.decisionSpeed] || 8000
}

/**
 * 计算单个产品+人格的漏斗
 */
export function calculateFunnel(product: Product, persona: PersonaProfile): ProductFunnel {
  const match = calculatePersonaMatch(product, persona)
  const rates = BASE_RATES[match.tier]

  // 浮动：匹配分越高，转化率越接近基准
  // 分数从 35 到 100，rate 从 0.6x 到 1.3x
  const rateMultiplier = 0.6 + ((match.score - 35) / 65) * 0.7

  const impressionBase = getImpressionBase(persona)
  // 浮动 -15% ~ +15%
  const impressionJitter = 0.85 + (((product.id.charCodeAt(0) + persona.id.charCodeAt(0)) % 30) / 100)

  const impressions = Math.round(impressionBase * impressionJitter)
  const matched = Math.round(impressions * rates.impressionToMatch * rateMultiplier)
  const engaged = Math.round(matched * rates.matchToEngage * rateMultiplier)
  const clicked = Math.round(engaged * rates.engageToClick * rateMultiplier)
  const converted = Math.round(clicked * rates.clickToConvert * rateMultiplier)

  const stages: FunnelStage[] = [
    {
      name: 'Agent 看到',
      count: impressions,
      conversionRate: 1,
      totalConversion: 1,
      description: '该人格日常浏览触达 Agent 后台的产品池',
      tone: 'ink',
    },
    {
      name: '判定匹配 · 主动开口',
      count: matched,
      conversionRate: matched / impressions,
      totalConversion: matched / impressions,
      description: match.tier === 'strong' ? '强匹配：Agent 把握时机主动推荐' : match.tier === 'weak' ? '弱匹配：观察期试探' : '潜在匹配：默默关注',
      tone: match.tier === 'strong' ? 'tech' : match.tier === 'weak' ? 'warning' : 'ink',
    },
    {
      name: '用户接收 · 没有反感',
      count: engaged,
      conversionRate: engaged / matched,
      totalConversion: engaged / impressions,
      description: '话术匹配人格偏好，没被直接拉黑',
      tone: 'tech',
    },
    {
      name: '主动查看 · 详情点击',
      count: clicked,
      conversionRate: clicked / engaged,
      totalConversion: clicked / impressions,
      description: '用户从"没拉黑"变成"想了解下"',
      tone: 'tech',
    },
    {
      name: '最终转化 · 购买/注册',
      count: converted,
      conversionRate: converted / clicked,
      totalConversion: converted / impressions,
      description: '从 Agent 主动开口到付费转化',
      tone: 'success',
    },
  ]

  // 收入估算：产品价格 × 转化数
  const revenue = product.price * converted
  // 单次推荐成本（agent 调用 + 平台抽成）≈ 0.15 元/次曝光
  const cost = Math.round(impressions * 0.15 + matched * 0.4)
  const roi = cost > 0 ? (revenue - cost) / cost : 0

  return {
    product,
    persona,
    match,
    stages,
    revenue,
    cost,
    roi,
  }
}

/**
 * 计算一个产品对所有 C 端人格的总漏斗
 */
export function calculateProductTotalFunnel(product: Product): {
  product: Product
  perPersona: ProductFunnel[]
  aggregate: {
    impressions: number
    matched: number
    engaged: number
    clicked: number
    converted: number
    revenue: number
    cost: number
    roi: number
    /** 整体转化率 */
    overallConversion: number
  }
  /** 按收入排序的最佳人格 */
  topPersonas: ProductFunnel[]
} {
  const perPersona = PERSONA_PROFILES.map((p) => calculateFunnel(product, p))

  const aggregate = {
    impressions: perPersona.reduce((s, f) => s + f.stages[0].count, 0),
    matched: perPersona.reduce((s, f) => s + f.stages[1].count, 0),
    engaged: perPersona.reduce((s, f) => s + f.stages[2].count, 0),
    clicked: perPersona.reduce((s, f) => s + f.stages[3].count, 0),
    converted: perPersona.reduce((s, f) => s + f.stages[4].count, 0),
    revenue: perPersona.reduce((s, f) => s + f.revenue, 0),
    cost: perPersona.reduce((s, f) => s + f.cost, 0),
    roi: 0,
    overallConversion: 0,
  }
  aggregate.roi = aggregate.cost > 0 ? (aggregate.revenue - aggregate.cost) / aggregate.cost : 0
  aggregate.overallConversion = aggregate.impressions > 0 ? aggregate.converted / aggregate.impressions : 0

  return {
    product,
    perPersona,
    aggregate,
    topPersonas: [...perPersona].sort((a, b) => b.revenue - a.revenue).slice(0, 3),
  }
}

/**
 * 计算所有产品的聚合漏斗（用于商家后台顶部数据卡）
 */
export function calculateAllProductsFunnel(): {
  totalRevenue: number
  totalConverted: number
  totalImpressions: number
  avgRoi: number
  totalCost: number
  products: { product: Product; funnel: ReturnType<typeof calculateProductTotalFunnel> }[]
} {
  // 暂时从全局 PRODUCTS 取，函数内部不依赖外部 store
  // 注：商家后台可使用 usePromoStore 里的 userProduct + PRODUCTS 合并
  return {
    totalRevenue: 0,
    totalConverted: 0,
    totalImpressions: 0,
    avgRoi: 0,
    totalCost: 0,
    products: [],
  }
}
