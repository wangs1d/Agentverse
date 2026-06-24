// 用户画像数据
export interface Persona {
  id: string
  label: string
  emoji: string // 用作视觉锚点，UI 中以 lucide 图标为主
  description: string
  keywords: string[] // 用于产品画像推断
  reason?: string // AI 推断时的解释（可选）
}

export const PERSONAS: Persona[] = [
  {
    id: 'lonely',
    label: '孤独 / 缺少陪伴',
    emoji: '💭',
    description: '独居青年、异地恋、空巢人群',
    keywords: ['陪伴', '聊天', '情感', '孤独', '智能', '机器人', '宠物', '倾诉', '社交'],
  },
  {
    id: 'career-anxiety',
    label: '职场焦虑',
    emoji: '💼',
    description: '高压职场人、加班族、初入职场者',
    keywords: ['效率', '专注', '时间', '管理', '健康', '压力', '睡眠', '工作', '提升'],
  },
  {
    id: 'fitness',
    label: '健身爱好者',
    emoji: '🏋',
    description: '健身房用户、跑步爱好者、健康管理人群',
    keywords: ['运动', '健身', '跑步', '健康', '心率', '手表', '穿戴', '体脂', '卡路里'],
  },
  {
    id: 'tech-enthusiast',
    label: '数码发烧友',
    emoji: '⚙',
    description: '3C 极客、新品尝鲜者、效率工具控',
    keywords: ['数码', '极客', '新品', '旗舰', '性能', '黑科技', '智能', '极客', '效率'],
  },
  {
    id: 'parenting',
    label: '母婴人群',
    emoji: '👶',
    description: '新手父母、孕产期妈妈、幼儿家庭',
    keywords: ['母婴', '宝宝', '育儿', '成长', '安全', '早教', '营养', '儿童', '亲子'],
  },
  {
    id: 'student',
    label: '学生',
    emoji: '📚',
    description: 'K12 至大学生群体、考研考公人',
    keywords: ['学习', '学生', '考研', '教育', '笔记', '专注', '语言', '阅读', '效率'],
  },
  {
    id: 'traveler',
    label: '旅行者',
    emoji: '✈',
    description: '自由行爱好者、户外人群、商务出差',
    keywords: ['旅行', '户外', '便携', '续航', '防水', '导航', '背包', '差旅', '摄影'],
  },
  {
    id: 'creator',
    label: '创作者',
    emoji: '🎨',
    description: '设计师、视频创作者、自由职业者',
    keywords: ['创作', '设计', '视频', '剪辑', '内容', '灵感', '笔记', '协作', '效率'],
  },
]
