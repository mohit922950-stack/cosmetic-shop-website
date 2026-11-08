import { useState } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { CheckCircle2, ChevronRight, ShoppingBag, Truck, Zap } from 'lucide-react'
import { actions, productById, useStore } from '@/lib/store'
import { img } from '@/lib/format'
import { Price, ProductCard, ShopLayout, Stars } from '@/components/Shop'

export const Route = createFileRoute('/products/$productId')({
  component: ProductPage,
})

function ProductPage() {
  const { productId } = Route.useParams()
  const s = useStore()
  const p = productById(s, productId)
  const navigate = useNavigate()
  const [active, setActive] = useState(0)
  const [added, setAdded] = useState(false)

  if (!p) {
    return (
      <ShopLayout>
        <div className="mx-auto max-w-xl px-4 py-24 text-center">
          <h1 className="font-display text-3xl font-bold">Product not found</h1>
          <p className="mt-2 text-mute">It may have been removed from the store.</p>
          <Link to="/" className="btn-primary mt-6">
            Continue shopping
          </Link>
        </div>
      </ShopLayout>
    )
  }

  const images = p.images.length ? p.images : ['/img/packaging.png']
  const current = images[Math.min(active, images.length - 1)]
  const out = p.stock === 0
  const related = s.products
    .filter((x) => x.active && x.id !== p.id && x.category === p.category)
    .concat(s.products.filter((x) => x.active && x.id !== p.id && x.category !== p.category))
    .slice(0, 4)

  return (
    <ShopLayout>
      <div className="mx-auto max-w-7xl px-4 pt-5">
        <nav className="flex items-center gap-1 text-xs text-mute">
          <Link to="/" className="hover:text-plum">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/" search={{ cat: p.category }} className="hover:text-plum">{p.category}</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="line-clamp-1">{p.brand}</span>
        </nav>

        <div className="mt-4 grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          {/* Gallery */}
          <div className="lg:sticky lg:top-36 lg:self-start">
            <div className="flex flex-col-reverse gap-3 md:flex-row">
              <div className="flex gap-2 overflow-x-auto md:flex-col">
                {images.map((src, i) => (
                  <button
                    key={i}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => setActive(i)}
                    className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 bg-white md:h-20 md:w-20 ${i === active ? 'border-plum' : 'border-transparent opacity-70 hover:opacity-100'}`}
                  >
                    <img src={img(src, 160)} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
              <div className="card relative flex-1 overflow-hidden">
                <img
                  key={current}
                  src={img(current, 1000)}
                  alt={p.name}
                  className="rise aspect-square w-full object-contain"
                />
                {out && (
                  <div className="absolute inset-x-0 bottom-0 bg-ink/80 py-2 text-center text-sm font-semibold text-white">
                    Currently out of stock
                  </div>
                )}
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                disabled={out}
                onClick={() => {
                  actions.addToCart(p.id)
                  setAdded(true)
                }}
                className="btn-gold py-3.5 text-base"
              >
                <ShoppingBag className="h-5 w-5" /> {added ? 'Added to cart' : 'Add to cart'}
              </button>
              <button
                disabled={out}
                onClick={() => {
                  actions.addToCart(p.id)
                  navigate({ to: '/cart' })
                }}
                className="btn-primary py-3.5 text-base"
              >
                <Zap className="h-5 w-5" /> Buy now
              </button>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <div className="text-sm font-bold tracking-wide text-gold uppercase">{p.brand}</div>
              <h1 className="mt-1 text-2xl leading-snug font-semibold">{p.name}</h1>
              <div className="mt-2">
                <Stars rating={p.rating} count={p.ratingCount} />
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold text-leaf">Special price</div>
              <Price price={p.price} mrp={p.mrp} big />
              <div className="mt-1 text-xs text-mute">Inclusive of all taxes</div>
              <div className="mt-2 text-sm font-semibold">
                {out ? (
                  <span className="text-red-600">Out of stock</span>
                ) : p.stock <= 5 ? (
                  <span className="text-red-600">Hurry, only {p.stock} left!</span>
                ) : (
                  <span className="text-leaf">In stock</span>
                )}
              </div>
            </div>

            <div className="card flex items-start gap-3 p-4 text-sm">
              <Truck className="mt-0.5 h-5 w-5 text-plum" />
              <div>
                <div className="font-semibold">Delivery in 3–6 days after payment verification</div>
                <div className="text-mute">Pay by UPI · Enter UTR · We confirm & ship</div>
              </div>
            </div>

            {p.highlights.length > 0 && (
              <section className="card p-5">
                <h2 className="mb-3 font-semibold">Highlights</h2>
                <ul className="space-y-2 text-sm">
                  {p.highlights.map((h) => (
                    <li key={h} className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-leaf" /> {h}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="card p-5">
              <h2 className="mb-2 font-semibold">Description</h2>
              <p className="text-sm leading-relaxed whitespace-pre-line text-ink/80">{p.description}</p>
            </section>

            <section className="card overflow-hidden">
              <h2 className="border-b border-line p-5 font-semibold">Specifications</h2>
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b border-line">
                    <td className="w-2/5 px-5 py-3 text-mute">Brand / Company</td>
                    <td className="px-5 py-3 font-medium">{p.brand}</td>
                  </tr>
                  <tr className="border-b border-line">
                    <td className="px-5 py-3 text-mute">Category</td>
                    <td className="px-5 py-3">{p.category}</td>
                  </tr>
                  {p.specs
                    .filter((sp) => sp.label.toLowerCase() !== 'brand')
                    .map((sp) => (
                      <tr key={sp.label} className="border-b border-line last:border-0">
                        <td className="px-5 py-3 text-mute">{sp.label}</td>
                        <td className="px-5 py-3">{sp.value}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </section>
          </div>
        </div>

        {related.length > 0 && (
          <section className="pt-16">
            <h2 className="font-display text-2xl font-bold">You may also like</h2>
            <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
              {related.map((r, i) => (
                <ProductCard key={r.id} p={r} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>
    </ShopLayout>
  )
}
