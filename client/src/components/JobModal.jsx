import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

const STATUSES = ['Applied', 'OA', 'Interview', 'Rejected', 'Offer']

export default function JobModal({ job, onClose, onSave }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm()

  useEffect(() => {
    if (job) {
      reset({
        ...job,
        appliedDate: job.appliedDate ? job.appliedDate.slice(0, 10) : '',
        followUpDate: job.followUpDate ? job.followUpDate.slice(0, 10) : '',
      })
    } else {
      reset({ status: 'Applied', appliedDate: new Date().toISOString().slice(0, 10) })
    }
  }, [job, reset])

  const onSubmit = async (data) => {
    await onSave(data)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold">{job ? 'Edit application' : 'Add application'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Company *</label>
              <input className="input" placeholder="Google" {...register('company', { required: 'Required' })} />
              {errors.company && <p className="text-red-500 text-xs mt-1">{errors.company.message}</p>}
            </div>
            <div>
              <label className="label">Role *</label>
              <input className="input" placeholder="Software Engineer" {...register('role', { required: 'Required' })} />
              {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Status</label>
              <select className="input" {...register('status')}>
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Applied date</label>
              <input type="date" className="input" {...register('appliedDate')} />
            </div>
          </div>

          <div>
            <label className="label">Job description</label>
            <textarea className="input" rows={4} placeholder="Paste the job description here..." {...register('jobDescription')} />
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea className="input" rows={2} placeholder="Any notes about this application..." {...register('notes')} />
          </div>

          <div>
            <label className="label">Follow-up reminder date</label>
            <input type="date" className="input" {...register('followUpDate')} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}