# CodeWithNitish Project Store v2

Includes buyer/admin authentication, ₹50 lifetime purchases, Razorpay order + signature verification, payment history, protected ZIP downloads, and an admin upload endpoint.

## Run
1. Install Node.js 20+.
2. `cd backend`
3. `npm install`
4. Copy `.env.example` to `.env` and set values.
5. `npm start`
6. Open `http://localhost:3000`.

## Production
- Use HTTPS.
- Use a strong random `JWT_SECRET`.
- Keep Razorpay secrets only in environment variables.
- Put uploaded ZIP files on private server storage; do not commit `backend/uploads` to GitHub.
- Configure Razorpay webhook to `/api/webhooks/razorpay` and use the same webhook secret.
- Replace the JSON data store with PostgreSQL/MySQL for high-volume production use.

The included frontend is the original portfolio and is being upgraded to call the API. The backend is intentionally fail-closed when Razorpay credentials are missing.
