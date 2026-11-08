import { useState } from 'react'
import type { Address } from '@/data/fixtures'

const empty: Address = { name: '', phone: '', line1: '', line2: '', landmark: '', city: '', state: '', pincode: '' }

export function AddressForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Partial<Address>
  onSave: (a: Address) => void
  onCancel?: () => void
}) {
  const [a, setA] = useState<Address>({ ...empty, ...initial })
  const [err, setErr] = useState('')
  const f = (k: keyof Address) => ({
    value: a[k] ?? '',
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setA({ ...a, [k]: e.target.value }),
  })
  return (
    <form
      className="grid gap-3 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault()
        if (!a.name || !a.line1 || !a.city || !a.state) return setErr('Please fill all required fields')
        if (a.phone.replace(/\D/g, '').length !== 10) return setErr('Enter a 10-digit mobile number')
        if (!/^\d{6}$/.test(a.pincode)) return setErr('Enter a 6-digit pincode')
        onSave(a)
      }}
    >
      <div><label className="label">Full name *</label><input className="input" {...f('name')} /></div>
      <div><label className="label">Mobile number *</label><input className="input" inputMode="tel" {...f('phone')} /></div>
      <div className="sm:col-span-2"><label className="label">House no., building, street *</label><input className="input" {...f('line1')} /></div>
      <div><label className="label">Area / locality</label><input className="input" {...f('line2')} /></div>
      <div><label className="label">Landmark</label><input className="input" {...f('landmark')} /></div>
      <div><label className="label">City *</label><input className="input" {...f('city')} /></div>
      <div><label className="label">State *</label><input className="input" {...f('state')} /></div>
      <div><label className="label">Pincode *</label><input className="input" inputMode="numeric" maxLength={6} {...f('pincode')} /></div>
      {err && <p className="text-sm text-red-600 sm:col-span-2">{err}</p>}
      <div className="flex gap-2 sm:col-span-2">
        <button className="btn-primary" type="submit">Save address</button>
        {onCancel && <button type="button" className="btn-ghost" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  )
}
