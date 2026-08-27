-- Run this AFTER SUPABASE_SETUP.sql, once, in the Supabase SQL Editor.
-- Adds: (1) teacher-approval gating, (2) manual/AI grading storage.
-- Safe to re-run (uses IF NOT EXISTS / CREATE OR REPLACE throughout).

-- =========================================================
-- 1. Teacher approval
-- =========================================================

-- Students and admins are auto-approved. New teachers start unapproved
-- until an admin flips this in the Admin dashboard.
alter table profiles add column if not exists approved boolean default true;

-- Backfill: any existing teacher rows are approved by default so this
-- migration doesn't lock out teachers who registered before this feature
-- existed. New teacher signups will start unapproved (handled by the
-- trigger below).
update profiles set approved = true where approved is null;

-- Update the signup trigger so new teachers default to unapproved.
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, name, email, role, institution, approved)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'User'),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'student'),
    coalesce(new.raw_user_meta_data->>'institution', ''),
    coalesce(new.raw_user_meta_data->>'role', 'student') <> 'teacher'
  );
  return new;
end;
$$ language plpgsql security definer;

-- IMPORTANT: the original "own profile" policy in SUPABASE_SETUP.sql lets a
-- user update every column on their own row -- including role and approved.
-- Without the trigger below, a teacher could just set approved = true on
-- themselves from the browser. This trigger blocks that: only an admin (or
-- the service role) may change role or approved.
create or replace function prevent_self_privilege_escalation()
returns trigger as $$
begin
  if (new.role is distinct from old.role or new.approved is distinct from old.approved) then
    if not exists (select 1 from profiles where id = auth.uid() and role = 'admin') then
      new.role := old.role;
      new.approved := old.approved;
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_profile_update_guard on profiles;
create trigger on_profile_update_guard
  before update on profiles
  for each row execute procedure prevent_self_privilege_escalation();

-- =========================================================
-- 2. Grading support
-- =========================================================

-- 'manual' (default, works today) | 'ai' | 'hybrid' (both require the
-- Lemma grading_agent to actually be wired in -- see LEMMA_INTEGRATION.md).
alter table exams add column if not exists grading_mode text default 'manual'
  check (grading_mode in ('manual', 'ai', 'hybrid'));

-- Keyed by question id: { ai_score, ai_feedback, manual_score, teacher_remarks, final_score }
alter table exam_sessions add column if not exists grading jsonb default '{}'::jsonb;
