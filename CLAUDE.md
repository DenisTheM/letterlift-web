# LetterLift

KI-personalisierte Briefserien als physische Post für CH/DE/AT.

## Tech Stack

- **Frontend:** Next.js (App Router) auf Vercel
- **Backend:** Supabase Edge Functions (Deno)
- **Payments:** Stripe (Checkout + Webhooks)
- **Postversand:** Pingen API
- **E-Mail:** Resend
- **Analytics:** Google Analytics 4 (GA4)

## Kritische Deployment-Regel

**Alle Supabase Edge Functions MÜSSEN mit `--no-verify-jwt` deployed werden.**

```bash
supabase functions deploy <function-name> --no-verify-jwt
```

Betrifft alle Functions:
- generate-series
- generate-preview
- create-checkout
- review-letter
- auto-approve
- cron-auto-approve
- notify-review
- notify-admin
- cron-notify
- webhook-stripe
- send-letter

## Pingen-Regel

Ländercodes müssen ausgeschrieben werden:
- `DE` → `DEUTSCHLAND`
- `AT` → `ÖSTERREICH`
- `CH` → `SCHWEIZ`

## Kontakt

- **Admin-E-Mail:** sachenohne@gmail.com

## Arbeitsweise

- **Sprache:** Deutsch
- Der Nutzer ist kein Entwickler – Code-Änderungen immer einfach und verständlich erklären
- Terminal-Befehle immer vollständig und copy-paste-fertig angeben
- Keine Abkürzungen oder implizites Wissen voraussetzen
