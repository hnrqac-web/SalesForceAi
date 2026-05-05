import { Auditoria } from '@/types/auditoria'

export const mockAuditorias: Auditoria[] = [
  {
    id: '1',
    created_at: '2025-01-15T10:30:00Z',
    vendedor_name: 'Mariana Costa',
    cliente_name: 'Clínica Vitalis',
    ai_score: 9.1,
    lead_sentiment: 'Positivo',
    ai_summary: 'Vendedor demonstrou excelente domínio técnico e abordagem consultiva. Identificou corretamente a dor do cliente e propôs solução alinhada.',
    next_step_suggestion: 'Olá! Ficou alguma dúvida sobre os benefícios que conversamos? Posso te enviar um resumo por e-mail agora mesmo e já garantir sua vaga na demonstração desta semana.',
    transcript: `Cliente: Olá, vi o anúncio e queria entender melhor o produto.
Vendedor: Boa tarde! Fico feliz com seu interesse. Posso te fazer algumas perguntas rápidas para entender melhor o que você precisa?
Cliente: Claro, pode perguntar.
Vendedor: Perfeito. Hoje vocês utilizam algum sistema para gestão da clínica?
Cliente: Temos um sistema antigo, mas precisamos de algo mais moderno com acesso remoto.
Vendedor: Entendo! Esse é exatamente o perfil de clínicas que atendemos. O nosso sistema tem acesso em nuvem, sem instalação, com suporte 24/7.
Cliente: Interessante. Qual o valor?
Vendedor: Temos planos a partir de R$297/mês. Mas antes de falar de valor, posso mostrar como funciona em 10 minutos?
Cliente: Sim, pode me enviar um link de demonstração.`,
  },
  {
    id: '2',
    created_at: '2025-01-15T14:00:00Z',
    vendedor_name: 'Rafael Lima',
    cliente_name: 'AutoPrime Veículos',
    ai_score: 7.2,
    lead_sentiment: 'Neutro',
    ai_summary: 'Boa abordagem inicial mas deixou passar oportunidade de fechamento. Não criou urgência nem propôs próximo passo concreto.',
    next_step_suggestion: 'Oi! Lembrei de você pensando na proposta que montamos. Essa semana temos uma condição especial de parcelamento em 12x sem juros. Quer aproveitar antes de encerrar?',
    transcript: `Cliente: Olá, tenho interesse num veículo para minha empresa.
Vendedor: Bom dia! Que tipo de veículo está procurando? Uso comercial ou passeio?
Cliente: Comercial, para entregas. Preciso de algo econômico.
Vendedor: Temos várias opções de utilitários. O mais vendido aqui é o Fiat Fiorino, muito econômico e durável.
Cliente: Qual o preço?
Vendedor: Está na faixa de R$82.000. Posso passar uma proposta formal?
Cliente: Me manda sim. Mas preciso avaliar com meu sócio.
Vendedor: Claro, vou preparar e te envio em breve.`,
  },
  {
    id: '3',
    created_at: '2025-01-14T09:15:00Z',
    vendedor_name: 'Bruno Almeida',
    cliente_name: 'Studio Bella Forma',
    ai_score: 4.3,
    lead_sentiment: 'Crítico',
    ai_summary: 'Vendedor não soube lidar com objeção de preço e perdeu o interesse do cliente. Postura passiva e sem argumentação de valor.',
    next_step_suggestion: 'Oi! Entendo que o valor inicial pareceu alto. Mas posso te mostrar como outras academias similares recuperaram o investimento em menos de 60 dias. Posso te ligar agora?',
    transcript: `Cliente: Queria saber mais sobre o sistema de gestão para minha academia.
Vendedor: Oi! Temos uma solução completa com app para alunos e gestão financeira.
Cliente: Qual o preço mensal?
Vendedor: É R$450 por mês no plano básico.
Cliente: Achei muito caro, outros sistemas cobram R$150.
Vendedor: Sim, mas nosso sistema é mais completo.
Cliente: Mesmo assim, preciso pensar. Obrigada.
Vendedor: Tudo bem, qualquer dúvida pode chamar.`,
  },
  {
    id: '4',
    created_at: '2025-01-14T11:45:00Z',
    vendedor_name: 'Mariana Costa',
    cliente_name: 'Escola Nova Geração',
    ai_score: 8.4,
    lead_sentiment: 'Interessado',
    ai_summary: 'Excelente identificação de dor e proposta de valor clara. Vendedora conduziu bem a conversa e gerou interesse real no produto.',
    next_step_suggestion: 'Oi! Vi que você ficou interessada no módulo de comunicação com pais. Preparei um demo exclusivo pra mostrar como funciona na prática. Quando temos 20 min esta semana?',
    transcript: `Cliente: Precisamos de um sistema para comunicação com os pais e controle de mensalidades.
Vendedor: Entendo! Esses são os principais pontos que as escolas nos procuram. Vocês usam WhatsApp para comunicar com os pais atualmente?
Cliente: Sim, mas é um caos. Muita informação se perde.
Vendedor: Exatamente o problema que resolvemos. Nosso módulo centraliza tudo: avisos, financeiro e agenda numa única plataforma.
Cliente: Isso seria incrível. Temos 450 alunos.
Vendedor: Para esse porte, nosso plano fica em R$790/mês. Posso te mostrar cases de escolas similares?
Cliente: Com certeza, quero ver mais.`,
  },
  {
    id: '5',
    created_at: '2025-01-13T16:20:00Z',
    vendedor_name: 'Rafael Lima',
    cliente_name: 'Construtora Horizonte',
    ai_score: 5.8,
    lead_sentiment: 'Indeciso',
    ai_summary: 'Conversa superficial, vendedor não aprofundou as necessidades reais. Não soube responder dúvida técnica sobre integração com ERP.',
    next_step_suggestion: 'Olá! Revisando nossa conversa, acho que não expliquei bem como funciona a integração com o TOTVS. Posso fazer uma call técnica de 30min com seu time de TI esta semana?',
    transcript: `Cliente: Boa tarde, precisamos de um software para gestão de obras.
Vendedor: Boa tarde! Sim, temos uma solução para construção civil.
Cliente: Quantos projetos simultâneos o sistema suporta?
Vendedor: Suporta quantos projetos precisar.
Cliente: E integra com nosso ERP atual?
Vendedor: Depende de qual ERP. Qual vocês usam?
Cliente: TOTVS Protheus.
Vendedor: Vou precisar verificar com o time técnico e te retorno.`,
  },
  {
    id: '6',
    created_at: '2025-01-13T10:00:00Z',
    vendedor_name: 'Mariana Costa',
    cliente_name: 'Mercado Aliança',
    ai_score: 6.7,
    lead_sentiment: 'Positivo',
    ai_summary: 'Boa apresentação do produto e identificação do perfil do cliente. Faltou criar urgência para o fechamento.',
    next_step_suggestion: 'Olá Sr. Antônio! A promoção de implementação gratuita que comentei vence sexta-feira. São apenas 3 vagas restantes este mês. Posso garantir a sua?',
    transcript: `Cliente: Preciso de um sistema PDV para meu mercado.
Vendedor: Perfeito! Qual é o tamanho do seu mercado? Quantos caixas?
Cliente: Dois caixas e uma filial pequena.
Vendedor: Temos o plano ideal pra você. Inclui gestão de estoque, NF-e e controle de dois caixas simultâneos.
Cliente: Legal. E o suporte técnico?
Vendedor: Suporte remoto em horário comercial incluso, suporte 24h disponível no plano Premium.
Cliente: Quanto custa o Premium?
Vendedor: R$380/mês. Implementação e treinamento inclusas.`,
  },
  {
    id: '7',
    created_at: '2025-01-12T08:30:00Z',
    vendedor_name: 'Bruno Almeida',
    cliente_name: 'Instituto Plena Saúde',
    ai_score: 3.9,
    lead_sentiment: 'Negativo',
    ai_summary: 'Postura muito passiva, não identificou dores e não apresentou benefícios relevantes. Cliente saiu sem interesse.',
    next_step_suggestion: 'Oi! Percebi que nossa conversa foi rápida demais. Gostaria de entender melhor os desafios do Instituto e mostrar como ajudamos clínicas similares a reduzir em 40% o tempo de atendimento. Quando podemos conversar?',
    transcript: `Cliente: Oi, queria saber sobre o sistema para clínica.
Vendedor: Oi! Temos sistema para clínicas. Quer um orçamento?
Cliente: Queria entender o que inclui.
Vendedor: Inclui agenda, prontuário e financeiro.
Cliente: E telemedicina?
Vendedor: Esse módulo é extra.
Cliente: Ah, então fica mais caro.
Vendedor: Sim, um pouco mais. Quer o valor?
Cliente: Depois eu entro em contato.`,
  },
  {
    id: '8',
    created_at: '2025-01-12T13:00:00Z',
    vendedor_name: 'Rafael Lima',
    cliente_name: 'TechNova Solutions',
    ai_score: 8.9,
    lead_sentiment: 'Interessado',
    ai_summary: 'Excelente rapport, identificação precisa de dor e proposta personalizada. Vendedor conduziu perfeitamente até o agendamento de demo.',
    next_step_suggestion: 'Oi Bruno! Adorei nossa conversa. Preparei uma proposta personalizada com os 3 módulos que mais fazem sentido pra TechNova. Posso te enviar em PDF agora?',
    transcript: `Cliente: Olá, somos uma startup de tecnologia buscando uma solução de CRM.
Vendedor: Que ótimo! Quantos usuários no time de vendas?
Cliente: Hoje são 8, mas crescemos 30% ao trimestre.
Vendedor: Escalabilidade é crucial então. Nosso CRM não cobra por usuário até 20 seats. Vocês já usam alguma ferramenta hoje?
Cliente: Spreadsheets e um CRM básico. Perdemos muito lead por falta de follow-up.
Vendedor: Esse é o problema que resolvemos. Nosso sistema tem automação de follow-up por WhatsApp e e-mail. Posso te mostrar como funciona?
Cliente: Sim! Quando pode fazer uma demo?
Vendedor: Amanhã às 14h funciona pra você? Posso preparar um cenário específico para o seu caso.`,
  },
]

export const weeklyPerformanceData = [
  { day: 'Seg', mariana: 8.2, rafael: 7.0, bruno: 4.5 },
  { day: 'Ter', mariana: 9.1, rafael: 7.5, bruno: 5.2 },
  { day: 'Qua', mariana: 7.8, rafael: 8.1, bruno: 6.0 },
  { day: 'Qui', mariana: 8.6, rafael: 7.2, bruno: 4.3 },
  { day: 'Sex', mariana: 9.0, rafael: 8.9, bruno: 5.8 },
  { day: 'Sáb', mariana: 8.4, rafael: 7.8, bruno: 3.9 },
]
