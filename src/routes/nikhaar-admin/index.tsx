import { Link, createFileRoute } from '@tanstack/react-router'
import { AlertTriangle, Clock3, IndianRupee, Package, Users } from 'lucide-react'
import { fmtDateTime, img, inr } from '@/lib/format'
import { StatusChip } from '@/components/Shop'
import { PageTitle, useAdmin } from '@/components/admin'

export const Route = createFileRoute('/nikhaar-admin/')({ component: Dashboard })

function Dashboard() {
  const { s, me } = useAdmin()
  const pending = s.orders.filter((o) => o.status === 'payment_review')
  const revenue = s.orders.filter((o) => ['confirmed', 'shipped', 'delivered'].includes(o.status)).reduce((t, o) => t + o.total, 0)
  const low = s.products.filter((p) => p.stock <= 5).sort((a, b) => a.stock - b.stock)
  const userOf = (id: string) => s.users.find((u) => u.id === id)

  const stats = [
    { label: 'Waiting for payment approval', value: pending.length, icon: Clock3, tone: 'bg-amber-100 text-amber-800' },
    { label: 'Verified sales', value: inr(revenue), icon: IndianRupee, tone: 'bg-green-100 text-leaf' },
    { label: 'Customers', value: s.users.length, icon: Users, tone: 'bg-blush text-plum' },
    { label: 'Products (low stock)', value: `${s.products.length} (${low.length})`, icon: Package, tone: 'bg-blue-100 text-blue-800' },
  ]

  return (
    <div>
      <PageTitle title={`Namaste, ${me?.name}`} sub="Here's what's happening in your shop today." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="card p-5">
            <span className={`grid h-10 w-10 place-items-center rounded-xl ${tone}`}><Icon className="h-5 w-5" /></span>
            <div className="mt-3 text-2xl font-bold">{value}</div>
            <div className="text-sm text-mute">{label}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <section className="card">
          <header className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="font-semibold">Latest orders & activity</h2>
            <Link to="/nikhaar-admin/orders" className="text-sm font-semibold text-plum">All orders →</Link>
          </header>
          <ul className="divide-y divide-line">
            {s.orders.slice(0, 7).map((o) => {
              const u = userOf(o.userId)
              return (
                <li key={o.id} className="flex items-center gap-3 px-5 py-3 text-sm">
                  <img src={img(o.items[0].image, 96)} alt="" className="h-10 w-10 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">
                      {u ? <Link to="/nikhaar-admin/customers/$userId" params={{ userId: u.id }} className="hover:text-plum">{u.name}</Link> : 'Unknown'}{' '}
                      <span className="text-mute">ordered {o.items.length} item(s) · #{o.id}</span>
                    </div>
                    <div className="text-xs text-mute">{fmtDateTime(o.createdAt)} · {inr(o.total)}</div>
                  </div>
                  <StatusChip status={o.status} />
                </li>
              )
            })}
          </ul>
        </section>
        <section className="card">
          <header className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="flex items-center gap-2 font-semibold"><AlertTriangle className="h-4 w-4 text-amber-600" /> Low stock</h2>
            <Link to="/nikhaar-admin/products" className="text-sm font-semibold text-plum">Manage →</Link>
          </header>
          {low.length === 0 && <p className="p-5 text-sm text-mute">All products are well stocked.</p>}
          <ul className="divide-y divide-line">
            {low.map((p) => (
              <li key={p.id} className="flex items-center gap-3 px-5 py-3 text-sm">
                <img src={img(p.images[0], 96)} alt="" className="h-10 w-10 rounded-lg object-cover" />
                <span className="line-clamp-1 flex-1">{p.name}</span>
                <span className={`chip ${p.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'}`}>{p.stock === 0 ? 'Out' : `${p.stock} left`}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
