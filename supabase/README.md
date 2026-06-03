# Supabase setup

1. Create a Supabase project.
2. In Authentication > Providers, enable Email.
3. In Authentication > URL Configuration, add `http://localhost:3000/profile` as a redirect URL.
4. Run `supabase/schema.sql` in the SQL Editor.
5. Copy `frontend/.env.local.example` to `frontend/.env.local` and fill:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

The app will then register users with Supabase Auth and keep each account separated.
