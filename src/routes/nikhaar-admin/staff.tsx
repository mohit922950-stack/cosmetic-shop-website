import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Check, KeyRound, Trash2, UserPlus, X } from 'lucide-react'
import { actions } from '@/lib/store'
import { fmtDate } from '@/lib/format'
import { Modal } from '@/components/Shop'
import { OwnerOnly, PageTitle, useAdmin } from '@/components/admin'

export const Route = createFileRoute('/nikhaar-admin/staff')({
  component: () => (
    <OwnerOnly>
      <Staff />
    </OwnerOnly>
  ),
})

function Staff() {
  const { s } = useAdmin()
  const [form, setForm] = useState({ name: '', username: '', password: '' })
  const [error, setError] = useState('')
  const [pwFor, setPwFor] = useState<string | null>(null)
  const [newPw, setNewPw] = useState('')

  return (
    <div className="max-w-4xl">
      <PageTitle title="Staff" sub="Staff can add products, update stock and view orders. They cannot approve payments, block customers, reset passwords or change settings." />
      <section className="card p-5">
        <h2 className="flex items-center gap-2 font-semibold"><UserPlus className="h-4 w-4" /> Add staff member</h2>
        <form
          className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto]"
          onSubmit={(e) => {
            e.preventDefault()
            const r = actions.addStaff(form)
            if (!r.ok) return setError(r.error)
            setError('')
            setForm({ name: '', username: '', password: '' })
          }}
        >
          <input className="input" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="input" placeholder="Login username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
          <input className="input" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <button className="btn-primary">Add</button>
        </form>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </section>

      <div className="card mt-6 divide-y divide-line">
        {s.staff.map((m) => (
          <div key={m.id} className="flex flex-wrap items-center gap-3 px-5 py-4 text-sm">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-blush font-semibold text-plum">{m.name[0]}</div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold">{m.name} <span className={`chip ml-1 ${m.role === 'owner' ? 'bg-plum text-white' : 'bg-blush text-plum'}`}>{m.role === 'owner' ? 'Owner' : 'Staff'}</span></div>
              <div className="text-xs text-mute">@{m.username} · added {fmtDate(m.createdAt)}</div>
            </div>
            {m.role === 'staff' && (
              <div className="flex gap-2">
                <button className="btn-ghost py-1.5 text-xs" onClick={() => { setPwFor(m.id); setNewPw('') }}><KeyRound className="h-3.5 w-3.5" /> Password</button>
                <button className="btn-ghost py-1.5 text-xs" onClick={() => actions.updateStaff(m.id, { active: !m.active })}>
                  {m.active ? <><X className="h-3.5 w-3.5" /> Disable</> : <><Check className="h-3.5 w-3.5" /> Enable</>}
                </button>
                <button className="btn-ghost py-1.5 text-xs text-red-600" onClick={() => confirm(`Remove ${m.name}?`) && actions.removeStaff(m.id)}><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            )}
          </div>
        ))}
      </div>

      <Modal open={!!pwFor} onClose={() => setPwFor(null)} title="Set staff password">
        <input className="input" placeholder="New password (min 6)" value={newPw} onChange={(e) => setNewPw(e.target.value)} />
        <div className="mt-4 flex justify-end">
          <button className="btn-primary" disabled={newPw.length < 6} onClick={() => { if (pwFor) actions.updateStaff(pwFor, { password: newPw }); setPwFor(null) }}>Save</button>
        </div>
      </Modal>
    </div>
  )
}
