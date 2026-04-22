# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

SubStack RU — Russian newsletter platform (Substack clone) with local payments (CloudPayments/YooKassa/SBP), email delivery via Resend, and 152-FZ compliance. See `/docs/PRD.md` for full product requirements.

## Tech Stack

- **Framework:** Next.js 16 (App Router) + TypeScript
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** NextAuth.js v4 (Credentials provider, JWT sessions)
- **Editor:** TipTap (rich text, outputs JSON + HTML)
- **Email:** Resend SDK (`resend` npm package)
- **Payments:** CloudPayments (primary), YooKassa (planned fallback)
- **CSS:** Tailwind v4

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint
npm run db:migrate   # prisma migrate dev
npm run db:generate  # prisma generate
npm run db:seed      # tsx prisma/seed.ts (test author: author@example.com / password123)
npm run db:studio    # prisma studio
```

## Architecture

- `src/app/` — Next.js App Router with route groups:
  - `(auth)/` — login, register, verify-email (centered card layout)
  - `(public)/` — SSR pages for SEO: `[slug]/` publication, `[slug]/[postSlug]/` post, `explore/`
  - `(dashboard)/` — author dashboard behind auth middleware
  - `api/` — REST API routes (posts, publications, subscribers, payments, analytics)
- `src/lib/` — shared: `prisma.ts` (singleton), `auth.ts` (NextAuth config), `email/` (Resend), `payments/` (CloudPayments), `validators.ts` (Zod), `utils.ts`
- `src/components/` — `editor/` (TipTap), `layout/` (header/footer/sidebar), `posts/`, `subscribe/`
- `prisma/schema.prisma` — 7 models: User, Publication, Post, Subscriber, Subscription, Payment, EmailSend
- `src/middleware.ts` — protects `/dashboard/*`, redirects auth pages for logged-in users

## Key Patterns

- Prices stored in kopecks (1 RUB = 100 kopecks). Use `formatRubles()` for display.
- Posts store TipTap content as JSON (`content` field) + pre-rendered HTML (`contentHtml`).
- Paywall: server-side check in post page — if `accessLevel === PAID`, check for active Subscription.
- Email tracking: 1x1 pixel for opens, redirect for clicks, via `/api/analytics/track`.
- Payment webhooks at `/api/payments/webhook/cloudpayments/` — CloudPayments expects `{code: 0}` response.
- Platform takes 10% fee on paid subscriptions (calculated per Payment record).
- Subscriber double opt-in: subscribe → confirm email → ACTIVE status.
