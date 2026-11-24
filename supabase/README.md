# Supabase setup (ARHA)

Your Table Editor is empty until this runs once.

## 1. Create the `inquiries` table

1. Open [SQL Editor](https://supabase.com/dashboard/project/_/sql) in this project.
2. New query → paste everything in `inquiries.sql`.
3. Run. You should see **Success**.
4. Table Editor → refresh → `inquiries` appears.

RLS stays on with **no** anon policies. Only the **service role** key (server-side) can insert.

## 2. Copy API keys

**Project Settings → API:**

| Variable | Where |
| --- | --- |
| Project URL | → `SUPABASE_URL` |
| `service_role` (secret) | → `SUPABASE_SERVICE_ROLE_KEY` |

Never put the service role in `VITE_*` or commit it.

## 3. Local / Vercel env

**Vercel → Project → Settings → Environment Variables** (Production + Preview):

```
SUPABASE_URL=https://….supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ…
```

Optional for a custom domain:

```
PUBLIC_BASE_URL=https://your-domain.com
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com
```

Local API testing needs `vercel dev` (or deployed Preview) so `/api/inquiry` and `/api/lead-magnet` run. Plain `npm run dev` only serves the Vite app.

## 4. Smoke check

After deploy:

1. Contact form → submit a real enquiry → row in `inquiries` with `source = website`.
2. Home lead magnet → submit → row with `source = lead_magnet`.
