import { Link, createFileRoute } from '@tanstack/react-router'
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { actions, productById, useStore } from '@/lib/store'
import { img, inr } from '@/lib/format'
import { ShopLayout } from '@/components/Shop'

export const Route = createFileRoute('/cart')({ component: CartPage })

function CartPage() {
  const s = useStore()
  const lines = s.session.cart
    .map((l) => ({ ...l, p: productById(s, l.productId) }))
    .filter((l) => l.p)
  const mrpTotal = lines.reduce((t, l) => t + l.p!.mrp * l.qty, 0)
  const total = lines.reduce((t, l) => t + l.p!.price * l.qty, 0)

  return (
    <ShopLayout>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="font-display text-3xl font-bold">My cart</h1>
        {lines.length === 0 ? (
          <div className="card mt-6 flex flex-col items-center p-16 text-center">
            <ShoppingBag className="h-12 w-12 text-blush-deep" />
            <p className="mt-3 text-mute">Your cart is empty</p>
            <Link to="/" className="btn-primary mt-5">Shop now</Link>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
            <div className="card divide-y divide-line">
              {lines.map(({ p, qty }) => (
                <div key={p!.id} className="flex gap-4 p-4">
                  <Link to="/products/$productId" params={{ productId: p!.id }} className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-blush">
                    <img src={img(p!.images[0], 200)} alt="" className="h-full w-full object-cover" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-gold uppercase">{p!.brand}</div>
                    <Link to="/products/$productId" params={{ productId: p!.id }} className="line-clamp-2 text-sm font-medium hover:text-plum">
                      {p!.name}
                    </Link>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="font-bold">{inr(p!.price)}</span>
                      <span className="text-xs text-mute line-through">{inr(p!.mrp)}</span>
                    </div>
                    {p!.stock < qty && (
                      <div className="text-xs font-semibold text-red-600">Only {p!.stock} in stock</div>
                    )}
                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex items-center rounded-full border border-line">
                        <button className="p-1.5" onClick={() => actions.setQty(p!.id, qty - 1)} aria-label="Decrease">
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold">{qty}</span>
                        <button className="p-1.5 disabled:opacity-30" disabled={qty >= p!.stock} onClick={() => actions.setQty(p!.id, qty + 1)} aria-label="Increase">
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <button className="flex items-center gap-1 text-xs font-semibold text-mute hover:text-red-600" onClick={() => actions.setQty(p!.id, 0)}>
                        <Trash2 className="h-4 w-4" /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <aside className="card h-fit p-5 lg:sticky lg:top-36">
              <h2 className="text-sm font-bold tracking-wide text-mute uppercase">Price details</h2>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between"><dt>Price ({lines.length} items)</dt><dd>{inr(mrpTotal)}</dd></div>
                <div className="flex justify-between text-leaf"><dt>Discount</dt><dd>− {inr(mrpTotal - total)}</dd></div>
                <div className="flex justify-between"><dt>Delivery</dt><dd className="text-leaf">FREE</dd></div>
                <div className="flex justify-between border-t border-dashed border-line pt-3 text-base font-bold"><dt>Total amount</dt><dd>{inr(total)}</dd></div>
              </dl>
              <p className="mt-3 text-sm font-semibold text-leaf">You save {inr(mrpTotal - total)} on this order</p>
              <Link to="/checkout" className="btn-primary mt-5 w-full py-3 text-base">Place order</Link>
            </aside>
          </div>
        )}
      </div>
    </ShopLayout>
  )
}
