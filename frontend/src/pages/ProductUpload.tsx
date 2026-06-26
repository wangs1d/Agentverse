// 产品上架页（真实数据版）
// 1) 顶部：合并后的真实产品库（内置 8 款 + 用户上传）
// 2) 底部：上传表单 → 调用 KIMI 推断画像 → 展示结果 → 合并入产品库
import { useMemo, useState, type ChangeEvent } from 'react';
import {
  ChevronDown,
  Star,
  Check,
  Package,
  FileText,
  Sparkles,
  Bot,
  Tag,
  AlertCircle,
  Plus,
  Trash2,
} from 'lucide-react';
import { useProductLib, buildUploadedProduct } from '../store/useProductLib';
import { calculateOverallMatch } from '../lib/scoreCalculator';
import { inferPersonas, type InferResult } from '../lib/matcher';
import type { Product, ProductCategory } from '../data/products';
import { PERSONAS } from '../data/personas';

/* ── Design Tokens ────────────────────────── */
const T = {
  brandBlue: 'var(--brand-blue, #2e8dff)',
  brandBlueFg: '#000000',
  textPrimary: 'var(--text-primary, #f5f5f7)',
  textSecondary: 'var(--text-secondary, #8e8e93)',
  background: 'var(--background, #000000)',
  surfaceCard: 'var(--surface-card, #1c1c1e)',
  surfaceSecondary: 'var(--surface-secondary, #1c1c1e)',
  border: 'var(--border, #3a3a3c)',
  radius: 'var(--apple-radius, 1.2rem)',
  success: '#30d158',
  successBg: 'rgba(48,209,88,0.12)',
  warning: '#ff9f0a',
  warningBg: 'rgba(255,149,10,0.12)',
};

/* ── Types ─────────────────────────────────── */
interface ProductForm {
  productName: string;
  brandName: string;
  price: string;
  description: string;
}

type FilterCategory = 'all' | ProductCategory;

/* ── Component ──────────────────────────────── */
export function ProductUpload() {
  const { products, addProduct, removeProduct, latestId } = useProductLib();

  const [category, setCategory] = useState<ProductCategory>('software');
  const [form, setForm] = useState<ProductForm>({
    productName: '',
    brandName: '',
    price: '',
    description: '',
  });
  const [dragHover, setDragHover] = useState(false);
  const [filter, setFilter] = useState<FilterCategory>('all');

  // AI 推断状态
  const [inferring, setInferring] = useState(false);
  const [inferResult, setInferResult] = useState<InferResult | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const update = (field: keyof ProductForm) => (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragHover(true);
  };
  const handleDragLeave = () => setDragHover(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragHover(false);
  };

  const handleReset = () => {
    setForm({ productName: '', brandName: '', price: '', description: '' });
    setInferResult(null);
    setSubmitted(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.productName.trim() || !form.description.trim()) return;

    setSubmitted(true);
    setInferring(true);
    setInferResult(null);

    const result = await inferPersonas(
      {
        type: category,
        brand: form.brandName,
        name: form.productName,
        desc: form.description,
        price: Number(form.price) || 0,
        image: '',
      },
      { timeoutMs: 8000 },
    );
    setInferResult(result);
    setInferring(false);
  };

  // 确认上架：合并入产品库
  const handleConfirm = () => {
    if (!inferResult) return;
    const newProduct = buildUploadedProduct({
      category,
      brand: form.brandName,
      name: form.productName,
      desc: form.description,
      price: Number(form.price) || 0,
      primaryPersonaId: inferResult.personas[0]?.id,
      secondaryPersonaIds: inferResult.personas.slice(1).map((p) => p.id),
    });
    addProduct(newProduct);
    handleReset();
  };

  /* ── derived ── */
  const visibleProducts = useMemo(
    () => (filter === 'all' ? products : products.filter((p) => p.category === filter)),
    [products, filter],
  );

  const uploadedCount = useMemo(
    () => products.filter((p) => p.id.startsWith('uploaded-')).length,
    [products],
  );

  return (
    <div
      className="min-h-screen font-sans antialiased"
      style={{ background: T.background, color: T.textPrimary }}
    >
      {/* ── Hero Section ──────────────────────────────── */}
      <section
        className="relative flex w-full items-center justify-center"
        style={{
          minHeight: '40vh',
          marginTop: 56,
          backgroundImage: "url('/assets/images/hero-dark-upload.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.6) 60%, ${T.background} 100%)`,
          }}
        />
        <div
          className="relative z-10 flex flex-col items-center justify-center px-6 text-center"
          style={{ paddingTop: 60, paddingBottom: 60 }}
        >
          <span
            className="inline-flex items-center justify-center whitespace-nowrap px-3 py-1 text-xs font-medium"
            style={{
              background: T.surfaceSecondary,
              color: T.textSecondary,
              borderRadius: 9999,
              border: `1px solid ${T.border}`,
            }}
          >
            商家后台 · 产品管理
          </span>

          <h1
            className="mt-5 font-bold tracking-tight"
            style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              color: T.textPrimary,
              lineHeight: 1.1,
              textWrap: 'balance',
              wordBreak: 'keep-all',
              overflowWrap: 'break-word',
            }}
          >
            产品上架
          </h1>
          <p
            className="mt-4 max-w-lg"
            style={{ fontSize: '1.05rem', color: T.textSecondary, lineHeight: 1.6 }}
          >
            上传产品信息，AI 自动推断目标用户画像
          </p>

          <div className="mt-8 animate-bounce opacity-40">
            <ChevronDown className="h-5 w-5" style={{ color: T.textPrimary }} />
          </div>
        </div>
      </section>

      {/* ── Section 1: Real Product Library ────────────── */}
      <section className="w-full px-6 lg:px-8" style={{ paddingTop: 60, paddingBottom: 40 }}>
        <div className="mx-auto max-w-screen-xl">
          {/* Section header */}
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="block h-6 w-1" style={{ background: T.brandBlue, borderRadius: 1 }} />
              <div>
                <h2
                  className="text-xl font-semibold tracking-tight"
                  style={{ color: T.textPrimary, textWrap: 'balance' }}
                >
                  产品库
                </h2>
                <p className="mt-0.5 text-sm" style={{ color: T.textSecondary }}>
                  {products.length} 款产品 · 其中 {uploadedCount} 款为你上传
                </p>
              </div>
            </div>

            {/* Filter */}
            <div
              className="inline-flex overflow-hidden"
              style={{ border: `1px solid ${T.border}`, borderRadius: 9999 }}
            >
              {[
                { key: 'all', label: '全部' },
                { key: 'software', label: '软件' },
                { key: 'hardware', label: '硬件' },
              ].map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFilter(f.key as FilterCategory)}
                  className="px-4 py-1.5 text-xs font-medium transition-colors duration-150"
                  style={{
                    background: filter === f.key ? T.brandBlue : 'transparent',
                    color: filter === f.key ? T.brandBlueFg : T.textSecondary,
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Product grid */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visibleProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                highlighted={p.id === latestId}
                onRemove={p.id.startsWith('uploaded-') ? () => removeProduct(p.id) : undefined}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 2: Upload Form + AI Inference ──────── */}
      <section className="w-full px-6 lg:px-8" style={{ paddingTop: 40, paddingBottom: 120 }}>
        <div className="mx-auto grid max-w-screen-xl grid-cols-1 gap-12 lg:grid-cols-10 lg:gap-16">
          {/* ── Left Column (40%) ── Upload Guide ──────────── */}
          <div className="flex flex-col gap-10 lg:col-span-4">
            <div className="flex items-center gap-3">
              <span className="block h-6 w-1" style={{ background: T.brandBlue, borderRadius: 1 }} />
              <h2
                className="text-xl font-semibold tracking-tight"
                style={{ color: T.textPrimary, textWrap: 'balance' }}
              >
                上架指引
              </h2>
            </div>

            <Step n={1} title="填写基本信息" desc="产品名称、品牌、分类与定价" />
            <Step n={2} title="AI 智能推断画像" desc="提交后自动调用 KIMI 分析目标用户" />
            <Step n={3} title="确认上架" desc="审核通过后自动获得 Agent 推荐资格" last />

            <div
              className="flex items-start gap-3 p-5"
              style={{ background: T.surfaceCard, border: `1px solid ${T.border}`, borderRadius: T.radius }}
            >
              <Star className="mt-0.5 h-5 w-5 shrink-0" style={{ color: T.brandBlue }} />
              <div>
                <h3 className="text-sm font-semibold" style={{ color: T.textPrimary }}>
                  推荐资格说明
                </h3>
                <p className="mt-1 text-sm" style={{ color: T.textSecondary, lineHeight: 1.6 }}>
                  通过审核的产品将自动匹配 8 类 C 端人格画像，Agent 在合适的时机主动推荐
                </p>
              </div>
            </div>
          </div>

          {/* ── Right Column (60%) ── Upload Form ──────────── */}
          <div className="lg:col-span-6">
            <div
              className="p-6 lg:p-8"
              style={{ background: T.surfaceCard, border: `1px solid ${T.border}`, borderRadius: T.radius }}
            >
              <h2
                className="text-xl font-semibold tracking-tight"
                style={{ color: T.textPrimary, textWrap: 'balance' }}
              >
                产品信息
              </h2>
              <p className="mt-1 text-sm" style={{ color: T.textSecondary }}>
                请填写以下信息完成产品上架
              </p>

              <form className="mt-8 flex flex-col gap-6" onSubmit={handleSubmit}>
                {/* Image dropzone */}
                <div
                  className="relative flex cursor-pointer flex-col items-center justify-center transition-colors duration-200"
                  style={{
                    aspectRatio: '16 / 9',
                    border: `2px dashed ${dragHover ? T.brandBlue : T.border}`,
                    borderRadius: `calc(${T.radius} * 0.5)`,
                  }}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('file-input')?.click()}
                >
                  <input id="file-input" type="file" accept="image/*" className="hidden" />
                  <Package className="mb-3 h-12 w-12" style={{ color: T.textSecondary }} />
                  <span className="text-sm" style={{ color: T.textSecondary }}>
                    拖放或点击上传产品封面（可选）
                  </span>
                </div>

                {/* Row: Category + Product Name */}
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium" style={{ color: T.textSecondary }}>
                      分类选择
                    </label>
                    <div
                      className="inline-flex overflow-hidden"
                      style={{ border: `1px solid ${T.border}`, borderRadius: `calc(${T.radius} * 0.5)` }}
                    >
                      <button
                        type="button"
                        className="flex items-center justify-center whitespace-nowrap px-5 py-2.5 text-sm font-medium transition-colors duration-150"
                        style={{
                          background: category === 'software' ? T.brandBlue : T.surfaceSecondary,
                          color: category === 'software' ? T.brandBlueFg : T.textSecondary,
                        }}
                        onClick={() => setCategory('software')}
                      >
                        <FileText className="mr-1.5 h-4 w-4" />
                        软件
                      </button>
                      <button
                        type="button"
                        className="flex items-center justify-center whitespace-nowrap px-5 py-2.5 text-sm font-medium transition-colors duration-150"
                        style={{
                          background: category === 'hardware' ? T.brandBlue : T.surfaceSecondary,
                          color: category === 'hardware' ? T.brandBlueFg : T.textSecondary,
                          borderLeft: `1px solid ${T.border}`,
                        }}
                        onClick={() => setCategory('hardware')}
                      >
                        <Package className="mr-1.5 h-4 w-4" />
                        硬件
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="product-name" className="text-xs font-medium" style={{ color: T.textSecondary }}>
                      产品名称
                    </label>
                    <input
                      id="product-name"
                      type="text"
                      placeholder="例如：AIChat 智能客服"
                      value={form.productName}
                      onChange={update('productName')}
                      className="h-11 px-4 text-sm outline-none transition-colors duration-150"
                      style={{
                        background: T.surfaceSecondary,
                        border: `1px solid ${T.border}`,
                        borderRadius: `calc(${T.radius} * 0.5)`,
                        color: T.textPrimary,
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = T.brandBlue
                        e.currentTarget.style.boxShadow = '0 0 0 2px rgba(46,141,255,0.15)'
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = T.border
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    />
                  </div>
                </div>

                {/* Row: Brand + Price */}
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="brand-name" className="text-xs font-medium" style={{ color: T.textSecondary }}>
                      品牌名称
                    </label>
                    <input
                      id="brand-name"
                      type="text"
                      placeholder="例如：灵犀智能"
                      value={form.brandName}
                      onChange={update('brandName')}
                      className="h-11 px-4 text-sm outline-none transition-colors duration-150"
                      style={{
                        background: T.surfaceSecondary,
                        border: `1px solid ${T.border}`,
                        borderRadius: `calc(${T.radius} * 0.5)`,
                        color: T.textPrimary,
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = T.brandBlue
                        e.currentTarget.style.boxShadow = '0 0 0 2px rgba(46,141,255,0.15)'
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = T.border
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="price" className="text-xs font-medium" style={{ color: T.textSecondary }}>
                      价格
                    </label>
                    <div
                      className="flex h-11 items-center overflow-hidden"
                      style={{ border: `1px solid ${T.border}`, borderRadius: `calc(${T.radius} * 0.5)` }}
                    >
                      <span
                        className="flex h-full items-center justify-center px-3 text-sm font-medium"
                        style={{
                          background: T.surfaceSecondary,
                          color: T.textSecondary,
                          borderRight: `1px solid ${T.border}`,
                        }}
                      >
                        ¥
                      </span>
                      <input
                        id="price"
                        type="text"
                        placeholder="1999"
                        value={form.price}
                        onChange={update('price')}
                        className="h-full flex-1 px-4 text-sm outline-none"
                        style={{ background: T.surfaceSecondary, color: T.textPrimary, border: 'none' }}
                        onFocus={(e) => {
                          const p = e.currentTarget.parentElement
                          if (p) {
                            p.style.borderColor = T.brandBlue
                            p.style.boxShadow = '0 0 0 2px rgba(46,141,255,0.15)'
                          }
                        }}
                        onBlur={(e) => {
                          const p = e.currentTarget.parentElement
                          if (p) {
                            p.style.borderColor = T.border
                            p.style.boxShadow = 'none'
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="description" className="text-xs font-medium" style={{ color: T.textSecondary }}>
                    产品描述
                  </label>
                  <textarea
                    id="description"
                    rows={3}
                    placeholder="描述产品的主要功能、卖点与目标场景（AI 将据此推断用户画像）"
                    value={form.description}
                    onChange={update('description')}
                    className="resize-none px-4 py-3 text-sm outline-none transition-colors duration-150"
                    style={{
                      background: T.surfaceSecondary,
                      border: `1px solid ${T.border}`,
                      borderRadius: `calc(${T.radius} * 0.5)`,
                      color: T.textPrimary,
                      lineHeight: 1.6,
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = T.brandBlue
                      e.currentTarget.style.boxShadow = '0 0 0 2px rgba(46,141,255,0.15)'
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = T.border
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  />
                </div>

                {/* AI Inference Result Panel */}
                {submitted && (
                  <InferencePanel
                    inferring={inferring}
                    result={inferResult}
                    onConfirm={handleConfirm}
                    onRetry={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
                    onCancel={handleReset}
                  />
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-4 pt-2">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center whitespace-nowrap px-6 py-3 text-sm font-medium transition-colors duration-150"
                    style={{
                      background: 'transparent',
                      color: T.textSecondary,
                      border: 'none',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = T.textPrimary
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = T.textSecondary
                    }}
                    onClick={handleReset}
                  >
                    重置
                  </button>
                  <button
                    type="submit"
                    disabled={inferring || !form.productName.trim() || !form.description.trim()}
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap px-7 py-3.5 text-base font-semibold transition-all duration-150"
                    style={{
                      background: T.brandBlue,
                      color: T.brandBlueFg,
                      border: 'none',
                      borderRadius: `calc(${T.radius} * 2)`,
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px -2px rgba(0,0,0,0.4)',
                      opacity: inferring || !form.productName.trim() || !form.description.trim() ? 0.5 : 1,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-1px)'
                      e.currentTarget.style.filter = 'brightness(1.08)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.filter = 'none'
                    }}
                  >
                    {inferring ? (
                      <>
                        <Sparkles className="h-4 w-4 animate-pulse" />
                        AI 推断中…
                      </>
                    ) : submitted ? (
                      <>
                        <Sparkles className="h-4 w-4" />
                        重新推断
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        提交审核
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────── */}
      <footer className="w-full border-t px-6 py-6" style={{ borderColor: T.border }}>
        <p className="text-center text-xs" style={{ color: T.textSecondary }}>
          &copy; 2025 Agentverse &middot; 服务条款 &middot; 隐私政策
        </p>
      </footer>
    </div>
  );
}

/* ── Sub Components ──────────────────────────── */

function Step({ n, title, desc, last = false }: { n: number; title: string; desc: string; last?: boolean }) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center"
          style={{ background: T.brandBlue, borderRadius: 9999 }}
        >
          <span className="text-sm font-bold" style={{ color: T.brandBlueFg }}>
            {n}
          </span>
        </div>
        {!last && <div className="mt-2 w-px flex-1" style={{ background: T.border }} />}
      </div>
      <div className={last ? '' : 'pb-8'}>
        <h3 className="text-base font-semibold" style={{ color: T.textPrimary }}>
          {title}
        </h3>
        <p className="mt-1 text-sm" style={{ color: T.textSecondary, lineHeight: 1.6 }}>
          {desc}
        </p>
      </div>
    </div>
  );
}

function ProductCard({
  product,
  highlighted,
  onRemove,
}: {
  product: Product
  highlighted: boolean
  onRemove?: () => void
}) {
  const overall = useMemo(() => calculateOverallMatch(product), [product]);
  const isUploaded = product.id.startsWith('uploaded-');
  const isPending = product.status === 'pending';

  return (
    <div
      className="flex flex-col overflow-hidden transition-all"
      style={{
        background: T.surfaceCard,
        border: `1px solid ${highlighted ? T.brandBlue : T.border}`,
        borderRadius: `calc(${T.radius} * 0.6)`,
        boxShadow: highlighted ? '0 0 0 1px rgba(46,141,255,0.4)' : 'none',
      }}
    >
      <div
        className="relative aspect-[16/9] overflow-hidden"
        style={{ background: T.surfaceSecondary }}
      >
        <img src={product.image} alt={product.name} className="h-full w-full object-cover" loading="lazy" />
        {/* Score badge */}
        <div
          className="absolute right-2 top-2 flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium"
          style={{
            background:
              overall.avgScore >= 60
                ? 'rgba(46,141,255,0.2)'
                : overall.avgScore >= 40
                  ? 'rgba(255,159,10,0.2)'
                  : 'rgba(58,58,60,0.7)',
            color:
              overall.avgScore >= 60
                ? T.brandBlue
                : overall.avgScore >= 40
                  ? T.warning
                  : T.textSecondary,
          }}
        >
          <Sparkles className="h-2.5 w-2.5" />
          <span className="font-mono">{overall.avgScore}</span>
        </div>
        {/* uploaded tag */}
        {isUploaded && (
          <div
            className="absolute left-2 top-2 flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium"
            style={{ background: 'rgba(255,159,10,0.2)', color: T.warning }}
          >
            <Plus className="h-2.5 w-2.5" />
            我的
          </div>
        )}
        {/* bottom info */}
        <div
          className="absolute inset-x-0 bottom-0 px-3 py-2"
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)',
          }}
        >
          <div className="text-[10px]" style={{ color: T.textSecondary }}>
            {product.brand}
          </div>
          <div className="text-xs font-medium" style={{ color: T.textPrimary }}>
            {product.name}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 p-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px]" style={{ color: T.textSecondary }}>
              定价
            </div>
            <div className="text-sm font-semibold" style={{ color: T.textPrimary }}>
              <span style={{ color: T.brandBlue }}>¥{product.price.toLocaleString()}</span>
              <span className="ml-1 text-[10px]" style={{ color: T.textSecondary }}>
                {product.priceUnit}
              </span>
            </div>
          </div>
          <div className="text-right">
            {isPending ? (
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                style={{ background: T.warningBg, color: T.warning }}
              >
                审核中
              </span>
            ) : (
              <>
                <div className="text-[10px]" style={{ color: T.textSecondary }}>
                  月销
                </div>
                <div className="font-mono text-[10px]" style={{ color: T.textPrimary }}>
                  {product.monthlySales.toLocaleString()}
                </div>
              </>
            )}
          </div>
        </div>
        {/* tag chips */}
        {product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {product.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px]"
                style={{ background: T.surfaceSecondary, color: T.textSecondary, borderRadius: 4 }}
              >
                <Tag className="h-2.5 w-2.5" />
                {tag}
              </span>
            ))}
          </div>
        )}
        {/* top persona chip */}
        <div
          className="flex items-center gap-1.5 rounded px-2 py-1 text-[10px]"
          style={{ background: T.surfaceSecondary }}
        >
          <span style={{ color: T.brandBlue }}>主匹配</span>
          <span style={{ color: T.textPrimary }}>{overall.top.persona.emoji} {overall.top.persona.label}</span>
          <span className="ml-auto font-mono" style={{ color: T.brandBlue }}>
            {overall.top.score}
          </span>
        </div>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="flex items-center justify-center gap-1 py-1 text-[10px] transition-colors duration-150"
            style={{ color: T.textSecondary, background: 'transparent', border: 'none', cursor: 'pointer' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#ff453a'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = T.textSecondary
            }}
          >
            <Trash2 className="h-3 w-3" />
            移除
          </button>
        )}
      </div>
    </div>
  );
}

function InferencePanel({
  inferring,
  result,
  onConfirm,
  onRetry,
  onCancel,
}: {
  inferring: boolean
  result: InferResult | null
  onConfirm: () => void
  onRetry: () => void
  onCancel: () => void
}) {
  if (inferring) {
    return (
      <div
        className="flex items-center gap-3 p-4"
        style={{
          background: T.surfaceSecondary,
          border: `1px solid ${T.border}`,
          borderRadius: `calc(${T.radius} * 0.5)`,
        }}
      >
        <Bot className="h-5 w-5 animate-pulse" style={{ color: T.brandBlue }} />
        <div>
          <div className="text-sm font-medium" style={{ color: T.textPrimary }}>
            正在调用 AI 推断目标用户画像…
          </div>
          <div className="text-xs" style={{ color: T.textSecondary }}>
            基于产品描述分析 8 类 C 端人格的匹配度
          </div>
        </div>
      </div>
    )
  }

  if (!result) return null

  return (
    <div
      className="flex flex-col gap-3 p-4"
      style={{
        background: T.surfaceSecondary,
        border: `1px solid ${T.border}`,
        borderRadius: `calc(${T.radius} * 0.5)`,
      }}
    >
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4" style={{ color: T.brandBlue }} />
        <span className="text-sm font-semibold" style={{ color: T.textPrimary }}>
          AI 推断结果
        </span>
        <span
          className="ml-auto rounded px-2 py-0.5 text-[10px] font-medium"
          style={{
            background: result.source === 'ai' ? 'rgba(46,141,255,0.15)' : T.warningBg,
            color: result.source === 'ai' ? T.brandBlue : T.warning,
          }}
        >
          {result.source === 'ai' ? 'KIMI 实时推断' : '规则兜底'}
        </span>
      </div>

      {result.source === 'rule' && result.detail && (
        <div
          className="flex items-start gap-2 rounded p-2 text-[11px]"
          style={{ background: T.warningBg, color: T.warning }}
        >
          <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
          <span>{result.detail}</span>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {result.personas.map((p) => {
          const matched = PERSONAS.find((x) => x.id === p.id)
          return (
            <div
              key={p.id}
              className="flex items-center gap-3 rounded p-2.5"
              style={{ background: T.background, border: `1px solid ${T.border}` }}
            >
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-sm"
                style={{ background: 'rgba(46,141,255,0.15)' }}
              >
                {matched?.emoji || '·'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium" style={{ color: T.textPrimary }}>
                  {p.label}
                </div>
                {p.reason && (
                  <div className="mt-0.5 text-[11px]" style={{ color: T.textSecondary, lineHeight: 1.5 }}>
                    {p.reason}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <div
                  className="h-1.5 w-16 overflow-hidden rounded-full"
                  style={{ background: T.border }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.round((p.score ?? 0.5) * 100)}%`,
                      background: T.brandBlue,
                    }}
                  />
                </div>
                <span
                  className="w-9 text-right font-mono text-xs font-semibold"
                  style={{ color: T.brandBlue }}
                >
                  {Math.round((p.score ?? 0.5) * 100)}%
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        <button
          type="button"
          className="px-4 py-2 text-xs font-medium transition-colors duration-150"
          style={{ background: 'transparent', color: T.textSecondary, border: 'none', cursor: 'pointer' }}
          onClick={onCancel}
        >
          取消
        </button>
        <button
          type="button"
          className="px-4 py-2 text-xs font-medium transition-colors duration-150"
          style={{
            background: 'transparent',
            color: T.textPrimary,
            border: `1px solid ${T.border}`,
            borderRadius: 9999,
            cursor: 'pointer',
          }}
          onClick={onRetry}
        >
          重新推断
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold transition-all duration-150"
          style={{
            background: T.brandBlue,
            color: T.brandBlueFg,
            border: 'none',
            borderRadius: 9999,
            cursor: 'pointer',
            boxShadow: '0 2px 8px -2px rgba(0,0,0,0.4)',
          }}
          onClick={onConfirm}
        >
          <Check className="h-3.5 w-3.5" />
          确认上架
        </button>
      </div>
    </div>
  )
}
