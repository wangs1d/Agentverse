// 8 个人格的差异化对话流
// 与 PERSONA_PROFILES 严格对应：
// - 用词遵循 prefersTone，避开 dislikesTone
// - 推荐路径遵循 agentStrategy.persuasionPath
// - 体现 internalContradiction

import type { PersonaProfile } from './personaProfiles'
import { PERSONA_PROFILES } from './personaProfiles'

export interface PersonaConversation {
  // 推荐的产品类型（同一个产品，便于对比）
  productCategory: string
  // 5 步对话流
  greeting: string
  probe: string
  userResponse: string
  share: string
  closing: string
}

// 8 个差异化对话流，**同一个产品（智能手表）** 8 种话术
export const PERSONA_CONVERSATIONS: Record<string, PersonaConversation[]> = {
  // 小柯：参数党，3 句话内摆数据，不夸张
  xiaoke: [
    {
      productCategory: '智能手表',
      greeting: '哟，又在刷测评呢',
      probe: '是在 5 款之间纠结，还是已经看了几篇拆机？',
      userResponse: '唉，想找一个续航 10 天以上的，预算 1000 以内',
      share: '你纠结那 5 款我替你扫过一遍，{brand} 那款 {product} 续航实测 14 天，B 站那位 UP 主做的拆机里把缺点也说了——充电速度一般。你要的痛点是续航，这个能解。比某为那款便宜 200，多 4 天续航',
      closing: '链接我先丢给你，不急下单，你比完那 5 款再说',
    },
  ],

  // 志远：结论先行，1 句给方案
  zhiyuan: [
    {
      productCategory: '智能手表',
      greeting: '志远，孩子这个点应该睡着了吧',
      probe: '是想自己用监测睡眠，还是想给娃看？',
      userResponse: '我自己，最近开会多，睡眠很乱',
      share: '你这种情况，{brand} 那款 {product} 直接上。睡眠 + 心率 + 压力三合一，戴上不用管，数据自动同步给手机。同事里有两个 Leader 在用，反馈是"终于知道自己几点睡着的"。一站式方案，不折腾',
      closing: '链接在这儿，我顺手帮你申请了 7 天无理由',
    },
  ],

  // 苏沐：审美驱动，主动承认"它可能不是所有人的菜"
  sumu: [
    {
      productCategory: '智能手表',
      greeting: '在画画？',
      probe: '是想出片好看的，还是功能强的？',
      userResponse: '嗯……其实我已经有 Apple Watch 了，戴着画画时有点违和',
      share: '嗯，那 {brand} 那款 {product} 严格说不算"智能手表"——它是个极简设计的健康环，没有屏幕但能看睡眠和压力，戴手上像条细链子。设计圈里有几个博主在戴，挺低调的。审美洁癖的话可能对得上',
      closing: '不一定会入你眼，但调性我说一下',
    },
  ],

  // 老陈：关系驱动，强调"圈子里"
  laochen: [
    {
      productCategory: '智能手表',
      greeting: '陈哥，最近局多吧？',
      probe: '是您自己戴，还是给嫂子整一个？',
      userResponse: '我自己戴，局上兄弟们都在戴那块 XX，我也得整一个',
      share: '陈哥这就对了，{brand} 那款 {product} 您得上。表盘是钛合金的，一眼就显档，局上戴着不掉价。我这边正好有个圈子里配货的内部价——不急着定，我给您 hold 两天',
      closing: '您局上问问兄弟们再定，不催',
    },
  ],

  // 林楠：参数党，密度大，承认不确定
  linnan: [
    {
      productCategory: '智能手表',
      greeting: '林楠',
      probe: '要的是健康数据原始 API，还是成品报告？',
      userResponse: '原始 API。Apple Watch 不开放心率原始数据',
      share: 'Apple Watch 那个痛点。{brand} 那款 {product} 是开源 SDK，心率原始数据能直接拉出来，文档站写得克制，IEEE 期刊里有跑分。我已经看完了 SDK 文档，要的话丢你。值得注意的是夜间血氧算法版本 v2.3 还存在边界问题，你评估下',
      closing: '参数给你了，你自己判断',
    },
  ],

  // 周阿姨：耐心、敬语、给时间问闺女
  zhouayi: [
    {
      productCategory: '智能手表',
      greeting: '阿姨，晚上好呀',
      probe: '您是想看睡眠，还是看心率，还是想知道自己每天走多少步？',
      userResponse: '睡眠吧，最近老醒，闺女说让去医院查查',
      share: '阿姨您别担心，{brand} 那款 {product} 是医院同款的，能看出心跳齐不齐，异常会推到您闺女手机上，比您自己盯着踏实。您不用急着定，我先把资料整理好给闺女看看，她同意了您再试',
      closing: '阿姨您不急，资料我慢慢发',
    },
  ],

  // Vivian：高效、稀缺、Tone 高冷
  vivian: [
    {
      productCategory: '智能手表',
      greeting: 'Vivian',
      probe: '目标是哪个维度的效率提升？睡眠还是认知？',
      userResponse: '睡眠。我现在每天睡 5 小时，状态已经在掉',
      share: '5h 这个数，{brand} 那款 {product} 直接上。Whoop 团队做的健康数据闭环，睡眠恢复评分模型比 Apple Watch 准一个量级，VP 圈子里基本人手一只。年费 2300，相当于一次体检的预算',
      closing: '我帮你预约一个 14 天 trial，你试用再定',
    },
  ],

  // 鹿鹿：二次元/梗、视觉优先
  lulu: [
    {
      productCategory: '智能手表',
      greeting: '姐妹',
      probe: '是想要出片好看的，还是功能强的？',
      userResponse: '出片！我做穿搭账号的，需要一个上镜的',
      share: '懂！{brand} 那款 {product} 出了个樱花粉配色，绝绝子！小红书上有 3 个穿搭博主拍了，戴上像首饰不像手表。学姐同款，限量的',
      closing: '我先帮你 hold 住，限量抢完就没了',
    },
  ],
}

export function getPersonaConversation(personaId: string): PersonaConversation {
  const list = PERSONA_CONVERSATIONS[personaId] || []
  return (
    list[0] || {
      productCategory: '产品',
      greeting: '嗨',
      probe: '今天怎么样？',
      userResponse: '就那样',
      share: '{brand} 那款 {product} 值得你看看',
      closing: '不急，先忙你的',
    }
  )
}

// 工具：选两个对比用的对话流
export function getComparisonConversations(aId: string, bId: string): {
  a: { profile: PersonaProfile; conversation: PersonaConversation }
  b: { profile: PersonaProfile; conversation: PersonaConversation }
} {
  const aProfile = PERSONA_PROFILES.find((p) => p.id === aId)!
  const bProfile = PERSONA_PROFILES.find((p) => p.id === bId)!
  return {
    a: { profile: aProfile, conversation: getPersonaConversation(aId) },
    b: { profile: bProfile, conversation: getPersonaConversation(bId) },
  }
}
