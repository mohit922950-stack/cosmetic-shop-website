import { Link, createFileRoute } from '@tanstack/react-router'
import { BadgeCheck, QrCode, ShieldCheck, Truck } from 'lucide-react'
import { CATEGORIES } from '@/data/fixtures'
import type { Category } from '@/data/fixtures'
import { useStore } from '@/lib/store'
import { img } from '@/lib/format'
import { ProductCard, ShopLayout } from '@/components/Shop'

interface HomeSearch {
  q?: string
  cat?: Category
}

export const Route = createFileRoute('/')({
  validateSearch: (s: Record<string, unknown>): HomeSearch => ({
    q: typeof s.q === 'string' && s.q ? s.q : undefined,
    cat: CATEGORIES.includes(s.cat as Category) ? (s.cat as Category) : undefined,
  }),
  component: Home,
})

const CAT_IMG: Record<Category, string> = {
  Lips: '/img/lipstick.png',
  Face: '/img/foundation.png',
  'Skin Care': '/img/serum.png',
  Eyes: '/img/kajal.png',
  'Sun Care': '/img/sunscreen.png',
  Nails: '/img/nailpolish.png',
}

function Home() {
  const { q, cat } = Route.useSearch()
  const { products } = useStore()
  const live = products.filter((p) => p.active)
  const term = q?.toLowerCase().trim()
  const filtered = live.filter(
    (p) =>
      (!cat || p.category === cat) &&
      (!term ||
        `${p.name} ${p.brand} ${p.category} ${p.shortDescription}`.toLowerCase().includes(term)),
  )
  const browsing = !!(q || cat)

  return (
    <ShopLayout query={q}>
      {!browsing && (
        <>
          <section className="relative overflow-hidden">
            <img
              src={img('/img/hero.png', 1800)}
              alt="Assorted lipsticks, serum and makeup on pink marble"
              className="absolute inset-0 h-full w-full object-cover object-right"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-cream via-cream/80 to-transparent" />
            <div className="relative mx-auto max-w-7xl px-4 py-20 md:py-32">
              <div className="rise max-w-lg">
                <span className="chip bg-white/80 text-plum">✨ Festive glow sale · up to 55% off</span>
                <h1 className="mt-4 font-display text-5xl leading-[1.05] font-bold text-plum-dark md:text-6xl">
                  Your everyday <em className="text-gold">nikhaar</em>, delivered.
                </h1>
                <p className="mt-4 text-lg text-mute">
                  Lipsticks, serums, kajal and skin care from brands you trust. Pay by UPI,
                  we verify and ship within 24 hours.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <a href="#shop" className="btn-primary px-7 py-3 text-base">
                    Shop now
                  </a>
                  <Link to="/support" className="btn-ghost px-7 py-3 text-base">
                    Talk to us
                  </Link>
                </div>
              </div>
            </div>
          </section>

          <section className="border-y border-line bg-white">
            <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-5 text-sm md:grid-cols-4">
              {[
                [BadgeCheck, '100% genuine brands'],
                [QrCode, 'Simple UPI payment'],
                [ShieldCheck, 'Every payment verified'],
                [Truck, 'Fast home delivery'],
              ].map(([Icon, t]) => {
                const I = Icon as typeof Truck
                return (
                  <div key={t as string} className="flex items-center gap-2 font-medium">
                    <I className="h-5 w-5 text-gold" /> {t as string}
                  </div>
                )
              })}
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-4 pt-14">
            <h2 className="font-display text-3xl font-bold">Shop by category</h2>
            <div className="mt-6 grid grid-cols-3 gap-4 md:grid-cols-6">
              {CATEGORIES.map((c) => (
                <Link key={c} to="/" search={{ cat: c }} className="group text-center">
                  <div className="aspect-square overflow-hidden rounded-full border-4 border-white bg-blush shadow-md shadow-plum/10">
                    <img
                      src={img(CAT_IMG[c], 240)}
                      alt={c}
                      loading="lazy"
                      className="h-full w-full object-cover transition group-hover:scale-110"
                    />
                  </div>
                  <div className="mt-2 text-sm font-semibold">{c}</div>
                </Link>
              ))}
            </div>
          </section>
        </>
      )}

      <section id="shop" className="mx-auto max-w-7xl scroll-mt-32 px-4 pt-14">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 className="font-display text-3xl font-bold">
            {q ? `Results for “${q}”` : cat ? cat : 'Bestsellers'}
          </h2>
          <span className="text-sm text-mute">{filtered.length} products</span>
        </div>
        {filtered.length === 0 ? (
          <div className="card mt-6 p-12 text-center text-mute">
            No products found.{' '}
            <Link to="/" className="font-semibold text-plum underline">
              See all products
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {filtered.map((p, i) => (
              <ProductCard key={p.id} p={p} index={i} />
            ))}
          </div>
        )}
      </section>
    </ShopLayout>
  )
}
