export const inr = (n: number) => '₹' + n.toLocaleString('en-IN')

export const discount = (price: number, mrp: number) =>
  mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0

export const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

/** Serve bundled images through Netlify Image CDN; uploaded (data URL) images as-is. */
export const img = (src: string, w: number) =>
  src.startsWith('/')
    ? `/.netlify/images?url=${encodeURIComponent(src)}&w=${w}&fm=webp`
    : src

export const waLink = (number: string, text?: string) =>
  `https://wa.me/${number.replace(/\D/g, '')}${text ? `?text=${encodeURIComponent(text)}` : ''}`
