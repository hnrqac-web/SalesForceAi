-- 1. Adicionar a coluna cliente_jid se ela não existir
ALTER TABLE auditorias ADD COLUMN IF NOT EXISTS cliente_jid TEXT;

-- 2. Criar um índice para busca rápida por JID
CREATE INDEX IF NOT EXISTS idx_auditorias_cliente_jid ON auditorias(cliente_jid);

-- 3. Atualizar a função de inserção de mensagens para usar o JID como chave primária de busca
CREATE OR REPLACE FUNCTION add_message_to_auditoria(
    p_cliente_jid TEXT,
    p_cliente_name TEXT,
    p_vendedor_name TEXT,
    p_message TEXT,
    p_from_me BOOLEAN
) RETURNS JSONB 
SECURITY DEFINER
AS $$
DECLARE
    v_auditoria_id UUID;
    v_transcript_completo TEXT;
    v_last_ai_trigger TIMESTAMPTZ;
BEGIN
    -- Busca uma auditoria aberta para este Vendedor + Cliente (usando JID)
    SELECT id, transcript_completo, last_ai_trigger INTO v_auditoria_id, v_transcript_completo, v_last_ai_trigger
    FROM auditorias
    WHERE cliente_jid = p_cliente_jid 
      AND vendedor_name = p_vendedor_name
      AND status = 'aberto'
    ORDER BY created_at DESC
    LIMIT 1;

    -- Se não encontrar, cria uma nova usando o JID e o Nome fornecido (ou JID como fallback)
    IF v_auditoria_id IS NULL THEN
        INSERT INTO auditorias (cliente_jid, cliente_name, vendedor_name, transcript_completo, last_ai_trigger)
        VALUES (
            p_cliente_jid, 
            COALESCE(NULLIF(p_cliente_name, ''), split_part(p_cliente_jid, '@', 1)), 
            p_vendedor_name, 
            '', 
            '-infinity'
        )
        RETURNING id, transcript_completo, last_ai_trigger INTO v_auditoria_id, v_transcript_completo, v_last_ai_trigger;
    ELSE
        -- Se a auditoria já existe mas o nome do cliente está genérico/vazio e agora veio um nome real
        IF p_cliente_name IS NOT NULL AND p_cliente_name <> '' AND (cliente_name IS NULL OR cliente_name = '' OR cliente_name = split_part(p_cliente_jid, '@', 1)) THEN
            UPDATE auditorias SET cliente_name = p_cliente_name WHERE id = v_auditoria_id;
        END IF;
    END IF;

    -- Adiciona a mensagem ao transcript
    UPDATE auditorias
    SET 
        transcript_completo = v_transcript_completo || E'\n' || (CASE WHEN p_from_me THEN 'Vendedor: ' ELSE 'Cliente: ' END) || p_message,
        updated_at = NOW()
    WHERE id = v_auditoria_id;

    RETURN jsonb_build_object(
        'auditoria_id', v_auditoria_id,
        'last_ai_trigger', v_last_ai_trigger
    );
END;
$$ LANGUAGE plpgsql;
