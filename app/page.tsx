import Link from 'next/link'
import { Activity, BarChart2, MessageCircle, Shield, Zap, TrendingUp, CheckCircle, ArrowRight, Star } from 'lucide-react'

export const metadata = {
  title: 'SalesForce AI Auditor — Inteligência Comercial para WhatsApp',
  description: 'Audite conversas de vendas automaticamente com IA. Score em tempo real, coaching personalizado e analytics avançado para seu time comercial.',
}

const features = [
  {
    icon: Zap,
    title: 'Análise em Tempo Real',
    desc: 'Cada mensagem do WhatsApp é auditada pela IA em segundos, gerando score e insights automaticamente.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10 border-cyan-500/20',
  },
  {
    icon: BarChart2,
    title: 'Dashboard Executivo',
    desc: 'Visão completa de performance por vendedor, sentimento do lead e tendências de qualidade.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
  },
  {
    icon: MessageCircle,
    title: 'Coaching Automatizado',
    desc: 'A IA sugere a próxima mensagem ideal para cada conversa, treinando seu time em tempo real.',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10 border-violet-500/20',
  },
  {
    icon: Shield,
    title: 'Alertas de Risco',
    desc: 'Notificações instantâneas quando um lead está em risco crítico. Nunca mais perca uma oportunidade.',
    color: 'text-red-400',
    bg: 'bg-red-500/10 border-red-500/20',
  },
  {
    icon: TrendingUp,
    title: 'Relatórios e Exportação',
    desc: 'Exporte auditorias em CSV, analise por período e acompanhe a evolução de cada vendedor.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
  },
  {
    icon: Star,
    title: 'Score de Qualidade',
    desc: 'Score de 0 a 10 para cada conversa, com análise detalhada de abertura, proposta e fechamento.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
  },
]

const stats = [
  { value: '2.3s', label: 'Tempo médio de análise' },
  { value: '98%', label: 'Precisão da IA' },
  { value: '10x', label: 'Mais conversas auditadas' },
  { value: '24/7', label: 'Monitoramento contínuo' },
]

const steps = [
  { num: '01', title: 'Conecte seu WhatsApp', desc: 'Configure sua instância Evolution API em minutos. Escaneie o QR Code e pronto.' },
  { num: '02', title: 'IA processa cada conversa', desc: 'O n8n envia automaticamente para o Gemini que analisa, pontua e gera insights.' },
  { num: '03', title: 'Acompanhe no Dashboard', desc: 'Visualize métricas, receba alertas e exporte relatórios em tempo real.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-slate-200 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/30 flex-shrink-0">
              <Activity size={14} className="text-white" />
            </div>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-bold text-slate-900 dark:text-slate-50 text-sm tracking-tight">SalesForce AI</span>
              <span className="hidden sm:inline text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-widest border border-slate-300 dark:border-slate-700 px-1.5 py-0.5 rounded">Auditor</span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/login" className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 transition-colors font-medium">
              Entrar
            </Link>
            <Link
              href="/login"
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 rounded-xl transition-all shadow-lg shadow-blue-600/20 whitespace-nowrap"
            >
              Começar grátis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-24 sm:pt-32 pb-16 sm:pb-24 px-4 sm:px-6 relative">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[600px] h-[200px] sm:h-[400px] bg-blue-600/10 rounded-full blur-3xl" />
          <div className="absolute top-20 right-10 w-[150px] sm:w-[200px] h-[150px] sm:h-[200px] bg-violet-600/8 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-3 sm:px-4 py-1.5 text-[11px] sm:text-xs font-medium text-blue-400 mb-5 sm:mb-6">
            <Zap size={10} />
            Powered by Google Gemini AI
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-slate-50 leading-tight mb-4 sm:mb-6 tracking-tight px-2">
            Audite cada conversa{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              de vendas
            </span>{' '}
            com IA
          </h1>

          <p className="text-sm sm:text-lg text-slate-400 dark:text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed px-2">
            Analise automaticamente conversas do WhatsApp, gere scores de qualidade, receba coaching em tempo real e nunca perca um lead crítico novamente.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 px-4">
            <Link
              href="/login"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 sm:px-8 py-3 sm:py-3.5 rounded-2xl transition-all shadow-xl shadow-blue-600/30 text-sm"
            >
              Acessar o Dashboard
              <ArrowRight size={16} />
            </Link>
            <a
              href="#como-funciona"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold px-6 sm:px-8 py-3 sm:py-3.5 rounded-2xl transition-all text-sm"
            >
              Como funciona
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-12 sm:mt-16 px-2">
            {stats.map(s => (
              <div key={s.label} className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-4">
                <div className="text-xl sm:text-2xl font-black text-blue-400 mb-1">{s.value}</div>
                <div className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="py-8 sm:py-12 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto overflow-hidden rounded-3xl">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl shadow-black/50">
            {/* Fake browser bar */}
            <div className="bg-slate-100 dark:bg-slate-800/80 px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2 border-b border-slate-300 dark:border-slate-700">
              <div className="flex gap-1.5 flex-shrink-0">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500/60" />
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-500/60" />
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500/60" />
              </div>
              <div className="flex-1 mx-2 sm:mx-4 bg-slate-700 rounded-lg px-2 sm:px-3 py-1 text-[9px] sm:text-[10px] text-slate-400 dark:text-slate-500 dark:text-slate-400 truncate">
                app.salesforce-ai.com/dashboard
              </div>
            </div>
            {/* Dashboard mockup */}
            <div className="p-3 sm:p-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-3 sm:mb-4">
                {[
                  { label: 'Score Médio', val: '8.3/10', color: 'text-blue-400' },
                  { label: 'Auditorias', val: '147', color: 'text-cyan-400' },
                  { label: 'Críticos', val: '3', color: 'text-red-400' },
                  { label: 'ROI Est.', val: 'R$21k', color: 'text-emerald-400' },
                ].map(card => (
                  <div key={card.label} className="bg-slate-100 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700/50 rounded-xl p-2 sm:p-3">
                    <div className="text-[8px] sm:text-[9px] text-slate-400 dark:text-slate-500 mb-1 uppercase">{card.label}</div>
                    <div className={`text-base sm:text-xl font-black ${card.color}`}>{card.val}</div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                <div className="sm:col-span-2 bg-slate-100 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700/50 rounded-xl p-2 sm:p-3 h-20 sm:h-28 flex items-end gap-1">
                  {[6, 7, 8, 6, 9, 7, 8, 9, 8, 7, 9, 8].map((h, i) => (
                    <div key={i} className="flex-1 rounded-t" style={{ height: `${h * 10}%`, background: i === 8 ? '#3b82f6' : '#1e40af80' }} />
                  ))}
                </div>
                <div className="bg-slate-100 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700/50 rounded-xl p-2 sm:p-3 space-y-1.5 sm:space-y-2">
                  {['Mariana C.', 'Rafael L.', 'Bruno A.'].map((name, i) => (
                    <div key={name} className="flex items-center gap-2">
                      <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-blue-600/30 text-blue-400 flex items-center justify-center text-[7px] sm:text-[8px] font-bold flex-shrink-0">{name[0]}</div>
                      <div className="flex-1 h-1 sm:h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-blue-500" style={{ width: `${90 - i * 15}%` }} />
                      </div>
                      <span className="text-[8px] sm:text-[9px] text-blue-400 font-bold flex-shrink-0">{(9.1 - i * 0.9).toFixed(1)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-14 sm:py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <div className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3">Funcionalidades</div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-50 mb-3 sm:mb-4">Tudo que seu time precisa</h2>
            <p className="text-slate-400 dark:text-slate-500 dark:text-slate-400 text-sm max-w-xl mx-auto">Uma plataforma completa para elevar a qualidade das suas vendas via WhatsApp.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {features.map(f => (
              <div key={f.title} className={`bg-white dark:bg-slate-900 border rounded-2xl p-4 sm:p-5 ${f.bg}`}>
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center mb-3 ${f.bg} border`}>
                  <f.icon size={16} className={f.color} />
                </div>
                <h3 className="text-sm font-bold text-slate-100 mb-1.5">{f.title}</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section id="como-funciona" className="py-14 sm:py-20 px-4 sm:px-6 bg-white dark:bg-slate-900/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <div className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3">Simples e Rápido</div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-50 mb-4">Configure em 3 passos</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-6">
            {steps.map((step, i) => (
              <div key={step.num} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-black text-blue-400">{step.num}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-100 mb-2">{step.title}</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 dark:text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-gradient-to-br from-blue-950/80 to-slate-900 border border-blue-500/20 rounded-3xl p-8 sm:p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-blue-600/5 rounded-3xl" />
            <div className="relative">
              <div className="flex items-center justify-center gap-1 sm:gap-2 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={13} className="text-amber-400 fill-amber-400" />
                ))}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-50 mb-3 sm:mb-4">
                Pronto para auditar suas vendas?
              </h2>
              <p className="text-slate-400 dark:text-slate-500 dark:text-slate-400 text-sm mb-6 sm:mb-8 leading-relaxed">
                Entre no dashboard e comece a monitorar cada conversa com a precisão da inteligência artificial.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 sm:px-8 py-3 sm:py-3.5 rounded-2xl transition-all shadow-xl shadow-blue-600/30 text-sm"
              >
                Acessar o Dashboard
                <ArrowRight size={16} />
              </Link>
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-5 sm:mt-6 text-[11px] text-slate-400 dark:text-slate-500">
                {['Sem cartão de crédito', 'Setup em minutos', 'Suporte incluso'].map(item => (
                  <div key={item} className="flex items-center gap-1">
                    <CheckCircle size={11} className="text-emerald-500" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 sm:py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
              <Activity size={12} className="text-white" />
            </div>
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 dark:text-slate-400">SalesForce AI Auditor</span>
          </div>
          <p className="text-[11px] text-slate-600 text-center">
            © 2025 SalesForce AI Auditor · Powered by Gemini AI + Evolution API
          </p>
          <Link href="/login" className="text-xs text-blue-400 hover:underline">
            Acessar plataforma →
          </Link>
        </div>
      </footer>
    </div>
  )
}
