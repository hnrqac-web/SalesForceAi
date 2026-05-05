-- Tabela de Auditorias
CREATE TABLE IF NOT EXISTS auditorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  vendedor_name TEXT NOT NULL,
  cliente_name TEXT NOT NULL,
  transcript TEXT NOT NULL,
  ai_score FLOAT NOT NULL,
  ai_summary TEXT NOT NULL,
  next_step_suggestion TEXT NOT NULL,
  lead_sentiment TEXT NOT NULL
);

-- Habilitar Realtime para a tabela auditorias
ALTER PUBLICATION supabase_realtime ADD TABLE auditorias;

-- RLS (Row Level Security) - Ajuste conforme necessário
-- Por padrão, vamos permitir leitura e escrita para testes, mas em produção deve-se restringir
ALTER TABLE auditorias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura para todos os usuários autenticados"
ON auditorias FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Permitir inserção para todos os usuários autenticados"
ON auditorias FOR INSERT
TO authenticated
WITH CHECK (true);
