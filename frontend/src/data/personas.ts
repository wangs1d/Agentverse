// 用户画像数据 - 8 个 C 端画像（与 server/index.mjs 的 PERSONA_DEFS 对齐）
export type PersonaId =
  | 'lonely'
  | 'career-anxiety'
  | 'fitness'
  | 'tech-enthusiast'
  | 'parenting'
  | 'student'
  | 'traveler'
  | 'creator'

export interface Persona {
  id: PersonaId
  label: string
  description: string
  emoji: string
  keywords: string[] // 用于产品描述关键词匹配（规则兜底）
  color: string // UI 中画像标签的背景色
  reason?: string // AI 推断时的解释
  score?: number // AI 推断置信度 0-1
}

export const PERSONAS: Persona[] = [
  {
    id: 'lonely',
    label: '孤独 / 缺少陪伴',
    description: '独居青年、异地恋、空巢人群，需要情感陪伴和倾诉对象',
    emoji: '☕',
    keywords: ['陪伴', '聊天', '倾诉', '情感', '孤独', '独居', '空巢', '记住', '日记', '日记本', '智能音箱', '陪伴机器人', 'AI 陪伴', '助眠', '哄睡'],
    color: '#9b87f5',
  },
  {
    id: 'career-anxiety',
    label: '职场焦虑',
    description: '高压职场人、加班族、初入职场者，关注效率、专注、缓解压力',
    emoji: '🧘',
    keywords: ['会议', '番茄钟', '专注', '效率', '办公', '职场', '加班', '通勤', '缓解', '冥想', '日程', '待办', 'OKR', 'KPI', '白领', '提效'],
    color: '#2e8dff',
  },
  {
    id: 'fitness',
    label: '健身爱好者',
    description: '健身房用户、跑步爱好者、健康管理人群',
    emoji: '🏃',
    keywords: ['健身', '跑步', '撸铁', '体脂', '跑姿', '训练', '心率', '运动', '跑步机', '瑜伽', '马拉松', '恢复', '蛋白质'],
    color: '#30d158',
  },
  {
    id: 'tech-enthusiast',
    label: '数码发烧友',
    description: '3C 极客、新品尝鲜者、效率工具控，关注参数、跑分、堆料',
    emoji: '🎧',
    keywords: ['4K', '120Hz', 'NPU', '跑分', '拆机', '旗舰', '芯片', '数码', '极客', '3C', '新品', '首发', '堆料', 'HiFi', '降噪', '耳机', '智能手表'],
    color: '#ff9f0a',
  },
  {
    id: 'parenting',
    label: '母婴人群',
    description: '新手父母、孕产期妈妈、幼儿家庭，关注育儿、早教、安全',
    emoji: '🍼',
    keywords: ['哄睡', '夜醒', '婴儿', '胎心', '孕产', '育儿', '早教', '幼儿园', '儿童', '母婴', '孕妇', '宝宝'],
    color: '#ff7eb6',
  },
  {
    id: 'student',
    label: '学生',
    description: 'K12 至大学生群体、考研考公人，关注学习、笔记、效率',
    emoji: '📚',
    keywords: ['考研', '考公', '错题', '墨水屏', '学习', '笔记', '番茄学习', '学生', '大学', 'K12', '高中', '初中', '小学', '留学'],
    color: '#5ac8fa',
  },
  {
    id: 'traveler',
    label: '旅行者',
    description: '自由行爱好者、户外人群、商务出差，关注便携、续航、导航',
    emoji: '🧭',
    keywords: ['进山', '自驾', '户外', '防水', '导航', '长续航', '便携', '差旅', '出差', '旅行', '露营', '背包', '登机', '充电宝'],
    color: '#64d2ff',
  },
  {
    id: 'creator',
    label: '创作者',
    description: '设计师、视频创作者、自由职业者，关注创作、剪辑、灵感',
    emoji: '🎬',
    keywords: ['色准', '调色', '录播客', '剪片', '剪辑', '创作', '协作', '白板', '设计师', '自由职业', '视频', '拍照', '修图', '插画', '画板'],
    color: '#bf5af2',
  },
]

export const PERSONA_BY_ID: Record<PersonaId, Persona> = PERSONAS.reduce(
  (acc, p) => {
    acc[p.id] = p
    return acc
  },
  {} as Record<PersonaId, Persona>,
)
