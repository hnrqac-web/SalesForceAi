-- Otimização de Ingestão e IA
ALTER TABLE auditorias ADD COLUMN IF NOT EXISTS last_ai_trigger TIMESTAMPTZ DEFAULT '-infinity';

CREATE OR REPLACE FUNCTION add_message_to_auditoria(
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
    SELECT id, transcript_completo, last_ai_trigger INTO v_auditoria_id, v_transcript_completo, v_last_ai_trigger
    FROM auditorias
    WHERE cliente_name = p_cliente_name 
      AND vendedor_name = p_vendedor_name
      AND status = 'aberto'
    ORDER BY created_at DESC
    LIMIT 1;

    IF v_auditoria_id IS NULL THEN
        INSERT INTO auditorias (cliente_name, vendedor_name, transcript_completo, last_ai_trigger)
        VALUES (p_cliente_name, p_vendedor_name, '', '-infinity')
        RETURNING id, transcript_completo, last_ai_trigger INTO v_auditoria_id, v_transcript_completo, v_last_ai_trigger;
    END IF;

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

CREATE OR REPLACE FUNCTION mark_ai_triggered(p_auditoria_id UUID) 
RETURNS VOID 
SECURITY DEFINER
AS $$
BEGIN
    UPDATE auditorias SET last_ai_trigger = NOW() WHERE id = p_auditoria_id;
END;
$$ LANGUAGE plpgsql;
