import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { KeyRound, MessageCircle } from 'lucide-react'
import { actions, useStore } from '@/lib/store'
import { img, waLink } from '@/lib/format'
import { ShopLayout } from '@/components/Shop'

export const Route = createFileRoute('/login')({
  validateSearch: (s: Record<string, unknown>): { redirect?: string; mode?: 'signup' } => ({
    redirect: typeof s.redirect === 'string' ? s.redirect : undefined,
    mode: s.mode === 'signup' ? 'signup' : undefined,
  }),
  component: LoginPage,
})

function LoginPage() {
  const search = Route.useSearch()
  const navigate = useNavigate()
  const { settings } = useStore()
  const [mode, setMode] = useState<'login' | 'signup'>(search.mode ?? 'login')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const r = mode === 'login' ? actions.login(phone, password) : actions.signup({ name, phone, password })
    if (!r.ok) return setError(r.error)
    navigate({ to: search.redirect === '/checkout' ? '/checkout' : '/account' })
  }

  return (
    <ShopLayout>
      <div className="mx-auto grid max-w-4xl overflow-hidden px-4 py-10 md:grid-cols-2 md:py-16">
        <div className="relative hidden overflow-hidden rounded-l-3xl bg-plum p-10 text-white md:block">
          <img src={img('/img/packaging.png', 700)} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
          <div className="relative">
            <h1 className="font-display text-4xl font-bold">{mode === 'login' ? 'Welcome back' : 'Join Nikhaar'}</h1>
            <p className="mt-3 text-white/80">Track orders, save addresses and check out faster.</p>
          </div>
        </div>
        <div className="card rounded-3xl p-8 md:rounded-l-none">
          <div className="mb-6 flex rounded-full bg-blush p-1 text-sm font-semibold">
            {(['login', 'signup'] as const).map((m) => (
              <button key={m} onClick={() => { setMode(m); setError('') }} className={`flex-1 rounded-full py-2 ${mode === m ? 'bg-white text-plum shadow' : 'text-mute'}`}>
                {m === 'login' ? 'Login' : 'Create account'}
              </button>
            ))}
          </div>
          <form onSubmit={submit} className="space-y-4">
            {mode === 'signup' && (
              <div><label className="label">Full name</label><input className="input" value={name} onChange={(e) => setName(e.target.value)} /></div>
            )}
            <div>
              <label className="label">Mobile number</label>
              <div className="flex">
                <span className="grid place-items-center rounded-l-xl border border-r-0 border-line bg-blush/40 px-3 text-sm">+91</span>
                <input className="input rounded-l-none" inputMode="tel" maxLength={10} value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} placeholder="10-digit number" />
              </div>
            </div>
            <div><label className="label">Password</label><input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
            {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            <button className="btn-primary w-full py-3" type="submit">{mode === 'login' ? 'Login' : 'Create account'}</button>
          </form>

          <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-leaf">
              <KeyRound className="h-4 w-4" /> Forgot password or need help?
            </div>
            <p className="mt-1 text-xs text-mute">Message our customer care on WhatsApp — we'll reset your password for you.</p>
            <a
              className="btn-wa mt-3 w-full"
              target="_blank"
              rel="noreferrer"
              href={waLink(settings.whatsapp, `Hi Nikhaar, I need help with my account${phone ? ` (mobile: ${phone})` : ''}.`)}
            >
              <MessageCircle className="h-4 w-4" /> Chat with customer care
            </a>
          </div>
          <p className="mt-4 text-center text-xs text-mute">Demo login: 9876543210 / priya123</p>
        </div>
      </div>
    </ShopLayout>
  )
}
