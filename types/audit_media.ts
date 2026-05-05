export type AuditMedia = {
  id: string
  auditoria_id: string
  created_at: string
  media_type: 'text' | 'audio' | 'pdf' | 'image' | 'document'
  file_url?: string
  raw_text?: string
  transcription?: string
  extracted_text?: string
  metadata?: Record<string, any>
}
