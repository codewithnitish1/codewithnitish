# CodeWithNitish Portfolio + Project Store

## What's added
- Premium Project Store section
- ₹50 lifetime product pricing UI
- Project manager UI to add/delete products
- Live demo buttons
- Locked source-code purchase flow
- Responsive store and purchase modals

## Important
The uploaded website is a static GitHub Pages site. Real paid code delivery cannot be securely implemented with browser-only JavaScript because buyers could bypass it and payment secrets must never be exposed.

For production:
1. Deploy a backend (Node/PHP) on a server/VPS or a service that supports server-side code.
2. Connect Razorpay/another payment gateway server-side.
3. Create an order for ₹50.
4. Verify the payment signature on the server.
5. Record buyer + product + payment ID in a database.
6. Give the buyer a signed/temporary download URL after verified payment.
7. Keep ZIP/source files outside the public GitHub Pages directory.

The current frontend is deliberately safe as a UI prototype and does NOT claim to process real payments.
