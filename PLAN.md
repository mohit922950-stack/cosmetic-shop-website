# Nikhaar – product roadmap

Nikhaar is an online cosmetics shop. Customers pay by UPI, submit the UTR and a screenshot, and the owner approves the payment before the order goes out. A separate admin panel lets the owner and staff run the shop.

## Milestone 1 – Product surface (done)
Every screen is built and clickable. It runs on sample data saved in the browser (`src/data/fixtures.ts` + `src/lib/store.ts`).
- Storefront: home, category/search, product page with a 5-photo gallery, brand, highlights and specs, cart, UPI checkout with a UTR + screenshot step, and order confirmation.
- Customer account: orders (all/active/delivered/cancelled with reasons, tracking timeline, tap item → product page), cancel with reason, profile, saved addresses, change password. Login/signup with a WhatsApp customer-care button, plus a customer care page.
- Admin at `/nikhaar-admin`: dashboard, orders (approve payment, ship, deliver, cancel with reason), products & stock (price/MRP, 5 photo uploads, brand/company, specs, show/hide), customers (search by phone, full timeline, block/unblock, reset password, WhatsApp/call), staff (owner-only), settings (admin password, UPI ID, QR upload, WhatsApp number).

## Milestone 2 – Real database
- Netlify Database tables: products, product_images, customers, addresses, orders, order_items, order_events, staff, settings.
- A unique index on `orders.utr` so the same UTR can never be used twice, enforced on the server.
- Replace the browser store actions with TanStack server functions. Keep the `actions.*` names so the UI barely changes.

## Milestone 3 – Secure accounts & sessions
- Hash passwords (customers + staff) and use signed, HTTP-only session cookies.
- Check roles on the server for every admin action (owner vs staff). Blocked customers are refused on the server.
- Rate-limit login attempts on the admin URL.

## Milestone 4 – File uploads
- Store product photos, payment screenshots and the QR image in Netlify Blobs, served through the Image CDN.
- Limit image size and type on upload.

## Milestone 5 – Operations polish
- Notifications for new orders waiting for approval (e.g. a WhatsApp click-to-chat summary or email).
- Order invoice/packing slip print view, CSV export of orders and customers.
- Stock history (who changed stock and when), plus low-stock alerts.

## Milestone 6 – Growth (optional)
- Product reviews & ratings from real customers, wishlist, coupons, more payment options.
