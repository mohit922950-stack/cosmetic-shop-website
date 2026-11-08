import { createFileRoute } from '@tanstack/react-router'
import { KeyRound, MessageCircle, Package, Wallet } from 'lucide-react'
import { useStore } from '@/lib/store'
import { waLink } from '@/lib/format'
import { ShopLayout } from '@/components/Shop'

export const Route = createFileRoute('/support')({ component: Support })

const TOPICS = [
  { icon: Wallet, title: 'Payment / UTR help', text: 'Hi Nikhaar, I have a question about my payment verification.' },
  { icon: Package, title: 'Where is my order?', text: 'Hi Nikhaar, I want to know the status of my order.' },
  { icon: KeyRound, title: 'Reset my password', text: 'Hi Nikhaar, I forgot my password. My registered mobile number is ' },
  { icon: MessageCircle, title: 'Product advice', text: 'Hi Nikhaar, can you suggest a product for my skin type?' },
]

function Support() {
  const { settings } = useStore()
  return (
    <ShopLayout>
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="font-display text-4xl font-bold">Customer care</h1>
        <p className="mt-2 text-mute">Pick a topic — it opens WhatsApp with your message ready to send.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {TOPICS.map(({ icon: Icon, title, text }) => (
            <a key={title} href={waLink(settings.whatsapp, text)} target="_blank" rel="noreferrer" className="card flex items-center gap-4 p-5 transition hover:-translate-y-0.5 hover:border-green-300 hover:shadow-lg">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-green-50 text-leaf"><Icon className="h-6 w-6" /></span>
              <span className="font-semibold">{title}</span>
            </a>
          ))}
        </div>
        <a href={waLink(settings.whatsapp)} target="_blank" rel="noreferrer" className="btn-wa mt-8 w-full py-3.5 text-base">
          <MessageCircle className="h-5 w-5" /> Open WhatsApp chat (+{settings.whatsapp})
        </a>
      </div>
    </ShopLayout>
  )
}
