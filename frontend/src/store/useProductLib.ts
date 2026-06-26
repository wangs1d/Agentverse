// 产品库 store：合并内置 PRODUCTS + 商家上传产品
// 上传后自动并入列表；纯前端 demo，刷新页面会丢失
import { create } from 'zustand'
import { PRODUCTS as BUILTIN_PRODUCTS, type Product, type ProductCategory } from '../data/products'

export interface ProductLibState {
  products: Product[]
  latestId: string | null
  addProduct: (p: Product) => void
  removeProduct: (id: string) => void
  reset: () => void
}

export const useProductLib = create<ProductLibState>((set) => ({
  products: BUILTIN_PRODUCTS,
  latestId: null,
  addProduct: (p) =>
    set((s) => ({
      products: [p, ...s.products.filter((x) => x.id !== p.id)],
      latestId: p.id,
    })),
  removeProduct: (id) =>
    set((s) => ({ products: s.products.filter((p) => p.id !== id) })),
  reset: () => set({ products: BUILTIN_PRODUCTS, latestId: null }),
}))

/**
 * 构造一个上传产品对象（保证 id 唯一、补齐默认字段）
 */
export function buildUploadedProduct(input: {
  category: ProductCategory
  brand: string
  name: string
  desc: string
  price: number
  primaryPersonaId?: string
  secondaryPersonaIds?: string[]
}): Product {
  const id = `uploaded-${Date.now()}`
  return {
    id,
    category: input.category,
    brand: input.brand || '我的品牌',
    name: input.name,
    desc: input.desc,
    price: input.price,
    priceUnit: input.category === 'software' ? '/月' : '/台',
    image: defaultImageForCategory(input.category),
    tags: extractTags(input.desc),
    primaryPersonaHint: input.primaryPersonaId,
    secondaryPersonaHint: input.secondaryPersonaIds,
    monthlySales: 0,
    rating: 0,
    status: 'pending',
    merchantNote: '你刚才上传演示的产品',
    createdAt: Date.now(),
  }
}

const DEFAULT_IMAGES: Record<ProductCategory, string> = {
  software:
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20minimal%20dark%20mode%20SaaS%20dashboard%20UI%20design%20gradient%20blue%20glow&image_size=square_hd',
  hardware:
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=premium%20smart%20wearable%20device%20product%20photo%20dark%20studio%20lighting%20sleek%20metallic&image_size=square_hd',
}

function defaultImageForCategory(c: ProductCategory) {
  return DEFAULT_IMAGES[c]
}

/**
 * 从描述里粗略抽取 2-3 个标签词，给卡片用
 */
function extractTags(desc: string): string[] {
  if (!desc) return []
  const matches = desc.match(/[\u4e00-\u9fa5]{2,6}/g) || []
  const seen = new Set<string>()
  const out: string[] = []
  for (const m of matches) {
    if (!seen.has(m) && out.length < 4) {
      seen.add(m)
      out.push(m)
    }
  }
  return out
}
