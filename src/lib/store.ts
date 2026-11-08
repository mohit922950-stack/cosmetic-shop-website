// Browser-side store for milestone 1. Every screen reads and writes through
// `useStore()` + `actions`, so a later milestone can swap these actions for
// server functions backed by Netlify Database without touching the UI much.
import { useSyncExternalStore } from 'react'
import {
  seedOrders,
  seedProducts,
  seedSettings,
  seedStaff,
  seedUsers,
} from '@/data/fixtures'
import type {
  Address,
  Order,
  OrderItem,
  OrderStatus,
  Product,
  StaffMember,
  StoreSettings,
  User,
} from '@/data/fixtures'

export interface CartLine {
  productId: string
  qty: number
}

export interface State {
  ready: boolean
  products: Product[]
  users: User[]
  orders: Order[]
  staff: StaffMember[]
  settings: StoreSettings
  session: { userId?: string; adminId?: string; cart: CartLine[] }
}

const DB_KEY = 'nikhaar-db-v1'
const SESSION_KEY = 'nikhaar-session-v1'

const initial: State = {
  ready: false,
  products: seedProducts,
  users: seedUsers,
  orders: seedOrders,
  staff: seedStaff,
  settings: seedSettings,
  session: { cart: [] },
}

let state: State = initial
const listeners = new Set<() => void>()

function persist() {
  try {
    const { session, ready: _r, ...db } = state
    localStorage.setItem(DB_KEY, JSON.stringify(db))
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  } catch (e) {
    console.warn('Could not save data (storage full?)', e)
  }
}

function set(fn: (s: State) => Partial<State>) {
  state = { ...state, ...fn(state) }
  if (state.ready) persist()
  listeners.forEach((l) => l())
}

export function hydrateStore() {
  if (state.ready) return
  try {
    const db = JSON.parse(localStorage.getItem(DB_KEY) || 'null')
    const session = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null')
    state = {
      ...state,
      ...(db || {}),
      session: session || { cart: [] },
      ready: true,
    }
  } catch {
    state = { ...state, ready: true }
  }
  listeners.forEach((l) => l())
}

const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => {
    listeners.delete(l)
  }
}
const getSnapshot = () => state
const getServerSnapshot = () => initial

export function useStore(): State {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

const now = () => new Date().toISOString()
const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 9)}`
export const cleanPhone = (p: string) => p.replace(/\D/g, '').slice(-10)

type Result<T = void> = { ok: true; value: T } | { ok: false; error: string }
const ok = <T>(value: T): Result<T> => ({ ok: true, value })
const fail = (error: string): Result<never> => ({ ok: false, error })

// ---------- derived helpers ----------
export const currentUser = (s: State) =>
  s.users.find((u) => u.id === s.session.userId)
export const currentAdmin = (s: State) =>
  s.staff.find((m) => m.id === s.session.adminId && m.active)
export const productById = (s: State, id: string) =>
  s.products.find((p) => p.id === id)
export const cartCount = (s: State) =>
  s.session.cart.reduce((n, l) => n + l.qty, 0)

export const STATUS_LABEL: Record<OrderStatus, string> = {
  payment_review: 'Payment under review',
  confirmed: 'Confirmed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

function setSession(patch: Partial<State['session']>) {
  set((s) => ({ session: { ...s.session, ...patch } }))
}

function updateUser(id: string, patch: Partial<User>) {
  set((s) => ({
    users: s.users.map((u) => (u.id === id ? { ...u, ...patch } : u)),
  }))
}

function updateOrder(id: string, fn: (o: Order) => Order) {
  set((s) => ({ orders: s.orders.map((o) => (o.id === id ? fn(o) : o)) }))
}

function restock(order: Order) {
  set((s) => ({
    products: s.products.map((p) => {
      const line = order.items.find((i) => i.productId === p.id)
      return line ? { ...p, stock: p.stock + line.qty } : p
    }),
  }))
}

export const actions = {
  // ---------- customer auth ----------
  signup(input: { name: string; phone: string; password: string }): Result<User> {
    const phone = cleanPhone(input.phone)
    if (input.name.trim().length < 2) return fail('Please enter your name')
    if (phone.length !== 10) return fail('Enter a valid 10-digit mobile number')
    if (input.password.length < 6) return fail('Password must be at least 6 characters')
    if (state.users.some((u) => u.phone === phone))
      return fail('An account with this number already exists. Please log in.')
    const user: User = {
      id: uid('u'),
      name: input.name.trim(),
      phone,
      password: input.password,
      blocked: false,
      createdAt: now(),
      addresses: [],
    }
    set((s) => ({ users: [user, ...s.users] }))
    setSession({ userId: user.id })
    return ok(user)
  },
  login(phoneRaw: string, password: string): Result<User> {
    const phone = cleanPhone(phoneRaw)
    const user = state.users.find((u) => u.phone === phone)
    if (!user || user.password !== password)
      return fail('Wrong mobile number or password')
    if (user.blocked)
      return fail('Your account has been blocked. Please contact customer care on WhatsApp.')
    setSession({ userId: user.id })
    return ok(user)
  },
  logout() {
    setSession({ userId: undefined })
  },
  updateProfile(patch: { name: string; email?: string }) {
    if (state.session.userId) updateUser(state.session.userId, patch)
  },
  changeOwnPassword(oldPw: string, newPw: string): Result {
    const u = currentUser(state)
    if (!u) return fail('Please log in')
    if (u.password !== oldPw) return fail('Current password is wrong')
    if (newPw.length < 6) return fail('New password must be at least 6 characters')
    updateUser(u.id, { password: newPw })
    return ok(undefined)
  },
  saveAddress(address: Address, index?: number) {
    const u = currentUser(state)
    if (!u) return
    const addresses = [...u.addresses]
    if (index === undefined) addresses.unshift(address)
    else addresses[index] = address
    updateUser(u.id, { addresses })
  },
  removeAddress(index: number) {
    const u = currentUser(state)
    if (!u) return
    updateUser(u.id, { addresses: u.addresses.filter((_, i) => i !== index) })
  },

  // ---------- cart ----------
  addToCart(productId: string, qty = 1) {
    const p = productById(state, productId)
    if (!p) return
    const cart = [...state.session.cart]
    const line = cart.find((l) => l.productId === productId)
    if (line) line.qty = Math.min(p.stock, line.qty + qty)
    else cart.push({ productId, qty: Math.min(p.stock, qty) })
    setSession({ cart: cart.map((l) => ({ ...l })) })
  },
  setQty(productId: string, qty: number) {
    setSession({
      cart: state.session.cart
        .map((l) => (l.productId === productId ? { ...l, qty } : l))
        .filter((l) => l.qty > 0),
    })
  },
  clearCart() {
    setSession({ cart: [] })
  },

  // ---------- orders ----------
  isUtrUsed(utr: string) {
    return state.orders.some((o) => o.utr === utr.trim())
  },
  placeOrder(input: {
    lines: CartLine[]
    address: Address
    utr: string
    screenshot: string
  }): Result<Order> {
    const u = currentUser(state)
    if (!u) return fail('Please log in to place an order')
    if (u.blocked) return fail('Your account is blocked. Contact customer care.')
    const utr = input.utr.trim()
    if (!/^\d{12}$/.test(utr)) return fail('UTR / UPI reference number must be 12 digits')
    if (actions.isUtrUsed(utr))
      return fail('This UTR has already been used. Each payment can be used for one order only.')
    if (!input.screenshot) return fail('Please upload the payment screenshot')
    const items: OrderItem[] = []
    for (const l of input.lines) {
      const p = productById(state, l.productId)
      if (!p) continue
      if (p.stock < l.qty) return fail(`Only ${p.stock} left of ${p.name}`)
      items.push({
        productId: p.id,
        name: p.name,
        brand: p.brand,
        image: p.images[0],
        price: p.price,
        qty: l.qty,
      })
    }
    if (!items.length) return fail('Your cart is empty')
    const order: Order = {
      id: `NK${10242 + state.orders.length + Math.floor(Math.random() * 50)}`,
      userId: u.id,
      items,
      total: items.reduce((t, i) => t + i.price * i.qty, 0),
      address: input.address,
      utr,
      screenshot: input.screenshot,
      status: 'payment_review',
      createdAt: now(),
      events: [{ label: 'Order placed – UTR submitted', at: now() }],
    }
    set((s) => ({
      orders: [order, ...s.orders],
      products: s.products.map((p) => {
        const line = items.find((i) => i.productId === p.id)
        return line ? { ...p, stock: p.stock - line.qty } : p
      }),
    }))
    return ok(order)
  },
  cancelByCustomer(orderId: string, reason: string): Result {
    const o = state.orders.find((x) => x.id === orderId)
    if (!o || o.userId !== state.session.userId) return fail('Order not found')
    if (o.status === 'shipped' || o.status === 'delivered' || o.status === 'cancelled')
      return fail('This order can no longer be cancelled')
    updateOrder(orderId, (x) => ({
      ...x,
      status: 'cancelled',
      cancelReason: reason,
      cancelledBy: 'customer',
      events: [...x.events, { label: 'Cancelled by customer', at: now(), note: reason }],
    }))
    restock(o)
    return ok(undefined)
  },

  // ---------- admin ----------
  adminLogin(username: string, password: string): Result<StaffMember> {
    const m = state.staff.find(
      (x) => x.username.toLowerCase() === username.trim().toLowerCase(),
    )
    if (!m || m.password !== password) return fail('Wrong username or password')
    if (!m.active) return fail('This staff account is disabled')
    setSession({ adminId: m.id })
    return ok(m)
  },
  adminLogout() {
    setSession({ adminId: undefined })
  },
  approvePayment(orderId: string) {
    const by = currentAdmin(state)?.name
    updateOrder(orderId, (o) => ({
      ...o,
      status: 'confirmed',
      events: [...o.events, { label: 'Payment approved', at: now(), by }],
    }))
  },
  advanceOrder(orderId: string, status: 'shipped' | 'delivered') {
    const by = currentAdmin(state)?.name
    updateOrder(orderId, (o) => ({
      ...o,
      status,
      events: [...o.events, { label: STATUS_LABEL[status], at: now(), by }],
    }))
  },
  cancelByAdmin(orderId: string, reason: string) {
    const o = state.orders.find((x) => x.id === orderId)
    if (!o || o.status === 'cancelled') return
    const by = currentAdmin(state)?.name
    updateOrder(orderId, (x) => ({
      ...x,
      status: 'cancelled',
      cancelReason: reason,
      cancelledBy: 'admin',
      events: [...x.events, { label: 'Cancelled by store', at: now(), by, note: reason }],
    }))
    restock(o)
  },
  saveProduct(p: Product) {
    set((s) => {
      const exists = s.products.some((x) => x.id === p.id)
      return {
        products: exists
          ? s.products.map((x) => (x.id === p.id ? p : x))
          : [p, ...s.products],
      }
    })
  },
  deleteProduct(id: string) {
    set((s) => ({ products: s.products.filter((p) => p.id !== id) }))
  },
  setStock(id: string, stock: number) {
    set((s) => ({
      products: s.products.map((p) => (p.id === id ? { ...p, stock: Math.max(0, stock) } : p)),
    }))
  },
  setBlocked(userId: string, blocked: boolean, reason?: string) {
    updateUser(userId, { blocked, blockedReason: blocked ? reason : undefined })
    if (blocked && state.session.userId === userId) setSession({ userId: undefined })
  },
  setUserPassword(userId: string, pw: string): Result {
    if (pw.length < 6) return fail('Password must be at least 6 characters')
    updateUser(userId, { password: pw })
    return ok(undefined)
  },
  addStaff(input: { name: string; username: string; password: string }): Result {
    if (!input.name.trim() || !input.username.trim()) return fail('Name and username are required')
    if (input.password.length < 6) return fail('Password must be at least 6 characters')
    if (state.staff.some((m) => m.username.toLowerCase() === input.username.trim().toLowerCase()))
      return fail('Username already taken')
    const m: StaffMember = {
      id: uid('s'),
      name: input.name.trim(),
      username: input.username.trim(),
      password: input.password,
      role: 'staff',
      active: true,
      createdAt: now(),
    }
    set((s) => ({ staff: [...s.staff, m] }))
    return ok(undefined)
  },
  updateStaff(id: string, patch: Partial<StaffMember>) {
    set((s) => ({ staff: s.staff.map((m) => (m.id === id ? { ...m, ...patch } : m)) }))
  },
  removeStaff(id: string) {
    set((s) => ({ staff: s.staff.filter((m) => m.id !== id || m.role === 'owner') }))
  },
  changeAdminPassword(oldPw: string, newPw: string): Result {
    const m = currentAdmin(state)
    if (!m) return fail('Please log in')
    if (m.password !== oldPw) return fail('Current password is wrong')
    if (newPw.length < 6) return fail('New password must be at least 6 characters')
    actions.updateStaff(m.id, { password: newPw })
    return ok(undefined)
  },
  updateSettings(patch: Partial<StoreSettings>) {
    set((s) => ({ settings: { ...s.settings, ...patch } }))
  },
  resetDemo() {
    localStorage.removeItem(DB_KEY)
    localStorage.removeItem(SESSION_KEY)
    location.reload()
  },
}
