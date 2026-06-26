// 漏斗与聚合分析（前端用，纯本地计算）
// 输入：产品列表 + 画像 -> 输出：每个画像的曝光/点击/转化/推荐数
import { PERSONAS, type PersonaId } from '../data/personas'
import type { Product } from '../data/products'
import { calculateOverallMatch } from './scoreCalculator'

export interface FunnelStep {
  label: string
  count: number
  /** 相对上一阶段的转化率 0-1 */
  rate: number
}

export interface PersonaFunnel {
  personaId: PersonaId
  label: string
  emoji: string
  color: string
  impressions: number
  clicks: number
  recommendations: number
  conversions: number
  ctr: number // click / impression
  cvr: number // conv / click
  share: number // 该画像的曝光 / 总曝光 0-1
  steps: FunnelStep[]
}

export interface OverallFunnel {
  total: {
    impressions: number
    clicks: number
    recommendations: number
    conversions: number
  }
  byPersona: PersonaFunnel[]
  trend: { date: string; recommendations: number }[] // 近 7 天
}

/**
 * 漏斗模型：
 * - 曝光 ≈ 主匹配分 × 月销量 × 90（基础流量系数）
 * - 点击 = 曝光 × CTR(画像基准 0.18-0.28)
 * - 推荐 = 点击 × recommendRate(画像基准 0.45-0.65)
 * - 转化 = 推荐 × CVR(画像基准 0.20-0.34)
 * 不同画像的 CTR/CVR 用 id 做 hash 抖动，避免全相同
 */
function hashBias(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i += 1) h = (h * 31 + id.charCodeAt(i)) | 0
  // 抖动到 0.85 - 1.15
  return 0.85 + (Math.abs(h) % 100) / 100 * 0.3
}

export function computeFunnel(products: Product[]): OverallFunnel {
  // 每个产品按主匹配画像分桶
  const byPersonaMap = new Map<PersonaId, { count: number; weight: number }>()
  for (const p of products) {
    const m = calculateOverallMatch(p)
    const pid = m.top.persona.id
    const cur = byPersonaMap.get(pid) || { count: 0, weight: 0 }
    cur.count += 1
    cur.weight += m.top.score / 100
    byPersonaMap.set(pid, cur)
  }

  let totalImpressions = 0
  let totalClicks = 0
  let totalRecs = 0
  let totalConv = 0

  const byPersona: PersonaFunnel[] = PERSONAS.map((persona) => {
    const bucket = byPersonaMap.get(persona.id) || { count: 0, weight: 0 }
    const bias = hashBias(persona.id)
    const impressions = Math.round((bucket.weight * 18000 + bucket.count * 1200) * bias)
    const ctr = 0.18 + bias * 0.10 // 0.18-0.31
    const clicks = Math.round(impressions * ctr)
    const recommendRate = 0.45 + bias * 0.20 // 0.45-0.65
    const recommendations = Math.round(clicks * recommendRate)
    const cvr = 0.20 + bias * 0.14 // 0.20-0.34
    const conversions = Math.round(recommendations * cvr)

    totalImpressions += impressions
    totalClicks += clicks
    totalRecs += recommendations
    totalConv += conversions

    return {
      personaId: persona.id,
      label: persona.label,
      emoji: persona.emoji,
      color: persona.color,
      impressions,
      clicks,
      recommendations,
      conversions,
      ctr,
      cvr,
      share: 0,
      steps: [
        { label: '曝光', count: impressions, rate: 1 },
        { label: '点击', count: clicks, rate: ctr },
        { label: '推荐', count: recommendations, rate: recommendRate },
        { label: '转化', count: conversions, rate: cvr },
      ],
    }
  })

  // 计算 share（曝光占比）
  for (const p of byPersona) {
    p.share = totalImpressions > 0 ? p.impressions / totalImpressions : 0
  }

  // 按曝光降序
  byPersona.sort((a, b) => b.impressions - a.impressions)

  // 近 7 天趋势（用总推荐数 + 画像的 hash 抖动生成伪数据）
  const trend: { date: string; recommendations: number }[] = []
  const baseRecs = totalRecs
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    const day = `${d.getMonth() + 1}/${d.getDate()}`
    const noise = 0.7 + ((i * 13) % 100) / 100 * 0.6 // 0.7-1.3
    trend.push({
      date: day,
      recommendations: Math.round((baseRecs / 7) * noise),
    })
  }

  return {
    total: {
      impressions: totalImpressions,
      clicks: totalClicks,
      recommendations: totalRecs,
      conversions: totalConv,
    },
    byPersona,
    trend,
  }
}

/**
 * 按画像聚合产品的曝光/转化 KPI
 */
export interface KpiCard {
  label: string
  value: string
  change: string
  flat: boolean
}

export function buildKpis(products: Product[]): KpiCard[] {
  const f = computeFunnel(products)
  const totalProducts = products.length
  const liveCount = products.filter((p) => p.status === 'live' || p.id.startsWith('uploaded-')).length
  return [
    { label: '总曝光量', value: f.total.impressions.toLocaleString(), change: '+12.5%', flat: false },
    {
      label: '推荐转化率',
      value: f.total.clicks > 0 ? `${((f.total.conversions / f.total.clicks) * 100).toFixed(1)}%` : '—',
      change: '+3.2%',
      flat: false,
    },
    {
      label: '推荐次数',
      value: f.total.recommendations.toLocaleString(),
      change: '+8.1%',
      flat: false,
    },
    { label: '产品上架数', value: String(totalProducts), change: liveCount > 0 ? `已上架 ${liveCount}` : '持平', flat: liveCount === 0 },
  ]
}
