import { useEffect, useState } from 'react'
import { getJobs, createJob, updateJob, deleteJob } from '../api'
import StatusBadge from '../components/StatusBadge'
import JobModal from '../components/JobModal'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const STATUSES = ['All', 'Applied', 'OA', 'Interview', 'Rejected', 'Offer']

export default function Jobs() {
  const [jobs, setJobs]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('All')
  const [search, setSearch]     = useState('')
  const [modalOpen, setModal]   = useState(false)
  const [editing, setEditing]   = useState(null)

  const load = () => getJobs().then(r => { setJobs(r.data); setLoading(false) })
  useEffect(() => { load() }, [])

  const filtered = jobs.filter(j => {
    const matchStatus = filter === 'All' || j.status === filter
    const matchSearch = j.company.toLowerCase().includes(search.toLowerCase()) ||
                        j.role.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  const handleSave = async (data) => {
    if (editing) {
      await updateJob(editing._id, data)
      toast.success('Application updated')
    } else {
      await createJob(data)
      toast.success('Application added')
    }
    load()
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this application?')) return
    await deleteJob(id)
    toast.success('Deleted')
    load()
  }

  const openAdd  = () => { setEditing(null); setModal(true) }
  const openEdit = (job) => { setEditing(job); setModal(true) }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Applications</h1>
          <p className="text-gray-500 text-sm mt-0.5">{jobs.length} total</p>
        </div>
        <button onClick={openAdd} className="btn-primary">+ Add application</button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          className="input max-w-xs"
          placeholder="Search company or role..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="flex gap-1 flex-wrap">
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === s ? 'bg-brand-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-gray-400">No applications found.</p>
          {jobs.length === 0 && (
            <button onClick={openAdd} className="btn-primary mt-4">Add your first application</button>
          )}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Company</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Role</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Applied</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Follow-up</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(job => (
                <tr key={job._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium">{job.company}</td>
                  <td className="px-4 py-3 text-gray-600">{job.role}</td>
                  <td className="px-4 py-3"><StatusBadge status={job.status} /></td>
                  <td className="px-4 py-3 text-gray-400 hidden md:table-cell">
                    {job.appliedDate ? format(new Date(job.appliedDate), 'MMM d, yyyy') : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-400 hidden lg:table-cell">
                    {job.followUpDate ? format(new Date(job.followUpDate), 'MMM d') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => openEdit(job)} className="text-brand-600 hover:text-brand-700 text-xs font-medium">Edit</button>
                      <button onClick={() => handleDelete(job._id)} className="text-red-500 hover:text-red-600 text-xs font-medium">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <JobModal job={editing} onClose={() => setModal(false)} onSave={handleSave} />
      )}
    </div>
  )
}