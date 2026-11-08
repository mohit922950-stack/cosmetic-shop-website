import { useState } from 'react'
import { Link, Outlet, createFileRoute } from '@tanstack/react-router'
import { LayoutDashboard, LogOut, Package, Settings, ShieldCheck, ShoppingCart, Sparkles, Users, UsersRound } from 'lucide-react'
import { actions } from '@/lib/store'
import { useAdmin } from '@/components/admin'

export const Route = createFileRoute('/nikhaar-admin')({
  head: () => ({ meta: [{ title: 'Nikhaar Admin' }, { name: 'robots', content: 'noindex, nofollow' }] }),
  component: AdminLayout,
})

const NAV = [
  { to: '/nikhaar-admin', label: 'Dashboard', icon: LayoutDashboard, owner: false, exact: true },
  { to: '/nikhaar-admin/orders', label: 'Orders', icon: ShoppingCart, owner: false },
  { to: '/nikhaar-admin/products', label: 'Products & stock', icon: Package, owner: false },
  { to: '/nikhaar-admin/customers', label: 'Customers', icon: Users, owner: false },
  { to: '/nikhaar-admin/staff', label: 'Staff', icon: UsersRound, owner: true },
  { to: '/nikhaar-admin/settings', label: 'Settings', icon: Settings, owner: false },
] as const

function AdminLayout() {
  const { s, me, isOwner } = useAdmin()
  const pending = s.orders.filter((o) => o.status === 'payment_review').length

  if (!s.ready) return <div className="grid min-h-screen place-items-center text-mute">Loading…</div>
  if (!me) return <AdminLogin />

  return (
    <div className="min-h-screen md:grid md:grid-cols-[250px_1fr]">
      <aside className="bg-plum-dark text-white/80 md:sticky md:top-0 md:h-screen">
        <div className="flex items-center gap-2 px-5 py-5">
          <Sparkles className="h-5 w-5 text-gold" />
          <span className="font-display text-xl font-bold text-white">Nikhaar</span>
          <span className="chip ml-auto bg-white/10 text-white">{isOwner ? 'Owner' : 'Staff'}</span>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col">
          {NAV.filter((n) => isOwner || !n.owner).map(({ to, label, icon: Icon, ...n }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: 'exact' in n }}
              className="flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-white/10"
              activeProps={{ className: 'bg-white/15 text-white' }}
            >
              <Icon className="h-4 w-4" /> {label}
              {to === '/nikhaar-admin/orders' && pending > 0 && (
                <span className="ml-auto rounded-full bg-gold px-2 text-xs text-white">{pending}</span>
              )}
            </Link>
          ))}
        </nav>
        <div className="hidden border-t border-white/10 p-4 text-sm md:absolute md:inset-x-0 md:bottom-0 md:block">
          <div className="font-semibold text-white">{me.name}</div>
          <div className="text-xs">@{me.username}</div>
          <button onClick={actions.adminLogout} className="mt-3 flex items-center gap-2 text-xs hover:text-white">
            <LogOut className="h-4 w-4" /> Log out
          </button>
        </div>
      </aside>
      <main className="min-w-0 bg-cream px-4 py-8 md:px-8">
        <div className="mb-4 flex justify-end md:hidden">
          <button onClick={actions.adminLogout} className="btn-ghost py-1.5 text-xs"><LogOut className="h-3.5 w-3.5" /> Log out</button>
        </div>
        <Outlet />
      </main>
    </div>
  )
}

function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  return (
    <div className="grid min-h-screen place-items-center bg-plum-dark px-4">
      <form
        className="rise card w-full max-w-sm p-8"
        onSubmit={(e) => {
          e.preventDefault()
          const r = actions.adminLogin(username, password)
          if (!r.ok) setError(r.error)
        }}
      >
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-plum text-white">
          <ShieldCheck className="h-7 w-7" />
        </div>
        <h1 className="mt-4 text-center font-display text-2xl font-bold">Nikhaar Admin</h1>
        <p className="text-center text-sm text-mute">Owner & staff login</p>
        <div className="mt-6 space-y-4">
          <div><label className="label">Username</label><input className="input" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} /></div>
          <div><label className="label">Password</label><input type="password" className="input" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
          {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <button className="btn-primary w-full py-3">Login to admin</button>
        </div>
        <p className="mt-4 text-center text-xs text-mute">Demo: admin / admin123 · staff: meena / meena123</p>
      </form>
    </div>
  )
}
