// 轻量后端：代理 B 端产品 → 调用 Moonshot KIMI（OpenAI 兼容协议）做真实画像推断
// 暴露 POST /api/infer-personas
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

判断要点：
1) 关注"产品解决了什么场景问题"，而非"产品属于哪个行业"
2) 陪伴/倾诉/聊天/记住对话 → lonely 必须入选
3) 加班/会议/效率/压力 → career-anxiety 必须入选
4) 硬件类型不要只跳到 tech-enthusiast，要看它面向的具体使用人群
5) 软件类型不要只跳到 career-anxiety，要看是否覆盖 student/creator/lonely 等
6) 如果产品语义真的只匹配 1 个画像，可补充 1 个相邻画像（parenting↔lonely、fitness↔traveler、tech-enthusiast↔creator），但不必强求

输出字段：
- id：必须是上面 8 个 id 之一
- score：0~1 的浮点数，代表置信度
- reason：用 Jarvis 的中文口吻（克制、礼貌、偶尔轻讽）写一句解释，不超过 35 字

reason 风格示例（仅作语气参考，不是固定句式）：
- "产品主打情感陪伴，孤独人群理当是首要受众，先生。"
- "加班场景下的效率诉求，职涯焦虑人群首当其冲。"
- "硬件形态本身对数码爱好者具有天然吸引力，附议。"
- "婴幼儿相关功能，亲子人群理应被纳入考量。"

严格要求：
1) 仅输出 2-3 个画像，按 score 从高到低排序
2) 只输出 JSON，不要任何解释、Markdown 代码块、称谓前缀或多余文字
3) 禁止使用 emoji、感叹号、推销用语

输出格式：
{"personas":[{"id":"lonely","score":0.86,"reason":"产品主打情感陪伴，孤独人群理当是首要受众。"},{"id":"tech-enthusiast","score":0.58,"reason":"硬件形态本身对数码爱好者具有天然吸引力，附议。"}]}`

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
    const r = await fetch(`${KIMI_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${KIMI_API_KEY}`,
      },
      body: JSON.stringify({
        model: KIMI_MODEL,
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMsg },
        ],
      }),
    })

    if (!r.ok) {
      const text = await r.text()
      console.error('[KIMI] HTTP', r.status, text.slice(0, 500))
      return res.status(502).json({ error: `KIMI 调用失败: ${r.status}`, detail: text.slice(0, 500) })
    }

    const data = await r.json()
    const content = data?.choices?.[0]?.message?.content
    if (!content) {
      return res.status(502).json({ error: 'KIMI 返回内容为空' })
    }

    let parsed
    try {
      parsed = typeof content === 'string' ? JSON.parse(content) : content
    } catch (e) {
      console.error('[KIMI] JSON 解析失败', content)
      return res.status(502).json({ error: 'KIMI 返回非 JSON', raw: content })
    }

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
    console.error('[KIMI] 请求异常', err)
    return res.status(500).json({ error: `调用 KIMI 异常: ${err?.message || err}` })
  }
})

app.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`)
  console.log(`[server] KIMI key: ${KIMI_API_KEY ? '已配置' : '未配置（请在 server/.env 设置 KIMI_API_KEY）'}`)
  console.log(`[server] model: ${KIMI_MODEL}`)
})
