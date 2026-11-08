import { useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowLeft, Ban, KeyRound, MapPin, MessageCircle, Phone, ShieldCheck } from 'lucide-react'
import { actions } from '@/lib/store'
import { fmtDate, fmtDateTime, img, inr, waLink } from '@/lib/format'
import { Modal, StatusChip } from '@/components/Shop'
import { PageTitle, useAdmin } from '@/components/admin'

export const Route = createFileRoute('/nikhaar-admin/customers/$userId')({ component: CustomerDetail })

function CustomerDetail() {
  const { userId } = Route.useParams()
  const { s, isOwner } = useAdmin()
  const u = s.users.find((x) => x.id === userId)
  const [blockOpen, setBlockOpen] = useState(false)
  const [blockReason, setBlockReason] = useState('')
  const [pwOpen, setPwOpen] = useState(false)
  const [pw, setPw] = useState('')
  const [pwMsg, setPwMsg] = useState('')
  const [pwOk, setPwOk] = useState(false)

  if (!u) return <div className="text-mute">Customer not found. <Link to="/nikhaar-admin/customers" className="text-plum underline">Back</Link></div>

  const orders = s.orders.filter((o) => o.userId === u.id)
  const activity = orders
    .flatMap((o) => o.events.map((e) => ({ ...e, order: o })))
    .sort((a, b) => b.at.localeCompare(a.at))
  const spent = orders.filter((o) => o.status !== 'cancelled').reduce((t, o) => t + o.total, 0)

  return (
    <div>
      <Link to="/nikhaar-admin/customers" className="mb-3 inline-flex items-center gap-1 text-sm text-mute hover:text-plum"><ArrowLeft className="h-4 w-4" /> All customers</Link>
      <PageTitle title={u.name} sub={`Customer since ${fmtDate(u.createdAt)} · ${orders.length} orders · ${inr(spent)} spent`}>
        <div className="flex flex-wrap gap-2">
          <a href={`tel:${u.phone}`} className="btn-ghost"><Phone className="h-4 w-4" /> Call</a>
          <a href={waLink('91' + u.phone, `Hi ${u.name}, this is Nikhaar customer care.`)} target="_blank" rel="noreferrer" className="btn-wa"><MessageCircle className="h-4 w-4" /> WhatsApp</a>
          {isOwner && (
            <>
              <button className="btn-ghost" onClick={() => { setPw(''); setPwMsg(''); setPwOk(false); setPwOpen(true) }}><KeyRound className="h-4 w-4" /> Reset password</button>
              {u.blocked ? (
                <button className="btn-primary bg-leaf hover:bg-green-800" onClick={() => actions.setBlocked(u.id, false)}><ShieldCheck className="h-4 w-4" /> Unblock</button>
              ) : (
                <button className="btn-danger" onClick={() => { setBlockReason(''); setBlockOpen(true) }}><Ban className="h-4 w-4" /> Block</button>
              )}
            </>
          )}
        </div>
      </PageTitle>

      {u.blocked && <div className="mb-6 rounded-2xl bg-red-50 p-4 text-sm text-red-700"><b>Blocked.</b> {u.blockedReason ? `Reason: ${u.blockedReason}` : ''} This customer cannot log in or order.</div>}

      <div className="grid gap-6 xl:grid-cols-[1fr_1.3fr]">
        <div className="space-y-6">
          <section className="card p-5 text-sm">
            <h2 className="mb-3 font-semibold">Contact</h2>
            <div className="grid grid-cols-[100px_1fr] gap-y-2">
              <span className="text-mute">Mobile</span><span className="font-mono font-semibold">+91 {u.phone}</span>
              <span className="text-mute">Email</span><span>{u.email || '—'}</span>
              <span className="text-mute">Status</span><span>{u.blocked ? 'Blocked' : 'Active'}</span>
            </div>
          </section>
          <section className="card p-5 text-sm">
            <h2 className="mb-3 flex items-center gap-2 font-semibold"><MapPin className="h-4 w-4" /> Addresses</h2>
            {u.addresses.length === 0 && <p className="text-mute">No address saved.</p>}
            <ul className="space-y-3">
              {u.addresses.map((a, i) => (
                <li key={i} className="rounded-xl bg-cream p-3"><b>{a.name}</b> · {a.phone}<br /><span className="text-mute">{a.line1}{a.line2 ? `, ${a.line2}` : ''}{a.landmark ? `, near ${a.landmark}` : ''}, {a.city}, {a.state} – {a.pincode}</span></li>
              ))}
            </ul>
          </section>
          <section className="card">
            <h2 className="border-b border-line px-5 py-4 font-semibold">Orders</h2>
            <ul className="divide-y divide-line">
              {orders.map((o) => (
                <li key={o.id} className="flex items-center gap-3 px-5 py-3 text-sm">
                  <img src={img(o.items[0].image, 80)} alt="" className="h-10 w-10 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">#{o.id} · {inr(o.total)}</div>
                    <div className="text-xs text-mute">{fmtDateTime(o.createdAt)} · UTR {o.utr}</div>
                    {o.cancelReason && <div className="text-xs text-red-600">Reason: {o.cancelReason}</div>}
                  </div>
                  <StatusChip status={o.status} />
                </li>
              ))}
              {orders.length === 0 && <li className="p-5 text-sm text-mute">No orders yet.</li>}
            </ul>
          </section>
        </div>

        <section className="card p-5">
          <h2 className="mb-4 font-semibold">Full activity timeline</h2>
          <ol className="space-y-4 border-l-2 border-blush-deep pl-5 text-sm">
            {activity.map((e, i) => (
              <li key={i} className="relative">
                <span className={`absolute top-1.5 -left-[27px] h-3 w-3 rounded-full ring-4 ring-white ${e.label.startsWith('Cancelled') ? 'bg-red-500' : e.label.startsWith('Order placed') ? 'bg-gold' : 'bg-plum'}`} />
                <div className="text-xs font-semibold text-mute">{fmtDateTime(e.at)}</div>
                <div className="font-medium">{e.label} <span className="font-normal text-mute">· #{e.order.id}</span></div>
                {e.label.startsWith('Order placed') && <div className="text-xs text-mute">{e.order.items.map((it) => `${it.name} × ${it.qty}`).join(', ')} · {inr(e.order.total)}</div>}
                {e.note && <div className="text-xs text-red-600">Reason: {e.note}</div>}
                {e.by && <div className="text-xs text-mute">by {e.by}</div>}
              </li>
            ))}
            <li className="relative"><span className="absolute top-1.5 -left-[27px] h-3 w-3 rounded-full bg-leaf ring-4 ring-white" /><div className="text-xs font-semibold text-mute">{fmtDateTime(u.createdAt)}</div><div className="font-medium">Account created</div></li>
          </ol>
        </section>
      </div>

      <Modal open={blockOpen} onClose={() => setBlockOpen(false)} title={`Block ${u.name}?`}>
        <p className="text-sm text-mute">They will be logged out and won't be able to log in or place orders.</p>
        <label className="label mt-4">Reason (for your records)</label>
        <input className="input" value={blockReason} onChange={(e) => setBlockReason(e.target.value)} placeholder="e.g. Fake UTR submitted" />
        <div className="mt-5 flex justify-end gap-2">
          <button className="btn-ghost" onClick={() => setBlockOpen(false)}>Cancel</button>
          <button className="btn-danger" onClick={() => { actions.setBlocked(u.id, true, blockReason); setBlockOpen(false) }}>Block customer</button>
        </div>
      </Modal>

      <Modal open={pwOpen} onClose={() => setPwOpen(false)} title="Set a new password">
        <p className="text-sm text-mute">Use this when a customer forgets their password and asks on WhatsApp.</p>
        <label className="label mt-4">New password</label>
        <input className="input" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="At least 6 characters" />
        {pwMsg && <p className={`mt-2 text-sm ${pwOk ? 'text-leaf' : 'text-red-600'}`}>{pwMsg}</p>}
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          {pwOk && <a className="btn-wa" target="_blank" rel="noreferrer" href={waLink('91' + u.phone, `Hi ${u.name}, your Nikhaar password has been reset. New password: ${pw}\nPlease change it from My Account → Change password after logging in.`)}><MessageCircle className="h-4 w-4" /> Send on WhatsApp</a>}
          <button className="btn-primary" onClick={() => { const r = actions.setUserPassword(u.id, pw); setPwOk(r.ok); setPwMsg(r.ok ? 'Password updated.' : r.error) }}>Save password</button>
        </div>
      </Modal>
    </div>
  )
}
