import type { Persona } from './personas'

/**
 * 推荐对话流程：五步式「陪伴式分享」
 * 1) greeting   - 贾维斯式的开场（带点关心、偶尔用名字、有点 personality）
 * 2) probe      - 顺势把话题拉到当下需求
 * 3) userNeed   - 模拟用户主动说出痛点
 * 4) share      - "我替你看了/筛过/扫过"之后，明确说 {brand} 出的 {product}，给出推荐理由
 * 5) closing    - 主动把下一步安排好（整理资料/收藏链接），决定权留给用户
 *
 * 「{brand}」「{product}」在运行时被替换为 B 端填写的真实品牌与产品名
 * 口吻要求：贾维斯 + 真朋友，会自嘲、会吐槽、敢下判断，但绝不油腻不催单
 *
 * 注意：严禁出现 ¥价格、限时优惠、立即下单等推销语
 */
export interface ConversationFlow {
  greeting: string
  probe: string
  userResponse: string
  share: string
  closing: string
}

export const RECOMMENDATIONS: Record<string, ConversationFlow[]> = {
  lonely: [
    {
      greeting: '哟，李同学，今天下班挺早的嘛',
      probe: '晚饭吃了吗？',
      userResponse: '懒得弄，随便对付了点',
      share: '我替你翻了几款陪伴类的，{brand} 那边的 {product} 值得你多看两眼。它能记住你随口提过的小事，半夜睡不着也能陪你说两句。比养猫省心，比找人聊天自在——不是智商税，我替你扫过',
      closing: '回头我帮你把用户长评整理出来，你慢慢看',
    },
    {
      greeting: '晚上好啊，吃了没？',
      probe: '最近是工作日一个人在家吗',
      userResponse: '嗯，出差回来就我一个人，屋里太安静了',
      share: '按你说的情况，{brand} 出的 {product} 那个可以考虑。它不掉毛、不闹腾，但会回你话，半夜屋子里安静的时候正好派上用场。我看过几个用户反馈，真人写的，不是托',
      closing: '你哪天想看详细参数，我帮你查',
    },
  ],
  'career-anxiety': [
    {
      greeting: '李同学，别熬了，你今天盯屏幕已经 9 个小时了',
      probe: '最近是项目压得紧，还是杂事太多切碎了？',
      userResponse: '一堆会，一天下来啥也没推进，脑子糊的',
      share: '这种"会多到糊"的状态我替你筛过，{brand} 出的 {product} 那个比较对路。开会前闭眼 5 分钟能缓过来，不用硬撑着再开下一个会。我团队里有两个 PM 在用，反馈是真的有效，不是玄学',
      closing: '我先把那两位朋友的反馈整理给你，看完你自己定',
    },
    {
      greeting: 'Hi，注意到你今天开了 4 个会',
      probe: '是不是那种开完比开之前还累的感觉？',
      userResponse: '太对了，开完会整个下午都报废',
      share: '你说的"开完比开之前还累"，{brand} 那边的 {product} 那个对得上。它不是让你更强，是让你少消耗，主打一个会后快速回到状态。我个人比较推荐，比硬撑着效率高',
      closing: '我先帮你收藏着，等你哪天想看再翻',
    },
  ],
  fitness: [
    {
      greeting: '今天跑了没？',
      probe: '最近是想冲成绩还是恢复为主？',
      userResponse: '感觉有氧一直在掉，膝盖也抗议',
      share: '你这种"有氧掉 + 膝盖抗议"，{brand} 出的 {product} 那个值得多看两眼。跑圈的人写了不少怎么用训练手表看恢复心率，比闷头跑进步会稳很多。数据不会骗人',
      closing: '哪天你跑不动了翻出来看看，可能有点用',
    },
    {
      greeting: 'Hi，健身搭子来了',
      probe: '最近是卡在哪个动作了？',
      userResponse: '深蹲重量上不去，瓶颈好久了',
      share: '深蹲卡瓶颈这事，{brand} 那边的 {product} 那个思路可以借鉴。它把体脂秤和训练日志打通了用，能用数据反推周期，比纯靠感觉靠谱。我朋友练了半年，进步肉眼可见',
      closing: '我先把那篇实测链接整理给你，不急',
    },
  ],
  'tech-enthusiast': [
    {
      greeting: '哟，参数党上线了',
      probe: '最近在追什么新东西？',
      userResponse: '在看 M5 芯片那波新机，纠结要不要首发',
      share: '你既然在追 M5 那波，{brand} 出的 {product} 那个刚好有份拆机评测可以参考。NPU 跑分比官方标的高一截，散热堆得挺狠。我替你扫过一遍，数据站得住脚',
      closing: '首发不首发你自己定，那份评测我先丢给你',
    },
    {
      greeting: '又有新品了',
      probe: '你平时是攒一堆评测一起看，还是一篇一篇啃？',
      userResponse: '一篇一篇看才过瘾，最好带数据那种',
      share: '这种一篇一篇啃的风格，{brand} 那边的 {product} 那份实测挺合你口味。频响曲线、续航、IPX8 全跑过一遍，写得克制，不像软文。我替你扫过一遍，可以放心啃',
      closing: '不催你买，看完你自己定',
    },
  ],
  parenting: [
    {
      greeting: '宝宝今天睡得好吗？',
      probe: '晚上是还要起来好几次吗',
      userResponse: '昨晚又醒了三回，老母亲快散架了',
      share: '你昨晚醒三回这事，{brand} 出的 {product} 那个对得上。它是个能听呼吸的小夜灯，异常会推你手机，不是摄像头那种压抑感。当妈的最需要的，就是能睡个整觉',
      closing: '要不要我把那篇测评整理一份给你？',
    },
    {
      greeting: '嗨，今天带娃累不累',
      probe: '哄睡还是讲故事比较头疼？',
      userResponse: '故事讲到口干，他还不睡',
      share: '故事讲到口干这事我太懂了，{brand} 那边的 {product} 那个可以考虑。它会自己编睡前故事，能按孩子年龄和当天心情来编。省妈省嗓子，关键孩子也爱听',
      closing: '我下次整理一份合集发你',
    },
  ],
  student: [
    {
      greeting: '别刷手机了',
      probe: '期末周还是考研冲刺？',
      userResponse: '考研，最后 80 天，进度还差一截',
      share: '考研最后 80 天，时间紧。{brand} 出的 {product} 那个思路对得上——有学长把它当成"只能学习"的工具用，错题和番茄钟一起记，效率比 iPad 高。不是说一定能成，但这种工具用不用得上，看你怎么用',
      closing: '我先把那位学长的复盘帖整理给你，看一眼再说',
    },
    {
      greeting: 'Hi，期末周来了吧？',
      probe: '复习是按计划走还是被推着走？',
      userResponse: '计划早乱了，现在就是题海战术',
      share: '你计划早乱了的状态我太懂了，{brand} 那边的 {product} 那个可以考虑。它能边写边记，重点自动整理成思维导图，复习前一晚回看特别快。不是神器，但能帮你从题海里捞回一点方向',
      closing: '不急，等你考完再聊',
    },
  ],
  traveler: [
    {
      greeting: '下一站想去哪？',
      probe: '是已经定了，还是先看看攻略？',
      userResponse: '想去个小众点的，结果攻略越看越乱',
      share: '攻略越看越乱这事，{brand} 出的 {product} 那个能解决。去过的人写的路线、酒店、避坑都写清楚了，没广告那种。我替你扫过，不是水文，可以放心看',
      closing: '你要是定下来我帮你多搜几篇攻略',
    },
    {
      greeting: 'Hey，旅行搭子',
      probe: '这次是户外还是城市？',
      userResponse: '要进山，怕手机没电，怕迷路',
      share: '进山这事，{brand} 那边的 {product} 那个对得上你的需求。它能同时给电脑手机相机充电，飞机能带，户外也抗摔。续航、防水、便携性都过关，我朋友带它走过川西，没掉过链子',
      closing: '不催你买，等你定行程再决定',
    },
  ],
  creator: [
    {
      greeting: '灵感来了没？',
      probe: '这次是录视频还是写东西？',
      userResponse: '录播客，咖啡馆一开嗓就废',
      share: '咖啡馆录播客这事我太懂了，{brand} 出的 {product} 那个能解。它能智能压掉背景音，户外也能录干净，体积还小。我自己录过几次，那种一开口背景就糊的感觉，靠它能救回来',
      closing: '什么时候录都行，那份测评我先收藏着',
    },
    {
      greeting: 'Hi，工具党集合',
      probe: '最近是卡在剪辑还是出图？',
      userResponse: '出图给客户看，色差一直被挑',
      share: '色差这事，{brand} 那边的 {product} 那个对得上你。色准 ΔE<1，自带校色文件，给客户看稿那种小场景特别合适。我见过几个设计朋友在用，反馈是"终于不用再被挑色差"',
      closing: '不急，等你下次要交稿之前再决定',
    },
  ],
}

/**
 * 给定画像 id，随机取一个五步对话流
 */
export function getRandomRecommendation(personaId: string): ConversationFlow {
  const list = RECOMMENDATIONS[personaId] || []
  return list[Math.floor(Math.random() * list.length)] || {
    greeting: '哟，回来了',
    probe: '今天怎么样？',
    userResponse: '就那样吧',
    share: '我顺手留意了一下，{brand} 出的 {product} 那个值得你看一眼。资料我整理好了',
    closing: '不急，先忙你的',
  }
}
