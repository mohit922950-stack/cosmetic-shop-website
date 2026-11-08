import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { ImageUp, MessageCircle, QrCode, RotateCcw, ShieldCheck } from 'lucide-react'
import { actions } from '@/lib/store'
import { imageToDataUrl } from '@/lib/files'
import { waLink } from '@/lib/format'
import { UpiQr } from '@/components/Shop'
import { PageTitle, useAdmin } from '@/components/admin'

export const Route = createFileRoute('/nikhaar-admin/settings')({ component: Settings })

function Settings() {
  const { s, isOwner } = useAdmin()
  return (
    <div className="max-w-4xl space-y-6">
      <PageTitle title="Settings" />
      <AdminPassword />
      {isOwner && (
        <>
          <Payment key={`pay-${s.settings.upiId}`} />
          <WhatsApp key={`wa-${s.settings.whatsapp}`} />
          <section className="card flex flex-wrap items-center justify-between gap-3 p-5 text-sm">
            <div><div className="font-semibold">Reset sample data</div><div className="text-mute">Brings back the sample products, customers and orders.</div></div>
            <button className="btn-ghost text-red-600" onClick={() => confirm('Reset all data to the sample shop?') && actions.resetDemo()}><RotateCcw className="h-4 w-4" /> Reset</button>
          </section>
        </>
      )}
    </div>
  )
}

function AdminPassword() {
  const [oldPw, setOld] = useState('')
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  return (
    <section className="card p-5">
      <h2 className="flex items-center gap-2 font-semibold"><ShieldCheck className="h-4 w-4" /> Change my admin password</h2>
      <form
        className="mt-4 grid gap-3 sm:grid-cols-3"
        onSubmit={(e) => {
          e.preventDefault()
          if (pw !== pw2) return setMsg({ ok: false, text: 'New passwords do not match' })
          const r = actions.changeAdminPassword(oldPw, pw)
          setMsg(r.ok ? { ok: true, text: 'Password changed' } : { ok: false, text: r.error })
          if (r.ok) { setOld(''); setPw(''); setPw2('') }
        }}
      >
        <input type="password" className="input" placeholder="Current password" value={oldPw} onChange={(e) => setOld(e.target.value)} />
        <input type="password" className="input" placeholder="New password" value={pw} onChange={(e) => setPw(e.target.value)} />
        <input type="password" className="input" placeholder="Confirm new password" value={pw2} onChange={(e) => setPw2(e.target.value)} />
        <div className="flex items-center gap-3 sm:col-span-3">
          <button className="btn-primary">Update password</button>
          {msg && <span className={`text-sm ${msg.ok ? 'text-leaf' : 'text-red-600'}`}>{msg.text}</span>}
        </div>
      </form>
    </section>
  )
}

function Payment() {
  const { s } = useAdmin()
  const [upiId, setUpi] = useState(s.settings.upiId)
  const [payee, setPayee] = useState(s.settings.payeeName)
  const [saved, setSaved] = useState(false)
  return (
    <section className="card p-5">
      <h2 className="flex items-center gap-2 font-semibold"><QrCode className="h-4 w-4" /> Payment QR & UPI</h2>
      <div className="mt-4 grid gap-6 md:grid-cols-[auto_1fr]">
        <UpiQr size={180} />
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div><label className="label">UPI ID</label><input className="input" value={upiId} onChange={(e) => { setUpi(e.target.value); setSaved(false) }} /></div>
            <div><label className="label">Payee name</label><input className="input" value={payee} onChange={(e) => { setPayee(e.target.value); setSaved(false) }} /></div>
          </div>
          <button className="btn-primary" onClick={() => { actions.updateSettings({ upiId: upiId.trim(), payeeName: payee.trim() }); setSaved(true) }}>{saved ? 'Saved ✓' : 'Save UPI details'}</button>
          <div className="rounded-xl bg-cream p-4 text-sm">
            <div className="font-medium">Use your own QR image instead</div>
            <p className="text-xs text-mute">Upload the QR from PhonePe / GPay / Paytm business. If no image is uploaded, a QR is made automatically from the UPI ID.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <label className="btn-ghost cursor-pointer">
                <ImageUp className="h-4 w-4" /> Upload new QR
                <input type="file" accept="image/*" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (f) actions.updateSettings({ qrImage: await imageToDataUrl(f, 700, 0.92) }) }} />
              </label>
              {s.settings.qrImage && <button className="btn-ghost text-red-600" onClick={() => actions.updateSettings({ qrImage: '' })}>Remove uploaded QR</button>}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function WhatsApp() {
  const { s } = useAdmin()
  const [num, setNum] = useState(s.settings.whatsapp)
  const digits = num.replace(/\D/g, '')
  return (
    <section className="card p-5">
      <h2 className="flex items-center gap-2 font-semibold"><MessageCircle className="h-4 w-4 text-leaf" /> Customer care WhatsApp</h2>
      <p className="mt-1 text-sm text-mute">Every WhatsApp button in the shop (login page, customer care, footer) opens a chat with this number.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <input className="input max-w-xs font-mono" value={num} onChange={(e) => setNum(e.target.value)} placeholder="91XXXXXXXXXX" />
        <button className="btn-primary" disabled={digits.length < 10} onClick={() => actions.updateSettings({ whatsapp: digits.length === 10 ? '91' + digits : digits })}>Save number</button>
        <a className="btn-wa" href={waLink(s.settings.whatsapp, 'Test message from Nikhaar admin')} target="_blank" rel="noreferrer">Test link</a>
      </div>
      <p className="mt-2 text-xs text-mute">Include country code, e.g. 919876543210. A 10-digit number gets +91 added.</p>
    </section>
  )
}
