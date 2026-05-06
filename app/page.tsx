import Link from 'next/link'
import {
  Activity, BarChart2, MessageCircle, Shield, Zap, TrendingUp,
  CheckCircle, ArrowRight, Star, Brain, Target, Bell
} from 'lucide-react'

export const metadata = {
  title: 'SalesForce AI Auditor — Inteligência Comercial para WhatsApp',
  description: 'Audite conversas de vendas automaticamente com IA. Score em tempo real, coaching personalizado e analytics avançado para seu time comercial.',
}

const features = [
  {
    icon: Zap,
    title: 'Análise em Tempo Real',
    desc: 'Cada mensagem do WhatsApp é auditada pela IA em segundos, gerando score e insights automaticamente.',
    accent: '#3b82f6',
    glow: 'shadow-blue-500/10',
    size: 'large',
  },
  {
    icon: Brain,
    title: 'Coaching com IA',
    desc: 'Sugestão da próxima mensagem ideal para cada conversa, treinando seu time continuamente.',
    accent: '#8b5cf6',
    glow: 'shadow-violet-500/10',
    size: 'small',
  },
  {
    icon: Shield,
    title: 'Alertas de Risco',
    desc: 'Notificações instantâneas quando um lead está em risco crítico.',
    accent: '#ef4444',
    glow: 'shadow-red-500/10',
    size: 'small',
  },
  {
    icon: BarChart2,
    title: 'Dashboard Executivo',
    desc: 'Visão completa da performance por vendedor, sentimento e tendências de qualidade.',
    accent: '#06b6d4',
    glow: 'shadow-cyan-500/10',
    size: 'small',
  },
  {
    icon: TrendingUp,
    title: 'Relatórios & Exportação',
    desc: 'Exporte auditorias em CSV, analise por período e acompanhe a evolução de cada vendedor.',
    accent: '#10b981',
    glow: 'shadow-emerald-500/10',
    size: 'small',
  },
  {
    icon: Target,
    title: 'Score de Qualidade 0–10',
    desc: 'Análise detalhada de abertura, proposta, tratamento de objeções e fechamento para cada conversa.',
    accent: '#f59e0b',
    glow: 'shadow-amber-500/10',
    size: 'large',
  },
]

const stats = [
  { value: '2.3s', label: 'Análise por conversa', icon: '⚡' },
  { value: '98%', label: 'Precisão da IA', icon: '🎯' },
  { value: '10x', label: 'Mais auditorias', icon: '📈' },
  { value: '24/7', label: 'Monitoramento', icon: '🔔' },
]

const steps = [
  {
    num: '01',
    title: 'Conecte seu WhatsApp',
    desc: 'Configure sua instância Evolution API em minutos. Escaneie o QR Code e pronto.',
    color: 'from-blue-500 to-blue-600',
  },
  {
    num: '02',
    title: 'IA analisa cada conversa',
    desc: 'O Gemini AI processa automaticamente, atribui score e gera insights acionáveis.',
    color: 'from-violet-500 to-violet-600',
  },
  {
    num: '03',
    title: 'Acompanhe no Dashboard',
    desc: 'Visualize métricas em tempo real, receba alertas e exporte relatórios completos.',
    color: 'from-cyan-500 to-cyan-600',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#030712] text-slate-200 overflow-x-hidden">

      {/* ── Aurora background glows ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-blue-600/[0.12] rounded-full blur-[130px]" />
        <div className="absolute top-[20%] right-[-5%] w-[500px] h-[500px] bg-violet-600/[0.08] rounded-full blur-[110px]" />
        <div className="absolute bottom-0 left-[-5%] w-[500px] h-[500px] bg-cyan-600/[0.07] rounded-full blur-[110px]" />
      </div>

      {/* ── Navbar ── */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/[0.06] bg-[#030712]/70 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/30">
              <Activity size={15} className="text-white" />
            </div>
            <span className="font-bold text-white text-sm tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
              SalesForce AI
            </span>
            <span className="hidden sm:inline text-[9px] text-slate-500 font-semibold uppercase tracking-widest border border-white/10 px-1.5 py-0.5 rounded">
              Auditor
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-slate-400 hover:text-white transition-colors font-medium">
              Entrar
            </Link>
            <Link
              href="/login"
              className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all shadow-lg shadow-blue-600/20"
            >
              Começar grátis
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="pt-32 sm:pt-40 pb-16 sm:pb-24 px-4 sm:px-6 relative">
        <div className="max-w-4xl mx-auto text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 text-xs font-semibold text-blue-400 mb-8">
            <Zap size={11} className="fill-blue-400" />
            Powered by Google Gemini AI
          </div>

          {/* Headline */}
          <h1
            className="text-4xl sm:text-6xl md:text-7xl font-bold text-white leading-[1.04] tracking-tight mb-6"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Audite cada conversa
            <br />
            de vendas com{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-300 to-cyan-400">
              IA
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Analise automaticamente conversas do WhatsApp, gere scores de qualidade,
            receba coaching em tempo real e nunca perca um lead crítico novamente.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
            <Link
              href="/login"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-xl shadow-blue-600/25 text-sm"
            >
              Acessar o Dashboard
              <ArrowRight size={16} />
            </Link>
            <a
              href="#como-funciona"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-slate-300 font-semibold px-8 py-3.5 rounded-xl transition-all text-sm"
            >
              Como funciona
            </a>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {stats.map(s => (
              <div
                key={s.label}
                className="bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm rounded-2xl p-4 hover:bg-white/[0.07] transition-colors"
              >
                <div className="text-lg mb-0.5">{s.icon}</div>
                <div
                  className="text-2xl font-bold text-white mb-0.5"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  {s.value}
                </div>
                <div className="text-[11px] text-slate-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Dashboard preview ── */}
      <section className="pb-16 sm:pb-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl shadow-black/60">
            {/* Browser bar */}
            <div className="bg-[#0d1117] border-b border-white/[0.06] px-4 py-3 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
              </div>
              <div className="flex-1 mx-4 bg-white/5 border border-white/8 rounded-md px-3 py-1 text-[10px] text-slate-500 truncate">
                app.salesforce-ai.com/dashboard
              </div>
            </div>
            {/* Dashboard mockup */}
            <div className="bg-[#0a0f1a] p-4 sm:p-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4">
                {[
                  { label: 'Score Médio', val: '8.3/10', color: 'text-blue-400', border: 'border-t-blue-500/40' },
                  { label: 'Auditorias', val: '147', color: 'text-cyan-400', border: 'border-t-cyan-500/40' },
                  { label: 'Críticos', val: '3', color: 'text-red-400', border: 'border-t-red-500/40' },
                  { label: 'ROI Est.', val: 'R$21k', color: 'text-emerald-400', border: 'border-t-emerald-500/40' },
                ].map(card => (
                  <div key={card.label} className={`bg-white/[0.04] border border-white/[0.07] border-t-2 ${card.border} rounded-xl p-3`}>
                    <div className="text-[9px] text-slate-500 mb-1.5 uppercase tracking-wider font-semibold">{card.label}</div>
                    <div className={`text-xl font-bold ${card.color}`} style={{ fontFamily: 'var(--font-heading)' }}>{card.val}</div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 bg-white/[0.03] border border-white/[0.07] rounded-xl p-3 h-24 sm:h-32 flex items-end gap-1">
                  {[5, 7, 8, 6, 9, 7, 8, 9, 8, 7, 9, 8].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t transition-all"
                      style={{
                        height: `${h * 10}%`,
                        background: i === 8
                          ? 'linear-gradient(to top, #3b82f6, #60a5fa)'
                          : 'rgba(59,130,246,0.2)',
                      }}
                    />
                  ))}
                </div>
                <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-3 space-y-2.5">
                  {['Mariana C.', 'Rafael L.', 'Bruno A.'].map((name, i) => (
                    <div key={name} className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-md bg-blue-600/30 text-blue-400 flex items-center justify-center text-[8px] font-bold flex-shrink-0">
                        {name[0]}
                      </div>
                      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500" style={{ width: `${90 - i * 15}%` }} />
                      </div>
                      <span className="text-[9px] text-blue-400 font-bold flex-shrink-0">{(9.1 - i * 0.9).toFixed(1)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features bento ── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3">Funcionalidades</div>
            <h2
              className="text-3xl sm:text-4xl font-bold text-white mb-4"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Tudo que seu time precisa
            </h2>
            <p className="text-slate-500 text-sm max-w-xl mx-auto">
              Uma plataforma completa para elevar a qualidade das suas vendas via WhatsApp.
            </p>
          </div>

          {/* Bento grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {features.map((f, idx) => (
              <div
                key={f.title}
                className={`relative bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 hover:bg-white/[0.06] hover:border-white/[0.14] transition-all group ${
                  idx === 0 || idx === 5 ? 'lg:col-span-1 row-span-1' : ''
                }`}
              >
                {/* Glow accent */}
                <div
                  className="absolute inset-x-0 top-0 h-px rounded-t-2xl opacity-60"
                  style={{ background: `linear-gradient(90deg, transparent, ${f.accent}60, transparent)` }}
                />
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 border border-white/10"
                  style={{ background: `${f.accent}15` }}
                >
                  <f.icon size={18} style={{ color: f.accent }} />
                </div>
                <h3
                  className="text-sm font-semibold text-slate-100 mb-2"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  {f.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Como funciona ── */}
      <section id="como-funciona" className="py-16 sm:py-24 px-4 sm:px-6 relative">
        {/* subtle section separator */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3">Simples e Rápido</div>
            <h2
              className="text-3xl sm:text-4xl font-bold text-white mb-4"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Configure em 3 passos
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative">
            {/* connector line on desktop */}
            <div className="hidden sm:block absolute top-8 left-[16.6%] right-[16.6%] h-px bg-gradient-to-r from-blue-500/30 via-violet-500/30 to-cyan-500/30" />
            {steps.map((step, i) => (
              <div key={step.num} className="text-center relative">
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mx-auto mb-5 shadow-lg`}
                >
                  <span
                    className="text-2xl font-bold text-white"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    {step.num}
                  </span>
                </div>
                <h3
                  className="text-sm font-semibold text-slate-100 mb-2"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  {step.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </section>

      {/* ── CTA ── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden border border-white/10 p-8 sm:p-12 text-center">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-950/60 via-[#0a0f1a] to-violet-950/30" />
            {/* Top glow line */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent" />
            {/* Corner glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative">
              <div className="flex items-center justify-center gap-1 mb-5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
                ))}
              </div>
              <h2
                className="text-2xl sm:text-4xl font-bold text-white mb-4"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Pronto para auditar suas vendas?
              </h2>
              <p className="text-slate-400 text-sm mb-8 leading-relaxed max-w-md mx-auto">
                Entre no dashboard e comece a monitorar cada conversa com a precisão da inteligência artificial.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-xl shadow-blue-600/30 text-sm"
              >
                Acessar o Dashboard
                <ArrowRight size={16} />
              </Link>
              <div className="flex flex-wrap items-center justify-center gap-4 mt-6 text-[11px] text-slate-500">
                {['Sem cartão de crédito', 'Setup em minutos', 'Suporte incluso'].map(item => (
                  <div key={item} className="flex items-center gap-1.5">
                    <CheckCircle size={12} className="text-emerald-500" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/[0.06] py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-700 rounded-md flex items-center justify-center">
              <Activity size={12} className="text-white" />
            </div>
            <span className="text-xs font-semibold text-slate-500" style={{ fontFamily: 'var(--font-heading)' }}>
              SalesForce AI Auditor
            </span>
          </div>
          <p className="text-[11px] text-slate-600">
            © 2025 SalesForce AI Auditor · Powered by Gemini AI + Evolution API
          </p>
          <Link href="/login" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
            Acessar plataforma →
          </Link>
        </div>
      </footer>
    </div>
  )
}
