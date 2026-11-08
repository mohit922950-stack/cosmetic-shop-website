// All stubbed data for Nikhaar lives in this one file.
// A later milestone replaces it with Netlify Database tables (see PLAN.md).

export const CATEGORIES = [
  'Lips',
  'Face',
  'Skin Care',
  'Eyes',
  'Sun Care',
  'Nails',
] as const
export type Category = (typeof CATEGORIES)[number]

export interface Spec {
  label: string
  value: string
}

export interface Product {
  id: string
  name: string
  brand: string
  category: Category
  price: number
  mrp: number
  stock: number
  images: string[]
  shortDescription: string
  description: string
  highlights: string[]
  specs: Spec[]
  rating: number
  ratingCount: number
  active: boolean
  createdAt: string
}

export interface Address {
  name: string
  phone: string
  line1: string
  line2?: string
  landmark?: string
  city: string
  state: string
  pincode: string
}

export interface User {
  id: string
  name: string
  phone: string
  email?: string
  password: string
  blocked: boolean
  blockedReason?: string
  createdAt: string
  addresses: Address[]
}

export type OrderStatus =
  | 'payment_review'
  | 'confirmed'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export interface OrderEvent {
  label: string
  at: string
  note?: string
  by?: string
}

export interface OrderItem {
  productId: string
  name: string
  brand: string
  image: string
  price: number
  qty: number
}

export interface Order {
  id: string
  userId: string
  items: OrderItem[]
  total: number
  address: Address
  utr: string
  screenshot: string
  status: OrderStatus
  events: OrderEvent[]
  cancelReason?: string
  cancelledBy?: 'customer' | 'admin'
  createdAt: string
}

export interface StaffMember {
  id: string
  name: string
  username: string
  password: string
  role: 'owner' | 'staff'
  active: boolean
  createdAt: string
}

export interface StoreSettings {
  storeName: string
  whatsapp: string
  upiId: string
  payeeName: string
  qrImage: string // empty = auto-generate QR from UPI ID
}

const gallery = (main: string) => [
  `/img/${main}.png`,
  '/img/swatch.png',
  '/img/apply.png',
  '/img/flatlay.png',
  '/img/packaging.png',
]

const ago = (days: number, hours = 0) =>
  new Date(Date.now() - days * 864e5 - hours * 36e5).toISOString()

export const seedProducts: Product[] = [
  {
    id: 'p-lipstick',
    name: 'Velvet Matte Lipstick – Ruby Rani',
    brand: 'Lumiere Lab',
    category: 'Lips',
    price: 449,
    mrp: 799,
    stock: 42,
    images: gallery('lipstick'),
    shortDescription: 'Long-wear velvet matte red with a rose-gold bullet.',
    description:
      'A one-swipe, full-coverage matte lipstick that stays comfortable for up to 12 hours. Enriched with jojoba oil and vitamin E so lips never feel dry or cakey.',
    highlights: [
      '12-hour long wear, transfer resistant',
      'Enriched with jojoba oil & vitamin E',
      'Paraben free, cruelty free',
      'Shade: Ruby Rani (classic red)',
    ],
    specs: [
      { label: 'Brand', value: 'Lumiere Lab' },
      { label: 'Finish', value: 'Velvet matte' },
      { label: 'Net quantity', value: '4.2 g' },
      { label: 'Skin type', value: 'All' },
      { label: 'Country of origin', value: 'India' },
      { label: 'Shelf life', value: '36 months' },
    ],
    rating: 4.4,
    ratingCount: 2381,
    active: true,
    createdAt: ago(60),
  },
  {
    id: 'p-serum',
    name: 'Vitamin C 15% Brightening Face Serum',
    brand: 'Dewdrop Botanics',
    category: 'Skin Care',
    price: 599,
    mrp: 999,
    stock: 18,
    images: gallery('serum'),
    shortDescription: 'Fades dark spots and boosts glow in 4 weeks.',
    description:
      'Stabilised 15% vitamin C with ferulic acid and hyaluronic acid. Lightweight, fast-absorbing and suitable for daily morning use under sunscreen.',
    highlights: [
      '15% ethyl ascorbic acid + ferulic acid',
      'Reduces dark spots & dullness',
      'Non-sticky, fragrance free',
      'Dermatologically tested',
    ],
    specs: [
      { label: 'Brand', value: 'Dewdrop Botanics' },
      { label: 'Net quantity', value: '30 ml' },
      { label: 'Skin type', value: 'Oily, Combination, Normal' },
      { label: 'Key ingredient', value: 'Vitamin C' },
      { label: 'Country of origin', value: 'India' },
    ],
    rating: 4.3,
    ratingCount: 5120,
    active: true,
    createdAt: ago(45),
  },
  {
    id: 'p-moist',
    name: 'Hydra Gel Daily Moisturizer',
    brand: 'Dewdrop Botanics',
    category: 'Skin Care',
    price: 349,
    mrp: 525,
    stock: 64,
    images: gallery('moisturizer'),
    shortDescription: 'Oil-free gel cream with 72-hour hydration.',
    description:
      'A cooling water-gel moisturizer with hyaluronic acid and aloe vera that keeps skin plump without any greasy feel. Perfect for Indian summers.',
    highlights: [
      '72-hour hydration',
      'Hyaluronic acid + aloe vera',
      'Oil free, non-comedogenic',
    ],
    specs: [
      { label: 'Brand', value: 'Dewdrop Botanics' },
      { label: 'Net quantity', value: '50 g' },
      { label: 'Skin type', value: 'All' },
      { label: 'Country of origin', value: 'India' },
    ],
    rating: 4.5,
    ratingCount: 1904,
    active: true,
    createdAt: ago(40),
  },
  {
    id: 'p-kajal',
    name: 'Smudge-Proof Kohl Kajal (Pack of 3)',
    brand: 'Kohinoor Eyes',
    category: 'Eyes',
    price: 249,
    mrp: 450,
    stock: 4,
    images: gallery('kajal'),
    shortDescription: 'Intense black, waterproof, 24-hour stay.',
    description:
      'Deep black twist-up kajal with camphor and almond oil. Glides on in a single stroke and stays smudge-free all day.',
    highlights: [
      'Waterproof & smudge-proof',
      'With camphor & almond oil',
      'Ophthalmologically tested',
    ],
    specs: [
      { label: 'Brand', value: 'Kohinoor Eyes' },
      { label: 'Net quantity', value: '3 × 0.35 g' },
      { label: 'Colour', value: 'Jet black' },
      { label: 'Country of origin', value: 'India' },
    ],
    rating: 4.2,
    ratingCount: 8732,
    active: true,
    createdAt: ago(30),
  },
  {
    id: 'p-foundation',
    name: 'Skin Fit Liquid Foundation – Warm Beige',
    brand: 'Lumiere Lab',
    category: 'Face',
    price: 699,
    mrp: 1199,
    stock: 23,
    images: gallery('foundation'),
    shortDescription: 'Medium coverage, natural finish with SPF 20.',
    description:
      'A breathable, buildable liquid foundation that blends into Indian skin tones seamlessly. Controls shine for up to 10 hours.',
    highlights: [
      'Medium buildable coverage',
      'SPF 20 PA++',
      'Shade: Warm Beige (for wheatish skin)',
    ],
    specs: [
      { label: 'Brand', value: 'Lumiere Lab' },
      { label: 'Net quantity', value: '30 ml' },
      { label: 'Finish', value: 'Natural' },
      { label: 'Country of origin', value: 'India' },
    ],
    rating: 4.1,
    ratingCount: 1210,
    active: true,
    createdAt: ago(20),
  },
  {
    id: 'p-sunscreen',
    name: 'Aqua Shield Sunscreen SPF 50 PA++++',
    brand: 'SunVeda',
    category: 'Sun Care',
    price: 399,
    mrp: 599,
    stock: 0,
    images: gallery('sunscreen'),
    shortDescription: 'No white cast, lightweight daily sunscreen.',
    description:
      'Broad-spectrum protection with a watery texture that leaves no white cast. Safe for sensitive skin and works great under makeup.',
    highlights: ['SPF 50 PA++++', 'No white cast', 'Sweat resistant'],
    specs: [
      { label: 'Brand', value: 'SunVeda' },
      { label: 'Net quantity', value: '50 g' },
      { label: 'Skin type', value: 'All, Sensitive' },
      { label: 'Country of origin', value: 'India' },
    ],
    rating: 4.6,
    ratingCount: 3401,
    active: true,
    createdAt: ago(15),
  },
  {
    id: 'p-toner',
    name: 'Pure Rose Water Toner Mist',
    brand: 'Gulab Ghar',
    category: 'Skin Care',
    price: 199,
    mrp: 299,
    stock: 80,
    images: gallery('toner'),
    shortDescription: 'Steam-distilled Kannauj rose water.',
    description:
      '100% natural, steam-distilled rose water from Kannauj. Tones, refreshes and sets makeup with a fine mist.',
    highlights: ['100% natural', 'Alcohol free', 'Fine mist spray'],
    specs: [
      { label: 'Brand', value: 'Gulab Ghar' },
      { label: 'Net quantity', value: '100 ml' },
      { label: 'Country of origin', value: 'India' },
    ],
    rating: 4.4,
    ratingCount: 6540,
    active: true,
    createdAt: ago(10),
  },
  {
    id: 'p-nails',
    name: 'Gel Shine Nail Paint Set (5 Shades)',
    brand: 'Polish Pop',
    category: 'Nails',
    price: 299,
    mrp: 650,
    stock: 31,
    images: gallery('nailpolish'),
    shortDescription: 'Chip-resistant gel finish without UV lamp.',
    description:
      'Five everyday shades — nude, pink, coral, red and plum — with a glossy gel finish that lasts up to 7 days. Quick dry in 60 seconds.',
    highlights: ['5 shades × 6 ml', 'Quick dry', 'No UV lamp needed'],
    specs: [
      { label: 'Brand', value: 'Polish Pop' },
      { label: 'Net quantity', value: '5 × 6 ml' },
      { label: 'Finish', value: 'Glossy gel' },
      { label: 'Country of origin', value: 'India' },
    ],
    rating: 4.0,
    ratingCount: 980,
    active: true,
    createdAt: ago(5),
  },
]

const addr = (
  name: string,
  phone: string,
  line1: string,
  city: string,
  state: string,
  pincode: string,
): Address => ({ name, phone, line1, city, state, pincode })

export const seedUsers: User[] = [
  {
    id: 'u-1',
    name: 'Priya Sharma',
    phone: '9876543210',
    email: 'priya@example.com',
    password: 'priya123',
    blocked: false,
    createdAt: ago(50),
    addresses: [
      addr('Priya Sharma', '9876543210', 'B-12, Lajpat Nagar II', 'New Delhi', 'Delhi', '110024'),
    ],
  },
  {
    id: 'u-2',
    name: 'Anjali Verma',
    phone: '9123456780',
    password: 'anjali123',
    blocked: false,
    createdAt: ago(35),
    addresses: [
      addr('Anjali Verma', '9123456780', '45, Civil Lines, Near Gandhi Park', 'Jaipur', 'Rajasthan', '302006'),
    ],
  },
  {
    id: 'u-3',
    name: 'Rohit Kumar',
    phone: '9988776655',
    password: 'rohit123',
    blocked: true,
    blockedReason: 'Fake UTR submitted twice',
    createdAt: ago(25),
    addresses: [
      addr('Rohit Kumar', '9988776655', 'House 7, Boring Road', 'Patna', 'Bihar', '800001'),
    ],
  },
  {
    id: 'u-4',
    name: 'Sneha Patil',
    phone: '9012345678',
    password: 'sneha123',
    blocked: false,
    createdAt: ago(12),
    addresses: [
      addr('Sneha Patil', '9012345678', 'Flat 302, Shanti Heights, Kothrud', 'Pune', 'Maharashtra', '411038'),
    ],
  },
]

const item = (p: Product, qty: number): OrderItem => ({
  productId: p.id,
  name: p.name,
  brand: p.brand,
  image: p.images[0],
  price: p.price,
  qty,
})
const P = Object.fromEntries(seedProducts.map((p) => [p.id, p]))

export const seedOrders: Order[] = [
  {
    id: 'NK10241',
    userId: 'u-1',
    items: [item(P['p-lipstick'], 1), item(P['p-toner'], 2)],
    total: 449 + 398,
    address: seedUsers[0].addresses[0],
    utr: '412345678901',
    screenshot: '',
    status: 'payment_review',
    createdAt: ago(0, 2),
    events: [{ label: 'Order placed – UTR submitted', at: ago(0, 2) }],
  },
  {
    id: 'NK10238',
    userId: 'u-2',
    items: [item(P['p-serum'], 1)],
    total: 599,
    address: seedUsers[1].addresses[0],
    utr: '409876543210',
    screenshot: '',
    status: 'confirmed',
    createdAt: ago(1, 5),
    events: [
      { label: 'Order placed – UTR submitted', at: ago(1, 5) },
      { label: 'Payment approved', at: ago(1, 3), by: 'Owner' },
    ],
  },
  {
    id: 'NK10230',
    userId: 'u-1',
    items: [item(P['p-kajal'], 1), item(P['p-moist'], 1)],
    total: 598,
    address: seedUsers[0].addresses[0],
    utr: '407712340099',
    screenshot: '',
    status: 'delivered',
    createdAt: ago(9),
    events: [
      { label: 'Order placed – UTR submitted', at: ago(9) },
      { label: 'Payment approved', at: ago(9, -1), by: 'Owner' },
      { label: 'Shipped', at: ago(8), by: 'Owner' },
      { label: 'Delivered', at: ago(6), by: 'Owner' },
    ],
  },
  {
    id: 'NK10227',
    userId: 'u-3',
    items: [item(P['p-foundation'], 2)],
    total: 1398,
    address: seedUsers[2].addresses[0],
    utr: '400000000001',
    screenshot: '',
    status: 'cancelled',
    cancelReason: 'Payment not received – UTR not found in bank statement',
    cancelledBy: 'admin',
    createdAt: ago(11),
    events: [
      { label: 'Order placed – UTR submitted', at: ago(11) },
      {
        label: 'Cancelled by store',
        at: ago(10, 20),
        by: 'Owner',
        note: 'Payment not received – UTR not found in bank statement',
      },
    ],
  },
  {
    id: 'NK10225',
    userId: 'u-4',
    items: [item(P['p-nails'], 1)],
    total: 299,
    address: seedUsers[3].addresses[0],
    utr: '405566778899',
    screenshot: '',
    status: 'shipped',
    createdAt: ago(3),
    events: [
      { label: 'Order placed – UTR submitted', at: ago(3) },
      { label: 'Payment approved', at: ago(3, -2), by: 'Owner' },
      { label: 'Shipped', at: ago(2), by: 'Owner' },
    ],
  },
  {
    id: 'NK10219',
    userId: 'u-1',
    items: [item(P['p-sunscreen'], 1)],
    total: 399,
    address: seedUsers[0].addresses[0],
    utr: '401122334455',
    screenshot: '',
    status: 'cancelled',
    cancelReason: 'Ordered by mistake',
    cancelledBy: 'customer',
    createdAt: ago(14),
    events: [
      { label: 'Order placed – UTR submitted', at: ago(14) },
      {
        label: 'Cancelled by customer',
        at: ago(14, -1),
        note: 'Ordered by mistake',
      },
    ],
  },
]

export const seedStaff: StaffMember[] = [
  {
    id: 's-owner',
    name: 'Owner',
    username: 'admin',
    password: 'admin123',
    role: 'owner',
    active: true,
    createdAt: ago(90),
  },
  {
    id: 's-2',
    name: 'Meena',
    username: 'meena',
    password: 'meena123',
    role: 'staff',
    active: true,
    createdAt: ago(20),
  },
]

export const seedSettings: StoreSettings = {
  storeName: 'Nikhaar',
  whatsapp: '919876500000',
  upiId: 'nikhaar@upi',
  payeeName: 'Nikhaar Cosmetics',
  qrImage: '',
}
