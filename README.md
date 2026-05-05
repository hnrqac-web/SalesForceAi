# SalesForce AI Auditor

Plataforma de Inteligência Comercial e Auditoria de Vendas via WhatsApp com IA.

## Stack

- **Frontend:** Next.js 14 App Router + TypeScript
- **Estilização:** Tailwind CSS
- **UI:** Lucide Icons + componentes customizados
- **Gráficos:** Recharts
- **Backend:** Supabase (Database + Auth + Realtime)
- **IA:** Gemini Flash via n8n
- **Integração WhatsApp:** Evolution API

## Configuração

### 1. Clone o repositório

```bash
git clone https://github.com/hnrqac-web/SalesForceAi.git
cd SalesForceAi
npm install
```

### 2. Configure as variáveis de ambiente

```bash
cp .env.example .env.local
```

Edite `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key
```

### 3. Crie a tabela no Supabase

```sql
create table auditorias (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  vendedor_name text not null,
  cliente_name text not null,
  transcript text,
  ai_score numeric(4,1),
  ai_summary text,
  next_step_suggestion text,
  lead_sentiment text
);

alter table auditorias enable row level security;
create policy "Leitura autenticada" on auditorias
  for select using (auth.role() = 'authenticated');
create policy "Insert via service_role" on auditorias
  for insert with check (true);
```

### 4. Rode localmente

```bash
npm run dev
```

Acesse: http://localhost:3000

## Fluxo de dados

```
WhatsApp → Evolution API → n8n → Gemini Flash → Supabase → Dashboard
```

### JSON inserido pelo n8n no Supabase

```json
{
  "vendedor_name": "Mariana Costa",
  "cliente_name": "Clínica Vitalis",
  "transcript": "Cliente: Olá...\nVendedor: Boa tarde...",
  "ai_score": 8.7,
  "ai_summary": "Vendedor demonstrou abordagem consultiva...",
  "next_step_suggestion": "Olá! Ficou alguma dúvida sobre...",
  "lead_sentiment": "Interessado"
}
```

## Deploy na Vercel

```bash
npm install -g vercel
vercel --prod
```

Configure as variáveis de ambiente na dashboard da Vercel.

## Telas

| Rota | Descrição |
|------|-----------|
| `/dashboard` | KPIs executivos + gráfico semanal |
| `/auditorias` | Feed com filtros + Raio-X lateral |
| `/whatsapp-setup` | Gestão de instâncias Evolution API |
| `/settings` | Perfil + chaves de integração |
