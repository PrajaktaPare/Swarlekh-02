-- Run this SQL in Supabase SQL Editor

-- 1. Profiles table
create table if not exists profiles (
  id uuid references auth.users primary key,
  name text not null,
  email text,
  role text check (role in ('student','teacher','admin')),
  institution text,
  created_at timestamp default now()
);

-- 2. Exams table
create table if not exists exams (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid references profiles(id),
  title text not null,
  subject text,
  institution text,
  exam_type text default 'College Exam',
  duration_minutes integer default 60,
  questions jsonb default '[]',
  session_code text unique,
  status text default 'active',
  pdf_url text,
  created_at timestamp default now()
);

-- 3. Exam Sessions table
create table if not exists exam_sessions (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid references exams(id),
  student_id uuid references profiles(id),
  answers jsonb default '{}',
  status text default 'joined',
  submitted_at timestamp,
  created_at timestamp default now()
);

-- 4. Auto create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, name, email, role, institution)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'User'),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'student'),
    coalesce(new.raw_user_meta_data->>'institution', '')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- 5. Enable RLS
alter table profiles enable row level security;
alter table exams enable row level security;
alter table exam_sessions enable row level security;

-- 6. RLS Policies
drop policy if exists "own profile" on profiles;
create policy "own profile" on profiles for all using (auth.uid() = id);

drop policy if exists "admin all profiles" on profiles;
create policy "admin all profiles" on profiles for select
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

drop policy if exists "teacher exams" on exams;
create policy "teacher exams" on exams for all using (auth.uid() = teacher_id);

drop policy if exists "active exams visible" on exams;
create policy "active exams visible" on exams for select using (status = 'active');

drop policy if exists "admin all exams" on exams;
create policy "admin all exams" on exams for select
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

drop policy if exists "student sessions" on exam_sessions;
create policy "student sessions" on exam_sessions for all using (auth.uid() = student_id);

drop policy if exists "teacher sees submissions" on exam_sessions;
create policy "teacher sees submissions" on exam_sessions for select
  using (exists (select 1 from exams where exams.id = exam_sessions.exam_id and exams.teacher_id = auth.uid()));

drop policy if exists "admin all sessions" on exam_sessions;
create policy "admin all sessions" on exam_sessions for select
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- 7. Storage bucket for exam papers
insert into storage.buckets (id, name, public) values ('exam-papers', 'exam-papers', true) on conflict do nothing;

create policy "anyone can view exam papers" on storage.objects for select using (bucket_id = 'exam-papers');
create policy "teachers can upload" on storage.objects for insert with check (bucket_id = 'exam-papers' and auth.role() = 'authenticated');
