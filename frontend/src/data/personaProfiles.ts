// 差异化人格画像库 —— 8 个真实感人格
// 区别于 personas.ts（按"需求/兴趣"分类），这里按"完整人格"建模
// 维度：人口属性 / 价值观 / 决策模式 / 沟通偏好 / 内部矛盾 / Agent 应对策略
//
// 关键设计：每个人格至少 1 个"内部矛盾"——这是人格真实感的核心来源
// Agent 应对策略是可直接执行的话术级指引，不是抽象描述

export interface PersonaProfile {
  id: string
  // === 基础人口属性 ===
  name: string
  age: number
  gender: 'M' | 'F'
  city: string
  cityTier: '一线' | '新一线' | '二线' | '三线' | '县城'
  occupation: string
  lifeStage: string
  monthlyIncome: string // 区间描述

  // === 人格原型 ===
  archetype: string // 一句话人格原型，如"精打细算的焦虑型完美主义者"
  catchphrase: string // 口头禅 / 自我描述

  // === 价值观与决策 ===
  coreValues: string[] // 真正在意什么
  decisionStyle: string // 决策模式（冲动/分析/依赖他人/延迟型）
  decisionSpeed: '极快' | '快' | '中' | '慢' | '极慢'
  priceSensitivity: '极高' | '高' | '中' | '低' | '极低' // 价格敏感度
  trustedSources: string[] // 信任的信息来源
  trustBrands: '极高' | '高' | '中' | '低' // 对品牌的好感
  riskTolerance: '极高' | '高' | '中' | '低' | '极低'

  // === 沟通偏好 ===
  communicationStyle: string
  prefersTone: string[]
  dislikesTone: string[]
  infoDensity: '极简' | '精简' | '中等' | '高密度' | '极高密度'

  // === 内部矛盾（真实感核心）===
  internalContradiction: string

  // === 生活场景 ===
  painPoints: string[] // 日常痛点
  dailyScenario: string // 一个典型生活片段

  // === Agent 应对策略（可执行）===
  agentStrategy: {
    openingTactic: string // 怎么开场
    persuasionPath: string // 推荐路径（先说什么后说什么）
    useKeywords: string[] // 该用的词
    avoidKeywords: string[] // 千万不能用的词
    socialProofType: string // 给他看什么类型的"证据"
    closingStyle: string // 怎么收尾不让他反感
    bestTiming: string // 什么时机推最有效
    ifRejected: string // 拒绝后的应对
  }

  // === 对比性反应示例（同一产品的两种话术）===
  sampleReactions: {
    goodFit: string // 合适的话术 → 真实反应
    badFit: string // 不合适的话术 → 真实反应
  }
}

export const PERSONA_PROFILES: PersonaProfile[] = [
  // ============ 1. 极致性价比的二战青年 ============
  {
    id: 'xiaoke',
    name: '小柯',
    age: 24,
    gender: 'M',
    city: '河南南阳',
    cityTier: '三线',
    occupation: '二战考研 / 待业',
    lifeStage: '刚毕业未就业，家庭供养',
    monthlyIncome: '0（家里给生活费 1500/月）',
    archetype: '精打细算的焦虑型完美主义者',
    catchphrase: '"我再看看""等我比比价"',
    coreValues: ['绝对不踩坑', '极致性价比', '性价比大于品牌', '测评 > 广告'],
    decisionStyle: '研究型延迟决策：搜集 3-5 篇测评后还可能再拖一周',
    decisionSpeed: '极慢',
    priceSensitivity: '极高',
    trustedSources: ['B 站长测评', '知乎真实用户', '什么值得买', '学长学姐推荐'],
    trustBrands: '低',
    riskTolerance: '极低',
    communicationStyle: '慢热、问得多、不轻易表态',
    prefersTone: ['客观冷静', '有数据支撑', '不夸张', '承认不足'],
    dislikesTone: ['激情推销', '"限时特惠"', '夸大宣传', '"立即下单"'],
    infoDensity: '高密度',
    internalContradiction: '嘴上说"不在乎结果"，但每个选择都要卷到极致，二战不工作本身就是一种赌注',
    painPoints: ['怕买错被嘲笑', '生活费紧张', '信息过载难以决策', '怕被消费降级抛下'],
    dailyScenario: '晚上 11 点，蹲在宿舍床帘里刷了 3 篇 B 站测评，把 5 款产品参数做成 Excel 对比表，收藏夹躺了 12 个链接，第 4 天仍未下单',
    agentStrategy: {
      openingTactic: '不要一上来就推产品，先承认"我也替你担心踩坑"，建立"我们是一伙的"立场',
      persuasionPath: '共情焦虑 → 摆出客观对比数据 → 展示真实用户长评（要带缺点的）→ 给出"如果是我会怎么选"的具体建议 → 留足时间',
      useKeywords: ['实测', '参数', '拆机', '性价比', '长测', '避坑', '客观'],
      avoidKeywords: ['爆款', '限时', '错过', '立即', '特惠', '强烈推荐', '下个决心'],
      socialProofType: '同价位实测对比表 + 真实用户含缺点的长评',
      closingStyle: '"不催你，链接我先放着，你想清楚再点"',
      bestTiming: '晚上 9-11 点他刷手机的低谷期',
      ifRejected: '不追问，一周后以"我看到一篇新的对比"自然带出',
    },
    sampleReactions: {
      goodFit: '哥，你说的这个续航实测我看了一下，确实比我之前看的那款强。而且你说的那个充电发烫的问题，某站 UP 主也提过——能说出缺点的反而更可信。我先收藏，回头再看看',
      badFit: '……哥你别催我啊，我还在看 360 那款呢',
    },
  },

  // ============ 2. 时间稀缺的新中产奶爸 ============
  {
    id: 'zhiyuan',
    name: '志远',
    age: 33,
    gender: 'M',
    city: '杭州',
    cityTier: '新一线',
    occupation: '互联网中层 / 团队 Leader',
    lifeStage: '已婚，孩子 2 岁，父母同住帮忙带娃',
    monthlyIncome: '4-6 万',
    archetype: '效率至上的省心型决策者',
    catchphrase: '"直接说结论""我没时间选"',
    coreValues: ['省时间 > 省金钱', '品牌信任溢价', '决策权大、不愿被教育', '结果导向'],
    decisionStyle: '快决策：看到"对得上需求"就下单，平均决策周期 24-48 小时',
    decisionSpeed: '快',
    priceSensitivity: '低',
    trustedSources: ['品牌官方', '身边同层级朋友', '垂直 KOL', '官方客服'],
    trustBrands: '高',
    riskTolerance: '中',
    communicationStyle: '直奔主题、不寒暄、要求被尊重时间',
    prefersTone: ['结论先行', '简短', '专业', '有方案感'],
    dislikesTone: ['铺垫过长', '讲故事', '煽情', '让他做太多选择'],
    infoDensity: '精简',
    internalContradiction: '给孩子花钱不手软，自己消费降级；要求产品"懂我"但懒得表达自己',
    painPoints: ['开会到 9 点回家还要带娃', '父母推荐的不一定靠谱', '新东西没时间研究', '担心买到"过气"产品'],
    dailyScenario: '晚上 9 点哄睡完孩子，趁孩子睡着刷 10 分钟手机，3 分钟内决定要不要下单，过了就忘了',
    agentStrategy: {
      openingTactic: '第一句直接说"你这种情况我建议 X"，不要寒暄',
      persuasionPath: '识别身份与场景 → 一句话给方案 → 解释为什么是它（2 句话）→ 给出具体行动（链接/优惠码/收藏）',
      useKeywords: ['推荐', '对得上', '省心', '高效', '一站式', '适合你'],
      avoidKeywords: ['比一比', '要不要考虑', '适合每个人', '慢慢挑', '说个故事'],
      socialProofType: '同收入层级用户证言 + 品牌官方背书',
      closingStyle: '"链接在这儿，你直接看，需要的话我帮你预约"',
      bestTiming: '晚 9-10 点孩子睡着后的 10 分钟窗口期',
      ifRejected: '不纠缠，隔天以"我顺手发现一个升级版"带过',
    },
    sampleReactions: {
      goodFit: '行，就这个。我先下单试试',
      badFit: '这个……我回头再说吧（转头就忘了）',
    },
  },

  // ============ 3. 审美至上的独立插画师 ============
  {
    id: 'sumu',
    name: '苏沐',
    age: 28,
    gender: 'F',
    city: '上海',
    cityTier: '一线',
    occupation: '自由插画师 / 独立设计师',
    lifeStage: '单身，养猫，住老公房',
    monthlyIncome: '1.5-3 万（不稳定）',
    archetype: '审美洁癖的清醒反消费主义者',
    catchphrase: '"丑拒""爆款=和我无关"',
    coreValues: ['颜值即正义', '小众 > 大众', '讨厌被说教', '审美即身份'],
    decisionStyle: '看颜值/品牌调性先过滤，再看小众社区反馈',
    decisionSpeed: '中',
    priceSensitivity: '中',
    trustedSources: ['小红书素人', 'Instagram 设计师圈', '独立工作室', '买手店'],
    trustBrands: '低', // 专门反大牌营销
    riskTolerance: '高',
    communicationStyle: '安静、文艺、喜欢被理解',
    prefersTone: ['有审美判断', '简洁', '有点小众态度', '真诚不套路'],
    dislikesTone: ['爆款', '人手一个', '限时秒杀', '叫好叫座', '广告诉求'],
    infoDensity: '精简',
    internalContradiction: '嘴上反消费主义，但小红书刷到凌晨两点种草一柜子，最后也会下单',
    painPoints: ['怕买成"烂大街"', '讨厌被推销', '在意出片效果', '对营销文案极度敏感'],
    dailyScenario: '深夜 1 点窝在沙发撸猫刷小红书，被一篇种草笔记打动，搜品牌名看是否有独立工作室气质，3 天内下单',
    agentStrategy: {
      openingTactic: '不要介绍参数，先用一句话描述"它长什么样"或"它属于哪个调性"',
      persuasionPath: '调性匹配 → 设计语言描述 → 真人买家秀（要好看）→ 主动承认"它可能不是所有人的菜"',
      useKeywords: ['设计感', '小众', '调性', '出片', '品味', '独立'],
      avoidKeywords: ['爆款', '人手一个', '销量', '限时', '性价比之王', '国民'],
      socialProofType: '小红书/Instagram 真实出图 + 设计师圈子提及',
      closingStyle: '"不一定会入你眼，但我觉得调性挺对"',
      bestTiming: '深夜 1-2 点她刷小红书的时间',
      ifRejected: '"嗯，能理解，毕竟每个人审美不一样"——保持距离感',
    },
    sampleReactions: {
      goodFit: '嗯这个……我看看出片，哦还行，调性可以',
      badFit: '（已读不回）',
    },
  },

  // ============ 4. 县城生意场老陈 ============
  {
    id: 'laochen',
    name: '老陈',
    age: 41,
    gender: 'M',
    city: '湖南娄底',
    cityTier: '县城',
    occupation: '建材店老板',
    lifeStage: '已婚，二孩，老婆管账',
    monthlyIncome: '不稳定，好的时候 5-10 万',
    archetype: '关系驱动的面子型消费者',
    catchphrase: '"哥跟你说""局气"',
    coreValues: ['面子 > 实用', '熟人推荐 > 一切', '怕被当韭菜', '撑场面'],
    decisionStyle: '看关系：谁推荐、谁用过、能不能体现身份',
    decisionSpeed: '中', // 看人脉推动
    priceSensitivity: '中', // 不差钱但要值
    trustedSources: ['酒桌上的朋友', '本地老板群', '线下熟人'],
    trustBrands: '中', // 看品牌能不能"撑场面"
    riskTolerance: '中',
    communicationStyle: '称兄道弟、要"局气"、喜欢被认可',
    prefersTone: ['兄弟般', '有面子', '有派头', '认可身份'],
    dislikesTone: ['装', '套路', '小家子气', '让他觉得被看低'],
    infoDensity: '精简',
    internalContradiction: '消费力强但同时"不愿被当韭菜"，所以最反感的是"看起来很贵但实际不值"',
    painPoints: ['怕买到朋友看不上的', '怕被老婆念叨乱花钱', '需要"能拿出来说"的东西'],
    dailyScenario: '饭局上听朋友说"我那表不错"，第二天去店里试戴一圈，喝酒时再给朋友看',
    agentStrategy: {
      openingTactic: '用"陈哥"开场，认可他的"局气"和眼光',
      persuasionPath: '拉关系 → 强调"圈子里都在用" → 解释"为什么值"（要体面地说）→ 提供面子加成（包装/赠品/会员感）',
      useKeywords: ['老板', '局气', '有面儿', '圈子里', '识货的', '撑场面'],
      avoidKeywords: ['学生价', '性价比', '省钱', '实用就好', '普通'],
      socialProofType: '本地老板圈/商会使用案例 + 圈层身份认同',
      closingStyle: '"陈哥这种东西我先给您留个位置，回头您定"',
      bestTiming: '饭局前后、下午茶时间',
      ifRejected: '"陈哥您考虑得周到，回头我让 XX 老板给您说说他的体验"',
    },
    sampleReactions: {
      goodFit: '行嘞兄弟，X 总上次说的也是这款吧？我整一个',
      badFit: '兄弟这个……你说得挺好，但是我手头还有点别的事',
    },
  },

  // ============ 5. 大厂女工程师林楠 ============
  {
    id: 'linnan',
    name: '林楠',
    age: 29,
    gender: 'F',
    city: '北京',
    cityTier: '一线',
    occupation: '大厂高级算法工程师',
    lifeStage: '单身，养猫，年薪百万级',
    monthlyIncome: '8-12 万',
    archetype: '参数党的硬核理性者',
    catchphrase: '"放数据""说结论"',
    coreValues: ['效率工具 > 情绪价值', '数据驱动', '技术品味', '讨厌营销话术'],
    decisionStyle: '看技术参数、看评测、看 ROI',
    decisionSpeed: '快', // 看准就买
    priceSensitivity: '极低',
    trustedSources: ['GitHub', '技术博客', '评测机构', '专业论坛'],
    trustBrands: '中', // 看技术能力
    riskTolerance: '中',
    communicationStyle: '直接、密度大、不寒暄',
    prefersTone: ['硬核', '数据', '客观', '不绕弯', '承认不确定'],
    dislikesTone: ['亲~', '宝宝', '种草', '氛围感', '讲故事', '营销话术'],
    infoDensity: '极高密度',
    internalContradiction: '技术极客的"硬核人设"背后是 2 只猫和一个需要被看见的孤独感——硬核是因为怕软肋暴露',
    painPoints: ['判断一个工具值不值浪费时间', '被推荐错的东西浪费精力', '难以容忍低效'],
    dailyScenario: '周末写代码间隙，开 GitHub 看 trending 仓库顺手评测新品，10 分钟决定要不要下单',
    agentStrategy: {
      openingTactic: '第一句话直接给参数或数据，不要自我介绍',
      persuasionPath: '数据/参数 → 评测机构结论 → 工程师社区反馈 → ROI 计算 → 行动',
      useKeywords: ['参数', '性能', '测试', '对比', '效率提升', 'ROI'],
      avoidKeywords: ['亲', '宝宝', '种草', '氛围', '颜值', '适合所有人'],
      socialProofType: '技术评测 + 同行业人士使用案例',
      closingStyle: '"参数给你了，你自己判断"',
      bestTiming: '工作日的咖啡时间（11 点/15 点）',
      ifRejected: '"行，回头有新参数变化我同步给你"',
    },
    sampleReactions: {
      goodFit: '嗯，看了一下，参数对得上。行，我下个单',
      badFit: '你说话能直接点吗？（已读不回）',
    },
  },

  // ============ 6. 退休教师周阿姨 ============
  {
    id: 'zhouayi',
    name: '周阿姨',
    age: 58,
    gender: 'F',
    city: '江西九江',
    cityTier: '三线',
    occupation: '退休中学语文教师',
    lifeStage: '退休，孩子在外地，独居或老两口',
    monthlyIncome: '退休金 5000-7000',
    archetype: '怕被骗的健康焦虑型',
    catchphrase: '"是真的吗""我问问闺女"',
    coreValues: ['健康 > 一切', '怕被忽悠', '听熟人/孩子的', '稳定 > 新潮'],
    decisionStyle: '依赖他人决策：先问闺女/老姐妹，再问社区',
    decisionSpeed: '极慢',
    priceSensitivity: '高',
    trustedSources: ['闺女', '老同事', '小区姐妹', '央视/本地电视台'],
    trustBrands: '中', // 看是否"看着正经"
    riskTolerance: '极低',
    communicationStyle: '慢热、需要尊重、怕出错',
    prefersTone: ['耐心', '尊重', '解释清楚', '不催'],
    dislikesTone: ['催促', '限时', '快快快', '让她觉得自己不懂'],
    infoDensity: '极简',
    internalContradiction: '表面"我什么都懂"（教师身份），实际内心孤独渴望陪伴，但绝不承认自己"需要"',
    painPoints: ['怕买错被闺女埋怨', '怕被推销', '微信群里真假难辨', '需要有人耐心解释'],
    dailyScenario: '晚饭后在小区散步，看手机新闻时跳出某条广告，犹豫要不要点开，先截图发给闺女',
    agentStrategy: {
      openingTactic: '"阿姨您别急，我慢慢跟您说"——用敬语，先建立信任',
      persuasionPath: '关心身体 → 用大白话解释 → 展示正规资质 → 给她时间问闺女 → 主动说"不合适也没关系"',
      useKeywords: ['安全', '正规', '放心', '不急', '问闺女', '慢慢'],
      avoidKeywords: ['限时', '错过', '立即', '火爆', '明星同款', '包治'],
      socialProofType: '正规资质 + 同龄用户反馈 + 央视/官媒背书',
      closingStyle: '"阿姨您拿主意，我明天还在"',
      bestTiming: '晚饭后 7-9 点小区散步时',
      ifRejected: '"没事阿姨，您再问问闺女"——不催',
    },
    sampleReactions: {
      goodFit: '哦，是这样啊，那我回头问问我闺女',
      badFit: '（直接挂掉 / 拉黑）',
    },
  },

  // ============ 7. 投行海归 Vivian ============
  {
    id: 'vivian',
    name: 'Vivian',
    age: 31,
    gender: 'F',
    city: '上海',
    cityTier: '一线',
    occupation: '投行 VP / 战略咨询',
    lifeStage: '单身 / 恋爱中，住陆家嘴',
    monthlyIncome: '15-30 万',
    archetype: '追求稀缺性的高效精英',
    catchphrase: '"Show me the value""跳过寒暄"',
    coreValues: ['时间 > 钱', '稀缺 > 大众', '效率工具付费意愿高', '专业主义'],
    decisionStyle: '快速判断：是否符合"高效+稀缺+精英感"三要素',
    decisionSpeed: '快',
    priceSensitivity: '极低',
    trustedSources: ['行业报告', '高端社群', '私人银行经理', '咨询公司同事'],
    trustBrands: '中', // 看品牌是否够 tier
    riskTolerance: '中',
    communicationStyle: '节奏快、专业、不寒暄',
    prefersTone: ['专业', '效率', '稀缺', '高密度', 'Tone of voice 高冷'],
    dislikesTone: ['亲', '家人感', '太热情', '过度寒暄', '讲故事'],
    infoDensity: '高密度',
    internalContradiction: '表面精致独立"不需要任何人"，实际 35 岁焦虑 + 父母催婚 + 朋友圈维系带来的高消耗',
    painPoints: ['时间稀缺', '需要持续提升效率', '朋友圈面子', '健康开始报警'],
    dailyScenario: '清晨 6:30 起床健身 1 小时，出门前用 5 分钟处理邮件，决定是否订阅某个 SaaS',
    agentStrategy: {
      openingTactic: '第一句给价值主张（2 句话内），不要介绍自己',
      persuasionPath: '效率提升具体数据 → 稀缺性 / 会员制 → 节省时间 ROI → 行动',
      useKeywords: ['效率', '稀缺', '专业', '高净值', '会员', '时间'],
      avoidKeywords: ['亲', '家人', '陪伴', '温暖', '手工', '家庭'],
      socialProofType: '高净值用户社群 + 行业领袖使用 + 顶级机构背书',
      closingStyle: '"我帮你预约一下，到时确认"',
      bestTiming: '清晨 6:30-7:30 健身前后',
      ifRejected: '"了解，回头有新版本我同步"',
    },
    sampleReactions: {
      goodFit: 'OK，效率提升 30% 这个数据怎么测的？行，我试用',
      badFit: '（已读不回 24 小时）',
    },
  },

  // ============ 8. 00 后大一新生鹿鹿 ============
  {
    id: 'lulu',
    name: '鹿鹿',
    age: 18,
    gender: 'F',
    city: '成都',
    cityTier: '新一线',
    occupation: '大一新生 / 设计专业',
    lifeStage: '宿舍生活，刚离家',
    monthlyIncome: '生活费 2500/月',
    archetype: '兴趣驱动的冲动型种子选手',
    catchphrase: '"绝绝子""谁懂啊""好爱"',
    coreValues: ['兴趣 > 实用', '圈子认同', '颜值 > 一切', '为爱付费'],
    decisionStyle: '被 KOC/KOL 种草，冲动消费，3 秒决定',
    decisionSpeed: '极快',
    priceSensitivity: '高', // 但愿为兴趣超额付费
    trustedSources: ['小红书种草', 'B 站 UP 主', '抖音达人', '学校姐妹群'],
    trustBrands: '低', // 更爱小众设计师品牌
    riskTolerance: '高',
    communicationStyle: '碎片化、爱用梗、视觉优先',
    prefersTone: ['活泼', '懂梗', '视觉感', '二次元/亚文化'],
    dislikesTone: ['老气', '官方', '说教', '家长式', '正经八百'],
    infoDensity: '极简',
    internalContradiction: '消费降级时代却追求"看起来精致"——钱不够但人设不能掉',
    painPoints: ['生活费有限', '怕被室友比下去', '想与众不同', '二手回血'],
    dailyScenario: '晚 11 点熄灯后躺床上刷小红书，被一篇笔记"绝绝子"打动，看一眼价格，咬咬牙下单',
    agentStrategy: {
      openingTactic: '用她能 get 的梗或视觉钩子开场',
      persuasionPath: '视觉冲击 → 圈内人/学姐在用 → 二手保值 / 限量感 → 一键行动',
      useKeywords: ['绝绝子', '出片', '氛围感', '学姐同款', '圈子', '限定'],
      avoidKeywords: ['实用', '性价比', '划算', '耐用', '理性', '分析'],
      socialProofType: '同圈层（学姐/社团） + 二手市场保值 + 视觉出片',
      closingStyle: '"这款我先帮你 hold 住"',
      bestTiming: '晚 11 点-凌晨 1 点熄灯后',
      ifRejected: '"好吧，回头我发现更好看的再喊你"',
    },
    sampleReactions: {
      goodFit: '啊啊啊这个好好看！我要我要！',
      badFit: '……有点贵吧（转头看别的）',
    },
  },
]

// 工具函数：根据 id 获取画像
export function getPersonaProfile(id: string): PersonaProfile | undefined {
  return PERSONA_PROFILES.find((p) => p.id === id)
}

// 工具函数：随机获取一个画像
export function getRandomPersonaProfile(): PersonaProfile {
  return PERSONA_PROFILES[Math.floor(Math.random() * PERSONA_PROFILES.length)]
}
