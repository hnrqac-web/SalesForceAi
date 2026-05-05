'use client'

import { useAuditorias } from '@/hooks/useAuditorias'
import { getStatus, getScoreColor, getAverageScore, calcROI } from '@/lib/utils'
import { weeklyPerformanceData } from '@/lib/mockData'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { TrendingUp, ClipboardList, AlertTriangle, DollarSign } from 'lucide-react'

export default function DashboardPage() {
  const { data, isLoading } = useAuditorias()

  const avgScore = getAverageScore(data)
  const total = data.length
  const critical = data.filter(
    (a) => a.ai_score < 5 || ['Negativo', 'Crítico'].includes(a.lead_sentiment)
  ).length
  const roi = calcROI(critical)

  const cards = [
    {
      title: 'Score Médio de Vendas',
      value: `${avgScore}/10`,
      sub: '↑ +0.8 vs semana anterior',
      icon: TrendingUp,
      color: 'text-blue-400',
      progress: avgScore * 10,
      progressColor: 'bg-blue-500',
    },
    {
      title: 'Total de Auditorias',
      value: total,
      sub: 'Esta semana: 12 novas',
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
      sub: `${critical} leads × R$1.200 recuperável`,
      icon: DollarSign,
      color: 'text-emerald-400',
    },
  ]

  return (
    <div>
      <div className="px-7 pt-6 pb-4 border-b border-slate-800">
        <h1 className="text-xl font-semibold text-slate-50">Dashboard de Gestão</h1>
        <p className="text-xs text-slate-500 mt-0.5">Visão executiva das auditorias comerciais em tempo real</p>
      </div>

      <div className="p-7">
        {isLoading ? (
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-4 animate-pulse h-28" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4 mb-6">
            {cards.map((card) => (
              <div key={card.title} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 uppercase tracking-wider mb-2">
                  <card.icon size={12} className={card.color} />
                  {card.title}
                </div>
                <div className={`text-2xl font-bold mb-1 ${card.color}`}>{card.value}</div>
                {card.badge ? (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                    {card.sub}
                  </span>
                ) : (
                  <div className="text-[10px] text-slate-500">{card.sub}</div>
                )}
                {card.progress !== undefined && (
                  <div className="mt-2 h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${card.progressColor}`}
                      style={{ width: `${card.progress}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-6">
          <div className="text-sm font-semibold mb-0.5">Performance Semanal por Vendedor</div>
          <div className="text-[11px] text-slate-500 mb-4">Score médio de qualidade por dia da semana</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={weeklyPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 10]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
              <Line type="monotone" dataKey="mariana" name="Mariana Costa" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: '#3b82f6' }} />
              <Line type="monotone" dataKey="rafael" name="Rafael Lima" stroke="#06b6d4" strokeWidth={2} dot={{ r: 3, fill: '#06b6d4' }} />
              <Line type="monotone" dataKey="bruno" name="Bruno Almeida" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3, fill: '#8b5cf6' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-3">Distribuição de Sentimentos</div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Positivo', count: data.filter(a => a.lead_sentiment === 'Positivo').length, color: 'text-emerald-400' },
                { label: 'Neutro', count: data.filter(a => a.lead_sentiment === 'Neutro').length, color: 'text-slate-400' },
                { label: 'Negativo', count: data.filter(a => a.lead_sentiment === 'Negativo').length, color: 'text-amber-400' },
                { label: 'Crítico', count: data.filter(a => a.lead_sentiment === 'Crítico').length, color: 'text-red-400' },
              ].map(s => (
                <div key={s.label} className="bg-slate-800 rounded-lg p-3">
                  <div className="text-[10px] text-slate-500">{s.label}</div>
                  <div className={`text-xl font-bold ${s.color}`}>{s.count}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-3">Top Vendedores da Semana</div>
            {[
              { name: 'Mariana Costa', score: 8.6, initials: 'MC', bg: 'bg-blue-700' },
              { name: 'Rafael Lima', score: 7.8, initials: 'RL', bg: 'bg-cyan-800' },
              { name: 'Bruno Almeida', score: 5.9, initials: 'BA', bg: 'bg-violet-800' },
            ].map((v, i) => (
              <div key={v.name} className={`flex items-center justify-between py-2 ${i < 2 ? 'border-b border-slate-800' : ''}`}>
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full ${v.bg} flex items-center justify-center text-[9px] font-bold text-white`}>
                    {v.initials}
                  </div>
                  <span className="text-xs text-slate-300">{v.name}</span>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded border ${getScoreColor(v.score)} bg-blue-500/10 border-blue-500/20`}>
                  {v.score}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
