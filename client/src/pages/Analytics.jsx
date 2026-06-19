import { useEffect, useState } from 'react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { getJobs } from '../api'
import { format, startOfMonth, eachMonthOfInterval, subMonths } from 'date-fns'

const STATUS_COLORS = {
  Applied: '#3b82f6', OA: '#8b5cf6', Interview: '#f59e0b', Rejected: '#ef4444', Offer: '#10b981'
}

export default function Analytics() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getJobs().then(r => { setJobs(r.data); setLoading(false) })
  }, [])

  // Applications per month (last 6 months)
  const months = eachMonthOfInterval({ start: subMonths(new Date(), 5), end: new Date() })
  const monthlyData = months.map(m => {
    const label = format(m, 'MMM')
    const count = jobs.filter(j => {
      const d = new Date(j.appliedDate || j.createdAt)
      return format(d, 'MMM yyyy') === format(m, 'MMM yyyy')
    }).length
    return { month: label, applications: count }
  })

  // Status distribution for pie
  const pieData = Object.entries(
    jobs.reduce((acc, j) => { acc[j.status] = (acc[j.status] || 0) + 1; return acc }, {})
  ).map(([name, value]) => ({ name, value }))

  // Funnel
  const statuses = ['Applied', 'OA', 'Interview', 'Offer']
  const funnelData = statuses.map(s => ({
    name: s, count: jobs.filter(j => j.status === s).length
  }))

  // KPIs
  const total = jobs.length
  const offers = jobs.filter(j => j.status === 'Offer').length
  const interviews = jobs.filter(j => ['Interview', 'Offer'].includes(j.status)).length
  const offerRate = total ? ((offers / total) * 100).toFixed(1) : 0
  const interviewRate = total ? ((interviews / total) * 100).toFixed(1) : 0

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <p className="text-gray-500 text-sm mt-1">Track your job search performance</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total applied', value: total, color: 'text-gray-900' },
          { label: 'Interviews', value: interviews, color: 'text-amber-600' },
          { label: 'Interview rate', value: `${interviewRate}%`, color: 'text-blue-600' },
          { label: 'Offer rate', value: `${offerRate}%`, color: 'text-green-600' },
        ].map(k => (
          <div key={k.label} className="card p-4">
            <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
            <p className="text-xs text-gray-400 mt-1">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Monthly line chart */}
        <div className="card p-6">
          <h2 className="text-base font-medium mb-4">Applications per month</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyData}>
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="applications" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Status pie */}
        <div className="card p-6">
          <h2 className="text-base font-medium mb-4">Status breakdown</h2>
          {pieData.length === 0 ? (
            <div className="h-[220px] flex items-center justify-center text-gray-300 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {pieData.map(d => <Cell key={d.name} fill={STATUS_COLORS[d.name] || '#9ca3af'} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Funnel bar chart */}
      <div className="card p-6">
        <h2 className="text-base font-medium mb-4">Application funnel</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={funnelData} barSize={48}>
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {funnelData.map(d => <Cell key={d.name} fill={STATUS_COLORS[d.name]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}