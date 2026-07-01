# Project X

Project X is a personal discipline and learning-progress tracker built with Next.js, TypeScript, Tailwind CSS, Supabase, and Recharts.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS v4
- Supabase Auth + Postgres
- Recharts
- Vercel-compatible deployment

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Copy the environment file and fill in your Supabase project values:

```bash
cp .env.example .env.local
```

3. Run the SQL in [supabase/migrations/0001_project_x.sql](supabase/migrations/0001_project_x.sql) inside the Supabase SQL editor.

4. Start the app:

```bash
npm run dev
```

5. Open `http://localhost:3000`.

## Environment variables

The app expects:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Notes

- The app uses email/password authentication.
- Course progress is calculated from lesson durations when lessons exist.
- `target_hours` acts as a fallback target when a course has no lessons yet.
- Lesson video links are optional and open in a new tab; videos are not embedded in v1.
