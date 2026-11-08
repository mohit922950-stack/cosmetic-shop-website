import { useEffect, useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import QRCode from 'qrcode'
import {
  Headset,
  MessageCircle,
  Search,
  ShoppingBag,
  Sparkles,
  Star,
  UserRound,
  X,
} from 'lucide-react'
import { CATEGORIES } from '@/data/fixtures'
import type { OrderStatus, Product } from '@/data/fixtures'
import { STATUS_LABEL, cartCount, currentUser, useStore } from '@/lib/store'
import { discount, img, inr, waLink } from '@/lib/format'

export function SiteHeader({ initialQuery = '' }: { initialQuery?: string }) {
  const s = useStore()
  const user = currentUser(s)
  const count = cartCount(s)
  const navigate = useNavigate()
  const [q, setQ] = useState(initialQuery)
  useEffect(() => setQ(initialQuery), [initialQuery])

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 md:gap-6">
        <Link to="/" className="flex shrink-0 items-center gap-1.5">
          <Sparkles className="h-5 w-5 text-gold" />
          <span className="font-display text-2xl font-bold tracking-tight text-plum">
            Nikhaar
          </span>
        </Link>
        <form
          className="relative hidden flex-1 md:block"
          onSubmit={(e) => {
            e.preventDefault()
            navigate({ to: '/', search: { q: q || undefined } })
          }}
        >
          <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-mute" />
          <input
            className="input rounded-full pl-10"
            placeholder="Search lipstick, serum, kajal, brands…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </form>
        <nav className="ml-auto flex items-center gap-1 md:gap-2">
          <Link
            to={user ? '/account' : '/login'}
            className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold hover:bg-blush"
          >
            <UserRound className="h-5 w-5" />
            <span className="hidden sm:inline">
              {user ? user.name.split(' ')[0] : 'Login'}
            </span>
          </Link>
          <Link
            to="/cart"
            className="relative flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold hover:bg-blush"
          >
            <ShoppingBag className="h-5 w-5" />
            <span className="hidden sm:inline">Cart</span>
            {count > 0 && (
              <span className="absolute -top-0.5 left-6 grid h-5 min-w-5 place-items-center rounded-full bg-plum px-1 text-[11px] text-white">
                {count}
              </span>
            )}
          </Link>
        </nav>
      </div>
      <form
        className="relative px-4 pb-3 md:hidden"
        onSubmit={(e) => {
          e.preventDefault()
          navigate({ to: '/', search: { q: q || undefined } })
        }}
      >
        <Search className="pointer-events-none absolute top-1/2 left-7.5 h-4 w-4 -translate-y-[70%] text-mute" />
        <input
          className="input rounded-full pl-10"
          placeholder="Search products & brands"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </form>
      <div className="border-t border-line bg-white/60">
        <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 py-2 text-sm">
          {CATEGORIES.map((c) => (
            <Link
              key={c}
              to="/"
              search={{ cat: c }}
              className="shrink-0 rounded-full px-3 py-1 font-medium text-mute hover:bg-blush hover:text-plum"
              activeOptions={{ includeSearch: true }}
              activeProps={{ className: 'bg-blush !text-plum' }}
            >
              {c}
            </Link>
          ))}
          <Link
            to="/support"
            className="ml-auto flex shrink-0 items-center gap-1 rounded-full px-3 py-1 font-medium text-leaf hover:bg-green-50"
          >
            <Headset className="h-4 w-4" /> Customer care
          </Link>
        </div>
      </div>
    </header>
  )
}

export function SiteFooter() {
  const { settings } = useStore()
  return (
    <footer className="mt-20 bg-plum-dark text-white/80">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-3">
        <div>
          <div className="font-display text-2xl font-bold text-white">Nikhaar</div>
          <p className="mt-2 max-w-xs text-sm">
            Genuine cosmetics and skin care from trusted brands, delivered to your door.
          </p>
        </div>
        <div className="text-sm">
          <div className="mb-2 font-semibold text-white">How ordering works</div>
          <ol className="list-decimal space-y-1 pl-4">
            <li>Add products to cart</li>
            <li>Pay by scanning our UPI QR</li>
            <li>Enter your UTR number & upload screenshot</li>
            <li>We verify the payment and ship your order</li>
          </ol>
        </div>
        <div className="text-sm">
          <div className="mb-2 font-semibold text-white">Need help?</div>
          <a
            className="btn-wa"
            href={waLink(settings.whatsapp, 'Hi Nikhaar, I need help with my order')}
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
          </a>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">
        © {new Date().getFullYear()} Nikhaar Cosmetics
      </div>
    </footer>
  )
}

export function ShopLayout({
  children,
  query,
}: {
  children: React.ReactNode
  query?: string
}) {
  return (
    <div className="min-h-screen">
      <SiteHeader initialQuery={query} />
      <main>{children}</main>
      <SiteFooter />
      <WhatsAppFab />
    </div>
  )
}

export function WhatsAppFab() {
  const { settings } = useStore()
  return (
    <a
      href={waLink(settings.whatsapp, 'Hi Nikhaar, I need help')}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed right-4 bottom-4 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/20 transition hover:scale-105"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  )
}

export function Stars({ rating, count }: { rating: number; count?: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs">
      <span className="chip bg-leaf text-white">
        {rating.toFixed(1)} <Star className="h-3 w-3 fill-white" />
      </span>
      {count !== undefined && (
        <span className="text-mute">({count.toLocaleString('en-IN')})</span>
      )}
    </span>
  )
}

export function Price({ price, mrp, big }: { price: number; mrp: number; big?: boolean }) {
  const off = discount(price, mrp)
  return (
    <div className="flex flex-wrap items-baseline gap-2">
      <span className={big ? 'text-3xl font-bold' : 'text-lg font-bold'}>{inr(price)}</span>
      {off > 0 && (
        <>
          <span className="text-sm text-mute line-through">{inr(mrp)}</span>
          <span className="text-sm font-bold text-leaf">{off}% off</span>
        </>
      )}
    </div>
  )
}

export function ProductCard({ p, index = 0 }: { p: Product; index?: number }) {
  return (
    <Link
      to="/products/$productId"
      params={{ productId: p.id }}
      className="group rise card overflow-hidden transition hover:-translate-y-1 hover:shadow-xl hover:shadow-plum/10"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="relative aspect-square overflow-hidden bg-blush">
        <img
          src={img(p.images[0], 500)}
          alt={p.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        {p.stock === 0 ? (
          <span className="chip absolute top-3 left-3 bg-ink text-white">Out of stock</span>
        ) : p.stock <= 5 ? (
          <span className="chip absolute top-3 left-3 bg-red-600 text-white">
            Only {p.stock} left
          </span>
        ) : null}
      </div>
      <div className="space-y-1.5 p-4">
        <div className="text-xs font-semibold tracking-wide text-gold uppercase">{p.brand}</div>
        <div className="line-clamp-2 min-h-10 text-sm font-medium">{p.name}</div>
        <Stars rating={p.rating} count={p.ratingCount} />
        <Price price={p.price} mrp={p.mrp} />
      </div>
    </Link>
  )
}

const STATUS_STYLE: Record<OrderStatus, string> = {
  payment_review: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-700',
}

export function StatusChip({ status }: { status: OrderStatus }) {
  return <span className={`chip ${STATUS_STYLE[status]}`}>{STATUS_LABEL[status]}</span>
}

export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  wide?: boolean
}) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`card max-h-[90vh] w-full overflow-y-auto p-6 shadow-2xl ${wide ? 'max-w-3xl' : 'max-w-md'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-xl font-bold">{title}</h3>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-blush" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

/** Cancel dialog with a required reason (used by customers and admins). */
export function CancelDialog({
  open,
  onClose,
  onConfirm,
  presets,
  title = 'Cancel order',
}: {
  open: boolean
  onClose: () => void
  onConfirm: (reason: string) => void
  presets: string[]
  title?: string
}) {
  const [choice, setChoice] = useState('')
  const [other, setOther] = useState('')
  const reason = choice === 'Other' ? other.trim() : choice
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="mb-3 text-sm text-mute">Please choose a reason for cancelling.</p>
      <div className="space-y-2">
        {[...presets, 'Other'].map((p) => (
          <label
            key={p}
            className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm ${choice === p ? 'border-plum bg-blush/50' : 'border-line'}`}
          >
            <input
              type="radio"
              name="reason"
              checked={choice === p}
              onChange={() => setChoice(p)}
              className="accent-plum"
            />
            {p}
          </label>
        ))}
        {choice === 'Other' && (
          <textarea
            className="input min-h-20"
            placeholder="Write the reason…"
            value={other}
            onChange={(e) => setOther(e.target.value)}
          />
        )}
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button className="btn-ghost" onClick={onClose}>
          Keep order
        </button>
        <button
          className="btn-danger"
          disabled={!reason}
          onClick={() => {
            onConfirm(reason)
            setChoice('')
            setOther('')
          }}
        >
          Cancel order
        </button>
      </div>
    </Modal>
  )
}

/** Shows the admin-uploaded QR, or generates one from the UPI ID. */
export function UpiQr({ amount, size = 220 }: { amount?: number; size?: number }) {
  const { settings } = useStore()
  const [generated, setGenerated] = useState('')
  const upiUrl = `upi://pay?pa=${encodeURIComponent(settings.upiId)}&pn=${encodeURIComponent(settings.payeeName)}${amount ? `&am=${amount}` : ''}&cu=INR`
  useEffect(() => {
    if (settings.qrImage) return
    QRCode.toDataURL(upiUrl, { width: size * 2, margin: 1, color: { dark: '#3f0f27' } })
      .then(setGenerated)
      .catch(() => setGenerated(''))
  }, [upiUrl, settings.qrImage, size])
  const src = settings.qrImage || generated
  return (
    <div className="inline-flex flex-col items-center rounded-2xl border border-line bg-white p-3">
      {src ? (
        <img src={src} alt="UPI payment QR code" style={{ width: size, height: size }} className="object-contain" />
      ) : (
        <div style={{ width: size, height: size }} className="animate-pulse rounded-xl bg-blush" />
      )}
      <div className="mt-2 text-center text-xs text-mute">
        UPI ID: <span className="font-semibold text-ink">{settings.upiId}</span>
      </div>
    </div>
  )
}
