import { useEffect, useState } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { ChevronRight, KeyRound, LogOut, MapPin, Package, Trash2, UserRound } from 'lucide-react'
import type { Order } from '@/data/fixtures'
import { actions, currentUser, useStore } from '@/lib/store'
import { fmtDateTime, img, inr } from '@/lib/format'
import { CancelDialog, ShopLayout, StatusChip } from '@/components/Shop'
import { AddressForm } from '@/components/AddressForm'

type Tab = 'orders' | 'profile' | 'addresses' | 'password'
const TABS: { id: Tab; label: string; icon: typeof Package }[] = [
  { id: 'orders', label: 'My orders', icon: Package },
  { id: 'profile', label: 'Profile', icon: UserRound },
  { id: 'addresses', label: 'Saved addresses', icon: MapPin },
  { id: 'password', label: 'Change password', icon: KeyRound },
]

export const Route = createFileRoute('/account')({
  validateSearch: (s: Record<string, unknown>): { tab?: Tab } => ({
    tab: TABS.some((t) => t.id === s.tab) ? (s.tab as Tab) : undefined,
  }),
  component: Account,
})

function Account() {
  const s = useStore()
  const user = currentUser(s)
  const navigate = useNavigate()
  const tab = Route.useSearch().tab ?? 'orders'

  useEffect(() => {
    if (s.ready && !user) navigate({ to: '/login' })
  }, [s.ready, user, navigate])
  if (!s.ready || !user) return <ShopLayout><div className="py-32 text-center text-mute">Loading…</div></ShopLayout>

  return (
    <ShopLayout>
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 md:grid-cols-[240px_1fr]">
        <aside className="space-y-3">
          <div className="card flex items-center gap-3 p-4">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-plum font-display text-xl text-white">{user.name[0]}</div>
            <div className="min-w-0">
              <div className="text-xs text-mute">Hello,</div>
              <div className="truncate font-semibold">{user.name}</div>
            </div>
          </div>
          <nav className="card flex overflow-x-auto p-2 md:flex-col">
            {TABS.map(({ id, label, icon: Icon }) => (
              <Link key={id} to="/account" search={{ tab: id }} className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${tab === id ? 'bg-blush text-plum' : 'hover:bg-cream'}`}>
                <Icon className="h-4 w-4" /> {label}
              </Link>
            ))}
            <button onClick={() => { actions.logout(); navigate({ to: '/' }) }} className="flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50">
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </nav>
        </aside>
        <section>
          {tab === 'orders' && <Orders orders={s.orders.filter((o) => o.userId === user.id)} />}
          {tab === 'profile' && <Profile key={user.id} name={user.name} email={user.email} phone={user.phone} />}
          {tab === 'addresses' && <Addresses />}
          {tab === 'password' && <Password />}
        </section>
      </div>
    </ShopLayout>
  )
}

function Orders({ orders }: { orders: Order[] }) {
  const [filter, setFilter] = useState<'all' | 'active' | 'delivered' | 'cancelled'>('all')
  const [cancelId, setCancelId] = useState<string | null>(null)
  const list = orders.filter((o) =>
    filter === 'all' ? true : filter === 'active' ? ['payment_review', 'confirmed', 'shipped'].includes(o.status) : o.status === filter,
  )
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-bold">My orders</h1>
        <div className="flex gap-1 rounded-full bg-white p-1 text-sm">
          {(['all', 'active', 'delivered', 'cancelled'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-3 py-1.5 capitalize ${filter === f ? 'bg-plum text-white' : 'text-mute'}`}>{f}</button>
          ))}
        </div>
      </div>
      {list.length === 0 && <div className="card mt-6 p-12 text-center text-mute">No orders here yet.</div>}
      <div className="mt-6 space-y-4">
        {list.map((o) => (
          <article key={o.id} className="card overflow-hidden">
            <header className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-cream/60 px-5 py-3 text-sm">
              <div><span className="font-semibold">#{o.id}</span> <span className="text-mute">· {fmtDateTime(o.createdAt)}</span></div>
              <StatusChip status={o.status} />
            </header>
            <ul className="divide-y divide-line">
              {o.items.map((it) => (
                <li key={it.productId}>
                  <Link to="/products/$productId" params={{ productId: it.productId }} className="flex items-center gap-4 px-5 py-3 hover:bg-cream/50">
                    <img src={img(it.image, 160)} alt="" className="h-16 w-16 rounded-lg bg-blush object-cover" />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-gold uppercase">{it.brand}</div>
                      <div className="line-clamp-1 text-sm font-medium">{it.name}</div>
                      <div className="text-xs text-mute">Qty {it.qty} · {inr(it.price * it.qty)}</div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-mute" />
                  </Link>
                </li>
              ))}
            </ul>
            {o.status === 'cancelled' && o.cancelReason && (
              <div className="mx-5 mb-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                <b>{o.cancelledBy === 'admin' ? 'Cancelled by store' : 'You cancelled this order'}:</b> {o.cancelReason}
              </div>
            )}
            <details className="group border-t border-line px-5 py-3 text-sm">
              <summary className="flex cursor-pointer list-none items-center justify-between font-medium">
                <span>Total {inr(o.total)} · UTR <span className="font-mono">{o.utr}</span></span>
                <span className="text-plum group-open:hidden">Track order</span>
              </summary>
              <ol className="mt-3 space-y-3 border-l-2 border-blush-deep pl-4">
                {o.events.map((e, i) => (
                  <li key={i} className="relative">
                    <span className="absolute top-1.5 -left-[21px] h-2.5 w-2.5 rounded-full bg-plum" />
                    <div className="font-medium">{e.label}</div>
                    <div className="text-xs text-mute">{fmtDateTime(e.at)}{e.note ? ` · ${e.note}` : ''}</div>
                  </li>
                ))}
              </ol>
              <div className="mt-3 text-xs text-mute">
                Deliver to: {o.address.name}, {o.address.line1}, {o.address.city} – {o.address.pincode}
              </div>
            </details>
            {(o.status === 'payment_review' || o.status === 'confirmed') && (
              <div className="border-t border-line px-5 py-3 text-right">
                <button onClick={() => setCancelId(o.id)} className="text-sm font-semibold text-red-600 hover:underline">Cancel order</button>
              </div>
            )}
          </article>
        ))}
      </div>
      <CancelDialog
        open={!!cancelId}
        onClose={() => setCancelId(null)}
        presets={['Ordered by mistake', 'Found a better price', 'Delivery is taking too long', 'Want to change address']}
        onConfirm={(reason) => {
          if (cancelId) actions.cancelByCustomer(cancelId, reason)
          setCancelId(null)
        }}
      />
    </div>
  )
}

function Profile(props: { name: string; email?: string; phone: string }) {
  const [name, setName] = useState(props.name)
  const [email, setEmail] = useState(props.email ?? '')
  const [saved, setSaved] = useState(false)
  return (
    <div className="card max-w-xl p-6">
      <h1 className="font-display text-2xl font-bold">Profile</h1>
      <form className="mt-5 space-y-4" onSubmit={(e) => { e.preventDefault(); actions.updateProfile({ name, email }); setSaved(true) }}>
        <div><label className="label">Full name</label><input className="input" value={name} onChange={(e) => { setName(e.target.value); setSaved(false) }} /></div>
        <div><label className="label">Email</label><input className="input" type="email" value={email} onChange={(e) => { setEmail(e.target.value); setSaved(false) }} /></div>
        <div><label className="label">Mobile number</label><input className="input bg-cream" value={`+91 ${props.phone}`} disabled /></div>
        <button className="btn-primary">{saved ? 'Saved ✓' : 'Save changes'}</button>
      </form>
    </div>
  )
}

function Addresses() {
  const s = useStore()
  const user = currentUser(s)!
  const [editing, setEditing] = useState<number | 'new' | null>(null)
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Saved addresses</h1>
        <button className="btn-ghost" onClick={() => setEditing('new')}>+ Add address</button>
      </div>
      {editing !== null && (
        <div className="card mt-4 p-5">
          <AddressForm
            initial={editing === 'new' ? { name: user.name, phone: user.phone } : user.addresses[editing]}
            onCancel={() => setEditing(null)}
            onSave={(a) => { actions.saveAddress(a, editing === 'new' ? undefined : editing); setEditing(null) }}
          />
        </div>
      )}
      <div className="mt-4 space-y-3">
        {user.addresses.map((a, i) => (
          <div key={i} className="card flex items-start justify-between gap-4 p-4 text-sm">
            <div>
              <div className="font-semibold">{a.name} · {a.phone}</div>
              <div className="text-mute">{a.line1}{a.line2 ? `, ${a.line2}` : ''}{a.landmark ? `, near ${a.landmark}` : ''}, {a.city}, {a.state} – {a.pincode}</div>
            </div>
            <div className="flex shrink-0 gap-2">
              <button className="text-plum hover:underline" onClick={() => setEditing(i)}>Edit</button>
              <button className="text-red-600" aria-label="Delete" onClick={() => actions.removeAddress(i)}><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
        {user.addresses.length === 0 && editing === null && <div className="card p-8 text-center text-mute">No saved addresses yet.</div>}
      </div>
    </div>
  )
}

function Password() {
  const [oldPw, setOld] = useState('')
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  return (
    <div className="card max-w-xl p-6">
      <h1 className="font-display text-2xl font-bold">Change password</h1>
      <form
        className="mt-5 space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          if (pw !== pw2) return setMsg({ ok: false, text: 'New passwords do not match' })
          const r = actions.changeOwnPassword(oldPw, pw)
          setMsg(r.ok ? { ok: true, text: 'Password changed successfully' } : { ok: false, text: r.error })
          if (r.ok) { setOld(''); setPw(''); setPw2('') }
        }}
      >
        <div><label className="label">Current password</label><input type="password" className="input" value={oldPw} onChange={(e) => setOld(e.target.value)} /></div>
        <div><label className="label">New password</label><input type="password" className="input" value={pw} onChange={(e) => setPw(e.target.value)} /></div>
        <div><label className="label">Confirm new password</label><input type="password" className="input" value={pw2} onChange={(e) => setPw2(e.target.value)} /></div>
        {msg && <p className={`rounded-xl p-3 text-sm ${msg.ok ? 'bg-green-50 text-leaf' : 'bg-red-50 text-red-700'}`}>{msg.text}</p>}
        <button className="btn-primary">Update password</button>
        <p className="text-xs text-mute">Forgot your current password? Message customer care on WhatsApp and we'll reset it.</p>
      </form>
    </div>
  )
}
