# SalesForce AI Auditor 🚀

Plataforma de Inteligência Comercial e Auditoria de Vendas automatizada com IA. Originalmente concebido no Lovable e profissionalizado para produção com Next.js, Supabase e TanStack Query.

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS + Lucide Icons
- **Banco de Dados & Auth**: Supabase
- **Estado & Cache**: TanStack Query (React Query)
- **Gráficos**: Recharts
- **Deployment**: Vercel

## 🚀 Como Começar

### 1. Clonar o repositório
```bash
git clone https://github.com/hnrqac-web/SalesForceAi.git
cd SalesForceAi
```

### 2. Instalar dependências
```bash
npm install
```

### 3. Configurar Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto (use o `.env.example` como base):
```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase
```

### 4. Configurar o Supabase
1. Crie um novo projeto no [Supabase](https://supabase.com).
2. Vá em **SQL Editor** e execute o conteúdo do arquivo `schema.sql` deste repositório.
3. Habilite o **Realtime** para a tabela `auditorias` (já incluso no SQL).
4. Configure a **Autenticação** (Email/Senha) no dashboard do Supabase.

### 5. Rodar localmente
```bash
npm run dev
```
Acesse [http://localhost:3000](http://localhost:3000).

## 📊 Estrutura do Banco (Supabase)

Tabela: `auditorias`
- `id`: UUID (Primary Key)
- `created_at`: Timestamp
- `vendedor_name`: Text
- `cliente_name`: Text
- `transcript`: Text (Transcrição da conversa)
- `ai_score`: Float (Nota de 0 a 10)
- `ai_summary`: Text (Resumo executivo)
- `next_step_suggestion`: Text (Sugestão de coaching)
- `lead_sentiment`: Text (Positivo, Neutro, Negativo, Crítico)

## ☁️ Deploy na Vercel

1. Suba seu código para o GitHub.
2. Conecte o repositório na [Vercel](https://vercel.com).
3. Adicione as variáveis de ambiente (`NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
4. Clique em **Deploy**.

## 🔮 Próximos Passos Recomendados

1. **Integração Evolution API**: Conectar o WhatsApp para capturar mensagens automaticamente.
2. **Workflow n8n**: Criar um fluxo que recebe a mensagem, envia para o Gemini para análise e salva no Supabase.
3. **Gemini AI**: Refinar os prompts de análise para maior precisão nos scores e sugestões de coaching.
4. **Relatórios PDF**: Gerar relatórios de performance semanais para os vendedores.

---
Desenvolvido com ❤️ por Antigravity AI.
