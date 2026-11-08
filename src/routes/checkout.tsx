import { useEffect, useState } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { AlertCircle, CheckCircle2, ImageUp, MapPin } from 'lucide-react'
import type { Address } from '@/data/fixtures'
import { actions, currentUser, productById, useStore } from '@/lib/store'
import { inr } from '@/lib/format'
import { imageToDataUrl } from '@/lib/files'
import { ShopLayout, UpiQr } from '@/components/Shop'
import { AddressForm } from '@/components/AddressForm'

export const Route = createFileRoute('/checkout')({ component: Checkout })

function Checkout() {
  const s = useStore()
  const user = currentUser(s)
  const navigate = useNavigate()
  const [addrIndex, setAddrIndex] = useState(0)
  const [addingAddr, setAddingAddr] = useState(false)
  const [utr, setUtr] = useState('')
  const [shot, setShot] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (s.ready && !user) navigate({ to: '/login', search: { redirect: '/checkout' } })
  }, [s.ready, user, navigate])

  const lines = s.session.cart.filter((l) => productById(s, l.productId))
  const total = lines.reduce((t, l) => t + productById(s, l.productId)!.price * l.qty, 0)

  if (!s.ready || !user) return <ShopLayout><div className="py-32 text-center text-mute">Loading…</div></ShopLayout>
  if (!lines.length)
    return (
      <ShopLayout>
        <div className="py-24 text-center">
          <p className="text-mute">Your cart is empty.</p>
          <Link to="/" className="btn-primary mt-4">Shop now</Link>
        </div>
      </ShopLayout>
    )

  const address: Address | undefined = user.addresses[addrIndex]
  const utrClean = utr.replace(/\D/g, '')
  const utrUsed = utrClean.length === 12 && actions.isUtrUsed(utrClean)

  const submit = () => {
    setError('')
    if (!address) return setError('Please add a delivery address')
    const r = actions.placeOrder({ lines, address, utr: utrClean, screenshot: shot })
    if (!r.ok) return setError(r.error)
    actions.clearCart()
    navigate({ to: '/order-success', search: { id: r.value.id } })
  }

  return (
    <ShopLayout>
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          {/* Step 1 – address */}
          <section className="card p-5">
            <h2 className="flex items-center gap-2 font-semibold">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-plum text-xs text-white">1</span>
              Delivery address
            </h2>
            <div className="mt-4 space-y-2">
              {user.addresses.map((a, i) => (
                <label key={i} className={`flex cursor-pointer gap-3 rounded-xl border p-3 text-sm ${i === addrIndex ? 'border-plum bg-blush/40' : 'border-line'}`}>
                  <input type="radio" className="mt-1 accent-plum" checked={i === addrIndex} onChange={() => setAddrIndex(i)} />
                  <span>
                    <span className="font-semibold">{a.name}</span> · {a.phone}
                    <br />
                    <span className="text-mute">{a.line1}{a.line2 ? `, ${a.line2}` : ''}{a.landmark ? `, near ${a.landmark}` : ''}, {a.city}, {a.state} – {a.pincode}</span>
                  </span>
                </label>
              ))}
            </div>
            {addingAddr || user.addresses.length === 0 ? (
              <div className="mt-4">
                <AddressForm
                  initial={{ name: user.name, phone: user.phone }}
                  onCancel={user.addresses.length ? () => setAddingAddr(false) : undefined}
                  onSave={(a) => {
                    actions.saveAddress(a)
                    setAddrIndex(0)
                    setAddingAddr(false)
                  }}
                />
              </div>
            ) : (
              <button className="btn-ghost mt-3" onClick={() => setAddingAddr(true)}>
                <MapPin className="h-4 w-4" /> Add new address
              </button>
            )}
          </section>

          {/* Step 2 – pay */}
          <section className="card p-5">
            <h2 className="flex items-center gap-2 font-semibold">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-plum text-xs text-white">2</span>
              Pay {inr(total)} by UPI
            </h2>
            <div className="mt-4 grid items-center gap-6 md:grid-cols-[auto_1fr]">
              <UpiQr amount={total} />
              <ol className="space-y-2 text-sm">
                <li>1. Open PhonePe, Google Pay, Paytm or any UPI app.</li>
                <li>2. Scan this QR and pay exactly <b>{inr(total)}</b>.</li>
                <li>3. Copy the 12-digit <b>UTR / UPI reference number</b> from the payment receipt.</li>
                <li>4. Take a screenshot of the successful payment.</li>
              </ol>
            </div>
          </section>

          {/* Step 3 – UTR */}
          <section className="card p-5">
            <h2 className="flex items-center gap-2 font-semibold">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-plum text-xs text-white">3</span>
              Submit payment proof
            </h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="label" htmlFor="utr">UTR / UPI reference no.</label>
                <input
                  id="utr"
                  inputMode="numeric"
                  maxLength={12}
                  className="input font-mono tracking-widest"
                  placeholder="e.g. 412345678901"
                  value={utrClean}
                  onChange={(e) => setUtr(e.target.value)}
                />
                <div className="mt-1 text-xs">
                  {utrUsed ? (
                    <span className="font-semibold text-red-600">This UTR is already used for another order.</span>
                  ) : utrClean.length === 12 ? (
                    <span className="flex items-center gap-1 text-leaf"><CheckCircle2 className="h-3.5 w-3.5" /> Looks good</span>
                  ) : (
                    <span className="text-mute">{utrClean.length}/12 digits · each UTR can be used only once</span>
                  )}
                </div>
              </div>
              <div>
                <span className="label">Payment screenshot</span>
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-blush-deep bg-blush/30 p-3 text-sm hover:border-plum-soft">
                  {shot ? (
                    <img src={shot} alt="Payment screenshot" className="h-16 w-12 rounded object-cover" />
                  ) : (
                    <ImageUp className="h-8 w-8 text-plum-soft" />
                  )}
                  <span>{shot ? 'Screenshot added · tap to change' : 'Tap to upload screenshot'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const f = e.target.files?.[0]
                      if (f) setShot(await imageToDataUrl(f, 900, 0.7))
                    }}
                  />
                </label>
              </div>
            </div>
          </section>
        </div>

        <aside className="card h-fit p-5 lg:sticky lg:top-36">
          <h2 className="text-sm font-bold tracking-wide text-mute uppercase">Order summary</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {lines.map((l) => {
              const p = productById(s, l.productId)!
              return (
                <li key={l.productId} className="flex justify-between gap-3">
                  <span className="line-clamp-1">{p.name} × {l.qty}</span>
                  <span className="shrink-0 font-medium">{inr(p.price * l.qty)}</span>
                </li>
              )
            })}
          </ul>
          <div className="mt-3 flex justify-between border-t border-dashed border-line pt-3 font-bold">
            <span>Total</span><span>{inr(total)}</span>
          </div>
          {error && (
            <div className="mt-4 flex gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" /> {error}
            </div>
          )}
          <button
            className="btn-primary mt-5 w-full py-3 text-base"
            disabled={!address || utrClean.length !== 12 || utrUsed || !shot}
            onClick={submit}
          >
            Submit order for verification
          </button>
          <p className="mt-3 text-xs text-mute">
            Your order is confirmed once we verify the payment in our bank account — usually within a few hours.
          </p>
        </aside>
      </div>
    </ShopLayout>
  )
}
