// 真实产品库 — 用于「产品世界」页面与「Agent推荐」体验
// 每个产品都有完整的 B 端信息（品牌/名称/描述/价格/分类），
// AI 匹配分会在页面打开时实时调用 matcher.ts 计算（不硬编码）

export type ProductCategory = 'software' | 'hardware'

export interface Product {
  id: string
  brand: string
  name: string
  category: ProductCategory
  price: number
  priceUnit: string
  desc: string
  // 真实场景下应该用 CDN 图；为保持 demo 纯前端可运行，这里用占位图
  image: string
  // 标签云（用于在卡片上显示卖点）
  tags: string[]
  // 该产品的「真实」主推人群（用于在 UI 上展示 AI 推断是否一致）
  primaryPersonaHint?: string
  // 模拟月销量（让 B 端商家看到「即使有数据」的真实感）
  monthlySales: number
  rating: number
  // 商家简短备注（模拟商家后台的数据）
  merchantNote?: string
}

export const PRODUCTS: Product[] = [
  // ============ 1. AI 智能客服 ============
  {
    id: 'aichat-bot',
    brand: '灵犀智能',
    name: 'AIChat 智能客服机器人',
    category: 'software',
    price: 1999,
    priceUnit: '/坐席/月',
    desc: '多轮对话、情感识别、知识库自学习的企业级客服 AI。解决 80% 重复咨询，夜间不掉线，让客服团队专注高价值客户。',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20minimal%20dark%20mode%20SaaS%20chatbot%20dashboard%20UI%20design%20blue%20gradient%20glow%20futuristic&image_size=square_hd',
    tags: ['NLP', '情感识别', '知识库自学习', '7×24', '企业级'],
    primaryPersonaHint: '志远（杭州奶爸）——企业采购决策者',
    monthlySales: 2100,
    rating: 4.9,
    merchantNote: '目标是中大型企业客服部门',
  },

  // ============ 2. 智能办公套件 ============
  {
    id: 'smartoffice',
    brand: '云智科技',
    name: 'SmartOffice 智能办公套件',
    category: 'software',
    price: 2999,
    priceUnit: '/人/年',
    desc: 'AI 驱动的企业协作平台。文档、会议、项目管理三件套打通，AI 自动生成会议纪要、待办与周报，让 30 人团队少开 50% 的会。',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=futuristic%20AI%20productivity%20office%20suite%20app%20interface%20dark%20UI%20blue%20accent%20modern%20minimal&image_size=square_hd',
    tags: ['AI纪要', '协作', '项目管理', '效率工具'],
    primaryPersonaHint: '志远（杭州奶爸）——效率优先的决策者',
    monthlySales: 1280,
    rating: 4.8,
    merchantNote: '主打新一线城市的中小企业团队',
  },

  // ============ 3. 智能营销引擎 ============
  {
    id: 'marketai',
    brand: '增长引擎',
    name: 'MarketAI 智能营销引擎',
    category: 'software',
    price: 3999,
    priceUnit: '/月',
    desc: 'AI 驱动的全渠道营销自动化。基于用户行为实时生成个性化文案与投放策略，ROI 提升显著。适合追求增长的企业。',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20AI%20marketing%20automation%20platform%20dark%20dashboard%20analytics%20blue%20glow%20tech%20aesthetic&image_size=square_hd',
    tags: ['营销自动化', '用户画像', '投放', 'ROI'],
    primaryPersonaHint: 'Vivian（投行VP）——高效精英',
    monthlySales: 1750,
    rating: 4.8,
    merchantNote: '付费能力强的中大型企业',
  },

  // ============ 4. 数据分析平台 ============
  {
    id: 'datainsight',
    brand: '数澜科技',
    name: 'DataInsight 数据分析平台',
    category: 'software',
    price: 5999,
    priceUnit: '/企业/月',
    desc: '实时数据可视化与智能洞察，支持多源数据接入。AI 自动发现异常、生成分析报告，让数据驱动决策变得简单。',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=sleek%20data%20analytics%20BI%20platform%20dashboard%20dark%20UI%20charts%20visualization%20blue%20accent&image_size=square_hd',
    tags: ['BI', '数据可视化', '智能洞察', '多源接入'],
    primaryPersonaHint: '林楠（大厂算法）——参数党',
    monthlySales: 860,
    rating: 4.7,
    merchantNote: '中大型企业数据团队',
  },

  // ============ 5. 企业安全网关 ============
  {
    id: 'secugate',
    brand: '安恒信息',
    name: 'SecuGate 企业安全网关',
    category: 'software',
    price: 12999,
    priceUnit: '/企业/年',
    desc: '零信任架构、AI 威胁检测、全链路数据加密。AI 威胁检测准确率 99.7%，金融/政府级别安全合规刚需。',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=enterprise%20cybersecurity%20gateway%20zero%20trust%20dark%20UI%20blue%20shield%20tech%20aesthetic&image_size=square_hd',
    tags: ['零信任', 'AI威胁检测', '数据加密', '合规'],
    primaryPersonaHint: '老陈（县城老板）——撑场面',
    monthlySales: 420,
    rating: 4.7,
    merchantNote: '金融/政府/大型企业安全部门',
  },

  // ============ 6. 云供应链 ============
  {
    id: 'supplychain',
    brand: '链通科技',
    name: 'SupplyChain 云供应链',
    category: 'software',
    price: 8999,
    priceUnit: '/企业/月',
    desc: '端到端供应链可视化，智能预测库存与物流优化。AI 预测算法精准，让库存周转率提升 35%。',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20cloud%20supply%20chain%20platform%20logistics%20dashboard%20dark%20UI%20blue%20analytics&image_size=square_hd',
    tags: ['ERP', '物流', '库存预测', '可视化'],
    primaryPersonaHint: '老陈（县城老板）——生意人',
    monthlySales: 540,
    rating: 4.6,
    merchantNote: '制造/零售/物流企业',
  },

  // ============ 7. 智能陪伴机器人（硬件）============
  {
    id: 'aurabot',
    brand: '温暖科技',
    name: 'AURA 陪伴机器人',
    category: 'hardware',
    price: 2499,
    priceUnit: '/台',
    desc: '能记住你随口提过的小事，半夜睡不着也能陪你说两句。比养猫省心，比找人聊天自在。情感算法识别 7 种情绪状态。',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20warm%20AI%20companion%20robot%20product%20photo%20dark%20studio%20lighting%20soft%20glow%20minimal&image_size=square_hd',
    tags: ['陪伴', '情感识别', '智能对话', '深夜陪伴'],
    primaryPersonaHint: '周阿姨（退休教师）——怕孤独',
    monthlySales: 1800,
    rating: 4.8,
    merchantNote: '独居青年、异地恋、空巢人群',
  },

  // ============ 8. 智能运动手表（硬件）============
  {
    id: 'runwatch',
    brand: 'Aether',
    name: 'Watch Pro 智能运动手表',
    category: 'hardware',
    price: 1899,
    priceUnit: '/台',
    desc: '专业跑步/健身数据监测。NPU 实时处理心率、血氧、跑步姿态，5ATM 防水，14 天续航。跑圈人验证过的数据维度。',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=premium%20smart%20sports%20watch%20product%20photo%20dark%20studio%20lighting%20sleek%20metallic%20blue%20accent&image_size=square_hd',
    tags: ['运动', '心率', '跑步', '防水', '长续航'],
    primaryPersonaHint: '小柯（三线考研）——性价比党',
    monthlySales: 3200,
    rating: 4.7,
    merchantNote: '健身爱好者、跑步圈、户外人群',
  },
]

/**
 * 工具函数：根据 id 获取产品
 */
export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id)
}

/**
 * 工具函数：按分类筛选
 */
export function getProductsByCategory(category: ProductCategory): Product[] {
  return PRODUCTS.filter((p) => p.category === category)
}
