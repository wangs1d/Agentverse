// 产品数据 - 8 款示例产品
// 这些是内置的"产品库"，用户通过 ProductUpload 提交的产品会并入这个列表
export type ProductCategory = 'software' | 'hardware'

export interface Product {
  id: string
  brand: string
  name: string
  category: ProductCategory
  price: number
  priceUnit: string
  desc: string
  image: string
  tags: string[]
  primaryPersonaHint?: string // 主匹配画像 id（用于 analytics 标注）
  secondaryPersonaHint?: string[] // 次匹配画像 id 列表
  monthlySales: number
  rating: number
  status?: 'live' | 'pending' // 已上架 / 审核中
  merchantNote?: string
  createdAt: number // 时间戳，用于排序
}

// 软件默认图：SaaS dashboard
const IMG_SAAS =
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20minimal%20dark%20mode%20SaaS%20dashboard%20UI%20design%20gradient%20blue%20glow&image_size=square_hd'
// 硬件默认图：可穿戴/智能设备
const IMG_HW =
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=premium%20smart%20wearable%20device%20product%20photo%20dark%20studio%20lighting%20sleek%20metallic&image_size=square_hd'

export const PRODUCTS: Product[] = [
  {
    id: 'p-aichat',
    brand: '灵犀智能',
    name: 'AIChat 智能客服机器人',
    category: 'software',
    price: 199,
    priceUnit: '/月',
    desc: '7×24 小时企业级 AI 客服，自动识别客户意图、记住对话上下文、辅助人工坐席提效。',
    image: IMG_SAAS,
    tags: ['客服', 'AI', '对话', '效率'],
    primaryPersonaHint: 'career-anxiety',
    secondaryPersonaHint: ['tech-enthusiast'],
    monthlySales: 1842,
    rating: 4.7,
    status: 'live',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
  },
  {
    id: 'p-smartoffice',
    brand: '云智科技',
    name: 'SmartOffice 智能办公套件',
    category: 'software',
    price: 99,
    priceUnit: '/月',
    desc: '会议纪要自动整理、番茄钟专注模式、跨设备日程同步，把一天的高压工作理顺。',
    image: IMG_SAAS,
    tags: ['办公', '会议纪要', '番茄钟'],
    primaryPersonaHint: 'career-anxiety',
    secondaryPersonaHint: ['student', 'creator'],
    monthlySales: 1568,
    rating: 4.6,
    status: 'live',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 25,
  },
  {
    id: 'p-marketai',
    brand: '增长引擎',
    name: 'MarketAI 智能营销引擎',
    category: 'software',
    price: 899,
    priceUnit: '/月',
    desc: '基于大模型的内容生成、A/B 实验与人群画像分析，帮市场团队少加班、多出活。',
    image: IMG_SAAS,
    tags: ['营销', 'A/B 测试', '画像分析'],
    primaryPersonaHint: 'career-anxiety',
    secondaryPersonaHint: ['tech-enthusiast', 'creator'],
    monthlySales: 2234,
    rating: 4.8,
    status: 'live',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 22,
  },
  {
    id: 'p-datainsight',
    brand: '数澜科技',
    name: 'DataInsight 数据分析平台',
    category: 'software',
    price: 599,
    priceUnit: '/月',
    desc: '拖拽式 BI + 一键跑大模型洞察，海量指标秒级响应，数据新人也能玩转看板。',
    image: IMG_SAAS,
    tags: ['BI', '数据分析', '看板'],
    primaryPersonaHint: 'tech-enthusiast',
    secondaryPersonaHint: ['career-anxiety'],
    monthlySales: 1987,
    rating: 4.5,
    status: 'live',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 18,
  },
  {
    id: 'p-secugate',
    brand: '安恒信息',
    name: 'SecuGate 企业安全网关',
    category: 'software',
    price: 2999,
    priceUnit: '/年',
    desc: '面向中大型企业的零信任安全网关，统一身份、流量审计、终端合规一站式管理。',
    image: IMG_SAAS,
    tags: ['安全', '零信任', '网关'],
    primaryPersonaHint: 'career-anxiety',
    secondaryPersonaHint: ['tech-enthusiast'],
    monthlySales: 1256,
    rating: 4.4,
    status: 'pending',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 12,
  },
  {
    id: 'p-supplychain',
    brand: '链通科技',
    name: 'SupplyChain 云供应链',
    category: 'software',
    price: 1999,
    priceUnit: '/月',
    desc: '一站式云供应链协同：采购、库存、订单、结算全程可视，管理者决策有据可依。',
    image: IMG_SAAS,
    tags: ['供应链', '管理', '协同'],
    primaryPersonaHint: 'career-anxiety',
    secondaryPersonaHint: ['tech-enthusiast'],
    monthlySales: 1623,
    rating: 4.3,
    status: 'live',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 10,
  },
  {
    id: 'p-aura',
    brand: '温暖科技',
    name: 'AURA 陪伴机器人',
    category: 'hardware',
    price: 1499,
    priceUnit: '/台',
    desc: '会记住你说的话、会在你深夜回家时开口问候的情感陪伴机器人，硬件级的"家里人"。',
    image: IMG_HW,
    tags: ['陪伴', '情感', 'AI 音箱'],
    primaryPersonaHint: 'lonely',
    secondaryPersonaHint: ['parenting', 'student'],
    monthlySales: 984,
    rating: 4.6,
    status: 'live',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
  },
  {
    id: 'p-watchpro',
    brand: 'Aether',
    name: 'Watch Pro 智能运动手表',
    category: 'hardware',
    price: 2299,
    priceUnit: '/台',
    desc: '钛合金机身、14 天续航、专业跑姿分析与 4K AMOLED 显示屏，户外与城市都拿得出手。',
    image: IMG_HW,
    tags: ['智能手表', '跑步', '钛合金'],
    primaryPersonaHint: 'fitness',
    secondaryPersonaHint: ['tech-enthusiast', 'traveler'],
    monthlySales: 1351,
    rating: 4.7,
    status: 'live',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
  },
]
