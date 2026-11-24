# ARHA

Marketing site for **ARHA** (Arha Ventures) — construction and interiors studio based in Bengaluru.

Built with React, Vite, TypeScript, Tailwind, GSAP, and React Three Fiber. Enquiry and lead-magnet submissions go through Vercel serverless functions into a Supabase `inquiries` table (no email delivery yet).

## Stack

- **Frontend:** React 19, Vite, React Router, Tailwind CSS 4
- **Motion / 3D:** GSAP, Framer Motion, Three.js / R3F
- **APIs:** Vercel serverless (`/api/inquiry`, `/api/lead-magnet`)
- **Data:** Supabase (service role on the server only)

## Scripts

```bash
npm install
npm run dev        # Vite app (UI only — /api needs Vercel)
npm run build
npm run preview
npm run test
npm run typecheck
npm run lint
```

For local API testing, use `vercel dev` (or a deployed Preview) so `/api/inquiry` and `/api/lead-magnet` run. Plain `npm run dev` serves the SPA only.

## Environment

Copy `.env.example` → `.env` for local work. Never put Supabase secrets under `VITE_*`.

| Variable | Where | Notes |
| --- | --- | --- |
| `SUPABASE_URL` | Server (Vercel + local `.env`) | Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Never commit; never expose to the client |
| `VITE_INQUIRY_ENDPOINT` | Optional client | Defaults to `/api/inquiry` |
| `VITE_LEAD_MAGNET_ENDPOINT` | Optional client | Defaults to `/api/lead-magnet` |
| `PUBLIC_BASE_URL` / `ALLOWED_ORIGINS` | Optional server | Extra CORS allowlist for production domains |

On Vercel, set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` for Production and Preview.

## Enquiry flow

1. Contact form → `POST /api/inquiry` → row with `source = website`
2. Lead magnet → `POST /api/lead-magnet` → row with `source = lead_magnet`

Server-side controls include CORS allowlisting, honeypot, field validation / allowlists, and DB-backed rate limits (email + IP). The browser never receives the service-role key.

## Deploy

Configured for Vercel (`vercel.json` keeps `/api/*` off the SPA rewrite). Static assets live under `public/`.
