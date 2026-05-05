'use client'

import { useAuditorias } from '@/hooks/useAuditorias'
import { getStatus, getScoreColor, getAverageScore, calcROI } from '@/lib/utils'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { TrendingUp, ClipboardList, AlertTriangle, DollarSign, Loader2 } from 'lucide-react'
import { useMemo } from 'react'

export default function DashboardPage() {
  const { data, isLoading } = useAuditorias()

  const avgScore = useMemo(() => getAverageScore(data), [data])
  const total = data.length
  const critical = useMemo(() => data.filter(
    (a) => a.ai_score < 5 || ['Negativo', 'Crítico'].includes(a.lead_sentiment)
  ).length, [data])
  const roi = useMemo(() => calcROI(critical), [critical])

  // Processamento de dados para o gráfico semanal
  const chartData = useMemo(() => {
    const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
    const sellers = [...new Set(data.map(a => a.vendedor_name))]
    
    return days.map((day, index) => {
      const dayData: any = { day }
      sellers.forEach(seller => {
        const sellerAudits = data.filter(a => {
          const auditDay = new Date(a.created_at).getDay()
          // Ajuste de getDay() para bater com nosso array days (0=Dom, 1=Seg...)
          const adjustedDay = auditDay === 0 ? 6 : auditDay - 1
          return adjustedDay === index && a.vendedor_name === seller
        })
        
        if (sellerAudits.length > 0) {
          const sum = sellerAudits.reduce((acc, a) => acc + a.ai_score, 0)
          dayData[seller] = Math.round((sum / sellerAudits.length) * 10) / 10
        }
      })
      return dayData
    })
  }, [data])

  // Ranking de vendedores
  const topSellers = useMemo(() => {
    const sellers = [...new Set(data.map(a => a.vendedor_name))]
    return sellers.map(name => {
      const sellerAudits = data.filter(a => a.vendedor_name === name)
      const avg = getAverageScore(sellerAudits)
      const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
      return { name, score: avg, initials }
    }).sort((a, b) => b.score - a.score).slice(0, 3)
  }, [data])

  const cards = [
    {
      title: 'Score Médio de Vendas',
      value: `${avgScore}/10`,
      sub: 'Qualidade geral analisada pela IA',
      icon: TrendingUp,
      color: 'text-blue-400',
      progress: avgScore * 10,
      progressColor: 'bg-blue-500',
    },
    {
      title: 'Total de Auditorias',
      value: total,
      sub: 'Análises processadas no período',
      icon: ClipboardList,
      color: 'text-cyan-400',
    },
    {
      title: 'Leads em Risco Crítico',
      value: critical,
      sub: 'Requer atenção imediata',
      icon: AlertTriangle,
      color: 'text-red-400',
      badge: true,
    },
    {
      title: 'Estimativa de ROI',
      value: roi,
      sub: 'Valor recuperável de leads perdidos',
      icon: DollarSign,
      color: 'text-emerald-400',
    },
  ]

  const chartColors = ['#3b82f6', '#06b6d4', '#8b5cf6', '#10b981', '#f59e0b']

  return (
    <div>
      <div className="px-7 pt-6 pb-4 border-b border-slate-800 flex justify-between items-end">
        <div>
          <h1 className="text-xl font-semibold text-slate-50">Dashboard de Gestão</h1>
          <p className="text-xs text-slate-500 mt-0.5">Visão executiva das auditorias comerciais em tempo real</p>
        </div>
        {isLoading && <Loader2 size={16} className="text-blue-500 animate-spin mb-1" />}
      </div>

      <div className="p-7">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {isLoading && data.length === 0 ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-4 animate-pulse h-28" />
            ))
          ) : (
            cards.map((card) => (
              <div key={card.title} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 uppercase tracking-wider mb-2 font-medium">
                  <card.icon size={12} className={card.color} />
                  {card.title}
                </div>
                <div className={`text-2xl font-bold mb-1 ${card.color}`}>{card.value}</div>
                {card.badge && card.value > 0 ? (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                    {card.sub}
                  </span>
                ) : (
                  <div className="text-[10px] text-slate-500">{card.sub}</div>
                )}
                {card.progress !== undefined && (
                  <div className="mt-2 h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${card.progressColor} transition-all duration-1000`}
                      style={{ width: `${card.progress}%` }}
                    />
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="text-sm font-semibold text-slate-100">Performance Semanal por Vendedor</div>
              <div className="text-[11px] text-slate-500">Score médio de qualidade por dia da semana</div>
            </div>
          </div>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 10]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
                  itemStyle={{ fontSize: 11 }}
                  labelStyle={{ color: '#94a3b8', marginBottom: 4 }}
                />
                <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8', paddingTop: 10 }} />
                {[...new Set(data.map(a => a.vendedor_name))].map((name, i) => (
                  <Line 
                    key={name}
                    type="monotone" 
                    dataKey={name} 
                    stroke={chartColors[i % chartColors.length]} 
                    strokeWidth={2} 
                    dot={{ r: 3, fill: chartColors[i % chartColors.length] }} 
                    activeDot={{ r: 5 }}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-3 font-medium">Distribuição de Sentimentos</div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Positivo', count: data.filter(a => a.lead_sentiment === 'Positivo' || a.lead_sentiment === 'Interessado').length, color: 'text-emerald-400' },
                { label: 'Neutro', count: data.filter(a => a.lead_sentiment === 'Neutro' || a.lead_sentiment === 'Indeciso').length, color: 'text-slate-400' },
                { label: 'Negativo', count: data.filter(a => a.lead_sentiment === 'Negativo').length, color: 'text-amber-400' },
                { label: 'Crítico', count: data.filter(a => a.lead_sentiment === 'Crítico').length, color: 'text-red-400' },
              ].map(s => (
                <div key={s.label} className="bg-slate-800/50 rounded-lg p-3 border border-slate-800">
                  <div className="text-[10px] text-slate-500">{s.label}</div>
                  <div className={`text-xl font-bold ${s.color}`}>{s.count}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-3 font-medium">Top Vendedores</div>
            <div className="space-y-1">
              {topSellers.length > 0 ? (
                topSellers.map((v, i) => (
                  <div key={v.name} className={`flex items-center justify-between py-2.5 ${i < topSellers.length - 1 ? 'border-b border-slate-800/50' : ''}`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-[9px] font-bold text-white`}>
                        {v.initials}
                      </div>
                      <span className="text-xs text-slate-300 font-medium">{v.name}</span>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded border ${getScoreColor(v.score)} bg-slate-800 border-slate-700`}>
                      {v.score}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-slate-500">Nenhum dado disponível</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
