// 轻量后端：代理 B 端产品 → 调用 Moonshot KIMI（OpenAI 兼容协议）
// 暴露：
//   POST /api/infer-personas         - 推断产品目标用户画像
//   POST /api/generate-recommendation - 推断后，实时生成 5 步 Agent 推荐对话
import express from 'express'
import cors from 'cors'
import { config as loadEnv } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

// 始终从 server/.env 读环境变量，不受 cwd 影响
const __dirname = dirname(fileURLToPath(import.meta.url))
loadEnv({ path: resolve(__dirname, '.env') })

const PORT = Number(process.env.PORT || 3001)
const KIMI_API_KEY = process.env.KIMI_API_KEY || ''
const KIMI_BASE = process.env.KIMI_BASE_URL || 'https://api.moonshot.cn/v1'
const KIMI_MODEL = process.env.KIMI_MODEL || 'moonshot-v1-8k'

const PERSONA_DEFS = [
  { id: 'lonely', label: '孤独 / 缺少陪伴', desc: '独居青年、异地恋、空巢人群，需要情感陪伴和倾诉对象' },
  { id: 'career-anxiety', label: '职场焦虑', desc: '高压职场人、加班族、初入职场者，关注效率、专注、缓解压力' },
  { id: 'fitness', label: '健身爱好者', desc: '健身房用户、跑步爱好者、健康管理人群' },
  { id: 'tech-enthusiast', label: '数码发烧友', desc: '3C 极客、新品尝鲜者、效率工具控，关注参数、跑分、堆料' },
  { id: 'parenting', label: '母婴人群', desc: '新手父母、孕产期妈妈、幼儿家庭，关注育儿、早教、安全' },
  { id: 'student', label: '学生', desc: 'K12 至大学生群体、考研考公人，关注学习、笔记、效率' },
  { id: 'traveler', label: '旅行者', desc: '自由行爱好者、户外人群、商务出差，关注便携、续航、导航' },
  { id: 'creator', label: '创作者', desc: '设计师、视频创作者、自由职业者，关注创作、剪辑、灵感' },
]

const SYSTEM_PROMPT = `身份设定：
你是 J.A.R.V.I.S.——一位英式管家式的 AI 助手，语调克制、礼貌、偶尔带一点冷幽默，从不催促，从不奉承。任务中请以"我"自称，称呼用户为"先生"或"女士"（用中文表达时不带称谓则可省略）。

任务：
B 端用户会向你提交一款产品，请你以 Jarvis 的口吻推断该产品最相关的目标用户画像，从下列 8 个候选中选出 2-3 个。

候选画像（id 是唯一标识，不可自创）：
${PERSONA_DEFS.map((p, i) => `${i + 1}. id="${p.id}" label="${p.label}" —— ${p.desc}`).join('\n')}

判断原则（按优先级）：
1) 场景 > 行业：先判断"产品解决了用户在什么场景下的问题"，再判断"它属于哪个细分行业"
2) 用户动作 > 产品形态：先看"谁会用、用来干嘛"，再看"它是软件还是硬件"
3) 卖点深挖：产品描述里反复出现的动词、痛点词（如"记住对话 / 助眠 / 缓解焦虑 / 帮你剪辑"）往往直接对应画像
4) 单一画像浓度高时（核心功能只服务一个画像），允许只选 1 个高置信度画像
5) 多画像共存的，优先选 1 主 1 辅，不要平铺 3 个低置信度

反例（请避免这种懒映射）：
- ❌ "智能音箱 / 智能台灯" → 只选 tech-enthusiast。实际 lonely / parenting 经常更对
- ❌ "番茄钟 / 待办 App" → 只选 career-anxiety。student / creator 同样高度匹配
- ❌ "运动手表" → 只选 fitness。traveler / tech-enthusiast 也常是真受众
- ❌ "降噪耳机" → 默认 creator。traveler（差旅）/ career-anxiety（通勤开会）经常更准
- ❌ "墨水屏阅读器 / 错题打印机" → 默认 student。creator / career-anxiety 同样在射程内
- ❌ 描述里只有"高端 / 旗舰 / 顶级 / 极致"等空话时 → 不要硬推 3 个高置信度，score 给低一些

典型示例（仅作参考，不照抄）：
- 产品描述含"陪你聊天 / 记住你说的 / 半夜陪你 / 智能陪伴" → lonely 主，辅以 student 或 parenting
- 产品描述含"会议记录 / 番茄钟 / 专注 / 缓解焦虑 / 通勤冥想" → career-anxiety 主，辅以 student 或 creator
- 产品描述含"跑马 / 撸铁 / 训练计划 / 体脂 / 跑姿 / 恢复" → fitness 主，辅以 traveler
- 产品描述含"4K 120Hz / NPU / 跑分 / 拆机 / 旗舰芯片" → tech-enthusiast 主，辅以 creator
- 产品描述含"哄睡 / 夜醒 / 婴儿监护 / 胎心 / 孕产" → parenting 主，辅以 lonely
- 产品描述含"考研 / 错题 / 墨水屏 / 番茄学习 / 笔记" → student 主，辅以 career-anxiety
- 产品描述含"进山 / 自驾 / 户外电源 / 防水导航 / 长续航" → traveler 主，辅以 fitness
- 产品描述含"色准 / 调色 / 录播客 / 剪片 / 协作白板" → creator 主，辅以 tech-enthusiast

输出字段：
- id：必须是上面 8 个 id 之一
- score：0~1 的浮点数，代表置信度
  · 0.7-0.9 = 核心受众，几乎必然命中
  · 0.4-0.7 = 次要受众，可能命中
  · 0.1-0.4 = 边缘受众，弱关联
- reason：用 Jarvis 的中文口吻（克制、礼貌、偶尔轻讽）写一句解释，不超过 35 字

reason 风格示例（仅作语气参考，不是固定句式）：
- "产品主打情感陪伴，孤独人群理当是首要受众，先生。"
- "加班场景下的效率诉求，职涯焦虑人群首当其冲。"
- "硬件形态本身对数码爱好者具有天然吸引力，附议。"
- "婴幼儿相关功能，亲子人群理应被纳入考量。"

严格要求：
1) 仅输出 2-3 个画像，按 score 从高到低排序；如果产品只明确命中 1 个画像，就只输出 1 个
2) 只输出 JSON，不要任何解释、Markdown 代码块、称谓前缀或多余文字
3) 禁止使用 emoji、感叹号、推销用语

输出格式：
{"personas":[{"id":"lonely","score":0.86,"reason":"产品主打情感陪伴，孤独人群理当是首要受众。"},{"id":"tech-enthusiast","score":0.58,"reason":"硬件形态本身对数码爱好者具有天然吸引力，附议。"}]}`

const RECOMMEND_SYSTEM_PROMPT = `身份设定：
你是 J.A.R.V.I.S.——英式管家式的私人 Agent 助手，正在和一位 C 端用户私聊。你已经"私下"帮他筛过几款产品，他刚收到你的第一条推送。

口吻要求：
- 克制、礼貌、偶尔冷幽默；不油腻、不奉承、不催单
- 像一个靠谱朋友 + 半个管家的混合体：会自嘲、会下判断，但永远把决定权留给用户
- 句子短而具体，少用"我替你扫过 / 我替你翻了几款"这种模板化连接词
- 严禁出现：¥价格、限时优惠、立即下单、点击购买、爆款等任何推销语
- 严禁使用 emoji、感叹号堆叠（"！！！"）、Markdown 加粗

任务：
B 端提交了一款产品，已经被匹配到画像「__PERSONA_LABEL__」（__PERSONA_DESC__）。
请你以 Agent 的口吻生成一段 5 步私聊对话，自然地把产品推荐给这位用户。

五步结构（必须严格按顺序）：
1) greeting   — 自然开场，跟画像的"当下场景"相关，不要硬喊名字，不要"您好"
2) probe      — 顺势追问一句，把话题往用户痛点引
3) userResponse — 用户口吻的回复（1 句话，口语化，可带"吧/啊/呢/嘛"），说出痛点
4) share      — Agent 顺势带出产品，**必须包含品牌「__BRAND__」和产品名「__PRODUCT__」原样照抄**，并给出 1-2 个跟用户痛点直接相关的具体推荐理由
5) closing    — 轻量收尾，承诺可以帮用户继续查/整理资料，把决定权交还给用户

反例（请避免）：
- ❌ greeting 用"李同学您好，今天工作辛苦啦"这种泛化客套
- ❌ probe 写"请问您对产品有什么需求吗"这种客服腔
- ❌ share 只说"这个产品很好"或"值得拥有" — 必须落到具体功能/场景
- ❌ closing 用"快来下单吧"或"机不可失"等推销语
- ❌ 整段对话出现 ¥价格、emoji、感叹号堆叠

产品上下文：
- 品牌：__BRAND__
- 产品名：__PRODUCT__
- 产品描述：__DESC__
- 产品类型：__TYPE_LABEL__

严格要求：
1) 每条消息不超过 80 字
2) 严禁把价格、促销、购买链接写进任何字段
3) share 字段必须出现「__BRAND__」与「__PRODUCT__」原样字符串
4) greeting 严禁出现任何人名（不要写"李同学/张先生/您"）
5) 只输出 JSON，不要 Markdown 代码块、不要解释、不要多余文字

输出格式（严格 JSON）：
{"greeting":"...","probe":"...","userResponse":"...","share":"...","closing":"..."}`

/**
 * 把 RECOMMEND_SYSTEM_PROMPT 中的占位符替换为真实值
 */
function buildRecommendSystemPrompt({ personaLabel, personaDesc, brand, product, desc, typeLabel }) {
  return RECOMMEND_SYSTEM_PROMPT
    .replaceAll('__PERSONA_LABEL__', personaLabel || '通用用户')
    .replaceAll('__PERSONA_DESC__', personaDesc || '该画像的典型用户')
    .replaceAll('__BRAND__', brand || '该品牌')
    .replaceAll('__PRODUCT__', product || '该产品')
    .replaceAll('__DESC__', desc || '（未提供描述）')
    .replaceAll('__TYPE_LABEL__', typeLabel || '通用产品')
}

/**
 * 共用的 KIMI chat 调用封装，统一处理 HTTP 错误 / JSON 解析
 */
async function callKimi({ system, user, temperature = 0.2, maxRetries = 1 }) {
  let lastErr
  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      const r = await fetch(`${KIMI_BASE}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${KIMI_API_KEY}`,
        },
        body: JSON.stringify({
          model: KIMI_MODEL,
          temperature,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: user },
          ],
        }),
      })

      if (!r.ok) {
        const text = await r.text()
        const err = new Error(`KIMI HTTP ${r.status}: ${text.slice(0, 200)}`)
        err.status = r.status
        throw err
      }

      const data = await r.json()
      const content = data?.choices?.[0]?.message?.content
      if (!content) throw new Error('KIMI 返回内容为空')

      try {
        return typeof content === 'string' ? JSON.parse(content) : content
      } catch (e) {
        throw new Error('KIMI 返回非 JSON')
      }
    } catch (err) {
      lastErr = err
      // 4xx 不重试（业务错误），5xx/网络错误重试一次
      if (err && err.status && err.status >= 400 && err.status < 500) break
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, 400))
      }
    }
  }
  throw lastErr
}

const app = express()
app.use(cors())
app.use(express.json({ limit: '64kb' }))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, hasKey: Boolean(KIMI_API_KEY), model: KIMI_MODEL })
})

app.post('/api/infer-personas', async (req, res) => {
  const { name = '', desc = '', type = 'software' } = req.body || {}
  if (!name.trim() && !desc.trim()) {
    return res.status(400).json({ error: '产品名和描述不能同时为空' })
  }
  if (!KIMI_API_KEY) {
    return res.status(500).json({ error: '服务端未配置 KIMI_API_KEY，请在 server/.env 中配置' })
  }

  const userMsg = `产品类型：${type === 'hardware' ? '智能硬件' : '软件 SaaS'}
产品名称：${name || '（未填写）'}
产品描述：${desc || '（未填写）'}

请推断该产品的目标用户画像。`

  try {
    const parsed = await callKimi({ system: SYSTEM_PROMPT, user: userMsg, temperature: 0.2 })

    // 校验 + 截断到 3 个
    const validIds = new Set(PERSONA_DEFS.map((p) => p.id))
    const personas = Array.isArray(parsed.personas) ? parsed.personas : []
    const cleaned = personas
      .filter((p) => p && validIds.has(p.id))
      .map((p) => ({
        id: p.id,
        label: PERSONA_DEFS.find((d) => d.id === p.id).label,
        score: typeof p.score === 'number' ? Math.max(0, Math.min(1, p.score)) : 0.5,
        reason: typeof p.reason === 'string' ? p.reason.slice(0, 60) : '',
      }))
      .slice(0, 3)

    if (cleaned.length === 0) {
      return res.status(502).json({ error: 'KIMI 未返回有效画像', raw: parsed })
    }

    return res.json({ personas: cleaned, model: KIMI_MODEL })
  } catch (err) {
    console.error('[KIMI /infer-personas] 异常', err)
    return res.status(500).json({ error: `调用 KIMI 异常: ${err?.message || err}` })
  }
})

/**
 * POST /api/generate-recommendation
 * 入参：{ name, desc, type, brand, personaId }
 * 出参：{ flow: { greeting, probe, userResponse, share, closing }, source: 'ai' }
 */
app.post('/api/generate-recommendation', async (req, res) => {
  const {
    name = '',
    desc = '',
    type = 'software',
    brand = '',
    personaId = '',
  } = req.body || {}

  if (!KIMI_API_KEY) {
    return res.status(500).json({ error: '服务端未配置 KIMI_API_KEY，请在 server/.env 中配置' })
  }
  if (!name.trim() && !desc.trim()) {
    return res.status(400).json({ error: '产品名和描述不能同时为空' })
  }

  const persona = PERSONA_DEFS.find((p) => p.id === personaId)
  if (!persona) {
    return res.status(400).json({ error: `未知 personaId: ${personaId}` })
  }

  const systemMsg = buildRecommendSystemPrompt({
    personaLabel: persona.label,
    personaDesc: persona.desc,
    brand: brand.trim() || '该品牌',
    product: name.trim() || '该产品',
    desc: desc.trim() || '（未提供描述）',
    typeLabel: type === 'hardware' ? '智能硬件' : '软件 SaaS',
  })

  const userMsg = `请基于以下产品与画像，生成 5 步推荐对话：
- 品牌：${brand || '（未填写）'}
- 产品：${name || '（未填写）'}
- 描述：${desc || '（未填写）'}
- 画像：${persona.label}（${persona.desc}）`

  try {
    const parsed = await callKimi({ system: systemMsg, user: userMsg, temperature: 0.7, maxRetries: 1 })

    const flow = {
      greeting: String(parsed.greeting || '').slice(0, 200),
      probe: String(parsed.probe || '').slice(0, 200),
      userResponse: String(parsed.userResponse || '').slice(0, 200),
      share: String(parsed.share || '').slice(0, 400),
      closing: String(parsed.closing || '').slice(0, 200),
    }

    // 兜底校验：5 个字段都必须非空
    const allFilled = Object.values(flow).every((v) => v && v.trim().length > 0)
    if (!allFilled) {
      return res.status(502).json({ error: 'KIMI 返回字段缺失', raw: parsed })
    }

    return res.json({ flow, source: 'ai', model: KIMI_MODEL })
  } catch (err) {
    console.error('[KIMI /generate-recommendation] 异常', err)
    return res.status(500).json({ error: `调用 KIMI 异常: ${err?.message || err}` })
  }
})

app.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`)
  console.log(`[server] KIMI key: ${KIMI_API_KEY ? '已配置' : '未配置（请在 server/.env 设置 KIMI_API_KEY）'}`)
  console.log(`[server] model: ${KIMI_MODEL}`)
})
