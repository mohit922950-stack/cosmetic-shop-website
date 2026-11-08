import { useState } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, ImagePlus, Plus, Star, Trash2, X } from 'lucide-react'
import { CATEGORIES } from '@/data/fixtures'
import type { Category, Product, Spec } from '@/data/fixtures'
import { actions, productById } from '@/lib/store'
import { discount, img } from '@/lib/format'
import { imageToDataUrl } from '@/lib/files'
import { PageTitle, useAdmin } from '@/components/admin'

export const Route = createFileRoute('/nikhaar-admin/products/$productId')({ component: EditProductPage })

const MAX_PHOTOS = 5

const blank = (): Product => ({
  id: `p-${Date.now().toString(36)}`,
  name: '',
  brand: '',
  category: 'Face',
  price: 0,
  mrp: 0,
  stock: 0,
  images: [],
  shortDescription: '',
  description: '',
  highlights: [],
  specs: [
    { label: 'Net quantity', value: '' },
    { label: 'Skin type', value: 'All' },
    { label: 'Country of origin', value: 'India' },
  ],
  rating: 4.5,
  ratingCount: 0,
  active: true,
  createdAt: new Date().toISOString(),
})

function EditProductPage() {
  const { productId } = Route.useParams()
  const { s } = useAdmin()
  const existing = productId === 'new' ? undefined : productById(s, productId)
  if (productId !== 'new' && !existing) return <div className="text-mute">Product not found. <Link to="/nikhaar-admin/products" className="text-plum underline">Back</Link></div>
  return <Editor key={productId} initial={existing ?? blank()} isNew={!existing} />
}

function Editor({ initial, isNew }: { initial: Product; isNew: boolean }) {
  const navigate = useNavigate()
  const [p, setP] = useState<Product>(initial)
  const [highlights, setHighlights] = useState(initial.highlights.join('\n'))
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const up = (patch: Partial<Product>) => setP((x) => ({ ...x, ...patch }))
  const setSpec = (i: number, patch: Partial<Spec>) => up({ specs: p.specs.map((sp, j) => (j === i ? { ...sp, ...patch } : sp)) })

  const addPhotos = async (files: FileList | null) => {
    if (!files) return
    setBusy(true)
    const room = MAX_PHOTOS - p.images.length
    const urls = await Promise.all([...files].slice(0, room).map((f) => imageToDataUrl(f, 1000, 0.8)))
    setP((x) => ({ ...x, images: [...x.images, ...urls].slice(0, MAX_PHOTOS) }))
    setBusy(false)
  }

  const save = () => {
    if (!p.name.trim() || !p.brand.trim()) return setError('Product name and brand / company are required')
    if (p.price <= 0) return setError('Please set a selling price')
    if (p.images.length === 0) return setError('Please upload at least one photo')
    const mrp = p.mrp < p.price ? p.price : p.mrp
    actions.saveProduct({
      ...p,
      mrp,
      highlights: highlights.split('\n').map((h) => h.trim()).filter(Boolean),
      specs: p.specs.filter((sp) => sp.label.trim() && sp.value.trim()),
    })
    navigate({ to: '/nikhaar-admin/products' })
  }

  return (
    <div className="max-w-5xl">
      <Link to="/nikhaar-admin/products" className="mb-3 inline-flex items-center gap-1 text-sm text-mute hover:text-plum"><ArrowLeft className="h-4 w-4" /> All products</Link>
      <PageTitle title={isNew ? 'Add new product' : 'Edit product'}>
        <div className="flex gap-2">
          {!isNew && (
            <button className="btn-ghost text-red-600" onClick={() => { if (confirm('Delete this product?')) { actions.deleteProduct(p.id); navigate({ to: '/nikhaar-admin/products' }) } }}>
              <Trash2 className="h-4 w-4" /> Delete
            </button>
          )}
          <button className="btn-primary" onClick={save}>Save product</button>
        </div>
      </PageTitle>
      {error && <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-6">
          <section className="card p-5">
            <h2 className="font-semibold">Photos <span className="text-sm font-normal text-mute">({p.images.length}/{MAX_PHOTOS}) · first photo is the cover</span></h2>
            <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
              {p.images.map((src, i) => (
                <div key={i} className="group relative aspect-square overflow-hidden rounded-xl border border-line bg-cream">
                  <img src={img(src, 240)} alt="" className="h-full w-full object-cover" />
                  {i === 0 && <span className="chip absolute top-1 left-1 bg-plum text-[10px] text-white">Cover</span>}
                  <div className="absolute inset-x-0 bottom-0 flex justify-between bg-ink/60 p-1 opacity-0 transition group-hover:opacity-100">
                    <button title="Make cover" className="text-white" onClick={() => up({ images: [src, ...p.images.filter((_, j) => j !== i)] })}><Star className="h-4 w-4" /></button>
                    <button title="Remove" className="text-white" onClick={() => up({ images: p.images.filter((_, j) => j !== i) })}><X className="h-4 w-4" /></button>
                  </div>
                </div>
              ))}
              {p.images.length < MAX_PHOTOS && (
                <label className="grid aspect-square cursor-pointer place-items-center rounded-xl border-2 border-dashed border-blush-deep bg-blush/30 text-center text-xs text-plum hover:border-plum">
                  <span><ImagePlus className="mx-auto mb-1 h-6 w-6" />{busy ? 'Uploading…' : 'Add photos'}</span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => addPhotos(e.target.files)} />
                </label>
              )}
            </div>
            <p className="mt-3 text-xs text-mute">Tip: upload a front shot, back label, texture/swatch, in-hand shot and box photo — customers can swipe through all of them.</p>
          </section>

          <section className="card space-y-4 p-5">
            <h2 className="font-semibold">Details</h2>
            <div><label className="label">Product name</label><input className="input" value={p.name} onChange={(e) => up({ name: e.target.value })} placeholder="e.g. Velvet Matte Lipstick – Ruby Red" /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className="label">Brand / company</label><input className="input" value={p.brand} onChange={(e) => up({ brand: e.target.value })} placeholder="e.g. Lakmé, Maybelline" /></div>
              <div><label className="label">Category</label>
                <select className="input" value={p.category} onChange={(e) => up({ category: e.target.value as Category })}>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div><label className="label">Short line (shown under title)</label><input className="input" value={p.shortDescription} onChange={(e) => up({ shortDescription: e.target.value })} /></div>
            <div><label className="label">Full description</label><textarea className="input min-h-28" value={p.description} onChange={(e) => up({ description: e.target.value })} /></div>
            <div><label className="label">Highlights (one per line)</label><textarea className="input min-h-24" value={highlights} onChange={(e) => setHighlights(e.target.value)} placeholder={'Long lasting 12 hours\nParaben free'} /></div>
          </section>

          <section className="card p-5">
            <h2 className="font-semibold">Specifications</h2>
            <div className="mt-4 space-y-2">
              {p.specs.map((sp, i) => (
                <div key={i} className="flex gap-2">
                  <input className="input w-2/5" placeholder="e.g. Shade" value={sp.label} onChange={(e) => setSpec(i, { label: e.target.value })} />
                  <input className="input flex-1" placeholder="e.g. Ruby Red" value={sp.value} onChange={(e) => setSpec(i, { value: e.target.value })} />
                  <button className="px-2 text-mute hover:text-red-600" onClick={() => up({ specs: p.specs.filter((_, j) => j !== i) })} aria-label="Remove"><X className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
            <button className="btn-ghost mt-3 py-1.5" onClick={() => up({ specs: [...p.specs, { label: '', value: '' }] })}><Plus className="h-4 w-4" /> Add row</button>
          </section>
        </div>

        <div className="space-y-6">
          <section className="card space-y-4 p-5 lg:sticky lg:top-6">
            <h2 className="font-semibold">Price & stock</h2>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Selling price ₹</label><input type="number" min={0} className="input text-lg font-bold" value={p.price || ''} onChange={(e) => up({ price: Number(e.target.value) })} /></div>
              <div><label className="label">MRP ₹</label><input type="number" min={0} className="input" value={p.mrp || ''} onChange={(e) => up({ mrp: Number(e.target.value) })} /></div>
            </div>
            {discount(p.price, p.mrp) > 0 && <p className="text-sm font-semibold text-leaf">Customers see {discount(p.price, p.mrp)}% off</p>}
            <div><label className="label">Units in stock</label><input type="number" min={0} className="input" value={p.stock} onChange={(e) => up({ stock: Math.max(0, Number(e.target.value)) })} /></div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-plum" checked={p.active} onChange={(e) => up({ active: e.target.checked })} /> Show this product in the shop</label>
            <button className="btn-primary w-full" onClick={save}>Save product</button>
          </section>
        </div>
      </div>
    </div>
  )
}
