import { usePromoStore } from '../../store/usePromoStore'
import { CollapsiblePanel } from '../ui/CollapsiblePanel'
import { Building2, Sparkles, Wand2, Image as ImageIcon, Tag, RotateCcw, Zap } from 'lucide-react'
import { useRef } from 'react'

const SAMPLE_IMAGES = {
  software: [
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20minimal%20dark%20mode%20SaaS%20dashboard%20UI%20design%20gradient%20blue%20glow&image_size=square_hd',
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=futuristic%20AI%20productivity%20app%20interface%20dark%20UI%20blue%20accent&image_size=square_hd',
  ],
  hardware: [
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=premium%20smart%20wearable%20device%20product%20photo%20dark%20studio%20lighting%20sleek%20metallic&image_size=square_hd',
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20AI%20companion%20robot%20product%20shot%20dark%20minimal%20background%20soft%20light&image_size=square_hd',
  ],
}

const PLACEHOLDERS = {
  brand: '例如：Acme · 智云科技',
  name: '例如：AURA 智能助手 Pro',
}

export function MerchantPanel() {
  const { product, setProduct, stage, submitPromo, reset } = usePromoStore()
  const fileRef = useRef<HTMLInputElement>(null)

  const isLocked = stage !== 'idle'
  const active = stage !== 'idle'

  const switchType = (t: 'software' | 'hardware') => {
    if (isLocked) return
    // 保留原 image（如果它属于新 type 才保留），否则清空。
    // 这样切回旧 type 也能找回上次的图。
    const stillValid =
      product.image && SAMPLE_IMAGES[t].includes(product.image)
    setProduct({ type: t, image: stillValid ? product.image : '' })
  }

  const pickImage = (idx: number) => {
    setProduct({ image: SAMPLE_IMAGES[product.type][idx] })
  }

  const onPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = Number(e.target.value)
    const safe = Number.isFinite(raw) ? Math.max(0, Math.min(raw, 99999)) : 0
    setProduct({ price: safe })
  }

  return (
    <CollapsiblePanel
      side="left"
      title="B 端商家"
      subtitle="产品推广上传"
      icon={<Building2 className="h-4 w-4" />}
      active={active}
    >
      <div className="panel-body space-y-5">
        {/* 产品类型 Tab */}
        <div>
          <div className="label-eyebrow mb-2">产品类型</div>
          <div className="grid grid-cols-2 gap-1 rounded-md border border-white/[0.06] bg-ink-900/60 p-1">
            {(['software', 'hardware'] as const).map((t) => (
              <button
                key={t}
                onClick={() => switchType(t)}
                disabled={isLocked}
                className={`rounded px-3 py-2 text-xs font-medium transition-all ${
                  product.type === t
                    ? 'bg-tech text-white shadow-glow-soft'
                    : 'text-ink-200 hover:text-ink-50 disabled:opacity-50'
                }`}
              >
                {t === 'software' ? '软件 SaaS' : '智能硬件'}
              </button>
            ))}
          </div>
        </div>

        {/* 品牌 / 厂商 */}
        <div>
          <div className="label-eyebrow mb-2">品牌 / 厂商</div>
          <input
            value={product.brand}
            onChange={(e) => setProduct({ brand: e.target.value })}
            disabled={isLocked}
            placeholder={PLACEHOLDERS.brand}
            className="input-field"
          />
        </div>

        {/* 产品名称 */}
        <div>
          <div className="label-eyebrow mb-2">产品名称</div>
          <input
            value={product.name}
            onChange={(e) => setProduct({ name: e.target.value })}
            disabled={isLocked}
            placeholder={PLACEHOLDERS.name}
            className="input-field"
          />
        </div>

        {/* 产品描述 */}
        <div>
          <div className="label-eyebrow mb-2">产品描述</div>
          <textarea
            value={product.desc}
            onChange={(e) => setProduct({ desc: e.target.value })}
            disabled={isLocked}
            placeholder="简单描述产品功能、卖点、目标场景..."
            className="input-field h-24 resize-none leading-relaxed"
          />
        </div>

        {/* 价格 */}
        <div>
          <div className="label-eyebrow mb-2">定价</div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-md border border-white/[0.06] bg-ink-900/60 text-ink-200">
              <Tag className="h-3.5 w-3.5" />
            </div>
            <input
              type="number"
              min={0}
              max={99999}
              step={1}
              value={product.price}
              onChange={onPriceChange}
              disabled={isLocked}
              className="input-field"
            />
            <span className="text-xs text-ink-200">元 / 月</span>
          </div>
        </div>

        {/* 产品图片 */}
        <div>
          <div className="label-eyebrow mb-2">产品图片</div>
          <div className="grid grid-cols-3 gap-2">
            {SAMPLE_IMAGES[product.type].map((src, i) => (
              <button
                key={i}
                onClick={() => !isLocked && pickImage(i)}
                disabled={isLocked}
                className={`group relative aspect-square overflow-hidden rounded-md border transition-all ${
                  product.image === src
                    ? 'border-tech-light shadow-glow-soft'
                    : 'border-white/[0.06] hover:border-white/15'
                }`}
              >
                <img
                  src={src}
                  alt="product sample"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {product.image === src && (
                  <div className="absolute inset-0 flex items-center justify-center bg-tech/30">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                )}
              </button>
            ))}
            <button
              onClick={() => fileRef.current?.click()}
              disabled={isLocked}
              className="flex aspect-square flex-col items-center justify-center gap-1 rounded-md border border-dashed border-white/[0.08] text-ink-200 transition-all hover:border-white/20 hover:text-ink-50 disabled:opacity-50"
            >
              <ImageIcon className="h-4 w-4" />
              <span className="text-[10px]">上传</span>
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" />
          </div>
        </div>

        <div className="divider" />

        {/* 提示：算法自动推断画像 */}
        <div className="rounded-md border border-tech/20 bg-tech/[0.06] p-3">
          <div className="flex items-start gap-2">
            <Wand2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-tech-light" />
            <div className="text-[11px] leading-relaxed text-ink-100">
              <span className="font-medium text-tech-light">智能画像推断</span>
              <br />
              提交后，AI 将根据产品信息自动分析目标用户画像，无需手动选择
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-2">
          <button
            onClick={submitPromo}
            disabled={isLocked}
            className="btn-primary flex-1"
          >
            <Zap className="h-3.5 w-3.5" />
            {stage === 'idle' ? '提交推广' : '已提交 · 匹配中'}
          </button>
          {stage !== 'idle' && (
            <button onClick={reset} className="btn-ghost" title="重置演示">
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </CollapsiblePanel>
  )
}
