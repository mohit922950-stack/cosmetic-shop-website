import { Link, createFileRoute } from '@tanstack/react-router'
import { Clock3, MessageCircle } from 'lucide-react'
import { useStore } from '@/lib/store'
import { inr, waLink } from '@/lib/format'
import { ShopLayout } from '@/components/Shop'

export const Route = createFileRoute('/order-success')({
  validateSearch: (s: Record<string, unknown>) => ({ id: String(s.id ?? '') }),
  component: OrderSuccess,
})

function OrderSuccess() {
  const { id } = Route.useSearch()
  const { orders, settings } = useStore()
  const order = orders.find((o) => o.id === id)
  return (
    <ShopLayout>
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <div className="rise card p-10">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-amber-100">
            <Clock3 className="h-8 w-8 text-amber-700" />
          </div>
          <h1 className="mt-5 font-display text-3xl font-bold">Order received!</h1>
          <p className="mt-2 text-mute">
            Order <b className="text-ink">#{id}</b>{order ? ` · ${inr(order.total)}` : ''} is waiting for payment
            verification. We'll confirm it as soon as the money reaches our account.
          </p>
          <div className="mt-8 flex flex-col gap-2">
            <Link to="/account" search={{ tab: 'orders' }} className="btn-primary">View my orders</Link>
            <a className="btn-wa" target="_blank" rel="noreferrer" href={waLink(settings.whatsapp, `Hi, I placed order #${id}. Please verify my payment.`)}>
              <MessageCircle className="h-4 w-4" /> Message us on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </ShopLayout>
  )
}
