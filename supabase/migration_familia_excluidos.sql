-- ─────────────────────────────────────────────────────────────────────────────
-- Desvinculaciones manuales del Portal de Familias: cuando el admin quita un
-- alumno de una cuenta familiar (la X), se registra aquí para que la
-- sincronización automática por correo NO lo vuelva a añadir. Volver a
-- vincularlo a mano borra la exclusión. Idempotente y no destructivo.
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists club_familia_excluidos (
  familia_id    uuid not null references club_familias(id) on delete cascade,
  submission_id uuid not null references form_submissions(id) on delete cascade,
  created_at    timestamptz default now(),
  primary key (familia_id, submission_id)
);

alter table club_familia_excluidos enable row level security;
