import { currentAdmin, useStore } from '@/lib/store'

export function useAdmin() {
  const s = useStore()
  const me = currentAdmin(s)
  return { s, me, isOwner: me?.role === 'owner' }
}

export function PageTitle({ title, sub, children }: { title: string; sub?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-3xl font-bold">{title}</h1>
        {sub && <p className="mt-1 text-sm text-mute">{sub}</p>}
      </div>
      {children}
    </div>
  )
}

export function OwnerOnly({ children }: { children: React.ReactNode }) {
  const { isOwner } = useAdmin()
  if (isOwner) return <>{children}</>
  return (
    <div className="card p-12 text-center text-mute">
      Only the store owner can open this section.
    </div>
  )
}
