create extension if not exists "pgcrypto";

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  category text,
  target_hours numeric(6, 2),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.sections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  sort_order integer not null default 1,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  section_id uuid not null references public.sections(id) on delete cascade,
  title text not null,
  duration_minutes integer not null default 0 check (duration_minutes >= 0),
  video_url text,
  completed boolean not null default false,
  completed_at timestamptz,
  sort_order integer not null default 1,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  section_id uuid not null references public.sections(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  duration_minutes integer not null default 0 check (duration_minutes >= 0),
  completed_at timestamptz not null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (user_id, lesson_id)
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

drop trigger if exists courses_set_updated_at on public.courses;
create trigger courses_set_updated_at
  before update on public.courses
  for each row execute procedure public.handle_updated_at();

drop trigger if exists sections_set_updated_at on public.sections;
create trigger sections_set_updated_at
  before update on public.sections
  for each row execute procedure public.handle_updated_at();

drop trigger if exists lessons_set_updated_at on public.lessons;
create trigger lessons_set_updated_at
  before update on public.lessons
  for each row execute procedure public.handle_updated_at();

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.sections enable row level security;
alter table public.lessons enable row level security;
alter table public.activity_logs enable row level security;

create policy "profiles are viewable by owner"
  on public.profiles
  for select
  using (auth.uid() = id);

create policy "profiles are insertable by owner"
  on public.profiles
  for insert
  with check (auth.uid() = id);

create policy "profiles are updatable by owner"
  on public.profiles
  for update
  using (auth.uid() = id);

create policy "courses are owned by user"
  on public.courses
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "sections are owned by user"
  on public.sections
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "lessons are owned by user"
  on public.lessons
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "activity_logs are owned by user"
  on public.activity_logs
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
