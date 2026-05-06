-- Correção da Função add_message_to_auditoria para usar JID
-- Isso evita que mensagens do vendedor (fromMe) criem novas auditorias ou se percam

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
    v_clean_jid TEXT;
BEGIN
    -- Limpa o JID para garantir consistência (remove @s.whatsapp.net se houver)
    v_clean_jid := split_part(p_cliente_jid, '@', 1);

    -- Busca uma auditoria aberta para este Vendedor + Cliente (usando JID)
    SELECT id, transcript_completo, last_ai_trigger INTO v_auditoria_id, v_transcript_completo, v_last_ai_trigger
    FROM auditorias
    WHERE (cliente_jid = v_clean_jid OR cliente_jid = p_cliente_jid)
      AND vendedor_name = p_vendedor_name
      AND status = 'aberto'
    ORDER BY created_at DESC
    LIMIT 1;

    -- Se não encontrar por JID, tenta pelo nome do cliente como fallback (para auditorias antigas)
    IF v_auditoria_id IS NULL THEN
        SELECT id, transcript_completo, last_ai_trigger INTO v_auditoria_id, v_transcript_completo, v_last_ai_trigger
        FROM auditorias
        WHERE cliente_name = p_cliente_name 
          AND vendedor_name = p_vendedor_name
          AND status = 'aberto'
        ORDER BY created_at DESC
        LIMIT 1;
    END IF;

    -- Se ainda não encontrar, cria uma nova usando o JID e o Nome fornecido
    IF v_auditoria_id IS NULL THEN
        INSERT INTO auditorias (cliente_jid, cliente_name, vendedor_name, transcript_completo, last_ai_trigger)
        VALUES (v_clean_jid, p_cliente_name, p_vendedor_name, '', '-infinity')
        RETURNING id, transcript_completo, last_ai_trigger INTO v_auditoria_id, v_transcript_completo, v_last_ai_trigger;
    ELSE
        -- Atualiza o JID se estiver faltando na auditoria encontrada
        UPDATE auditorias SET cliente_jid = v_clean_jid WHERE id = v_auditoria_id AND (cliente_jid IS NULL OR cliente_jid = '');
    END IF;

    -- Adiciona a mensagem ao transcript
    UPDATE auditorias
    SET 
        transcript_completo = COALESCE(v_transcript_completo, '') || E'\n' || (CASE WHEN p_from_me THEN 'Vendedor: ' ELSE 'Cliente: ' END) || p_message,
        updated_at = NOW()
    WHERE id = v_auditoria_id;

    RETURN jsonb_build_object(
        'auditoria_id', v_auditoria_id,
        'last_ai_trigger', v_last_ai_trigger
    );
END;
$$ LANGUAGE plpgsql;
