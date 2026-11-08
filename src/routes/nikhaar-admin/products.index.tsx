import { useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { Eye, EyeOff, Minus, Pencil, Plus, Search } from 'lucide-react'
import { actions } from '@/lib/store'
import { img, inr } from '@/lib/format'
import { PageTitle, useAdmin } from '@/components/admin'

export const Route = createFileRoute('/nikhaar-admin/products/')({ component: ProductsAdmin })

function ProductsAdmin() {
  const { s } = useAdmin()
  const [q, setQ] = useState('')
  const term = q.toLowerCase()
  const list = s.products.filter((p) => `${p.name} ${p.brand} ${p.category}`.toLowerCase().includes(term))
  const units = s.products.reduce((t, p) => t + p.stock, 0)

  return (
    <div>
      <PageTitle title="Products & stock" sub={`${s.products.length} products · ${units} units in stock`}>
        <div className="flex w-full gap-2 sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-mute" />
            <input className="input pl-9" placeholder="Search products" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <Link to="/nikhaar-admin/products/$productId" params={{ productId: 'new' }} className="btn-primary shrink-0"><Plus className="h-4 w-4" /> Add product</Link>
        </div>
      </PageTitle>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="border-b border-line text-left text-xs tracking-wide text-mute uppercase">
            <tr><th className="p-4">Product</th><th className="p-4">Price / MRP</th><th className="p-4">Stock</th><th className="p-4">Visible</th><th className="p-4"></th></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {list.map((p) => (
              <tr key={p.id} className={p.active ? '' : 'opacity-60'}>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img src={img(p.images[0] ?? '/img/packaging.png', 96)} alt="" className="h-12 w-12 rounded-lg object-cover" />
                    <div className="min-w-0"><div className="line-clamp-1 font-medium">{p.name}</div><div className="text-xs text-mute">{p.brand} · {p.category} · {p.images.length} photos</div></div>
                  </div>
                </td>
                <td className="p-4"><div className="font-semibold">{inr(p.price)}</div><div className="text-xs text-mute line-through">{inr(p.mrp)}</div></td>
                <td className="p-4">
                  <div className="flex items-center gap-1">
                    <button className="rounded-lg border border-line p-1 hover:bg-blush" onClick={() => actions.setStock(p.id, p.stock - 1)} aria-label="Decrease stock"><Minus className="h-3.5 w-3.5" /></button>
                    <input className="w-16 rounded-lg border border-line px-2 py-1 text-center" type="number" min={0} value={p.stock} onChange={(e) => actions.setStock(p.id, Number(e.target.value))} />
                    <button className="rounded-lg border border-line p-1 hover:bg-blush" onClick={() => actions.setStock(p.id, p.stock + 1)} aria-label="Increase stock"><Plus className="h-3.5 w-3.5" /></button>
                  </div>
                  {p.stock === 0 ? <div className="mt-1 text-xs font-semibold text-red-600">Out of stock</div> : p.stock <= 5 ? <div className="mt-1 text-xs font-semibold text-amber-700">Low stock</div> : null}
                </td>
                <td className="p-4">
                  <button onClick={() => actions.saveProduct({ ...p, active: !p.active })} className="flex items-center gap-1 text-xs font-semibold">
                    {p.active ? <><Eye className="h-4 w-4 text-leaf" /> Live</> : <><EyeOff className="h-4 w-4" /> Hidden</>}
                  </button>
                </td>
                <td className="p-4 text-right"><Link to="/nikhaar-admin/products/$productId" params={{ productId: p.id }} className="btn-ghost py-1.5"><Pencil className="h-3.5 w-3.5" /> Edit</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
