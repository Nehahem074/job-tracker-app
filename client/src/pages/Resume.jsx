import { useEffect, useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { getResumes, uploadResume, deleteResume } from '../api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

export default function Resume() {
  const [resumes, setResumes]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [uploading, setUploading] = useState(false)

  const load = () => getResumes().then(r => { setResumes(r.data); setLoading(false) })
  useEffect(() => { load() }, [])

  const onDrop = useCallback(async (files) => {
    const file = files[0]
    if (!file) return
    if (file.type !== 'application/pdf') { toast.error('Only PDF files allowed'); return }
    if (file.size > 5 * 1024 * 1024) { toast.error('File must be under 5MB'); return }

    setUploading(true)
    const fd = new FormData()
    fd.append('resume', file)
    try {
      await uploadResume(fd)
      toast.success('Resume uploaded!')
      load()
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'application/pdf': ['.pdf'] }, maxFiles: 1
  })

  const handleDelete = async (id) => {
    if (!confirm('Delete this resume?')) return
    await deleteResume(id)
    toast.success('Deleted')
    load()
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Resume management</h1>
        <p className="text-gray-500 text-sm mt-1">Upload your resumes as PDF. They're stored on Cloudinary.</p>
      </div>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors mb-8 ${
          isDragActive ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-brand-400 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm font-medium text-gray-700">
              {isDragActive ? 'Drop your PDF here' : 'Drag & drop your resume here'}
            </p>
            <p className="text-xs text-gray-400">or click to browse · PDF only · max 5MB</p>
          </div>
        )}
      </div>

      {/* Resume list */}
      {resumes.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-gray-400 text-sm">No resumes uploaded yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {resumes.map(r => (
            <div key={r._id} className="card p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{r.fileName}</p>
                <p className="text-xs text-gray-400">{format(new Date(r.createdAt), 'MMM d, yyyy · h:mm a')}</p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={r.cloudinaryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary text-xs"
                >
                  View
                </a>
                <button onClick={() => handleDelete(r._id)} className="text-red-500 hover:text-red-600 text-xs font-medium">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}