import { useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { Check, MessageCircle, Phone, Search, Truck, X } from 'lucide-react'
import type { Order, OrderStatus } from '@/data/fixtures'
import { STATUS_LABEL, actions } from '@/lib/store'
import { fmtDateTime, img, inr, waLink } from '@/lib/format'
import { CancelDialog, Modal, StatusChip } from '@/components/Shop'
import { PageTitle, useAdmin } from '@/components/admin'

export const Route = createFileRoute('/nikhaar-admin/orders')({ component: OrdersAdmin })

const FILTERS: (OrderStatus | 'all')[] = ['payment_review', 'confirmed', 'shipped', 'delivered', 'cancelled', 'all']

function OrdersAdmin() {
  const { s, isOwner } = useAdmin()
  const [filter, setFilter] = useState<OrderStatus | 'all'>('payment_review')
  const [q, setQ] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)
  const [cancelId, setCancelId] = useState<string | null>(null)
  const userOf = (id: string) => s.users.find((u) => u.id === id)
  const term = q.trim().toLowerCase()
  const list = s.orders.filter((o) => {
    if (filter !== 'all' && o.status !== filter) return false
    if (!term) return true
    const u = userOf(o.userId)
    return `${o.id} ${o.utr} ${u?.name} ${u?.phone} ${o.address.phone}`.toLowerCase().includes(term)
  })
  const open = s.orders.find((o) => o.id === openId)

  return (
    <div>
      <PageTitle title="Orders" sub={isOwner ? 'Verify UTR payments, ship and cancel orders.' : 'View-only access for staff.'}>
        <div className="relative w-full sm:w-72">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-mute" />
          <input className="input pl-9" placeholder="Order ID, UTR, name or phone" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </PageTitle>
      <div className="mb-4 flex gap-2 overflow-x-auto">
        {FILTERS.map((f) => {
          const n = f === 'all' ? s.orders.length : s.orders.filter((o) => o.status === f).length
          return (
            <button key={f} onClick={() => setFilter(f)} className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium ${filter === f ? 'bg-plum text-white' : 'bg-white text-mute'}`}>
              {f === 'all' ? 'All' : STATUS_LABEL[f]} ({n})
            </button>
          )
        })}
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="border-b border-line text-left text-xs tracking-wide text-mute uppercase">
            <tr><th className="p-4">Order</th><th className="p-4">Customer</th><th className="p-4">Items</th><th className="p-4">Amount / UTR</th><th className="p-4">Status</th><th className="p-4"></th></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {list.map((o) => {
              const u = userOf(o.userId)
              return (
                <tr key={o.id} className="hover:bg-cream/60">
                  <td className="p-4"><div className="font-semibold">#{o.id}</div><div className="text-xs text-mute">{fmtDateTime(o.createdAt)}</div></td>
                  <td className="p-4">
                    {u ? <Link to="/nikhaar-admin/customers/$userId" params={{ userId: u.id }} className="font-medium hover:text-plum">{u.name}</Link> : '—'}
                    <div className="text-xs text-mute">{u?.phone}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex -space-x-2">
                      {o.items.map((it) => <img key={it.productId} src={img(it.image, 80)} alt="" className="h-9 w-9 rounded-lg border-2 border-white object-cover" />)}
                    </div>
                  </td>
                  <td className="p-4"><div className="font-semibold">{inr(o.total)}</div><div className="font-mono text-xs text-mute">{o.utr}</div></td>
                  <td className="p-4"><StatusChip status={o.status} /></td>
                  <td className="p-4 text-right"><button className="btn-ghost py-1.5" onClick={() => setOpenId(o.id)}>Open</button></td>
                </tr>
              )
            })}
            {list.length === 0 && <tr><td colSpan={6} className="p-10 text-center text-mute">No orders in this list.</td></tr>}
          </tbody>
        </table>
      </div>

      {open && (
        <OrderModal
          order={open}
          canAct={isOwner}
          onClose={() => setOpenId(null)}
          onCancel={() => setCancelId(open.id)}
        />
      )}
      <CancelDialog
        open={!!cancelId}
        title="Cancel order (customer will see this reason)"
        onClose={() => setCancelId(null)}
        presets={['Payment not received – UTR not found', 'Amount paid is less than order total', 'Screenshot looks fake / edited', 'Product out of stock', 'Customer asked to cancel']}
        onConfirm={(reason) => {
          if (cancelId) actions.cancelByAdmin(cancelId, reason)
          setCancelId(null)
        }}
      />
    </div>
  )
}

function OrderModal({ order: o, canAct, onClose, onCancel }: { order: Order; canAct: boolean; onClose: () => void; onCancel: () => void }) {
  const { s } = useAdmin()
  const u = s.users.find((x) => x.id === o.userId)
  return (
    <Modal open onClose={onClose} title={`Order #${o.id}`} wide>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4 text-sm">
          <div className="flex items-center gap-2"><StatusChip status={o.status} /><span className="text-mute">{fmtDateTime(o.createdAt)}</span></div>
          <div className="card p-4">
            <div className="label">Payment</div>
            <div className="text-2xl font-bold">{inr(o.total)}</div>
            <div className="mt-1">UTR: <span className="font-mono font-semibold">{o.utr}</span></div>
            <p className="mt-1 text-xs text-mute">Match this UTR and amount in your bank / UPI app before approving.</p>
          </div>
          <div className="card p-4">
            <div className="label">Deliver to</div>
            <div className="font-semibold">{o.address.name}</div>
            <div className="text-mute">{o.address.line1}{o.address.line2 ? `, ${o.address.line2}` : ''}{o.address.landmark ? `, near ${o.address.landmark}` : ''}<br />{o.address.city}, {o.address.state} – {o.address.pincode}</div>
            <div className="mt-2 flex gap-2">
              <a href={`tel:${o.address.phone}`} className="btn-ghost py-1.5 text-xs"><Phone className="h-3.5 w-3.5" /> {o.address.phone}</a>
              <a href={waLink('91' + o.address.phone, `Hi ${o.address.name}, this is Nikhaar about your order #${o.id}.`)} target="_blank" rel="noreferrer" className="btn-wa py-1.5 text-xs"><MessageCircle className="h-3.5 w-3.5" /> WhatsApp</a>
            </div>
            {u && <Link to="/nikhaar-admin/customers/$userId" params={{ userId: u.id }} className="mt-2 inline-block text-xs font-semibold text-plum">View customer history →</Link>}
          </div>
          <ul className="card divide-y divide-line">
            {o.items.map((it) => (
              <li key={it.productId} className="flex items-center gap-3 p-3">
                <img src={img(it.image, 96)} alt="" className="h-12 w-12 rounded-lg object-cover" />
                <span className="line-clamp-2 flex-1">{it.name}</span>
                <span className="shrink-0">{it.qty} × {inr(it.price)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-4">
          <div>
            <div className="label">Payment screenshot</div>
            {o.screenshot ? (
              <a href={o.screenshot} target="_blank" rel="noreferrer"><img src={o.screenshot} alt="Payment screenshot" className="max-h-80 w-full rounded-xl border border-line bg-cream object-contain" /></a>
            ) : (
              <div className="grid h-40 place-items-center rounded-xl border border-dashed border-line text-sm text-mute">Sample order – no screenshot</div>
            )}
          </div>
          <div>
            <div className="label">Timeline</div>
            <ol className="space-y-2 border-l-2 border-blush-deep pl-4 text-sm">
              {o.events.map((e, i) => (
                <li key={i}><div className="font-medium">{e.label}{e.by ? ` · ${e.by}` : ''}</div><div className="text-xs text-mute">{fmtDateTime(e.at)}{e.note ? ` · ${e.note}` : ''}</div></li>
              ))}
            </ol>
          </div>
          {o.cancelReason && <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700"><b>Cancel reason:</b> {o.cancelReason}</div>}
          {canAct && o.status !== 'cancelled' && o.status !== 'delivered' && (
            <div className="flex flex-wrap gap-2 border-t border-line pt-4">
              {o.status === 'payment_review' && <button className="btn-primary bg-leaf hover:bg-green-800" onClick={() => actions.approvePayment(o.id)}><Check className="h-4 w-4" /> Payment received – approve</button>}
              {o.status === 'confirmed' && <button className="btn-primary" onClick={() => actions.advanceOrder(o.id, 'shipped')}><Truck className="h-4 w-4" /> Mark shipped</button>}
              {o.status === 'shipped' && <button className="btn-primary" onClick={() => actions.advanceOrder(o.id, 'delivered')}><Check className="h-4 w-4" /> Mark delivered</button>}
              <button className="btn-ghost text-red-600" onClick={onCancel}><X className="h-4 w-4" /> Cancel with reason</button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
