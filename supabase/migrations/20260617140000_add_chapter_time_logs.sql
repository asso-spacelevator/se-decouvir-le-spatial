create table chapter_time_logs (
  id          uuid        primary key default gen_random_uuid(),
  session_id  uuid        not null references student_sessions(id) on delete cascade,
  section     text        not null,
  page_index  int         not null,
  elapsed_sec int         not null,
  created_at  timestamptz not null default now()
);

alter table chapter_time_logs enable row level security;

create policy "Students can insert own logs"
  on chapter_time_logs for insert
  to authenticated
  with check (
    session_id in (
      select id from student_sessions where user_id = auth.uid()
    )
  );
