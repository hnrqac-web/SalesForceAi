-- ============================================================
-- Migration 002: Análise Comportamental Avançada
-- SalesForce AI Auditor
-- Criado em: 2025
-- Compatível com registros antigos (ADD COLUMN IF NOT EXISTS)
-- ============================================================

-- ----------------------------------------------------------
-- 1. Novos campos na tabela `auditorias`
-- ----------------------------------------------------------
alter table public.auditorias
  -- Intenção e comportamento do cliente
  add column if not exists customer_intent text,
  add column if not exists objection_type text,
  add column if not exists urgency_level text,
  add column if not exists buying_stage text,
  add column if not exists trust_level text,
  add column if not exists price_sensitivity text,
  add column if not exists decision_power text,

  -- Riscos e recomendações
  add column if not exists risk_reason text,
  add column if not exists recommended_action text,
  add column if not exists risk_level text,

  -- Scores numéricos (0-10)
  add column if not exists behavioral_score numeric check (behavioral_score >= 0 and behavioral_score <= 10),
  add column if not exists intent_score numeric check (intent_score >= 0 and intent_score <= 10),
  add column if not exists urgency_score numeric check (urgency_score >= 0 and urgency_score <= 10),
  add column if not exists trust_score numeric check (trust_score >= 0 and trust_score <= 10),
  add column if not exists probability_to_close numeric check (probability_to_close >= 0 and probability_to_close <= 10),

  -- Tipo de mídia da conversa
  add column if not exists media_type text,

  -- Entidades extraídas (nomes, produtos, valores, datas mencionados)
  add column if not exists extracted_entities jsonb,

  -- Análise comportamental completa da IA (objeto livre)
  add column if not exists ai_behavior_analysis jsonb,

  -- Objeções e sinais (arrays de strings)
  add column if not exists explicit_objections jsonb,
  add column if not exists hidden_objections jsonb,
  add column if not exists positive_signals jsonb,
  add column if not exists negative_signals jsonb,

  -- Análise do vendedor
  add column if not exists seller_strengths jsonb,
  add column if not exists seller_script_failures jsonb,

  -- Mensagem pronta e timing
  add column if not exists copy_ready_message text,
  add column if not exists suggested_followup_timing text;

-- ----------------------------------------------------------
-- 2. Tabela `audit_media` — mídias associadas a auditorias
-- ----------------------------------------------------------
create table if not exists public.audit_media (
  id               uuid        primary key default gen_random_uuid(),
  auditoria_id     uuid        references public.auditorias(id) on delete cascade,
  created_at       timestamptz not null default now(),
  media_type       text        not null, -- 'text' | 'audio' | 'pdf' | 'image' | 'document'
  file_url         text,
  raw_text         text,
  transcription    text,
  extracted_text   text,
  metadata         jsonb
);

-- RLS para audit_media
alter table public.audit_media enable row level security;

-- Políticas (compatível com Supabase >= 2.x)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'audit_media'
      and policyname = 'Allow authenticated users to read audit media'
  ) then
    execute $policy$
      create policy "Allow authenticated users to read audit media"
      on public.audit_media
      for select
      to authenticated
      using (true)
    $policy$;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'audit_media'
      and policyname = 'Allow authenticated users to insert audit media'
  ) then
    execute $policy$
      create policy "Allow authenticated users to insert audit media"
      on public.audit_media
      for insert
      to authenticated
      with check (true)
    $policy$;
  end if;
end
$$;

-- ----------------------------------------------------------
-- 3. Indexes para performance
-- ----------------------------------------------------------
create index if not exists idx_audit_media_auditoria_id
  on public.audit_media (auditoria_id);

create index if not exists idx_auditorias_risk_level
  on public.auditorias (risk_level)
  where risk_level is not null;

create index if not exists idx_auditorias_buying_stage
  on public.auditorias (buying_stage)
  where buying_stage is not null;

create index if not exists idx_auditorias_probability_to_close
  on public.auditorias (probability_to_close)
  where probability_to_close is not null;

-- ----------------------------------------------------------
-- 4. Atualizar Realtime para incluir audit_media
-- ----------------------------------------------------------
alter publication supabase_realtime add table public.audit_media;

-- ============================================================
-- FIM DA MIGRATION
-- ============================================================
