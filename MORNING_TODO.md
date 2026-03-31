# Morning checklist

## 1. Supabase SQL (2 min)
Run in Supabase SQL Editor:

```sql
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS stripe_account_id text;

ALTER TABLE public.quotes
  ADD COLUMN IF NOT EXISTS stripe_checkout_session_id text;
```

## 2. Add env vars to Vercel (after deploy)
Add these in Vercel → Project → Settings → Environment Variables:

```
STRIPE_SECRET_KEY=sk_live_...         (or sk_test_... for testing)
STRIPE_CLIENT_ID=ca_...               (Stripe Dashboard → Connect → Settings)
STRIPE_WEBHOOK_SECRET=whsec_...       (after setting up webhook below)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

Also copy all existing .env.local vars (SUPABASE, ANTHROPIC, TWILIO).

## 3. Deploy to Vercel (5 min)
Run in terminal:
```bash
cd ~/Desktop/SnapQuote
npx vercel --prod
```
Follow the prompts to link your account.

## 4. Stripe webhook (2 min)
In Stripe Dashboard → Developers → Webhooks:
- Add endpoint: `https://your-app.vercel.app/api/stripe/webhook`
- Events: `checkout.session.completed`
- Copy the signing secret → add as `STRIPE_WEBHOOK_SECRET`

## 5. Stripe Connect settings (2 min)
In Stripe Dashboard → Settings → Connect:
- Enable Connect
- Add redirect URI: `https://your-app.vercel.app/api/stripe/callback`
- Copy the `ca_...` client ID → add as `STRIPE_CLIENT_ID`

---
That's it. Full online deposit collection will be live.
