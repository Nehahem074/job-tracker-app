import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { getJobs } from '../api'
import { useAuth } from '../context/AuthContext'
import StatusBadge from '../components/StatusBadge'
import { format } from 'date-fns'

const STATUSES = ['Applied', 'OA', 'Interview', 'Rejected', 'Offer']
const COLORS = { Applied: '#3b82f6', OA: '#8b5cf6', Interview: '#f59e0b', Rejected: '#ef4444', Offer: '#10b981' }

export default function Dashboard() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getJobs().then(r => { setJobs(r.data); setLoading(false) })
  }, [])

  const counts = STATUSES.map(s => ({ name: s, count: jobs.filter(j => j.status === s).length }))
  const recent = [...jobs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)
  const successRate = jobs.length ? Math.round((jobs.filter(j => j.status === 'Offer').length / jobs.length) * 100) : 0

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-gray-500 text-sm mt-1">Here's your job search overview</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        {counts.map(c => (
          <div key={c.name} className="card p-4 text-center">
            <p className="text-3xl font-bold" style={{ color: COLORS[c.name] }}>{c.count}</p>
            <p className="text-xs text-gray-500 mt-1">{c.name}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="card p-4 text-center">
          <p className="text-3xl font-bold text-gray-900">{jobs.length}</p>
          <p className="text-xs text-gray-500 mt-1">Total applications</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-3xl font-bold text-green-600">{successRate}%</p>
          <p className="text-xs text-gray-500 mt-1">Offer rate</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-3xl font-bold text-amber-600">
            {jobs.filter(j => j.status === 'Interview').length}
          </p>
          <p className="text-xs text-gray-500 mt-1">Active interviews</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Bar chart */}
        <div className="card p-6">
          <h2 className="text-base font-medium mb-4">Applications by status</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={counts} barSize={32}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {counts.map(c => <Cell key={c.name} fill={COLORS[c.name]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent applications */}
        <div className="card p-6">
          <h2 className="text-base font-medium mb-4">Recent applications</h2>
          {recent.length === 0 ? (
            <p className="text-gray-400 text-sm">No applications yet. Add your first one!</p>
          ) : (
            <div className="space-y-3">
              {recent.map(job => (
                <div key={job._id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{job.company}</p>
                    <p className="text-xs text-gray-400">{job.role} · {format(new Date(job.appliedDate || job.createdAt), 'MMM d')}</p>
                  </div>
                  <StatusBadge status={job.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}