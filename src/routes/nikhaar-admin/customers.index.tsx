import { useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { ChevronRight, Search } from 'lucide-react'
import { fmtDate, inr } from '@/lib/format'
import { PageTitle, useAdmin } from '@/components/admin'

export const Route = createFileRoute('/nikhaar-admin/customers/')({ component: Customers })

function Customers() {
  const { s } = useAdmin()
  const [q, setQ] = useState('')
  const digits = q.replace(/\D/g, '')
  const term = q.trim().toLowerCase()
  const list = s.users.filter((u) =>
    !term ? true : digits.length >= 3 ? u.phone.includes(digits) : u.name.toLowerCase().includes(term),
  )
  return (
    <div>
      <PageTitle title="Customers" sub="Search by mobile number and tap a customer to see everything they've done." />
      <div className="relative mb-5 max-w-md">
        <Search className="absolute top-1/2 left-3.5 h-5 w-5 -translate-y-1/2 text-mute" />
        <input autoFocus inputMode="tel" className="input py-3 pl-11 text-base" placeholder="Search by mobile number or name" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="card divide-y divide-line">
        {list.map((u) => {
          const orders = s.orders.filter((o) => o.userId === u.id)
          const spent = orders.filter((o) => o.status !== 'cancelled').reduce((t, o) => t + o.total, 0)
          return (
            <Link key={u.id} to="/nikhaar-admin/customers/$userId" params={{ userId: u.id }} className="flex items-center gap-4 px-5 py-4 hover:bg-cream/60">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-blush font-semibold text-plum">{u.name[0]}</div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 font-semibold">{u.name}{u.blocked && <span className="chip bg-red-100 text-red-700">Blocked</span>}</div>
                <div className="font-mono text-sm">+91 {u.phone}</div>
              </div>
              <div className="hidden text-right text-sm sm:block">
                <div>{orders.length} orders · {inr(spent)}</div>
                <div className="text-xs text-mute">Joined {fmtDate(u.createdAt)}</div>
              </div>
              <ChevronRight className="h-4 w-4 text-mute" />
            </Link>
          )
        })}
        {list.length === 0 && <div className="p-10 text-center text-mute">No customer found for “{q}”.</div>}
      </div>
    </div>
  )
}
