# Supabase setup

Project URL:

`https://itectpofhngpeausakzg.supabase.co`

## 1. Create database tables

Open Supabase Dashboard > SQL Editor and run:

`supabase/schema.sql`

This creates:

- `user_accounts`
- `travel_profiles`
- `user_favorites`
- `user_routes`

All tables have Row Level Security enabled, so each user can only read/write their own data. Passwords are not stored in public tables; Supabase Auth stores them hashed in `auth.users`.

## 2. Configure email/password auth

Open Authentication > Providers > Email:

- Enable Email provider.
- Disable Confirm email.

Users register with email + password only. No verification code, no email confirmation step.

## 3. Frontend environment

`frontend/.env.local` is configured with:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

## Direct remote setup

The publishable key cannot create tables, policies, auth templates, or project settings. To create everything remotely without using the dashboard, an admin credential is required:

- Supabase access token for CLI/Management API, or
- Database connection string/password for direct SQL execution.
