# ICA International — Editorial Operations v1

Production: https://ica-international-portal.vercel.app

CCC gateway: https://ccc-iraq-cultural-centre.vercel.app/ica

## Source provenance

The source import workflow copies the original ICA portal from an immutable, SHA-256-verified archive into `app/`. It is designed to run only if `app/package.json` does not yet exist. Subsequent changes must be committed as normal source changes; do not re-import or overwrite newer work.

The live Vercel application currently uses a separate deployment overlay for TanStack Start/Nitro and Supabase integrations. **The GitHub source import alone does not connect or replace the existing Vercel production deployment.** Keep the current production deployment until a Git-connected preview passes full build and browser tests.

## Editorial v1

- Public four-language site: English, Arabic, Sorani Kurdish, Simplified Chinese
- Supabase Auth-based staff sign-in; staff roles managed in `public.ica_staff_accounts`
- RLS-protected article workflow, reviews, audit events, media library and wire sources
- Hourly news ingestion through the existing Supabase scheduled Edge Function
- Storage uploads restricted to authorized staff roles
- Production smoke tests: `.github/workflows/ica-production-checks.yml`

**Staff onboarding:** only invite authorized editorial personnel; assign roles by verified Supabase Auth user ID. No staff identities or passwords are stored in this repository. At initial v1 audit the staff table was empty.

## Release policy

Require CI passing on a preview branch, confirm Vercel build and mobile browser smoke tests, then promote. Never deploy the original Cloudflare worker configuration directly over the working Vercel TanStack/Nitro application. Store secrets only in Vercel/Supabase managed environments.
