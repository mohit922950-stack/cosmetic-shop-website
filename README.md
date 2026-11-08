# Nikhaar – Online Cosmetics Shop

An online cosmetics and skin care store. Customers pay by UPI and submit their UTR number and a payment screenshot. The owner approves each payment from a separate admin panel before the order is shipped.

## What's inside
- **Storefront** – home, categories, search, a product page with a 5-photo gallery and full details, cart and UPI checkout (QR, 12-digit UTR, screenshot; a UTR can only be used once).
- **Customer account** – order history with status, tracking timeline and cancel reasons, cancel with reason, addresses, profile, change password, and WhatsApp customer care.
- **Admin panel** at `/nikhaar-admin` (not linked from the shop) – dashboard, payment approval, order status, products & stock with photo uploads, customer search by phone with full activity, block/unblock, password reset, staff accounts (limited access), and settings for the QR, UPI ID, WhatsApp number and admin password.

Sample logins: customer `9876543210` / `priya123`, owner `admin` / `admin123`, staff `meena` / `meena123`.

## Tech
TanStack Start (React 19, file routes), Tailwind CSS v4, lucide-react icons, `qrcode` for UPI QR codes, Netlify Image CDN for product images. Deployed on Netlify.

## Run locally
```bash
pnpm install
netlify dev   # or: pnpm dev
```

## Current stage and roadmap
For now all data (products, orders, customers, uploads) is kept in the visitor's browser, so every screen works as a full walkthrough. Next comes a real Netlify Database so customer orders reach the admin from any device. After that: secure password hashing and sessions, photo storage in Netlify Blobs, and notifications. See [PLAN.md](PLAN.md).
