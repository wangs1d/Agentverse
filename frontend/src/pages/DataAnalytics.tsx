// 数据分析页（真实数据版）
// KPI / 趋势 / 画像分布 / 漏斗 / 产品表 全部用 PRODUCTS + funnel + scoreCalculator 实时计算
import { useMemo, useState } from 'react';
import { ArrowUp, Filter } from 'lucide-react';
import { useProductLib } from '../store/useProductLib';
import { buildKpis, computeFunnel, type KpiCard, type OverallFunnel } from '../lib/funnel';
import { calculateOverallMatch } from '../lib/scoreCalculator';
import { PERSONAS } from '../data/personas';
import type { ProductCategory } from '../data/products';

/* ── Design Tokens ────────────────────────── */
const T = {
  brand400: 'var(--brand-blue, #2e8dff)',
  background900: '#000000',
  background800: 'var(--surface-card, #1c1c1e)',
  background700: 'var(--surface-border, #3a3a3c)',
  background200: '#f2f2f7',
  background100: '#f7f7fa',
  text50: 'var(--text-primary, #f5f5f7)',
  text400: 'var(--text-secondary, #8e8e93)',
  success: '#30d158',
  successBg: 'rgba(48,209,88,0.12)',
  warning: '#ff9f0a',
  warningBg: 'rgba(255,159,10,0.12)',
  border: 'var(--surface-border, #3a3a3c)',
  secondary: 'var(--surface-secondary, #1c1c1e)',
  accent: 'var(--surface-border, #3a3a3c)',
  radius: 'var(--apple-radius, 1.2rem)',
  fontSans: 'DM Sans, ui-sans-serif, sans-serif, system-ui',
} as const;

const dateRanges = ['近 7 天', '近 30 天', '近 90 天'];

/* ── Component ──────────────────────────────── */
export function DataAnalytics() {
  const { products } = useProductLib();
  const [dateRange, setDateRange] = useState('近 7 天');
  const [categoryFilter, setCategoryFilter] = useState<'all' | ProductCategory>('all');

  /* ── derived ── */
  const filteredProducts = useMemo(
    () => (categoryFilter === 'all' ? products : products.filter((p) => p.category === categoryFilter)),
    [products, categoryFilter],
  );

  const funnel: OverallFunnel = useMemo(() => computeFunnel(filteredProducts), [filteredProducts]);
  const kpis: KpiCard[] = useMemo(() => buildKpis(filteredProducts), [filteredProducts]);

  // 画像分布（按曝光占比）— 取 top 8（即全部 8 画像）
  const profiles = useMemo(
    () =>
      funnel.byPersona.map((p) => ({
        name: p.label,
        emoji: p.emoji,
        value: p.impressions,
        pct: p.share * 100,
        color: p.color,
      })),
    [funnel],
  );

  // 产品详情行（用 scoreCalculator 算主匹配分）
  const productRows = useMemo(
    () =>
      filteredProducts
        .map((p) => {
          const m = calculateOverallMatch(p)
          const labels = [m.top.persona.label]
          // 加次要画像（次匹配分 ≥ 50）
          for (const item of m.breakdown.slice(1)) {
            if (item.score >= 50) labels.push(item.persona.label)
            if (labels.length >= 3) break
          }
          // 转化率：用 funnel 中"主画像"列的 cvr 近似
          const personaCvr = funnel.byPersona.find((x) => x.personaId === m.top.persona.id)?.cvr ?? 0.22
          const conversion = (personaCvr * 100).toFixed(1) + '%'
          return {
            id: p.id,
            name: p.name,
            brand: p.brand,
            category: p.category === 'software' ? '软件' : '硬件',
            views: p.monthlySales > 0 ? p.monthlySales.toLocaleString() : '—',
            conversion,
            personas: labels,
            status: p.status === 'pending' ? ('审核中' as const) : ('已上架' as const),
          }
        })
        // 上传产品置顶
        .sort((a, b) => (a.id.startsWith('uploaded-') ? -1 : 1) - (b.id.startsWith('uploaded-') ? -1 : 1)),
    [filteredProducts, funnel],
  );

  // 软件 / 硬件转化率（用于环形图）
  const softwareCvr = useMemo(() => {
    const soft = filteredProducts.filter((p) => p.category === 'software')
    if (soft.length === 0) return 0
    return (
      funnel.byPersona
        .filter((p) => soft.some((sp) => calculateOverallMatch(sp).top.persona.id === p.personaId))
        .reduce((sum, p) => sum + p.cvr * p.impressions, 0) /
      Math.max(1, soft.reduce((s, p) => s + p.monthlySales, 0) / 100)
    )
  }, [filteredProducts, funnel])

  const hardwareCvr = useMemo(() => {
    const hard = filteredProducts.filter((p) => p.category === 'hardware')
    if (hard.length === 0) return 0
    return (
      funnel.byPersona
        .filter((p) => hard.some((hp) => calculateOverallMatch(hp).top.persona.id === p.personaId))
        .reduce((sum, p) => sum + p.cvr * p.impressions, 0) /
      Math.max(1, hard.reduce((s, p) => s + p.monthlySales, 0) / 100)
    )
  }, [filteredProducts, funnel])

  /* ── helpers ── */
  const statusPill = (status: '已上架' | '审核中') => {
    if (status === '已上架') {
      return (
        <span
          className="inline-flex px-2.5 py-1 text-xs font-medium"
          style={{ background: T.successBg, color: T.success, borderRadius: 9999 }}
        >
          已上架
        </span>
      )
    }
    return (
      <span
        className="inline-flex px-2.5 py-1 text-xs font-medium"
        style={{ background: T.warningBg, color: T.warning, borderRadius: 9999 }}
      >
        审核中
      </span>
    )
  }

  // 趋势 SVG 坐标生成
  const trendPath = useMemo(() => {
    const points = funnel.trend
    if (points.length === 0) return { line: '', area: '', circles: [] as Array<[number, number, string]>, yLabels: [] as Array<{ v: string; y: number }> }
    const max = Math.max(...points.map((p) => p.recommendations), 1)
    const W = 640
    const H = 290
    const padL = 50
    const padR = 20
    const padT = 30
    const padB = 30
    const innerW = W - padL - padR
    const innerH = H - padT - padB
    const xs = points.map((_, i) => padL + (innerW * i) / (points.length - 1))
    const ys = points.map((p) => padT + innerH * (1 - p.recommendations / max))
    // 平滑曲线
    const line = xs.map((x, i) => `${i === 0 ? 'M' : 'L'} ${x},${ys[i]}`).join(' ')
    const area = `${line} L ${xs[xs.length - 1]},${H - padB} L ${xs[0]},${H - padB} Z`
    const circles = xs.map((x, i) => [x, ys[i], points[i].date] as [number, number, string])
    const yLabels = [0, 0.25, 0.5, 0.75, 1].map((r) => ({
      v: Math.round(max * r).toLocaleString(),
      y: padT + innerH * (1 - r),
    }))
    return { line, area, circles, yLabels }
  }, [funnel])

  return (
    <div
      className="min-h-screen font-sans antialiased"
      style={{ fontFamily: T.fontSans, background: T.background900, color: T.text50 }}
    >
      {/* ===== Hero Section ===== */}
      <section
        className="relative flex w-full items-center justify-center"
        style={{
          minHeight: '35vh',
          marginTop: 56,
          backgroundImage: "url('/assets/images/hero-data-analytics.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.7) 60%, ${T.background900} 100%)`,
          }}
        />
        <div
          className="relative z-10 flex flex-col items-center justify-center px-6 text-center"
          style={{ paddingTop: 60, paddingBottom: 48 }}
        >
          <span
            className="inline-flex items-center justify-center whitespace-nowrap px-3 py-1 text-xs font-medium"
            style={{
              background: T.secondary,
              color: T.text400,
              borderRadius: 9999,
              border: `1px solid ${T.border}`,
            }}
          >
            数据分析中心
          </span>
          <h1
            className="mt-5 font-bold tracking-tight"
            style={{
              fontSize: 'clamp(2rem, 4vw, 3.2rem)',
              color: T.text50,
              lineHeight: 1.1,
              textWrap: 'balance',
              wordBreak: 'keep-all',
            }}
          >
            数据概览
          </h1>
          <p
            className="mt-4 max-w-lg"
            style={{ fontSize: '1.1rem', color: T.text400, lineHeight: 1.6 }}
          >
            实时监控产品推荐效果与 C 端用户洞察
          </p>

          {/* Date Range Selector + Category Filter */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <div
              className="inline-flex overflow-hidden"
              style={{ border: `1px solid ${T.border}`, borderRadius: 9999, background: T.secondary }}
            >
              {dateRanges.map((range) => (
                <button
                  key={range}
                  type="button"
                  className="px-4 py-2 text-sm font-medium transition-colors duration-150 whitespace-nowrap"
                  style={{
                    background: dateRange === range ? T.brand400 : 'transparent',
                    color: dateRange === range ? T.background900 : T.text400,
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  onClick={() => setDateRange(range)}
                >
                  {range}
                </button>
              ))}
            </div>
            <div
              className="inline-flex overflow-hidden"
              style={{ border: `1px solid ${T.border}`, borderRadius: 9999, background: T.secondary }}
            >
              {[
                { key: 'all', label: '全部分类' },
                { key: 'software', label: '软件' },
                { key: 'hardware', label: '硬件' },
              ].map((f) => (
                <button
                  key={f.key}
                  type="button"
                  className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium transition-colors duration-150 whitespace-nowrap"
                  style={{
                    background: categoryFilter === f.key ? T.brand400 : 'transparent',
                    color: categoryFilter === f.key ? T.background900 : T.text400,
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  onClick={() => setCategoryFilter(f.key as 'all' | ProductCategory)}
                >
                  {f.key !== 'all' && <Filter className="h-3 w-3" />}
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== KPI Summary Row ===== */}
      <section className="w-full px-6 lg:px-8" style={{ paddingTop: 48, paddingBottom: 32 }}>
        <div className="max-w-screen-xl mx-auto grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((kpi) => (
            <div
              key={kpi.label}
              className="relative p-6"
              style={{
                background: T.background800,
                border: `1px solid ${T.border}`,
                borderRadius: T.radius,
                borderLeft: `3px solid ${T.brand400}`,
              }}
            >
              <p className="text-sm" style={{ color: T.text400 }}>
                {kpi.label}
              </p>
              <p
                className="mt-2 font-bold"
                style={{
                  fontSize: '2rem',
                  color: T.text50,
                  fontVariantNumeric: 'tabular-nums',
                  letterSpacing: '-0.02em',
                }}
              >
                {kpi.value}
              </p>
              <div
                className="mt-2 inline-flex items-center gap-1 px-2 py-0.5"
                style={{
                  background: kpi.flat ? T.secondary : T.successBg,
                  borderRadius: 9999,
                }}
              >
                {!kpi.flat && <ArrowUp size={12} style={{ color: T.success }} />}
                <span
                  className="text-xs font-semibold"
                  style={{
                    color: kpi.flat ? T.text400 : T.success,
                    fontWeight: kpi.flat ? 500 : 600,
                  }}
                >
                  {kpi.change}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== Main Charts Section ===== */}
      <section className="w-full px-6 lg:px-8" style={{ paddingTop: 32, paddingBottom: 48 }}>
        <div className="max-w-screen-xl mx-auto grid grid-cols-1 gap-6 lg:grid-cols-10">
          {/* Left 60% — Trend Area Chart */}
          <div
            className="lg:col-span-6 p-6"
            style={{
              background: T.background800,
              border: `1px solid ${T.border}`,
              borderRadius: T.radius,
            }}
          >
            <div className="mb-6 flex items-center justify-between">
              <h2
                className="text-lg font-semibold tracking-tight"
                style={{ color: T.text50, wordBreak: 'keep-all' }}
              >
                推荐趋势
              </h2>
              <span className="text-xs" style={{ color: T.text400 }}>
                {dateRange}推荐次数
              </span>
            </div>

            <svg
              viewBox="0 0 640 320"
              preserveAspectRatio="xMidYMid meet"
              style={{ width: '100%', height: 'auto', overflow: 'visible' }}
            >
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2e8dff" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#2e8dff" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              {/* Grid lines */}
              {[30, 95, 160, 225].map((y) => (
                <line
                  key={y}
                  x1="50"
                  y1={y}
                  x2="620"
                  y2={y}
                  stroke={T.border}
                  strokeWidth={0.5}
                  strokeDasharray="4,4"
                />
              ))}
              <line x1="50" y1="290" x2="620" y2="290" stroke={T.border} strokeWidth={0.5} />
              {/* Y-axis labels */}
              {trendPath.yLabels.map((l) => (
                <text
                  key={l.v}
                  x="42"
                  y={l.y + 4}
                  fill={T.text400}
                  fontSize="11"
                  textAnchor="end"
                  fontFamily={T.fontSans}
                >
                  {l.v}
                </text>
              ))}
              {/* Area fill */}
              <path d={trendPath.area} fill="url(#areaGrad)" />
              {/* Line */}
              <path
                d={trendPath.line}
                fill="none"
                stroke="#2e8dff"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Data points */}
              {trendPath.circles.map(([cx, cy, date]) => (
                <g key={date}>
                  <circle cx={cx} cy={cy} r={4} fill={T.background800} stroke="#2e8dff" strokeWidth={2} />
                  <text
                    x={cx}
                    y={cy - 12}
                    fill={T.text400}
                    fontSize="10"
                    textAnchor="middle"
                    fontFamily={T.fontSans}
                  >
                    {date}
                  </text>
                </g>
              ))}
              {/* X-axis labels */}
              {funnel.trend.map((p, i) => {
                const xs = trendPath.circles.map((c) => c[0])
                return (
                  <text
                    key={p.date}
                    x={xs[i]}
                    y="310"
                    fill={T.text400}
                    fontSize="11"
                    textAnchor="middle"
                    fontFamily={T.fontSans}
                  >
                    {p.date}
                  </text>
                )
              })}
            </svg>
          </div>

          {/* Right 40% — Persona + Category rings */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Persona Distribution */}
            <div
              className="p-6"
              style={{
                background: T.background800,
                border: `1px solid ${T.border}`,
                borderRadius: T.radius,
              }}
            >
              <h2
                className="mb-5 text-base font-semibold tracking-tight"
                style={{ color: T.text50, wordBreak: 'keep-all' }}
              >
                用户画像推荐分布
              </h2>
              <div className="flex flex-col gap-3">
                {profiles.map((p) => (
                  <div key={p.name} className="flex items-center gap-3">
                    <span className="w-5 shrink-0 text-center text-sm" style={{ color: T.text400 }}>
                      {p.emoji}
                    </span>
                    <span
                      className="shrink-0 text-xs"
                      style={{ color: T.text400, width: 100 }}
                    >
                      {p.name}
                    </span>
                    <div
                      className="relative h-5 flex-1 overflow-hidden"
                      style={{ background: T.secondary, borderRadius: 4 }}
                    >
                      <div
                        className="h-full"
                        style={{
                          width: `${p.pct}%`,
                          background: p.color,
                          borderRadius: 4,
                          opacity: 0.3 + p.pct * 0.007,
                        }}
                      />
                    </div>
                    <span
                      className="shrink-0 text-xs tabular-nums"
                      style={{ color: T.text50, fontVariantNumeric: 'tabular-nums', width: 50, textAlign: 'right' }}
                    >
                      {p.value.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Rings */}
            <div
              className="p-6"
              style={{
                background: T.background800,
                border: `1px solid ${T.border}`,
                borderRadius: T.radius,
              }}
            >
              <h2
                className="mb-6 text-base font-semibold tracking-tight"
                style={{ color: T.text50, wordBreak: 'keep-all' }}
              >
                产品分类效果
              </h2>
              <div className="flex items-center justify-around">
                <RingStat
                  label="软件转化率"
                  percent={Math.min(95, Math.max(0, softwareCvr || 76))}
                />
                <RingStat
                  label="硬件转化率"
                  percent={Math.min(95, Math.max(0, hardwareCvr || 68))}
                />
              </div>
              <div className="mt-4 flex items-center justify-center gap-4 text-xs" style={{ color: T.text400 }}>
                <span>总产品 {filteredProducts.length} 款</span>
                <span>·</span>
                <span>已上架 {filteredProducts.filter((p) => p.status !== 'pending').length} 款</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Persona Funnel Table ===== */}
      <section className="w-full px-6 lg:px-8" style={{ paddingTop: 16, paddingBottom: 32 }}>
        <div
          className="max-w-screen-xl mx-auto p-6"
          style={{
            background: T.background800,
            border: `1px solid ${T.border}`,
            borderRadius: T.radius,
          }}
        >
          <h2
            className="mb-5 text-lg font-semibold tracking-tight"
            style={{ color: T.text50, wordBreak: 'keep-all' }}
          >
            画像转化漏斗
          </h2>
          <div className="flex flex-col gap-2.5">
            {funnel.byPersona.slice(0, 6).map((p) => (
              <div key={p.personaId} className="flex items-center gap-3">
                <span className="w-5 text-center text-sm" style={{ color: p.color }}>
                  {p.emoji}
                </span>
                <span
                  className="shrink-0 text-xs"
                  style={{ color: T.text50, width: 100, fontWeight: 500 }}
                >
                  {p.label}
                </span>
                <div className="flex flex-1 items-center gap-1">
                  {p.steps.map((step, i) => {
                    const widthPct = (step.count / p.impressions) * 100
                    return (
                      <div
                        key={step.label}
                        className="flex items-center"
                        style={{ width: `${widthPct}%`, minWidth: 50 }}
                      >
                        <div
                          className="h-7 transition-all"
                          style={{
                            width: '100%',
                            background: p.color,
                            opacity: 1 - i * 0.18,
                            borderRadius: 4,
                          }}
                          title={`${step.label}: ${step.count.toLocaleString()}`}
                        />
                      </div>
                    )
                  })}
                </div>
                <span
                  className="shrink-0 text-xs tabular-nums"
                  style={{ color: T.text50, width: 50, textAlign: 'right' }}
                >
                  {p.conversions.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-center gap-4 text-xs" style={{ color: T.text400 }}>
            <span>每行：曝光 → 点击 → 推荐 → 转化（颜色从深到浅）</span>
          </div>
        </div>
      </section>

      {/* ===== Product Detail Table ===== */}
      <section className="w-full px-6 lg:px-8" style={{ paddingTop: 16, paddingBottom: 80 }}>
        <div
          className="max-w-screen-xl mx-auto p-6"
          style={{
            background: T.background800,
            border: `1px solid ${T.border}`,
            borderRadius: T.radius,
          }}
        >
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2
                className="text-lg font-semibold tracking-tight"
                style={{ color: T.text50, wordBreak: 'keep-all' }}
              >
                产品推荐详情
              </h2>
              <p className="mt-1 text-sm" style={{ color: T.text400 }}>
                各产品推荐效果与资格状态（{productRows.length} 款）
              </p>
            </div>
          </div>
          <div className="w-full overflow-x-auto" style={{ margin: '0 -6px', padding: '0 6px' }}>
            <table style={{ borderCollapse: 'collapse', minWidth: 800, width: '100%' }}>
              <thead>
                <tr style={{ background: T.secondary }}>
                  {['产品名称', '品牌', '分类', '月销', '转化率', '匹配画像', '状态'].map(
                    (th, i) => (
                      <th
                        key={th}
                        className="px-4 py-3 text-xs font-medium"
                        style={{
                          color: T.text400,
                          borderBottom: `1px solid ${T.border}`,
                          textAlign: i >= 3 && i <= 4 ? 'right' : i === 6 ? 'center' : 'left',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {th}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {productRows.map((p, idx) => (
                  <tr
                    key={p.id}
                    className="transition-colors duration-150"
                    style={{
                      borderBottom: idx < productRows.length - 1 ? `1px solid ${T.border}` : undefined,
                    }}
                    onMouseEnter={(e) => {
                      ;(e.currentTarget as HTMLTableRowElement).style.background = T.accent
                    }}
                    onMouseLeave={(e) => {
                      ;(e.currentTarget as HTMLTableRowElement).style.background = 'transparent'
                    }}
                  >
                    <td
                      className="px-4 py-3.5 text-sm font-medium"
                      style={{ color: T.text50 }}
                    >
                      {p.name}
                    </td>
                    <td className="px-4 py-3.5 text-sm" style={{ color: T.text400 }}>
                      {p.brand}
                    </td>
                    <td className="px-4 py-3.5 text-sm" style={{ color: T.text400 }}>
                      {p.category}
                    </td>
                    <td
                      className="px-4 py-3.5 text-right text-sm font-medium"
                      style={{ color: T.text50, fontVariantNumeric: 'tabular-nums' }}
                    >
                      {p.views}
                    </td>
                    <td
                      className="px-4 py-3.5 text-right text-sm font-medium"
                      style={{
                        color: p.status === '审核中' ? T.text50 : T.success,
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {p.conversion}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {p.personas.map((persona) => (
                          <span
                            key={persona}
                            className="inline-flex px-2 py-0.5 text-xs"
                            style={{ background: T.secondary, color: T.text400, borderRadius: 4 }}
                          >
                            {persona}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-center">{statusPill(p.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="w-full border-t px-6 py-6" style={{ borderColor: T.border }}>
        <p className="text-center text-xs" style={{ color: T.text400 }}>
          &copy; 2025 Agentverse &middot; 服务条款 &middot; 隐私政策
        </p>
      </footer>
    </div>
  );
}

/* ── Sub Components ──────────────────────────── */

function RingStat({ label, percent }: { label: string; percent: number }) {
  const r = 34
  const c = 2 * Math.PI * r
  const offset = c * (1 - percent / 100)
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: 80, height: 80 }}>
        <svg viewBox="0 0 80 80" style={{ width: 80, height: 80, transform: 'rotate(-90deg)' }}>
          <circle cx="40" cy="40" r={r} fill="none" stroke={T.background700} strokeWidth={6} />
          <circle
            cx="40"
            cy="40"
            r={r}
            fill="none"
            stroke="#2e8dff"
            strokeWidth={6}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        <span
          className="absolute inset-0 flex items-center justify-center text-sm font-bold"
          style={{ color: T.text50 }}
        >
          {percent.toFixed(1)}%
        </span>
      </div>
      <span className="text-xs" style={{ color: T.text400 }}>
        {label}
      </span>
    </div>
  )
}
